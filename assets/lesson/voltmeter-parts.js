/* ============================================================
   Общие SVG-приборы вольтметра — переиспользуются во всех темах
   этого тренажёра (батарейка, лампа, провода, электроны).
   ============================================================ */

export const SHARED_DEFS = `
  <defs>
    <!-- Корпус батарейки: чёрный пластик с металлическим отблеском -->
    <linearGradient id="batBody" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#0f0f11"/>
      <stop offset=".3" stop-color="#333338"/>
      <stop offset=".55" stop-color="#4a4a52"/>
      <stop offset=".85" stop-color="#25252a"/>
      <stop offset="1" stop-color="#0f0f11"/>
    </linearGradient>
    <linearGradient id="batLabel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFE494"/>
      <stop offset=".5" stop-color="#FFD769"/>
      <stop offset="1" stop-color="#E8B330"/>
    </linearGradient>
    <linearGradient id="batAccent" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8B6FFF"/>
      <stop offset="1" stop-color="#6240FF"/>
    </linearGradient>
    <radialGradient id="batTerminal" cx=".35" cy=".3" r=".8">
      <stop offset="0" stop-color="#f3f4f7"/>
      <stop offset=".5" stop-color="#a8acb2"/>
      <stop offset="1" stop-color="#4a4d54"/>
    </radialGradient>
    <linearGradient id="batShine" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity=".35"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>

    <!-- Провода: красный (+) и синий (−) в изоляции -->
    <linearGradient id="wireRed" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FF6B7A"/>
      <stop offset=".5" stop-color="#D8232A"/>
      <stop offset="1" stop-color="#a51418"/>
    </linearGradient>
    <linearGradient id="wireBlue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#4a5568"/>
      <stop offset=".5" stop-color="#232323"/>
      <stop offset="1" stop-color="#0a0a0a"/>
    </linearGradient>

    <!-- Стеклянная колба лампы -->
    <radialGradient id="bulbGlass" cx=".35" cy=".3" r=".9">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".9"/>
      <stop offset=".4" stop-color="#fff9e0" stop-opacity=".7"/>
      <stop offset=".85" stop-color="#eaddb5" stop-opacity=".55"/>
      <stop offset="1" stop-color="#c9b98a" stop-opacity=".65"/>
    </radialGradient>
    <radialGradient id="bulbHot" cx=".5" cy=".55" r=".6">
      <stop offset="0" stop-color="#FFF3B0" stop-opacity="1"/>
      <stop offset=".35" stop-color="#FFD769" stop-opacity=".85"/>
      <stop offset=".7" stop-color="#FF9A28" stop-opacity=".35"/>
      <stop offset="1" stop-color="#FF9A28" stop-opacity="0"/>
    </radialGradient>
    <!-- Металлический цоколь E27 (винтовой) -->
    <linearGradient id="lampCap" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#7a7d84"/>
      <stop offset=".25" stop-color="#c8ccd3"/>
      <stop offset=".55" stop-color="#e6e9ee"/>
      <stop offset=".8" stop-color="#a3a7ae"/>
      <stop offset="1" stop-color="#5c5f66"/>
    </linearGradient>

    <!-- Свечение вокруг лампы -->
    <radialGradient id="lampGlow" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#FFE494" stop-opacity=".9"/>
      <stop offset=".45" stop-color="#FFD769" stop-opacity=".35"/>
      <stop offset="1" stop-color="#FFD769" stop-opacity="0"/>
    </radialGradient>

    <!-- Тень под объектами -->
    <radialGradient id="floorShadow" cx=".5" cy=".5" r=".5">
      <stop offset="0" stop-color="#232323" stop-opacity=".35"/>
      <stop offset="1" stop-color="#232323" stop-opacity="0"/>
    </radialGradient>

    <!-- Электрон -->
    <radialGradient id="electron" cx=".3" cy=".3" r=".8">
      <stop offset="0" stop-color="#F5FFA0"/>
      <stop offset=".5" stop-color="#CDFE00"/>
      <stop offset="1" stop-color="#88A800"/>
    </radialGradient>

    <!-- ============ Реалистичная батарейка ============ -->
    <!-- SVG-фильтр размытия для мягкой тени -->
    <filter id="realSoftShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="5"/>
    </filter>
    <!-- Матовый корпус — цилиндрический светотеневой градиент (иллюзия
         объёма у прямоугольного тела) -->
    <linearGradient id="realBattBody" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#0d0d0d"/>
      <stop offset=".15" stop-color="#242424"/>
      <stop offset=".5" stop-color="#333333"/>
      <stop offset=".85" stop-color="#242424"/>
      <stop offset="1" stop-color="#0d0d0d"/>
    </linearGradient>
    <!-- Жёлтая этикетка (Duracell-inspired: медная полоса вверху, ярко-жёлтый низ) -->
    <linearGradient id="realLabelYellow" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#F5C020"/>
      <stop offset=".5" stop-color="#F5B800"/>
      <stop offset="1" stop-color="#E5A800"/>
    </linearGradient>
    <linearGradient id="realCopperStrip" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#D4913E"/>
      <stop offset=".5" stop-color="#A4682C"/>
      <stop offset="1" stop-color="#6D4A15"/>
    </linearGradient>
    <!-- Хромированный металл клемм -->
    <radialGradient id="realMetalTerminal" cx=".3" cy=".3" r=".85">
      <stop offset="0" stop-color="#F5F5F5"/>
      <stop offset=".5" stop-color="#B0B0B0"/>
      <stop offset="1" stop-color="#4A4A4A"/>
    </radialGradient>

    <!-- ============ Реалистичная лампа накаливания ============ -->
    <!-- Стеклянная колба: холодный полупрозрачный градиент, сквозь него
         видна нить. По краям стекло плотнее (толще на просвет). -->
    <radialGradient id="realGlass" cx="42%" cy="34%" r="72%">
      <stop offset="0" stop-color="#ffffff" stop-opacity=".42"/>
      <stop offset="55%" stop-color="#dbe4ee" stop-opacity=".26"/>
      <stop offset="85%" stop-color="#b9c6d6" stop-opacity=".4"/>
      <stop offset="100%" stop-color="#9fb0c4" stop-opacity=".55"/>
    </radialGradient>
    <!-- Тёплое ядро (когда лампа горит) -->
    <radialGradient id="realWarmCore" cx="50%" cy="52%" r="55%">
      <stop offset="0" stop-color="#FFF6CC"/>
      <stop offset="38%" stop-color="#FFD861"/>
      <stop offset="72%" stop-color="#FF9E2E" stop-opacity=".55"/>
      <stop offset="100%" stop-color="#FF9E2E" stop-opacity="0"/>
    </radialGradient>
    <!-- Ореол-сияние вокруг лампы -->
    <radialGradient id="realHalo" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="#FFE9A8" stop-opacity=".85"/>
      <stop offset="40%" stop-color="#FFD861" stop-opacity=".35"/>
      <stop offset="100%" stop-color="#FFD861" stop-opacity="0"/>
    </radialGradient>
    <!-- Хромированный цоколь E27 (горизонтальный металлический блик) -->
    <linearGradient id="realCap" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#5f636b"/>
      <stop offset=".22" stop-color="#b6bcc6"/>
      <stop offset=".5" stop-color="#eef1f6"/>
      <stop offset=".78" stop-color="#9aa0ac"/>
      <stop offset="1" stop-color="#54585f"/>
    </linearGradient>
    <!-- Матовое горлышко (стекло у цоколя) -->
    <linearGradient id="realNeck" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#c8cdd6"/>
      <stop offset=".5" stop-color="#eef1f5"/>
      <stop offset="1" stop-color="#b8bec8"/>
    </linearGradient>

  </defs>
`;

