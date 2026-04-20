<template>
  <div>
    <div class="card rules-card">
      <div class="rules-title">🔥 ELITE RULES (NON-NEGOTIABLE)</div>
      <ul class="rules-list">
        <li>✅ Train 6 days/week</li>
        <li>⏱ Keep rest short: 20–40 sec</li>
        <li>🐌 Every rep = slow + controlled</li>
        <li>📈 Add difficulty every week (more reps / time)</li>
      </ul>
    </div>

    <div class="week-selector card">
      <div class="week-top">
        <div class="week-label">
          <span>📅 Week starting:</span>
          <input type="date" v-model="startDate" class="date-picker" @change="onDatePick" />
          <span v-if="weekLabel" class="week-range-badge">{{ weekLabel }}</span>
        </div>
        <button class="new-week-btn" @click="newWeek">+ New Week</button>
      </div>
      <div v-if="weekLabel" class="week-info">{{ weekInfo }} &nbsp;·&nbsp; Week {{ absHistory.length + 1 }} of 8</div>
      <div v-if="absHistory.length" class="abs-history">
        <div class="history-title">📚 Past Weeks</div>
        <div v-for="(w, i) in [...absHistory].reverse()" :key="i" class="history-item">
          <span class="history-week">Week {{ w.week }}</span>
          <span class="history-range">{{ w.label }}</span>
          <span class="history-hint">{{ weekHint(w.week) }}</span>
        </div>
      </div>
    </div>

    <div class="day-tabs">
      <button
        v-for="day in days" :key="day.name"
        class="day-tab"
        :class="{ active: activeDay === day.name }"
        :style="activeDay === day.name ? { background: day.color + '22', color: day.color, borderColor: day.color } : {}"
        @click="activeDay = day.name"
      >{{ day.name }}</button>
    </div>

    <template v-for="day in days" :key="day.name">
      <div v-if="activeDay === day.name">
        <div class="day-header card" :style="{ borderColor: day.color }">
          <div>
            <div class="day-title" :style="{ color: day.color }">{{ day.name }} — {{ day.subtitle }}</div>
            <div class="day-focus">{{ day.focus }}</div>
          </div>
          <button class="done-day-btn" :class="{ checked: getLog(day.name).done }" @click="toggleDay(day.name)">
            {{ getLog(day.name).done ? '✓ Done' : 'Mark Done' }}
          </button>
        </div>

        <div v-if="day.rest" class="rest-card card">
          <div class="rest-icon">😴</div>
          <div class="rest-msg">{{ day.restMsg }}</div>
        </div>

        <div v-else>
          <div v-if="day.exercises" class="exercises">
            <div v-for="(ex, i) in day.exercises" :key="i" class="exercise-card card">
              <div class="ex-header" @click="toggleExpand(day.name, i)">
                <div class="ex-check" :class="{ done: getLog(day.name).exercises?.[i] }" @click.stop="toggleExercise(day.name, i)">
                  <span v-if="getLog(day.name).exercises?.[i]">✓</span>
                </div>
                <div class="ex-info">
                  <div class="ex-name">{{ ex.name }}</div>
                  <div class="ex-sets">{{ ex.sets }}</div>
                </div>
                <span class="expand-icon">{{ expanded[day.name]?.[i] ? '▲' : '▼' }}</span>
              </div>
              <div v-if="expanded[day.name]?.[i]" class="ex-body">
                <div class="gif-wrap">
                  <iframe :src="GIF_URLS[ex.name]" class="ex-vid" frameborder="0" allowfullscreen allow="autoplay"></iframe>
                </div>
                <TimerWidget v-if="ex.seconds" :seconds="ex.seconds" />
                <div class="form-cue">💡 {{ ex.cue }}</div>
              </div>
            </div>
          </div>

          <div v-if="day.finisher" class="finisher-section">
            <div class="finisher-label">🔥 FINISHER</div>
            <div class="finisher-card card">
              <div class="ex-header" @click="toggleExpand(day.name, 'finisher')">
                <div class="ex-check" :class="{ done: getLog(day.name).finisher }" @click.stop="getLog(day.name).finisher = !getLog(day.name).finisher; persist()">
                  <span v-if="getLog(day.name).finisher">✓</span>
                </div>
                <div class="ex-info">
                  <div class="ex-name">{{ day.finisher.name }}</div>
                  <div class="ex-sets">{{ day.finisher.sets }}</div>
                </div>
                <span class="expand-icon">{{ expanded[day.name]?.finisher ? '▲' : '▼' }}</span>
              </div>
              <div v-if="expanded[day.name]?.finisher" class="ex-body">
                <div class="gif-wrap">
                  <iframe :src="GIF_URLS[day.finisher.name]" class="ex-vid" frameborder="0" allowfullscreen allow="autoplay"></iframe>
                </div>
                <TimerWidget v-if="day.finisher.seconds" :seconds="day.finisher.seconds" />
                <div class="form-cue">💡 {{ day.finisher.cue }}</div>
              </div>
            </div>
          </div>

          <div v-if="day.cardio" class="cardio-section">
            <div class="cardio-label">🏃 CARDIO</div>
            <div class="cardio-card card">
              <div class="ex-header">
                <div class="ex-check" :class="{ done: getLog(day.name).cardio }" @click="getLog(day.name).cardio = !getLog(day.name).cardio; persist()">
                  <span v-if="getLog(day.name).cardio">✓</span>
                </div>
                <div class="ex-info"><div class="ex-name">{{ day.cardio }}</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Daily Check-In -->
    <div class="card checkin-card">
      <div class="checkin-top">
        <div class="checkin-heading">💧 Daily Check-In</div>
        <div class="ci-streak">🔥 {{ ciStreak }} day streak</div>
      </div>
      <div class="ci-dots">
        <div v-for="(d, i) in ciLast7" :key="i" class="ci-dot" :class="{ filled: d.done, today: d.isToday }" :title="d.label">{{ d.short }}</div>
      </div>
      <div class="ci-section">
        <div class="ci-row-head">
          <span>💧 Water</span>
          <span class="ci-goal" :class="ciToday.water >= 10 ? 'ok' : ''">{{ (ciToday.water * 0.25).toFixed(2) }}L / 2.5L{{ ciToday.water >= 10 ? ' ✅' : '' }}</span>
        </div>
        <div class="ci-glasses">
          <button v-for="n in 10" :key="n" class="ci-glass" :class="{ filled: ciToday.water >= n }" @click="ciSetWater(n)">💧</button>
        </div>
        <div class="ci-water-labels"><span>0L</span><span>1.25L</span><span>2.5L</span></div>
      </div>
      <div class="ci-section">
        <div class="ci-row-head">
          <span>🍽️ Meals</span>
          <span class="ci-goal" :class="ciMealsChecked >= 3 ? 'ok' : ''">{{ ciMealsChecked }}/4 logged{{ ciMealsChecked >= 3 ? ' ✅' : '' }}</span>
        </div>
        <div class="ci-meals">
          <div v-for="meal in ciMeals" :key="meal.id" class="ci-meal-row">
            <button class="ci-check" :class="{ checked: ciToday.meals[meal.id] }" @click="ciToggleMeal(meal.id)">
              <span v-if="ciToday.meals[meal.id]">✓</span>
            </button>
            <span class="ci-meal-name">{{ meal.icon }} {{ meal.name }}</span>
            <input class="ci-note" :placeholder="meal.placeholder" :value="ciToday.mealNotes[meal.id] || ''" @input="ciSetNote(meal.id, $event.target.value)" />
          </div>
        </div>
      </div>
      <button class="ci-save-btn" :class="{ saved: ciSaved }" @click="ciSave">
        {{ ciSaved ? '✅ Saved!' : '💾 Save Check-In' }}
      </button>
    </div>

    <div class="card progression-card">
      <div class="prog-title">📈 PROGRESSION GUIDE</div>
      <div class="prog-grid">
        <div class="prog-item"><div class="prog-week">Week 1–2</div><div class="prog-desc">Follow as written</div></div>
        <div class="prog-item"><div class="prog-week">Week 3–4</div><div class="prog-desc">+5 reps each · +10 sec plank</div></div>
        <div class="prog-item"><div class="prog-week">Week 5–6</div><div class="prog-desc">Add 1 extra round</div></div>
        <div class="prog-item"><div class="prog-week">Week 7–8</div><div class="prog-desc">Rest 15–20 sec · Slower reps</div></div>
      </div>
    </div>

    <div class="card diet-card">
      <div class="diet-title">🍽️ STRICT DIET</div>
      <div class="diet-section">
        <div class="diet-label">✅ MUST DO</div>
        <ul>
          <li>Breakfast: eggs + fruit 🍌</li>
          <li>Lunch: rice + beans + vegetables</li>
          <li>Dinner: light (sweet potatoes / eggs / veggies)</li>
          <li>Drink 2–3L water 💧</li>
          <li>Protein every meal</li>
        </ul>
      </div>
      <div class="diet-section">
        <div class="diet-label remove">❌ REMOVE</div>
        <ul>
          <li>Soda</li>
          <li>Sugar</li>
          <li>Daily fries / chapati</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { loadUserData, saveUserData } from '../useAuth.js'
