using System.Text.Json;
using BrandGame.Services;

int passed = 0;
void Check(bool value, string message)
{
    if (!value) throw new Exception(message);
    Console.WriteLine("PASS " + message);
    passed++;
}

using (var engine = new GameEngine())
using (var cases = JsonDocument.Parse(File.ReadAllText(Path.Combine(AppContext.BaseDirectory, "matching-cases.json"))))
{
    foreach (var item in cases.RootElement.EnumerateArray())
    {
        var result = engine.Evaluate(item.GetProperty("guess").GetString()!, item.GetProperty("answer").GetString()!, item.GetProperty("elapsed").GetInt32());
        Check(Math.Abs(result.match - item.GetProperty("match").GetDouble()) < 0.00001 &&
            result.correct == item.GetProperty("correct").GetBoolean() && result.score == item.GetProperty("score").GetInt32(),
            "shared scoring: " + item.GetProperty("guess").GetString());
    }
}
Check(AppPaths.IsTrustedPage("https://app.brandgame.local/index.html"), "local web origin accepted");
foreach (var source in new[] { "http://app.brandgame.local/", "https://app.brandgame.local.evil/", "https://evil/", "file:///index.html", "https://app.brandgame.local:444/", "https://user@app.brandgame.local/" })
    Check(!AppPaths.IsTrustedPage(source), "foreign origin rejected: " + source);

var workspace = Path.GetFullPath(Directory.GetCurrentDirectory());
var fixture = Path.GetFullPath(Path.Combine(workspace, "artifacts", "native-tests-" + Guid.NewGuid().ToString("N")));
if (!fixture.StartsWith(workspace + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase)) throw new Exception("Invalid test path");
Directory.CreateDirectory(fixture);
try
{
    var path = Path.Combine(fixture, "save.json");
    var saves = new SaveStore(path);
    Check(await saves.LoadAsync() == "null", "new profile has no save");
    using var first = JsonDocument.Parse("{\"globalScore\":42,\"name\":\"</script>\"}");
    using var second = JsonDocument.Parse("{\"globalScore\":75}");
    await saves.WriteAsync(first.RootElement);
    await saves.WriteAsync(second.RootElement);
    Check(JsonDocument.Parse(await saves.LoadAsync()).RootElement.GetProperty("globalScore").GetInt32() == 75, "latest save persisted");
    Check(File.Exists(path + ".bak"), "previous save backed up");
    await File.WriteAllTextAsync(path, "broken json");
    Check(JsonDocument.Parse(await saves.LoadAsync()).RootElement.GetProperty("globalScore").GetInt32() == 42, "corrupt save recovers backup");
    await Task.WhenAll(Enumerable.Range(0, 20).Select(async index =>
    {
        using var value = JsonDocument.Parse($"{{\"globalScore\":{index}}}");
        await saves.WriteAsync(value.RootElement);
    }));
    Check(JsonDocument.Parse(await saves.LoadAsync()).RootElement.ValueKind == JsonValueKind.Object, "concurrent writes remain valid JSON");
    Check(!Directory.EnumerateFiles(fixture, "*.tmp").Any(), "temporary save files cleaned");
    using var array = JsonDocument.Parse("[]");
    bool rejected = false;
    try { await saves.WriteAsync(array.RootElement); } catch (InvalidDataException) { rejected = true; }
    Check(rejected, "non-object saves rejected");
}
finally { Directory.Delete(fixture, recursive: true); }
Console.WriteLine($"{passed} native checks passed.");
