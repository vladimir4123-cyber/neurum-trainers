/* ============================================================
   Движок практики: выбор сложности → шаги-миссии → финал.

   Принципы (общие для всех тренажёров):
   1. Ученик сам действует прибором (шаг type:'action').
   2. Ученик сам считывает показания и вписывает (type:'reading').
   3. Ученик сам делает вывод (type:'choice').
   4. Значения рандомизируются при каждом запуске (buildSteps
      вызывается заново на каждый старт и на «Пройти ещё раз»).

   runPractice({
     practiceId,   // id для localStorage.completed (напр. 'battery')
     storageKey,   // ключ прогресса тренажёра
     homeHref,     // куда ведёт «К темам»
     title,        // название миссии (экран выбора уровня, финал)
     subtitle,     // короткая завязка истории (экран выбора уровня)
     levels: {     // ровно три уровня
       easy:   { label, desc, xp },
       medium: { label, desc, xp },
       hard:   { label, desc, xp },
     },
     buildSteps(levelKey, rnd) → [шаги]   // rnd = Math.random
   })

   Шаги:
   { type:'action',  title, text, render(host, ctx) }
       — своя интерактивная сцена; ctx.done() открывает «Дальше»,
         ctx.miss() засчитывает ошибку, ctx.fb(html, 'ok'|'err'|'hint').
   { type:'reading', title, text, render(host, ctx),
       answer, tolerance, unit?, hints?: [..], right? }
       — сцена + поле ввода; движок сам проверяет с допуском,
         ведёт попытки и выдаёт подсказки по нарастающей;
         когда подсказки кончились — называет ответ (его всё равно
         надо вписать).
   { type:'choice',  title, text, render?(host, ctx),
       options: [{ text, correct }], right?, wrong? }
       — вывод/диагноз; варианты перемешиваются; один клик = ответ.

   Требует в DOM: .top(#progressFill,#stepNow,#stepTotal),
   #stage, #bottom. Стили: lesson.css + practice.css.
   ============================================================ */

