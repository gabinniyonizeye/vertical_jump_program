<template>
  <div>
    <!-- Today Card -->
    <div class="today-card card" :style="{ borderColor: today.color }">
      <div class="today-left">
        <div class="today-label" :style="{ color: today.color }">TODAY — {{ todayName.toUpperCase() }}</div>
        <div class="today-title">{{ today.title }}</div>
        <div class="today-sub">📍 {{ today.location }}</div>
        <div class="today-exercises" v-if="today.exercises.length">
          <div v-for="ex in today.exercises" :key="ex" class="today-ex">• {{ ex }}</div>
        </div>
        <div class="today-exercises" v-else>
          <div class="today-ex rest-msg">{{ today.restMsg }}</div>
        </div>
      </div>
      <div class="today-right">
        <div class="today-badge-big" :style="{ background: today.color + '22', color: today.color }">
          {{ today.icon }}
        </div>
        <button class="go-btn" :style="{ background: today.color }" @click="$emit('go', today.tab)">
          {{ today.exercises.length ? 'Open Workout →' : 'View Schedule →' }}
        </button>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="stats-row">
      <div class="stat-card card">
        <div class="stat-icon">🔥</div>
        <div class="stat-val">{{ streak }}</div>
        <div class="stat-label">Day Streak</div>
      </div>
      <div class="stat-card card">
        <div class="stat-icon">✅</div>
        <div class="stat-val">{{ weekDone }}/7</div>
        <div class="stat-label">This Week</div>
      </div>
      <div class="stat-card card">
        <div class="stat-icon">📅</div>
        <div class="stat-val">{{ totalSessions }}</div>
        <div class="stat-label">Total Sessions</div>
      </div>
      <div class="stat-card card" style="cursor:pointer" @click="$emit('go','performance')">
        <div class="stat-icon">📏</div>
        <div class="stat-val">{{ latestVert || '—' }}<span v-if="latestVert" class="stat-unit">cm</span></div>
        <div class="stat-label">Vert Jump</div>
      </div>
      <div class="stat-card card" style="cursor:pointer" @click="$emit('go','performance')">
        <div class="stat-icon">🔥</div>
        <div class="stat-val">{{ latestAbs || '—' }}<span v-if="latestAbs" class="stat-unit">d</span></div>
        <div class="stat-label">Abs Streak</div>
      </div>
    </div>

    <!-- Weekly Ring -->
    <div class="week-ring-row card">
      <div class="ring-title">This Week's Progress</div>
      <div class="ring-days">
        <div v-for="(day, i) in weekDays" :key="day.name" class="ring-day">
          <div
            class="ring-circle"
            :class="{ done: day.done, today: i === todayIndex }"
            :style="day.done ? { background: day.color, borderColor: day.color } : i === todayIndex ? { borderColor: day.color } : {}"
          >
            <span v-if="day.done">✓</span>
            <span v-else>{{ day.short }}</span>
          </div>
          <div class="ring-label" :style="i === todayIndex ? { color: day.color } : {}">{{ day.name.slice(0,3) }}</div>
        </div>
      </div>
    </div>

    <!-- Tip of the Day -->
    <div class="tip-card card">
      <div class="tip-icon">💡</div>
      <div>
        <div class="tip-title">Tip of the Day</div>
        <div class="tip-text">{{ tip }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { loadUserData } from '../useAuth.js'

const props = defineProps({ trackerRows: Array, jumpEntries: Array, uid: String })
defineEmits(['go'])

const absLogs = ref({})
const ciHistory = ref([])

onMounted(async () => {
  // load abs logs from firestore
  const absData = await loadUserData(props.uid, 'abs')
  if (absData?.logs) absLogs.value = absData.logs

  // load daily check-in from localStorage
  const ciKey = `vjp_checkin_${props.uid || 'guest'}`
  ciHistory.value = JSON.parse(localStorage.getItem(ciKey) || '[]')
})

const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const todayName = computed(() => dayNames[new Date().getDay()])
const todayIndex = computed(() => new Date().getDay() === 0 ? 6 : new Date().getDay() - 1)

const dayMap = {
  Monday:    { title: 'Strength A — Squat Focus',          location: 'Gym',  color: '#f97316', icon: '🏋️', tab: 'workout',
               exercises: ['Back Squat 4×4–6', 'Bulgarian Split Squat 3×6–8', 'Romanian Deadlift 3×6–8', 'Standing Calf Raises 4×10–15', 'Core 3×30–45s'] },
  Tuesday:   { title: 'Air Alert',                          location: 'Home', color: '#6366f1', icon: '🏠', tab: 'schedule',
               exercises: [], restMsg: 'Home plyometric session — Air Alert program' },
  Wednesday: { title: 'Strength B — Posterior Chain',       location: 'Gym',  color: '#3b82f6', icon: '🏋️', tab: 'workout',
               exercises: ['Deadlift / Trap Bar 3–4×3–5', 'Hip Thrust 3×6–8', 'Box Jumps 4×4–6', 'Step-Ups 3×8/leg', 'Farmers Carry 2×30–40m'] },
  Thursday:  { title: 'Air Alert',                          location: 'Home', color: '#6366f1', icon: '🏠', tab: 'schedule',
               exercises: [], restMsg: 'Home plyometric session — Air Alert program' },
  Friday:    { title: 'Air Alert',                          location: 'Home', color: '#6366f1', icon: '🏠', tab: 'schedule',
               exercises: [], restMsg: 'Home plyometric session — Air Alert program' },
  Saturday:  { title: 'Power C — Plyometrics',              location: 'Gym',  color: '#22c55e', icon: '⚡', tab: 'workout',
               exercises: ['Power Cleans / KB Swings 4×3–5', 'Weighted Jump Squats 4×5–6', 'Depth / Drop Jumps 3×4–6', 'Walking Lunges 3×10/leg', 'Seated Calf Raises 4×10–15'] },
  Sunday:    { title: 'Active Recovery',                    location: 'Rest', color: '#eab308', icon: '😴', tab: 'schedule',
               exercises: [], restMsg: 'Light walk, stretch, foam roll. Let your body rebuild.' },
}

const today = computed(() => dayMap[todayName.value] || dayMap['Sunday'])

const weekDays = computed(() => {
  const order = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
  return order.map(name => ({
    name,
    short: name[0],
    color: dayMap[name].color,
    done: props.trackerRows?.find(r => r.day === name)?.done || false,
  }))
})

const weekDone = computed(() => weekDays.value.filter(d => d.done).length)

const totalSessions = computed(() => {
  const all = JSON.parse(localStorage.getItem(`vjp_history_${window.__vjp_uid || 'guest'}`) || '[]')
  return all.reduce((sum, w) => sum + w.filter(r => r.done).length, 0) + weekDone.value
})

const streak = computed(() => {
  let s = 0
  const today = new Date()
  for (let i = 0; i <= 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const entry = ciHistory.value.find(e => e.date === dateStr)
    if (entry?.done) s++
    else if (i > 0) break
  }
  return s
})

const latestVert = computed(() => {
  if (!props.jumpEntries) return null
  const filled = props.jumpEntries.filter(v => v !== '' && Number(v) > 0)
  return filled.length ? filled[filled.length - 1] : null
})

const latestAbs = computed(() => {
  const logs = absLogs.value
  if (!logs || !Object.keys(logs).length) return null
  const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  let s = 0
  const today = new Date()
  for (let i = 0; i <= 365; i++) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const name = dayNames[d.getDay()]
    if (logs[name]?.done) s++
    else if (i > 0) break
  }
  return s || null
})

