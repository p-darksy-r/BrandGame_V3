using System.Net;
using System.Text.Json;

namespace BrandGame.Updater;

internal sealed record ReleaseCandidate(string Version, bool Preview, Uri Package, Uri Manifest, Uri Signature);

internal sealed class ReleaseClient : IDisposable
{
    internal const string Repository = "p-darksy-r/BrandGame_Releases";
    private readonly HttpClient client;
    internal ReleaseClient(HttpMessageHandler? handler = null)
    {
        client = new(handler ?? new HttpClientHandler { AllowAutoRedirect = false }) { Timeout = TimeSpan.FromMinutes(5) };
        client.DefaultRequestHeaders.UserAgent.ParseAdd("BrandGame-Updater/3.3.0");
        client.DefaultRequestHeaders.Accept.ParseAdd("application/vnd.github+json");
    }

    internal static IEnumerable<ReleaseCandidate> ParseReleases(string json, bool preview)
    {
        using var document = JsonDocument.Parse(json);
        foreach (var release in document.RootElement.EnumerateArray())
        {
            if (release.GetProperty("draft").GetBoolean()) continue;
            bool isPreview = release.GetProperty("prerelease").GetBoolean();
            if (isPreview && !preview) continue;
            string tag = release.GetProperty("tag_name").GetString() ?? "";
            if (!tag.StartsWith('v')) continue;
            string version = tag[1..];
            try { ReleaseManifest.ParseVersion(version); } catch { continue; }
            var assets = release.GetProperty("assets").EnumerateArray().ToArray();
            Uri? Asset(string name)
            {
                var matches = assets.Where(asset => asset.GetProperty("name").GetString() == name && asset.GetProperty("state").GetString() == "uploaded").ToArray();
                if (matches.Length != 1) return null;
                string expected = $"https://github.com/{Repository}/releases/download/{tag}/{name}";
                return matches[0].GetProperty("browser_download_url").GetString() == expected ? new Uri(expected) : null;
            }
            var package = Asset($"BrandGame-{version}-win-x64.zip");
            var manifest = Asset("release-manifest.json");
            var signature = Asset("release-manifest.sig");
            if (package != null && manifest != null && signature != null) yield return new(version, isPreview, package, manifest, signature);
        }
    }

    internal async Task<ReleaseCandidate?> FindLatestAsync(bool preview, CancellationToken token)
    {
        var found = new List<ReleaseCandidate>();
        for (int page = 1; page <= 10; page++)
        {
            var data = await ReadAsync(new Uri($"https://api.github.com/repos/{Repository}/releases?per_page=100&page={page}"), 8 * 1024 * 1024, token);
            var json = System.Text.Encoding.UTF8.GetString(data);
            found.AddRange(ParseReleases(json, preview));
            using var document = JsonDocument.Parse(json);
            if (document.RootElement.GetArrayLength() < 100)
                return found.OrderByDescending(item => ReleaseManifest.ParseVersion(item.Version)).FirstOrDefault();
        }
        throw new InvalidDataException("Demasiadas releases para confirmar a ultima versao. Atualize o lancador.");
    }

    internal async Task<ReleaseManifest> GetManifestAsync(ReleaseCandidate release, CancellationToken token)
    {
        var manifest = ReleaseManifest.Verify(await ReadAsync(release.Manifest, 32768, token),
            await ReadAsync(release.Signature, 1024, token), ReleaseManifest.PublicKey);
        if (manifest.Version != release.Version || (manifest.Channel == "preview") != release.Preview)
            throw new InvalidDataException("A release nao corresponde ao manifesto assinado.");
        return manifest;
    }

    internal static void ValidateDownloadUri(Uri uri)
    {
        string[] hosts = ["api.github.com", "github.com", "release-assets.githubusercontent.com", "objects.githubusercontent.com"];
        if (uri.Scheme != "https" || uri.Port != 443 || uri.UserInfo.Length > 0 || !hosts.Contains(uri.Host))
            throw new InvalidDataException("O download saiu dos servidores HTTPS permitidos do GitHub.");
    }

    private async Task<HttpResponseMessage> OpenAsync(Uri uri, CancellationToken token)
    {
        for (int attempt = 0; attempt < 6; attempt++)
        {
            ValidateDownloadUri(uri);
            var response = await client.GetAsync(uri, HttpCompletionOption.ResponseHeadersRead, token);
            if ((int)response.StatusCode is 301 or 302 or 303 or 307 or 308)
            {
                var next = response.Headers.Location;
                response.Dispose();
                if (next == null) throw new IOException("Redirecionamento sem destino.");
                uri = next.IsAbsoluteUri ? next : new Uri(uri, next);
                continue;
            }
            if (!response.IsSuccessStatusCode)
            {
                var status = response.StatusCode;
                response.Dispose();
                throw new IOException(status is HttpStatusCode.Forbidden or HttpStatusCode.TooManyRequests
                    ? "O GitHub limitou os pedidos. Tente mais tarde; a app permanece instalada."
                    : $"O GitHub respondeu com HTTP {(int)status}.");
            }
            return response;
        }
        throw new IOException("Demasiados redirecionamentos no download.");
    }

    private async Task<byte[]> ReadAsync(Uri uri, long limit, CancellationToken token)
    {
        using var output = new MemoryStream();
        await DownloadAsync(uri, output, limit, null, token);
        return output.ToArray();
    }

    internal async Task DownloadAsync(Uri uri, Stream output, long limit, Action<long>? progress, CancellationToken token)
    {
        using var response = await OpenAsync(uri, token);
        if (response.Content.Headers.ContentLength > limit) throw new IOException("Download maior do que o esperado.");
        using var deadline = CancellationTokenSource.CreateLinkedTokenSource(token);
        deadline.CancelAfter(TimeSpan.FromMinutes(10));
        await using var input = await response.Content.ReadAsStreamAsync(deadline.Token);
        byte[] buffer = new byte[81920];
        long total = 0;
        int read;
        while ((read = await input.ReadAsync(buffer, deadline.Token)) != 0)
        {
            total += read;
            if (total > limit) throw new IOException("Download excedeu o tamanho permitido.");
            await output.WriteAsync(buffer.AsMemory(0, read), deadline.Token);
            progress?.Invoke(total);
        }
    }
    public void Dispose() => client.Dispose();
}
