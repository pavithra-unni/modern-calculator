/**
 * js/engine.js - Calculator Logic Engine
 * Extended calculation engine supporting Standard & Scientific modes,
 * advanced functions, angle unit toggle (DEG/RAD), and calculation history.
 */

export class CalculatorEngine {
  constructor() {
    this.mode = 'standard'; // 'standard' | 'scientific'
    this.angleMode = 'DEG';  // 'DEG' | 'RAD'
    this.history = [];
    this.loadHistoryFromStorage();
    this.reset();
  }

  /**
   * Reset engine state to initial default.
   */
  reset() {
    this.currentInput = '0';
    this.previousInput = null;
    this.operator = null;
    this.overwriteOnNextInput = false;
    this.hasError = false;
    this.errorMessage = null;

    // Repeated equals support
    this.lastOperator = null;
    this.lastOperand = null;
  }

  /**
   * Return snapshot of engine state for UI.
   */
  getState() {
    return {
      mode: this.mode,
      angleMode: this.angleMode,
      currentInput: this.currentInput,
      previousInput: this.previousInput,
      operator: this.operator,
      overwriteOnNextInput: this.overwriteOnNextInput,
      hasError: this.hasError,
      errorMessage: this.errorMessage,
      history: [...this.history]
    };
  }

  /**
   * Toggle between Standard and Scientific modes.
   */
  setMode(mode) {
    if (mode === 'standard' || mode === 'scientific') {
      this.mode = mode;
    }
    return this.getState();
  }

  /**
   * Toggle between DEG and RAD angle modes.
   */
  toggleAngleMode() {
    this.angleMode = this.angleMode === 'DEG' ? 'RAD' : 'DEG';
    return this.getState();
  }

  /**
   * Format numeric result to prevent floating-point artifacts
   * and manage extreme display lengths.
   */
  formatNumber(val) {
    if (typeof val !== 'number' || !isFinite(val)) {
      return null;
    }

    const precisionFixed = parseFloat(val.toFixed(10));
    const absVal = Math.abs(precisionFixed);

    if ((absVal >= 1e12 || (absVal > 0 && absVal < 1e-7)) && absVal !== 0) {
      return precisionFixed.toExponential(6);
    }

    return precisionFixed.toString();
  }

  /**
   * Input a number digit ('0'-'9').
   */
  inputDigit(digit) {
    if (this.hasError) {
      this.reset();
    }

    if (this.overwriteOnNextInput) {
      this.currentInput = digit === '0' ? '0' : digit;
      this.overwriteOnNextInput = false;
    } else {
      if (this.currentInput === '0') {
        this.currentInput = digit;
      } else {
        if (this.currentInput.replace(/[-.]/g, '').length < 15) {
          this.currentInput += digit;
        }
      }
    }

    return this.getState();
  }

  /**
   * Input a decimal point.
   */
  inputDecimal() {
    if (this.hasError) {
      this.reset();
    }

    if (this.overwriteOnNextInput) {
      this.currentInput = '0.';
      this.overwriteOnNextInput = false;
      return this.getState();
    }

    if (!this.currentInput.includes('.')) {
      this.currentInput += '.';
    }

    return this.getState();
  }

  /**
   * Input math constants (π, e).
   */
  inputConstant(constName) {
    if (this.hasError) this.reset();

    let val;
    if (constName === 'pi' || constName === 'π') {
      val = Math.PI;
    } else if (constName === 'e') {
      val = Math.E;
    } else {
      return this.getState();
    }

    const formatted = this.formatNumber(val);
    if (formatted) {
      this.currentInput = formatted;
      this.overwriteOnNextInput = true;
    }
    return this.getState();
  }

  /**
   * Input an operator ('+', '−', '×', '÷', '^').
   */
  inputOperator(op) {
    if (this.hasError) return this.getState();

    const normalizedOp = this.normalizeOperator(op);

    if (this.overwriteOnNextInput && this.previousInput !== null) {
      this.operator = normalizedOp;
      return this.getState();
    }

    if (this.previousInput !== null && this.operator !== null) {
      this.calculateIntermediate();
      if (this.hasError) return this.getState();
    }

    this.previousInput = this.currentInput;
    this.operator = normalizedOp;
    this.overwriteOnNextInput = true;
    this.lastOperator = null;
    this.lastOperand = null;

    return this.getState();
  }

