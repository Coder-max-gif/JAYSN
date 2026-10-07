"use client";

import { useStore } from "@/store/useStore";

/**
 * Optional sound, off by default. Everything is synthesised with Web Audio, no files.
 * Ambient bed: filtered noise wind plus a low two oscillator drone.
 * UI: short filtered ticks on hover and click, a noise whoosh on page transitions,
 * and a soft grain texture whose level follows scroll velocity.
 */

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let textureGain: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;
let raf = 0;

function makeNoise(c: AudioContext) {
  const len = c.sampleRate * 2;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  for (let i = 0; i < len; i++) {
    // Brown noise: softer than white, reads as wind
    const w = Math.random() * 2 - 1;
    last = (last + 0.02 * w) / 1.02;
    d[i] = last * 3.5;
  }
  return buf;
}

function build() {
  if (ctx) return;
  const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0;
  master.connect(ctx.destination);
  noiseBuffer = makeNoise(ctx);

  // Wind
  const wind = ctx.createBufferSource();
  wind.buffer = noiseBuffer;
  wind.loop = true;
  const windFilter = ctx.createBiquadFilter();
  windFilter.type = "lowpass";
  windFilter.frequency.value = 420;
  windFilter.Q.value = 0.6;
  const windGain = ctx.createGain();
  windGain.gain.value = 0.16;
  // Slow gusts
  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.07;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 180;
  lfo.connect(lfoGain).connect(windFilter.frequency);
  wind.connect(windFilter).connect(windGain).connect(master);
  wind.start();
  lfo.start();

  // Low tone
  const droneGain = ctx.createGain();
  droneGain.gain.value = 0.035;
  [55, 82.4].forEach((f) => {
    const o = ctx!.createOscillator();
    o.type = "sine";
    o.frequency.value = f;
    o.connect(droneGain);
    o.start();
  });
  droneGain.connect(master);

  // Scroll texture
  const tex = ctx.createBufferSource();
  tex.buffer = noiseBuffer;
  tex.loop = true;
  const texFilter = ctx.createBiquadFilter();
  texFilter.type = "bandpass";
  texFilter.frequency.value = 2400;
  texFilter.Q.value = 1.2;
  textureGain = ctx.createGain();
  textureGain.gain.value = 0;
  tex.connect(texFilter).connect(textureGain).connect(master);
  tex.start();
}

function fadeTo(value: number, seconds: number) {
  if (!ctx || !master) return;
  const t = ctx.currentTime;
  master.gain.cancelScheduledValues(t);
  master.gain.setValueAtTime(master.gain.value, t);
  master.gain.linearRampToValueAtTime(value, t + seconds);
}

function loop() {
  if (ctx && textureGain) {
    const v = Math.min(1, Math.abs(useStore.getState().live.scroll.velocity) / 40);
    textureGain.gain.setTargetAtTime(v * 0.05, ctx.currentTime, 0.15);
  }
  raf = requestAnimationFrame(loop);
}

function setOn(on: boolean) {
  if (on) {
    build();
    ctx?.resume();
    fadeTo(0.9, 1.2);
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(loop);
  } else if (ctx) {
    fadeTo(0, 0.8);
    cancelAnimationFrame(raf);
    const c = ctx;
    window.setTimeout(() => {
      if (!useStore.getState().soundOn) c.suspend();
    }, 900);
  }
}

function blip(freq: number, dur: number, gain: number) {
  const s = useStore.getState();
  if (!s.soundOn || s.reducedMotion || !ctx || !master || !noiseBuffer) return;
  const t = ctx.currentTime;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer;
  const f = ctx.createBiquadFilter();
  f.type = "bandpass";
  f.frequency.value = freq;
  f.Q.value = 8;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(master);
  src.start(t);
  src.stop(t + dur + 0.05);
}

export const sfx = {
  hover: () => blip(3200, 0.06, 0.25),
  click: () => blip(1400, 0.12, 0.5),
  whoosh: () => {
    const s = useStore.getState();
    if (!s.soundOn || s.reducedMotion || !ctx || !master || !noiseBuffer) return;
    const t = ctx.currentTime;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    const f = ctx.createBiquadFilter();
    f.type = "bandpass";
    f.Q.value = 0.9;
    f.frequency.setValueAtTime(300, t);
    f.frequency.exponentialRampToValueAtTime(2200, t + 0.9);
    f.frequency.exponentialRampToValueAtTime(400, t + 1.8);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.5, t + 0.8);
    g.gain.linearRampToValueAtTime(0, t + 1.8);
    src.connect(f).connect(g).connect(master);
    src.start(t);
    src.stop(t + 1.9);
  },
};

/** Subscribes the engine to the store. Returns a cleanup. */
export function initSound() {
  let prev = useStore.getState().soundOn;
  const unsub = useStore.subscribe((s) => {
    const on = s.soundOn && !s.reducedMotion;
    if (on !== prev) {
      prev = on;
      setOn(on);
    }
  });
  return () => {
    unsub();
    cancelAnimationFrame(raf);
  };
}
