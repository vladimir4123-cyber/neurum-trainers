/* ============================================================
   Движок урока (теория → «Проверь себя» → практика → финал).
   Общий для всех тем всех тренажёров. Урок передаёт свой контент:

   runLesson({
     lessonId,     // id темы для localStorage.completed (напр. 'voltage')
     storageKey,   // ключ прогресса тренажёра (напр. 'voltmeter-progress')
     homeHref,     // хаб тренажёра для кнопки «К темам» (напр. '../demo/')
     nextHref,     // следующая тема — куда ведёт «Следующая тема →» (необяз.; нет → последняя)
     steps,        // массив шагов STEPS
     visuals,      // { visualName: () => '<svg>…' }
     onInteract,   // (step, ctx) => {} — для type:'interact'; ctx={ done, mascot, root }
   })

   Требует в DOM: .top(#progressFill,#stepNow,#stepTotal), #stepHost,
   #feedback(#fbIcon,#fbTitle,#fbHint), .bottom(#backBtn,#continueBtn).
   ============================================================ */
// Маскот убран из теории по решению — оставлен только в практиках.
// Пустышка возвращается вместо mountMascot(), чтобы вызовы .say/.setEmotion
// в этом файле продолжали работать без ошибок.
const mountMascot = () => ({ say(){}, setEmotion(){}, hide(){}, el: null });

