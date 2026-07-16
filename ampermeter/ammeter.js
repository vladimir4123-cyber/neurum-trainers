/* ============================================================
   Светлый 2D-амперметр (SVG) — общий генератор для тем и практик.

   ammeterSVG({ max, numStep, minor, unit, value }) → строка <svg>
     max      — предел шкалы (например 3)
     numStep  — шаг подписанных чисел (например 1)
     minor    — число делений между соседними числами
     value    — куда поставить стрелку сразу
     Цена деления = numStep / minor.

   setAmmeterNeedle(root, value, max)          — мгновенно
   animateAmmeterNeedle(root, value, max, dur) — с плавным ходом
   ============================================================ */

export const AM_START = -52, AM_END = 52;   // углы стрелки от вертикали, °
const CX = 180, CY = 200, R = 150;          // ось стрелки и радиус шкалы

export function ammeterAngle(value, max) {
  const frac = Math.max(-0.07, Math.min(value / max, 1.045));
  return AM_START + (AM_END - AM_START) * frac;
}

function pt(aDeg, r) {
  const a = aDeg * Math.PI / 180;
  return [CX + r * Math.sin(a), CY - r * Math.cos(a)];
}

function arcPath(a0, a1, r) {
  const [x0, y0] = pt(a0, r), [x1, y1] = pt(a1, r);
  return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`;
}

export function ammeterSVG({ max, numStep, minor, unit = 'А', value = 0 }) {
  const N = Math.round(max / numStep) * minor;
  let ticks = '';
  for (let i = 0; i <= N; i++) {
    const t = AM_START + (AM_END - AM_START) * i / N;
    const major = i % minor === 0;
    const mid = !major && minor % 2 === 0 && i % minor === minor / 2;
    const len = major ? 18 : mid ? 13 : 9;
    const [x1, y1] = pt(t, R), [x2, y2] = pt(t, R - len);
    ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#2B2B33" stroke-width="${major ? 2.6 : mid ? 1.8 : 1.3}"/>`;
    if (major) {
      const [nx, ny] = pt(t, R + 18);
      ticks += `<text x="${nx.toFixed(1)}" y="${(ny + 7).toFixed(1)}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="21" fill="#2B2B33">${(i / minor) * numStep}</text>`;
    }
  }
  const a = ammeterAngle(value, max);
  return `
  <svg viewBox="0 0 360 300" xmlns="http://www.w3.org/2000/svg" class="ammeter-svg" role="img" aria-label="Амперметр">
    <rect x="8" y="8" width="344" height="270" rx="20" fill="#ECECF3" stroke="#D5D6E0" stroke-width="1.5"/>
    <g fill="#C6C7D2">
      <circle cx="26" cy="26" r="5"/><circle cx="334" cy="26" r="5"/>
      <circle cx="26" cy="260" r="5"/><circle cx="334" cy="260" r="5"/>
    </g>
    <rect x="22" y="20" width="316" height="192" rx="12" fill="#FFFFFF" stroke="#E3E4EC" stroke-width="1.5"/>
    <path d="${arcPath(AM_START + (AM_END - AM_START) * 0.9, AM_END, R + 3)}" stroke="#E5484D" stroke-width="5" fill="none" stroke-linecap="round"/>
    ${ticks}
    <text x="146" y="190" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="24" fill="#2B2B33">${unit}</text>
    <text x="224" y="188" text-anchor="middle" font-family="Georgia, serif" font-size="14" fill="#8A8F9C">⎓ 1,5</text>
    <g data-needle data-angle="${a}" transform="rotate(${a.toFixed(2)} ${CX} ${CY})">
      <line x1="${CX}" y1="${CY + 10}" x2="${CX}" y2="${CY - (R - 22)}" stroke="#E5484D" stroke-width="3.5" stroke-linecap="round"/>
    </g>
    <circle cx="${CX}" cy="${CY}" r="8" fill="#2B2B33"/>
    <circle cx="${CX}" cy="${CY}" r="3" fill="#ECECF3"/>
    <circle cx="120" cy="245" r="13" fill="#2B2B33"/>
    <text x="120" y="251" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="700" font-size="16" fill="#fff">−</text>
    <circle cx="240" cy="245" r="13" fill="#E5484D"/>
    <text x="240" y="251" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="700" font-size="16" fill="#fff">+</text>
  </svg>`;
}

export function setAmmeterNeedle(root, value, max) {
  const el = root.querySelector('[data-needle]');
  if (!el) return;
  const a = ammeterAngle(value, max);
  el.dataset.angle = a;
  el.setAttribute('transform', `rotate(${a} ${CX} ${CY})`);
}

export function animateAmmeterNeedle(root, value, max, dur = 800) {
  const el = root.querySelector('[data-needle]');
  if (!el) return;
  const from = parseFloat(el.dataset.angle);
  const to = ammeterAngle(value, max);
  const t0 = performance.now();
  const ease = t => 1 - Math.pow(1 - t, 3);
  const frame = now => {
    if (!el.isConnected) return;
    const k = Math.min(1, (now - t0) / dur);
    const a = from + (to - from) * ease(k);
    el.dataset.angle = a;
    el.setAttribute('transform', `rotate(${a} ${CX} ${CY})`);
    if (k < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
