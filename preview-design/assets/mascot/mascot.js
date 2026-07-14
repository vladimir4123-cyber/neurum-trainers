/* ============================================================
   Нейрон-маскот — placeholder SVG версия
   Использование: mountMascot(container, { onReady })
   API:
     .say(text, {emotion, duration})   → показать реплику
     .setEmotion('happy'|'sad'|'idle'|'think'|'wow')
   ============================================================ */

/* Маскот-нейрон — фиолетовая капля-blob с большими глазами. */
const MASCOT_SVG = `
<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg" class="mascot-svg">
  <defs>
    <radialGradient id="body-grad" cx="45%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#8B6FFF"/>
      <stop offset="60%" stop-color="#6240FF"/>
      <stop offset="100%" stop-color="#4A2FD9"/>
    </radialGradient>
    <radialGradient id="highlight" cx="35%" cy="30%" r="30%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity=".55"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feOffset dx="0" dy="4" result="offset"/>
      <feComponentTransfer><feFuncA type="linear" slope=".25"/></feComponentTransfer>
      <feComposite in2="SourceAlpha" operator="in"/>
      <feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- neural spark decorations -->
  <g class="mascot-sparks">
    <circle cx="18" cy="30" r="2.5" fill="#CDFE00" opacity=".7"/>
    <circle cx="102" cy="42" r="2" fill="#CDFE00" opacity=".55"/>
    <circle cx="95" cy="98" r="1.8" fill="#CDFE00" opacity=".55"/>
    <circle cx="20" cy="95" r="2.2" fill="#CDFE00" opacity=".7"/>
  </g>

  <!-- little arms -->
  <g class="mascot-arms">
    <path class="arm arm-l"
          d="M18 78 Q4 88 10 100"
          fill="none" stroke="#6240FF" stroke-width="5" stroke-linecap="round"/>
    <path class="arm arm-r"
          d="M102 78 Q116 88 110 100"
          fill="none" stroke="#6240FF" stroke-width="5" stroke-linecap="round"/>
  </g>

  <!-- body (blob) -->
  <g class="mascot-body" filter="url(#soft-shadow)">
    <path d="M60 15
             C 90 15, 108 40, 105 68
             C 103 96, 82 118, 60 118
             C 38 118, 17 96, 15 68
             C 12 40, 30 15, 60 15 Z"
          fill="url(#body-grad)"/>
    <path d="M60 15
             C 90 15, 108 40, 105 68
             C 103 96, 82 118, 60 118
             C 38 118, 17 96, 15 68
             C 12 40, 30 15, 60 15 Z"
          fill="url(#highlight)"/>
  </g>

  <!-- eyes -->
  <g class="mascot-eyes">
    <ellipse cx="43" cy="60" rx="10" ry="12" fill="#ffffff"/>
    <ellipse cx="77" cy="60" rx="10" ry="12" fill="#ffffff"/>
    <circle class="pupil pupil-l" cx="43" cy="62" r="5" fill="#232323"/>
    <circle class="pupil pupil-r" cx="77" cy="62" r="5" fill="#232323"/>
    <circle cx="45" cy="59" r="1.6" fill="#ffffff"/>
    <circle cx="79" cy="59" r="1.6" fill="#ffffff"/>
  </g>

  <!-- mouth -->
  <path class="mascot-mouth"
        d="M50 84 Q60 90 70 84"
        fill="none" stroke="#232323" stroke-width="2.4" stroke-linecap="round"/>
</svg>
`;

