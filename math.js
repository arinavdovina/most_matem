/* Задания для игры «Мост знаний». */
(() => {
  'use strict';

  const operations = {
    add: { symbol: '+', solve: (a, b) => a + b },
    sub: { symbol: '−', solve: (a, b) => a - b },
    mul: { symbol: '×', solve: (a, b) => a * b },
    div: { symbol: '÷', solve: (a, b) => a / b },
  };

  function shuffle(items) {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }

  function question(operation, a, b) {
    const { symbol, solve } = operations[operation];
    return { a, b, symbol, answer: solve(a, b) };
  }

  function tableQuestions(operation, mode, table) {
    const first = mode === 'table' ? table : mode === 'master' ? 6 : 2;
    const last = mode === 'table' ? table : 9;
    const pool = [];
    for (let base = first; base <= last; base++) {
      for (let factor = mode === 'master' ? 6 : 1; factor <= (mode === 'master' ? 9 : 10); factor++) {
        pool.push(operation === 'mul'
          ? question(operation, base, factor)
          : question(operation, base * factor, base));
      }
    }
    return pool;
  }

  function arithmeticQuestions(topic, operation) {
    const limit = topic === 'small' ? 10 : 100;
    const step = topic === 'tens' ? 10 : 1;
    const first = topic === 'hundred' ? 10 : step;
    const pool = [];
    for (let a = first; a <= limit; a += step) {
      for (let b = step; b <= limit; b += step) {
        const item = question(operation, a, b);
        if (item.answer < 0 || item.answer > limit) continue;
        if (topic === 'hundred') {
          // В каждом разряде действие должно выполняться без обмена десятка.
          if (a === 100 || b === 100) continue;
          if (operation === 'add' && (a % 10 + b % 10 > 9 || item.answer === 100)) continue;
          if (operation === 'sub' && a % 10 < b % 10) continue;
        }
        pool.push(item);
      }
    }
    return pool;
  }

  function generate({ topic = 'tables', op = 'mix', mode = 'mixed', table = 2, count = 10 } = {}) {
    const length = [5, 10, 15].includes(Number(count)) ? Number(count) : 10;
    const base = Number(table);
    const selectedTable = Number.isInteger(base) && base >= 2 && base <= 9 ? base : 2;
    const choices = topic === 'tables' ? ['mul', 'div'] : ['add', 'sub'];
    const actions = choices.includes(op) ? [op] : shuffle(choices);
    const pools = {};
    const used = {};
    for (const action of actions) {
      pools[action] = shuffle(topic === 'tables'
        ? tableQuestions(action, mode, selectedTable)
        : arithmeticQuestions(topic, action));
      used[action] = 0;
    }

    const schedule = shuffle(Array.from({ length }, (_, i) => actions[i % actions.length]));
    return schedule.map(action => {
      const pool = pools[action];
      if (used[action] === pool.length) {
        const previous = pool[pool.length - 1];
        shuffle(pool);
        if (pool[0] === previous) [pool[0], pool[1]] = [pool[1], pool[0]];
        used[action] = 0;
      }
      return pool[used[action]++];
    });
  }

  window.BridgeMath = { generate };
})();