export function runLesson(cfg) {
  const { lessonId, storageKey, homeHref, nextHref, steps, visuals, onInteract } = cfg;
  const mascot = mountMascot();

  /* ---------- STATE ---------- */
  let idx = 0;
  let mistakes = 0;       // ошибки на вопросах «Проверь себя»
  let userChoice = null;

  const stepHost = document.getElementById('stepHost');
  const continueBtn = document.getElementById('continueBtn');
  const backBtn = document.getElementById('backBtn');
  const progressFill = document.getElementById('progressFill');
  const stepNow = document.getElementById('stepNow');
  const stepTotal = document.getElementById('stepTotal');
  const fb = document.getElementById('feedback');
  const fbIcon = document.getElementById('fbIcon');
  const fbTitle = document.getElementById('fbTitle');
  const fbHint = document.getElementById('fbHint');

  stepTotal.textContent = steps.length;

  function updateProgress() {
    progressFill.style.width = (idx / steps.length) * 100 + '%';
    stepNow.textContent = Math.min(idx + 1, steps.length);
  }
  function hideFeedback() { fb.classList.remove('show', 'correct', 'wrong'); }
  function showFeedback(kind, title, hint) {
    fb.classList.remove('correct', 'wrong');
    fb.classList.add('show', kind);
    fbIcon.textContent = kind === 'correct' ? '✓' : '✕';
    fbTitle.textContent = title;
    fbHint.textContent = hint;
  }

  /* ---------- RENDER ---------- */
  function render() {
    hideFeedback();
    userChoice = null;
    continueBtn.classList.remove('check-mode', 'finish-mode');
    continueBtn.textContent = 'Дальше';
    continueBtn.disabled = false;
    updateProgress();
    document.body.dataset.phase = steps[idx]?.phase || 'theory';
    backBtn.hidden = (idx === 0 || idx >= steps.length);

    if (idx >= steps.length) { renderComplete(); return; }
    const step = steps[idx];

    // SPLASH — полноэкранный переход между фазами
    if (step.type === 'splash') {
      stepHost.innerHTML = `
        <div class="step splash">
          <div class="splash-visual">${splashSVG()}</div>
          <h2 class="step-title splash-title">${step.title}</h2>
          <p class="step-text splash-text">${step.text}</p>
        </div>`;
      continueBtn.textContent = 'Погнали!';
      if (step.mascotSay) setTimeout(() => mascot.say(step.mascotSay, { emotion: 'wow', duration: 4000 }), 300);
      return;
    }

    // Порядок: заголовок → текст → иллюстрация → (варианты). Кнопки — в нижней панели.
    let html = '<div class="step">';
    html += `<h2 class="step-title">${step.title}</h2>`;
    html += `<p class="step-text">${step.text}</p>`;
    if (step.visual && visuals[step.visual]) {
      const sz = step.big ? ' step-visual--big' : '';
      html += `<div class="step-visual${sz}">${visuals[step.visual]()}</div>`;
    }
    if (step.type === 'question') {
      html += '<div class="options">';
      step.options.forEach(opt => { html += `<button class="opt-btn" data-id="${opt.id}">${opt.text}</button>`; });
      html += '</div>';
    }
    html += '</div>';
    stepHost.innerHTML = html;

    if (step.type === 'question') {
      continueBtn.disabled = true;
      continueBtn.classList.add('check-mode');
      continueBtn.textContent = 'Проверить';
      stepHost.querySelectorAll('.opt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          stepHost.querySelectorAll('.opt-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          userChoice = btn.dataset.id;
          continueBtn.disabled = false;
        });
      });
    } else if (step.type === 'interact' && onInteract) {
      // Интерактивный шаг: «Дальше» активна ВСЕГДА — ученик волен идти
      // дальше, даже не потрогав интерактив. ctx.done() оставлен для
      // совместимости (уроки его вызывают), но ничего не блокирует.
      const ctx = {
        mascot,
        root: stepHost,
        done() {},
      };
      onInteract(step, ctx);
    }

    if (step.mascotSay) setTimeout(() => mascot.say(step.mascotSay, { duration: 4000 }), 300);
  }

  /* ---------- ACTIONS ---------- */
  continueBtn.addEventListener('click', () => {
    const step = steps[idx];
    if (step.type === 'question' && continueBtn.textContent === 'Проверить') {
      const opt = step.options.find(o => o.id === userChoice);
      stepHost.querySelectorAll('.opt-btn').forEach(b => {
        b.disabled = true;
        const bOpt = step.options.find(o => o.id === b.dataset.id);
        if (bOpt.correct) b.classList.add('correct');
        else if (b.dataset.id === userChoice) b.classList.add('wrong');
      });
      if (opt.correct) {
        showFeedback('correct', 'Верно!', step.right);
        mascot.say('Верно, молодцы!', { emotion: 'happy', duration: 2500 });
      } else {
        mistakes++;
        showFeedback('wrong', 'Не совсем...', step.wrong);
        mascot.say('Давайте разберём, почему.', { emotion: 'think', duration: 3000 });
      }
      continueBtn.textContent = 'Дальше';
      continueBtn.classList.remove('check-mode');
      return;
    }
    idx++;
    render();
  });

  backBtn.addEventListener('click', () => { if (idx > 0) { idx--; render(); } });

  /* ---------- COMPLETE ---------- */
  function renderComplete() {
    const checkQ = steps.filter(s => s.type === 'question').length;
    const correct = checkQ - mistakes;
    const theoryN = steps.filter(s => s.phase === 'theory').length;

    const sub = mistakes === 0
      ? 'Отлично — на вопросах «Проверь себя» ни одной ошибки. Можно переходить к практике.'
      : `На вопросах «Проверь себя» верных ответов: ${correct} из ${checkQ}. Двигаемся к практике.`;

    stepHost.innerHTML = `
      <div class="complete">
        ${completeBadgeSVG(mistakes)}
        <h1>Тему разобрали!</h1>
        <p class="complete-sub">${sub}</p>
        <div class="stats">
          <div class="stat">
            <div class="stat-val"><span>${correct}</span><small>/${checkQ}</small></div>
            <div class="stat-lbl">Проверь себя</div>
          </div>
          <div class="stat">
            <div class="stat-val"><span>${theoryN}</span></div>
            <div class="stat-lbl">Экранов теории</div>
          </div>
        </div>
      </div>`;
    progressFill.style.width = '100%';

    // ⏸ Сохранение прогресса временно отключено (сбрасывается при обновлении).
    //    Чтобы вернуть — раскомментировать блок ниже.
    // const state = JSON.parse(localStorage.getItem(storageKey) || '{}');
    // if (!state.completed) state.completed = [];
    // if (!state.completed.includes(lessonId)) state.completed.push(lessonId);
    // localStorage.setItem(storageKey, JSON.stringify(state));

    // Нижняя панель финала. Если есть следующая тема — ведём прямо в неё,
    // не заставляя возвращаться в хаб. «К темам» остаётся как второстепенная.
    const bottom = document.querySelector('.bottom');
    if (nextHref) {
      bottom.innerHTML = `
        <button class="btn-back" id="toHub">К темам</button>
        <button class="btn-continue" id="toNext">Следующая тема →</button>`;
      document.getElementById('toHub').onclick = () => { location.href = homeHref; };
      document.getElementById('toNext').onclick = () => { location.href = nextHref; };
    } else {
      // Последняя тема — вести дальше некуда, показываем одну кнопку.
      bottom.innerHTML = `
        <button class="btn-continue" id="toHub" style="margin-left:auto;">К темам →</button>`;
      document.getElementById('toHub').onclick = () => { location.href = homeHref; };
    }

    mascot.say('Тему разобрали — молодцы! Дальше попробуем на практике.', { emotion: 'happy', duration: 6000 });
    fireConfetti();
  }

  /* ---------- START ---------- */
  render();
}

