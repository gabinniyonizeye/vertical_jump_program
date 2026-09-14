<template>
  <div class="page">
    <div class="header">
      <h1>⚡ Speed & Agility</h1>
      <p>Develop explosive footwork and lateral quickness</p>
    </div>

    <div class="drills-grid">
      <div v-for="drill in drills" :key="drill.id" class="drill-card">
        <div class="drill-icon">{{ drill.icon }}</div>
        <h3>{{ drill.name }}</h3>
        <div class="drill-diagram">
          <svg :viewBox="drill.viewBox" class="diagram" v-html="drill.svg"></svg>
        </div>
        <div class="drill-details">
          <div class="detail-row"><span class="label">Sets:</span><span class="value">{{ drill.sets }}</span></div>
          <div class="detail-row"><span class="label">Reps:</span><span class="value">{{ drill.reps }}</span></div>
          <div class="detail-row"><span class="label">Rest:</span><span class="value">{{ drill.rest }}</span></div>
        </div>

        <!-- Controls -->
        <div class="drill-controls">
          <div class="dc-row">
            <button class="rep-tap" @click="tapRep(drill.id)">
              <span class="rep-num">{{ getRepCount(drill.id) }}</span>
            </button>
            <button class="rep-reset" @click="resetReps(drill.id)">↺</button>
            <span class="rep-label">Reps</span>
            <div class="set-counter">
              <button class="set-btn" @click="addSet(drill.id)">+Set</button>
              <span class="set-done">{{ getSetState(drill.id).done }}/{{ drill.sets }}</span>
              <button class="rep-reset" @click="resetSets(drill.id)">↺</button>
            </div>
          </div>
          <div class="inline-rest" :class="{ running: getRestTimer(drill.id).running, finished: getRestTimer(drill.id).done }">
            <div class="irt-top">
              <span class="irt-label">{{ getRestTimer(drill.id).done ? '✅ Rest Done!' : getRestTimer(drill.id).running ? '⏱ Resting...' : '⏸ Rest' }}</span>
              <span class="irt-time">{{ timerDisplay(getRestTimer(drill.id)) }}</span>
            </div>
            <div class="irt-bar"><div class="irt-fill" :style="{ width: restProgress(getRestTimer(drill.id)) + '%', background: getRestTimer(drill.id).done ? '#22c55e' : getRestTimer(drill.id).running ? '#f97316' : '#6366f1' }"></div></div>
            <div class="irt-btns">
              <button v-if="!getRestTimer(drill.id).running && !getRestTimer(drill.id).done" @click="startRest(drill.id, 60)">▶</button>
              <button v-if="getRestTimer(drill.id).running" @click="pauseRest(drill.id)">⏸</button>
              <button @click="resetRest(drill.id, 60)">↺</button>
              <button @click="setRest(drill.id, 30)">30s</button>
              <button @click="setRest(drill.id, 45)">45s</button>
              <button @click="setRest(drill.id, 60)">60s</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tips Section -->
    <div class="tips-section card">
      <h3>💡 Pro Tips</h3>
      <ul class="tips-list">
        <li><strong>Stay Low:</strong> Keep your center of gravity low for better control and explosiveness</li>
        <li><strong>Quick Feet:</strong> Focus on rapid foot placement rather than long strides</li>
        <li><strong>Arm Drive:</strong> Use your arms to generate momentum and maintain balance</li>
        <li><strong>Controlled Stops:</strong> Practice deceleration to prevent injuries and improve court control</li>
        <li><strong>Consistency:</strong> Perform these drills 2-3x per week for best results</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
defineProps({ profile: Object })

const LS = 'speed_agility_state'