  normalizeOperator(op) {
    switch (op) {
      case '*':
      case 'x':
      case 'X':
      case '×':
        return '×';
      case '/':
      case '÷':
        return '÷';
      case '-':
      case '−':
        return '−';
      case '+':
        return '+';
      case '^':
      case 'x^y':
      case 'pow':
        return '^';
      default:
        return op;
    }
  }

  calculateIntermediate() {
    const num1 = parseFloat(this.previousInput);
    const num2 = parseFloat(this.currentInput);

    const result = this.executeBinaryOp(num1, this.operator, num2);
    if (result.error) {
      this.hasError = true;
      this.errorMessage = result.error;
      return;
    }

    const formatted = this.formatNumber(result.value);
    if (formatted === null) {
      this.hasError = true;
      this.errorMessage = 'Calculation error';
      return;
    }

    this.currentInput = formatted;
    this.previousInput = formatted;
  }

  /**
   * Execute binary arithmetic operations.
   */
  executeBinaryOp(a, op, b) {
    if (isNaN(a) || isNaN(b)) {
      return { error: 'Invalid input' };
    }

    switch (op) {
      case '+':
        return { value: a + b };
      case '−':
      case '-':
        return { value: a - b };
      case '×':
      case '*':
        return { value: a * b };
      case '÷':
      case '/':
        if (b === 0) {
          return { error: 'Cannot divide by zero' };
        }
        return { value: a / b };
      case '^':
        return { value: Math.pow(a, b) };
      default:
        return { error: 'Unknown operator' };
    }
  }

  /**
   * Execute unary scientific functions (sin, cos, tan, sqrt, square, log, ln, 1/x, n!).
   */
  executeScientificFunc(func) {
    if (this.hasError) return this.getState();

    const val = parseFloat(this.currentInput);
    if (isNaN(val)) return this.getState();

    let resVal;
    let funcSymbol = '';

    switch (func) {
      case 'sin': {
        const rad = this.angleMode === 'DEG' ? (val * Math.PI) / 180 : val;
        resVal = Math.sin(rad);
        funcSymbol = `sin(${val})`;
        break;
      }
      case 'cos': {
        const rad = this.angleMode === 'DEG' ? (val * Math.PI) / 180 : val;
        resVal = Math.cos(rad);
        funcSymbol = `cos(${val})`;
        break;
      }
      case 'tan': {
        const rad = this.angleMode === 'DEG' ? (val * Math.PI) / 180 : val;
        // Check for tan asymptote (e.g. 90deg)
        if (this.angleMode === 'DEG' && (Math.abs(val) % 180 === 90)) {
          this.hasError = true;
          this.errorMessage = 'Invalid input';
          return this.getState();
        }
        resVal = Math.tan(rad);
        funcSymbol = `tan(${val})`;
        break;
      }
      case 'sqrt':
      case '√': {
        if (val < 0) {
          this.hasError = true;
          this.errorMessage = 'Invalid input';
          return this.getState();
        }
        resVal = Math.sqrt(val);
        funcSymbol = `√(${val})`;
        break;
      }
      case 'square':
      case 'x²': {
        resVal = val * val;
        funcSymbol = `sqr(${val})`;
        break;
      }
      case 'log': {
        if (val <= 0) {
          this.hasError = true;
          this.errorMessage = 'Invalid input';
          return this.getState();
        }
        resVal = Math.log10(val);
        funcSymbol = `log(${val})`;
        break;
      }
      case 'ln': {
        if (val <= 0) {
          this.hasError = true;
          this.errorMessage = 'Invalid input';
          return this.getState();
        }
        resVal = Math.log(val);
        funcSymbol = `ln(${val})`;
        break;
      }
      case 'reciprocal':
      case '1/x': {
        if (val === 0) {
          this.hasError = true;
          this.errorMessage = 'Cannot divide by zero';
          return this.getState();
        }
        resVal = 1 / val;
        funcSymbol = `1/(${val})`;
        break;
      }
      case 'factorial':
      case 'n!': {
        if (val < 0 || !Number.isInteger(val) || val > 170) {
          this.hasError = true;
          this.errorMessage = 'Invalid input';
          return this.getState();
        }
        resVal = this.computeFactorial(val);
        funcSymbol = `${val}!`;
        break;
      }
      default:
        return this.getState();
    }

    const formatted = this.formatNumber(resVal);
    if (formatted === null) {
      this.hasError = true;
      this.errorMessage = 'Calculation error';
    } else {
      this.addHistoryEntry(funcSymbol, formatted);
      this.currentInput = formatted;
      this.overwriteOnNextInput = true;
    }

    return this.getState();
  }

