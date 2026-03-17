<template>
  <div class="timer-wrap" :class="{ running: running, done: done }">
    <div class="timer-top">
      <span class="timer-label">⏱ Rest Timer</span>
      <div class="presets">
        <button v-for="s in presets" :key="s" @click="setTime(s)" class="preset-btn">{{ s }}s</button>
      </div>
    </div>
    <div class="timer-display">
      <svg class="ring-svg" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="34" fill="none" stroke="#2e2e3e" stroke-width="5"/>
        <circle
          cx="40" cy="40" r="34" fill="none"
          :stroke="done ? '#22c55e' : running ? '#f97316' : '#6366f1'"
          stroke-width="5"
          stroke-linecap="round"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
          transform="rotate(-90 40 40)"
          style="transition: stroke-dashoffset 0.9s linear, stroke 0.3s"
        />
      </svg>
      <div class="timer-time">{{ display }}</div>
    </div>
    <div class="timer-controls">
      <button class="ctrl-btn start" @click="toggle" :style="{ background: running ? '#ef444422' : '#f9731622', color: running ? '#ef4444' : '#f97316' }">
        {{ running ? '⏸ Pause' : done ? '🔄 Reset' : '▶ Start' }}
      </button>
      <button class="ctrl-btn" @click="reset">✕</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

const presets = [30, 60, 90, 120, 180]
const total = ref(90)
const remaining = ref(90)
const running = ref(false)
const done = ref(false)
let interval = null

const circumference = 2 * Math.PI * 34

const dashOffset = computed(() =>
  circumference - (remaining.value / total.value) * circumference
)

const display = computed(() => {
  const m = Math.floor(remaining.value / 60)
  const s = remaining.value % 60
  return `${m}:${s.toString().padStart(2, '0')}`
})

function setTime(s) {
  clearInterval(interval)
  running.value = false
  done.value = false
  total.value = s
  remaining.value = s
}

function toggle() {
  if (done.value) { reset(); return }
  if (running.value) {
    clearInterval(interval)
    running.value = false
  } else {
    running.value = true
    interval = setInterval(() => {
      if (remaining.value <= 1) {
        remaining.value = 0
        running.value = false
        done.value = true
        clearInterval(interval)
        ping()
      } else {
        remaining.value--
      }
    }, 1000)
  }
}

function reset() {
  clearInterval(interval)
  running.value = false
  done.value = false
  remaining.value = total.value
}

function ping() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
    osc.start()
    osc.stop(ctx.currentTime + 0.6)
  } catch {}
}

onUnmounted(() => clearInterval(interval))
</script>

<style scoped>
.timer-wrap {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 14px 16px;
  transition: border-color 0.3s;
}
.timer-wrap.running { border-color: #f9731655; }
.timer-wrap.done { border-color: #22c55e88; }

.timer-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.timer-label { font-size: 13px; font-weight: 600; color: var(--text-h); }

.presets { display: flex; gap: 4px; }
.preset-btn {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.15s;
}
.preset-btn:hover { color: var(--text-h); border-color: #555; }

.timer-display {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 12px;
}

.ring-svg { width: 80px; height: 80px; }

.timer-time {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 700;
  color: var(--text-h);
}

.timer-controls { display: flex; gap: 8px; }

.ctrl-btn {
  flex: 1;
  border-radius: 8px;
  border: 1px solid var(--border);
  padding: 7px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--surface);
  color: var(--text);
}
.ctrl-btn:hover { color: var(--text-h); }
.ctrl-btn.start { flex: 2; }
</style>
