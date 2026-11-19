/* Банк заданий и локальная история игры «Мост знаний». */
(() => {
  'use strict';

  const banks = window.BridgeBanks || (window.BridgeBanks = {});
  const arithmetic = { add: '+', sub: '−', mul: '×', div: '÷' };
  const basicTopics = ['tables', 'small', 'tens', 'hundred'];
  const catalogs = new Map();
  const filters = new Map();

  function word(n, one, few, many) {
    const units = n % 10;
    if (n % 100 >= 11 && n % 100 <= 14) return many;
    if (units === 1) return one;
    return units >= 2 && units <= 4 ? few : many;
  }

  function storyQuestions(op, a, b) {
    const dots = n => n + ' ' + word(n, 'точка', 'точки', 'точек');
    const books = n => n + ' ' + word(n, 'книга', 'книги', 'книг');
    const beads = n => n + ' ' + word(n, 'бусина', 'бусины', 'бусин');
    if (op === 'mul') return [
      `В каждом ряду ${dots(b)}. Рядов — ${a}. Сколько всего точек?`,
      `На один браслет нужно ${b} шт. бусин. Сколько бусин нужно на ${a} ${word(a, 'браслет', 'браслета', 'браслетов')}?`,
    ];
    if (op === 'div') return [
      `На столе ${beads(a)}. На каждый браслет берут по ${b} шт. Сколько браслетов получится?`,
      `На полках ${books(a)}. Полок — ${b}, книг на каждой поровну. Сколько книг на одной полке?`,
    ];
    if (op === 'add') return [
      `На одной полке ${books(a)}, на другой — ${b}. Сколько книг на двух полках?`,
      `На карточке ${dots(a)}. Сколько точек станет, если дорисовать ещё ${b}?`,
    ];
    return [
      `В библиотеке ${books(a)}. Читатели взяли ${b}. Сколько книг осталось?`,
      `В первой коробке ${beads(a)}, во второй — ${b}. На сколько бусин в первой коробке больше, чем во второй?`,
    ];
  }

  function fact(pool, op, a, b, answer, metadata = {}) {
    const symbol = arithmetic[op];
    function add(prompt, value, family, kind = 'formula', extra = {}) {
      pool.push({ prompt, answer: value, kind, family, op, ...metadata, ...extra });
    }
    add(`${a} ${symbol} ${b} = ?`, answer, 'result', 'formula', { a, b, symbol });
    add(`□ ${symbol} ${b} = ${answer}`, a, 'first-operand');
    // A zero operand would allow more than one divisor; divisions here are positive.
    add(`${a} ${symbol} □ = ${answer}`, b, 'second-operand');
    const stories = storyQuestions(op, a, b);
    add(stories[0], answer, 'story', 'text');
    add(stories[1], answer, 'story', 'text');
  }

  banks.tables = () => {
    const result = [];
    for (let table = 2; table <= 9; table++) {
      for (let factor = 1; factor <= 10; factor++) {
        const meta = { table, factor };
        fact(result, 'mul', table, factor, table * factor, meta);
        fact(result, 'div', table * factor, table, factor, meta);
      }
    }
    return result;
  };

  function additionBank(topic) {
    const pool = [];
    const step = topic === 'tens' ? 10 : 1;
    const limit = topic === 'small' ? 10 : 100;
    for (let a = topic === 'hundred' ? 10 : step; a <= limit; a += step) {
      for (let b = step; b <= limit; b += step) {
        if (topic === 'hundred' && (a === 100 || b === 100)) continue;
        const sum = a + b;
        if (sum <= limit && (topic !== 'hundred' || (a % 10 + b % 10 < 10 && sum < 100))) {
          fact(pool, 'add', a, b, sum);
        }
        if (a >= b && (topic !== 'hundred' || a % 10 >= b % 10)) fact(pool, 'sub', a, b, a - b);
      }
    }
    return pool;
  }
  for (const topic of ['small', 'tens', 'hundred']) banks[topic] = () => additionBank(topic);

  // Store the wording once per template. Numeric spellings stay intact, so different
  // questions cannot collide, and a question shared by two topics has one history.
  const prefix = 'most-znaniy.seen.v1.';
  const history = new Map();
  let storage;
  let persistent = false;
  try {
    storage = window.localStorage;
    const testKey = prefix + 'test';
    storage.getItem(testKey);
    try {
      storage.setItem(testKey, '1');
      storage.removeItem(testKey);
      persistent = true;
    } catch { /* A full store can still supply the existing history. */ }
  } catch { storage = null; }

  function location(prompt) {
    const text = prompt.normalize('NFC').replace(/ё/gi, 'е').toLowerCase().replace(/\s+/g, ' ').trim();
    const key = prefix + JSON.stringify(text.split(/[0-9]+/));
    // Digit strings contain neither dots nor spaces, used as separators on disk.
    return { key, id: (text.match(/[0-9]+/g) || []).join('.') || '_' };
  }

  function read(key) {
    let record = history.get(key);
    if (!record) {
      record = { raw: '', ids: new Set(), dirty: false };
      history.set(key, record);
    }
    if (storage && !record.dirty) {
      try {
        const raw = storage.getItem(key) || '';
        if (raw !== record.raw) {
          record.raw = raw;
          record.ids = new Set(raw ? raw.split(' ') : []);
        }
      } catch { storage = null; persistent = false; }
    }
    return record;
  }

  function save(key, record) {
    record.raw = Array.from(record.ids).join(' ');
    record.dirty = true;
    if (!storage || !persistent) return;
    try {
      if (record.raw) storage.setItem(key, record.raw);
      else storage.removeItem(key);
      record.dirty = false;
    } catch { persistent = false; }
  }

  function catalog(topic) {
    if (catalogs.has(topic)) return catalogs.get(topic);
    const items = typeof banks[topic] === 'function' ? banks[topic]() : [];
    const entries = items.map(q => ({ q, ...location(q.prompt) }));
    catalogs.set(topic, entries);
    return entries;
  }

  function bank(config) {
    const { topic = 'tables', op = 'mix', mode = 'mixed', table = 2 } = config;
    const signature = JSON.stringify([topic, op, mode, Number(table)]);
    if (filters.has(signature)) return filters.get(signature);
    const groups = new Map();
    const entries = [];
    for (const item of catalog(topic)) {
      const { q, key, id } = item;
      if (basicTopics.includes(topic) && op !== 'mix' && q.op !== op) continue;
      if (topic === 'tables' && mode === 'table' && q.table !== Number(table)) continue;
      if (topic === 'tables' && mode === 'master' && (q.table < 6 || q.factor < 6 || q.factor > 9)) continue;
      if (!groups.has(key)) groups.set(key, new Set());
      const ids = groups.get(key);
      if (ids.has(id)) continue;
      ids.add(id);
      entries.push(item);
    }
    const result = { groups, entries };
    filters.set(signature, result);
    return result;
  }

  function available(selected) {
    // One read per wording, even when thousands of numeric variants share it.
    const seen = new Map();
    for (const key of selected.groups.keys()) seen.set(key, read(key).ids);
    return selected.entries.filter(item => !seen.get(item.key).has(item.id));
  }

  function stats(config = {}) {
    const selected = bank(config);
    const remaining = available(selected).length;
    return { size: selected.entries.length, remaining, persistent };
  }

  function reset(config = {}) {
    const selected = bank(config);
    for (const [key, ids] of selected.groups) {
      const record = read(key);
      let changed = false;
      for (const id of ids) if (record.ids.delete(id)) changed = true;
      if (changed) save(key, record);
    }
    return stats(config);
  }

  function shuffle(items) {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    return items;
  }

  // Cycle through available operations, and through the task families within each.
  // Empty groups drop out, so a nearly exhausted bank can still finish a round.
  function makeQueue(items) {
    return { items: shuffle(items), cursor: 0 };
  }

  function take(queue, draw) {
    while (queue.items.length) {
      const current = queue.items[queue.cursor];
      const next = draw(current);
      if (next) {
        queue.cursor = (queue.cursor + 1) % queue.items.length;
        return next;
      }
      queue.items.splice(queue.cursor, 1);
      if (queue.cursor === queue.items.length) queue.cursor = 0;
    }
    return null;
  }

  function start(config = {}) {
    const unseen = available(bank(config));
    const limit = Number(config.count ?? 10);
    const total = Math.min(Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 10, unseen.length);
    const byOp = new Map();
    for (const item of unseen) {
      const { op = '', family = 'main' } = item.q;
      if (!byOp.has(op)) byOp.set(op, new Map());
      const groups = byOp.get(op);
      if (!groups.has(family)) groups.set(family, []);
      groups.get(family).push(item);
    }
    const actions = makeQueue(Array.from(byOp.values(), groups => makeQueue(Array.from(groups.values(), shuffle))));
    let drawn = 0;
    function next() {
      if (drawn >= total) return null;
      const item = take(actions, families => take(families, pool => {
        while (pool.length) {
          const candidate = pool.pop();
          const record = read(candidate.key); // Re-read here in case another tab drew it.
          if (record.ids.has(candidate.id)) continue;
          record.ids.add(candidate.id);
          save(candidate.key, record);
          return candidate;
        }
        return null;
      }));
      if (!item) return null;
      drawn++;
      return item.q;
    }
    return { total, next };
  }

  window.BridgeMath = { start, stats, reset };
})();