const drills = [
  {
    id: 'def-slides', icon: '↔️', name: 'Defensive Slides', sets: 4, reps: '30 sec each direction', rest: '30 sec',
    viewBox: '0 0 200 120',
    svg: `<rect x="20" y="40" width="160" height="40" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5,5"/><circle cx="50" cy="60" r="8" fill="#f97316"/><circle cx="100" cy="60" r="8" fill="#f97316"/><circle cx="150" cy="60" r="8" fill="#f97316"/><path d="M 50 60 L 100 60 L 150 60" stroke="#f97316" stroke-width="2" fill="none" stroke-dasharray="3,3"/><text x="100" y="110" text-anchor="middle" font-size="12" fill="#64748b">Lateral movement</text>`,
  },
  {
    id: 'zigzag', icon: '⚡', name: 'Zig-Zag Sprint', sets: 5, reps: '1 full course', rest: '45 sec',
    viewBox: '0 0 200 140',
    svg: `<circle cx="30" cy="20" r="5" fill="#f97316"/><circle cx="70" cy="50" r="5" fill="#f97316"/><circle cx="110" cy="80" r="5" fill="#f97316"/><circle cx="150" cy="110" r="5" fill="#f97316"/><path d="M 30 20 L 70 50 L 110 80 L 150 110" stroke="#f97316" stroke-width="2" fill="none"/><text x="100" y="135" text-anchor="middle" font-size="12" fill="#64748b">Diagonal sprints</text>`,
  },
  {
    id: 'closeout', icon: '🏀', name: 'Closeout Drill', sets: 4, reps: '8 per set', rest: '60 sec',
    viewBox: '0 0 200 120',
    svg: `<circle cx="100" cy="30" r="6" fill="#3b82f6"/><circle cx="50" cy="80" r="6" fill="#f97316"/><circle cx="150" cy="80" r="6" fill="#f97316"/><path d="M 100 30 L 50 80" stroke="#f97316" stroke-width="2" fill="none" stroke-dasharray="3,3"/><path d="M 100 30 L 150 80" stroke="#f97316" stroke-width="2" fill="none" stroke-dasharray="3,3"/><text x="100" y="115" text-anchor="middle" font-size="12" fill="#64748b">Sprint to defender</text>`,
  },
  {
    id: 'lat-shuffle', icon: '🔄', name: 'Lateral Shuffle', sets: 4, reps: '40 ft each way', rest: '30 sec',
    viewBox: '0 0 200 120',
    svg: `<rect x="30" y="50" width="140" height="30" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5,5"/><circle cx="50" cy="65" r="6" fill="#f97316"/><circle cx="80" cy="65" r="6" fill="#f97316"/><circle cx="110" cy="65" r="6" fill="#f97316"/><circle cx="140" cy="65" r="6" fill="#f97316"/><path d="M 50 65 L 80 65 L 110 65 L 140 65" stroke="#f97316" stroke-width="2" fill="none"/><text x="100" y="110" text-anchor="middle" font-size="12" fill="#64748b">Side-to-side movement</text>`,
  },
  {
    id: 'sprint-stop', icon: '🛑', name: 'Sprint-Stop-Sprint', sets: 5, reps: '1 full course', rest: '60 sec',
    viewBox: '0 0 200 120',
    svg: `<circle cx="30" cy="60" r="5" fill="#f97316"/><circle cx="100" cy="60" r="8" fill="#ef4444" stroke="#ef4444" stroke-width="2"/><circle cx="170" cy="60" r="5" fill="#f97316"/><path d="M 30 60 L 100 60" stroke="#f97316" stroke-width="2" fill="none"/><path d="M 100 60 L 170 60" stroke="#f97316" stroke-width="2" fill="none"/><text x="100" y="90" text-anchor="middle" font-size="11" fill="#64748b">Sprint • Stop • Sprint</text><text x="100" y="110" text-anchor="middle" font-size="11" fill="#64748b">40 ft • Stop • 40 ft</text>`,
  },
  {
    id: 'cone-drill', icon: '🎯', name: 'Cone Drill', sets: 4, reps: '6 per set', rest: '45 sec',
    viewBox: '0 0 200 140',
    svg: `<circle cx="100" cy="20" r="5" fill="#f97316"/><circle cx="60" cy="60" r="5" fill="#f97316"/><circle cx="140" cy="60" r="5" fill="#f97316"/><circle cx="100" cy="100" r="5" fill="#f97316"/><path d="M 100 20 L 60 60 L 140 60 L 100 20 L 100 100" stroke="#f97316" stroke-width="2" fill="none"/><text x="100" y="135" text-anchor="middle" font-size="12" fill="#64748b">T-drill pattern</text>`,
  },
]

