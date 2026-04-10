(() => {
  'use strict';

  const expressionEl = document.getElementById('expression');
  const displayEl = document.getElementById('display');
  const keypad = document.querySelector('.keypad');

  const operators = new Set(['+', '-', '*', '/']);
  const maxChars = 24;

  const state = {
    expression: '0',
    result: '0',
    justEvaluated: false,
    error: false,
  };

  function updateView() {
    expressionEl.textContent = state.expression;
    displayEl.textContent = state.result;
    displayEl.classList.toggle('is-error', state.error);
  }

  function sanitizeExpression(expression) {
    return expression.replace(/×/g, '*').replace(/÷/g, '/');
  }

  function formatNumber(value) {
    if (value === 'Error') return value;
    if (!Number.isFinite(value)) return 'Error';
    const normalized = Math.abs(value) < 1e-12 ? 0 : value;
    const output = Number.parseFloat(normalized.toPrecision(12)).toString();
    return output;
  }

  function evaluateExpression(expression) {
    const sanitized = sanitizeExpression(expression);

    if (!/^[0-9+\-*/.\s]+$/.test(sanitized)) {
      throw new Error('Invalid characters');
    }

    if (/([+\-*/]){2,}/.test(sanitized.replace(/^-/, ''))) {
      throw new Error('Malformed expression');
    }

    // Evaluate only sanitized arithmetic input.
    const value = Function(`"use strict"; return (${sanitized});`)();

    if (!Number.isFinite(value)) {
      throw new Error('Math error');
    }

    return formatNumber(value);
  }

  function setError(message = 'Error') {
    state.result = message;
    state.error = true;
    updateView();
  }

  function clearAll() {
    state.expression = '0';
    state.result = '0';
    state.error = false;
    state.justEvaluated = false;
    updateView();
  }

  function isLastCharOperator() {
    return operators.has(state.expression.slice(-1));
  }

  function appendDigit(digit) {
    if (state.error) {
      clearAll();
    }

    if (state.justEvaluated) {
      state.expression = digit;
      state.result = digit;
      state.justEvaluated = false;
      updateView();
      return;
    }

    if (state.expression === '0') {
      state.expression = digit;
    } else if (state.expression.length < maxChars) {
      state.expression += digit;
    }

    state.result = state.expression;
    updateView();
  }

  function appendDecimal() {
    if (state.error) {
      clearAll();
    }

    if (state.justEvaluated) {
      state.expression = '0.';
      state.result = '0.';
      state.justEvaluated = false;
      updateView();
      return;
    }

    const currentChunk = state.expression.split(/[+\-*/]/).pop();
    if (currentChunk.includes('.')) return;

    if (isLastCharOperator()) {
      state.expression += '0.';
    } else if (state.expression === '0') {
      state.expression = '0.';
    } else if (state.expression.length < maxChars) {
      state.expression += '.';
    }

    state.result = state.expression;
    updateView();
  }

  function appendOperator(operator) {
    if (state.error) return;

    if (state.justEvaluated) {
      state.expression = state.result;
      state.justEvaluated = false;
    }

    if (isLastCharOperator()) {
      state.expression = state.expression.slice(0, -1) + operator;
    } else if (state.expression.length < maxChars) {
      state.expression += operator;
    }

    updateView();
  }

  function backspace() {
    if (state.error || state.justEvaluated) {
      clearAll();
      return;
    }

    if (state.expression.length <= 1) {
      state.expression = '0';
      state.result = '0';
    } else {
      state.expression = state.expression.slice(0, -1);
      state.result = state.expression;
    }

    state.error = false;
    updateView();
  }

  function calculate() {
    if (state.error) return;

    const expression = state.expression;
    if (isLastCharOperator()) {
      setError('Incomplete expression');
      return;
    }

    try {
      const value = evaluateExpression(expression);
      state.result = value;
      state.expression = expression;
      state.error = false;
      state.justEvaluated = true;
      updateView();
    } catch {
      setError('Invalid expression');
    }
  }

  function handleAction(action, value) {
    switch (action) {
      case 'digit':
        appendDigit(value);
        break;
      case 'decimal':
        appendDecimal();
        break;
      case 'operator':
        appendOperator(value);
        break;
      case 'backspace':
        backspace();
        break;
      case 'clear':
        clearAll();
        break;
      case 'equals':
        calculate();
        break;
      default:
        break;
    }
  }

  keypad.addEventListener('click', event => {
    const button = event.target.closest('.key');
    if (!button) return;
    handleAction(button.dataset.action, button.dataset.value);
  });

  document.addEventListener('keydown', event => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;

    const { key } = event;
    if (/^[0-9]$/.test(key)) {
      event.preventDefault();
      appendDigit(key);
      return;
    }

    if (operators.has(key)) {
      event.preventDefault();
      appendOperator(key);
      return;
    }

    if (key === '.') {
      event.preventDefault();
      appendDecimal();
      return;
    }

    if (key === 'Enter' || key === '=') {
      event.preventDefault();
      calculate();
      return;
    }

    if (key === 'Backspace') {
      event.preventDefault();
      backspace();
      return;
    }

    if (key === 'Escape' || key.toLowerCase() === 'c') {
      event.preventDefault();
      clearAll();
    }
  });

  updateView();
})();
