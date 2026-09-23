# 🧮 Modern Calculator App

A fast, accurate, accessible, and visually stunning web calculator featuring a **Standard Mode**, **Scientific Mode**, **Calculation History Drawer**, and full **Keyboard Navigation**. Built with pure vanilla HTML, CSS, and JavaScript.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

---

## ✨ Features

- 🎨 **Modern Glassmorphic UI**: Vibrant glassmorphism design with ambient dynamic background glows, smooth micro-interactions, and premium typography (Inter & Outfit).
- 🔢 **Standard & Scientific Modes**: Seamlessly toggle between basic arithmetic and scientific operations (trigonometry, powers, roots, logarithms, factorials, and mathematical constants).
- 📐 **DEG / RAD Angle Toggle**: Switch between Degree and Radian modes for trigonometric functions (`sin`, `cos`, `tan`).
- 📜 **Calculation History**: Keep track of previous calculations with an interactive history drawer.
- ⌨️ **Full Keyboard Support**: Execute calculations effortlessly using standard keyboard shortcuts and numpad keys.
- 📱 **Fully Responsive & Accessible**: Optimized for mobile, tablet, and desktop screens with full ARIA accessibility standards and high contrast ratios.
- 🛡️ **Robust Error Handling**: Smooth handling for division by zero, invalid parentheses, domain errors, overflow/underflow, and syntax errors without crashing or showing `NaN`/`Infinity`.

---

## 🚀 Live Demo & Screenshots

Simply open `index.html` in any web browser to use the app immediately!

---

## 🧮 Calculator Operations

### Standard Operations
- **Basic Arithmetic**: Addition (`+`), Subtraction (`−`), Multiplication (`×`), Division (`÷`)
- **Percentage**: Quick percentage computations (`%`)
- **Backspace & Clear**: Step-by-step backspace deletion (`⌫`) and full reset (`AC`)
- **Negative Sign Toggle**: Invert values with (`+/-`)

### Scientific Operations
- **Trigonometric**: `sin`, `cos`, `tan` (Supports **DEG** and **RAD**)
- **Exponents & Powers**: Square (`x²`), Custom Power (`x^y`)
- **Roots**: Square Root (`√`)
- **Logarithms**: Common Logarithm (`log` base 10), Natural Logarithm (`ln` base e)
- **Factorial**: Integer factorials (`n!`)
- **Reciprocal**: `1/x`
- **Constants**: Pi (`π` ≈ 3.14159), Euler's Number (`e` ≈ 2.71828)
- **Parentheses**: Nested expression evaluation with `(` and `)`

---

## ⌨️ Keyboard Shortcuts

| Action | Keyboard Key |
| :--- | :--- |
| Numbers | `0` – `9` |
| Decimal Point | `.` |
| Addition | `+` |
| Subtraction | `-` |
| Multiplication | `*` |
| Division | `/` |
| Percentage | `%` |
| Equal / Calculate | `Enter` or `=` |
| Backspace | `Backspace` |
| Clear All | `Escape` or `c` / `C` |
| Power ($x^y$) | `^` |
| Parentheses | `(` and `)` |

---

## 🛠️ Project Structure

```text
modern-calculator/
├── index.html       # Application HTML structure with semantic markup and ARIA support
├── styles.css       # Design system, CSS variables, glassmorphism UI, grid layout, animations
├── js/
│   ├── app.js       # Main application controller, UI event listeners & state orchestration
│   └── engine.js    # Core calculation engine, expression parser & scientific evaluation
├── prd.md           # Product Requirements Document
├── task.md          # Task breakdown & completion checklist
└── README.md        # Project documentation
```

---

## 💻 Local Development Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/pavithra-unni/modern-calculator.git
   cd modern-calculator
   ```

2. **Run locally**:
   - No build tools or node dependencies required!
   - Simply double click `index.html` or open it with any web browser (or use VS Code Live Server / Vite / `npx serve`).

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page or submit a pull request.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
