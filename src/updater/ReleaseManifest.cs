using System.Reflection;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace BrandGame.Updater;

internal sealed record ReleaseManifest(int Schema, string Version, string Channel, string File, long Size, string Sha256)
{
    internal static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };
    internal const long MaximumPackageBytes = 250L * 1024 * 1024;
    internal static string PublicKey
    {
        get
        {
            using var stream = Assembly.GetExecutingAssembly().GetManifestResourceStream("BrandGame.ReleasePublicKey")!;
            using var reader = new StreamReader(stream);
            return reader.ReadToEnd();
        }
    }

    internal static Version ParseVersion(string value)
    {
        if (!Regex.IsMatch(value ?? "", @"^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$"))
            throw new InvalidDataException("Versao de release invalida.");
        return System.Version.Parse(value!);
    }

    internal static ReleaseManifest Verify(byte[] json, byte[] signature, string publicKey)
    {
        if (json.Length > 32768 || signature.Length > 1024) throw new InvalidDataException("Manifesto demasiado grande.");
        using var rsa = RSA.Create();
        rsa.FromXmlString(publicKey);
        if (!rsa.VerifyData(json, signature, HashAlgorithmName.SHA256, RSASignaturePadding.Pkcs1))
            throw new InvalidDataException("A assinatura do pacote nao pertence ao autor esperado ou os dados foram alterados.");
        var result = JsonSerializer.Deserialize<ReleaseManifest>(json, JsonOptions) ?? throw new InvalidDataException("Manifesto vazio.");
        ParseVersion(result.Version);
        if (result.Schema != 1 || result.Channel is not ("stable" or "preview") ||
            result.File != $"BrandGame-{result.Version}-win-x64.zip" || result.Size <= 0 || result.Size > MaximumPackageBytes ||
            !Regex.IsMatch(result.Sha256 ?? "", "^[a-f0-9]{64}$")) throw new InvalidDataException("Manifesto de release invalido.");
        return result;
    }

    internal void VerifyPackage(string path)
    {
        using var stream = System.IO.File.OpenRead(path);
        if (stream.Length != Size || Convert.ToHexString(SHA256.HashData(stream)).ToLowerInvariant() != Sha256)
            throw new InvalidDataException("O pacote esta incompleto ou foi alterado. A app instalada foi preservada.");
    }
}
