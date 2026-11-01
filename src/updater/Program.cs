using System.Diagnostics;

namespace BrandGame.Updater;

internal static class Program
{
    private static int Main(string[] args)
    {
        if (args.Contains("--help"))
        {
            Console.WriteLine("BrandGame local updater\n\nupdate.exe [--watch] [--launch] [--no-pause]\n\nCompila o codigo local mais recente e publica em app/.\n--watch     Observa alteracoes e volta a publicar (Ctrl+C para terminar).\n--launch    Abre a app depois de uma atualizacao bem-sucedida.\n--no-pause  Termina sem esperar por uma tecla.\n\nRequer o projeto completo, PowerShell e .NET SDK 8 ou superior.\nNao descarrega alteracoes do GitHub. Feche a app para aplicar atualizacoes.");
            return 0;
        }

        var allowed = new[] { "--watch", "--launch", "--no-pause" };
        if (args.Any(arg => !allowed.Contains(arg)))
        {
            Console.Error.WriteLine("Opcao desconhecida. Use update.exe --help.");
            return 2;
        }

        int exitCode;
        try
        {
            var root = AppContext.BaseDirectory;
            var script = Path.Combine(root, "scripts", "update.ps1");
            if (!File.Exists(script))
                throw new FileNotFoundException("Mantenha update.exe na raiz do projeto, junto da pasta scripts.", script);

            var info = new ProcessStartInfo
            {
                FileName = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.System),
                    "WindowsPowerShell", "v1.0", "powershell.exe"),
                WorkingDirectory = root,
                UseShellExecute = false
            };
            foreach (var argument in new[] { "-NoLogo", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", script })
                info.ArgumentList.Add(argument);
            if (args.Contains("--watch")) info.ArgumentList.Add("-Watch");
            if (args.Contains("--launch")) info.ArgumentList.Add("-Launch");

            using var process = Process.Start(info) ?? throw new InvalidOperationException("Nao foi possivel iniciar a atualizacao.");
            // PowerShell receives the same console Ctrl+C event and cleans up its lock.
            Console.CancelKeyPress += (_, e) => e.Cancel = true;
            process.WaitForExit();
            exitCode = process.ExitCode;
        }
        catch (Exception exception)
        {
            Console.Error.WriteLine($"Falha na atualizacao: {exception.Message}");
            exitCode = 1;
        }

        // Keep a double-clicked console readable; command line automation never pauses.
        if (args.Length == 0 && !Console.IsInputRedirected)
        {
            Console.WriteLine("\nPrima uma tecla para fechar.");
            Console.ReadKey(intercept: true);
        }
        return exitCode;
    }
}
