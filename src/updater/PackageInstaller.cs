using System.Diagnostics;
using System.IO.Compression;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace BrandGame.Updater;

internal sealed record PendingInstall(string Id, bool HadApp, bool Committed);

internal static class PackageInstaller
{
    internal static string SafePath(string root, string relative)
    {
        string basis = Path.TrimEndingDirectorySeparator(Path.GetFullPath(root));
        string full = Path.GetFullPath(Path.Combine(basis, relative));
        string prefix = Path.EndsInDirectorySeparator(basis) ? basis : basis + Path.DirectorySeparatorChar;
        if (string.Equals(Path.TrimEndingDirectorySeparator(full), basis, StringComparison.OrdinalIgnoreCase) || !full.StartsWith(prefix, StringComparison.OrdinalIgnoreCase))
            throw new IOException("O caminho sai da pasta da instalacao.");
        for (string? current = full; current != null && current.Length >= basis.Length; current = Path.GetDirectoryName(current))
        {
            try
            {
                if ((File.GetAttributes(current) & FileAttributes.ReparsePoint) != 0)
                    throw new IOException("A atualizacao nao aceita ligacoes de diretorio ou ficheiro.");
            }
            catch (FileNotFoundException) { }
            catch (DirectoryNotFoundException) { }
        }
        return full;
    }

    internal static Version? InstalledVersion(string root)
    {
        string app = SafePath(root, "app");
        if (!Directory.Exists(app)) return null;
        using var info = JsonDocument.Parse(File.ReadAllText(SafePath(root, "app/build-info.json")));
        return ReleaseManifest.ParseVersion(info.RootElement.GetProperty("version").GetString()!);
    }

    internal static void AssertGameClosed(string root)
    {
        string executable = SafePath(root, "app/BrandGame.exe");
        foreach (var process in Process.GetProcessesByName("BrandGame"))
        {
            using (process)
            {
                if (process.HasExited) continue;
                string? running = process.MainModule?.FileName;
                if (running == null || string.Equals(running, executable, StringComparison.OrdinalIgnoreCase))
                    throw new IOException("Feche o BrandGame antes de aplicar a atualizacao. O jogo nao sera terminado automaticamente.");
            }
        }
    }

    internal static void Extract(string zipPath, string stage)
    {
        using var zip = ZipFile.OpenRead(zipPath);
        if (zip.Entries.Count > 5000) throw new InvalidDataException("Demasiados ficheiros no pacote.");
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
        long total = 0;
        foreach (var entry in zip.Entries)
        {
            string name = entry.FullName.Replace('\\', '/');
            string[] parts = name.TrimEnd('/').Split('/');
            if (parts.Any(part => part.Length == 0 || part is "." or ".." || part.EndsWith('.') || part.EndsWith(' ') ||
                part.IndexOfAny(Path.GetInvalidFileNameChars()) >= 0 || Regex.IsMatch(part, @"^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)", RegexOptions.IgnoreCase)))
                throw new InvalidDataException("Caminho inseguro no ZIP.");
            if (!seen.Add(name.TrimEnd('/'))) throw new InvalidDataException("Ficheiro duplicado no ZIP.");
            if (((entry.ExternalAttributes >> 16) & 0xF000) == 0xA000 || (entry.ExternalAttributes & (int)FileAttributes.ReparsePoint) != 0)
                throw new InvalidDataException("Ligacoes nao sao permitidas no ZIP.");
            if (entry.Length < 0 || (total += entry.Length) > 600L * 1024 * 1024) throw new InvalidDataException("Pacote descomprimido demasiado grande.");
            // The launcher is shipped for new/manual installations; a running launcher is never overwritten.
            if (name is "update.exe" or "PLAYTEST.md") continue;
            if (parts[0] != "app") throw new InvalidDataException("O pacote contem ficheiros fora de app.");
            string destination = SafePath(stage, name);
            if (name.EndsWith('/')) { Directory.CreateDirectory(destination); continue; }
            Directory.CreateDirectory(Path.GetDirectoryName(destination)!);
            using var input = entry.Open();
            using var output = new FileStream(destination, FileMode.CreateNew);
            byte[] buffer = new byte[81920];
            long written = 0;
            int read;
            while ((read = input.Read(buffer)) != 0)
            {
                written += read;
                if (written > entry.Length) throw new InvalidDataException("Tamanho de entrada ZIP invalido.");
                output.Write(buffer, 0, read);
            }
            if (written != entry.Length) throw new InvalidDataException("Entrada ZIP incompleta.");
        }
    }

