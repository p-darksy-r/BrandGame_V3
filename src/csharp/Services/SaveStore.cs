using System.Text;
using System.Text.Json;

namespace BrandGame.Services;

internal sealed class SaveStore(string path)
{
    internal const int MaximumBytes = 4 * 1024 * 1024;
    private readonly SemaphoreSlim writeLock = new(1, 1);

    internal async Task<string> LoadAsync()
    {
        await writeLock.WaitAsync();
        try
        {
            if (!File.Exists(path)) return "null";
            try { return await ReadValidatedAsync(path); }
            catch (Exception ex) when (ex is JsonException or InvalidDataException)
            {
                if (File.Exists(path + ".bak")) return await ReadValidatedAsync(path + ".bak");
                throw new InvalidDataException("O progresso guardado está danificado. O ficheiro original foi preservado.", ex);
            }
        }
        finally { writeLock.Release(); }
    }

    internal async Task WriteAsync(JsonElement data)
    {
        if (data.ValueKind != JsonValueKind.Object) throw new InvalidDataException("O progresso deve ser um objeto JSON.");
        string json = JsonSerializer.Serialize(data);
        if (Encoding.UTF8.GetByteCount(json) > MaximumBytes) throw new InvalidDataException("O progresso excede o tamanho máximo.");
        await writeLock.WaitAsync();
        string temporary = path + "." + Guid.NewGuid().ToString("N") + ".tmp";
        try
        {
            Directory.CreateDirectory(Path.GetDirectoryName(path)!);
            await File.WriteAllTextAsync(temporary, json, new UTF8Encoding(false));
            if (File.Exists(path)) File.Replace(temporary, path, path + ".bak");
            else File.Move(temporary, path);
        }
        finally
        {
            if (File.Exists(temporary)) File.Delete(temporary);
            writeLock.Release();
        }
    }

    private static async Task<string> ReadValidatedAsync(string source)
    {
        if (new FileInfo(source).Length > MaximumBytes) throw new InvalidDataException("O progresso excede o tamanho máximo.");
        using JsonDocument document = JsonDocument.Parse(await File.ReadAllTextAsync(source));
        if (document.RootElement.ValueKind != JsonValueKind.Object) throw new InvalidDataException("Formato de progresso inválido.");
        // Serialize parsed JSON so disk contents can never become injected JavaScript.
        return JsonSerializer.Serialize(document.RootElement);
    }
}