export function runPractice(cfg) {
  const { practiceId, storageKey, homeHref, title, subtitle, levels, buildSteps } = cfg;

  const stage = document.getElementById('stage');
  const bottom = document.getElementById('bottom');
  const progressFill = document.getElementById('progressFill');
  const stepNow = document.getElementById('stepNow');
  const stepTotal = document.getElementById('stepTotal');
  const counter = document.querySelector('.step-counter');

  let level = null;
  let steps = [];
  let idx = 0;
  let mistakes = 0;

  const fmtNum = v => String(Math.round(v * 100) / 100).replace('.', ',');
  const parseNum = s => parseFloat(String(s).replace(',', '.').trim());

  /* ---------- экран выбора сложности ---------- */
  function renderLevels() {
    if (counter) counter.style.visibility = 'hidden';
    progressFill.style.width = '0%';
    stage.innerHTML = `
      <div class="p-wrap">
        <h1 class="p-title">${title}</h1>
        ${subtitle ? `<p class="p-lead">${subtitle}</p>` : ''}
        <p class="p-pick">Выбери уровень сложности:</p>
        <div class="plevels">
          ${Object.entries(levels).map(([key, l]) => `
            <button class="plevel" data-level="${key}">
              <span class="plevel__label">${l.label}</span>
              <span class="plevel__desc">${l.desc}</span>
              <span class="plevel__xp">+${l.xp} XP</span>
            </button>`).join('')}
        </div>
      </div>`;
    bottom.innerHTML = `<button class="btn-back" id="pExit">← К темам</button>`;
    document.getElementById('pExit').onclick = () => { location.href = homeHref; };
    stage.querySelectorAll('.plevel').forEach(b =>
      b.addEventListener('click', () => start(b.dataset.level)));
  }

  function start(lv) {
    level = lv;
    steps = buildSteps(lv, Math.random);
    idx = 0; mistakes = 0;
    if (counter) counter.style.visibility = '';
    stepTotal.textContent = steps.length;
    renderStep();
  }

  /* ---------- рендер шага ---------- */
  function renderStep() {
    const step = steps[idx];
    progressFill.style.width = (idx / steps.length) * 100 + '%';
    stepNow.textContent = idx + 1;

    // choice: иконка/сцена → «Задача N из M» мелко → сам вопрос крупно.
    // reading/action: заголовок → текст → сцена (инструкции длинные).
    const head = step.type === 'choice'
      ? `<div class="p-scene" id="pScene"></div>
         <p class="p-kicker">${step.title}</p>
         <h1 class="p-title">${step.text || ''}</h1>`
      : `<h1 class="p-title">${step.title}</h1>
         ${step.text ? `<p class="p-lead">${step.text}</p>` : ''}
         <div class="p-scene" id="pScene"></div>`;
    stage.innerHTML = `
      <div class="p-wrap">
        ${head}
        ${step.type === 'reading' ? `
          <div class="p-meas">
            <input class="p-input" id="pInput" inputmode="decimal" placeholder="?" autocomplete="off">
            <span class="p-unit">${step.unit || 'В'}</span>
            <button class="p-check" id="pCheck">Проверить</button>
          </div>` : ''}
        ${step.type === 'choice' ? `
          <div class="options" id="pOpts">
            ${shuffleIdx(step.options).map(({ o, i }) =>
              `<button class="opt-btn" data-i="${i}">${o.text}</button>`).join('')}
          </div>` : ''}
        <div class="p-fb" id="pFb"></div>
      </div>`;

    bottom.innerHTML = `
      <button class="btn-back" id="pExit">← К темам</button>
      <button class="btn-continue" id="pNext" disabled>${idx + 1 < steps.length ? 'Дальше' : 'К результату'}</button>`;
    document.getElementById('pExit').onclick = () => { location.href = homeHref; };
    document.getElementById('pNext').onclick = next;

    const ctx = {
      level,
      done: unlock,
      miss: () => { mistakes++; },
      fb: setFb,
    };
    if (step.render) step.render(document.getElementById('pScene'), ctx);
    if (step.type === 'reading') wireReading(step);
    if (step.type === 'choice') wireChoice(step);
  }

  /* ---------- ввод показания с допуском и подсказками ---------- */
  function wireReading(step) {
    const input = document.getElementById('pInput');
    const check = document.getElementById('pCheck');
    const hints = step.hints || [];
    let attempts = 0;

    const submit = () => {
      if (input.disabled) return;
      const v = parseNum(input.value);
      if (isNaN(v)) { setFb('Впиши число — что показывает стрелка.', 'err'); return; }
      if (Math.abs(v - step.answer) <= (step.tolerance || 0) + 1e-9) {
        setFb(step.right || '✓ Верно!', 'ok');
        input.disabled = true; check.disabled = true;
        unlock();
        return;
      }
      mistakes++; attempts++;
      if (attempts > hints.length) {
        setFb(`Правильный ответ: <b>${fmtNum(step.answer)} ${step.unit || 'В'}</b> — впиши его.`, 'hint');
      } else {
        setFb(hints[attempts - 1], attempts === 1 ? 'err' : 'hint');
      }
      input.select();
    };
    check.addEventListener('click', submit);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
    input.focus();
  }

  /* ---------- выбор вывода/диагноза ---------- */
  function wireChoice(step) {
    const btns = [...document.querySelectorAll('#pOpts .opt-btn')];
    btns.forEach(b => b.addEventListener('click', () => {
      const i = +b.dataset.i;
      const opt = step.options[i];
      btns.forEach(x => {
        x.disabled = true;
        if (step.options[+x.dataset.i].correct) x.classList.add('correct');
      });
      if (opt.correct) {
        setFb(fbPlaque(true, step.right || 'Верно!'), 'ok');
      } else {
        b.classList.add('wrong');
        mistakes++;
        setFb(fbPlaque(false, step.wrong || 'Посмотри на выделенный ответ.'), 'err');
      }
      unlock();
    }));
  }

  /* ---------- финал ---------- */
  function renderFinale() {
    progressFill.style.width = '100%';
    stepNow.textContent = steps.length;
    saveProgress();
    fireConfetti();

    // Звёзды: 3 — без ошибок, 2 — до двух, 1 — дальше.
    const stars = mistakes === 0 ? 3 : mistakes <= 2 ? 2 : 1;
    const sub = mistakes === 0
      ? 'Ни одной ошибки — чистая работа!'
      : stars === 2
        ? `Ошибок по пути: ${mistakes}. Ещё немного — и три звезды.`
        : `Ошибок по пути: ${mistakes}. Пройди ещё раз — получится чище.`;
    const starSVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.4l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 21.7 6.2 20.8l1.1-6.5L2.6 9.7l6.5-.9z"/></svg>`;
    const starsHTML = [0, 1, 2].map(i =>
      `<span class="p-star ${i < stars ? 'is-on' : ''}" style="--d:${i * 0.28}s">
         <span class="p-star__bg">${starSVG}</span>
         <span class="p-star__fill">${starSVG}</span>
       </span>`).join('');
    stage.innerHTML = `
      <div class="p-wrap">
        <div class="p-stars">${starsHTML}</div>
        <h1 class="p-title">Миссия выполнена!</h1>
        <p class="p-lead">${sub}</p>
        <div class="p-stats">
          <div class="p-stat p-stat--level"><div class="p-stat__val">${levels[level].label}</div><div class="p-stat__lbl">уровень</div></div>
          <div class="p-stat p-stat--xp"><div class="p-stat__val">+${levels[level].xp}</div><div class="p-stat__lbl">XP</div></div>
          <div class="p-stat p-stat--miss"><div class="p-stat__val">${mistakes}</div><div class="p-stat__lbl">${plural(mistakes, 'ошибка', 'ошибки', 'ошибок')}</div></div>
        </div>
      </div>`;
    bottom.innerHTML = `
      <button class="btn-back" id="pExit">← К темам</button>
      <button class="btn-continue" id="pAgain">Пройти ещё раз</button>`;
    document.getElementById('pExit').onclick = () => { location.href = homeHref; };
    document.getElementById('pAgain').onclick = renderLevels;
  }

  function next() {
    idx++;
    if (idx < steps.length) renderStep();
    else renderFinale();
  }

  function unlock() {
    const b = document.getElementById('pNext');
    if (b) b.disabled = false;
  }

  function setFb(html, cls) {
    const fb = document.getElementById('pFb');
    if (!fb) return;
    fb.className = 'p-fb' + (cls ? ' ' + cls : '');
    fb.innerHTML = html || '';
  }

  function saveProgress() {
    // ⏸ Сохранение прогресса временно отключено (сбрасывается при обновлении).
    //    Чтобы вернуть — раскомментировать блок ниже.
    // const st = JSON.parse(localStorage.getItem(storageKey) || '{}');
    // if (typeof st.xp !== 'number') st.xp = 0;
    // if (!st.completed) st.completed = [];
    // if (!st.completed.includes(practiceId)) { st.completed.push(practiceId); st.xp += levels[level].xp; }
    // localStorage.setItem(storageKey, JSON.stringify(st));
  }

  /* ---------- старт ---------- */
  renderLevels();
}

