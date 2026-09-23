/**
 * js/app.js - Application & DOM Controller Entry Point
 * Wires DOM events, mode toggling, scientific function pad, calculation history drawer,
 * keyboard shortcuts, and connects to CalculatorEngine.
 */

import { CalculatorEngine } from './engine.js';

document.addEventListener('DOMContentLoaded', () => {
  const engine = new CalculatorEngine();

  // DOM Element References - Display & Card
  const calcCard = document.querySelector('.calculator-card');
  const expressionDisplay = document.getElementById('expression-display');
  const resultDisplay = document.getElementById('result-display');
  const angleIndicator = document.getElementById('angle-mode-indicator');
  const angleBtnText = document.getElementById('angle-btn-text');
  const scientificPad = document.getElementById('scientific-pad');
  const keypad = document.querySelector('.keypad-container');
  const operatorButtons = document.querySelectorAll('.btn-operator');

  // Mode Toggle References
  const btnModeStandard = document.getElementById('btn-mode-standard');
  const btnModeScientific = document.getElementById('btn-mode-scientific');

  // History Drawer References
  const btnToggleHistory = document.getElementById('btn-toggle-history');
  const historyDrawer = document.getElementById('history-drawer');
  const historyOverlay = document.getElementById('history-overlay');
  const btnCloseHistory = document.getElementById('btn-close-history');
  const btnClearHistory = document.getElementById('btn-clear-history');
  const historyList = document.getElementById('history-list');
  const historyEmpty = document.getElementById('history-empty');
  const historyBadge = document.getElementById('history-badge');

  /**
   * Adjust font size dynamically based on length of result string.
   */
  function adjustFontSize(text) {
    const length = text ? text.length : 0;
    if (length > 14) {
      resultDisplay.style.fontSize = '1.35rem';
    } else if (length > 11) {
      resultDisplay.style.fontSize = '1.75rem';
    } else if (length > 8) {
      resultDisplay.style.fontSize = '2.1rem';
    } else {
      resultDisplay.style.fontSize = ''; // Default CSS size (2.5rem)
    }
  }

  /**
   * Highlight active operator button.
   */
  function updateOperatorHighlights(activeOp, isWaitingForOperand) {
    operatorButtons.forEach((btn) => {
      const btnOp = btn.dataset.value;
      if (isWaitingForOperand && activeOp && (btnOp === activeOp || normalizeOp(btnOp) === normalizeOp(activeOp))) {
        btn.classList.add('active-op');
      } else {
        btn.classList.remove('active-op');
      }
    });
  }

  function normalizeOp(op) {
    if (op === '*' || op === 'x' || op === 'X') return '×';
    if (op === '/') return '÷';
    if (op === '-') return '−';
    return op;
  }

  /**
   * Update entire DOM state from engine snapshot.
   */
  function updateDisplay() {
    const state = engine.getState();

    // Mode UI Update
    if (state.mode === 'scientific') {
      calcCard.classList.add('mode-scientific');
      scientificPad.classList.remove('hidden');
      angleIndicator.classList.remove('hidden');
      angleIndicator.textContent = state.angleMode;
      if (angleBtnText) angleBtnText.textContent = state.angleMode;
      btnModeScientific.classList.add('active');
      btnModeStandard.classList.remove('active');
    } else {
      calcCard.classList.remove('mode-scientific');
      scientificPad.classList.add('hidden');
      angleIndicator.classList.add('hidden');
      btnModeStandard.classList.add('active');
      btnModeScientific.classList.remove('active');
    }

    // Handle Error State
    if (state.hasError) {
      resultDisplay.textContent = state.errorMessage || 'Error';
      resultDisplay.classList.add('has-error');
      expressionDisplay.textContent = '';
      adjustFontSize(state.errorMessage || 'Error');
      updateOperatorHighlights(null, false);
      renderHistoryList(state.history);
      return;
    }

    // Normal Display
    resultDisplay.classList.remove('has-error');
    resultDisplay.textContent = state.currentInput;
    adjustFontSize(state.currentInput);

    if (state.previousInput !== null && state.operator !== null) {
      expressionDisplay.textContent = `${state.previousInput} ${state.operator}`;
    } else {
      expressionDisplay.textContent = '';
    }

    updateOperatorHighlights(state.operator, state.overwriteOnNextInput && state.previousInput !== null);
    renderHistoryList(state.history);
  }

  /**
   * Render History Drawer List Items
   */
  function renderHistoryList(history) {
    historyBadge.textContent = history.length;

    if (history.length === 0) {
      historyEmpty.classList.remove('hidden');
      historyList.innerHTML = '';
      return;
    }

    historyEmpty.classList.add('hidden');
    historyList.innerHTML = history.map(item => `
      <li class="history-item" data-id="${item.id}" title="Click to load result">
        <span class="history-item-expr">${escapeHtml(item.expression)} =</span>
        <span class="history-item-res">${escapeHtml(item.result)}</span>
      </li>
    `).join('');
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /**
   * Tactile press animation
   */
  function triggerButtonFeedback(btn) {
    if (!btn) return;
    btn.classList.add('btn-pressed');
    setTimeout(() => {
      btn.classList.remove('btn-pressed');
    }, 120);
  }

  /**
   * Find matching DOM button for keyboard shortcut
   */
  function findButtonForKey(action, value) {
    if (value) {
      return document.querySelector(`.btn[data-action="${action}"][data-value="${value}"]`) ||
             document.querySelector(`.btn[data-value="${value}"]`);
    }
    return document.querySelector(`.btn[data-action="${action}"]`);
  }

  // --- MODE SWITCHING LISTENERS ---
  btnModeStandard.addEventListener('click', () => {
    engine.setMode('standard');
    updateDisplay();
  });

  btnModeScientific.addEventListener('click', () => {
    engine.setMode('scientific');
    updateDisplay();
  });

  // --- HISTORY DRAWER LISTENERS ---
  function openHistory() {
    historyDrawer.classList.remove('hidden');
    historyOverlay.classList.remove('hidden');
  }

  function closeHistory() {
    historyDrawer.classList.add('hidden');
    historyOverlay.classList.add('hidden');
  }

  btnToggleHistory.addEventListener('click', openHistory);
  btnCloseHistory.addEventListener('click', closeHistory);
  historyOverlay.addEventListener('click', closeHistory);

  btnClearHistory.addEventListener('click', () => {
    engine.clearHistory();
    updateDisplay();
  });

  // Recall item from history on click
  historyList.addEventListener('click', (event) => {
    const itemEl = event.target.closest('.history-item');
    if (!itemEl) return;
    const id = itemEl.dataset.id;
    engine.recallHistoryEntry(id);
    updateDisplay();
    closeHistory();
  });

  // --- KEYPAD ACTION DELEGATION ---
  function handleButtonClick(event) {
    const button = event.target.closest('button');
    if (!button) return;

    triggerButtonFeedback(button);

    const action = button.dataset.action;
    const value = button.dataset.value;

    processAction(action, value);
  }

  if (keypad) keypad.addEventListener('click', handleButtonClick);
  if (scientificPad) scientificPad.addEventListener('click', handleButtonClick);

  // --- GLOBAL KEYBOARD SHORTCUTS ---
  document.addEventListener('keydown', (event) => {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

    const key = event.key;
    let action = null;
    let value = null;

    if (key >= '0' && key <= '9') {
      action = 'number';
      value = key;
    } else if (key === '.' || key === ',') {
      action = 'decimal';
      value = '.';
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
      action = 'operator';
      value = normalizeOp(key);
    } else if (key === '^') {
      action = 'operator';
      value = '^';
    } else if (key === '%') {
      action = 'percent';
    } else if (key === 'Enter' || key === '=') {
      event.preventDefault();
      action = 'equals';
    } else if (key === 'Backspace') {
      action = 'backspace';
    } else if (key === 'Escape') {
      action = 'clear';
    } else if (key === '(' || key === ')') {
      action = 'number';
      value = key;
    } else if (key.toLowerCase() === 'h') {
      if (historyDrawer.classList.contains('hidden')) openHistory();
      else closeHistory();
      return;
    }

    if (action) {
      const matchedBtn = findButtonForKey(action, value);
      triggerButtonFeedback(matchedBtn);
      processAction(action, value);
    }
  });

  /**
   * Action Router to Engine API
   */
  function processAction(action, value) {
    switch (action) {
      case 'number':
        engine.inputDigit(value);
        break;
      case 'decimal':
        engine.inputDecimal();
        break;
      case 'operator':
        engine.inputOperator(value);
        break;
      case 'sci-func':
        engine.executeScientificFunc(value);
        break;
      case 'constant':
        engine.inputConstant(value);
        break;
      case 'angle-toggle':
        engine.toggleAngleMode();
        break;
      case 'clear':
        engine.reset();
        break;
      case 'backspace':
        engine.executeBackspace();
        break;
      case 'negate':
        engine.toggleNegate();
        break;
      case 'percent':
        engine.executePercentage();
        break;
      case 'equals':
        engine.calculateResult();
        break;
      default:
        break;
    }

    updateDisplay();
  }

  // Initial UI Render
  updateDisplay();
});