/* Реалистичная батарейка «Крона» (вертикальная, «+» сверху, «−» снизу) */
export function batterySVG(labelText) {
  return `
    <g class="battery">
      <!-- Мягкая размытая тень под корпусом -->
      <ellipse cx="4" cy="106" rx="54" ry="8" fill="rgba(0,0,0,.32)" filter="url(#realSoftShadow)"/>

      <!-- + клемма СВЕРХУ (цилиндрический стад с гайкой) -->
      <ellipse cx="0" cy="-82" rx="15" ry="4" fill="#141414"/>
      <rect x="-15" y="-94" width="30" height="14" rx="2.5" fill="url(#realMetalTerminal)"/>
      <ellipse cx="0" cy="-94" rx="15" ry="3" fill="#DCDCDC"/>
      <circle cx="0" cy="-94" r="2.5" fill="#3a3a3a" opacity=".55"/>
      <text x="0" y="-102" text-anchor="middle" font-family="var(--font-display)"
            font-weight="500" font-size="16" fill="#141414">+</text>

      <!-- Корпус: чёрный пластик, вертикальный (расширен под крупную цифру) -->
      <rect x="-46" y="-80" width="92" height="180" rx="8" fill="url(#realBattBody)"/>
      <!-- Тонкая световая кромка сверху -->
      <path d="M-43,-79 Q0,-77 43,-79" stroke="rgba(255,255,255,.28)" stroke-width="1" fill="none"/>
      <!-- Ambient occlusion внизу -->
      <rect x="-46" y="90" width="92" height="10" rx="4" fill="rgba(0,0,0,.35)"/>

      <!-- Жёлтая этикетка -->
      <rect x="-40" y="-58" width="80" height="140" rx="3" fill="url(#realLabelYellow)"/>
      <!-- Медная полоса сверху этикетки -->
      <rect x="-40" y="-58" width="80" height="22" fill="url(#realCopperStrip)"/>
      <!-- Разделительная тёмная линия -->
      <rect x="-40" y="-37" width="80" height="1.5" fill="#141414" opacity=".8"/>

      <!-- Надпись сверху этикетки -->
      <text x="0" y="-44" text-anchor="middle" font-family="var(--font-sans)"
            font-weight="500" font-size="7" fill="#F5E8B8"
            letter-spacing="0.28em">ЩЕЛОЧНАЯ</text>

      <!-- Крупная маркировка напряжения — textLength вписывает любое
           значение (в т.ч. дробное «6,5 В») в ширину этикетки -->
      <text x="0" y="14" text-anchor="middle" font-family="var(--font-display)"
            font-weight="500" font-size="34" fill="#141414"
            letter-spacing="-0.01em" textLength="70" lengthAdjust="spacingAndGlyphs">${labelText}</text>

      <!-- Тип батарейки внизу -->
      <text x="0" y="52" text-anchor="middle" font-family="var(--font-sans)"
            font-weight="500" font-size="8" fill="#3A2400"
            letter-spacing="0.28em">КРОНА</text>

      <!-- Штрих-линия под КРОНА -->
      <line x1="-28" y1="62" x2="28" y2="62" stroke="#3A2400" stroke-width=".6" opacity=".5"/>
      <text x="0" y="72" text-anchor="middle" font-family="var(--font-sans)"
            font-weight="500" font-size="5" fill="#3A2400"
            letter-spacing="0.2em" opacity=".7">СРОК · 2029</text>

      <!-- Sheen блик по этикетке -->
      <path d="M-40,-6 Q0,-2 40,-6 L40,2 Q0,6 -40,2 Z" fill="rgba(255,255,255,.14)"/>

      <!-- − клемма СНИЗУ (плоская металлическая пластина) -->
      <rect x="-28" y="100" width="56" height="12" rx="2" fill="url(#realMetalTerminal)"/>
      <ellipse cx="0" cy="100" rx="28" ry="3" fill="rgba(0,0,0,.35)"/>
      <text x="0" y="126" text-anchor="middle" font-family="var(--font-display)"
            font-weight="500" font-size="18" fill="#141414">−</text>
    </g>
  `;
}

