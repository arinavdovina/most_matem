(() => {
  'use strict';

  const { topics, groups } = window.BridgeCatalog;
  const arithmetic = new Set(['small', 'tens', 'hundred', 'tables']);
  const wholeNumber = new Intl.NumberFormat('ru-RU');
  const formatCount = n => wholeNumber.format(n);
  const operations = { mul: 'Умножение', div: 'Деление', add: 'Сложение', sub: 'Вычитание', mix: 'Вместе' };
  const modes = { table: 'Одна таблица', mixed: 'Смешанная', master: 'Испытание мастера' };

  function init() {
    const app = document.getElementById('app');
    const modal = document.getElementById('modal');
    const homeMarkup = app.innerHTML;
    let catalogGroup = 'all';
    const config = { topic: 'patterns', op: 'mix', mode: 'mixed', table: 2, count: 10 };
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

    function showCatalog() {
      const filters = app.querySelector('[data-filters]');
      if (!filters) return;
      const choices = [['all', 'Все темы'], ...Object.entries(groups)];
      filters.replaceChildren(...choices.map(([id, name]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'filter-chip';
        button.dataset.group = id;
        button.setAttribute('aria-pressed', String(id === catalogGroup));
        button.textContent = name;
        return button;
      }));
      const cards = app.querySelector('[data-catalog]');
      cards.innerHTML = Object.entries(topics)
        .filter(([, topic]) => catalogGroup === 'all' || topic.group === catalogGroup)
        .map(([id, topic]) => `<button type="button" class="topic-card category-${topic.group}" data-action="start" data-topic="${id}">
          <span class="card-top"><span class="topic-stamp" aria-hidden="true">${topic.mark}</span><span aria-hidden="true">↗</span></span>
          <strong>${topic.title}</strong><span class="card-foot">${topic.example}</span></button>`).join('');
    }

    function showHome() {
      round = null;
      setScreen('home', homeMarkup);
      showCatalog();
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
      const options = Object.entries(groups).map(([groupId, groupTitle]) =>
        `<optgroup label="${groupTitle}">` + Object.entries(topics)
          .filter(([, topic]) => topic.group === groupId)
          .map(([id, topic]) => `<option value="${id}" ${id === config.topic ? 'selected' : ''}>${topic.title}</option>`).join('') +
        '</optgroup>').join('');
      const bank = window.BridgeMath.stats(config);
      const actualCount = Math.min(config.count, bank.remaining);
      const route = [
        `<div><dt>Тема</dt><dd>${topics[config.topic].title}</dd></div>`,
        ...(arithmetic.has(config.topic) ? [`<div><dt>Действия</dt><dd>${operationDescription()}</dd></div>`] : []),
        ...(isTables ? [`<div><dt>Режим</dt><dd>${config.mode === 'table' ? 'Таблица на ' + config.table : modes[config.mode]}</dd></div>`] : []),
        `<div><dt>Новых заданий</dt><dd data-bank-remaining>${formatCount(bank.remaining)} из ${formatCount(bank.size)}</dd></div>`
      ].join('');
      const info = !actualCount ? 'Все задания с этими настройками уже встречались. Выбери другую тему или начни этот набор заново.' :
        actualCount < config.count ? `В наборе осталось заданий: ${actualCount}. Именно столько секций будет в этом раунде.` :
        'За каждый верный ответ появится одна секция моста.';
      const storageNote = bank.persistent ? 'Игра запоминает показанные задания в этом браузере.' :
        'Браузер отключил сохранение. История доступна, пока открыта эта страница.';
      setScreen('setup', `<section class="screen setup-screen">
        <header class="screen-heading"><p class="eyebrow">Настройка игры</p><h1>Выбери маршрут</h1></header>
        <div class="setup-layout"><div class="setup-panel settings-panel">
          <div class="setting-group"><label class="select-label" for="topic-select">Тема</label>
            <select id="topic-select" name="topic">${options}</select></div>
          ${arithmetic.has(config.topic) ? group('op', 'Действия', allowed.map(op => [op, operations[op]])) : ''}
          ${isTables ? group('mode', 'Режим', Object.entries(modes)) : ''}
          ${isTables && config.mode === 'table' ? group('table', 'Таблица на число', [2, 3, 4, 5, 6, 7, 8, 9].map(n => [n, n]), 'number-options') : ''}
          ${group('count', 'Сколько заданий?', [5, 10, 15].map(n => [n, n]), 'number-options')}
        </div><aside class="setup-summary">
          <header class="summary-header"><h2>Твоя переправа</h2></header>
          <div class="summary-scene" data-scene></div><dl class="summary-list">${route}</dl>
          <p class="bank-info">${info}</p>
          ${actualCount ? '<button class="btn primary summary-cta" type="button" data-action="play">Поехали! <span aria-hidden="true">→</span></button>' :
            '<button class="btn secondary summary-cta" type="button" data-action="reset-bank">Пройти набор заново</button>'}
          <p class="storage-note">${storageNote}</p>
        </aside></div></section>`);
      drawScene(0, config.count);
      if (!focusKey) focusScreen();
      else (focusKey === 'topic' ? app.querySelector('#topic-select') : app.querySelector('input[name="' + focusKey + '"][value="' + focusValue + '"]'))?.focus({ preventScroll: true });
    }

    function begin() {
      const deck = window.BridgeMath.start({ ...config });
      if (!deck.total) { setup(); return; }
      round = { deck, total: deck.total, current: null, done: 0, firstTry: 0, attempted: false, locked: false };
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
          <progress id="bridge-progress" value="0" max="${round.total}"></progress></div>
        </article><section class="question-card" aria-labelledby="question-label">
          <h2 class="question-label" id="question-label"></h2>
          <p class="question-instruction" id="question-instruction"></p>
          <div class="equation" id="equation" aria-live="polite" aria-atomic="true"></div>
          <form id="answer-form" autocomplete="off" novalidate>
            <div class="answer-row"><input id="answer" class="answer-input" aria-label="Твой ответ" aria-describedby="question-instruction equation answer-status"
              placeholder="Ответ" type="text" inputmode="none" pattern="[0-9]*" maxlength="5" spellcheck="false"><span class="answer-unit" hidden></span></div>
            <fieldset class="answer-options" aria-describedby="equation answer-status" hidden><legend class="sr-only">Выбери ответ</legend><div class="option-list"></div></fieldset>
            <p class="answer-status" id="answer-status" role="status" aria-live="polite" aria-atomic="true"></p>
            <div class="keypad" aria-label="Цифровая клавиатура">${keypad}</div>
            <button type="submit" class="btn primary" data-action="check">Проверить <span aria-hidden="true">→</span></button>
          </form>
        </section></div></section>`);
      drawScene(0, round.total);
      updateProgress();
      showQuestion();
      window.scrollTo(0, 0);
    }

    function updateProgress() {
      const total = round.total;
      app.querySelector('[data-done]').textContent = round.done + ' из ' + total;
      app.querySelector('progress').value = round.done;
      scene.setProgress(round.done, total, true);
    }

    function showQuestion() {
      const q = round.deck.next();
      if (!q) {
        // Another open tab may have finished the remaining tasks.
        round.total = round.done;
        if (round.done) finish(); else setup();
        return;
      }
      round.current = q;
      round.attempted = false;
      round.locked = false;
      const label = app.querySelector('#question-label');
      label.textContent = 'Задание ' + (round.done + 1) + ' из ' + round.total;
      const prompt = app.querySelector('#equation');
      prompt.classList.toggle('word-problem', q.kind === 'text');
      prompt.textContent = q.prompt;
      const input = app.querySelector('#answer');
      const options = app.querySelector('.answer-options');
      const isChoice = Array.isArray(q.options) && q.options.length > 0;
      const instruction = app.querySelector('#question-instruction');
      instruction.textContent = isChoice ? 'Выбери знак сравнения.' :
        q.kind === 'formula' && q.prompt.includes('□') ? 'Какое число скрыто в окошке?' : '';
      instruction.hidden = !instruction.textContent;
      const unit = app.querySelector('.answer-unit');
      unit.hidden = !q.unit;
      unit.textContent = q.unit || '';
      options.hidden = !isChoice;
      const list = options.querySelector('.option-list');
      list.replaceChildren();
      if (isChoice) {
        const spoken = { '<': 'Меньше', '>': 'Больше', '=': 'Равно' };
        for (const value of q.options) {
          const item = document.createElement('label');
          item.className = 'choice';
          const radio = document.createElement('input');
          radio.type = 'radio';
          radio.name = 'answer-choice';
          radio.value = value;
          if (spoken[value]) radio.setAttribute('aria-label', spoken[value]);
          const text = document.createElement('span');
          text.textContent = value;
          item.append(radio, text);
          list.append(item);
        }
      }
      app.querySelector('.answer-row').hidden = isChoice;
      app.querySelector('.keypad').hidden = isChoice;
      input.disabled = isChoice;
      input.readOnly = false;
      input.value = '';
      input.removeAttribute('aria-invalid');
      app.querySelectorAll('.key, [data-action="check"]').forEach(button => { button.disabled = false; });
      setStatus('', '');
      (isChoice ? list.querySelector('input') : input).focus({ preventScroll: true });
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
      if (round.done === round.total) finish();
      else showQuestion();
    }

    function checkAnswer() {
      if (screen !== 'game' || round.locked || modal.open) return;
      const input = app.querySelector('#answer');
      const choices = round.current.options;
      const selected = app.querySelector('input[name="answer-choice"]:checked');
      const value = choices ? selected?.value : input.value;
      if (value == null || value === '') {
        setStatus(choices ? 'Выбери ответ.' : 'Введи ответ.', 'hint');
        (choices ? app.querySelector('input[name="answer-choice"]') : input).focus({ preventScroll: true });
        return;
      }
      const correct = choices ? value === String(round.current.answer) : Number(value) === round.current.answer;
      if (!correct) {
        round.attempted = true;
        input.setAttribute('aria-invalid', 'true');
        setStatus('Попробуй ещё раз.', 'error');
        playSound('retry');
        if (choices) selected.focus({ preventScroll: true });
        else { input.focus({ preventScroll: true }); input.select(); }
        return;
      }
      if (!round.attempted) round.firstTry++;
      round.done++;
      round.locked = true;
      input.readOnly = true;
      app.querySelectorAll('.key, [name="answer-choice"], [data-action="check"]').forEach(button => { button.disabled = true; });
      const last = round.done === round.total;
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
        if (input.value.length - (end - start) + insert.length > input.maxLength) return;
        input.setRangeText(insert, start, end, 'end');
      }
      input.removeAttribute('aria-invalid');
      setStatus('', '');
      input.focus({ preventScroll: true });
    }

    function finish() {
      const total = round.total;
      setScreen('success', `<section class="screen success-screen">
        <header class="screen-heading"><p class="eyebrow">Маршрут пройден</p><h1>Мост построен!</h1></header>
        <div class="result-layout"><article class="route-card">
          <header class="route-heading"><h2>Переправа готова</h2><span class="route-count">${total} из ${total}</span></header>
          <div class="game-scene" data-scene></div></article>
          <section class="result-card"><h2>Автобус на другом берегу!</h2>
            <p>Построено секций — ${total}.</p>
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
      if (type === 'reset-bank') {
        modal.innerHTML = `<div class="modal-content"><header class="modal-heading"><h2 id="dialog-title">Пройти набор заново?</h2></header>
          <p>Задания с выбранными настройками снова станут доступными, в том числе в других режимах, где они встречаются.</p>
          <div class="modal-actions"><button type="button" class="btn secondary" data-action="close-dialog" autofocus>Отмена</button>
          <button type="button" class="btn primary" data-action="confirm-reset">Начать заново</button></div></div>`;
        modal.setAttribute('aria-labelledby', 'dialog-title');
        dialogFocus = document.activeElement;
        modal.showModal();
        return;
      }
      const help = type === 'help';
      const title = help ? 'Как играть' : 'Закончить игру?';
      const body = help ? `<ol class="rules-list">
          <li>Выбери тему и количество заданий. Для каждой задачи на мосту появится новая секция, когда ты ответишь верно.</li>
          <li>Введи число или выбери один из предложенных ответов. Затем нажми «Проверить». На клавиатуре можно нажать Enter.</li>
          <li>Если ответ неверный, попробуй снова. Когда мост будет готов, автобус переедет на другой берег.</li>
        </ol>` : '<p>Построено секций: ' + round.done + ' из ' + round.total + '. При выходе этот результат сбросится.</p>';
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
      if (button.dataset.group) {
        catalogGroup = button.dataset.group;
        showCatalog();
        app.querySelector('[data-group="' + catalogGroup + '"]')?.focus({ preventScroll: true });
        return;
      }
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
        case 'reset-bank': showDialog('reset-bank'); break;
        case 'confirm-reset':
          window.BridgeMath.reset(config);
          modal.close();
          setup();
          break;
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
      if (screen === 'game' && input.name === 'answer-choice') { setStatus('', ''); return; }
      if (screen !== 'setup' || !input.matches('select[name="topic"], input[type=radio]')) return;
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
      input.value = input.value.replace(/[^0-9]/g, '').slice(0, input.maxLength);
      input.removeAttribute('aria-invalid');
      setStatus('', '');
    });
    document.addEventListener('keydown', event => {
      if (screen !== 'game' || modal.open || round.locked || event.isComposing || event.metaKey || event.ctrlKey || event.altKey) return;
      if (round.current?.options) {
        if (round.current.options.includes(event.key)) {
          event.preventDefault();
          const choice = Array.from(app.querySelectorAll('input[name="answer-choice"]')).find(el => el.value === event.key);
          if (choice) { choice.checked = true; choice.focus(); setStatus('', ''); }
        } else if (event.key === 'Enter' && event.target.name === 'answer-choice') {
          event.preventDefault();
          checkAnswer();
        }
        return;
      }
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
    showCatalog();
    drawScene(0, config.count);
    updateControls();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