import TimerWidget from './TimerWidget.vue'

const props = defineProps({ uid: String })

const GIF_URLS = {
  'V-Ups':             'https://www.youtube.com/embed/5kvKmRGADlQ?autoplay=1&mute=1',
  'Leg Raises':        'https://www.youtube.com/embed/dGKbTKLnym4?autoplay=1&mute=1',
  'Bicycle Crunch':    'https://www.youtube.com/embed/-nJkAJpQemI?autoplay=1&mute=1',
  'Plank':             'https://www.youtube.com/embed/Fcbw82ykBvY?autoplay=1&mute=1',
  'Mountain Climbers': 'https://www.youtube.com/embed/wQq3ybaLZeA?autoplay=1&mute=1',
  'Flutter Kicks':     'https://www.youtube.com/embed/K5wuM_gNWyw?autoplay=1&mute=1',
  'Reverse Crunch':    'https://www.youtube.com/embed/UwRfRN5fYRg?autoplay=1&mute=1',
  'Dead Bug':          'https://www.youtube.com/embed/bXMQkRowNk8?autoplay=1&mute=1',
  'Toe Touches':       'https://www.youtube.com/embed/9iEI95-eZWk?autoplay=1&mute=1',
  'Crunches':          'https://www.youtube.com/embed/KojXAk4lXkE?autoplay=1&mute=1',
  'Walking':           'https://www.youtube.com/embed/AEREJOT_Mpc?autoplay=1&mute=1',
}

