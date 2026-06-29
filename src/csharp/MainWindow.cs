using System;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;
using System.Text.Json;

namespace BrandGame
{
    public class MainWindow : Form
    {
        private WebView2 webView;

        // Dynamic Loading Delegates for C++ DLL
        private delegate double CalculateMatchDelegate(string s1, string s2);
        private delegate int CalculateScoreDelegate(int t, int L);

        private static CalculateMatchDelegate? _calculateMatchCpp;
        private static CalculateScoreDelegate? _calculateScoreCpp;
        private static bool _useCppEngine = false;

        private static string SaveFilePath => Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData), 
            "BrandGame_V3", 
            "save_data.json"
        );

        static MainWindow()
        {
            try
            {
                string baseDir = AppContext.BaseDirectory;
                string[] searchPaths = new[]
                {
                    Path.Combine(baseDir, "BrandEngine.dll"),
                    Path.Combine(baseDir, "..", "BrandEngine.dll"),
                    Path.Combine(baseDir, "..", "..", "..", "..", "BrandEngine.dll"),
                    Path.Combine(baseDir, "..", "..", "..", "..", "src", "csharp", "BrandEngine.dll")
                };

                IntPtr libHandle = IntPtr.Zero;
                foreach (var path in searchPaths)
                {
                    if (File.Exists(path))
                    {
                        libHandle = NativeLibrary.Load(path);
                        if (libHandle != IntPtr.Zero) break;
                    }
                }

                if (libHandle == IntPtr.Zero)
                {
                    NativeLibrary.TryLoad("BrandEngine.dll", out libHandle);
                }

                if (libHandle != IntPtr.Zero)
                {
                    if (NativeLibrary.TryGetExport(libHandle, "CalculateMatch", out IntPtr matchAddr) &&
                        NativeLibrary.TryGetExport(libHandle, "CalculateScore", out IntPtr scoreAddr))
                    {
                        _calculateMatchCpp = Marshal.GetDelegateForFunctionPointer<CalculateMatchDelegate>(matchAddr);
                        _calculateScoreCpp = Marshal.GetDelegateForFunctionPointer<CalculateScoreDelegate>(scoreAddr);
                        _useCppEngine = true;
                        System.Diagnostics.Debug.WriteLine("Successfully loaded native C++ BrandEngine.dll");
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Failed to load C++ DLL. Falling back to C# engine. Error: {ex.Message}");
                _useCppEngine = false;
            }
        }

        private static double CalculateMatch(string s1, string s2)
        {
            if (_useCppEngine && _calculateMatchCpp != null)
            {
                try { return _calculateMatchCpp(s1, s2); } catch { /* Fallback */ }
            }
            return CalculateMatchCSharp(s1, s2);
        }

        private static int CalculateScore(int t, int L)
        {
            if (_useCppEngine && _calculateScoreCpp != null)
            {
                try { return _calculateScoreCpp(t, L); } catch { /* Fallback */ }
            }
            return CalculateScoreCSharp(t, L);
        }

        private static double CalculateMatchCSharp(string s1, string s2)
        {
            if (string.IsNullOrEmpty(s1) && string.IsNullOrEmpty(s2)) return 100.0;
            if (string.IsNullOrEmpty(s1) || string.IsNullOrEmpty(s2)) return 0.0;

            string str1 = s1.ToLowerInvariant().Trim();
            string str2 = s2.ToLowerInvariant().Trim();

            int n = str1.Length;
            int m = str2.Length;
            int[,] d = new int[n + 1, m + 1];

            for (int i = 0; i <= n; i++) d[i, 0] = i;
            for (int j = 0; j <= m; j++) d[0, j] = j;

            for (int i = 1; i <= n; i++)
            {
                for (int j = 1; j <= m; j++)
                {
                    int cost = (str2[j - 1] == str1[i - 1]) ? 0 : 1;
                    d[i, j] = Math.Min(
                        Math.Min(d[i - 1, j] + 1, d[i, j - 1] + 1),
                        d[i - 1, j - 1] + cost
                    );
                }
            }

            int distance = d[n, m];
            int maxLen = Math.Max(n, m);
            return (1.0 - ((double)distance / maxLen)) * 100.0;
        }

        private static int CalculateScoreCSharp(int t, int L)
        {
            int baseScore = L * 10;
            int timeDecay = t * 2;
            int score = baseScore - timeDecay;
            return Math.Max(score, 10);
        }

        public MainWindow()
        {
            string engineStr = _useCppEngine ? " [C++ Dynamic Engine Active]" : " [C# Fallback Dynamic Engine]";
            this.Text = "BrandGame_V3 - Host Console" + engineStr;
            this.Width = 1080;
            this.Height = 820;
            this.StartPosition = FormStartPosition.CenterScreen;

            webView = new WebView2 { Dock = DockStyle.Fill };
            this.Controls.Add(webView);

            InitializeAsync();
        }

        private async void InitializeAsync()
        {
            string appDir = AppContext.BaseDirectory;
            string frontendPath = Path.Combine(appDir, "src", "frontend");
            
            if (!Directory.Exists(frontendPath))
            {
                string? currentDir = appDir;
                bool found = false;
                while (!string.IsNullOrEmpty(currentDir))
                {
                    string candidate = Path.Combine(currentDir, "src", "frontend");
                    if (Directory.Exists(candidate))
                    {
                        frontendPath = candidate;
                        found = true;
                        break;
                    }
                    candidate = Path.Combine(currentDir, "frontend");
                    if (Directory.Exists(candidate))
                    {
                        frontendPath = candidate;
                        found = true;
                        break;
                    }
                    currentDir = Directory.GetParent(currentDir)?.FullName;
                }

                if (!found)
                {
                    MessageBox.Show(
                        $"Could not locate the frontend directory folder!\n" +
                        $"Checked local build and parental folders starting from:\n{appDir}",
                        "Asset Initialization Error",
                        MessageBoxButtons.OK,
                        MessageBoxIcon.Error
                    );
                    return;
                }
            }

            try
            {
                string userDataFolder = Path.Combine(Path.GetTempPath(), "BrandGame_V3_UserData");
                Directory.CreateDirectory(userDataFolder);

                var env = await CoreWebView2Environment.CreateAsync(null, userDataFolder, null);
                await webView.EnsureCoreWebView2Async(env);

                webView.CoreWebView2.SetVirtualHostNameToFolderMapping(
                    "app.brandgame.local",
                    frontendPath,
                    CoreWebView2HostResourceAccessKind.Allow
                );

                webView.CoreWebView2.WebMessageReceived += OnWebMessageReceived;
                webView.CoreWebView2.Navigate("https://app.brandgame.local/index.html");
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    $"WebView2 Runtime Exception: {ex.Message}",
                    "Browser Engine Error",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
            }
        }

        private class GenericNativePayload
        {
            public string? Action { get; set; }
            public object? Data { get; set; }
            public string? UserGuess { get; set; }
            public string? CorrectAnswer { get; set; }
            public int? TimeElapsed { get; set; }
        }

        private async void OnWebMessageReceived(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
        {
            try
            {
                string message = e.WebMessageAsJson;
                if (string.IsNullOrEmpty(message)) return;

                var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                var payload = JsonSerializer.Deserialize<GenericNativePayload>(message, options);
                
                if (payload != null)
                {
                    // --- Persistency Routing Handler ---
                    if (payload.Action == "load_save")
                    {
                        string savedJson = "null";
                        if (File.Exists(SaveFilePath))
                        {
                            savedJson = await File.ReadAllTextAsync(SaveFilePath);
                        }
                        await webView.ExecuteScriptAsync($"onSaveLoaded({savedJson})");
                        return;
                    }

                    if (payload.Action == "write_save" && payload.Data != null)
                    {
                        string directory = Path.GetDirectoryName(SaveFilePath)!;
                        if (!Directory.Exists(directory)) Directory.CreateDirectory(directory);
                        
                        string updatedJson = JsonSerializer.Serialize(payload.Data);
                        await File.WriteAllTextAsync(SaveFilePath, updatedJson);
                        return;
                    }

                    // --- Scoring Engine Solver Routing ---
                    if (payload.UserGuess != null && payload.CorrectAnswer != null && payload.TimeElapsed.HasValue)
                    {
                        double matchPercentage = CalculateMatch(payload.UserGuess, payload.CorrectAnswer);
                        bool isCorrect = matchPercentage >= 85.0;
                        int scoreEarned = isCorrect ? CalculateScore(payload.TimeElapsed.Value, payload.CorrectAnswer.Length) : 0;

                        var result = new {
                            match = matchPercentage,
                            correct = isCorrect,
                            score = scoreEarned
                        };

                        string jsonResponse = JsonSerializer.Serialize(result);
                        await webView.ExecuteScriptAsync($"onMatchResult({jsonResponse})");
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Bridge Processing Exception: {ex.Message}", "Bridge Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}
