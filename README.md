# BrandGame_V3 🎮

An interactive, high-performance brand-guessing desktop game designed specifically for the Windows environment. This project showcases dynamic interoperability by combining **C++**, **C# (.NET 8.0)**, and **Modern JavaScript (HTML5/CSS3)** using WebView2 mappings.

Designed and optimized for the GitHub user **darksy2027-ctrl**.

---

## 📐 Mathematical Execution Specifications

All evaluation and scoring are performed inside the low-latency native **C++ Engine** (`BrandEngine.dll`):

1. **Similarity Evaluation**:
   Let $$d(s_1, s_2)$$ represent the Levenshtein distance between the normalized user input $$s_1$$ and the official brand name $$s_2$$. The match percentage $$M$$ is evaluated as:
   $$M = \max\left(0, \left(1 - \frac{d(s_1, s_2)}{\max(|s_1|, |s_2|)}\right) \times 100\right)$$
   *A guess is accepted as correct when $$M \ge 85$$.*

2. **Decay Scoring Equation**:
   Let $$t$$ represent the elapsed seconds before submission ($$t \le 100$$) and $$L$$ represent the character length of the official brand target string. The resulting score award $$S$$ is calculated as:
   $$S = \max\left(10, \left(100 - t\right) \times L\right)$$

---

## 🗺️ System Architecture Flowchart

```text
  ┌──────────────────────────────────────────────────────────────┐
  │                   FRONTEND USER INTERFACE                    │
  │                  (HTML5 / CSS3 / JavaScript)                 │
  └───────────────┬──────────────────────────────▲───────────────┘
                  │ postMessage                  │ onMatchResult
                  │ (Guess JSON)                 │ (Result JSON)
  ┌───────────────▼──────────────────────────────┴───────────────┐
  │                    C# WRAPPER (HOST)                         │
  │           (WinForms Desktop + WebView2 Control)              │
  └───────────────┬──────────────────────────────▲───────────────┘
                  │ P/Invoke                     │ Native Return
                  │ Interop Call                 │ (Value Types)
  ┌───────────────▼──────────────────────────────┴───────────────┐
  │                    C++ CALCULATION ENGINE                    │
  │                     (BrandEngine.dll)                        │
  └──────────────────────────────────────────────────────────────┘