/* ---------- helpers ---------- */
// Плашка обратной связи: ✓ Верно! / ✕ Неверно + объяснение под ней.
function fbPlaque(ok, why) {
  const clean = String(why).replace(/^[✓✔✕✗×]\s*/, '').trim();
  return `<span class="p-fb__title"><span class="p-fb__badge">${ok ? '✓' : '✕'}</span>${ok ? 'Верно!' : 'Неверно'}</span>`
       + (clean ? `<span class="p-fb__why">${clean}</span>` : '');
}
function shuffleIdx(arr) {
  const a = arr.map((o, i) => ({ o, i }));
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function plural(n, one, few, many) {
  const m10 = n % 10, m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return few;
  return many;
}

function fireConfetti() {
  const box = document.createElement('div');
  box.className = 'confetti';
  const colors = ['#6240FF', '#CDFE00', '#FFD769', '#07BE7E', '#FF6B9D', '#149ECA'];
  for (let i = 0; i < 70; i++) {
    const p = document.createElement('span');
    p.style.left = Math.random() * 100 + '%';
    p.style.background = colors[i % colors.length];
    p.style.animationDuration = (2.4 + Math.random() * 1.8) + 's';
    p.style.animationDelay = (Math.random() * 0.5) + 's';
    box.appendChild(p);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 5000);
}
