using System.Diagnostics;
using BrandGame.Updater;

return await UpdaterProgram.RunAsync(args);

internal static class UpdaterProgram
{
    internal static async Task<int> RunAsync(string[] args)
    {
        int code = 0;
        try
        {
            if (args.Contains("--help")) { Console.WriteLine(Help); return 0; }
            var options = UpdaterOptions.Parse(args);
            string root = AppContext.BaseDirectory;
            if (options.Local) return LocalBuild.Run(root, options.Watch, options.Launch);
            string cache = PackageInstaller.SafePath(root, ".brandgame-updates");
            Directory.CreateDirectory(cache);
            using var updateLock = new FileStream(PackageInstaller.SafePath(root, ".brandgame-updates/update.lock"), FileMode.OpenOrCreate, FileAccess.ReadWrite, FileShare.None);
            if (File.Exists(PackageInstaller.SafePath(root, "artifacts/pending-update.json")))
                throw new IOException("Existe uma compilacao local interrompida. Execute update.exe --local para a recuperar primeiro.");
            if (File.Exists(PackageInstaller.SafePath(root, ".brandgame-updates/pending.json")))
            {
                PackageInstaller.AssertGameClosed(root);
                PackageInstaller.Recover(root);
            }
            if (options.Recover) { Console.WriteLine("Recuperacao concluida."); return 0; }
            using var cancellation = new CancellationTokenSource();
            Console.CancelKeyPress += (_, e) => { e.Cancel = true; cancellation.Cancel(); };
            ReleaseManifest manifest;
            string? zipPath = options.Package;
            bool downloaded = false;
            try
            {
                if (zipPath != null)
                {
                    if (new FileInfo(options.Manifest!).Length > 32768 || new FileInfo(options.Signature!).Length > 1024)
                        throw new InvalidDataException("Manifesto demasiado grande.");
                    manifest = ReleaseManifest.Verify(await File.ReadAllBytesAsync(options.Manifest!), await File.ReadAllBytesAsync(options.Signature!), ReleaseManifest.PublicKey);
                    if (manifest.Channel == "preview" && options.Channel == "stable") throw new InvalidDataException("O pacote de desenvolvimento nao pertence ao canal stable.");
                }
                else
                {
                    Console.WriteLine($"A consultar releases do GitHub (canal {options.Channel})...");
                    using var client = new ReleaseClient();
                    var release = await client.FindLatestAsync(options.Channel == "preview", cancellation.Token);
                    if (release == null) { Console.WriteLine("Nao existem releases compativeis com manifesto assinado neste canal."); return 0; }
                    manifest = await client.GetManifestAsync(release, cancellation.Token);
                    var installed = PackageInstaller.InstalledVersion(root);
                    var target = ReleaseManifest.ParseVersion(manifest.Version);
                    Console.WriteLine($"Instalada: {installed?.ToString() ?? "nenhuma"}. Disponivel: {manifest.Version} ({manifest.Channel}).");
                    if (installed != null && target < installed) { Console.WriteLine("A versao instalada e mais recente. Nao sera feito downgrade."); return 0; }
                    if (installed == target && !options.Repair) { Console.WriteLine("A app ja esta atualizada."); Launch(root, options.Launch); return 0; }
                    if (options.Check) return 0;
                    PackageInstaller.AssertGameClosed(root);
                    zipPath = PackageInstaller.SafePath(root, $".brandgame-updates/download-{Guid.NewGuid():N}.zip");
                    downloaded = true;
                    await using (var output = new FileStream(zipPath, FileMode.CreateNew, FileAccess.Write, FileShare.None))
                    {
                        int last = -10;
                        await client.DownloadAsync(release.Package, output, manifest.Size, bytes => {
                            int percent = (int)(bytes * 100 / manifest.Size);
                            if (percent >= last + 10) { last = percent; Console.WriteLine($"Download: {percent}%"); }
                        }, cancellation.Token);
                    }
                }
                cancellation.Token.ThrowIfCancellationRequested();
                PackageInstaller.Install(root, zipPath, manifest, options.Repair);
                Launch(root, options.Launch);
            }
            finally
            {
                if (downloaded && zipPath != null && File.Exists(zipPath))
                    File.Delete(PackageInstaller.SafePath(root, Path.GetRelativePath(root, zipPath)));
            }
        }
        catch (OperationCanceledException) { Console.Error.WriteLine("Atualizacao cancelada ou tempo de rede excedido. A app anterior foi preservada."); code = 1; }
        catch (Exception ex) { Console.Error.WriteLine($"Falha na atualizacao: {ex.Message}"); code = 1; }
        finally
        {
            if (args.Length == 0 && !Console.IsInputRedirected)
            {
                Console.WriteLine("Prima uma tecla para fechar.");
                Console.ReadKey(true);
            }
        }
        return code;
    }

    private static void Launch(string root, bool enabled)
    {
        if (enabled) Process.Start(new ProcessStartInfo(PackageInstaller.SafePath(root, "app/BrandGame.exe")) { UseShellExecute = true });
    }

    private const string Help = """
        BrandGame updater
        update.exe [--check] [--channel preview|stable] [--repair] [--launch] [--no-pause]
        Descarrega e verifica releases assinadas de p-darksy-r/BrandGame_Releases.
        O canal predefinido preview inclui versoes de desenvolvimento e estaveis.
        --check     Consulta sem instalar. --repair reinstala a mesma versao; nunca regride.
        --recover   Recupera uma instalacao interrompida, sem rede.
        --local     Compila fontes locais (requer scripts, .NET SDK, Node/npm e SignTool).
        --watch     Observa as fontes locais; implica --local.
        --install-package ZIP --manifest JSON --signature SIG  Instala um pacote local autenticado.
        Feche o jogo para atualizar. Saves em AppData ficam preservados.
        O lancador em execucao nao e substituido; as releases incluem o update.exe atualizado.
        """;
}
