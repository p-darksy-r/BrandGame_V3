using BrandGame.Updater;
using System.IO.Compression;
using System.Net;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

int passed = 0;
void Check(bool condition, string message) { if (!condition) throw new Exception(message); passed++; Console.WriteLine("PASS " + message); }
void Reject(Action action, string message) { bool rejected = false; try { action(); } catch { rejected = true; } Check(rejected, message); }
async Task RejectAsync(Func<Task> action, string message) { bool rejected = false; try { await action(); } catch { rejected = true; } Check(rejected, message); }
using var rsa = RSA.Create(2048);
byte[] Encode(ReleaseManifest manifest) => JsonSerializer.SerializeToUtf8Bytes(manifest);
byte[] Sign(byte[] data) => rsa.SignData(data, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1);
var valid = new ReleaseManifest(1, "3.3.0", "preview", "BrandGame-3.3.0-win-x64.zip", 10, new string('a', 64));
byte[] data = Encode(valid), signature = Sign(data);
Check(ReleaseManifest.Verify(data, signature, rsa.ToXmlString(false)) == valid, "signed manifest accepted");
data[1] ^= 1;
Reject(() => ReleaseManifest.Verify(data, signature, rsa.ToXmlString(false)), "modified manifest rejected");
using var otherKey = RSA.Create(2048);
Reject(() => ReleaseManifest.Verify(Encode(valid), signature, otherKey.ToXmlString(false)), "unrecognised signing key rejected");
foreach (var invalid in new[] { valid with { Schema = 2 }, valid with { File = "../game.zip" }, valid with { Size = 0 }, valid with { Version = "03.3.0" }, valid with { Channel = "arbitrary" } })
    Reject(() => ReleaseManifest.Verify(Encode(invalid), Sign(Encode(invalid)), rsa.ToXmlString(false)), "invalid manifest fields rejected");
Reject(() => UpdaterOptions.Parse(["--local", "--check"]), "mixed updater modes rejected");
Reject(() => UpdaterOptions.Parse(["--install-package", "test.zip"]), "unsigned local package options rejected");
Check(UpdaterOptions.Parse(["--watch"]).Local, "watch keeps local development behaviour");

object Release(string version, bool preview, bool draft = false) => new { tag_name = "v" + version, prerelease = preview, draft,
    assets = new[] { $"BrandGame-{version}-win-x64.zip", "release-manifest.json", "release-manifest.sig" }.Select(name => new { name, state = "uploaded", browser_download_url = $"https://github.com/{ReleaseClient.Repository}/releases/download/v{version}/{name}" }) };
string releases = JsonSerializer.Serialize(new[] { Release("3.3.0", true), Release("3.2.0", false), Release("9.0.0", false, true) });
Check(ReleaseClient.ParseReleases(releases, false).Single().Version == "3.2.0", "stable excludes previews and drafts");
Check(ReleaseClient.ParseReleases(releases, true).Count() == 2, "preview includes stable and development releases");
Check(!ReleaseClient.ParseReleases(releases.Replace("https://github.com/", "https://evil.example/"), true).Any(), "foreign asset URLs rejected");
Reject(() => ReleaseClient.ValidateDownloadUri(new Uri("http://github.com/file")), "HTTP downloads rejected");
using (var client = new ReleaseClient(new FakeHandler(() => new HttpResponseMessage(HttpStatusCode.OK) { Content = new ByteArrayContent(new byte[10]) })))
    await RejectAsync(() => client.DownloadAsync(new Uri("https://github.com/file"), new MemoryStream(), 5, null, default), "oversized HTTP response rejected");
using (var client = new ReleaseClient(new FakeHandler(() => { var response = new HttpResponseMessage(HttpStatusCode.Redirect); response.Headers.Location = new Uri("https://evil.example/file"); return response; })))
    await RejectAsync(() => client.DownloadAsync(new Uri("https://github.com/file"), new MemoryStream(), 5, null, default), "foreign redirect rejected");
using (var client = new ReleaseClient(new FakeHandler(() => new HttpResponseMessage(HttpStatusCode.Forbidden))))
    await RejectAsync(() => client.FindLatestAsync(true, default), "rate limit reported as failure");

