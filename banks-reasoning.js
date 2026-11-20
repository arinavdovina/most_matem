/* Банк задач на закономерности, отношения между числами и порядок действий. */
(() => {
  'use strict';

  const banks = (window.BridgeBanks ||= {});
  const formula = (family, prompt, answer) => ({ family, prompt, answer, kind: 'formula' });
  const text = (family, prompt, answer) => ({ family, prompt, answer, kind: 'text' });

  banks.patterns = function patterns() {
    const tasks = [];
    for (const step of [2, 3, 4, 5, 6, 8, 9, 10, 20]) {
      for (let start = 1; start <= 12; start++) {
        const numbers = Array.from({ length: 5 }, (_, i) => start + i * step);
        const [a, b, c, d, e] = numbers;
        tasks.push(text('Равные шаги вперёд', 'Каждый раз прибавляют одно и то же число. Продолжи ряд: ' + [a, b, c, d, '□'].join(', ') + '.', e));
        tasks.push(text('Равные шаги назад', 'Каждый раз вычитают одно и то же число. Какое число пропущено? ' + [e, d, '□', b, a].join(', '), c));
      }
    }
    for (let first = 1; first <= 16; first++) {
      for (let step = 1; step <= 6; step++) {
        const next = first + step;
        const third = next + step + 1;
        const fourth = third + step + 2;
        tasks.push(text('Растущий шаг', 'Каждый новый шаг на 1 больше предыдущего. Продолжи ряд: ' +
          [first, next, third, fourth, '□'].join(', ') + '.', fourth + step + 3));
        // Два разных шага повторяются парами. Видны две полные пары шагов.
        const other = step + 2;
        const pair = step + other;
        tasks.push(text('Два шага по очереди', 'По очереди прибавляют два разных числа. Продолжи ряд: ' +
          [first, next, first + pair, next + pair, first + 2 * pair, '□'].join(', ') + '.', next + 2 * pair));
      }
    }
    for (const factor of [2, 3]) {
      for (let start = 1; start <= 12; start++) {
        tasks.push(text('Умножение по цепочке', 'Каждый раз число умножают на один и тот же множитель. Заполни окошко: ' +
          [start, start * factor, '□', start * factor ** 3].join(', ') + '.', start * factor ** 2));
      }
    }
    return tasks;
  };

  banks.equations = function equations() {
    const tasks = [];
    for (let known = 3; known <= 17; known++) {
      for (let missing = 4; missing <= 25; missing += 3) {
        const whole = known + missing;
        tasks.push(formula('Неизвестное слагаемое', '□ + ' + known + ' = ' + whole, missing));
        tasks.push(formula('Неизвестное вычитаемое', whole + ' − □ = ' + known, missing));
        tasks.push(formula('Неизвестное уменьшаемое', '□ − ' + known + ' = ' + missing, whole));
      }
    }
    for (let known = 2; known <= 9; known++) {
      for (let missing = 2; missing <= 10; missing++) {
        const whole = known * missing;
        tasks.push(formula('Неизвестный множитель', known + ' × □ = ' + whole, missing));
        tasks.push(formula('Неизвестный делитель', whole + ' ÷ □ = ' + known, missing));
        tasks.push(formula('Неизвестное делимое', '□ ÷ ' + known + ' = ' + missing, whole));
      }
    }
    return tasks;
  };

  banks.comparison = function comparison() {
    const tasks = [];
    function compare(family, leftText, leftValue, rightText, rightValue) {
      const answer = leftValue < rightValue ? '<' : leftValue > rightValue ? '>' : '=';
      tasks.push({
        ...formula(family, leftText + ' □ ' + rightText, answer),
        options: ['<', '=', '>']
      });
    }
    for (let a = 14; a <= 22; a++) {
      for (let b = 3; b <= 9; b++) {
        for (const offset of [-2, 0, 2]) {
          const c = a - 3;
          const d = b + 3 + offset;
          compare('Две суммы', a + ' + ' + b, a + b, c + ' + ' + d, c + d);
          const extra = 5 + b;
          const term = a - b + offset;
          compare('Разность и сумма', (a + extra) + ' − ' + extra, a, b + ' + ' + term, b + term);
        }
      }
    }
    for (let a = 2; a <= 9; a++) {
      for (let b = 2; b <= 9; b++) {
        for (const offset of [-1, 0, 1]) {
          const lastGroup = a + offset;
          compare('Произведение и группы', a + ' × ' + b, a * b,
            a + ' × ' + (b - 1) + ' + ' + lastGroup, a * (b - 1) + lastGroup);
          const whole = a + b + offset;
          compare('Частное и разность', (a * b) + ' ÷ ' + a, b, whole + ' − ' + a, whole - a);
        }
      }
    }
    return tasks;
  };

  banks.place = function place() {
    const tasks = [];
    // Каждый разряд представлен разными цифрами, включая ноль в десятках и единицах.
    for (let hundreds = 1; hundreds <= 9; hundreds++) {
      for (let tens = 0; tens <= 9; tens++) {
        const ones = (hundreds * 3 + tens * 7) % 10;
        const number = hundreds * 100 + tens * 10 + ones;
        tasks.push(text('Цифра в разряде', 'Какая цифра стоит в разряде десятков в числе ' + number + '?', tens));
        tasks.push(text('Полные десятки', 'Сколько полных десятков в числе ' + number + '?', Math.floor(number / 10)));
        tasks.push(text('Сборка числа', 'Запиши число по разрядам: сотен — ' + hundreds + ', десятков — ' + tens + ', единиц — ' + ones + '.', number));
        const newTens = (tens + 4) % 10;
        tasks.push(text('Замена цифры', 'В числе ' + number + ' замени цифру десятков на ' + newTens + '. Какое число получится?',
          hundreds * 100 + newTens * 10 + ones));
        if (tens > 0) {
          tasks.push(text('Разрядное слагаемое', 'Сколько единиц обозначает цифра ' + tens + ' в разряде десятков числа ' + number + '?', tens * 10));
        }
      }
    }
    for (let thousands = 1; thousands <= 9; thousands++) {
      for (let hundreds = 0; hundreds <= 9; hundreds++) {
        const tail = (thousands * 17 + hundreds * 9) % 100;
        const number = thousands * 1000 + hundreds * 100 + tail;
        tasks.push(text('Полные сотни', 'Сколько полных сотен в числе ' + number + '?', Math.floor(number / 100)));
      }
    }
    return tasks;
  };

  banks.order = function order() {
    const tasks = [];
    for (let a = 2; a <= 9; a++) {
      for (let b = 2; b <= 10; b++) {
        const c = 2 + (a + b) % 7;
        const product = a * b;
        tasks.push(formula('Умножение перед сложением', c + ' + ' + a + ' × ' + b + ' = ?', c + product));
        tasks.push(formula('Умножение перед вычитанием', (product + c) + ' − ' + a + ' × ' + b + ' = ?', c));
        tasks.push(formula('Деление перед вычитанием', (a + b + c) + ' − ' + product + ' ÷ ' + a + ' = ?', a + c));
        tasks.push(formula('Скобки перед умножением', '(' + a + ' + ' + b + ') × ' + c + ' = ?', (a + b) * c));
        tasks.push(formula('Скобки перед делением', '(' + (product + c) + ' − ' + c + ') ÷ ' + a + ' = ?', b));
        tasks.push(formula('Слева направо', product + ' ÷ ' + a + ' × ' + c + ' = ?', b * c));
      }
    }
    return tasks;
  };
})();