const days = [
  {
    name: 'Monday', subtitle: 'Full Abs Destruction', color: '#f97316',
    focus: '4 rounds — V-Ups, Leg Raises, Bicycle, Plank',
    exercises: [
      { name: 'V-Ups', sets: '15 reps', cue: 'Touch toes at top. Keep legs straight. Slow down.' },
      { name: 'Leg Raises', sets: '15 reps', cue: 'Slow 3 sec down. No swinging. Lower back flat on floor.' },
      { name: 'Bicycle Crunch', sets: '25 reps', cue: 'Elbow to opposite knee. Twist from core, not neck.' },
      { name: 'Plank', sets: '60 sec', seconds: 60, cue: 'Straight line head to heel. Squeeze glutes. No sagging hips.' },
    ],
    finisher: { name: 'Mountain Climbers', sets: '40 reps x3', cue: 'Fast knees to chest. Keep core tight throughout.' }
  },
  {
    name: 'Tuesday', subtitle: 'Lower Abs Killer', color: '#6366f1',
    focus: '4 rounds — Leg Raises, Flutter Kicks, Reverse Crunch, Plank',
    exercises: [
      { name: 'Leg Raises', sets: '20 reps', cue: 'Slow 3 sec down. Lower back pressed to floor the whole time.' },
      { name: 'Flutter Kicks', sets: '40 reps', cue: 'Small fast kicks. Lower back flat. Keep breathing steadily.' },
      { name: 'Reverse Crunch', sets: '15 reps', cue: 'Lift hips off floor. Squeeze lower abs at top. Slow down.' },
      { name: 'Plank', sets: '60 sec', seconds: 60, cue: 'Straight body. Breathe steady. Do not drop hips.' },
    ],
    cardio: 'Run / Skip — 20 min'
  },
  {
    name: 'Wednesday', subtitle: 'Core Control + Deep Abs', color: '#3b82f6',
    focus: '4 rounds — Dead Bug, Toe Touches, Plank, Bicycle',
    exercises: [
      { name: 'Dead Bug', sets: '15 reps', cue: 'Opposite arm and leg extend. Lower back stays flat. Move slow.' },
      { name: 'Toe Touches', sets: '20 reps', cue: 'Reach up to toes. Crunch from abs, not momentum.' },
      { name: 'Plank', sets: '60 sec', seconds: 60, cue: 'Elbows under shoulders. Squeeze core and glutes.' },
      { name: 'Bicycle Crunch', sets: '25 reps', cue: 'Slow rotation. Feel the twist in your obliques.' },
    ],
    finisher: { name: 'Flutter Kicks', sets: '40 reps', cue: 'Fast small kicks. Lower back flat on floor.' }
  },
  {
    name: 'Thursday', subtitle: 'Active Recovery', color: '#eab308',
    focus: 'Light work — still trains abs but lets muscles recover',
    exercises: [
      { name: 'Walking', sets: '30 min', seconds: 1800, cue: 'Easy pace. Let your body recover and rebuild.' },
      { name: 'Plank', sets: '3 x 45 sec', seconds: 45, cue: 'Hold form. Rest 30 sec between sets.' },
      { name: 'Crunches', sets: '20 reps', cue: 'Slow and controlled. Feel the squeeze at top.' },
    ]
  },
  {
    name: 'Friday', subtitle: 'Extreme Core', color: '#f97316',
    focus: '4–5 rounds — V-Ups, Leg Raises, Mountain Climbers, Plank',
    exercises: [
      { name: 'V-Ups', sets: '15 reps', cue: 'Explosive up. Slow down. Touch toes every rep.' },
      { name: 'Leg Raises', sets: '15 reps', cue: '3 sec down. Lower back flat. No swinging at all.' },
      { name: 'Mountain Climbers', sets: '40 reps', cue: 'Fast pace. Drive knees to chest. Core stays tight.' },
      { name: 'Plank', sets: '60 sec', seconds: 60, cue: 'Straight body. Breathe. Do not sag or raise hips.' },
    ]
  },
  {
    name: 'Saturday', subtitle: 'Fat Burn + Abs', color: '#22c55e',
    focus: 'Cardio first, then 3 rounds of abs',
    cardio: 'Running / Skipping — 25 min',
    exercises: [
      { name: 'Bicycle Crunch', sets: '25 reps', cue: 'Twist from core. Elbow to opposite knee. Slow.' },
      { name: 'Flutter Kicks', sets: '40 reps', cue: 'Small fast kicks. Lower back flat on floor.' },
    ]
  },
  {
    name: 'Sunday', subtitle: 'Full Rest', color: '#9ca3af',
    focus: 'No excuses. This is where abs grow.',
    rest: true,
    restMsg: 'Complete rest. Let your muscles rebuild. Eat clean. Hydrate. Come back stronger Monday.'
  },
]

