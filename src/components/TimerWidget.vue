<template>
  <div class="timer-wrap">
    <div class="timer-display" :class="{ running, done: remaining === 0 }">
      {{ formatted }}
    </div>
    <div class="timer-btns">
      <button class="t-btn start" @click="toggle">{{ running ? '⏸ Pause' : (remaining < props.seconds && remaining > 0 ? '▶ Resume' : '▶ Start') }}</button>
      <button class="t-btn reset" @click="reset">↺ Reset</button>
    </div>
    <div v-if="remaining === 0" class="timer-done">✅ Time's up!</div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

const props = defineProps({ seconds: Number })

const remaining = ref(props.seconds)
const running = ref(false)
let interval = null

const formatted = computed(() => {
  const m = Math.floor(remaining.value / 60)
  const s = remaining.value % 60
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`
})

function toggle() {
  if (remaining.value === 0) return
  running.value = !running.value
  if (running.value) {
    interval = setInterval(() => {
      remaining.value--
      if (remaining.value === 0) { running.value = false; clearInterval(interval) }
    }, 1000)
  } else {
    clearInterval(interval)
  }
}

function reset() {
  clearInterval(interval)
  running.value = false
  remaining.value = props.seconds
}

onUnmounted(() => clearInterval(interval))
</script>

<style scoped>
.timer-wrap { display: flex; flex-direction: column; align-items: center; gap: 8px; background: var(--surface); border-radius: 12px; padding: 12px; }
.timer-display { font-size: 36px; font-weight: 800; color: var(--text-h); letter-spacing: 2px; transition: color 0.3s; }
.timer-display.running { color: #f97316; }
.timer-display.done { color: #22c55e; }
.timer-btns { display: flex; gap: 8px; }
.t-btn { padding: 7px 18px; border-radius: 8px; font-size: 13px; font-weight: 700; border: none; cursor: pointer; transition: opacity 0.2s; }
.t-btn.start { background: #f97316; color: #fff; }
.t-btn.reset { background: var(--surface2); color: var(--text); border: 1px solid var(--border); }
.t-btn:hover { opacity: 0.85; }
.timer-done { font-size: 13px; font-weight: 700; color: #22c55e; }
</style>
