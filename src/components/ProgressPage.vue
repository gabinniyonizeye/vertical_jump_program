<template>
  <div class="page">

    <!-- Header -->
    <div class="pt-header">
      <div>
        <h1>📈 Progress Tracking</h1>
        <p class="pt-sub">Measure everything. Improve everything.</p>
      </div>
    </div>

    <!-- Weekly Completion -->
    <div class="weekly-card card">
      <div class="weekly-top">
        <div>
          <div class="weekly-title">Weekly Completion</div>
          <div class="weekly-sub">{{ weekLabel }}</div>
        </div>
        <div class="weekly-pct" :style="{ color: weekColor }">{{ weeklyPct }}%</div>
      </div>
      <div class="weekly-bar-wrap">
        <div class="weekly-bar">
          <div class="weekly-fill" :style="{ width: weeklyPct + '%', background: weekColor }"></div>
        </div>
      </div>
      <div class="weekly-days">
        <div v-for="(day, i) in weekDays" :key="i" class="week-day">
          <div class="day-dot" :class="{ logged: day.logged }"></div>
          <span class="day-label">{{ day.label }}</span>
        </div>
      </div>
    </div>

    <!-- Log Form -->
    <div class="log-card card">
      <div class="log-title">📝 Log Today's Stats</div>
      <div class="log-date">{{ todayLabel }}</div>
      <div class="log-grid">
        <div class="form-group" v-for="f in fields" :key="f.key">
          <label class="form-label">{{ f.icon }} {{ f.label }} <span class="form-unit">({{ f.unit }})</span></label>
          <input
            v-model.number="newEntry[f.key]"
            type="number"
            :step="f.step"
            :placeholder="f.placeholder"
          />
        </div>
      </div>
      <button class="btn-primary" style="margin-top:14px" @click="logEntry" :disabled="!hasAnyValue || saving">
        {{ saving ? 'Saving…' : 'Log Progress ✓' }}
      </button>
      <div v-if="saveError" class="save-error">{{ saveError }}</div>
    </div>

    <!-- Metric Charts -->
    <div class="charts-grid">
      <div v-for="f in fields" :key="f.key" class="chart-card card">
        <div class="chart-header">
          <div class="chart-left">
            <span class="chart-icon">{{ f.icon }}</span>
            <div>
              <div class="chart-name">{{ f.label }}</div>
              <div class="chart-latest" v-if="latest(f.key) !== null">
                <span class="chart-val" :style="{ color: f.color }">{{ latest(f.key) }}</span>
                <span class="chart-unit">{{ f.unit }}</span>
                <span class="chart-delta" :class="deltaClass(f.key, f.lowerIsBetter)">
                  {{ deltaStr(f.key, f.lowerIsBetter) }}
                </span>
              </div>
              <div class="chart-empty-label" v-else>No data yet</div>
            </div>
          </div>
          <div class="chart-count">{{ seriesFor(f.key).length }} entries</div>
        </div>

        <!-- SVG Sparkline -->
        <div class="sparkline-wrap" v-if="seriesFor(f.key).length > 1">
          <svg viewBox="0 0 280 60" class="sparkline">
            <defs>
              <linearGradient :id="'grad-' + f.key" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" :stop-color="f.color" stop-opacity="0.25"/>
                <stop offset="100%" :stop-color="f.color" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <path :d="areaPath(f.key)" :fill="`url(#grad-${f.key})`"/>
            <path :d="linePath(f.key)" fill="none" :stroke="f.color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle
              v-for="(pt, i) in sparkPoints(f.key)" :key="i"
              :cx="pt.x" :cy="pt.y" r="3"
              :fill="f.color"
            />
          </svg>
          <div class="spark-labels">
            <span v-for="(e, i) in seriesFor(f.key).slice(-6)" :key="i" class="spark-label">
              {{ e.date.slice(5) }}
            </span>
          </div>
        </div>
        <div class="spark-placeholder" v-else>
          Log at least 2 entries to see chart
        </div>

        <!-- Mini history -->
        <div class="mini-history" v-if="seriesFor(f.key).length">
          <div v-for="e in seriesFor(f.key).slice().reverse().slice(0,3)" :key="e.date" class="mini-row">
            <span class="mini-date">{{ formatDate(e.date) }}</span>
            <span class="mini-val" :style="{ color: f.color }">{{ e.value }} {{ f.unit }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Full History -->
    <div class="section-header" style="margin-top:4px">
      <span class="section-title">📋 Full History</span>
      <span class="section-sub">{{ entries.length }} entries</span>
    </div>
    <div class="history-list" v-if="entries.length">
      <div v-for="e in [...entries].reverse().slice(0, 20)" :key="e.id" class="history-card card">
        <div class="history-top">
          <span class="history-date">{{ formatDate(e.date) }}</span>
          <button class="del-btn" @click="deleteEntry(e.id)">✕</button>
        </div>
        <div class="history-chips">
          <span v-for="f in fields" :key="f.key" v-if="e[f.key] != null" class="history-chip">
            {{ f.icon }} {{ e[f.key] }}{{ f.unit }}
          </span>
        </div>
      </div>
    </div>
    <div class="empty-state" v-else>
      <div class="empty-icon">📊</div>
      <div class="empty-title">No entries yet</div>
      <div class="empty-desc">Log your first stats above to start tracking progress.</div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { loadUserData, saveUserData } from '../useAuth.js'

const props = defineProps({ uid: String, profile: Object })

const fields = [
  { key: 'vertical',  icon: '⬆️', label: 'Vertical Jump',  unit: '"',   step: 0.5, placeholder: '24',  color: '#f97316', lowerIsBetter: false },
  { key: 'sprint',    icon: '⚡', label: 'Sprint Time',     unit: 's',   step: 0.1, placeholder: '4.2', color: '#3b82f6', lowerIsBetter: true  },
  { key: 'bench',     icon: '🏋️', label: 'Bench Press',    unit: 'kg',  step: 2.5, placeholder: '60',  color: '#f59e0b', lowerIsBetter: false },
  { key: 'squat',     icon: '🦵', label: 'Squat',           unit: 'kg',  step: 2.5, placeholder: '80',  color: '#8b5cf6', lowerIsBetter: false },
  { key: 'deadlift',  icon: '💀', label: 'Deadlift',        unit: 'kg',  step: 2.5, placeholder: '100', color: '#ef4444', lowerIsBetter: false },
  { key: 'weight',    icon: '⚖️', label: 'Body Weight',     unit: 'kg',  step: 0.5, placeholder: '72',  color: '#22c55e', lowerIsBetter: false },
  { key: 'mobility',  icon: '🧘', label: 'Mobility Score',  unit: '/10', step: 0.5, placeholder: '7',   color: '#06b6d4', lowerIsBetter: false },
  { key: 'weekly',    icon: '📅', label: 'Weekly Completion', unit: '%', step: 1,   placeholder: '80',  color: '#a855f7', lowerIsBetter: false },
]

const entries = ref([])
const newEntry = ref({})
const saving = ref(false)
const saveError = ref('')

onMounted(async () => {
  if (!props.uid) return
  try {
    const data = await loadUserData(props.uid, 'progress_entries')
    if (Array.isArray(data?.entries)) entries.value = data.entries
  } catch (error) {
    saveError.value = 'Your saved progress could not be loaded. Please try again.'
  }
})

const hasAnyValue = computed(() => fields.some(f => newEntry.value[f.key] != null && newEntry.value[f.key] !== ''))

const todayLabel = computed(() =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
)

async function logEntry() {
  if (!hasAnyValue.value) return
  saving.value = true
  saveError.value = ''
  const entry = { id: Date.now(), date: new Date().toISOString().slice(0, 10) }
  fields.forEach(f => {
    if (newEntry.value[f.key] != null && newEntry.value[f.key] !== '') {
      entry[f.key] = Number(newEntry.value[f.key])
    }
  })
  const previousEntries = entries.value
  entries.value = [...entries.value, entry]
  try {
    await saveUserData(props.uid, 'progress_entries', { entries: entries.value })
    newEntry.value = {}
  } catch (error) {
    entries.value = previousEntries
    saveError.value = 'Progress was not saved. Check your connection and try again.'
  } finally {
    saving.value = false
  }
}

async function deleteEntry(id) {
  const previousEntries = entries.value
  entries.value = entries.value.filter(e => e.id !== id)
  saveError.value = ''
  try {
    await saveUserData(props.uid, 'progress_entries', { entries: entries.value })
  } catch (error) {
    entries.value = previousEntries
    saveError.value = 'Progress could not be updated. Please try again.'
  }
}

// Series for a given metric key
function seriesFor(key) {
  return entries.value
    .filter(e => e[key] != null)
    .map(e => ({ date: e.date, value: e[key] }))
    .slice(-12)
}

function latest(key) {
  const s = seriesFor(key)
  return s.length ? s[s.length - 1].value : null
}

function delta(key) {
  const s = seriesFor(key)
  if (s.length < 2) return null
  return s[s.length - 1].value - s[s.length - 2].value
}

function deltaStr(key, lowerIsBetter) {
  const d = delta(key)
  if (d === null) return ''
  const improved = lowerIsBetter ? d < 0 : d > 0
  const sign = d > 0 ? '+' : ''
  return `${sign}${d.toFixed(1)}`
}

function deltaClass(key, lowerIsBetter) {
  const d = delta(key)
  if (d === null || d === 0) return ''
  const improved = lowerIsBetter ? d < 0 : d > 0
  return improved ? 'delta-up' : 'delta-down'
}

// SVG sparkline helpers
const SW = 280, SH = 60, PAD = 8

function sparkPoints(key) {
  const vals = seriesFor(key).map(e => e.value)
  if (vals.length < 2) return []
  const min = Math.min(...vals), max = Math.max(...vals)
  const range = max - min || 1
  return vals.map((v, i) => ({
    x: PAD + (i / (vals.length - 1)) * (SW - PAD * 2),
    y: SH - PAD - ((v - min) / range) * (SH - PAD * 2),
  }))
}

function linePath(key) {
  const pts = sparkPoints(key)
  if (!pts.length) return ''
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
}

function areaPath(key) {
  const pts = sparkPoints(key)
  if (!pts.length) return ''
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  return `${line} L${pts[pts.length - 1].x},${SH} L${pts[0].x},${SH} Z`
}

// Weekly completion
const weekDays = computed(() => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const today = new Date()
  const dow = (today.getDay() + 6) % 7 // Mon=0
  return days.map((label, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - dow + i)
    const dateStr = d.toISOString().slice(0, 10)
    return { label, logged: entries.value.some(e => e.date === dateStr) }
  })
})