const weekLabel = ref('')
const startDate = ref('')
const absHistory = reactive([])
const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const todayDay = dayNames[new Date().getDay()]
const activeDay = ref(days.find(d => d.name === todayDay) ? todayDay : 'Monday')
const expanded = reactive({})
const logs = reactive({})
let saving = false
let loaded = false

function getLog(dayName) {
  if (!logs[dayName]) logs[dayName] = { done: false, exercises: {}, finisher: false, cardio: false }
  return logs[dayName]
}

const currentWeek = computed(() => absHistory.length + 1)

function onDatePick() {
  if (!startDate.value) return
  const d = new Date(startDate.value)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  const end = new Date(d); end.setDate(end.getDate() + 6)
  const fmt = dt => dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  weekLabel.value = `${fmt(d)} – ${fmt(end)}`
  startDate.value = d.toISOString().split('T')[0]
}

function weekHint(w) {
  if (w <= 2) return 'Follow as written'
  if (w <= 4) return '+5 reps each · +10 sec plank'
  if (w <= 6) return 'Add 1 extra round'
  return 'Rest 15–20 sec · Slower reps'
}

function newWeek() {
  if (!confirm('Start a new week? Current week will be archived.')) return
  if (weekLabel.value) absHistory.push({ label: weekLabel.value, week: currentWeek.value })
  weekLabel.value = ''
  startDate.value = ''
  Object.keys(logs).forEach(k => delete logs[k])
  persist()
}

