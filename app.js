(() => {
  'use strict';

  const topics = {
    tables: { title: 'Умножение и деление', short: 'Таблица умножения', mark: '× ÷' },
    small: { title: 'Счёт до 10', short: 'Счёт до 10', mark: '10' },
    tens: { title: 'Круглые десятки', short: 'Круглые десятки', mark: '±10' },
    hundred: { title: 'Счёт до 100', short: 'До 100 без перехода через десяток', mark: '100' }
  };
  const operations = { mul: 'Умножение', div: 'Деление', add: 'Сложение', sub: 'Вычитание', mix: 'Вместе' };
  const modes = { table: 'Одна таблица', mixed: 'Смешанная', master: 'Испытание мастера' };

  function init() {
    const app = document.getElementById('app');
    const modal = document.getElementById('modal');
    const homeMarkup = app.innerHTML;
    const config = { topic: 'tables', op: 'mix', mode: 'mixed', table: 2, count: 10 };
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefs = {
      sound: readPreference('sound', true),
      motion: readPreference('motion', !motionPreference.matches)
    };
    let screen = 'home';
    let scene;
    let round;
    let advanceTimer;
    let pendingAdvance = false;
    let audio;
    let dialogFocus;

    function readPreference(key, fallback) {
      try {
        const value = localStorage.getItem('most-znaniy.' + key);
        return value === 'true' || value === 'false' ? value === 'true' : fallback;
      } catch {
        return fallback;
      }
    }

    function savePreference(key) {
      try { localStorage.setItem('most-znaniy.' + key, String(prefs[key])); }
      catch { /* Preferences still apply to this visit when storage is unavailable. */ }
    }

    function updateControls() {
      document.documentElement.dataset.motion = prefs.motion ? 'on' : 'off';
      for (const [key, name] of [['sound', 'Звук'], ['motion', 'Анимация']]) {
        const enabled = prefs[key];
        document.querySelectorAll('[data-action="' + key + '"]').forEach(button => {
          button.setAttribute('aria-pressed', String(enabled));
          button.setAttribute('aria-label', name);
          button.title = name + (enabled ? ' включ' : ' выключ') + (key === 'sound' ? 'ён' : 'ена');
          const stateLabel = button.querySelector('[data-state-label]');
          if (stateLabel) stateLabel.textContent = enabled ? 'Вкл.' : 'Выкл.';
        });
      }
      const full = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      const supported = (document.fullscreenEnabled && document.documentElement.requestFullscreen)
        || (document.webkitFullscreenEnabled && document.documentElement.webkitRequestFullscreen);
      document.querySelectorAll('[data-action="fullscreen"]').forEach(button => {
        button.hidden = !supported;
        button.setAttribute('aria-pressed', String(full));
        button.title = full ? 'Выйти из полного экрана' : 'На весь экран';
        button.setAttribute('aria-label', button.title);
      });
      if (scene) scene.setMotion(prefs.motion);
    }

    function playSound(kind) {
      if (!prefs.sound) return;
      try {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) return;
        if (!audio) audio = new Audio();
        if (audio.state === 'suspended') audio.resume().catch(() => {});
        const notes = kind === 'finish' ? [392, 494, 587, 784] :
          kind === 'correct' ? [440, 659] : kind === 'retry' ? [294, 262] : [523];
        const start = audio.currentTime;
        notes.forEach((frequency, index) => {
          const oscillator = audio.createOscillator();
          const gain = audio.createGain();
          const t = start + index * 0.105;
          oscillator.type = 'sine';
          oscillator.frequency.value = frequency;
          gain.gain.setValueAtTime(0.0001, t);
          gain.gain.exponentialRampToValueAtTime(0.07, t + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
          oscillator.connect(gain);
          gain.connect(audio.destination);
          oscillator.start(t);
          oscillator.stop(t + 0.2);
          oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
        });
      } catch { /* Audio is optional on browsers with restricted playback. */ }
    }

    function drawScene(done, total) {
      const container = app.querySelector('[data-scene]');
      scene = container ? window.BridgeScene.mount(container) : null;
      if (scene) {
        scene.setMotion(prefs.motion);
        scene.setProgress(done, total, false);
      }
    }

    function setScreen(name, html) {
      clearTimeout(advanceTimer);
      pendingAdvance = false;
      screen = name;
      app.dataset.screen = name;
      scene = null;
      app.innerHTML = html;
    }

    function focusScreen() {
      const heading = app.querySelector('h1') || app.querySelector('h2');
      if (heading) {
        heading.tabIndex = -1;
        heading.focus({ preventScroll: true });
      }
      window.scrollTo(0, 0);
    }

    function showHome() {
      round = null;
      setScreen('home', homeMarkup);
      drawScene(0, config.count);
      updateControls();
      focusScreen();
    }

    function chooseTopic(id) {
      if (!Object.prototype.hasOwnProperty.call(topics, id)) return;
      if (id === 'tables' && !['mix', 'mul', 'div'].includes(config.op)) config.op = 'mix';
      if (id !== 'tables' && !['mix', 'add', 'sub'].includes(config.op)) config.op = 'mix';
      config.topic = id;
    }

    function choice(key, value, label) {
      const selected = String(config[key]) === String(value);
      return '<label class="choice' + (selected ? ' is-selected' : '') + '">' +
        '<input type="radio" name="' + key + '" value="' + value + '"' + (selected ? ' checked' : '') + '>' +
        '<span>' + label + '</span></label>';
    }

    function group(key, legend, entries, kind = '') {
      return '<fieldset class="setting-group"><legend>' + legend + '</legend><div class="choice-list ' + kind + '">' +
        entries.map(([value, label]) => choice(key, value, label)).join('') + '</div></fieldset>';
    }

    function operationDescription() {
      return config.op === 'mix' ?
        (config.topic === 'tables' ? 'Умножение и деление' : 'Сложение и вычитание') : operations[config.op];
    }

    function setup(focusKey, focusValue) {
      round = null;
      const isTables = config.topic === 'tables';
      const allowed = isTables ? ['mul', 'div', 'mix'] : ['add', 'sub', 'mix'];
      const topicEntries = Object.entries(topics).map(([id, topic]) => [id,
        '<b class="topic-mark" aria-hidden="true">' + topic.mark + '</b><span class="topic-name">' + topic.title + '</span>']);
      const summary = isTables ? (config.mode === 'table' ? 'Таблица на ' + config.table : modes[config.mode]) : topics[config.topic].short;
      const route = ['<div><dt>Тема</dt><dd>' + summary + '</dd></div>',
        '<div><dt>Действия</dt><dd>' + operationDescription() + '</dd></div>',
        '<div><dt>Длина моста</dt><dd>' + config.count + ' секций</dd></div>'].join('');
      setScreen('setup', `<section class="screen setup-screen">
        <header class="screen-heading"><p class="eyebrow">Настройка игры</p><h1>Выбери маршрут</h1></header>
        <div class="setup-layout"><div class="setup-panel settings-panel">
          ${group('topic', 'Тема', topicEntries, 'topic-grid')}
          ${group('op', 'Действия', allowed.map(op => [op, operations[op]]))}
          ${isTables ? group('mode', 'Режим', Object.entries(modes)) : ''}
          ${isTables && config.mode === 'table' ? group('table', 'Таблица на число', [2, 3, 4, 5, 6, 7, 8, 9].map(n => [n, n]), 'number-options') : ''}
          ${group('count', 'Сколько примеров?', [5, 10, 15].map(n => [n, n]), 'number-options')}
        </div><aside class="setup-summary">
          <header class="summary-header"><h2>Твоя переправа</h2></header>
          <div class="summary-scene" data-scene></div><dl class="summary-list">${route}</dl>
          <button class="btn primary summary-cta" type="button" data-action="play">Поехали! <span aria-hidden="true">→</span></button>
        </aside></div></section>`);
      drawScene(0, config.count);
      if (!focusKey) focusScreen();
      else app.querySelector('input[name="' + focusKey + '"][value="' + focusValue + '"]')?.focus({ preventScroll: true });
    }

    function begin() {
      const questions = window.BridgeMath.generate({ ...config });
      round = { questions, index: 0, done: 0, firstTry: 0, attempted: false, locked: false };
      const keys = ['1','2','3','4','5','6','7','8','9','clear','0','back'];
      const keypad = keys.map(key => {
        const digit = key.length === 1;
        const label = key === 'clear' ? 'Стереть ответ' : 'Удалить последнюю цифру';
        return `<button type="button" class="key${digit ? '' : ' key-tool'}" data-key="${key}"${digit ? '' : ' aria-label="' + label + '" title="' + label + '"'}>${digit ? key : key === 'clear' ? 'С' : '⌫'}</button>`;
      }).join('');
      setScreen('game', `<section class="screen game-screen">
        <header class="screen-heading"><p class="eyebrow">Игра</p><h1>${topics[config.topic].title}</h1></header>
        <div class="game-layout"><article class="route-card">
          <header class="route-heading"><h2>Переправа</h2><span class="route-count" data-done></span></header>
          <div class="game-scene" data-scene></div>
          <div class="progress"><label for="bridge-progress">Построено секций</label>
          <progress id="bridge-progress" value="0" max="${questions.length}"></progress></div>
        </article><section class="question-card" aria-labelledby="question-label">
          <h2 class="question-label" id="question-label"></h2>
          <div class="equation" id="equation" aria-live="polite" aria-atomic="true"></div>
          <form id="answer-form" autocomplete="off" novalidate>
            <input id="answer" class="answer-input" aria-label="Твой ответ" aria-describedby="equation answer-status"
              placeholder="Ответ" type="text" inputmode="none" pattern="[0-9]*" maxlength="3" spellcheck="false">
            <p class="answer-status" id="answer-status" role="status" aria-live="polite" aria-atomic="true"></p>
            <div class="keypad" aria-label="Цифровая клавиатура">${keypad}</div>
            <button type="submit" class="btn primary" data-action="check">Проверить <span aria-hidden="true">→</span></button>
          </form>
        </section></div></section>`);
      drawScene(0, questions.length);
      updateProgress();
      showQuestion();
      window.scrollTo(0, 0);
    }

    function updateProgress() {
      const total = round.questions.length;
      app.querySelector('[data-done]').textContent = round.done + ' из ' + total;
      app.querySelector('progress').value = round.done;
      scene.setProgress(round.done, total, true);
    }

    function showQuestion() {
      const q = round.questions[round.index];
      const label = app.querySelector('#question-label');
      label.textContent = 'Пример ' + (round.index + 1) + ' из ' + round.questions.length;
      app.querySelector('#equation').textContent = [q.a, q.symbol, q.b, '=', '?'].join(' ');
      const input = app.querySelector('#answer');
      round.attempted = false;
      round.locked = false;
      input.readOnly = false;
      input.value = '';
      input.removeAttribute('aria-invalid');
      app.querySelectorAll('.key, [data-action="check"]').forEach(button => { button.disabled = false; });
      setStatus('', '');
      input.focus({ preventScroll: true });
    }

    function setStatus(message, tone) {
      const status = app.querySelector('#answer-status');
      status.textContent = message;
      status.dataset.tone = tone;
    }

    function advance() {
      if (screen !== 'game' || !round.locked) return;
      if (modal.open) { pendingAdvance = true; return; }
      pendingAdvance = false;
      if (round.done === round.questions.length) finish();
      else { round.index++; showQuestion(); }
    }

    function checkAnswer() {
      if (screen !== 'game' || round.locked || modal.open) return;
      const input = app.querySelector('#answer');
      if (!input.value) {
        setStatus('Введи ответ.', 'hint');
        input.focus({ preventScroll: true });
        return;
      }
      const correct = Number(input.value) === round.questions[round.index].answer;
      if (!correct) {
        round.attempted = true;
        input.setAttribute('aria-invalid', 'true');
        setStatus('Попробуй ещё раз.', 'error');
        playSound('retry');
        input.focus({ preventScroll: true });
        input.select();
        return;
      }
      if (!round.attempted) round.firstTry++;
      round.done++;
      round.locked = true;
      input.readOnly = true;
      app.querySelectorAll('.key, [data-action="check"]').forEach(button => { button.disabled = true; });
      const last = round.done === round.questions.length;
      setStatus(last ? 'Верно! Мост готов.' : 'Верно! Ещё одна секция готова.', 'correct');
      playSound(last ? 'finish' : 'correct');
      updateProgress();
      advanceTimer = setTimeout(advance, last && prefs.motion ? 2400 : 1000);
    }

    function editAnswer(key) {
      if (screen !== 'game' || round.locked || modal.open) return;
      const input = app.querySelector('#answer');
      let start = input.selectionStart ?? input.value.length;
      const end = input.selectionEnd ?? start;
      if (key === 'clear') input.value = '';
      else {
        const insert = key === 'back' ? '' : key;
        if (key === 'back' && start === end) start = Math.max(0, start - 1);
        if (input.value.length - (end - start) + insert.length > 3) return;
        input.setRangeText(insert, start, end, 'end');
      }
      input.removeAttribute('aria-invalid');
      setStatus('', '');
      input.focus({ preventScroll: true });
    }

    function finish() {
      const total = round.questions.length;
      setScreen('success', `<section class="screen success-screen">
        <header class="screen-heading"><p class="eyebrow">Маршрут пройден</p><h1>Мост построен!</h1></header>
        <div class="result-layout"><article class="route-card">
          <header class="route-heading"><h2>Переправа готова</h2><span class="route-count">${total} из ${total}</span></header>
          <div class="game-scene" data-scene></div></article>
          <section class="result-card"><h2>Автобус на другом берегу!</h2>
            <p>Все ${total} секций на месте.</p>
            <p class="result-stat"><strong>${round.firstTry} из ${total}</strong><span>верно с первой попытки</span></p>
            <div class="result-actions">
              <button type="button" class="btn primary" data-action="replay">Сыграть ещё раз <span aria-hidden="true">→</span></button>
              <button type="button" class="btn secondary" data-action="settings">Выбрать другой маршрут</button>
              <button type="button" class="text-btn" data-action="home">На главную</button>
            </div>
          </section></div></section>`);
      drawScene(total, total);
      focusScreen();
    }

    function showDialog(type) {
      if (modal.open) return;
      const help = type === 'help';
      const title = help ? 'Как играть' : 'Закончить игру?';
      const body = help ? `<ol class="rules-list">
          <li>Выбери тему и количество примеров. Каждый пример — одна секция моста.</li>
          <li>Введи ответ с помощью кнопок или клавиатуры и нажми «Проверить». На клавиатуре можно нажать Enter.</li>
          <li>Если ответ неверный, попробуй снова. Когда мост будет готов, автобус переедет на другой берег.</li>
        </ol>` : '<p>Построено секций: ' + round.done + ' из ' + round.questions.length + '. При выходе этот результат сбросится.</p>';
      modal.innerHTML = `<div class="modal-content"><header class="modal-heading"><h2 id="dialog-title">${title}</h2>
        <button type="button" class="modal-close" data-action="close-dialog" aria-label="Закрыть">×</button></header>
        ${body}<div class="modal-actions">
        ${help ? '<button type="button" class="btn primary" data-action="close-dialog" autofocus>Понятно</button>' :
        '<button type="button" class="btn primary" data-action="close-dialog" autofocus>Продолжить игру</button><button type="button" class="btn secondary" data-action="leave">Выйти на главную</button>'}
        </div></div>`;
      modal.setAttribute('aria-labelledby', 'dialog-title');
      dialogFocus = document.activeElement;
      modal.showModal();
    }

    document.addEventListener('click', event => {
      const button = event.target.closest('button, a[data-action]');
      if (!button) return;
      if (button.hasAttribute('data-key')) {
        editAnswer(button.dataset.key);
        return;
      }
      switch (button.dataset.action) {
        case 'start':
          event.preventDefault();
          if (button.dataset.topic) chooseTopic(button.dataset.topic);
          setup();
          break;
        case 'play': case 'replay': begin(); break;
        case 'settings': setup(); break;
        case 'home':
          event.preventDefault();
          if (screen === 'game') showDialog('leave');
          else showHome();
          break;
        case 'help': showDialog('help'); break;
        case 'close-dialog': modal.close(); break;
        case 'leave':
          modal.close();
          showHome();
          break;
        case 'sound': case 'motion': {
          const key = button.dataset.action;
          prefs[key] = !prefs[key];
          savePreference(key);
          updateControls();
          if (key === 'sound' && prefs.sound) playSound('toggle');
          break;
        }
        case 'fullscreen': {
          const full = document.fullscreenElement || document.webkitFullscreenElement;
          try {
            const action = full ? (document.exitFullscreen || document.webkitExitFullscreen).call(document) :
              (document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen).call(document.documentElement);
            if (action?.catch) action.catch(() => {});
          } catch { /* A browser or embedding page can disable fullscreen. */ }
          break;
        }
      }
    });

    modal.addEventListener('click', event => {
      if (event.target !== modal) return;
      const rect = modal.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) modal.close();
    });
    modal.addEventListener('close', () => {
      if (pendingAdvance) advance();
      else if (dialogFocus?.isConnected && screen !== 'home') dialogFocus.focus({ preventScroll: true });
      dialogFocus = null;
    });
    app.addEventListener('change', event => {
      const input = event.target;
      if (screen !== 'setup' || !input.matches('input[type=radio]')) return;
      if (input.name === 'topic') chooseTopic(input.value);
      else if (['count', 'table'].includes(input.name)) config[input.name] = Number(input.value);
      else if (input.name === 'op' || input.name === 'mode') config[input.name] = input.value;
      setup(input.name, input.value);
    });
    app.addEventListener('submit', event => {
      if (event.target.id === 'answer-form') { event.preventDefault(); checkAnswer(); }
    });
    app.addEventListener('input', event => {
      const input = event.target;
      if (input.id !== 'answer' || screen !== 'game' || round.locked) return;
      input.value = input.value.replace(/[^0-9]/g, '').slice(0, 3);
      input.removeAttribute('aria-invalid');
      setStatus('', '');
    });
    document.addEventListener('keydown', event => {
      if (screen !== 'game' || modal.open || round.locked || event.isComposing || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.key === 'Escape' && event.target.id === 'answer') {
        event.preventDefault();
        editAnswer('clear');
      } else if (event.target.id !== 'answer' && /^\d$/.test(event.key)) {
        event.preventDefault();
        editAnswer(event.key);
      } else if (event.target.id !== 'answer' && event.key === 'Backspace') {
        event.preventDefault();
        editAnswer('back');
      }
    });
    document.addEventListener('fullscreenchange', updateControls);
    document.addEventListener('webkitfullscreenchange', updateControls);
    app.dataset.screen = 'home';
    drawScene(0, config.count);
    updateControls();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
