<template>
  <div>
    <div class="perf-grid">
      <div class="card log-card">
        <div class="log-title">📏 Weekly Jump Log</div>
        <div class="entries">
          <div v-for="(entry, i) in entries" :key="i" class="entry-row">
            <span class="week-num">Week {{ i + 1 }}</span>
            <div class="entry-input-wrap">
              <input
                v-model="entries[i]"
                type="number"
                :placeholder="i === 0 ? 'Baseline cm' : 'cm'"
                min="0"
                max="200"
              />
              <span class="unit">cm</span>
            </div>
            <span class="diff" :class="diffClass(i)">{{ diffLabel(i) }}</span>
          </div>
        </div>
        <div class="log-actions">
          <button class="add-btn" @click="addWeek" :disabled="entries.length >= 12">+ Add Week</button>
          <button class="clear-btn" @click="clearAll">Clear All</button>
        </div>
      </div>

      <div class="card chart-card">
        <div class="chart-title">📈 Progress Chart</div>
        <div class="chart-wrap" v-if="filledEntries.length >= 2">
          <svg :viewBox="`0 0 ${svgW} ${svgH}`" class="chart-svg">
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#f97316" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="#f97316" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <polygon :points="areaPoints" fill="url(#grad)" />
            <polyline :points="linePoints" fill="none" stroke="#f97316" stroke-width="2.5" stroke-linejoin="round" />
            <circle
              v-for="(pt, i) in points"
              :key="i"
              :cx="pt.x"
              :cy="pt.y"
              r="4"
              fill="#f97316"
            />
            <text
              v-for="(pt, i) in points"
              :key="'l'+i"
              :x="pt.x"
              :y="pt.y - 10"
              text-anchor="middle"
              font-size="11"
              fill="#f0f0ff"
            >{{ pt.val }}cm</text>
          </svg>
          <div class="x-labels">
            <span v-for="(e, i) in filledEntries" :key="i">W{{ i + 1 }}</span>
          </div>
        </div>
        <div v-else class="chart-empty">Log at least 2 weeks to see your chart</div>

        <div class="stats-row" v-if="filledEntries.length">
          <div class="stat">
            <div class="stat-val">{{ filledEntries[0] }} cm</div>
            <div class="stat-label">Baseline</div>
          </div>
          <div class="stat">
            <div class="stat-val">{{ filledEntries[filledEntries.length - 1] }} cm</div>
            <div class="stat-label">Latest</div>
          </div>
          <div class="stat">
            <div class="stat-val" :class="totalGain >= 0 ? 'pos' : 'neg'">
              {{ totalGain >= 0 ? '+' : '' }}{{ totalGain }} cm
            </div>
            <div class="stat-label">Total Gain</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card recovery-card">
      <div class="rec-title">🧠 Recovery Checklist</div>
      <div class="rec-items">
        <div v-for="item in recovery" :key="item.label" class="rec-item" @click="item.checked = !item.checked">
          <div class="rec-check" :class="{ on: item.checked }">{{ item.checked ? '✓' : '' }}</div>
          <div>
            <div class="rec-label">{{ item.label }}</div>
            <div class="rec-sub">{{ item.sub }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="real-talk card">
      <div class="rt-title">⚠️ Real Talk</div>
      <div class="rt-items">
        <div class="rt-item green">✅ Consistent → you WILL jump higher</div>
        <div class="rt-item red">❌ Skip recovery → you'll stay stuck</div>
        <div class="rt-item red">❌ Rush progression → you'll get injured</div>
        <div class="rt-item">No magic. Just discipline.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'

const STORAGE_KEY = () => `vjp_performance_${window.__vjp_uid || 'guest'}`

const saved = JSON.parse(localStorage.getItem(STORAGE_KEY()) || 'null')
const entries = ref(saved?.entries || Array(6).fill(''))

const recovery = reactive(saved?.recovery || [
  { label: 'Sleep 7–9 hours', sub: 'Non-negotiable for muscle repair', checked: false },
  { label: 'Protein ~1.6–2g/kg', sub: 'Hit your daily target', checked: false },
  { label: 'No crash dieting', sub: 'Lose fat slowly if needed (2–4 kg max)', checked: false },
])

watch([entries, recovery], () => {
  localStorage.setItem(STORAGE_KEY(), JSON.stringify({ entries: entries.value, recovery }))
}, { deep: true })

function addWeek() { entries.value.push('') }
function clearAll() {
  if (confirm('Clear all jump data?')) entries.value = Array(6).fill('')
}

const filledEntries = computed(() =>
  entries.value.map(Number).filter((v, i) => entries.value[i] !== '' && !isNaN(v) && v > 0)
)

const totalGain = computed(() => {
  if (filledEntries.value.length < 2) return 0
  return +(filledEntries.value[filledEntries.value.length - 1] - filledEntries.value[0]).toFixed(1)
})

function diffLabel(i) {
  if (i === 0 || !entries.value[i] || !entries.value[i - 1]) return ''
  const d = Number(entries.value[i]) - Number(entries.value[i - 1])
  return (d >= 0 ? '+' : '') + d.toFixed(1) + ' cm'
}

function diffClass(i) {
  if (i === 0 || !entries.value[i] || !entries.value[i - 1]) return ''
  return Number(entries.value[i]) >= Number(entries.value[i - 1]) ? 'pos' : 'neg'
}

const svgW = 400, svgH = 160, pad = 30

const points = computed(() => {
  const vals = filledEntries.value
  if (vals.length < 2) return []
  const min = Math.min(...vals) - 2
  const max = Math.max(...vals) + 2
  return vals.map((v, i) => ({
    x: pad + (i / (vals.length - 1)) * (svgW - pad * 2),
    y: svgH - pad - ((v - min) / (max - min)) * (svgH - pad * 2),
    val: v
  }))
})

const linePoints = computed(() => points.value.map(p => `${p.x},${p.y}`).join(' '))
const areaPoints = computed(() => {
  if (!points.value.length) return ''
  const first = points.value[0], last = points.value[points.value.length - 1]
  return `${linePoints.value} ${last.x},${svgH - pad} ${first.x},${svgH - pad}`
})
</script>

<style scoped>
.perf-grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 16px;
  margin-bottom: 16px;
}