const repCounters = ref({})
const setCounters = ref({})
const restTimers = ref({})

onMounted(() => {
  try {
    const s = JSON.parse(localStorage.getItem(LS) || '{}')
    if (s.repCounters) repCounters.value = s.repCounters
    if (s.setCounters) setCounters.value = s.setCounters
  } catch {}
})
watch([repCounters, setCounters], () => {
  localStorage.setItem(LS, JSON.stringify({ repCounters: repCounters.value, setCounters: setCounters.value }))
}, { deep: true })

function getRepCount(id) {
  if (repCounters.value[id] === undefined) repCounters.value[id] = 0
  return repCounters.value[id]
}
function tapRep(id) { repCounters.value[id] = (repCounters.value[id] || 0) + 1 }
function resetReps(id) { repCounters.value[id] = 0 }
function getSetState(id) {
  if (!setCounters.value[id]) setCounters.value[id] = { done: 0 }
  return setCounters.value[id]
}
function addSet(id) { getSetState(id).done++ }
function resetSets(id) { setCounters.value[id] = { done: 0 } }
function getRestTimer(id) {
  if (!restTimers.value[id]) restTimers.value[id] = { remaining: 60, total: 60, running: false, done: false, _iv: null }
  return restTimers.value[id]
}
function startRest(id, sec = 60) {
  const t = getRestTimer(id)
  if (t.running) return
  if (t.done || t.remaining === 0) { t.remaining = sec; t.total = sec; t.done = false }
  t.running = true
  t._iv = setInterval(() => {
    if (t.remaining <= 1) { t.remaining = 0; t.running = false; t.done = true; clearInterval(t._iv); pingSound() }
    else t.remaining--
  }, 1000)
}
function pauseRest(id) { const t = getRestTimer(id); clearInterval(t._iv); t.running = false }
function resetRest(id, sec = 60) {
  const t = getRestTimer(id); clearInterval(t._iv)
  t.running = false; t.done = false; t.remaining = sec; t.total = sec
}
function setRest(id, sec) { resetRest(id, sec); startRest(id, sec) }
function timerDisplay(t) {
  const m = Math.floor(t.remaining / 60), s = t.remaining % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
function restProgress(t) { return t.total > 0 ? ((t.total - t.remaining) / t.total) * 100 : 0 }
function pingSound() {
  try {
    const ctx = new AudioContext(), osc = ctx.createOscillator(), gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
    osc.start(); osc.stop(ctx.currentTime + 0.6)
  } catch {}
}
onUnmounted(() => { Object.values(restTimers.value).forEach(t => clearInterval(t._iv)) })
</script>

<style scoped>
.page { padding: 16px; max-width: 1200px; margin: 0 auto; }
.header { margin-bottom: 24px; }
.header h1 { font-size: 30px; font-weight: 900; color: var(--text-h); margin: 0 0 4px 0; font-family: var(--font-display); letter-spacing: 0.5px; }
.header p { font-size: 14px; color: var(--text); margin: 0; }
.drills-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 14px; margin-bottom: 24px; }
.drill-card {
  background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 18px; display: flex; flex-direction: column; gap: 12px;
  transition: all 0.25s; position: relative; overflow: hidden;
}
.drill-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--accent), var(--accent2)); opacity: 0; transition: opacity 0.2s; }
.drill-card:hover { border-color: var(--accent); transform: translateY(-3px); box-shadow: 0 8px 28px rgba(249,115,22,0.15); }
.drill-card:hover::before { opacity: 1; }
.drill-icon { font-size: 34px; line-height: 1; }
.drill-card h3 { font-size: 16px; font-weight: 800; color: var(--text-h); margin: 0; }
.drill-diagram { background: var(--surface2); border-radius: var(--radius-sm); padding: 12px; min-height: 140px; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border); }
.diagram { width: 100%; height: 100%; max-width: 180px; max-height: 140px; }
.drill-details { display: flex; flex-direction: column; gap: 8px; padding-top: 10px; border-top: 1px solid var(--border); }
.detail-row { display: flex; justify-content: space-between; font-size: 13px; }
.detail-row .label { color: var(--text); font-weight: 600; }
.detail-row .value { color: var(--accent); font-weight: 700; }
.tips-section { background: linear-gradient(135deg, rgba(249,115,22,0.05), var(--surface)); border: 1px solid rgba(249,115,22,0.2); border-radius: var(--radius); padding: 18px; }
.tips-section h3 { font-size: 16px; font-weight: 800; color: var(--text-h); margin: 0 0 14px 0; }
.tips-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.tips-list li { font-size: 13px; color: var(--text2); line-height: 1.6; padding-left: 16px; position: relative; }
.tips-list li::before { content: '▸'; position: absolute; left: 0; color: var(--accent); }
.tips-list strong { color: var(--text-h); }
@media (max-width: 768px) { .drills-grid { grid-template-columns: 1fr; } }

