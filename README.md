# BrandGame V3 🎮

<p align="center">
  <img src="https://img.shields.io/github/license/darksy2027-ctrl/BrandGame_V3?style=for-the-badge&color=blue" alt="License" />
  <img src="https://img.shields.io/github/v/release/darksy2027-ctrl/BrandGame_V3?style=for-the-badge&color=emerald" alt="Release" />
  <img src="https://img.shields.io/badge/Platform-Windows%20%7C%20Web-orange?style=for-the-badge" alt="Platform Support" />
  <img src="https://img.shields.io/github/repo-size/darksy2027-ctrl/BrandGame_V3?style=for-the-badge&color=purple" alt="Repo Size" />
</p>

A beautifully designed, performance-optimized **Retro Brand Guessing Trivia Game** built with HTML5, TailwindCSS, and Vanilla JS, wrapped in a native desktop container. Challenge your knowledge across multiple industries, or build your own arenas from scratch!

---

## ✨ Features

* **📦 5-Column Levels Layout:** An elegant, highly responsive 100-level grid with custom scrollbar tracking and auto-unlock states.
* **🛠️ Custom Level Builder:** Build, configure, and publish your own custom trivia rooms with dynamic brand slots, timer constraints, and distinct visual themes.
* **⚙️ Robust Settings Engine:** Live, hardware-level customizability including:
  * Master audio synthesis controls.
  * Screen brightness scales and performance budget throttling (FPS limits & VSync toggling).
  * Safe system persistence that loads instantly.
* **⚡ Ultra-Lightweight Performance:** Dedicated *"Low Quality"* mode which disables complex UI animations, transitions, and filters on older machines.
* **📳 Haptic Emulation:** Screen-shake physical feedback on incorrect guesses and timeouts.

---

## 🛠️ Tech Stack

* **Frontend:** Vanilla JavaScript (ES6+), HTML5 Canvas, CSS3 Custom Animations, TailwindCSS.
* **Native Wrapper:** C# WinForms / WPF with WebView2 Integration.
* **Synthesizer:** Web Audio API (real-time retro retro coin/fail oscillator sweeps).

---

## 🚀 Quick Start

### Running in Web Mode
Simply launch `src/frontend/index.html` inside any modern browser, or spin up a local development server:
```bash
# Using Python
python -m http.server 8000