.log-title, .chart-title, .rec-title, .rt-title {
  font-weight: 700;
  color: var(--text-h);
  margin-bottom: 14px;
  font-size: 15px;
}

.entries { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }

.entry-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.week-num { font-size: 13px; color: var(--text); width: 52px; flex-shrink: 0; }

.entry-input-wrap { position: relative; flex: 1; }
.entry-input-wrap input { padding-right: 32px; }
.unit { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); font-size: 12px; color: var(--text); }

.diff { font-size: 12px; font-weight: 600; width: 60px; text-align: right; }
.pos { color: var(--green); }
.neg { color: var(--red); }

.log-actions { display: flex; gap: 8px; }

.add-btn {
  background: var(--accent);
  color: #fff;
  border-radius: 8px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 600;
  transition: opacity 0.2s;
}
.add-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.add-btn:not(:disabled):hover { opacity: 0.85; }

.clear-btn {
  background: var(--surface2);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 7px 14px;
  font-size: 13px;
  transition: all 0.2s;
}
.clear-btn:hover { color: var(--red); border-color: var(--red); }

.chart-wrap { margin-bottom: 14px; }
.chart-svg { width: 100%; display: block; }
.x-labels { display: flex; justify-content: space-between; padding: 0 30px; font-size: 11px; color: var(--text); }
.chart-empty { color: var(--text); font-size: 13px; text-align: center; padding: 30px 0; }

.stats-row { display: flex; gap: 10px; }
.stat { flex: 1; background: var(--surface2); border-radius: 8px; padding: 10px; text-align: center; }
.stat-val { font-size: 18px; font-weight: 700; color: var(--accent); }
.stat-label { font-size: 11px; color: var(--text); margin-top: 2px; }

.recovery-card { margin-bottom: 16px; }
.rec-items { display: flex; flex-direction: column; gap: 10px; }
.rec-item {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: background 0.15s;
}
.rec-item:hover { background: var(--surface2); }
.rec-check {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  border: 2px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: #fff;
  flex-shrink: 0;
  transition: all 0.2s;
}
.rec-check.on { background: var(--green); border-color: var(--green); }
.rec-label { color: var(--text-h); font-size: 14px; font-weight: 600; }
.rec-sub { font-size: 12px; color: var(--text); }

.real-talk { }
.rt-title { margin-bottom: 12px; }
.rt-items { display: flex; flex-direction: column; gap: 8px; }
.rt-item { font-size: 14px; padding: 8px 12px; border-radius: 8px; background: var(--surface2); }
.rt-item.green { color: var(--green); }
.rt-item.red { color: var(--accent); }

@media (max-width: 640px) {
  .perf-grid { grid-template-columns: 1fr; }
}
</style>