/* Реалистичная лампа накаливания A60 с цоколем E27 (intensity 0..1) */
export function lampSVG(intensity) {
  const t = Math.max(0, Math.min(1, intensity));
  const halo = 0.04 + t * 0.85;
  const glow = 0.15 + t * 0.85;
  return `
    <g class="lamp">
      <!-- Размытая тень пола -->
      <ellipse cx="4" cy="146" rx="52" ry="9" fill="rgba(0,0,0,.26)" filter="url(#realSoftShadow)"/>

      <!-- Ореол-сияние вокруг лампы -->
      <circle cx="0" cy="-44" r="118" fill="url(#realHalo)" opacity="${halo}"/>

      <!-- ЦОКОЛЬ E27 (винтовой хромированный) -->
      <!-- контакт снизу (припой) -->
      <ellipse cx="0" cy="118" rx="9" ry="6" fill="#8a8d94"/>
      <ellipse cx="-1.5" cy="116" rx="4" ry="3" fill="#c8ccd2"/>
      <!-- изолятор (тёмное кольцо) -->
      <path d="M-16 100 L16 100 L11 112 Q11 114 8 114 L-8 114 Q-11 114 -11 112 Z" fill="#2a2a2d"/>
      <!-- гильза цоколя -->
      <rect x="-26" y="44" width="52" height="58" rx="4" fill="url(#realCap)"/>
      <!-- витки резьбы: чередование тёмной канавки и светлого гребня -->
      <g>
        <path d="M-26 52 Q0 57 26 52" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="2"/>
        <path d="M-26 55 Q0 60 26 55" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1.2"/>
        <path d="M-26 63 Q0 68 26 63" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="2"/>
        <path d="M-26 66 Q0 71 26 66" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1.2"/>
        <path d="M-26 74 Q0 79 26 74" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="2"/>
        <path d="M-26 77 Q0 82 26 77" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1.2"/>
        <path d="M-26 85 Q0 90 26 85" fill="none" stroke="rgba(0,0,0,.28)" stroke-width="2"/>
        <path d="M-26 88 Q0 93 26 88" fill="none" stroke="rgba(255,255,255,.5)" stroke-width="1.2"/>
      </g>

      <!-- ГОРЛЫШКО (матовый переход стекла к цоколю) -->
      <path d="M-24 46 Q-26 30 -22 20 L22 20 Q26 30 24 46 Z" fill="url(#realNeck)"/>

      <!-- ТЁПЛОЕ ЯДРО (виден нагрев, зависит от intensity) -->
      <ellipse cx="0" cy="-42" rx="46" ry="54" fill="url(#realWarmCore)" opacity="${t}"/>

      <!-- НИТЬ НАКАЛА: стеклянная ножка + держатели + светящаяся спираль -->
      <line x1="0" y1="44" x2="0" y2="-18" stroke="#cfd4dc" stroke-width="3" opacity=".7"/>
      <line x1="-11" y1="-18" x2="-11" y2="-46" stroke="#4a4d54" stroke-width="1.6"/>
      <line x1="11" y1="-18" x2="11" y2="-46" stroke="#4a4d54" stroke-width="1.6"/>
      <path d="M-11 -46 Q-7 -52 -3 -46 T5 -46 T11 -46"
            stroke="#FFB733" stroke-width="3" fill="none" stroke-linecap="round" opacity="${glow}">
        <animate attributeName="opacity"
          values="${glow};${Math.max(0.12, glow - 0.15)};${glow}" dur="1s" repeatCount="indefinite"/>
      </path>
      <path d="M-11 -46 Q-7 -52 -3 -46 T5 -46 T11 -46"
            stroke="#FFF2B0" stroke-width="1.3" fill="none" stroke-linecap="round" opacity="${glow}">
        <animate attributeName="opacity"
          values="${glow};${Math.max(0.1, glow - 0.25)};${glow}" dur="1.3s" repeatCount="indefinite"/>
      </path>

      <!-- СТЕКЛЯННАЯ КОЛБА A60 (полупрозрачная, поверх нити) -->
      <path d="M0 40
               C -30 40, -52 20, -52 -30
               C -52 -75, -28 -102, 0 -102
               C 28 -102, 52 -75, 52 -30
               C 52 20, 30 40, 0 40 Z"
            fill="url(#realGlass)" stroke="rgba(255,255,255,.35)" stroke-width="1"/>

      <!-- Блики на стекле: крупный левый + тонкий правый -->
      <path d="M-34 -20 Q-46 -50 -26 -80" stroke="#ffffff" stroke-width="7"
            stroke-linecap="round" fill="none" opacity=".5"/>
      <path d="M28 -66 Q36 -74 34 -58" stroke="#ffffff" stroke-width="3"
            stroke-linecap="round" fill="none" opacity=".4"/>
    </g>
  `;
}

