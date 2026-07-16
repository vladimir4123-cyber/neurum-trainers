/* ============================================================
   Общий 2D SVG-динамометр для тем и практик тренажёра.
   Светлая Neuroom-палитра: корпус светлый, деления #2B2B33,
   пружина #8A8F9C, указатель #E5484D.

   dynoSVG({ spec, value, weights, item, labels, h })
     spec    — { max, numStep, minor }: предел, шаг чисел,
               делений между соседними числами
     value   — сила в ньютонах (положение указателя и пружины)
     weights — сколько грузиков по 100 г висит на крючке
     item    — эмодзи предмета на крючке (вместо грузиков)
     labels  — подписать детали прибора
     h       — высота viewBox (по умолчанию 620)
   ============================================================ */

export const fmt = v => String(Math.round(v * 1000) / 1000).replace('.', ',');
export const priceOf = spec => spec.numStep / spec.minor;

const CX = 161;              // ось прибора
const Y0 = 84, SPAN = 226;   // ноль шкалы и её длина по y (растянута по корпусу)
const ROD = 254;             // стержень: от указателя до крючка

export function dynoSVG(opts = {}) {
  const {
    spec = { max: 5, numStep: 1, minor: 5 },
    value = 0, weights = 0, item = null, labels = false, h = 620,
  } = opts;

  const frac = Math.min(value / spec.max, 1.04);
  const py = +(Y0 + SPAN * frac).toFixed(1);   // y указателя
  const hy = +(py + ROD).toFixed(1);           // y верха крючка

  /* --- шкала --- */
  const N = Math.round(spec.max / spec.numStep) * spec.minor;
  let ticks = '';
  for (let i = 0; i <= N; i++) {
    const y = +(Y0 + SPAN * i / N).toFixed(1);
    const major = i % spec.minor === 0;
    const mid = !major && spec.minor % 2 === 0 && i % spec.minor === spec.minor / 2;
    const len = major ? 22 : mid ? 15 : 10;
    ticks += `<line x1="148" y1="${y}" x2="${148 - len}" y2="${y}" stroke="#2B2B33" stroke-width="${major ? 2.6 : 1.4}"/>`;
    if (major) {
      ticks += `<text x="${148 - len - 8}" y="${y}" text-anchor="end" dominant-baseline="central" font-family="var(--font-display), sans-serif" font-weight="500" font-size="18" fill="#2B2B33">${fmt(i / spec.minor * spec.numStep)}</text>`;
    }
  }

  /* --- пружина: зигзаг от крепления до указателя --- */
  const sTop = 68, sBot = py - 8, coils = 12, dy = (sBot - sTop) / coils;
  let spring = `M${CX} ${sTop}`;
  for (let i = 1; i < coils; i++) spring += ` L${i % 2 ? CX - 7 : CX + 7} ${(sTop + dy * i).toFixed(1)}`;
  spring += ` L${CX} ${sBot.toFixed(1)}`;

  /* --- груз на крючке --- */
  let cargo = '';
  for (let i = 0; i < weights; i++) {
    const ty = hy + 34 + i * 24;
    cargo += `
      <rect x="${CX - 28}" y="${ty}" width="56" height="20" rx="5" fill="#C4C9D4" stroke="#8A8F9C" stroke-width="1.5"/>
      <text x="${CX}" y="${ty + 14.5}" text-anchor="middle" font-family="var(--font-sans)" font-size="11" fill="#4A4E58">100 г</text>`;
  }
  if (item) cargo += `<text x="${CX}" y="${hy + 72}" text-anchor="middle" font-size="48">${item}</text>`;

  /* --- подписи деталей --- */
  let tags = '';
  if (labels) {
    const tag = (x1, y1, x2, y2, tx, ty, text, anchor = 'start') => `
      <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#C9CEDA" stroke-width="1.6"/>
      <text x="${tx}" y="${ty}" text-anchor="${anchor}" font-family="var(--font-sans)" font-size="15" fill="#5A5D66">${text}</text>`;
    tags =
      tag(177, 26, 208, 26, 213, 31, 'кольцо') +
      tag(168, 118, 212, 102, 216, 106, 'пружина') +
      tag(126, 186, 78, 172, 74, 176, 'шкала', 'end') +
      tag(176, py, 212, py + 34, 216, py + 39, 'указатель') +
      tag(174, hy + 16, 214, hy + 8, 218, hy + 13, 'крючок');
  }

  return `
  <svg viewBox="0 0 320 ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Динамометр">
    <!-- кольцо и крепление -->
    <circle cx="${CX}" cy="26" r="14" fill="none" stroke="#8A8F9C" stroke-width="5"/>
    <rect x="${CX - 3}" y="38" width="6" height="14" rx="3" fill="#8A8F9C"/>
    <!-- корпус -->
    <rect x="105" y="50" width="112" height="284" rx="16" fill="#FDFCF7" stroke="#C9CEDA" stroke-width="2.5"/>
    <text x="121" y="${(Y0 - 22).toFixed(1)}" text-anchor="end" dominant-baseline="central" font-family="Georgia, serif" font-style="italic" font-weight="700" font-size="18" fill="#2B2B33">Н</text>
    <!-- прорезь -->
    <rect x="152" y="64" width="18" height="252" rx="8" fill="#EEF0F6" stroke="#D5D9E2" stroke-width="1.5"/>
    <!-- красная зона перегрузки: полупрозрачная полоса по прорези -->
    <rect x="152" y="${(Y0 + SPAN * 0.9).toFixed(1)}" width="18" height="${(SPAN * 0.1 + 4).toFixed(1)}" rx="6" fill="#E5484D" opacity=".22"/>
    ${ticks}
    <!-- пружина -->
    <path d="${spring}" fill="none" stroke="#8A8F9C" stroke-width="2.6" stroke-linejoin="round"/>
    <!-- стержень и крючок -->
    <line x1="${CX}" y1="${py + 2}" x2="${CX}" y2="${hy}" stroke="#8A8F9C" stroke-width="5" stroke-linecap="round"/>
    <path d="M${CX} ${hy} C ${CX + 16} ${hy + 6}, ${CX + 15} ${hy + 24}, ${CX} ${hy + 28} C ${CX - 11} ${hy + 31}, ${CX - 15} ${hy + 22}, ${CX - 11} ${hy + 14}" fill="none" stroke="#8A8F9C" stroke-width="4.5" stroke-linecap="round"/>
    ${cargo}
    <!-- указатель -->
    <polygon points="134,${py} 148,${py - 6} 148,${py + 6}" fill="#E5484D"/>
    <rect x="148" y="${py - 2.5}" width="26" height="5" rx="2.5" fill="#E5484D"/>
    ${tags}
  </svg>`;
}