    internal static void ValidateStage(string stage, ReleaseManifest manifest)
    {
        foreach (string file in new[] { "app/BrandGame.exe", "app/web/index.html", "app/build-info.json", "app/web/assets/manifest.json" })
            if (!File.Exists(SafePath(stage, file))) throw new InvalidDataException($"Falta {file} no pacote.");
        if (InstalledVersion(stage) != ReleaseManifest.ParseVersion(manifest.Version)) throw new InvalidDataException("Versao interna incorreta.");
    }

    private static string Journal(string root) => SafePath(root, ".brandgame-updates/pending.json");
    private static string Stage(string root, string id) => SafePath(root, $".brandgame-updates/stage-{id}");
    private static string Backup(string root, string id) => SafePath(root, $".brandgame-updates/backup-{id}");

    private static void WriteJournal(string root, PendingInstall pending)
    {
        string temp = SafePath(root, ".brandgame-updates/pending.tmp");
        using (var stream = new FileStream(temp, FileMode.Create, FileAccess.Write, FileShare.None))
        {
            JsonSerializer.Serialize(stream, pending);
            stream.Flush(true);
        }
        File.Move(temp, Journal(root), true);
    }

    internal static void Recover(string root)
    {
        string journal = Journal(root);
        if (!File.Exists(journal)) return;
        var pending = JsonSerializer.Deserialize<PendingInstall>(File.ReadAllText(journal)) ?? throw new IOException("Registo de recuperacao invalido.");
        if (!Regex.IsMatch(pending.Id, "^[a-f0-9]{32}$")) throw new IOException("Identificador de recuperacao invalido.");
        string app = SafePath(root, "app"), backup = Backup(root, pending.Id);
        if (!pending.Committed)
        {
            if (Directory.Exists(backup))
            {
                if (Directory.Exists(app)) Directory.Move(app, SafePath(root, $".brandgame-updates/failed-{Guid.NewGuid():N}"));
                Directory.Move(backup, app);
            }
            else if (!pending.HadApp && Directory.Exists(app) && !Directory.Exists(SafePath(Stage(root, pending.Id), "app")))
                Directory.Move(app, SafePath(root, $".brandgame-updates/failed-{Guid.NewGuid():N}"));
            else if (pending.HadApp && !Directory.Exists(app))
                throw new IOException("A copia de seguranca nao foi encontrada. A recuperacao precisa de revisao manual.");
            Console.WriteLine("Atualizacao interrompida recuperada; a instalacao anterior foi preservada.");
        }
        File.Delete(journal);
    }

    internal static void Install(string root, string zipPath, ReleaseManifest manifest, bool repair, Action? afterBackup = null)
    {
        var installed = InstalledVersion(root);
        var target = ReleaseManifest.ParseVersion(manifest.Version);
        if (installed != null && (target < installed || (target == installed && !repair)))
            throw new IOException("A versao do pacote nao e superior a instalada. Use --repair apenas para reinstalar a mesma versao.");
        manifest.VerifyPackage(zipPath);
        string id = Guid.NewGuid().ToString("N"), stage = Stage(root, id);
        Directory.CreateDirectory(stage);
        bool keepStage = false;
        try
        {
            Extract(zipPath, stage);
            ValidateStage(stage, manifest);
            AssertGameClosed(root);
            bool hadApp = Directory.Exists(SafePath(root, "app"));
            WriteJournal(root, new(id, hadApp, false));
            try
            {
                if (hadApp) Directory.Move(SafePath(root, "app"), Backup(root, id));
                afterBackup?.Invoke();
                Directory.Move(SafePath(stage, "app"), SafePath(root, "app"));
                WriteJournal(root, new(id, hadApp, true));
            }
            catch
            {
                try { Recover(root); } catch { keepStage = true; throw; }
                throw;
            }
            File.Delete(Journal(root));
            Console.WriteLine($"App atualizada para {manifest.Version}. Progresso preservado. Backup: .brandgame-updates/backup-{id}");
        }
        finally
        {
            // Resolve and check the exact child again before recursive cleanup.
            if (!keepStage && Directory.Exists(stage)) Directory.Delete(Stage(root, id), true);
        }
    }
}
