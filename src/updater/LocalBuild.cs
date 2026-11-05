using System.Diagnostics;
namespace BrandGame.Updater;

internal static class LocalBuild
{
    internal static int Run(string root, bool watch, bool launch)
    {
        string script = Path.Combine(root, "scripts", "update.ps1");
        if (!File.Exists(script)) throw new FileNotFoundException("O modo --local requer o codigo-fonte e a pasta scripts.");
        var info = new ProcessStartInfo
        {
            FileName = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.System), "WindowsPowerShell", "v1.0", "powershell.exe"),
            WorkingDirectory = root, UseShellExecute = false
        };
        foreach (var item in new[] { "-NoLogo", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", script }) info.ArgumentList.Add(item);
        if (watch) info.ArgumentList.Add("-Watch");
        if (launch) info.ArgumentList.Add("-Launch");
        using var process = Process.Start(info) ?? throw new IOException("Nao foi possivel iniciar a compilacao local.");
        Console.CancelKeyPress += (_, e) => e.Cancel = true;
        process.WaitForExit();
        return process.ExitCode;
    }
}