/* Splash-иллюстрация (мишень со стрелой) — общая для всех тем */
function splashSVG() {
  return `
    <svg viewBox="0 0 240 240" class="splash-svg">
      <defs>
        <radialGradient id="targetGlow" cx=".5" cy=".5" r=".5">
          <stop offset="0" stop-color="#FFD769" stop-opacity=".55"/>
          <stop offset="1" stop-color="#FFD769" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="120" cy="120" r="110" fill="url(#targetGlow)"/>
      <circle cx="120" cy="120" r="88" fill="#fff" stroke="#232323" stroke-width="3"/>
      <circle cx="120" cy="120" r="72" fill="#F0E2F5" stroke="#232323" stroke-width="1.5"/>
      <circle cx="120" cy="120" r="54" fill="#fff" stroke="#232323" stroke-width="1.5"/>
      <circle cx="120" cy="120" r="36" fill="#8B6FFF" stroke="#232323" stroke-width="1.5"/>
      <circle cx="120" cy="120" r="18" fill="#6240FF" stroke="#232323" stroke-width="1.5"/>
      <circle cx="120" cy="120" r="6"  fill="#FFD769" stroke="#232323" stroke-width="1"/>
      <g>
        <line x1="0" y1="60" x2="120" y2="120" stroke="#232323" stroke-width="4" stroke-linecap="round" opacity="0">
          <animate attributeName="opacity" values="0;1;1" dur="1s" keyTimes="0;.4;1" fill="freeze"/>
          <animate attributeName="x1" values="60;95;95" dur="1s" keyTimes="0;.4;1" fill="freeze"/>
          <animate attributeName="y1" values="0;110;110" dur="1s" keyTimes="0;.4;1" fill="freeze"/>
        </line>
        <polygon points="80,90 60,80 65,100 60,120 80,110" fill="#D8232A" opacity="0">
          <animate attributeName="opacity" values="0;1" dur="1s" keyTimes="0;.4" fill="freeze"/>
        </polygon>
      </g>
      <g fill="#CDFE00">
        <circle cx="30" cy="40" r="4"><animate attributeName="r" values="3;6;3" dur="1.6s" repeatCount="indefinite"/></circle>
        <circle cx="210" cy="60" r="3"><animate attributeName="r" values="2;5;2" dur="1.9s" repeatCount="indefinite"/></circle>
        <circle cx="50" cy="200" r="3.5"><animate attributeName="r" values="3;6;3" dur="2.1s" repeatCount="indefinite"/></circle>
        <circle cx="200" cy="190" r="4"><animate attributeName="r" values="3;6;3" dur="1.7s" repeatCount="indefinite"/></circle>
      </g>
    </svg>`;
}

/* Финальный бэдж: маскот-нейрон радуется на пьедестале.
   Цвет луча/искр зависит от числа ошибок. */
