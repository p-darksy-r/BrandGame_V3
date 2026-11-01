using System.Runtime.InteropServices;

namespace BrandGame.Services;

internal sealed class GameEngine : IDisposable
{
    [UnmanagedFunctionPointer(CallingConvention.Cdecl, CharSet = CharSet.Ansi)]
    private delegate double MatchFunction(string guess, string answer);
    [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
    private delegate int ScoreFunction(int elapsedSeconds, int answerLength);
    [UnmanagedFunctionPointer(CallingConvention.Cdecl)]
    private delegate int VersionFunction();

    private IntPtr library;
    private MatchFunction? nativeMatch;
    private ScoreFunction? nativeScore;

    internal GameEngine()
    {
        string path = Path.Combine(AppContext.BaseDirectory, "BrandEngine.dll");
        if (!File.Exists(path)) return;
        try
        {
            library = NativeLibrary.Load(path);
            // Older DLLs use different scoring rules; never silently change game behavior.
            if (!NativeLibrary.TryGetExport(library, "GetEngineVersion", out var version) ||
                Marshal.GetDelegateForFunctionPointer<VersionFunction>(version)() != 2)
            {
                Dispose();
                return;
            }
            nativeMatch = Marshal.GetDelegateForFunctionPointer<MatchFunction>(
                NativeLibrary.GetExport(library, "CalculateMatch"));
            nativeScore = Marshal.GetDelegateForFunctionPointer<ScoreFunction>(
                NativeLibrary.GetExport(library, "CalculateScore"));
        }
        catch (Exception ex) when (ex is DllNotFoundException or BadImageFormatException or EntryPointNotFoundException)
        {
            System.Diagnostics.Debug.WriteLine($"Optional C++ engine unavailable: {ex.Message}");
            Dispose();
        }
    }

    internal MatchResult Evaluate(string guess, string answer, int elapsedSeconds)
    {
        string normalizedGuess = Normalize(guess);
        string normalizedAnswer = Normalize(answer);
        double match = nativeMatch?.Invoke(normalizedGuess, normalizedAnswer) ??
            CalculateMatch(normalizedGuess, normalizedAnswer);
        bool correct = match >= 80;
        int seconds = Math.Clamp(elapsedSeconds, 0, 86400);
        int score = correct ? nativeScore?.Invoke(seconds, answer.Length) ?? CalculateScore(seconds) : 0;
        return new MatchResult(match, correct, score);
    }

    internal static string Normalize(string value) =>
        new(value.ToLowerInvariant().Where(c => c is >= 'a' and <= 'z' or >= '0' and <= '9').ToArray());

    internal static int CalculateScore(int seconds) => Math.Max(50 - Math.Clamp(seconds, 0, 86400) * 3, 10);

    internal static double CalculateMatch(string guess, string answer)
    {
        if (guess == answer) return 100;
        if (guess.Length == 0 || answer.Length == 0) return 0;
        int[] previous = Enumerable.Range(0, answer.Length + 1).ToArray();
        int[] current = new int[answer.Length + 1];
        for (int i = 1; i <= guess.Length; i++)
        {
            current[0] = i;
            for (int j = 1; j <= answer.Length; j++)
                current[j] = Math.Min(Math.Min(previous[j] + 1, current[j - 1] + 1),
                    previous[j - 1] + (guess[i - 1] == answer[j - 1] ? 0 : 1));
            (previous, current) = (current, previous);
        }
        return (1d - (double)previous[answer.Length] / Math.Max(guess.Length, answer.Length)) * 100;
    }

    public void Dispose()
    {
        nativeMatch = null;
        nativeScore = null;
        if (library == IntPtr.Zero) return;
        NativeLibrary.Free(library);
        library = IntPtr.Zero;
    }
}

internal sealed record MatchResult(double match, bool correct, int score);