const weekInfo = computed(() => weekHint(currentWeek.value))

onMounted(async () => {
  const data = await loadUserData(props.uid, 'abs')
  if (data) {
    weekLabel.value = data.weekLabel || ''
    startDate.value = data.startDate || ''
    if (data.absHistory) absHistory.splice(0, absHistory.length, ...data.absHistory)
    if (data.logs) {
      Object.keys(data.logs).forEach(k => { logs[k] = data.logs[k] })
    }
  }
  loaded = true
  const ciData = await loadUserData(props.uid, 'checkin')
  if (ciData?.ciHistory) {
    ciHistory.value = ciData.ciHistory
    const todayEntry = ciData.ciHistory.find(e => e.date === ciTodayStr())
    if (todayEntry) ciToday.value = { ...todayEntry }
  }
})

async function persist() {
  if (!loaded || saving) return
  saving = true
  await saveUserData(props.uid, 'abs', {
    weekLabel: weekLabel.value,
    startDate: startDate.value,
    absHistory: JSON.parse(JSON.stringify(absHistory)),
    logs: JSON.parse(JSON.stringify(logs))
  })
  saving = false
}

watch([weekLabel, logs], persist, { deep: true })

// ── Daily Check-In ──────────────────────────────────────────────
const ciMeals = [
  { id: 'breakfast', name: 'Breakfast', icon: '🌅', placeholder: 'e.g. oats, eggs...' },
  { id: 'lunch',     name: 'Lunch',     icon: '☀️',  placeholder: 'e.g. rice, chicken...' },
  { id: 'dinner',    name: 'Dinner',    icon: '🌙',  placeholder: 'e.g. pasta, salad...' },
  { id: 'snack',     name: 'Snack',     icon: '🍎',  placeholder: 'e.g. fruit, nuts...' },
]

function ciTodayStr() { return new Date().toISOString().slice(0, 10) }

const ciHistory = ref([])
const ciToday = ref({ date: ciTodayStr(), water: 0, meals: {}, mealNotes: {}, done: false })
const ciSaved = ref(false)

const ciMealsChecked = computed(() => ciMeals.filter(m => ciToday.value.meals[m.id]).length)

function ciSetWater(n) { ciToday.value.water = ciToday.value.water === n ? n - 1 : n; ciSaved.value = false }
// each step = 0.25L, goal = 2.5L (10 steps)
function ciToggleMeal(id) { ciToday.value.meals[id] = !ciToday.value.meals[id]; ciSaved.value = false }
function ciSetNote(id, val) { ciToday.value.mealNotes[id] = val; ciSaved.value = false }

function ciSave() {
  ciToday.value.done = ciToday.value.water >= 10 && ciMealsChecked.value >= 3
  const hist = ciHistory.value.filter(e => e.date !== ciTodayStr())
  hist.push({ ...ciToday.value })
  ciHistory.value = hist
  saveUserData(props.uid, 'checkin', { ciHistory: hist })
  ciSaved.value = true
  setTimeout(() => ciSaved.value = false, 2000)
}

const ciStreak = computed(() => {
  const hist = [...ciHistory.value].sort((a, b) => a.date.localeCompare(b.date))
  let s = 0, check = ciTodayStr()
  for (let i = hist.length - 1; i >= 0; i--) {
    if (hist[i].date === check && hist[i].done) {
      s++
      const d = new Date(check); d.setDate(d.getDate() - 1); check = d.toISOString().slice(0, 10)
    } else if (hist[i].date === check) break
  }
  return s
})

const ciLast7 = computed(() => {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i))
    const dateStr = d.toISOString().slice(0, 10)
    const entry = ciHistory.value.find(e => e.date === dateStr)
    return { label: dateStr, short: 'SMTWTFS'[d.getDay()], done: entry?.done || false, isToday: i === 6 }
  })
})
// ────────────────────────────────────────────────────────────────

