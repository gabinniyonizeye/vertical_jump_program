<template>
  <div>
    <div class="tracker-header">
      <div class="week-label">
        <span>📅 Week starting:</span>
        <input type="date" v-model="startDate" class="date-picker" @change="onDatePick" />
        <span v-if="weekLabel" class="week-range-badge">{{ weekLabel }}</span>
      </div>
      <button class="new-week-btn" @click="newWeek">+ New Week</button>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Day</th>
            <th>Done ✔</th>
            <th>Energy (1–10)</th>
            <th>Best Lift / Weight</th>
            <th>Jump Feel (1–10)</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.day"
            :class="{ 'swapped-row': row.swappedToAirAlert }">
            <td class="day-cell">
              <span class="badge" :style="{ background: (row.swappedToAirAlert ? '#6366f1' : row.color) + '22', color: row.swappedToAirAlert ? '#6366f1' : row.color }">
                {{ row.day }}
              </span>
              <div class="session-type-label" :style="{ color: row.swappedToAirAlert ? '#6366f1' : row.color }">
                {{ row.swappedToAirAlert ? '🏃 Air Alert' : row.isGymDay ? '🏋️ Gym' : row.liftPlaceholder === 'Air Alert' ? '🏃 Air Alert' : '😴 Recovery' }}
              </div>
              <!-- Toggle for gym days -->
              <div v-if="row.isGymDay" class="session-toggle">
                <button
                  class="toggle-btn" :class="{ active: !row.swappedToAirAlert }"
                  @click="row.swappedToAirAlert = false">
                  🏋️ Gym
                </button>
                <button
                  class="toggle-btn air" :class="{ active: row.swappedToAirAlert }"
                  @click="row.swappedToAirAlert = true">
                  🏃 Air Alert
                </button>
              </div>
            </td>
            <td class="center-cell">
              <button class="done-btn" :class="{ checked: row.done }" @click="row.done = !row.done">
                {{ row.done ? '✔' : '○' }}
              </button>
            </td>
            <td><input v-model="row.energy" type="number" min="1" max="10" placeholder="—" /></td>
            <td><input v-model="row.lift"
              :placeholder="row.swappedToAirAlert ? 'Air Alert ✓' : row.liftPlaceholder" /></td>
            <td><input v-model="row.jumpFeel" type="number" min="1" max="10" placeholder="—" /></td>
            <td><input v-model="row.notes" placeholder="Notes…" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="week-summary">
      <div class="summary-item">
        <div class="summary-val">{{ doneCount }}/7</div>
        <div class="summary-label">Sessions Done</div>
      </div>
      <div class="summary-item">
        <div class="summary-val">{{ avgEnergy || '—' }}</div>
        <div class="summary-label">Avg Energy</div>
      </div>
      <div class="summary-item">
        <div class="summary-val">{{ avgJump || '—' }}</div>
        <div class="summary-label">Avg Jump Feel</div>
      </div>
    </div>

    <!-- Past Weeks History -->
    <div class="history-section" v-if="history.length">
      <div class="history-title">📚 Past Weeks</div>
      <div class="history-list">
        <div v-for="(week, wi) in [...history].reverse()" :key="wi" class="history-item card">
          <div class="history-header">
            <span class="history-week">{{ week.label || 'Week ' + (history.length - wi) }}</span>
            <span class="history-done">{{ week.rows.filter(r => r.done).length }}/7 sessions</span>
          </div>
          <div class="history-stats">
            <span v-if="avgOf(week.rows, 'energy')">⚡ Energy: {{ avgOf(week.rows, 'energy') }}</span>
            <span v-if="avgOf(week.rows, 'jumpFeel')">🦵 Jump Feel: {{ avgOf(week.rows, 'jumpFeel') }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="rules card">
      <div class="rules-title">📈 Progression Rules</div>
      <ul>
        <li>Add +1–2.5 kg every 1–2 weeks (if form is clean)</li>
        <li>Plyos → increase height/speed, NOT reps first</li>
        <li>Keep sessions ≤ 75 min</li>
        <li>If jumps feel slow → you're fatigued → back off slightly</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { loadUserData, saveUserData } from '../useAuth.js'

const props = defineProps({ uid: String })

const defaultRows = () => [
  { day: 'Monday',    color: '#f97316', liftPlaceholder: 'Squat: ___kg',      done: false, energy: '', lift: '', jumpFeel: '', notes: '', isGymDay: true,  swappedToAirAlert: false },
  { day: 'Tuesday',   color: '#6366f1', liftPlaceholder: 'Air Alert',         done: false, energy: '', lift: '', jumpFeel: '', notes: '', isGymDay: false, swappedToAirAlert: false },
  { day: 'Wednesday', color: '#3b82f6', liftPlaceholder: 'Deadlift: ___kg',   done: false, energy: '', lift: '', jumpFeel: '', notes: '', isGymDay: true,  swappedToAirAlert: false },
  { day: 'Thursday',  color: '#6366f1', liftPlaceholder: 'Air Alert',         done: false, energy: '', lift: '', jumpFeel: '', notes: '', isGymDay: false, swappedToAirAlert: false },
  { day: 'Friday',    color: '#6366f1', liftPlaceholder: 'Air Alert',         done: false, energy: '', lift: '', jumpFeel: '', notes: '', isGymDay: false, swappedToAirAlert: false },
  { day: 'Saturday',  color: '#22c55e', liftPlaceholder: 'Power Move: ___kg', done: false, energy: '', lift: '', jumpFeel: '', notes: '', isGymDay: true,  swappedToAirAlert: false },
  { day: 'Sunday',    color: '#eab308', liftPlaceholder: 'Recovery',          done: false, energy: '', lift: '', jumpFeel: '', notes: '', isGymDay: false, swappedToAirAlert: false },
]

const weekLabel = ref('')
const startDate = ref('')
const rows = reactive(defaultRows())
const history = reactive([])
let saving = false

function onDatePick() {
  if (!startDate.value) return
  const d = new Date(startDate.value)
  // Snap to Monday of the selected week
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  const end = new Date(d)
  end.setDate(end.getDate() + 6)
  const fmt = (dt) => dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  weekLabel.value = `${fmt(d)} – ${fmt(end)}`
  // Update startDate to the actual Monday
  startDate.value = d.toISOString().split('T')[0]
}

onMounted(async () => {
  const data = await loadUserData(props.uid, 'tracker')
  if (data) {
    weekLabel.value = data.weekLabel || ''
    startDate.value = data.startDate || ''
    if (data.rows) rows.splice(0, rows.length, ...data.rows)
    if (data.history) history.splice(0, history.length, ...data.history)
  }
})

async function persist() {
  if (saving) return
  saving = true
  await saveUserData(props.uid, 'tracker', { weekLabel: weekLabel.value, startDate: startDate.value, rows: JSON.parse(JSON.stringify(rows)), history: JSON.parse(JSON.stringify(history)) })
  saving = false
}

watch([weekLabel, rows], persist, { deep: true })

function newWeek() {
  if (!confirm('Start a new week? Current data will be archived.')) return
  if (rows.some(r => r.done || r.energy || r.lift)) {
    history.push({ label: weekLabel.value, rows: JSON.parse(JSON.stringify(rows)) })
  }
  weekLabel.value = ''
  startDate.value = ''
  rows.splice(0, rows.length, ...defaultRows())
  persist()
}

function avgOf(rowArr, field) {
  const vals = rowArr.map(r => Number(r[field])).filter(v => v > 0)
  return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null
}

const doneCount = computed(() => rows.filter(r => r.done).length)
const avgEnergy = computed(() => {
  const vals = rows.map(r => Number(r.energy)).filter(v => v > 0)
  return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null
})
const avgJump = computed(() => {
  const vals = rows.map(r => Number(r.jumpFeel)).filter(v => v > 0)
  return vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1) : null
})
</script>