/* Реалистичный провод с изоляцией — путь + узкая жила внутри. */
export function wireSVG(id, gradId, d) {
  return `
    <path d="${d}" stroke="url(#${gradId})" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path id="${id || ''}" d="${d}" stroke="#fff" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity=".18"/>
  `;
}

/* Электроны, бегущие по ЕДИНОМУ замкнутому контуру цепи — от «+» клеммы
   по верхнему проводу → сквозь лампу → по нижнему проводу → к «−» → обратно. */
export function electronLoop(n = 7, dur = 5) {
  // Замкнутый путь (по часовой стрелке от «+» клеммы сверху)
  const loop = 'M 120 74 L 120 18 L 472 18 L 472 250 L 500 282 L 120 322 L 120 290 L 120 74 Z';
  let dots = '';
  for (let i = 0; i < n; i++) {
    const begin = (i * dur / n).toFixed(2);
    dots += `<circle r="4" fill="url(#electron)">
      <animateMotion dur="${dur}s" repeatCount="indefinite" begin="${begin}s" path="${loop}"/>
    </circle>`;
  }
  return `<g class="electron-loop">${dots}</g>`;
}

/* Подпись напряжения вдоль провода: белая pill с чёрным текстом. */
export function voltageLabel(x, y, text, id) {
  return `
    <g transform="translate(${x}, ${y})" ${id ? `id="${id}"` : ''}>
      <rect x="-22" y="-11" width="44" height="22" rx="11" fill="#ffffff" stroke="#141414" stroke-width=".8"/>
      <text x="0" y="4" text-anchor="middle"
            font-family="var(--font-sans)" font-weight="500" font-size="13" fill="#141414"
            font-variant-numeric="tabular-nums">${text}</text>
    </g>
  `;
}