function toggleDay(day) { getLog(day).done = !getLog(day).done; persist() }

function toggleExercise(day, i) {
  const log = getLog(day)
  if (!log.exercises) log.exercises = {}
  log.exercises[i] = !log.exercises[i]
  persist()
}

function toggleExpand(day, i) {
  if (!expanded[day]) expanded[day] = {}
  expanded[day][i] = !expanded[day][i]
}
</script>

<style scoped>
.rules-card { margin-bottom: 16px; border-left: 3px solid var(--accent); }
.rules-title { font-size: 16px; font-weight: 700; color: var(--text-h); margin-bottom: 10px; }
.rules-list { list-style: none; display: flex; flex-direction: column; gap: 6px; font-size: 14px; color: var(--text); }

.week-selector { margin-bottom: 16px; }
.week-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; flex-wrap: wrap; gap: 10px; }
.week-label { display: flex; align-items: center; gap: 10px; font-weight: 600; color: var(--text-h); flex-wrap: wrap; }
.date-picker { background: var(--surface2); border: 1px solid var(--border); color: var(--text-h); border-radius: 8px; padding: 7px 10px; font-size: 14px; cursor: pointer; }
.date-picker:focus { border-color: var(--accent); outline: none; }
.week-range-badge { background: var(--accent); color: #fff; border-radius: 20px; padding: 4px 12px; font-size: 13px; font-weight: 600; white-space: nowrap; }
.new-week-btn { background: var(--accent); color: #fff; border-radius: 8px; padding: 8px 16px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; transition: opacity 0.2s; }
.new-week-btn:hover { opacity: 0.85; }
.week-info { font-size: 13px; color: var(--accent); font-weight: 600; margin-bottom: 10px; }
.abs-history { margin-top: 12px; display: flex; flex-direction: column; gap: 6px; }
.history-title { font-size: 13px; font-weight: 700; color: var(--text-h); margin-bottom: 4px; }
.history-item { display: flex; align-items: center; gap: 10px; background: var(--surface2); border-radius: 8px; padding: 8px 12px; }
.history-week { font-weight: 700; color: var(--text-h); font-size: 13px; min-width: 55px; }
.history-range { font-size: 12px; color: var(--text); flex: 1; }
.history-hint { font-size: 12px; color: var(--accent); font-weight: 600; }

.day-tabs { display: flex; gap: 6px; margin-bottom: 16px; overflow-x: auto; padding-bottom: 2px; }
.day-tab {
  padding: 8px 16px; border-radius: 8px; border: 1px solid var(--border);
  background: var(--surface); color: var(--text); font-size: 13px; font-weight: 600;
  white-space: nowrap; transition: all 0.2s; cursor: pointer;
}
.day-tab:hover { border-color: #555; }

.day-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-left: 3px solid; }
.day-title { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
.day-focus { font-size: 13px; color: var(--text); }

.done-day-btn {
  padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;
  background: var(--surface2); border: 1px solid var(--border); color: var(--text);
  transition: all 0.2s; cursor: pointer; white-space: nowrap;
}
.done-day-btn.checked { background: var(--green); border-color: var(--green); color: #fff; }

.rest-card { text-align: center; padding: 30px; }
.rest-icon { font-size: 48px; margin-bottom: 12px; }
.rest-msg { font-size: 14px; color: var(--text); line-height: 1.6; }

.exercises { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.exercise-card { padding: 0; overflow: hidden; }

.ex-header { display: flex; align-items: center; gap: 12px; padding: 12px 16px; cursor: pointer; transition: background 0.15s; }
.ex-header:hover { background: var(--surface2); }

.ex-check {
  width: 22px; height: 22px; border-radius: 6px; border: 2px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; color: #fff; flex-shrink: 0; transition: all 0.2s; cursor: pointer;
}
.ex-check.done { background: var(--green); border-color: var(--green); }

.ex-info { flex: 1; }
.ex-name { font-weight: 600; color: var(--text-h); font-size: 14px; }
.ex-sets { font-size: 13px; color: var(--text); }
.expand-icon { font-size: 11px; color: var(--text); }

.ex-body { border-top: 1px solid var(--border); padding: 12px 16px; background: var(--surface2); display: flex; flex-direction: column; gap: 8px; }
.gif-wrap { border-radius: 10px; overflow: hidden; }
.ex-vid { width: 100%; aspect-ratio: 16/9; border-radius: 10px; display: block; border: none; }
.form-cue { font-size: 13px; color: var(--text); background: #6366f115; border-radius: 8px; padding: 8px 12px; border-left: 3px solid #6366f1; }

.finisher-section, .cardio-section { margin-bottom: 16px; }
.finisher-label, .cardio-label { font-size: 12px; font-weight: 700; color: var(--text); margin-bottom: 6px; letter-spacing: 0.5px; }
.finisher-card, .cardio-card { padding: 0; }

.progression-card { margin-bottom: 16px; }
.prog-title { font-size: 15px; font-weight: 700; color: var(--text-h); margin-bottom: 12px; }
.prog-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
.prog-item { background: var(--surface2); border-radius: 8px; padding: 10px; }
.prog-week { font-weight: 700; color: var(--accent); font-size: 13px; margin-bottom: 4px; }
.prog-desc { font-size: 12px; color: var(--text); }

.diet-title { font-size: 15px; font-weight: 700; color: var(--text-h); margin-bottom: 12px; }
.diet-section { margin-bottom: 12px; }
.diet-label { font-size: 12px; font-weight: 700; color: var(--green); margin-bottom: 6px; }
.diet-label.remove { color: var(--accent); }
.diet-section ul { padding-left: 18px; font-size: 13px; color: var(--text); display: flex; flex-direction: column; gap: 4px; }

/* Check-In */
.checkin-card { margin-bottom: 16px; display: flex; flex-direction: column; gap: 16px; }
.checkin-top { display: flex; justify-content: space-between; align-items: center; }
.checkin-heading { font-size: 15px; font-weight: 700; color: var(--text-h); }
.ci-streak { font-size: 14px; font-weight: 700; color: var(--accent); }
.ci-dots { display: flex; gap: 8px; }
.ci-dot {
  width: 32px; height: 32px; border-radius: 50%;
  border: 2px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: var(--text); transition: all 0.2s;
}
.ci-dot.filled { background: #f97316; border-color: #f97316; color: #fff; }
.ci-dot.today:not(.filled) { border-color: #f97316; color: var(--text-h); }
.ci-section { display: flex; flex-direction: column; gap: 10px; }
.ci-row-head { display: flex; justify-content: space-between; font-size: 14px; font-weight: 600; color: var(--text-h); }
.ci-goal { font-size: 13px; color: var(--text); }
.ci-goal.ok { color: #22c55e; }
.ci-glasses { display: flex; flex-wrap: wrap; gap: 6px; }
.ci-glass {
  width: 34px; height: 34px; border-radius: 8px;
  background: var(--surface2); border: 1px solid var(--border);
  font-size: 15px; opacity: 0.3; transition: all 0.15s;
}
.ci-glass.filled { opacity: 1; background: #3b82f622; border-color: #3b82f6; }
.ci-water-labels { display: flex; justify-content: space-between; font-size: 11px; color: var(--text); padding: 0 2px; }
.ci-meals { display: flex; flex-direction: column; gap: 8px; }
.ci-meal-row { display: flex; align-items: center; gap: 8px; }
.ci-check {
  width: 24px; height: 24px; flex-shrink: 0; border-radius: 6px;
  border: 2px solid var(--border); background: var(--surface2);
  font-size: 13px; font-weight: 700; color: #22c55e;
  display: flex; align-items: center; justify-content: center; transition: all 0.15s;
}
.ci-check.checked { background: #22c55e22; border-color: #22c55e; }
.ci-meal-name { font-size: 13px; color: var(--text-h); white-space: nowrap; min-width: 85px; }
.ci-note { font-size: 13px; }
.ci-save-btn {
  background: var(--accent); color: #fff; font-weight: 700;
  font-size: 14px; padding: 11px; border-radius: 10px; transition: all 0.2s;
}
.ci-save-btn:hover { opacity: 0.85; }
.ci-save-btn.saved { background: #22c55e; }
</style>
