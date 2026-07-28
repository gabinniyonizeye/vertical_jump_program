<template>
  <div class="page dashboard-wrap">
    <!-- Today's Header -->
    <div class="card today-header">
      <div class="header-top">
        <div>
          <div class="today-date">📅 {{ todayLabel }}</div>
          <div class="today-workout">{{ todayWorkout }}</div>
        </div>
        <div class="progress-circle">
          <svg viewBox="0 0 100 100">
            <defs>
              <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#f97316"/>
                <stop offset="100%" stop-color="#fbbf24"/>
              </linearGradient>
            </defs>
            <circle cx="50" cy="50" r="45" class="progress-bg" />
            <circle cx="50" cy="50" r="45" class="progress-fill" :style="{ strokeDashoffset: 282.7 * (1 - progressPercent / 100) }" />
          </svg>
          <div class="progress-text">{{ progressPercent }}%</div>
        </div>
      </div>
    </div>

    <!-- Checklist -->
    <div class="card checklist-card">
      <div class="checklist-title">Today's Tasks</div>
      <div class="tasks-list">
        <div v-for="task in tasks" :key="task.id" class="task-item">
          <button class="task-checkbox" :class="{ checked: task.completed }" @click="toggleTask(task.id)">
            <span v-if="task.completed">✓</span>
          </button>
          <div class="task-content">
            <div class="task-name" :class="{ completed: task.completed }">{{ task.icon }} {{ task.name }}</div>
            <div class="task-desc">{{ task.description }}</div>
          </div>
          <div class="task-end">
            <div class="task-time">{{ task.time }}</div>
            <button v-if="task.tab" class="task-link" @click="$emit('go', task.tab)">Open</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="stats-grid">
      <div class="card stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-value">{{ completedCount }}/{{ tasks.length }}</div>
        <div class="stat-label">Completed</div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon">⏱️</div>
        <div class="stat-value">{{ totalMinutes }}</div>
        <div class="stat-label">Minutes</div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-value">{{ progressPercent }}%</div>
        <div class="stat-label">Progress</div>
      </div>
    </div>

    <!-- Motivational Message -->
    <div class="card motivation">
      <div class="motivation-icon">{{ motivationEmoji }}</div>
      <div class="motivation-text">{{ motivationMessage }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { loadUserData, saveUserData } from '../useAuth.js'

const props = defineProps({ uid: String })
defineEmits(['go'])

const tasks = ref([
  { id: 'mobility', name: 'Morning Mobility', icon: '🧘', description: 'Dynamic stretching & warm-up', time: '15 min', completed: false },
  { id: 'workout', name: 'Workout', icon: '💪', description: 'Strength or conditioning session', time: '45 min', completed: false },
  { id: 'handling', name: 'Ball Handling', icon: '🏀', description: 'Dribbling drills & footwork', time: '20 min', completed: false },
  { id: 'shooting', name: 'Shooting', icon: '🎯', description: 'Shooting practice & form work', time: '25 min', completed: false },
  { id: 'iq', name: 'Basketball IQ', icon: '🧠', description: 'Film review & game strategy', time: '15 min', completed: false },
  { id: 'recovery', name: 'Recovery', icon: '🛌', description: 'Foam rolling & stretching', time: '15 min', completed: false },
  { id: 'water', name: 'Water Intake', icon: '💧', description: '8+ glasses throughout the day', time: 'ongoing', completed: false },
  { id: 'sleep', name: 'Sleep', icon: '😴', description: '8-9 hours of quality sleep', time: 'night', completed: false },
])

const todayLabel = computed(() => {
  const d = new Date()
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
})

const dayName = computed(() => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return days[new Date().getDay()]
})