const weeklyPct = computed(() => {
  const logged = weekDays.value.filter(d => d.logged).length
  return Math.round((logged / 7) * 100)
})

const weekColor = computed(() => {
  if (weeklyPct.value >= 80) return 'var(--green)'
  if (weeklyPct.value >= 50) return 'var(--accent)'
  return 'var(--yellow)'
})

const weekLabel = computed(() => {
  const today = new Date()
  const dow = (today.getDay() + 6) % 7
  const mon = new Date(today); mon.setDate(today.getDate() - dow)
  const sun = new Date(mon);   sun.setDate(mon.getDate() + 6)
  const fmt = d => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${fmt(mon)} – ${fmt(sun)}`
})

function formatDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
.pt-header { margin-bottom: 14px; }
.pt-header h1 { font-size: 26px; font-weight: 800; color: var(--text-h); margin: 0 0 2px; }
.pt-sub { font-size: 13px; color: var(--text); margin: 0; }

/* Weekly card */
.weekly-card { display: flex; flex-direction: column; gap: 10px; margin-bottom: 14px; }
.weekly-top { display: flex; align-items: flex-start; justify-content: space-between; }
.weekly-title { font-size: 15px; font-weight: 700; color: var(--text-h); }
.weekly-sub   { font-size: 11px; color: var(--text); margin-top: 2px; }
.weekly-pct   { font-size: 26px; font-weight: 900; }
.weekly-bar-wrap { }
.weekly-bar   { height: 8px; background: var(--surface3); border-radius: 99px; overflow: hidden; }
.weekly-fill  { height: 100%; border-radius: 99px; transition: width 0.5s ease; }
.weekly-days  { display: flex; justify-content: space-between; }
.week-day     { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.day-dot      { width: 10px; height: 10px; border-radius: 50%; background: var(--surface3); border: 1.5px solid var(--border); transition: all 0.2s; }
.day-dot.logged { background: var(--green); border-color: var(--green); }
.day-label    { font-size: 10px; color: var(--text); font-weight: 600; }

/* Log form */
.log-card  { display: flex; flex-direction: column; gap: 0; margin-bottom: 14px; }
.log-title { font-size: 15px; font-weight: 700; color: var(--text-h); margin-bottom: 2px; }
.log-date  { font-size: 12px; color: var(--text); margin-bottom: 12px; }
.log-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-label { font-size: 11px; font-weight: 700; color: var(--text); text-transform: uppercase; letter-spacing: 0.4px; }
.form-unit  { font-weight: 400; text-transform: none; color: var(--text); }
.save-error { color: var(--red); font-size: 12px; margin-top: 10px; }

/* Charts grid */
.charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }

.chart-card { display: flex; flex-direction: column; gap: 8px; padding: 12px; }
.chart-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 6px; }
.chart-left   { display: flex; align-items: flex-start; gap: 8px; }
.chart-icon   { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
.chart-name   { font-size: 12px; font-weight: 700; color: var(--text-h); }
.chart-latest { display: flex; align-items: baseline; gap: 3px; margin-top: 2px; flex-wrap: wrap; }
.chart-val    { font-size: 18px; font-weight: 900; line-height: 1; }
.chart-unit   { font-size: 11px; color: var(--text); font-weight: 600; }
.chart-delta  { font-size: 11px; font-weight: 700; }
.delta-up     { color: var(--green); }
.delta-down   { color: var(--red); }
.chart-empty-label { font-size: 11px; color: var(--text); margin-top: 2px; }
.chart-count  { font-size: 10px; color: var(--text); font-weight: 600; white-space: nowrap; flex-shrink: 0; }

.sparkline-wrap { display: flex; flex-direction: column; gap: 2px; }
.sparkline { width: 100%; height: 60px; }
.spark-labels { display: flex; justify-content: space-between; }
.spark-label  { font-size: 9px; color: var(--text); }

.spark-placeholder {
  font-size: 11px; color: var(--text);
  text-align: center; padding: 12px 0;
  background: var(--surface2); border-radius: var(--radius-sm);
}

.mini-history { display: flex; flex-direction: column; gap: 3px; border-top: 1px solid var(--border); padding-top: 6px; }
.mini-row     { display: flex; justify-content: space-between; align-items: center; }
.mini-date    { font-size: 10px; color: var(--text); }
.mini-val     { font-size: 11px; font-weight: 700; }

/* Section header */
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.section-title  { font-size: 15px; font-weight: 700; color: var(--text-h); }
.section-sub    { font-size: 12px; color: var(--text); font-weight: 600; }

/* History */
.history-list { display: flex; flex-direction: column; gap: 8px; }
.history-card { display: flex; flex-direction: column; gap: 8px; padding: 12px 14px; }
.history-top  { display: flex; align-items: center; justify-content: space-between; }
.history-date { font-size: 12px; font-weight: 700; color: var(--text-h); }
.del-btn {
  background: transparent; border: none; color: var(--text);
  font-size: 12px; padding: 3px 6px; border-radius: var(--radius-sm); transition: all 0.2s;
}
.del-btn:hover { color: var(--red); background: #ef444418; }
.history-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.history-chip {
  font-size: 11px; font-weight: 600; color: var(--text2);
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: 99px; padding: 3px 9px;
}

/* Empty */
.empty-state { text-align: center; padding: 36px 24px; display: flex; flex-direction: column; align-items: center; gap: 8px; }
.empty-icon  { font-size: 40px; }
.empty-title { font-size: 16px; font-weight: 700; color: var(--text-h); }
.empty-desc  { font-size: 13px; color: var(--text); line-height: 1.6; max-width: 260px; }

@media (max-width: 380px) {
  .charts-grid { grid-template-columns: 1fr; }
  .log-grid    { grid-template-columns: 1fr; }
}
</style>