const tips = [
  'Warm up your ankles before every session — stiff ankles kill your jump.',
  'Sleep is when you actually grow. 8 hours beats any supplement.',
  'Film your squat once a week. Form breaks down before you notice it.',
  'Plyos first when fresh — never do them after heavy squats.',
  'Consistency over intensity. 6 average weeks > 2 perfect weeks.',
  'Eat enough. You can\'t build explosive muscle in a big calorie deficit.',
  'Track your weights every session. If you\'re not progressing, something is off.',
  'Box jumps are about intent — jump as fast and high as possible every rep.',
  'Calf raises done slowly with full stretch are worth 3× the quick ones.',
  'Deload every 4–6 weeks. Your nervous system needs it.',
  'Hip mobility = more power transfer. Stretch those hip flexors daily.',
  'The best program is the one you actually do consistently.',
]

const tip = computed(() => tips[new Date().getDate() % tips.length])
</script>

<style scoped>
.today-card {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
  border-left-width: 3px;
  border-left-style: solid;
}

.today-label { font-size: 11px; font-weight: 700; letter-spacing: 1px; margin-bottom: 6px; }
.today-title { font-size: 20px; font-weight: 700; color: var(--text-h); margin-bottom: 4px; }
.today-sub { font-size: 13px; color: var(--text); margin-bottom: 12px; }
.today-exercises { display: flex; flex-direction: column; gap: 3px; }
.today-ex { font-size: 13px; color: var(--text); }
.rest-msg { color: var(--text); font-style: italic; }

.today-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.today-badge-big {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}

.go-btn {
  color: #fff;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  transition: opacity 0.2s;
}
.go-btn:hover { opacity: 0.85; }

.stats-row {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  margin-bottom: 16px;
}

.stat-card {
  text-align: center;
  padding: 16px 10px;
}

.stat-icon { font-size: 20px; margin-bottom: 6px; }
.stat-val { font-size: 22px; font-weight: 700; color: var(--text-h); }
.stat-unit { font-size: 13px; color: var(--text); margin-left: 2px; }
.stat-label { font-size: 11px; color: var(--text); margin-top: 2px; }

.week-ring-row {
  margin-bottom: 16px;
}

.ring-title { font-weight: 700; color: var(--text-h); margin-bottom: 14px; font-size: 14px; }

.ring-days {
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.ring-day { display: flex; flex-direction: column; align-items: center; gap: 6px; flex: 1; }

.ring-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--text);
  transition: all 0.2s;
}

.ring-circle.done { color: #fff; }
.ring-circle.today:not(.done) { color: var(--text-h); }

.ring-label { font-size: 11px; color: var(--text); }

.tip-card {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.tip-icon { font-size: 22px; flex-shrink: 0; }
.tip-title { font-weight: 700; color: var(--text-h); font-size: 14px; margin-bottom: 4px; }
.tip-text { font-size: 14px; color: var(--text); line-height: 1.5; }

@media (max-width: 600px) {
  .stats-row { grid-template-columns: repeat(3, 1fr); }
  .today-card { flex-direction: column; }
  .today-right { flex-direction: row; width: 100%; justify-content: space-between; }
}
</style>