const todayKey = new Date().toISOString().slice(0, 10)
// tab override per day per task (null = use default routeByTask)
const tabOverride = {
  Monday:    { workout: 'lower',       mobility: 'mobility' },
  Tuesday:   { workout: 'speed',       mobility: 'mobility' },
  Wednesday: { workout: 'upper',       mobility: 'mobility' },
  Thursday:  { workout: 'explosive',   mobility: 'mobility' },
  Friday:    { workout: 'train',       mobility: 'mobility' },
  Saturday:  { workout: 'explosive',   mobility: 'mobility' },
  Sunday:    { workout: 'recovery',    mobility: 'mobility' },
}
const routeByTask = { mobility: 'mobility', workout: 'train', handling: 'ballhandling', shooting: 'shooting', iq: 'iq', recovery: 'recovery', water: 'nutrition', sleep: 'recovery' }
const dayPlan = {
  Monday:    { mobility: ['Warmup: Hip & Ankle Mobility', 'Hip circles, ankle rolls, leg swings, dynamic lunges', '15 min'], workout: ['Lower Body Strength', 'Squat, RDL, split squats, calves and core', '60 min'], handling: ['Ball Handling + 100 Layups', 'Pound, cross, between, behind and combo moves', '45 min'] },
  Tuesday:   { mobility: ['Warmup: Dynamic Stretch', 'High knees, butt kicks, leg swings, hip openers', '10 min'], workout: ['Speed & Plyometrics', '10m/20m sprints, slides, closeouts and jumps', '60 min'], shooting: ['Shooting Workout', '50 form, 100 catch-and-shoot, 50 pull-ups, 50 free throws', '50 min'] },
  Wednesday: { mobility: ['Warmup: Shoulder & Spine', 'Arm circles, thoracic rotation, band pull-aparts', '15 min'], workout: ['Upper Body Strength', 'Bench, pull-ups, overhead press, rows, dips and carries', '60 min'], iq: ['Finishing + Film', 'Floaters, reverse, euro, contact finishes and 20 min film', '45 min'] },
  Thursday:  { mobility: ['Warmup: Full Body Activation', 'World greatest stretch, 90/90, deep squat hold', '15 min'], handling: ['Skill Day: Ball Handling', '45 minutes of purposeful handles and footwork', '45 min'], shooting: ['Skill Day: Shooting', '45 minutes of game-speed shooting work', '45 min'], iq: ['Read the Game', 'Use 1v1, 2v2 or 3v3 to read defenders', '30 min'] },
  Friday:    { mobility: ['Warmup: Game Prep', 'Dynamic stretch, sprint drills, jump activations', '10 min'], workout: ['Competition Day', 'Compete in 1v1, 3v3 or 5v5. Defend and communicate.', '60 min'], recovery: ['Post-Game Recovery', 'Stretch, hydrate, and note what you learned', '20 min'] },
  Saturday:  { mobility: ['Warmup: Power Activation', 'Glute bridges, band walks, jump rope, hip flexor stretch', '15 min'], workout: ['Power Day', 'Deadlift, hip thrust, walking lunge, box jumps and core', '60 min'], handling: ['Transition Court Work', 'Fast-break finishing, transition shooting and ball handling', '45 min'] },
  Sunday:    { mobility: ['Full Body Mobility Session', 'Foam roll, pigeon, couch stretch, frog, cat-cow', '30 min'], workout: ['Active Recovery Walk', '30-minute easy walk or light jog outdoors', '30 min'], iq: ['Basketball Film', 'Study spacing, reads and defensive decisions', '20 min'] },
}

onMounted(async () => {
  const plan = dayPlan[dayName.value] || {}
  const tabs = tabOverride[dayName.value] || {}
  tasks.value.forEach(task => {
    task.tab = tabs[task.id] || routeByTask[task.id]
    if (plan[task.id]) [task.name, task.description, task.time] = plan[task.id]
  })
  try {
    const data = await loadUserData(props.uid, `daily_plan_${todayKey}`)
    const completed = data?.completed || []
    tasks.value.forEach(task => { task.completed = completed.includes(task.id) })
  } catch (error) { /* A daily plan remains usable offline. */ }
})

const workoutFocus = {
  Monday: 'Lower Body Strength',
  Tuesday: 'Speed & Explosiveness',
  Wednesday: 'Upper Body',
  Thursday: 'Skill Day',
  Friday: 'Competition Day',
  Saturday: 'Power Day',
  Sunday: 'Active Recovery',
}

const todayWorkout = computed(() => `🎯 ${workoutFocus[dayName.value]}`)

const completedCount = computed(() => tasks.value.filter(t => t.completed).length)

const totalMinutes = computed(() => {
  return tasks.value
    .filter(t => !['water', 'sleep'].includes(t.id))
    .reduce((sum, t) => sum + parseInt(t.time), 0)
})

const progressPercent = computed(() => {
  return Math.round((completedCount.value / tasks.value.length) * 100)
})

const motivationMessage = computed(() => {
  const p = progressPercent.value
  if (p === 0) return 'Let\'s get started! Every task completed brings you closer to your goals.'
  if (p < 25) return 'Great start! Keep the momentum going.'
  if (p < 50) return 'You\'re halfway there! Stay focused and push through.'
  if (p < 75) return 'Excellent work! You\'re crushing it today.'
  if (p < 100) return 'Almost there! Finish strong and complete your day.'
  return '🔥 Perfect day! You\'ve completed all your tasks. Rest well!'
})

