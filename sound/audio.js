/* ============================================================
   Звуковой мини-движок тренажёра «Звуковые волны».
   Общий для уроков и практик каталога /sound/.

   Правила использования:
   - звук запускается ТОЛЬКО по действию пользователя (кнопка/слайдер);
   - непрерывные голоса (dur = null) регистрируются в реестре live —
     страница обязана глушить их через stopAll(), когда шаг сменился
     (проверка canvas.isConnected в rAF-цикле).
   ============================================================ */

let actx = null, master = null;
const live = new Set();

export function ac() {
  if (!actx) {
    actx = new (window.AudioContext || window.webkitAudioContext)();
    const comp = actx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 6;
    master = actx.createGain();
    master.gain.value = 0.9;
    master.connect(comp);
    comp.connect(actx.destination);
  }
  if (actx.state === 'suspended') actx.resume().catch(() => {});
  return actx;
}

/* Голос с мягкой огибающей. dur = null → непрерывный (глушить вручную).
   invert: true — сигнал в противофазе (для демо «звук гасит звук»). */
export function voice({ freq = 440, type = 'sine', gain = 0.15, dur = null,
                        attack = 0.012, release = 0.09, when = 0,
                        filterFreq = null, invert = false }) {
  ac();
  const t0 = actx.currentTime + when;
  const o = actx.createOscillator();
  const g = actx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0001), t0 + attack);

  if (filterFreq) {
    const f = actx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = filterFreq;
    o.connect(f);
    f.connect(g);
  } else {
    o.connect(g);
  }
  if (invert) {
    const inv = actx.createGain();
    inv.gain.value = -1;
    g.connect(inv);
    inv.connect(master);
  } else {
    g.connect(master);
  }
  o.start(t0);

  const handle = {
    osc: o,
    extras: [],          // LFO и прочие вспомогательные узлы
    linked: [],          // связанные голоса, глушатся вместе
    stopped: false,
    setFreq(f) { try { o.frequency.setTargetAtTime(f, actx.currentTime, 0.02); } catch (e) {} },
    setGain(v) { try { g.gain.setTargetAtTime(Math.max(v, 0.0001), actx.currentTime, 0.03); } catch (e) {} },
    stop(rel = release) {
      if (handle.stopped) return;
      handle.stopped = true;
      const t = actx.currentTime;
      try {
        g.gain.cancelScheduledValues(t);
        g.gain.setValueAtTime(Math.max(g.gain.value, 0.0001), t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + rel);
        o.stop(t + rel + 0.05);
      } catch (e) {}
      handle.extras.forEach(x => { try { x.stop(t + rel + 0.05); } catch (e) {} });
      handle.linked.forEach(v => v.stop(rel));
      live.delete(handle);
    },
  };

  if (dur != null) {
    // самозавершающийся звук — глушить не нужно
    g.gain.setValueAtTime(gain, t0 + Math.max(attack, dur - release));
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.stop(t0 + dur + 0.05);
  } else {
    live.add(handle);
  }
  return handle;
}

/* Заглушить все непрерывные голоса (вызывать при уходе с шага). */
export function stopAll() {
  [...live].forEach(v => v.stop());
  live.clear();
}

/* Голоса насекомых для зацепки «комар и шмель». */
export function makeInsect(kind) {
  ac();
  if (kind === 'mosquito') {
    const v = voice({ freq: 600, type: 'sawtooth', gain: 0.08, filterFreq: 2600 });
    const lfo = actx.createOscillator(), lfoG = actx.createGain();
    lfo.frequency.value = 7;
    lfoG.gain.value = 28;
    lfo.connect(lfoG);
    lfoG.connect(v.osc.frequency);
    lfo.start();
    v.extras.push(lfo);
    v.linked.push(voice({ freq: 1200, type: 'sine', gain: 0.025 }));
    return v;
  }
  const v = voice({ freq: 130, type: 'sawtooth', gain: 0.13, filterFreq: 520 });
  const lfo = actx.createOscillator(), lfoG = actx.createGain();
  lfo.frequency.value = 4.5;
  lfoG.gain.value = 5;
  lfo.connect(lfoG);
  lfoG.connect(v.osc.frequency);
  lfo.start();
  v.extras.push(lfo);
  v.linked.push(voice({ freq: 65, type: 'sine', gain: 0.09 }));
  return v;
}