.drill-controls { display: flex; flex-direction: column; gap: 8px; padding-top: 10px; border-top: 1px solid var(--border); }
.dc-row { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.rep-tap { display: flex; align-items: center; background: var(--surface2); border: 2px solid var(--border); border-radius: 10px; padding: 5px 14px; cursor: pointer; transition: all 0.15s; font-weight: 800; }
.rep-tap:hover { border-color: var(--accent); }
.rep-num { font-size: 20px; color: var(--text-h); }
.rep-reset { background: none; border: 1px solid var(--border); border-radius: 6px; padding: 4px 8px; font-size: 13px; cursor: pointer; color: var(--text); transition: all 0.15s; }
.rep-reset:hover { border-color: var(--accent); color: var(--accent); }
.rep-label { font-size: 10px; color: var(--text); font-weight: 600; }
.set-counter { display: flex; align-items: center; gap: 5px; margin-left: auto; }
.set-btn { padding: 4px 10px; border-radius: 7px; border: 1px solid var(--accent); background: #6366f122; color: var(--accent); font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
.set-btn:hover { background: var(--accent); color: #fff; }
.set-done { font-size: 14px; font-weight: 800; color: var(--text-h); min-width: 28px; text-align: center; }
.inline-rest { padding: 8px 10px; border-radius: 10px; background: var(--surface2); border: 1px solid var(--border); transition: border-color 0.3s; }
.inline-rest.running { border-color: #f9731655; }
.inline-rest.finished { border-color: #22c55e88; }
.irt-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
.irt-label { font-size: 11px; font-weight: 700; color: var(--text-h); }
.irt-time { font-size: 16px; font-weight: 800; color: var(--text-h); font-variant-numeric: tabular-nums; }
.irt-bar { width: 100%; height: 4px; background: var(--surface); border-radius: 99px; overflow: hidden; margin-bottom: 6px; }
.irt-fill { height: 100%; border-radius: 99px; transition: width 0.9s linear, background 0.3s; }
.irt-btns { display: flex; gap: 5px; flex-wrap: wrap; }
.irt-btns button { padding: 4px 9px; border-radius: 7px; border: 1px solid var(--border); background: var(--surface); color: var(--text); font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
.irt-btns button:hover { border-color: var(--accent); color: var(--accent); }
</style>
