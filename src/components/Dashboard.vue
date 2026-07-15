<template>
  <div class="page">
    <!-- Player Journey Hero -->
    <div class="journey-hero card-glow" :style="{ borderColor: journeyData.color }">
      <div class="journey-top">
        <div class="journey-emoji-big">{{ journeyData.emoji }}</div>
        <div class="journey-info">
          <div class="journey-label">YOUR JOURNEY</div>
          <div class="journey-name">{{ journeyData.name }}</div>
          <div class="journey-milestone">Next: {{ journeyData.nextMilestone }}</div>
        </div>
        <div class="journey-weeks">
          <div class="weeks-num">{{ journeyData.weeksLeft }}</div>
          <div class="weeks-label">wks left</div>
        </div>
      </div>
      <div class="journey-progress-row">
        <div class="progress-bar" style="flex:1">
          <div class="progress-fill" :style="{ width: journeyProgress + '%', background: journeyData.color }"></div>
        </div>
        <span class="progress-pct">{{ journeyProgress }}%</span>
      </div>
      <div class="journey-weeks-row">
        <div v-for="(w, i) in journeyWeeks" :key="i" class="journey-week-dot"
          :class="{ done: w.done, locked: w.locked, current: w.current }">
          <span v-if="w.done">✓</span>
          <span v-else-if="w.locked">🔒</span>
          <span v-else>{{ i + 1 }}</span>
        </div>
      </div>
    </div>

    <!-- XP & Level -->
    <div class="xp-card card">
      <div class="xp-row">
        <div class="xp-avatar">{{ levelIcon }}</div>
        <div class="xp-info">
          <div class="xp-level-row">
            <span class="xp-level">Level {{ playerLevel }}</span>
            <span class="xp-title-badge">{{ levelTitle }}</span>
          </div>
          <div class="xp-bar">
            <div class="xp-fill" :style="{ width: xpPercent + '%' }"></div>
          </div>
          <div class="xp-sub">{{ xp }} / {{ xpNeeded }} XP to Level {{ playerLevel + 1 }}</div>
        </div>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="stats-row">
      <div class="stat-pill">
        <div class="stat-pill-val">🔥 {{ streak }}</div>
        <div class="stat-pill-label">Streak</div>
      </div>
      <div class="stat-pill">
        <div class="stat-pill-val">✅ {{ weekDone }}/7</div>
        <div class="stat-pill-label">This Week</div>
      </div>
      <div class="stat-pill" @click="$emit('go','progress')" style="cursor:pointer">
        <div class="stat-pill-val">{{ latestVert || '—' }}"</div>
        <div class="stat-pill-label">Vert Jump</div>
      </div>
      <div class="stat-pill">
        <div class="stat-pill-val">{{ totalSessions }}</div>
        <div class="stat-pill-label">Sessions</div>
      </div>
    </div>

    <!-- Today's Focus -->
    <div class="today-card card" :style="{ borderLeftColor: today.color }">
      <div class="today-header">
        <div>
          <div class="today-day" :style="{ color: today.color }">TODAY — {{ todayName.toUpperCase() }}</div>
          <div class="today-title">{{ today.title }}</div>
          <div class="today-loc">📍 {{ today.location }}</div>
        </div>
        <div class="today-icon-wrap" :style="{ background: today.color + '22' }">
          {{ today.icon }}
        </div>
      </div>
      <div class="today-exercises" v-if="today.exercises.length">
        <div v-for="ex in today.exercises.slice(0,3)" :key="ex" class="today-ex">• {{ ex }}</div>
        <div v-if="today.exercises.length > 3" class="today-ex-more">+{{ today.exercises.length - 3 }} more</div>
      </div>
      <div v-else class="today-rest">{{ today.restMsg }}</div>
      <button class="today-btn" :style="{ background: today.color }" @click="$emit('go', today.tab)">
        {{ today.exercises.length ? 'Start Workout →' : 'View Schedule →' }}
      </button>
    </div>

    <!-- Daily Missions -->
    <div class="section-header">
      <div class="section-title">⚡ Daily Missions</div>
      <div class="section-sub">{{ missionsCompleted }}/{{ missions.length }} done</div>
    </div>
    <div class="missions-list">
      <div v-for="m in missions" :key="m.id" class="mission-item card"
        :class="{ done: m.done }" @click="toggleMission(m.id)">
        <div class="mission-check" :class="{ done: m.done }">
          <span v-if="m.done">✓</span>
        </div>
        <div class="mission-info">
          <div class="mission-name">{{ m.name }}</div>
          <div class="mission-xp">+{{ m.xp }} XP</div>
        </div>
        <div class="mission-icon">{{ m.icon }}</div>
      </div>
    </div>

    <!-- Weekly Ring -->
    <div class="week-card card">
      <div class="section-title" style="margin-bottom:14px">This Week</div>
      <div class="ring-days">
        <div v-for="(day, i) in weekDays" :key="day.name" class="ring-day">
          <div class="ring-circle"
            :class="{ done: day.done, today: i === todayIndex }"
            :style="day.done ? { background: day.color, borderColor: day.color } : i === todayIndex ? { borderColor: day.color } : {}">
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
        <div class="tip-title">Coach's Tip</div>
        <div class="tip-text">{{ tip }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { loadUserData, saveUserData } from '../useAuth.js'

const props = defineProps({ uid: String, profile: Object })
defineEmits(['go'])

const perfEntries = ref([])
const trackerData = ref([])
const ciHistory = ref([])
const completedMissions = ref([])

onMounted(async () => {
  const perf = await loadUserData(props.uid, 'performance')
  if (perf?.entries) perfEntries.value = perf.entries

  const tracker = await loadUserData(props.uid, 'tracker')
  if (tracker?.rows) trackerData.value = tracker.rows

  const ci = await loadUserData(props.uid, 'checkin')
  if (ci?.ciHistory) ciHistory.value = ci.ciHistory

  const ms = await loadUserData(props.uid, 'missions')
  if (ms?.completed) completedMissions.value = ms.completed
})

// Journey config
const journeyMap = {
  first_dunk:  { emoji: '🏀', name: 'First Dunk',          color: '#f97316', nextMilestone: 'Touch the Rim', totalWeeks: 20, weeksLeft: 18 },
  shooter:     { emoji: '🎯', name: 'Deadly Shooter',       color: '#6366f1', nextMilestone: 'Consistent Form', totalWeeks: 16, weeksLeft: 14 },
  fastest:     { emoji: '⚡', name: 'Fastest Guard',        color: '#3b82f6', nextMilestone: 'Sub-4s Sprint',  totalWeeks: 12, weeksLeft: 10 },
  lockdown:    { emoji: '🛡️', name: 'Lockdown Defender',    color: '#22c55e', nextMilestone: 'Lateral Quickness', totalWeeks: 14, weeksLeft: 12 },
  school_team: { emoji: '🌟', name: 'Make the School Team', color: '#eab308', nextMilestone: 'Tryout Ready',   totalWeeks: 24, weeksLeft: 20 },
  pro:         { emoji: '🏆', name: 'Become Professional',  color: '#7c3aed', nextMilestone: 'Elite Conditioning', totalWeeks: 52, weeksLeft: 48 },
}

const journeyData = computed(() => {
  const j = props.profile?.journey
  return journeyMap[j] || journeyMap['first_dunk']
})

const journeyProgress = computed(() => {
  const d = journeyData.value
  const done = d.totalWeeks - d.weeksLeft
  return Math.round((done / d.totalWeeks) * 100)
})

const journeyWeeks = computed(() => {
  const d = journeyData.value
  const done = d.totalWeeks - d.weeksLeft
  return Array.from({ length: Math.min(d.totalWeeks, 12) }, (_, i) => ({
    done: i < done,
    current: i === done,
    locked: i > done,
  }))
})

// XP & Level
const xp = computed(() => completedMissions.value.length * 50 + weekDone.value * 100)
const playerLevel = computed(() => Math.floor(xp.value / 500) + 1)
const xpNeeded = computed(() => playerLevel.value * 500)
const xpPercent = computed(() => Math.min(100, ((xp.value % 500) / 500) * 100))
const levelTitles = ['Rookie','Baller','Hooper','Playmaker','All-Star','Elite','Legend']
const levelTitle = computed(() => levelTitles[Math.min(playerLevel.value - 1, levelTitles.length - 1)])
const levelIcons = ['🌱','⚡','🏀','🔥','⭐','💎','👑']
const levelIcon = computed(() => levelIcons[Math.min(playerLevel.value - 1, levelIcons.length - 1)])

// Today
const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const todayName = computed(() => dayNames[new Date().getDay()])
const todayIndex = computed(() => new Date().getDay() === 0 ? 6 : new Date().getDay() - 1)

const dayMap = {
  Monday:    { title: 'Strength A — Squat Focus',     location: 'Gym',  color: '#f97316', icon: '🏋️', tab: 'training',
               exercises: ['Back Squat 4×4–6', 'Bulgarian Split Squat 3×6–8', 'Romanian Deadlift 3×6–8', 'Calf Raises 4×15', 'Core 3×45s'] },
  Tuesday:   { title: 'Ball Handling & Shooting',     location: 'Court',color: '#6366f1', icon: '🏀', tab: 'training',
               exercises: ['Stationary Dribbling 10min', 'Form Shooting 50 reps', 'Cone Dribbling 3×', 'Free Throws 30 reps'] },
  Wednesday: { title: 'Strength B — Posterior Chain', location: 'Gym',  color: '#3b82f6', icon: '🏋️', tab: 'training',
               exercises: ['Deadlift 3–4×3–5', 'Hip Thrust 3×6–8', 'Box Jumps 4×4–6', 'Step-Ups 3×8/leg'] },
  Thursday:  { title: 'Plyometrics & Agility',        location: 'Home', color: '#8b5cf6', icon: '⚡', tab: 'training',
               exercises: ['Jump Rope 5min', 'Ankle Hops 3×20', 'Lateral Bounds 3×10', 'Depth Drops 3×5'] },
  Friday:    { title: 'Shooting & Finishing',         location: 'Court',color: '#6366f1', icon: '🎯', tab: 'training',
               exercises: ['Layup Drills 5min', 'Mid-Range 40 reps', 'Three Pointers 30 reps', 'Euro Step 3×5'] },
  Saturday:  { title: 'Power — Plyometrics',          location: 'Gym',  color: '#22c55e', icon: '💥', tab: 'training',
               exercises: ['Power Cleans 4×3–5', 'Weighted Jump Squats 4×5', 'Depth Jumps 3×4–6', 'Walking Lunges 3×10'] },
  Sunday:    { title: 'Active Recovery',              location: 'Rest', color: '#eab308', icon: '😴', tab: 'schedule',
               exercises: [], restMsg: 'Light stretch, foam roll, hydrate. Your body rebuilds today.' },
}

const today = computed(() => dayMap[todayName.value] || dayMap['Sunday'])

// Weekly ring
const weekDays = computed(() => {
  const order = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
  return order.map(name => ({
    name, short: name[0], color: dayMap[name].color,
    done: trackerData.value?.find(r => r.day === name)?.done || false,
  }))
})
const weekDone = computed(() => weekDays.value.filter(d => d.done).length)

// Streak
const streak = computed(() => {
  let s = 0
  const now = new Date()
  for (let i = 0; i <= 365; i++) {
    const d = new Date(now); d.setDate(d.getDate() - i)
    const ds = d.toISOString().slice(0, 10)
    if (ciHistory.value.find(e => e.date === ds)?.done) s++
    else if (i > 0) break
  }
  return s
})

const totalSessions = computed(() => weekDone.value)
const latestVert = computed(() => {
  const filled = perfEntries.value.filter(v => v !== '' && Number(v) > 0)
  return filled.length ? filled[filled.length - 1] : null
})

// Daily missions
const allMissions = [
  { id: 'workout',   name: 'Complete today\'s workout',  icon: '🏋️', xp: 100 },
  { id: 'water',     name: 'Drink 8 glasses of water',   icon: '💧', xp: 25 },
  { id: 'stretch',   name: '10-min morning stretch',     icon: '🧘', xp: 30 },
  { id: 'shooting',  name: '50 shooting reps',           icon: '🎯', xp: 50 },
  { id: 'sleep',     name: 'Sleep 8 hours tonight',      icon: '😴', xp: 40 },
]

const todayKey = new Date().toISOString().slice(0, 10)

const missions = computed(() =>
  allMissions.map(m => ({
    ...m,
    done: completedMissions.value.includes(`${todayKey}_${m.id}`)
  }))
)

const missionsCompleted = computed(() => missions.value.filter(m => m.done).length)

async function toggleMission(id) {
  const key = `${todayKey}_${id}`
  const idx = completedMissions.value.indexOf(key)
  if (idx === -1) completedMissions.value.push(key)
  else completedMissions.value.splice(idx, 1)
  await saveUserData(props.uid, 'missions', { completed: completedMissions.value })
}

const tips = [
  'Warm up your ankles before every session — stiff ankles kill your jump.',
  'Sleep is when you actually grow. 8 hours beats any supplement.',
  'Film your form once a week. Mistakes are invisible until you see them.',
  'Plyos first when fresh — never do them after heavy squats.',
  'Consistency over intensity. 6 average weeks > 2 perfect weeks.',
  'Eat enough. You can\'t build explosive muscle in a calorie deficit.',
  'Track your weights every session. No progress = something is off.',
  'Box jumps are about intent — jump as fast and high as possible every rep.',
  'Calf raises done slowly with full stretch are worth 3× the quick ones.',
  'Deload every 4–6 weeks. Your nervous system needs it.',
  'Hip mobility = more power transfer. Stretch those hip flexors daily.',
  'The best program is the one you actually do consistently.',
]
const tip = computed(() => tips[new Date().getDate() % tips.length])
</script>

<style scoped>
/* Journey Hero */
.journey-hero {
  margin-bottom: 12px;
  border-left: 3px solid var(--accent);
  background: linear-gradient(135deg, #1a0e00 0%, var(--surface) 100%);
}
.journey-top { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
.journey-emoji-big { font-size: 36px; flex-shrink: 0; }
.journey-info { flex: 1; min-width: 0; }
.journey-label { font-size: 10px; font-weight: 700; color: var(--text); letter-spacing: 1px; text-transform: uppercase; }
.journey-name { font-size: 17px; font-weight: 800; color: var(--text-h); }
.journey-milestone { font-size: 12px; color: var(--text); margin-top: 2px; }
.journey-weeks { text-align: center; flex-shrink: 0; }
.weeks-num { font-size: 24px; font-weight: 900; color: var(--accent); }
.weeks-label { font-size: 10px; color: var(--text); font-weight: 600; }
.journey-progress-row { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.progress-pct { font-size: 12px; font-weight: 700; color: var(--text2); flex-shrink: 0; }
.journey-weeks-row { display: flex; gap: 5px; flex-wrap: wrap; }
.journey-week-dot {
  width: 28px; height: 28px;
  border-radius: 6px;
  background: var(--surface3);
  border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: var(--text);
  transition: all 0.2s;
}
.journey-week-dot.done { background: var(--accent); border-color: var(--accent); color: #fff; }
.journey-week-dot.current { border-color: var(--accent); color: var(--accent); }
.journey-week-dot.locked { opacity: 0.4; }

/* XP */
.xp-card { margin-bottom: 12px; }
.xp-row { display: flex; align-items: center; gap: 14px; }
.xp-avatar { font-size: 32px; flex-shrink: 0; }
.xp-info { flex: 1; min-width: 0; }
.xp-level-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.xp-level { font-size: 15px; font-weight: 800; color: var(--text-h); }
.xp-title-badge {
  font-size: 11px; font-weight: 700;
  background: var(--purple); color: #fff;
  padding: 2px 8px; border-radius: 99px;
}
.xp-sub { font-size: 11px; color: var(--text); margin-top: 4px; }

/* Stats */
.stats-row { display: flex; gap: 8px; margin-bottom: 12px; }

/* Today */
.today-card {
  margin-bottom: 20px;
  border-left: 3px solid var(--accent);
}
.today-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
.today-day { font-size: 10px; font-weight: 700; letter-spacing: 1px; margin-bottom: 4px; }
.today-title { font-size: 16px; font-weight: 800; color: var(--text-h); }
.today-loc { font-size: 12px; color: var(--text); margin-top: 2px; }
.today-icon-wrap {
  width: 48px; height: 48px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; flex-shrink: 0;
}
.today-exercises { display: flex; flex-direction: column; gap: 3px; margin-bottom: 12px; }
.today-ex { font-size: 13px; color: var(--text2); }
.today-ex-more { font-size: 12px; color: var(--text); font-style: italic; }
.today-rest { font-size: 13px; color: var(--text); font-style: italic; margin-bottom: 12px; }
.today-btn {
  color: #fff; border-radius: var(--radius-sm);
  padding: 10px 16px; font-size: 13px; font-weight: 700;
  width: 100%; transition: opacity 0.2s;
}
.today-btn:hover { opacity: 0.85; }

/* Missions */
.missions-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
.mission-item {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px; cursor: pointer;
  transition: all 0.2s;
}
.mission-item.done { opacity: 0.6; }
.mission-check {
  width: 22px; height: 22px; border-radius: 50%;
  border: 2px solid var(--border2);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; flex-shrink: 0;
  transition: all 0.2s;
}
.mission-check.done { background: var(--green); border-color: var(--green); color: #fff; }
.mission-info { flex: 1; }
.mission-name { font-size: 14px; font-weight: 600; color: var(--text-h); }
.mission-xp { font-size: 11px; color: var(--accent); font-weight: 700; margin-top: 1px; }
.mission-icon { font-size: 20px; }

/* Week ring */
.week-card { margin-bottom: 12px; }
.ring-days { display: flex; justify-content: space-between; }
.ring-day { display: flex; flex-direction: column; align-items: center; gap: 5px; flex: 1; }
.ring-circle {
  width: 36px; height: 36px; border-radius: 50%;
  border: 2px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: var(--text);
  transition: all 0.2s;
}
.ring-circle.done { color: #fff; }
.ring-circle.today:not(.done) { color: var(--text-h); }
.ring-label { font-size: 10px; color: var(--text); }

/* Tip */
.tip-card { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 12px; }
.tip-icon { font-size: 20px; flex-shrink: 0; }
.tip-title { font-size: 13px; font-weight: 700; color: var(--text-h); margin-bottom: 3px; }
.tip-text { font-size: 13px; color: var(--text); line-height: 1.5; }
</style>
