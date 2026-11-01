using System;
using System.Windows.Forms;

namespace BrandGame
{
    static class Program
    {
        [STAThread]
        static void Main(string[] args)
        {
            bool smokeTest = args.Contains("--smoke-test");
            if (smokeTest && string.IsNullOrWhiteSpace(Environment.GetEnvironmentVariable("BRANDGAME_PROFILE_ROOT")))
            {
                Environment.ExitCode = 2; // Smoke tests must never open the player's profile.
                return;
            }
            ApplicationConfiguration.Initialize();
            Application.Run(new MainWindow(smokeTest));
        }
    }
}