  computeFactorial(n) {
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  }

  /**
   * Calculate final result when Equals (=) is pressed.
   */
  calculateResult() {
    if (this.hasError) return this.getState();

    let num1, num2, op, exprString;

    if (this.operator !== null && this.previousInput !== null) {
      num1 = parseFloat(this.previousInput);
      num2 = parseFloat(this.currentInput);
      op = this.operator;
      exprString = `${this.previousInput} ${this.operator} ${this.currentInput}`;

      this.lastOperator = op;
      this.lastOperand = this.currentInput;
    } else if (this.lastOperator !== null && this.lastOperand !== null) {
      num1 = parseFloat(this.currentInput);
      num2 = parseFloat(this.lastOperand);
      op = this.lastOperator;
      exprString = `${this.currentInput} ${this.lastOperator} ${this.lastOperand}`;
    } else {
      return this.getState();
    }

    const result = this.executeBinaryOp(num1, op, num2);
    if (result.error) {
      this.hasError = true;
      this.errorMessage = result.error;
      return this.getState();
    }

    const formatted = this.formatNumber(result.value);
    if (formatted === null) {
      this.hasError = true;
      this.errorMessage = 'Calculation error';
      return this.getState();
    }

    // Record into history
    this.addHistoryEntry(exprString, formatted);

    this.currentInput = formatted;
    this.previousInput = null;
    this.operator = null;
    this.overwriteOnNextInput = true;

    return this.getState();
  }

  /**
   * Percentage calculation behavior.
   */
  executePercentage() {
    if (this.hasError) return this.getState();

    const currentVal = parseFloat(this.currentInput);
    if (isNaN(currentVal)) return this.getState();

    let percentVal;
    if (this.previousInput !== null && this.operator !== null) {
      const prevVal = parseFloat(this.previousInput);
      if (this.operator === '+' || this.operator === '−' || this.operator === '-') {
        percentVal = (prevVal * currentVal) / 100;
      } else {
        percentVal = currentVal / 100;
      }
    } else {
      percentVal = currentVal / 100;
    }

    const formatted = this.formatNumber(percentVal);
    if (formatted !== null) {
      this.currentInput = formatted;
    }

    return this.getState();
  }

  /**
   * Backspace entry logic.
   */
  executeBackspace() {
    if (this.hasError) {
      this.reset();
      return this.getState();
    }

    if (this.overwriteOnNextInput) {
      return this.getState();
    }

    if (this.currentInput.length > 1) {
      this.currentInput = this.currentInput.slice(0, -1);
      if (this.currentInput === '-' || this.currentInput === '') {
        this.currentInput = '0';
      }
    } else {
      this.currentInput = '0';
    }

    return this.getState();
  }

  /**
   * Toggle positive/negative sign.
   */
  toggleNegate() {
    if (this.hasError) return this.getState();

    if (this.currentInput !== '0') {
      if (this.currentInput.startsWith('-')) {
        this.currentInput = this.currentInput.slice(1);
      } else {
        this.currentInput = '-' + this.currentInput;
      }
    }

    return this.getState();
  }

  // --- CALCULATION HISTORY MANAGEMENT ---

  addHistoryEntry(expression, result) {
    const entry = {
      id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      expression: expression,
      result: result,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Keep up to 30 history records
    this.history.unshift(entry);
    if (this.history.length > 30) {
      this.history.pop();
    }

    this.saveHistoryToStorage();
  }

  recallHistoryEntry(id) {
    const item = this.history.find(h => h.id === id);
    if (item) {
      this.currentInput = item.result;
      this.overwriteOnNextInput = true;
      this.hasError = false;
      this.errorMessage = null;
    }
    return this.getState();
  }

  clearHistory() {
    this.history = [];
    this.saveHistoryToStorage();
    return this.getState();
  }

  saveHistoryToStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('modern_calc_history', JSON.stringify(this.history));
      }
    } catch (e) {
      // Ignore storage quota / privacy block errors
    }
  }

  loadHistoryFromStorage() {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('modern_calc_history');
        if (stored) {
          this.history = JSON.parse(stored);
        }
      }
    } catch (e) {
      this.history = [];
    }
  }
}
