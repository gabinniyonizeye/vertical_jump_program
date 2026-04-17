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
      <div class="week-label">📅 Current Week:</div>
      <select v-model="currentWeek" class="week-dropdown">
        <option v-for="w in 8" :key="w" :value="w">Week {{ w }}</option>
      </select>
      <div class="week-info">{{ weekInfo }}</div>
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
          <button class="done-day-btn" :class="{ checked: logs[day.name]?.done }" @click="toggleDay(day.name)">
            {{ logs[day.name]?.done ? '✓ Done' : 'Mark Done' }}
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
                <div class="ex-check" :class="{ done: logs[day.name]?.exercises?.[i] }" @click.stop="toggleExercise(day.name, i)">
                  <span v-if="logs[day.name]?.exercises?.[i]">✓</span>
                </div>
                <div class="ex-info">
                  <div class="ex-name">{{ ex.name }}</div>
                  <div class="ex-sets">{{ ex.sets }}</div>
                </div>
                <span class="expand-icon">{{ expanded[day.name]?.[i] ? '▲' : '▼' }}</span>
              </div>
              <div v-if="expanded[day.name]?.[i]" class="ex-body">
                <div class="form-cue">💡 {{ ex.cue }}</div>
              </div>
            </div>
          </div>

          <div v-if="day.finisher" class="finisher-section">
            <div class="finisher-label">🔥 FINISHER</div>
            <div class="finisher-card card">
              <div class="ex-header" @click="toggleExpand(day.name, 'finisher')">
                <div class="ex-check" :class="{ done: logs[day.name]?.finisher }" @click.stop="logs[day.name].finisher = !logs[day.name].finisher; save()">
                  <span v-if="logs[day.name]?.finisher">✓</span>
                </div>
                <div class="ex-info">
                  <div class="ex-name">{{ day.finisher.name }}</div>
                  <div class="ex-sets">{{ day.finisher.sets }}</div>
                </div>
                <span class="expand-icon">{{ expanded[day.name]?.finisher ? '▲' : '▼' }}</span>
              </div>
              <div v-if="expanded[day.name]?.finisher" class="ex-body">
                <div class="form-cue">💡 {{ day.finisher.cue }}</div>
              </div>
            </div>
          </div>

          <div v-if="day.cardio" class="cardio-section">
            <div class="cardio-label">🏃 CARDIO</div>
            <div class="cardio-card card">
              <div class="ex-header">
                <div class="ex-check" :class="{ done: logs[day.name]?.cardio }" @click="logs[day.name].cardio = !logs[day.name].cardio; save()">
                  <span v-if="logs[day.name]?.cardio">✓</span>
                </div>
                <div class="ex-info"><div class="ex-name">{{ day.cardio }}</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

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

const props = defineProps({ uid: String })

const days = [
  {
    name: 'Monday', subtitle: 'Full Abs Destruction', color: '#f97316',
    focus: '4 rounds — V-Ups, Leg Raises, Bicycle, Plank',
    exercises: [
      { name: 'V-Ups', sets: '15 reps', cue: 'Touch toes at top. Keep legs straight. Slow down.' },
      { name: 'Leg Raises', sets: '15 reps', cue: 'Slow 3 sec down. No swinging. Lower back flat on floor.' },
      { name: 'Bicycle Crunch', sets: '25 reps', cue: 'Elbow to opposite knee. Twist from core, not neck.' },
      { name: 'Plank', sets: '60 sec', cue: 'Straight line head to heel. Squeeze glutes. No sagging hips.' },
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
      { name: 'Plank', sets: '60 sec', cue: 'Straight body. Breathe steady. Do not drop hips.' },
    ],
    cardio: 'Run / Skip — 20 min'
  },
  {
    name: 'Wednesday', subtitle: 'Core Control + Deep Abs', color: '#3b82f6',
    focus: '4 rounds — Dead Bug, Toe Touches, Plank, Bicycle',
    exercises: [
      { name: 'Dead Bug', sets: '15 reps', cue: 'Opposite arm and leg extend. Lower back stays flat. Move slow.' },
      { name: 'Toe Touches', sets: '20 reps', cue: 'Reach up to toes. Crunch from abs, not momentum.' },
      { name: 'Plank', sets: '60 sec', cue: 'Elbows under shoulders. Squeeze core and glutes.' },
      { name: 'Bicycle Crunch', sets: '25 reps', cue: 'Slow rotation. Feel the twist in your obliques.' },
    ],
    finisher: { name: 'Flutter Kicks', sets: '40 reps', cue: 'Fast small kicks. Lower back flat on floor.' }
  },
  {
    name: 'Thursday', subtitle: 'Active Recovery', color: '#eab308',
    focus: 'Light work — still trains abs but lets muscles recover',
    exercises: [
      { name: 'Walking', sets: '30 min', cue: 'Easy pace. Let your body recover and rebuild.' },
      { name: 'Plank', sets: '3 x 45 sec', cue: 'Hold form. Rest 30 sec between sets.' },
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
      { name: 'Plank', sets: '60 sec', cue: 'Straight body. Breathe. Do not sag or raise hips.' },
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

const currentWeek = ref(1)
const activeDay = ref('Monday')
const expanded = reactive({})
const logs = reactive({})

const weekInfo = computed(() => {
  if (currentWeek.value <= 2) return 'Follow as written'
  if (currentWeek.value <= 4) return '+5 reps each · +10 sec plank'
  if (currentWeek.value <= 6) return 'Add 1 extra round'
  return 'Rest 15–20 sec · Slower reps'
})

onMounted(async () => {
  const data = await loadUserData(props.uid, 'abs')
  if (data) {
    currentWeek.value = data.currentWeek || 1
    if (data.logs) Object.assign(logs, data.logs)
  }
  days.forEach(d => {
    if (!logs[d.name]) logs[d.name] = { done: false, exercises: {}, finisher: false, cardio: false }
  })
})

function save() {
  saveUserData(props.uid, 'abs', { currentWeek: currentWeek.value, logs })
}

watch([currentWeek, logs], save, { deep: true })

function toggleDay(day) { logs[day].done = !logs[day].done; save() }

function toggleExercise(day, i) {
  if (!logs[day].exercises) logs[day].exercises = {}
  logs[day].exercises[i] = !logs[day].exercises[i]
  save()
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

.week-selector { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
.week-label { font-weight: 600; color: var(--text-h); }
.week-dropdown { padding: 7px 12px; border-radius: 8px; font-size: 14px; font-weight: 600; }
.week-info { font-size: 13px; color: var(--accent); font-weight: 600; }

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

.ex-body { border-top: 1px solid var(--border); padding: 12px 16px; background: var(--surface2); }
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
</style>
