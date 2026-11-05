namespace BrandGame.Updater;

internal sealed class UpdaterOptions
{
    internal bool Local, Watch, Launch, Check, Repair, Recover;
    internal string Channel = "preview";
    internal string? Package, Manifest, Signature;
    internal static UpdaterOptions Parse(string[] args)
    {
        var result = new UpdaterOptions();
        for (int i = 0; i < args.Length; i++)
        {
            string Value() => ++i < args.Length ? args[i] : throw new ArgumentException("Falta o valor da opcao.");
            switch (args[i])
            {
                case "--local": result.Local = true; break;
                case "--watch": result.Local = result.Watch = true; break;
                case "--launch": result.Launch = true; break;
                case "--check": result.Check = true; break;
                case "--repair": result.Repair = true; break;
                case "--recover": result.Recover = true; break;
                case "--no-pause": break;
                case "--channel": result.Channel = Value(); break;
                case "--install-package": result.Package = Value(); break;
                case "--manifest": result.Manifest = Value(); break;
                case "--signature": result.Signature = Value(); break;
                default: throw new ArgumentException("Opcao desconhecida. Use update.exe --help.");
            }
        }
        if (result.Channel is not ("preview" or "stable")) throw new ArgumentException("Canal invalido.");
        if ((result.Package == null) != (result.Manifest == null) || (result.Package == null) != (result.Signature == null))
            throw new ArgumentException("Um pacote local exige --manifest e --signature.");
        if (result.Local && (result.Check || result.Repair || result.Recover || result.Package != null || args.Contains("--channel")) ||
            result.Check && (result.Package != null || result.Repair || result.Recover) || result.Recover && (result.Package != null || result.Repair))
            throw new ArgumentException("Opcoes de modos diferentes nao podem ser combinadas.");
        return result;
    }
}
