<template>
  <div class="page">
    <div class="tools-grid">
      <!-- Vertical Jump Calculator -->
      <div class="tool-card card">
        <div class="tool-header">
          <div class="tool-icon-wrap" style="background:#f9731622">⬆️</div>
          <div class="tool-title">Vertical Jump Calculator</div>
        </div>
        <div class="form-group">
          <label class="form-label">Standing Reach (inches)</label>
          <input v-model="vjCalc.reach" type="number" placeholder="e.g. 84" />
        </div>
        <div class="form-group">
          <label class="form-label">Jump Reach (inches)</label>
          <input v-model="vjCalc.jumpReach" type="number" placeholder="e.g. 104" />
        </div>
        <div class="tool-result" v-if="vjResult !== null">
          <span class="result-val">{{ vjResult }}"</span>
          <span class="result-label">Vertical Jump</span>
          <span class="result-grade" :style="{ color: vjGrade.color }">{{ vjGrade.label }}</span>
        </div>
        <button class="btn-primary" @click="calcVJ">Calculate</button>
      </div>

      <!-- Dunk Calculator -->
      <div class="tool-card card">
        <div class="tool-header">
          <div class="tool-icon-wrap" style="background:#6366f122">🏀</div>
          <div class="tool-title">Dunk Calculator</div>
        </div>
        <div class="form-group">
          <label class="form-label">Height (inches)</label>
          <input v-model="dunkCalc.height" type="number" placeholder="e.g. 69" />
        </div>
        <div class="form-group">
          <label class="form-label">Current Vertical (inches)</label>
          <input v-model="dunkCalc.vertical" type="number" placeholder="e.g. 24" />
        </div>
        <div class="tool-result" v-if="dunkResult !== null">
          <span class="result-val" :style="{ color: dunkResult.color }">{{ dunkResult.label }}</span>
          <span class="result-label">{{ dunkResult.detail }}</span>
        </div>
        <button class="btn-primary" @click="calcDunk">Calculate</button>
      </div>

      <!-- BMI Calculator -->
      <div class="tool-card card">
        <div class="tool-header">
          <div class="tool-icon-wrap" style="background:#22c55e22">⚖️</div>
          <div class="tool-title">Athlete BMI</div>
        </div>
        <div class="form-group">
          <label class="form-label">Height (cm)</label>
          <input v-model="bmiCalc.height" type="number" placeholder="e.g. 175" />
        </div>
        <div class="form-group">
          <label class="form-label">Weight (kg)</label>
          <input v-model="bmiCalc.weight" type="number" placeholder="e.g. 72" />
        </div>
        <div class="tool-result" v-if="bmiResult !== null">
          <span class="result-val">{{ bmiResult.value }}</span>
          <span class="result-label">BMI</span>
          <span class="result-grade" :style="{ color: bmiResult.color }">{{ bmiResult.label }}</span>
        </div>
        <button class="btn-primary" @click="calcBMI">Calculate</button>
      </div>

      <!-- Standing Reach Calculator -->
      <div class="tool-card card">
        <div class="tool-header">
          <div class="tool-icon-wrap" style="background:#3b82f622">📏</div>
          <div class="tool-title">Standing Reach</div>
        </div>
        <div class="form-group">
          <label class="form-label">Height (inches)</label>
          <input v-model="reachCalc.height" type="number" placeholder="e.g. 69" />
        </div>
        <div class="tool-result" v-if="reachResult !== null">
          <span class="result-val">{{ reachResult }}"</span>
          <span class="result-label">Estimated Standing Reach</span>
        </div>
        <button class="btn-primary" @click="calcReach">Estimate</button>
      </div>
    </div>

    <!-- Training Timer -->
    <div class="timer-card card">
      <div class="tool-header">
        <div class="tool-icon-wrap" style="background:#eab30822">⏱️</div>
        <div class="tool-title">Rest Timer</div>
      </div>
      <div class="timer-presets">
        <button v-for="t in timerPresets" :key="t" class="chip" :class="{ active: timerSecs === t }"
          @click="setTimer(t)">{{ t }}s</button>
      </div>
      <div class="timer-display" :class="{ running: timerRunning, warning: timerLeft <= 5 && timerRunning }">
        {{ formatTimer(timerLeft) }}
      </div>
      <div class="timer-btns">
        <button class="btn-primary" @click="toggleTimer">
          {{ timerRunning ? '⏸ Pause' : timerLeft < timerSecs ? '▶ Resume' : '▶ Start' }}
        </button>
        <button class="btn-secondary" @click="resetTimer">Reset</button>
      </div>
    </div>

    <!-- Water Tracker -->
    <div class="water-card card">
      <div class="tool-header">
        <div class="tool-icon-wrap" style="background:#3b82f622">💧</div>
        <div class="tool-title">Water Tracker</div>
        <div class="water-goal">{{ waterCount }}/8 glasses</div>
      </div>
      <div class="water-glasses">
        <button v-for="i in 8" :key="i" class="water-glass"
          :class="{ filled: i <= waterCount }" @click="waterCount = i">
          💧
        </button>
      </div>
      <div class="progress-bar" style="margin-top:10px">
        <div class="progress-fill" :style="{ width: (waterCount/8*100) + '%', background: '#3b82f6' }"></div>
      </div>
      <div class="water-msg">{{ waterMsg }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'

// VJ Calc
const vjCalc = ref({ reach: '', jumpReach: '' })
const vjResult = ref(null)
function calcVJ() {
  const r = Number(vjCalc.value.reach), j = Number(vjCalc.value.jumpReach)
  if (r && j && j > r) vjResult.value = j - r
}
const vjGrade = computed(() => {
  const v = vjResult.value
  if (!v) return {}
  if (v >= 40) return { label: '🔥 Elite', color: '#f97316' }
  if (v >= 32) return { label: '⭐ Excellent', color: '#22c55e' }
  if (v >= 24) return { label: '✅ Good', color: '#3b82f6' }
  if (v >= 16) return { label: '📈 Average', color: '#eab308' }
  return { label: '💪 Keep Training', color: '#8888aa' }
})

// Dunk Calc
const dunkCalc = ref({ height: '', vertical: '' })
const dunkResult = ref(null)
function calcDunk() {
  const h = Number(dunkCalc.value.height), v = Number(dunkCalc.value.vertical)
  if (!h || !v) return
  const reach = h * 1.33
  const jumpReach = reach + v
  const rimHeight = 120 // 10 feet in inches
  const needed = rimHeight - reach
  if (jumpReach >= rimHeight + 6) dunkResult.value = { label: '🔥 You Can Dunk!', detail: 'You have enough to throw it down', color: '#f97316' }
  else if (jumpReach >= rimHeight) dunkResult.value = { label: '😤 Almost There!', detail: `Need ${Math.ceil(rimHeight + 6 - jumpReach)}" more to dunk comfortably`, color: '#eab308' }
  else dunkResult.value = { label: `Need ${Math.ceil(needed - v)}" more`, detail: 'Keep training your vertical jump', color: '#8888aa' }
}

// BMI
const bmiCalc = ref({ height: '', weight: '' })
const bmiResult = ref(null)
function calcBMI() {
  const h = Number(bmiCalc.value.height) / 100, w = Number(bmiCalc.value.weight)
  if (!h || !w) return
  const bmi = (w / (h * h)).toFixed(1)
  let label, color
  if (bmi < 18.5) { label = 'Underweight'; color = '#3b82f6' }
  else if (bmi < 25) { label = 'Healthy ✓'; color = '#22c55e' }
  else if (bmi < 30) { label = 'Overweight'; color = '#eab308' }
  else { label = 'Obese'; color = '#ef4444' }
  bmiResult.value = { value: bmi, label, color }
}

// Reach
const reachCalc = ref({ height: '' })
const reachResult = ref(null)
function calcReach() {
  const h = Number(reachCalc.value.height)
  if (h) reachResult.value = Math.round(h * 1.33)
}

// Timer
const timerPresets = [30, 45, 60, 90, 120, 180]
const timerSecs = ref(60)
const timerLeft = ref(60)
const timerRunning = ref(false)
let timerInterval = null

function setTimer(s) {
  timerSecs.value = s
  timerLeft.value = s
  timerRunning.value = false
  clearInterval(timerInterval)
}

function toggleTimer() {
  if (timerRunning.value) {
    clearInterval(timerInterval)
    timerRunning.value = false
  } else {
    if (timerLeft.value <= 0) timerLeft.value = timerSecs.value
    timerRunning.value = true
    timerInterval = setInterval(() => {
      timerLeft.value--
      if (timerLeft.value <= 0) {
        clearInterval(timerInterval)
        timerRunning.value = false
      }
    }, 1000)
  }
}

function resetTimer() {
  clearInterval(timerInterval)
  timerRunning.value = false
  timerLeft.value = timerSecs.value
}

function formatTimer(s) {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, '0')}`
}

onUnmounted(() => clearInterval(timerInterval))

// Water
const waterCount = ref(0)
const waterMsg = computed(() => {
  if (waterCount.value === 0) return 'Stay hydrated — athletes need 8+ glasses daily'
  if (waterCount.value < 4) return 'Keep drinking! You\'re halfway there 💪'
  if (waterCount.value < 8) return 'Almost there! Keep it up 🔥'
  return '🎉 Hydration goal reached! Great work!'
})
</script>

<style scoped>
.tools-grid {
  display: grid; grid-template-columns: repeat(2, 1fr);
  gap: 10px; margin-bottom: 12px;
}

.tool-card { display: flex; flex-direction: column; gap: 10px; }
.tool-header { display: flex; align-items: center; gap: 10px; }
.tool-icon-wrap {
  width: 36px; height: 36px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 18px; flex-shrink: 0;
}
.tool-title { font-size: 13px; font-weight: 700; color: var(--text-h); }

.tool-result {
  display: flex; flex-direction: column; align-items: center;
  padding: 10px; background: var(--surface2);
  border-radius: var(--radius-sm); gap: 2px;
}
.result-val { font-size: 24px; font-weight: 900; color: var(--text-h); }
.result-label { font-size: 11px; color: var(--text); }
.result-grade { font-size: 13px; font-weight: 700; }

/* Timer */
.timer-card { margin-bottom: 12px; }
.timer-presets { display: flex; gap: 6px; flex-wrap: wrap; margin: 8px 0; }
.timer-display {
  font-size: 56px; font-weight: 900; color: var(--text-h);
  text-align: center; padding: 16px;
  font-variant-numeric: tabular-nums;
  transition: color 0.3s;
}
.timer-display.running { color: var(--accent); }
.timer-display.warning { color: var(--red); animation: pulse 0.5s infinite; }
.timer-btns { display: flex; gap: 8px; }
.timer-btns .btn-primary { flex: 1; }
.timer-btns .btn-secondary { flex: 0 0 auto; }

/* Water */
.water-card { margin-bottom: 12px; }
.water-goal { margin-left: auto; font-size: 13px; font-weight: 700; color: var(--blue); }
.water-glasses { display: flex; gap: 6px; margin: 10px 0; flex-wrap: wrap; }
.water-glass {
  font-size: 24px; padding: 6px;
  border-radius: 8px; background: var(--surface2);
  border: 1.5px solid var(--border);
  transition: all 0.2s; opacity: 0.3;
}
.water-glass.filled { opacity: 1; border-color: var(--blue); background: #3b82f622; }
.water-msg { font-size: 13px; color: var(--text); margin-top: 8px; text-align: center; }
</style>
