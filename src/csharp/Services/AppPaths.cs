namespace BrandGame.Services;

internal static class AppPaths
{
    internal const string WebHost = "app.brandgame.local";
    internal const string StartPage = "https://" + WebHost + "/index.html";

    // Preserve the original save location across application updates.
    internal static string SaveFile => Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
        "BrandGame_V3", "save_data_v3_custom.json");

    internal static bool IsTrustedPage(string source) =>
        Uri.TryCreate(source, UriKind.Absolute, out var uri) &&
        uri.Scheme == Uri.UriSchemeHttps &&
        uri.Host.Equals(WebHost, StringComparison.OrdinalIgnoreCase) &&
        uri.IsDefaultPort && string.IsNullOrEmpty(uri.UserInfo);

    internal static string GetWebDirectory()
    {
        string path = Path.Combine(AppContext.BaseDirectory, "web");
        if (!File.Exists(Path.Combine(path, "index.html")))
            throw new FileNotFoundException("Falta web/index.html. Executa update.exe na raiz do projeto.");
        return path;
    }

    internal static string PrepareBrowserProfile()
    {
        string path = Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "BrandGame_V3", "WebView2");
        string legacy = Path.Combine(Path.GetTempPath(), "BrandGame_V3_UserData");
        if (!Directory.Exists(path) && Directory.Exists(legacy))
        {
            // Copy the previous browser settings; the original profile remains intact.
            string staging = path + ".migration-" + Guid.NewGuid().ToString("N");
            Directory.CreateDirectory(staging);
            CopyProfile(legacy, staging);
            Directory.Move(staging, path);
        }
        Directory.CreateDirectory(path);
        return path;
    }

    private static void CopyProfile(string source, string target)
    {
        foreach (string file in Directory.EnumerateFiles(source))
            File.Copy(file, Path.Combine(target, Path.GetFileName(file)), overwrite: false);
        foreach (string directory in Directory.EnumerateDirectories(source))
        {
            if ((File.GetAttributes(directory) & FileAttributes.ReparsePoint) != 0) continue;
            string destination = Path.Combine(target, Path.GetFileName(directory));
            Directory.CreateDirectory(destination);
            CopyProfile(directory, destination);
        }
    }
}
