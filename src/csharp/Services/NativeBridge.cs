using System.Text.Json;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;

namespace BrandGame.Services;

internal sealed class NativeBridge(MainWindow window, WebView2 webView, GameEngine engine, SaveStore saves)
{
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    internal async void OnMessageReceived(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
    {
        if (!AppPaths.IsTrustedPage(e.Source)) return;
        try
        {
            string json = e.WebMessageAsJson;
            if (json.Length > SaveStore.MaximumBytes) throw new InvalidDataException("Mensagem demasiado grande.");
            NativeRequest? request = JsonSerializer.Deserialize<NativeRequest>(json, JsonOptions);
            if (request == null) return;
            switch (request.Action)
            {
                case "exit_app":
                    window.Close();
                    return;
                case "resize_window" when request.Width.HasValue && request.Height.HasValue:
                    window.ResizeGameWindow(request.Width.Value, request.Height.Value);
                    return;
                case "configure_vsync":
                    // WebView2 presentation follows the operating system's compositor.
                    return;
                case "load_save":
                    await ReplyAsync("onSaveLoaded", await saves.LoadAsync());
                    return;
                case "write_save" when request.Data.HasValue:
                    await saves.WriteAsync(request.Data.Value);
                    return;
            }
            if (request.UserGuess != null && request.CorrectAnswer != null && request.TimeElapsed.HasValue)
            {
                if (request.UserGuess.Length > 256 || request.CorrectAnswer.Length > 256)
                    throw new InvalidDataException("A resposta pode ter no máximo 256 caracteres.");
                MatchResult result = engine.Evaluate(request.UserGuess, request.CorrectAnswer, request.TimeElapsed.Value);
                await ReplyAsync("onMatchResult", JsonSerializer.Serialize(result));
            }
        }
        catch (Exception ex)
        {
            if (!window.IsDisposed)
                MessageBox.Show(window, ex.Message, "BrandGame — erro", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }

    private async Task ReplyAsync(string callback, string json)
    {
        if (!webView.IsDisposed && webView.CoreWebView2 != null &&
            AppPaths.IsTrustedPage(webView.CoreWebView2.Source))
            await webView.ExecuteScriptAsync($"window.{callback}({json})");
    }
}

internal sealed class NativeRequest
{
    public string? Action { get; set; }
    public JsonElement? Data { get; set; }
    public string? UserGuess { get; set; }
    public string? CorrectAnswer { get; set; }
    public int? TimeElapsed { get; set; }
    public int? Width { get; set; }
    public int? Height { get; set; }
    public bool? Value { get; set; }
}
