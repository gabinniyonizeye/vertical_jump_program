<template>
  <div class="page">
    <!-- Stats Overview -->
    <div class="stats-overview">
      <div class="stat-big card" v-for="s in statCards" :key="s.id">
        <div class="stat-big-icon">{{ s.icon }}</div>
        <div class="stat-big-val">{{ s.value }}<span class="stat-big-unit">{{ s.unit }}</span></div>
        <div class="stat-big-label">{{ s.label }}</div>
        <div class="stat-big-change" :class="s.change > 0 ? 'up' : s.change < 0 ? 'down' : ''">
          {{ s.change > 0 ? '↑' : s.change < 0 ? '↓' : '—' }} {{ Math.abs(s.change) || '' }}{{ s.unit }}
        </div>
      </div>
    </div>

    <!-- Log New Entry -->
    <div class="log-card card">
      <div class="section-title" style="margin-bottom:14px">📝 Log Today</div>
      <div class="log-grid">
        <div class="form-group">
          <label class="form-label">Vertical Jump (in)</label>
          <input v-model="newEntry.vertical" type="number" placeholder="e.g. 24" />
        </div>
        <div class="form-group">
          <label class="form-label">Weight (kg)</label>
          <input v-model="newEntry.weight" type="number" placeholder="e.g. 72" />
        </div>
        <div class="form-group">
          <label class="form-label">Sprint Time (sec)</label>
          <input v-model="newEntry.sprint" type="number" step="0.1" placeholder="e.g. 4.2" />
        </div>
        <div class="form-group">
          <label class="form-label">Bench Press (kg)</label>
          <input v-model="newEntry.bench" type="number" placeholder="e.g. 60" />
        </div>
      </div>
      <button class="btn-primary" style="margin-top:12px" @click="logEntry" :disabled="saving">
        {{ saving ? 'Saving…' : 'Log Progress ✓' }}
      </button>
    </div>

    <!-- Vertical Jump Chart -->
    <div class="chart-card card">
      <div class="section-header">
        <div class="section-title">⬆️ Vertical Jump</div>
        <div class="section-sub">{{ vertEntries.length }} entries</div>
      </div>
      <div class="chart-area" v-if="vertEntries.length > 1">
        <svg :viewBox="`0 0 ${chartW} ${chartH}`" class="chart-svg">
          <defs>
            <linearGradient id="vertGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#f97316" stop-opacity="0.3"/>
              <stop offset="100%" stop-color="#f97316" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <path :d="areaPath" fill="url(#vertGrad)" />
          <path :d="linePath" fill="none" stroke="#f97316" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          <circle v-for="(pt, i) in chartPoints" :key="i"
            :cx="pt.x" :cy="pt.y" r="4" fill="#f97316" />
        </svg>
        <div class="chart-labels">
          <span v-for="(e, i) in vertEntries.slice(-6)" :key="i" class="chart-label">
            {{ e.date.slice(5) }}
          </span>
        </div>
      </div>
      <div class="empty-state" v-else style="padding:24px">
        <div class="empty-icon">📏</div>
        <div class="empty-desc">Log your vertical jump to see your progress chart</div>
      </div>
    </div>

    <!-- Achievements -->
    <div class="section-header">
      <div class="section-title">🏆 Achievements</div>
    </div>
    <div class="achievements-grid">
      <div v-for="ach in achievements" :key="ach.id"
        class="ach-card card" :class="{ unlocked: ach.unlocked }">
        <div class="ach-icon">{{ ach.icon }}</div>
        <div class="ach-name">{{ ach.name }}</div>
        <div class="ach-desc">{{ ach.desc }}</div>
        <div class="ach-lock" v-if="!ach.unlocked">🔒</div>
      </div>
    </div>

    <!-- History -->
    <div class="section-header" style="margin-top:8px">
      <div class="section-title">📋 History</div>
    </div>
    <div class="history-list" v-if="entries.length">
      <div v-for="e in entries.slice().reverse().slice(0,10)" :key="e.date" class="history-item card">
        <div class="history-date">{{ formatDate(e.date) }}</div>
        <div class="history-stats">
          <span v-if="e.vertical" class="history-stat">⬆️ {{ e.vertical }}"</span>
          <span v-if="e.weight" class="history-stat">⚖️ {{ e.weight }}kg</span>
          <span v-if="e.sprint" class="history-stat">⚡ {{ e.sprint }}s</span>
          <span v-if="e.bench" class="history-stat">🏋️ {{ e.bench }}kg</span>
        </div>
      </div>
    </div>
    <div class="empty-state" v-else>
      <div class="empty-icon">📊</div>
      <div class="empty-title">No entries yet</div>
      <div class="empty-desc">Start logging your stats to track your basketball development</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { loadUserData, saveUserData } from '../useAuth.js'

const props = defineProps({ uid: String, profile: Object })

const entries = ref([])
const saving = ref(false)
const newEntry = ref({ vertical: '', weight: '', sprint: '', bench: '' })

onMounted(async () => {
  const data = await loadUserData(props.uid, 'progress_entries')
  if (data?.entries) entries.value = data.entries
})