/* ============================================================
   Вольтметр-прибор со шкалой и стрелкой (плоский SVG, вид спереди).
   Переиспользуется в темах «устройство», «цена деления», «показания».
   opts:
     value        — куда показывает стрелка (В)
     max          — предел шкалы (В)
     majorStep    — шаг оцифрованных делений (В)
     minorPerMajor— мелких делений в одном крупном
     highlight    — 'scale'|'needle'|'terminals'|null — что подсветить фиолетовым
     ids          — { needle, tick } проставить id (для интерактива)
   Центр стрелки (160,214), viewBox 320x260.
   ============================================================ */
export function meterSVG(opts = {}) {
  const {
    value = 0, max = 6, majorStep = 1, minorPerMajor = 5,
    highlight = null, unit = 'В',
  } = opts;
  const cx = 160, cy = 214, R = 150;
  const A0 = -52, A1 = 52;                       // углы стрелки от вертикали
  const N = Math.round(max / majorStep) * minorPerMajor;
  const ang = v => A0 + (v / max) * (A1 - A0);   // значение → угол
  const pt = (deg, r) => {
    const a = deg * Math.PI / 180;
    return [cx + r * Math.sin(a), cy - r * Math.cos(a)];
  };
  const HL = '#6240FF';

  // деления + цифры
  let ticks = '';
  for (let i = 0; i <= N; i++) {
    const a = A0 + (A1 - A0) * i / N;
    const major = i % minorPerMajor === 0;
    const [x1, y1] = pt(a, R);
    const [x2, y2] = pt(a, R - (major ? 20 : 11));
    const col = (highlight === 'scale') ? HL : '#15161d';
    ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${col}" stroke-width="${major ? 2.6 : 1.4}"/>`;
    if (major) {
      const val = (i / minorPerMajor) * majorStep;
      const [nx, ny] = pt(a, R - 36);
      ticks += `<text x="${nx.toFixed(1)}" y="${(ny + 6).toFixed(1)}" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="20" fill="${col}">${val}</text>`;
    }
  }
  // красная зона перегрузки (последние 12% шкалы)
  const [rx0, ry0] = pt(A0 + (A1 - A0) * 0.88, R);
  const [rx1, ry1] = pt(A1, R);
  const overArc = `<path d="M ${rx0.toFixed(1)} ${ry0.toFixed(1)} A ${R} ${R} 0 0 1 ${rx1.toFixed(1)} ${ry1.toFixed(1)}" fill="none" stroke="#d8232a" stroke-width="5"/>`;

  // стрелка
  const na = ang(Math.max(0, Math.min(max, value)));
  const [nx, ny] = pt(na, R - 26);
  const needleCol = (highlight === 'needle') ? HL : '#15161d';

  // клеммы
  const termCol = (highlight === 'terminals') ? HL : '#3a3d46';

  return `
    <svg viewBox="0 0 320 274" class="circuit-svg meter-svg">
      <defs>
        <radialGradient id="dialFace" cx="50%" cy="42%" r="62%">
          <stop offset="0" stop-color="#fbfaf4"/>
          <stop offset="1" stop-color="#ece9dd"/>
        </radialGradient>
        <linearGradient id="meterCase" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#5a5d66"/>
          <stop offset="1" stop-color="#2f323a"/>
        </linearGradient>
      </defs>
      <!-- тень -->
      <ellipse cx="160" cy="250" rx="120" ry="12" fill="rgba(0,0,0,.18)"/>
      <!-- корпус -->
      <rect x="18" y="10" width="284" height="228" rx="18" fill="url(#meterCase)"/>
      <rect x="26" y="18" width="268" height="184" rx="12" fill="#15151b"/>
      <!-- циферблат -->
      <rect x="32" y="24" width="256" height="172" rx="9" fill="url(#dialFace)"/>
      <!-- дуга шкалы -->
      <path d="M ${pt(A0, R)[0].toFixed(1)} ${pt(A0, R)[1].toFixed(1)} A ${R} ${R} 0 0 1 ${pt(A1, R)[0].toFixed(1)} ${pt(A1, R)[1].toFixed(1)}" fill="none" stroke="${highlight === 'scale' ? HL : '#15161d'}" stroke-width="2.4"/>
      ${overArc}
      ${ticks}
      <!-- символ единицы + магнитоэлектрическая подковка -->
      <text x="160" y="150" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-weight="700" font-size="20" fill="#3a3d46">${unit}</text>
      <path d="M 128 156 A 9 9 0 0 1 146 156" fill="none" stroke="#3a3d46" stroke-width="2"/>
      <!-- стрелка -->
      <line id="${opts.ids?.needle || ''}" x1="${cx}" y1="${cy}" x2="${nx.toFixed(1)}" y2="${ny.toFixed(1)}" stroke="${needleCol}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="${cx}" cy="${cy}" r="8" fill="#15161d"/>
      <circle cx="${cx}" cy="${cy}" r="3" fill="#6a6d74"/>
      <!-- клеммы «+» / «−» -->
      <g>
        <circle cx="108" cy="224" r="12" fill="${termCol}"/>
        <circle cx="108" cy="224" r="5" fill="#c8ccd3"/>
        <text x="108" y="252" text-anchor="middle" font-family="var(--font-display)" font-weight="500" font-size="18" fill="${highlight === 'terminals' ? HL : '#3a3d46'}">−</text>
        <circle cx="212" cy="224" r="12" fill="${termCol}"/>
        <circle cx="212" cy="224" r="5" fill="#f0c0c0"/>
        <text x="212" y="250" text-anchor="middle" font-family="var(--font-display)" font-weight="500" font-size="16" fill="${highlight === 'terminals' ? HL : '#3a3d46'}">+</text>
      </g>
    </svg>
  `;
}
