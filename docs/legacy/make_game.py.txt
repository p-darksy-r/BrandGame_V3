import os
import zipfile

# Define the file structure and contents for BrandGame_V3
project_files = {
    # VS Code Configs
    ".vscode/tasks.json": """{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Build C++ DLL",
            "type": "shell",
            "command": "cl.exe",
            "args": [
                "/LD",
                "/EHsc",
                "/O2",
                "src/cpp/BrandEngine.cpp",
                "/Fe:src/csharp/BrandEngine.dll"
            ],
            "problemMatcher": "$msCompile",
            "group": "build",
            "options": {
                "shell": {
                    "executable": "cmd.exe",
                    "args": [
                        "/d", "/c",
                        "call \\"C:\\\\Program Files\\\\Microsoft Visual Studio\\\\2022\\\\Community\\\\VC\\\\Auxiliary\\\\Build\\\\vcvars64.bat\\" &&"
                    ]
                }
            }
        },
        {
            "label": "Build C# Project",
            "type": "shell",
            "command": "dotnet",
            "args": [
                "build",
                "src/csharp/BrandGame.csproj",
                "-c",
                "Debug"
            ],
            "problemMatcher": "$msCompile",
            "group": "build",
            "dependsOn": "Build C++ DLL"
        },
        {
            "label": "Build All",
            "dependsOn": [
                "Build C# Project"
            ],
            "group": {
                "kind": "build",
                "isDefault": true
            }
        }
    ]
}""",

    ".vscode/launch.json": """{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Launch BrandGame (C#)",
            "type": "coreclr",
            "request": "launch",
            "preLaunchTask": "Build All",
            "program": "${workspaceFolder}/src/csharp/bin/Debug/net8.0-windows/BrandGame.exe",
            "args": [],
            "cwd": "${workspaceFolder}/src/csharp",
            "console": "internalConsole",
            "stopAtEntry": false
        }
    ]
}""",

    # C++ Source Code
    "src/cpp/BrandEngine.h": """#pragma once

#ifdef BRANDENGINE_EXPORTS
#define BRANDENGINE_API __declspec(dllexport)
#else
#define BRANDENGINE_API __declspec(dllimport)
#endif

extern "C" {
    BRANDENGINE_API double CalculateMatch(const char* s1, const char* s2);
    BRANDENGINE_API int CalculateScore(int t, int L);
}""",

    "src/cpp/BrandEngine.cpp": """#define BRANDENGINE_EXPORTS
#include "BrandEngine.h"
#include <string>
#include <vector>
#include <algorithm>
#include <cmath>

int LevenshteinDistance(const std::string& s1, const std::string& s2) {
    int len1 = s1.size();
    int len2 = s2.size();
    std::vector<std::vector<int>> dp(len1 + 1, std::vector<int>(len2 + 1));

    for (int i = 0; i <= len1; ++i) dp[i][0] = i;
    for (int j = 0; j <= len2; ++j) dp[0][j] = j;

    for (int i = 1; i <= len1; ++i) {
        for (int j = 1; j <= len2; ++j) {
            int cost = (s1[i - 1] == s2[j - 1]) ? 0 : 1;
            dp[i][j] = std::min({ dp[i - 1][j] + 1,
                                 dp[i][j - 1] + 1,
                                 dp[i - 1][j - 1] + cost 
                               });
        }
    }
    return dp[len1][len2];
}

extern "C" {
    BRANDENGINE_API double CalculateMatch(const char* s1, const char* s2) {
        if (!s1 || !s2) return 0.0;
        std::string str1(s1);
        std::string str2(s2);

        std::transform(str1.begin(), str1.end(), str1.begin(), ::tolower);
        std::transform(str2.begin(), str2.end(), str2.begin(), ::tolower);

        str1.erase(std::remove_if(str1.begin(), str1.end(), ::isspace), str1.end());
        str2.erase(std::remove_if(str2.begin(), str2.end(), ::isspace), str2.end());

        int dist = LevenshteinDistance(str1, str2);
        int maxLen = std::max(str1.length(), str2.length());

        if (maxLen == 0) return 100.0;

        double match = (1.0 - (double)dist / maxLen) * 100.0;
        return match < 0.0 ? 0.0 : match;
    }

    BRANDENGINE_API int CalculateScore(int t, int L) {
        int calculated = (100 - t) * L;
        return std::max(10, calculated);
    }
}""",

    # C# Application Host Wrapper
    "src/csharp/BrandGame.csproj": """<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>WinExe</OutputType>
    <TargetFramework>net8.0-windows</TargetFramework>
    <Nullable>enable</Nullable>
    <UseWindowsForms>true</UseWindowsForms>
    <ImplicitUsings>enable</ImplicitUsings>
    <Platforms>x64</Platforms>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.Web.WebView2" Version="1.0.2592.51" />
  </ItemGroup>

  <ItemGroup>
    <None Update="BrandEngine.dll">
      <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
    </None>
    <None Update="src\\frontend\\**\\*">
      <CopyToOutputDirectory>PreserveNewest</CopyToOutputDirectory>
    </None>
  </ItemGroup>
</Project>""",

    "src/csharp/Program.cs": """using System;
using System.Windows.Forms;

namespace BrandGame
{
    static class Program
    {
        [STAThread]
        static void Main()
        {
            ApplicationConfiguration.Initialize();
            Application.Run(new MainWindow());
        }
    }
}""",

    "src/csharp/MainWindow.cs": """using System;
using System.IO;
using System.Runtime.InteropServices;
using System.Windows.Forms;
using Microsoft.Web.WebView2.Core;
using Microsoft.Web.WebView2.WinForms;
using System.Text.Json;

namespace BrandGame
{
    public class MainWindow : Form
    {
        private WebView2 webView;

        [DllImport("BrandEngine.dll", CallingConvention = CallingConvention.Cdecl, CharSet = CharSet.Ansi)]
        private static extern double CalculateMatch(string s1, string s2);

        [DllImport("BrandEngine.dll", CallingConvention = CallingConvention.Cdecl)]
        private static extern int CalculateScore(int t, int L);

        public MainWindow()
        {
            this.Text = "BrandGame_V3 - Desktop Host";
            this.Width = 1024;
            this.Height = 768;
            this.StartPosition = FormStartPosition.CenterScreen;

            webView = new WebView2 { Dock = DockStyle.Fill };
            this.Controls.Add(webView);

            InitializeAsync();
        }

        private async void InitializeAsync()
        {
            string appDir = AppContext.BaseDirectory;
            string frontendPath = Path.Combine(appDir, "src", "frontend");
            
            if (!Directory.Exists(frontendPath))
            {
                frontendPath = Path.GetFullPath(Path.Combine(appDir, @"..\\..\\..\\..\\src\\frontend"));
            }

            var env = await CoreWebView2Environment.CreateAsync(null, null, null);
            await webView.EnsureCoreWebView2Async(env);

            webView.CoreWebView2.SetVirtualHostNameToFolderMapping(
                "app.brandgame.local",
                frontendPath,
                CoreWebView2HostResourceAccessKind.Allow
            );

            webView.CoreWebView2.WebMessageReceived += OnWebMessageReceived;
            webView.CoreWebView2.Navigate("https://app.brandgame.local/index.html");
        }

        private class GuessPayload
        {
            public string UserGuess { get; set; } = "";
            public string CorrectAnswer { get; set; } = "";
            public int TimeElapsed { get; set; }
        }

        private async void OnWebMessageReceived(object? sender, CoreWebView2WebMessageReceivedEventArgs e)
        {
            string message = e.TryGetWebMessageAsString();
            if (string.IsNullOrEmpty(message)) return;

            try
            {
                var payload = JsonSerializer.Deserialize<GuessPayload>(message);
                if (payload != null)
                {
                    double matchPercentage = CalculateMatch(payload.UserGuess, payload.CorrectAnswer);
                    bool isCorrect = matchPercentage >= 85.0;
                    int scoreEarned = isCorrect ? CalculateScore(payload.TimeElapsed, payload.CorrectAnswer.Length) : 0;

                    var result = new {
                        match = matchPercentage,
                        correct = isCorrect,
                        score = scoreEarned
                    };

                    string jsonResponse = JsonSerializer.Serialize(result);
                    await webView.ExecuteScriptAsync($"onMatchResult({jsonResponse})");
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Bridge Processing Exception: {ex.Message}", "Bridge Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }
    }
}""",

    # Front-End Web Assets
    "src/frontend/index.html": """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>BrandGame_V3</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div id="game-container">
        <header>
            <div class="logo-title">BrandGame_V3</div>
            <div class="stats">
                <div class="stat-box">Score: <span id="score">0</span></div>
                <div class="stat-box">Timer: <span id="timer">100</span>s</div>
            </div>
        </header>

        <main>
            <div id="brand-display" class="brand-display-card">
                <div id="logo-container"></div>
                <div class="hint-container">
                    <span id="hint-text">Category: Tech</span>
                </div>
            </div>

            <div id="controls">
                <input type="text" id="guess-input" placeholder="Type your guess here..." autocomplete="off" autofocus>
                <button id="submit-btn">Submit Guess</button>
            </div>

            <div id="feedback-message"></div>
        </main>

        <footer>
            Developed for <span class="author">darksy2027-ctrl</span> • Powered by C++, C#, & JS
        </footer>
    </div>
    <script src="app.js"></script>
</body>
</html>""",

    "src/frontend/style.css": """@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Rajdhani:wght@500;700&display=swap');

:root {
    --bg-color: #0b0c10;
    --container-bg: #1f2833;
    --primary-glow: #66fcf1;
    --secondary-glow: #45f3ff;
    --text-main: #c5c6c7;
    --text-highlight: #ffffff;
    --wrong-color: #ff4d4d;
    --correct-color: #2ecc71;
}

body {
    background-color: var(--bg-color);
    color: var(--text-main);
    font-family: 'Rajdhani', sans-serif;
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    overflow: hidden;
}

#game-container {
    width: 85%;
    max-width: 800px;
    background: linear-gradient(145deg, #112233, #0f1626);
    border: 2px solid var(--primary-glow);
    box-shadow: 0 0 25px rgba(102, 252, 241, 0.2);
    border-radius: 12px;
    padding: 25px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(102, 252, 241, 0.3);
    padding-bottom: 15px;
}

.logo-title {
    font-family: 'Orbitron', sans-serif;
    font-size: 2rem;
    color: var(--primary-glow);
    text-shadow: 0 0 10px rgba(102, 252, 241, 0.5);
    font-weight: 700;
}

.stats {
    display: flex;
    gap: 15px;
}

.stat-box {
    background-color: var(--container-bg);
    border: 1px solid var(--primary-glow);
    border-radius: 6px;
    padding: 8px 15px;
    font-weight: bold;
    font-size: 1.2rem;
    color: var(--text-highlight);
}

.brand-display-card {
    height: 250px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 8px;
    border: 1px dashed rgba(102, 252, 241, 0.4);
    position: relative;
    margin-bottom: 15px;
}

#logo-container {
    width: 100%;
    height: 180px;
    display: flex;
    justify-content: center;
    align-items: center;
}

#logo-container svg {
    max-width: 60%;
    max-height: 80%;
    filter: drop-shadow(0px 0px 8px rgba(255, 255, 255, 0.8));
    transition: all 0.3s ease;
}

.pixelated {
    filter: blur(14px) grayscale(100%) !important;
}

.hint-container {
    margin-top: 5px;
    font-size: 1.1rem;
    color: var(--primary-glow);
}

#controls {
    display: flex;
    gap: 10px;
}

#guess-input {
    flex-grow: 1;
    background-color: rgba(255, 255, 255, 0.05);
    border: 1px solid var(--text-main);
    border-radius: 6px;
    padding: 12px 20px;
    color: #fff;
    font-size: 1.2rem;
    outline: none;
    transition: border-color 0.3s;
}

#guess-input:focus {
    border-color: var(--primary-glow);
    box-shadow: 0 0 10px rgba(102, 252, 241, 0.3);
}

#submit-btn {
    background-color: var(--primary-glow);
    border: none;
    color: var(--bg-color);
    padding: 12px 25px;
    font-size: 1.2rem;
    font-weight: bold;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.1s;
}

#submit-btn:hover {
    background-color: var(--secondary-glow);
    box-shadow: 0 0 15px rgba(69, 243, 255, 0.6);
}

#submit-btn:active {
    transform: scale(0.97);
}

#feedback-message {
    height: 30px;
    text-align: center;
    font-size: 1.3rem;
    font-weight: bold;
}

.correct {
    color: var(--correct-color);
    text-shadow: 0 0 8px rgba(46, 204, 113, 0.5);
    animation: pulse 0.5s ease;
}

.wrong {
    color: var(--wrong-color);
    text-shadow: 0 0 8px rgba(255, 77, 77, 0.5);
    animation: shake 0.4s ease;
}

footer {
    text-align: center;
    font-size: 0.9rem;
    color: rgba(197, 198, 199, 0.5);
    border-top: 1px solid rgba(102, 252, 241, 0.1);
    padding-top: 10px;
}

.author {
    color: var(--primary-glow);
    font-weight: bold;
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-8px); }
    75% { transform: translateX(8px); }
}""",

    "src/frontend/app.js": """const BRANDS = [
    {
        name: "Apple",
        category: "Tech Hardware",
        svg: `<svg viewBox="0 0 170 170" fill="#ffffff">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.04-1.85-14.1-5.94-3.01-2.42-6.85-7.04-11.53-13.86-5.19-7.53-9.28-15.82-12.27-24.87-3-9.05-4.5-17.82-4.5-26.31 0-12.98 3.1-23.75 9.31-32.32 6.2-8.57 14.15-12.91 23.83-13.01 4.7-.05 9.77 1.34 15.22 4.17 5.45 2.83 9.4 4.24 11.84 4.24 2.1 0 5.92-1.31 11.45-3.94 5.53-2.62 10.15-3.83 13.86-3.63 12.56.83 22.02 5.45 28.38 13.86-10.45 6.34-15.58 14.89-15.4 25.64.19 8.23 3.19 15.15 9 20.76 5.8 5.61 12.8 8.8 21 9.56-.63 2.1-1.36 4.31-2.2 6.64zm-25.62-101.4c0-7.39 2.61-14.28 7.84-20.67 6.13-7.54 13.68-11.56 21.05-11.56.12 0 .23 0 .35.01.12 7.84-2.61 15.16-8.2 21.94-5.21 6.31-12.54 10.68-20.6 10.68-.14 0-.29-.01-.44-.01v-.39z"/>
              </svg>`
    },
    {
        name: "Target",
        category: "Retail Store",
        svg: `<svg viewBox="0 0 100 100" fill="#ff4d4d">
                <circle cx="50" cy="50" r="45" stroke="#ff4d4d" stroke-width="10" fill="none"/>
                <circle cx="50" cy="50" r="15" fill="#ff4d4d"/>
              </svg>`
    },
    {
        name: "Nike",
        category: "Sportswear",
        svg: `<svg viewBox="0 0 24 24" fill="#ffffff">
                <path d="M21 6.5c-2.3 1.2-5.7 3.3-8.8 5.9-3.2 2.7-5.9 5.8-7.3 8.1-.4.7-.8 1.1-1.1 1.1-.3 0-.4-.3-.3-.8.4-1.9 1.7-5 3.9-8.4 2.3-3.4 5.3-6.6 8.5-8.7 1.8-1.2 3.5-1.9 4.3-1.9.3 0 .5.1.5.3s-.2.7-.8 1.4z"/>
              </svg>`
    },
    {
        name: "Starbucks",
        category: "Coffee & Drinks",
        svg: `<svg viewBox="0 0 100 100" fill="#00704A">
                <circle cx="50" cy="50" r="48" fill="#00704A"/>
                <circle cx="50" cy="50" r="38" fill="#ffffff"/>
                <circle cx="50" cy="50" r="34" fill="#00704A"/>
                <polygon points="50,28 53,37 62,37 55,43 57,52 50,46 43,52 45,43 38,37 47,37" fill="#ffffff"/>
              </svg>`
    },
    {
        name: "McDonalds",
        category: "Fast Food",
        svg: `<svg viewBox="0 0 100 100" fill="#ffbc0d">
                <path d="M10,80 C10,35 30,30 45,60 C60,30 80,35 80,80" stroke="#ffbc0d" stroke-width="12" fill="none" stroke-linecap="round"/>
              </svg>`
    }
];

let currentBrandIndex = 0;
let totalScore = 0;
let timeLeft = 100;
let timerInterval = null;
let canGuess = true;

const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const logoContainer = document.getElementById("logo-container");
const hintText = document.getElementById("hint-text");
const guessInput = document.getElementById("guess-input");
const submitBtn = document.getElementById("submit-btn");
const feedbackEl = document.getElementById("feedback-message");

function loadBrand() {
    canGuess = true;
    guessInput.value = "";
    guessInput.disabled = false;
    submitBtn.disabled = false;
    feedbackEl.innerText = "";
    feedbackEl.className = "";
    
    const brand = BRANDS[currentBrandIndex];
    logoContainer.innerHTML = brand.svg;
    hintText.innerText = `Category: ${brand.category}`;

    timeLeft = 100;
    timerEl.innerText = timeLeft;
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.innerText = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            handleTimeOut();
        }
    }, 1000);

    const logoSvg = logoContainer.querySelector("svg");
    if (totalScore >= 120) {
        logoSvg.classList.add("pixelated");
    }
}

function submitGuess() {
    if (!canGuess) return;
    const userGuess = guessInput.value.trim();
    if (!userGuess) return;

    const correctBrand = BRANDS[currentBrandIndex].name;
    const timeElapsed = 100 - timeLeft;

    if (window.chrome && window.chrome.webview) {
        window.chrome.webview.postMessage({
            UserGuess: userGuess,
            CorrectAnswer: correctBrand,
            TimeElapsed: timeElapsed
        });
    } else {
        const isMatch = userGuess.toLowerCase() === correctBrand.toLowerCase();
        onMatchResult({
            correct: isMatch,
            match: isMatch ? 100.0 : 45.0,
            score: isMatch ? Math.max(10, (100 - timeElapsed) * correctBrand.length) : 0
        });
    }
}

function handleTimeOut() {
    canGuess = false;
    guessInput.disabled = true;
    submitBtn.disabled = true;
    feedbackEl.innerText = `Time is up! Correct answer: ${BRANDS[currentBrandIndex].name}`;
    feedbackEl.className = "wrong";
    setTimeout(nextBrand, 3000);
}

window.onMatchResult = function(result) {
    clearInterval(timerInterval);
    canGuess = false;
    guessInput.disabled = true;
    submitBtn.disabled = true;

    const logoSvg = logoContainer.querySelector("svg");
    if (logoSvg) logoSvg.classList.remove("pixelated");

    if (result.correct) {
        totalScore += result.score;
        scoreEl.innerText = totalScore;
        feedbackEl.innerText = `Correct! Similarity: ${result.match.toFixed(1)}% (+${result.score} pts)`;
        feedbackEl.className = "correct";
    } else {
        feedbackEl.innerText = `Incorrect! Similarity: ${result.match.toFixed(1)}% (Target is >= 85%)`;
        feedbackEl.className = "wrong";
    }

    setTimeout(nextBrand, 3000);
};

function nextBrand() {
    currentBrandIndex = (currentBrandIndex + 1) % BRANDS.length;
    loadBrand();
}

submitBtn.addEventListener("click", submitGuess);
guessInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") submitGuess();
});

window.onload = () => {
    loadBrand();
};""",