function completeBadgeSVG(mistakes) {
  const auraA = mistakes === 0 ? '#CDFE00' : mistakes === 1 ? '#8B6FFF' : '#FFD769';
  const auraB = mistakes === 0 ? '#07BE7E' : mistakes === 1 ? '#6240FF' : '#E5B535';
  return `
    <svg viewBox="0 0 240 300" class="complete-badge" aria-hidden="true">
      <defs>
        <radialGradient id="mBody" cx="45%" cy="35%" r="70%">
          <stop offset="0" stop-color="#8B6FFF"/><stop offset=".6" stop-color="#6240FF"/><stop offset="1" stop-color="#4A2FD9"/>
        </radialGradient>
        <radialGradient id="mHighlight" cx="35%" cy="30%" r="30%">
          <stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="pedGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#8B6FFF"/><stop offset="1" stop-color="#6240FF"/>
        </linearGradient>
        <linearGradient id="pedFace" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#EEF0FF"/><stop offset="1" stop-color="#8B6FFF"/>
        </linearGradient>
        <linearGradient id="beam" x1=".5" y1="0" x2=".5" y2="1">
          <stop offset="0" stop-color="${auraA}" stop-opacity=".55"/><stop offset="1" stop-color="${auraA}" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="M76 150 L164 150 L188 244 L52 244 Z" fill="url(#beam)">
        <animate attributeName="opacity" values=".55;.85;.55" dur="2s" repeatCount="indefinite"/>
      </path>
      <g>
        <ellipse cx="120" cy="260" rx="72" ry="16" fill="url(#pedGrad)"/>
        <ellipse cx="120" cy="254" rx="72" ry="16" fill="url(#pedFace)"/>
        <ellipse cx="120" cy="248" rx="72" ry="16" fill="#fff" opacity=".85"/>
        <circle cx="120" cy="248" r="34" fill="none" stroke="#8B6FFF" stroke-width="2" opacity=".5"/>
        <circle cx="120" cy="248" r="22" fill="none" stroke="#8B6FFF" stroke-width="2" opacity=".7"/>
        <circle cx="120" cy="248" r="14" fill="#fff"/>
        <path d="M112 248 L118 254 L130 240" stroke="#232323" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
      <g class="celebration-mascot">
        <g>
          <path d="M120 30 C 168 30, 196 66, 190 110 C 186 148, 156 178, 120 178 C 84 178, 54 148, 50 110 C 44 66, 72 30, 120 30 Z" fill="url(#mBody)"/>
          <path d="M120 30 C 168 30, 196 66, 190 110 C 186 148, 156 178, 120 178 C 84 178, 54 148, 50 110 C 44 66, 72 30, 120 30 Z" fill="url(#mHighlight)"/>
          <path d="M84 92 Q98 76 112 92" stroke="#232323" stroke-width="4" fill="none" stroke-linecap="round"/>
          <path d="M128 92 Q142 76 156 92" stroke="#232323" stroke-width="4" fill="none" stroke-linecap="round"/>
          <path d="M92 116 Q120 154 148 116 Z" fill="#232323"/>
          <ellipse cx="120" cy="140" rx="14" ry="7" fill="#FF6B7A"/>
          <ellipse cx="76" cy="118" rx="10" ry="6" fill="#FF6B7A" opacity=".4"/>
          <ellipse cx="164" cy="118" rx="10" ry="6" fill="#FF6B7A" opacity=".4"/>
          <path d="M58 90 Q28 60, 44 30" stroke="#6240FF" stroke-width="7" fill="none" stroke-linecap="round"/>
          <path d="M182 90 Q212 60, 196 30" stroke="#6240FF" stroke-width="7" fill="none" stroke-linecap="round"/>
          <circle cx="44" cy="30" r="7" fill="#6240FF"/>
          <circle cx="196" cy="30" r="7" fill="#6240FF"/>
          <animateTransform attributeName="transform" type="translate" values="0,0;0,-8;0,0" dur="2.4s" repeatCount="indefinite"/>
        </g>
      </g>
      <g>
        <circle cx="30" cy="60" r="5" fill="${auraA}"><animate attributeName="opacity" values="0;1;0" dur="1.8s" repeatCount="indefinite"/><animate attributeName="r" values="3;6;3" dur="1.8s" repeatCount="indefinite"/></circle>
        <circle cx="210" cy="80" r="4" fill="${auraB}"><animate attributeName="opacity" values="0;1;0" dur="1.6s" repeatCount="indefinite" begin=".3s"/><animate attributeName="r" values="2;5;2" dur="1.6s" repeatCount="indefinite" begin=".3s"/></circle>
        <circle cx="220" cy="180" r="5" fill="${auraA}"><animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" begin=".6s"/><animate attributeName="r" values="3;6;3" dur="2s" repeatCount="indefinite" begin=".6s"/></circle>
        <circle cx="20" cy="170" r="4" fill="${auraB}"><animate attributeName="opacity" values="0;1;0" dur="1.7s" repeatCount="indefinite" begin=".9s"/><animate attributeName="r" values="2;5;2" dur="1.7s" repeatCount="indefinite" begin=".9s"/></circle>
        <path d="M28 130 L30 135 L35 135 L31 138 L33 143 L28 140 L23 143 L25 138 L21 135 L26 135 Z" fill="${auraA}" opacity=".8"><animateTransform attributeName="transform" type="rotate" from="0 28 137" to="360 28 137" dur="4s" repeatCount="indefinite"/></path>
        <path d="M212 130 L214 135 L219 135 L215 138 L217 143 L212 140 L207 143 L209 138 L205 135 L210 135 Z" fill="${auraB}" opacity=".8"><animateTransform attributeName="transform" type="rotate" from="0 212 137" to="-360 212 137" dur="5s" repeatCount="indefinite"/></path>
      </g>
    </svg>`;
}

function fireConfetti() {
  const box = document.createElement('div');
  box.className = 'confetti';
  const colors = ['#6240FF', '#CDFE00', '#FFD769', '#07BE7E', '#FF6B9D'];
  for (let i = 0; i < 60; i++) {
    const p = document.createElement('span');
    p.style.left = Math.random() * 100 + '%';
    p.style.background = colors[i % colors.length];
    p.style.animationDuration = (2 + Math.random() * 2) + 's';
    p.style.animationDelay = (Math.random() * 0.5) + 's';
    p.style.transform = `rotate(${Math.random() * 360}deg)`;
    box.appendChild(p);
  }
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 5000);
}