<style scoped>
.tracker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
  flex-wrap: wrap;
}

.week-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: var(--text-h);
}

.date-picker {
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text-h);
  border-radius: 8px;
  padding: 7px 10px;
  font-size: 14px;
  cursor: pointer;
  transition: border-color 0.2s;
}
.date-picker:focus { border-color: var(--accent); outline: none; }

.week-range-badge {
  background: var(--accent);
  color: #fff;
  border-radius: 20px;
  padding: 4px 12px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.new-week-btn {
  background: var(--accent);
  color: #fff;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  transition: opacity 0.2s;
}
.new-week-btn:hover { opacity: 0.85; }

.table-wrap { overflow-x: auto; margin-bottom: 16px; }

table { width: 100%; border-collapse: collapse; min-width: 640px; }

th {
  text-align: left;
  padding: 10px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 1px solid var(--border);
}

td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}

td input { padding: 6px 10px; font-size: 13px; }

.session-type-label {
  font-size: 11px;
  font-weight: 700;
  margin-top: 3px;
  letter-spacing: 0.3px;
}

.session-toggle {
  display: flex;
  gap: 4px;
  margin-top: 6px;
}

.toggle-btn {
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text);
  transition: all 0.2s;
  cursor: pointer;
}
.toggle-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}
.toggle-btn.air.active {
  background: #6366f1;
  border-color: #6366f1;
  color: #fff;
}

.swapped-row td { background: #6366f115; }
.center-cell { text-align: center; }

.done-btn {
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 6px;
  width: 32px;
  height: 32px;
  font-size: 14px;
  transition: all 0.2s;
}
.done-btn.checked { background: var(--green); border-color: var(--green); color: #fff; }

.week-summary {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.summary-item {
  flex: 1;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 14px;
  text-align: center;
}

.summary-val { font-size: 24px; font-weight: 700; color: var(--accent); }
.summary-label { font-size: 12px; color: var(--text); margin-top: 2px; }

.history-section { margin-bottom: 16px; }
.history-title { font-weight: 700; color: var(--text-h); margin-bottom: 10px; font-size: 15px; }
.history-list { display: flex; flex-direction: column; gap: 8px; }
.history-item { padding: 12px 16px; }
.history-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
.history-week { font-weight: 600; color: var(--text-h); font-size: 14px; }
.history-done { font-size: 13px; color: var(--green); font-weight: 600; }
.history-stats { display: flex; gap: 16px; font-size: 12px; color: var(--text); }

.rules { margin-top: 4px; }
.rules-title { font-weight: 700; color: var(--text-h); margin-bottom: 10px; }
.rules ul { padding-left: 18px; display: flex; flex-direction: column; gap: 6px; font-size: 14px; }
</style>
