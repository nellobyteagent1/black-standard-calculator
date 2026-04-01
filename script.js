(function () {
  'use strict';

  const display = document.getElementById('result');
  const expr = document.getElementById('expression');

  let current = '0';
  let previous = '';
  let operator = null;
  let shouldReset = false;
  let lastResult = null;

  const OP_DISPLAY = { '/': ' \u00F7 ', '*': ' \u00D7 ', '-': ' \u2212 ', '+': ' + ' };

  function formatNumber(n) {
    if (n === 'Error') return 'Error';
    const num = parseFloat(n);
    if (isNaN(num)) return '0';
    if (Number.isInteger(num) && !n.includes('.')) {
      return num.toLocaleString('en-US');
    }
    const parts = n.split('.');
    return parseFloat(parts[0]).toLocaleString('en-US') + '.' + (parts[1] || '');
  }

  function updateDisplay() {
    display.textContent = formatNumber(current);
    display.classList.toggle('shrink', current.length > 10);
  }

  function updateExpression() {
    if (previous && operator) {
      expr.textContent = formatNumber(previous) + OP_DISPLAY[operator];
    } else {
      expr.textContent = '';
    }
  }

  function clearActiveOp() {
    document.querySelectorAll('.btn.op').forEach(function (b) {
      b.classList.remove('active-op');
    });
  }

  function setActiveOp(op) {
    clearActiveOp();
    document.querySelectorAll('.btn.op').forEach(function (b) {
      if (b.dataset.value === op) b.classList.add('active-op');
    });
  }

  function calculate(a, b, op) {
    var x = parseFloat(a);
    var y = parseFloat(b);
    if (isNaN(x) || isNaN(y)) return 'Error';
    var r;
    switch (op) {
      case '+': r = x + y; break;
      case '-': r = x - y; break;
      case '*': r = x * y; break;
      case '/':
        if (y === 0) return 'Error';
        r = x / y;
        break;
      default: return 'Error';
    }
    var s = parseFloat(r.toPrecision(12)).toString();
    return s;
  }

  function inputNumber(val) {
    clearActiveOp();
    if (current === 'Error') current = '0';
    if (shouldReset) {
      current = val;
      shouldReset = false;
    } else {
      if (current.replace(/[^0-9]/g, '').length >= 15) return;
      current = current === '0' ? val : current + val;
    }
    updateDisplay();
  }

  function inputDecimal() {
    clearActiveOp();
    if (shouldReset) {
      current = '0.';
      shouldReset = false;
    } else if (!current.includes('.')) {
      current += '.';
    }
    updateDisplay();
  }

  function inputOperator(op) {
    if (current === 'Error') return;
    if (operator && !shouldReset) {
      var result = calculate(previous, current, operator);
      current = result;
      updateDisplay();
      previous = result;
    } else {
      previous = current;
    }
    operator = op;
    shouldReset = true;
    setActiveOp(op);
    updateExpression();
  }

  function inputEquals() {
    clearActiveOp();
    if (!operator || current === 'Error') return;
    var expression = formatNumber(previous) + OP_DISPLAY[operator] + formatNumber(current);
    var result = calculate(previous, current, operator);
    expr.textContent = expression + ' =';
    current = result;
    lastResult = result;
    previous = '';
    operator = null;
    shouldReset = true;
    updateDisplay();
  }

  function inputClear() {
    current = '0';
    previous = '';
    operator = null;
    shouldReset = false;
    lastResult = null;
    clearActiveOp();
    updateDisplay();
    updateExpression();
  }

  function inputDelete() {
    if (shouldReset || current === 'Error') {
      current = '0';
      shouldReset = false;
    } else {
      current = current.length > 1 ? current.slice(0, -1) : '0';
    }
    updateDisplay();
  }

  function inputPercent() {
    if (current === 'Error') return;
    var num = parseFloat(current);
    if (isNaN(num)) return;
    current = (num / 100).toString();
    updateDisplay();
  }

  function inputSign() {
    if (current === 'Error' || current === '0') return;
    if (current.startsWith('-')) {
      current = current.slice(1);
    } else {
      current = '-' + current;
    }
    updateDisplay();
  }

  // Button clicks
  document.querySelector('.buttons').addEventListener('click', function (e) {
    var btn = e.target.closest('.btn');
    if (!btn) return;
    var action = btn.dataset.action;
    btn.classList.add('active');
    setTimeout(function () { btn.classList.remove('active'); }, 120);

    switch (action) {
      case 'number': inputNumber(btn.dataset.value); break;
      case 'decimal': inputDecimal(); break;
      case 'operator': inputOperator(btn.dataset.value); break;
      case 'equals': inputEquals(); break;
      case 'clear': inputClear(); break;
      case 'delete': inputDelete(); break;
      case 'percent': inputPercent(); break;
      case 'sign': inputSign(); break;
    }
  });

  // Keyboard support
  document.addEventListener('keydown', function (e) {
    var key = e.key;
    if (key >= '0' && key <= '9') { e.preventDefault(); inputNumber(key); }
    else if (key === '.') { e.preventDefault(); inputDecimal(); }
    else if (key === '+') { e.preventDefault(); inputOperator('+'); }
    else if (key === '-') { e.preventDefault(); inputOperator('-'); }
    else if (key === '*') { e.preventDefault(); inputOperator('*'); }
    else if (key === '/') { e.preventDefault(); inputOperator('/'); }
    else if (key === 'Enter' || key === '=') { e.preventDefault(); inputEquals(); }
    else if (key === 'Escape') { e.preventDefault(); inputClear(); }
    else if (key === 'Backspace') { e.preventDefault(); inputDelete(); }
    else if (key === '%') { e.preventDefault(); inputPercent(); }
  });

  updateDisplay();
})();