const motivationEmoji = computed(() => {
  const p = progressPercent.value
  if (p === 0) return '🚀'
  if (p < 25) return '💪'
  if (p < 50) return '🔥'
  if (p < 75) return '⭐'
  if (p < 100) return '🎯'
  return '🏆'
})

async function toggleTask(id) {
  const task = tasks.value.find(t => t.id === id)
  if (!task) return
  task.completed = !task.completed
  try {
    await saveUserData(props.uid, `daily_plan_${todayKey}`, { completed: tasks.value.filter(t => t.completed).map(t => t.id) })
  } catch (error) {
    task.completed = !task.completed
  }
}
</script>

<style scoped>
.dashboard-wrap { display: flex; flex-direction: column; gap: 16px; }

.today-header { display: flex; flex-direction: column; gap: 16px; background: linear-gradient(135deg, #1a0800, #0f0f1e); border-color: rgba(249,115,22,0.2); }

.header-top { display: flex; justify-content: space-between; align-items: center; }

.today-date { font-size: 13px; color: var(--text); font-weight: 600; }
.today-workout { font-size: 19px; font-weight: 800; color: var(--text-h); margin-top: 4px; }

.progress-circle { position: relative; width: 96px; height: 96px; flex-shrink: 0; }
.progress-circle svg { width: 100%; height: 100%; transform: rotate(-90deg); }
.progress-bg { fill: none; stroke: var(--surface3); stroke-width: 7; }
.progress-fill {
  fill: none;
  stroke: url(#progressGrad);
  stroke-width: 7;
  stroke-linecap: round;
  stroke-dasharray: 282.7;
  transition: stroke-dashoffset 0.5s cubic-bezier(0.4,0,0.2,1);
  filter: drop-shadow(0 0 6px rgba(249,115,22,0.5));
}
.progress-text {
  position: absolute; top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  font-size: 22px; font-weight: 900; color: var(--text-h);
}

.checklist-card { display: flex; flex-direction: column; gap: 12px; }
.checklist-title { font-size: 16px; font-weight: 800; color: var(--text-h); }
.tasks-list { display: flex; flex-direction: column; gap: 8px; }

.task-item {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 13px 14px;
  background: var(--surface2);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  transition: all 0.2s;
  border-left: 2px solid transparent;
}
.task-item:hover { background: var(--surface3); border-left-color: var(--accent); }

.task-checkbox {
  width: 28px; height: 28px; flex-shrink: 0;
  border-radius: 8px;
  border: 2px solid var(--border2);
  background: var(--surface);
  font-size: 14px; font-weight: 700; color: var(--green);
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s; cursor: pointer;
}
.task-checkbox:hover { border-color: var(--accent); }
.task-checkbox.checked { background: rgba(34,197,94,0.15); border-color: var(--green); box-shadow: 0 0 8px rgba(34,197,94,0.3); }

.task-content { flex: 1; display: flex; flex-direction: column; gap: 2px; }
.task-name { font-size: 14px; font-weight: 600; color: var(--text-h); transition: all 0.2s; }
.task-name.completed { color: var(--text); text-decoration: line-through; opacity: 0.5; }
.task-desc { font-size: 12px; color: var(--text); }

.task-end { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; }
.task-time { font-size: 11px; color: var(--text); font-weight: 600; white-space: nowrap; }
.task-link { background: transparent; color: var(--accent); padding: 0; font-size: 11px; font-weight: 800; }

.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.stat-card {
  display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 12px;
  position: relative; overflow: hidden;
}
.stat-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, var(--accent), var(--accent2));
}
.stat-icon { font-size: 26px; }
.stat-value { font-size: 22px; font-weight: 900; color: var(--text-h); }
.stat-label { font-size: 10px; color: var(--text); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

.motivation {
  display: flex; align-items: center; gap: 14px; padding: 18px;
  background: linear-gradient(135deg, rgba(249,115,22,0.06), var(--surface));
  border-color: rgba(249,115,22,0.2);
}
.motivation-icon { font-size: 36px; flex-shrink: 0; animation: float 3s ease-in-out infinite; }
.motivation-text { font-size: 14px; color: var(--text-h); font-weight: 600; line-height: 1.5; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-5px); }
}

@media (max-width: 380px) {
  .header-top { flex-direction: column; align-items: flex-start; gap: 12px; }
  .progress-circle { width: 80px; height: 80px; }
}
</style>
