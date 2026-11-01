using BrandGame.Services;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace BrandGame;

public sealed class MainWindow : Form
{
    private readonly WebView2 webView = new() { Dock = DockStyle.Fill };
    private readonly GameEngine engine = new();
    private NativeBridge? bridge;

    public MainWindow()
    {
        Text = "BrandGame V3";
        Width = 1024;
        Height = 768;
        StartPosition = FormStartPosition.CenterScreen;
        FormBorderStyle = FormBorderStyle.FixedSingle;
        MaximizeBox = false;
        Controls.Add(webView);
        Shown += InitializeAsync;
    }

    private async void InitializeAsync(object? sender, EventArgs e)
    {
        try
        {
            string webDirectory = AppPaths.GetWebDirectory();
            string profileDirectory = AppPaths.PrepareBrowserProfile();
            var environment = await CoreWebView2Environment.CreateAsync(null, profileDirectory);
            if (IsDisposed) return;
            await webView.EnsureCoreWebView2Async(environment);
            if (IsDisposed) return;
            webView.CoreWebView2.SetVirtualHostNameToFolderMapping(
                AppPaths.WebHost, webDirectory, CoreWebView2HostResourceAccessKind.DenyCors);
            bridge = new NativeBridge(this, webView, engine, new SaveStore(AppPaths.SaveFile));
            webView.CoreWebView2.WebMessageReceived += bridge.OnMessageReceived;
            webView.CoreWebView2.NavigationStarting += (_, args) =>
                args.Cancel = !AppPaths.IsTrustedPage(args.Uri);
            webView.CoreWebView2.NewWindowRequested += (_, args) => args.Handled = true;
            webView.CoreWebView2.WindowCloseRequested += (_, _) => Close();
            webView.CoreWebView2.Navigate(AppPaths.StartPage);
        }
        catch (Exception ex)
        {
            MessageBox.Show(this,
                $"Não foi possível iniciar o BrandGame. Confirma que a pasta web está junto do executável " +
                $"e que o Microsoft Edge WebView2 Runtime está instalado.\n\n{ex.Message}",
                "BrandGame — erro ao iniciar", MessageBoxButtons.OK, MessageBoxIcon.Error);
            Close();
        }
    }

    internal void ResizeGameWindow(int width, int height)
    {
        var screen = Screen.FromControl(this).WorkingArea;
        Width = Math.Clamp(width, Math.Min(640, screen.Width), screen.Width);
        Height = Math.Clamp(height, Math.Min(480, screen.Height), screen.Height);
        CenterToScreen();
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            if (bridge != null && webView.CoreWebView2 != null)
                webView.CoreWebView2.WebMessageReceived -= bridge.OnMessageReceived;
            webView.Dispose();
            engine.Dispose();
        }
        base.Dispose(disposing);
    }
}