const MASCOT_CSS = `
.mascot-root {
  position: fixed;
  /* --mascot-bottom можно переопределить на странице (например поднять
     маскота над нижней панелью урока), дефолт — 20px от низа. */
  left: 20px; bottom: var(--mascot-bottom, 20px);
  z-index: 100;
  display: flex;
  flex-direction: row;
  align-items: flex-end;
  gap: 14px;
  pointer-events: none;
  font-family: var(--font-sans, system-ui);
}
.mascot-container {
  position: relative;
  width: 110px; height: 130px;
  pointer-events: auto;
  cursor: pointer;
  animation: mascot-idle-bob 3.6s ease-in-out infinite;
  order: 0;
  transition: transform 140ms var(--ease-standard, cubic-bezier(.2,.7,.2,1));
}
.mascot-container:active { transform: scale(0.96); }
.mascot-container.is-happy { animation: mascot-happy 0.6s ease-out; }
.mascot-container.is-sad { animation: mascot-sad 0.5s ease-out; }
.mascot-container.is-wow { animation: mascot-wow 0.5s ease-out; }
.mascot-svg { width: 100%; height: 100%; display: block; }
.mascot-sparks circle {
  animation: mascot-spark 2.4s ease-in-out infinite;
  transform-origin: center;
}
.mascot-sparks circle:nth-child(2) { animation-delay: .5s; }
.mascot-sparks circle:nth-child(3) { animation-delay: 1s; }
.mascot-sparks circle:nth-child(4) { animation-delay: 1.6s; }

.mascot-bubble {
  position: relative;
  order: 1;
  max-width: 300px;
  padding: 14px 18px;
  background: var(--white, #fff);
  /* Многослойная тень вместо чёткого 1px-бордера — глубина мягче */
  box-shadow:
    0 1px 2px rgba(101,31,255,.08),
    0 8px 24px rgba(101,31,255,.14),
    inset 0 0 0 1px rgba(101,31,255,.06);
  border-radius: 18px;
  font-size: 15px;
  line-height: 1.4;
  color: var(--fg-1, #232323);
  font-weight: 500;
  text-wrap: pretty;
  opacity: 0;
  transform: translateX(-8px) scale(.92);
  transform-origin: left bottom;
  transition: opacity .28s var(--ease-standard, ease-out),
              transform .32s var(--ease-bounce, cubic-bezier(.34,1.3,.64,1));
  pointer-events: none;
  margin-bottom: 60px;
}
.mascot-bubble.is-visible {
  opacity: 1;
  transform: translateX(0) scale(1);
}
.mascot-bubble::after {
  content: '';
  position: absolute;
  left: -7px; bottom: 24px;
  width: 14px; height: 14px;
  background: var(--white, #fff);
  /* Совпадает с inset-обводкой пузыря */
  box-shadow: -1px 1px 0 0 rgba(101,31,255,.06);
  transform: rotate(45deg);
}

@keyframes mascot-idle-bob {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
@keyframes mascot-happy {
  0% { transform: scale(1) rotate(0); }
  25% { transform: scale(1.1) rotate(-5deg); }
  50% { transform: scale(1.15) rotate(5deg); }
  75% { transform: scale(1.1) rotate(-3deg); }
  100% { transform: scale(1) rotate(0); }
}
@keyframes mascot-sad {
  0% { transform: translateY(0); }
  50% { transform: translateY(6px); }
  100% { transform: translateY(0); }
}
@keyframes mascot-wow {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
@keyframes mascot-spark {
  0%, 100% { opacity: .3; transform: scale(.8); }
  50% { opacity: 1; transform: scale(1.4); }
}

@media (max-width: 720px) {
  .mascot-root { left: 12px; bottom: 12px; gap: 8px; }
  .mascot-container { width: 84px; height: 100px; }
  .mascot-bubble { max-width: 220px; font-size: 13px; padding: 10px 14px; margin-bottom: 22px; }
}
`;

function injectMascotStyles() {
  if (document.getElementById('mascot-styles')) return;
  const style = document.createElement('style');
  style.id = 'mascot-styles';
  style.textContent = MASCOT_CSS;
  document.head.appendChild(style);
}

export function mountMascot(root = document.body) {
  injectMascotStyles();
  const el = document.createElement('div');
  el.className = 'mascot-root';
  el.innerHTML = `
    <div class="mascot-bubble" id="mascot-bubble"></div>
    <div class="mascot-container" id="mascot-container">
      ${MASCOT_SVG}
    </div>
  `;
  root.appendChild(el);

  const container = el.querySelector('#mascot-container');
  const bubble = el.querySelector('#mascot-bubble');
  const mouth = el.querySelector('.mascot-mouth');
  let hideTimer = null;

  const emotions = {
    idle:  'M50 84 Q60 90 70 84',
    happy: 'M48 80 Q60 96 72 80',
    sad:   'M50 90 Q60 82 70 90',
    think: 'M50 86 L70 86',
    wow:   'M55 86 Q60 92 65 86 Q60 80 55 86 Z',
  };

  function setEmotion(kind) {
    if (mouth && emotions[kind]) {
      mouth.setAttribute('d', emotions[kind]);
    }
    container.classList.remove('is-happy', 'is-sad', 'is-wow');
    if (kind === 'happy') container.classList.add('is-happy');
    else if (kind === 'sad') container.classList.add('is-sad');
    else if (kind === 'wow') container.classList.add('is-wow');
  }

  function say(text, opts = {}) {
    const { emotion = 'happy', duration = 4200 } = opts;
    if (hideTimer) clearTimeout(hideTimer);
    bubble.textContent = text;
    setEmotion(emotion);
    requestAnimationFrame(() => bubble.classList.add('is-visible'));
    if (duration > 0) {
      hideTimer = setTimeout(() => {
        bubble.classList.remove('is-visible');
        setEmotion('idle');
      }, duration);
    }
  }

  function hide() {
    if (hideTimer) clearTimeout(hideTimer);
    bubble.classList.remove('is-visible');
    setEmotion('idle');
  }

  container.addEventListener('click', () => {
    if (!bubble.classList.contains('is-visible')) {
      say('Тыкай на «Дальше», чтобы двигаться!', { duration: 3000 });
    } else {
      hide();
    }
  });

  return { say, hide, setEmotion, el };
}