async function logEntry() {
  if (!newEntry.value.vertical && !newEntry.value.weight && !newEntry.value.sprint && !newEntry.value.bench) return
  saving.value = true
  const entry = {
    date: new Date().toISOString().slice(0, 10),
    ...Object.fromEntries(Object.entries(newEntry.value).filter(([, v]) => v !== ''))
  }
  entries.value.push(entry)
  await saveUserData(props.uid, 'progress_entries', { entries: entries.value })
  newEntry.value = { vertical: '', weight: '', sprint: '', bench: '' }
  saving.value = false
}

const vertEntries = computed(() => entries.value.filter(e => e.vertical).slice(-12))

// Chart
const chartW = 300, chartH = 80
const chartPoints = computed(() => {
  const vals = vertEntries.value.map(e => Number(e.vertical))
  if (vals.length < 2) return []
  const min = Math.min(...vals) - 2
  const max = Math.max(...vals) + 2
  return vals.map((v, i) => ({
    x: (i / (vals.length - 1)) * (chartW - 20) + 10,
    y: chartH - ((v - min) / (max - min)) * (chartH - 10) - 5
  }))
})

const linePath = computed(() => {
  const pts = chartPoints.value
  if (!pts.length) return ''
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
})

const areaPath = computed(() => {
  const pts = chartPoints.value
  if (!pts.length) return ''
  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  return `${line} L ${pts[pts.length-1].x} ${chartH} L ${pts[0].x} ${chartH} Z`
})

// Stats
const latestVert = computed(() => vertEntries.value.length ? Number(vertEntries.value[vertEntries.value.length - 1].vertical) : null)
const prevVert = computed(() => vertEntries.value.length > 1 ? Number(vertEntries.value[vertEntries.value.length - 2].vertical) : null)
const latestWeight = computed(() => {
  const w = entries.value.filter(e => e.weight)
  return w.length ? Number(w[w.length - 1].weight) : null
})

const statCards = computed(() => [
  { id: 'vert',   icon: '⬆️', label: 'Vertical Jump', value: latestVert.value || '—',  unit: '"',  change: latestVert.value && prevVert.value ? latestVert.value - prevVert.value : 0 },
  { id: 'weight', icon: '⚖️', label: 'Weight',        value: latestWeight.value || '—', unit: 'kg', change: 0 },
  { id: 'streak', icon: '🔥', label: 'Entries',       value: entries.value.length,      unit: '',   change: 0 },
])

// Achievements
const achievements = computed(() => [
  { id: 'first_log',   icon: '📝', name: 'First Log',      desc: 'Log your first stat',          unlocked: entries.value.length >= 1 },
  { id: 'week_streak', icon: '🔥', name: '7-Day Logger',   desc: 'Log stats 7 days in a row',    unlocked: entries.value.length >= 7 },
  { id: 'vert_30',     icon: '⬆️', name: '30" Vertical',   desc: 'Reach 30 inch vertical jump',  unlocked: latestVert.value >= 30 },
  { id: 'vert_36',     icon: '🏀', name: 'Dunk Territory', desc: 'Reach 36 inch vertical jump',  unlocked: latestVert.value >= 36 },
  { id: 'consistent',  icon: '💪', name: 'Consistent',     desc: 'Log 30 total entries',         unlocked: entries.value.length >= 30 },
  { id: 'dedicated',   icon: '🏆', name: 'Dedicated',      desc: 'Log 100 total entries',        unlocked: entries.value.length >= 100 },
])

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
.stats-overview {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 8px; margin-bottom: 12px;
}
.stat-big { text-align: center; padding: 14px 8px; }
.stat-big-icon { font-size: 22px; margin-bottom: 4px; }
.stat-big-val { font-size: 22px; font-weight: 800; color: var(--text-h); }
.stat-big-unit { font-size: 13px; color: var(--text); margin-left: 2px; }
.stat-big-label { font-size: 11px; color: var(--text); margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px; }
.stat-big-change { font-size: 12px; font-weight: 700; margin-top: 4px; color: var(--text); }
.stat-big-change.up { color: var(--green); }
.stat-big-change.down { color: var(--red); }

.log-card { margin-bottom: 12px; }
.log-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }

.chart-card { margin-bottom: 12px; }
.chart-area { margin-top: 12px; }
.chart-svg { width: 100%; height: 80px; }
.chart-labels {
  display: flex; justify-content: space-between;
  margin-top: 4px;
}
.chart-label { font-size: 10px; color: var(--text); }

.achievements-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 8px; margin-bottom: 12px;
}
.ach-card {
  text-align: center; padding: 14px 8px;
  opacity: 0.4; position: relative;
  display: flex; flex-direction: column; align-items: center; gap: 4px;
}
.ach-card.unlocked { opacity: 1; border-color: var(--accent); }
.ach-icon { font-size: 24px; }
.ach-name { font-size: 11px; font-weight: 700; color: var(--text-h); }
.ach-desc { font-size: 10px; color: var(--text); line-height: 1.3; text-align: center; }
.ach-lock { position: absolute; top: 8px; right: 8px; font-size: 12px; }

.history-list { display: flex; flex-direction: column; gap: 8px; }
.history-item { padding: 12px 14px; }
.history-date { font-size: 12px; color: var(--text); font-weight: 600; margin-bottom: 6px; }
.history-stats { display: flex; gap: 10px; flex-wrap: wrap; }
.history-stat { font-size: 13px; font-weight: 600; color: var(--text-h); }
</style>