string project = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../../"));
string fixture = PackageInstaller.SafePath(project, "artifacts/test-online-" + Guid.NewGuid().ToString("N"));
Directory.CreateDirectory(fixture);
try
{
    string NewRoot() { string root = Path.Combine(fixture, Guid.NewGuid().ToString("N")); Directory.CreateDirectory(Path.Combine(root, ".brandgame-updates")); return root; }
    (string Zip, ReleaseManifest Manifest) Package(string version, string? extra = null)
    {
        string file = Path.Combine(fixture, Guid.NewGuid().ToString("N") + ".zip");
        using (var zip = ZipFile.Open(file, ZipArchiveMode.Create))
        {
            foreach (var (name, value) in new Dictionary<string, string> {
                ["app/BrandGame.exe"] = "fixture-" + version, ["app/build-info.json"] = JsonSerializer.Serialize(new { version }),
                ["app/web/index.html"] = "test", ["app/web/assets/manifest.json"] = "{}", ["update.exe"] = "launcher" })
            { using var writer = new StreamWriter(zip.CreateEntry(name).Open()); writer.Write(value); }
            if (extra != null) { using var writer = new StreamWriter(zip.CreateEntry(extra).Open()); writer.Write("invalid"); }
        }
        using var stream = File.OpenRead(file);
        return (file, new(1, version, "preview", $"BrandGame-{version}-win-x64.zip", stream.Length, Convert.ToHexString(SHA256.HashData(stream)).ToLowerInvariant()));
    }
    var first = Package("3.3.0");
    var next = Package("3.4.0");
    string root = NewRoot();
    string save = Path.Combine(root, "save-fixture.json"); File.WriteAllText(save, "preserved");
    PackageInstaller.Install(root, first.Zip, first.Manifest, false);
    Check(PackageInstaller.InstalledVersion(root) == new Version(3, 3, 0), "first installation succeeds");
    File.WriteAllText(Path.Combine(root, "app/stale.txt"), "old");
    Reject(() => PackageInstaller.Install(root, next.Zip, next.Manifest, false, () => throw new IOException("simulated move failure")), "failure after backup rolls back");
    Check(PackageInstaller.InstalledVersion(root) == new Version(3, 3, 0), "old app restored after failed replacement");
    PackageInstaller.Install(root, next.Zip, next.Manifest, false);
    Check(PackageInstaller.InstalledVersion(root) == new Version(3, 4, 0) && !File.Exists(Path.Combine(root, "app/stale.txt")), "upgrade replaces the full app");
    Check(File.ReadAllText(save) == "preserved", "files outside app remain intact");
    Reject(() => PackageInstaller.Install(root, first.Zip, first.Manifest, true), "downgrade rejected even with repair");
    Reject(() => PackageInstaller.Install(root, next.Zip, next.Manifest, false), "same version requires explicit repair");
    PackageInstaller.Install(root, next.Zip, next.Manifest, true);
    Check(PackageInstaller.InstalledVersion(root) == new Version(3, 4, 0), "repair accepts the same authenticated version");
    Reject(() => PackageInstaller.Install(root, next.Zip, next.Manifest with { Sha256 = new string('0', 64) }, true), "altered package rejected before replacement");
    foreach (string name in new[] { "app/../../outside.txt", "app/COn.txt", "app/web/file:stream", "app/web/file.", "app/BrandGame.exe", "outside.txt" })
    {
        var bad = Package("3.5.0", name);
        Reject(() => PackageInstaller.Install(root, bad.Zip, bad.Manifest, false), "unsafe or duplicate archive entry rejected: " + name);
    }
    string id = Guid.NewGuid().ToString("N");
    Directory.Move(Path.Combine(root, "app"), Path.Combine(root, ".brandgame-updates/backup-" + id));
    File.WriteAllText(Path.Combine(root, ".brandgame-updates/pending.json"), JsonSerializer.Serialize(new PendingInstall(id, true, false)));
    PackageInstaller.Recover(root);
    Check(PackageInstaller.InstalledVersion(root) == new Version(3, 4, 0), "interrupted replacement restores backup on next start");
    File.WriteAllText(Path.Combine(root, ".brandgame-updates/pending.json"), JsonSerializer.Serialize(new PendingInstall("../outside", true, false)));
    Reject(() => PackageInstaller.Recover(root), "untrusted journal paths rejected");
    Reject(() => PackageInstaller.SafePath(root, "../outside"), "paths outside installation rejected");
}
finally { Directory.Delete(PackageInstaller.SafePath(project, Path.GetRelativePath(project, fixture)), true); }
Console.WriteLine($"{passed} online updater checks passed.");

sealed class FakeHandler(Func<HttpResponseMessage> response) : HttpMessageHandler
{
    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken token) => Task.FromResult(response());
}
