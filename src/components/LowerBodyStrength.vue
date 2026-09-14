<template>
  <div class="strength-wrap">
    <!-- Header -->
    <div class="card strength-header">
      <div class="header-content">
        <div>
          <div class="header-title">💪 Lower Body Strength</div>
          <div class="header-sub">Build power, explosiveness & injury resilience</div>
        </div>
        <div class="completion-badge">
          <div class="badge-value">{{ completedCount }}/{{ exercises.length }}</div>
          <div class="badge-label">Completed</div>
        </div>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
    </div>

    <!-- Workout Summary -->
    <div class="summary-grid">
      <div class="card summary-card">
        <div class="summary-icon">🔢</div>
        <div class="summary-content">
          <div class="summary-label">Total Sets</div>
          <div class="summary-value">{{ totalSets }}</div>
        </div>
      </div>
      <div class="card summary-card">
        <div class="summary-icon">🔄</div>
        <div class="summary-content">
          <div class="summary-label">Total Reps</div>
          <div class="summary-value">{{ totalReps }}</div>
        </div>
      </div>
      <div class="card summary-card">
        <div class="summary-icon">⏱️</div>
        <div class="summary-content">
          <div class="summary-label">Est. Duration</div>
          <div class="summary-value">{{ estimatedDuration }}</div>
        </div>
      </div>
    </div>

    <!-- Exercises List -->
    <div class="exercises-list">
      <div
        v-for="(exercise, idx) in exercises"
        :key="exercise.id"
        class="exercise-card card"
        :class="{ completed: exercise.completed, expanded: expandedId === exercise.id }"
      >
        <!-- Exercise Header -->
        <div class="exercise-header" @click="toggleExpand(exercise.id)">
          <div class="exercise-info">
            <div class="exercise-number">{{ idx + 1 }}</div>
            <div class="exercise-details">
              <div class="exercise-name">{{ exercise.name }}</div>
              <div class="exercise-quick-info">
                {{ exercise.sets }} sets × {{ exercise.reps }} reps
              </div>
            </div>
          </div>
          <div class="exercise-actions">
            <button class="complete-btn" :class="{ completed: exercise.completed }" @click.stop="toggleComplete(exercise.id)" :title="exercise.completed ? 'Mark as incomplete' : 'Mark as complete'">
              {{ exercise.completed ? '✓' : '○' }}
            </button>
            <div class="expand-icon" :class="{ expanded: expandedId === exercise.id }">▼</div>
          </div>
        </div>

        <!-- Always-visible controls -->
        <div class="ex-always" @click.stop>
          <div class="rep-counter">
            <template v-if="isTimeBased(exercise.reps)">
              <div class="ex-timer" :class="{ running: getExTimer(exercise.id).running, done: getExTimer(exercise.id).done }">
                <span class="et-time">{{ timerDisplay(getExTimer(exercise.id).total ? getExTimer(exercise.id) : { remaining: parseTargetSecs(exercise.reps) || 0, total: parseTargetSecs(exercise.reps) || 1 }) }}</span>
                <button v-if="!getExTimer(exercise.id).running && !getExTimer(exercise.id).done" @click="startExTimer(exercise.id, parseTargetSecs(exercise.reps))">▶</button>
                <button v-if="getExTimer(exercise.id).running" @click="pauseExTimer(exercise.id)">⏸</button>
                <button @click="resetExTimer(exercise.id, parseTargetSecs(exercise.reps))">↺</button>
                <span class="et-label">{{ getExTimer(exercise.id).done ? '✅ Done!' : getExTimer(exercise.id).running ? 'Going...' : 'Timer' }}</span>
              </div>
            </template>
            <template v-else>
              <button class="rep-tap" @click="tapRep(exercise.id)">
                <span class="rep-num" :class="{ reached: parseTargetReps(exercise.reps) && getRepCount(exercise.id) >= parseTargetReps(exercise.reps) }">{{ getRepCount(exercise.id) }}</span>
                <span class="rep-target" v-if="parseTargetReps(exercise.reps)"> / {{ parseTargetReps(exercise.reps) }}</span>
              </button>
              <button class="rep-reset" @click="resetReps(exercise.id)">↺</button>
              <span class="rep-label">Reps</span>
            </template>
            <div class="set-counter">
              <button class="set-btn" @click="addSet(exercise.id)">+Set</button>
              <span class="set-done">{{ getSetState(exercise.id).done }}</span>
              <button class="rep-reset" @click="resetSets(exercise.id)">↺</button>
            </div>
          </div>
          <div class="inline-rest" :class="{ running: getRestTimer(exercise.id).running, finished: getRestTimer(exercise.id).done }">
            <div class="irt-top">
              <span class="irt-label">{{ getRestTimer(exercise.id).done ? '✅ Rest Done!' : getRestTimer(exercise.id).running ? '⏱ Resting...' : '⏸ Rest' }}</span>
              <span class="irt-time">{{ timerDisplay(getRestTimer(exercise.id)) }}</span>
            </div>
            <div class="irt-bar"><div class="irt-fill" :style="{ width: restProgress(getRestTimer(exercise.id)) + '%', background: getRestTimer(exercise.id).done ? '#22c55e' : getRestTimer(exercise.id).running ? '#f97316' : '#6366f1' }"></div></div>
            <div class="irt-btns">
              <button v-if="!getRestTimer(exercise.id).running && !getRestTimer(exercise.id).done" @click="startRest(exercise.id, 60)">▶ Start</button>
              <button v-if="getRestTimer(exercise.id).running" @click="pauseRest(exercise.id)">⏸ Pause</button>
              <button @click="resetRest(exercise.id, 60)">↺</button>
              <button @click="setRest(exercise.id, 30)">30s</button>
              <button @click="setRest(exercise.id, 60)">60s</button>
              <button @click="setRest(exercise.id, 90)">90s</button>
              <button @click="setRest(exercise.id, 120)">2m</button>
            </div>
          </div>
        </div>

        <!-- Exercise Details (Expandable) -->
        <div v-if="expandedId === exercise.id" class="exercise-details-section">
          <!-- Purpose -->
          <div class="detail-section">
            <div class="detail-label">🎯 Purpose</div>
            <div class="detail-content">{{ exercise.purpose }}</div>
          </div>

          <!-- Sets & Reps -->
          <div class="detail-section">
            <div class="detail-label">📊 Sets & Reps</div>
            <div class="sets-reps-grid">
              <div class="set-item">
                <span class="set-label">Sets:</span>
                <span class="set-value">{{ exercise.sets }}</span>
              </div>
              <div class="set-item">
                <span class="set-label">Reps:</span>
                <span class="set-value">{{ exercise.reps }}</span>
              </div>
              <div class="set-item">
                <span class="set-label">Rest:</span>
                <span class="set-value">{{ exercise.rest }}</span>
              </div>
            </div>
          </div>

          <!-- Form Cues -->
          <div class="detail-section">
            <div class="detail-label">💡 Form Cues</div>
            <ul class="cues-list">
              <li v-for="(cue, idx) in exercise.formCues" :key="idx">{{ cue }}</li>
            </ul>
          </div>

          <!-- Progression Tips -->
          <div class="detail-section">
            <div class="detail-label">📈 Progression Tips</div>
            <ul class="tips-list">
              <li v-for="(tip, idx) in exercise.progressionTips" :key="idx">{{ tip }}</li>
            </ul>
          </div>

          <!-- Notes Section -->
          <div class="detail-section">
            <div class="detail-label">📝 Notes</div>
            <textarea
              v-model="exercise.notes"
              class="notes-input"
              placeholder="Add notes about this exercise (weight used, how it felt, etc.)"
              @click.stop
            ></textarea>
          </div>

          <!-- Set Tracking -->
          <div class="detail-section">
            <div class="detail-label">✅ Set Completion</div>
            <div class="set-tracking">
              <button
                v-for="setNum in parseInt(exercise.sets)"
                :key="setNum"
                class="set-checkbox"
                :class="{ completed: exercise.completedSets?.includes(setNum) }"
                @click.stop="toggleSetComplete(exercise.id, setNum)"
              >
                Set {{ setNum }}
              </button>
            </div>
          </div>

          <!-- Completion Status -->
          <div class="completion-status" :class="{ completed: exercise.completed }">
            {{ exercise.completed ? '✅ Exercise Completed' : '⏳ In Progress' }}
          </div>
        </div>
      </div>
    </div>

    <!-- Workout Tips -->
    <div class="card tips-card">
      <div class="tips-title">💪 Lower Body Strength Tips</div>
      <ul class="tips-list">
        <li>Focus on proper form over heavy weight - quality over quantity</li>
        <li>Warm up with 5-10 minutes of light cardio and dynamic stretching</li>
        <li>Rest 2-3 minutes between heavy compound sets</li>
        <li>Maintain a neutral spine throughout all exercises</li>
        <li>Breathe out during the concentric (lifting) phase</li>
        <li>Track your weights and aim to increase by 5-10% weekly</li>
        <li>Combine with mobility work for injury prevention</li>
      </ul>
    </div>

    <!-- Finish Workout Button -->
    <button
      class="finish-btn"
      :class="{ 'all-completed': completedCount === exercises.length }"
      @click="finishWorkout"
    >
      {{ completedCount === exercises.length ? '🎉 Workout Complete!' : '✓ Finish Workout' }}
    </button>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const expandedId = ref(null)

const LS = 'lower_body_state'

const exercises = ref([
  {
    id: 'squat',
    name: 'Barbell Back Squat',
    purpose: 'Build lower body strength, power, and muscle mass',
    sets: '4',
    reps: '6-8',
    rest: '2-3 min',
    completed: false,
    completedSets: [],
    notes: '',
    formCues: [
      'Feet shoulder-width apart, toes slightly out',
      'Keep chest up and core tight throughout',
      'Descend until thighs are parallel to ground',
      'Drive through heels to return to standing',
      'Maintain neutral spine - no excessive forward lean',
    ],
    progressionTips: [
      'Start with bodyweight or empty bar to master form',
      'Increase weight by 5-10 lbs when you can complete all sets with good form',
      'Focus on depth and control before adding weight',
      'Consider pausing at the bottom for 1-2 seconds',
    ],
  },
  {
    id: 'rdl',
    name: 'Romanian Deadlift',
    purpose: 'Strengthen posterior chain and improve hip hinge pattern',
    sets: '4',
    reps: '6-8',
    rest: '2 min',
    completed: false,
    completedSets: [],
    notes: '',
    formCues: [
      'Stand with feet hip-width apart, slight knee bend',
      'Grip bar at hip width with overhand grip',
      'Hinge at hips, pushing them back',
      'Keep bar close to body throughout movement',
      'Feel stretch in hamstrings at bottom position',
      'Drive hips forward to return to standing',
    ],
    progressionTips: [
      'Master the hip hinge pattern with light weight first',
      'Increase weight gradually - this is a technical lift',
      'Use a mirror or video to check form',
      'Can perform with dumbbells if barbell unavailable',
    ],
  },
  {
    id: 'bss',
    name: 'Bulgarian Split Squat',
    purpose: 'Build unilateral leg strength and address imbalances',
    sets: '3',
    reps: '8-10 per leg',
    rest: '90 sec',
    completed: false,
    completedSets: [],
    notes: '',
    formCues: [
      'Place rear foot on bench behind you',
      'Front foot should be far enough forward for 90-degree angle',
      'Keep torso upright and core engaged',
      'Lower until front thigh is parallel to ground',
      'Drive through front heel to return to start',
      'Complete all reps on one leg before switching',
    ],
    progressionTips: [
      'Start with bodyweight to master balance and form',
      'Hold dumbbells at sides for added resistance',
      'Increase range of motion by using a higher bench',
      'Focus on the eccentric (lowering) phase for strength gains',
    ],
  },
  {
    id: 'calf-raise',
    name: 'Calf Raise',
    purpose: 'Build calf strength and ankle stability for jumping',
    sets: '3',
    reps: '12-15',
    rest: '60 sec',
    completed: false,
    completedSets: [],
    notes: '',
    formCues: [
      'Stand with feet hip-width apart',
      'Rise up onto the balls of your feet',
      'Pause at the top for 1-2 seconds',
      'Lower heels back to ground with control',
      'Keep core tight and body upright',
      'Full range of motion - heels should touch ground',
    ],
    progressionTips: [
      'Start with bodyweight calf raises',
      'Progress to holding dumbbells or using a barbell',
      'Perform on a step for increased range of motion',
      'Try single-leg calf raises for advanced difficulty',
      'Pause at top for 2-3 seconds to increase time under tension',
    ],
  },
  {
    id: 'nordic-curl',
    name: 'Nordic Curl',
    purpose: 'Eccentric hamstring strength and injury prevention',
    sets: '3',
    reps: '5-8',
    rest: '2 min',
    completed: false,
    completedSets: [],
    notes: '',
    formCues: [
      'Kneel on a padded surface',
      'Have a partner hold your ankles or secure them',
      'Slowly lower your body forward with control',
      'Use hamstrings to resist the descent',
      'Catch yourself with hands before hitting ground',
      'Push back up to starting position',
    ],
    progressionTips: [
      'This is an advanced exercise - start with assisted version',
      'Use a resistance band to assist if needed',
      'Focus on the eccentric (lowering) phase',
      'Increase reps gradually - even 3-5 reps is excellent',
      'Can perform on a bench with feet anchored',
    ],
  },
  {
    id: 'core',
    name: 'Core Exercises',
    purpose: 'Build core stability and prevent lower back injuries',
    sets: '3',
    reps: 'See notes',
    rest: '60 sec',
    completed: false,
    completedSets: [],
    notes: '',
    formCues: [
      'Plank: Keep body in straight line, engage core',
      'Dead Bug: Opposite arm and leg extension, control movement',
      'Pallof Press: Resist rotation, keep torso square',
      'Ab Wheel: Controlled extension and retraction',
      'Hanging Leg Raise: Control swing, full range of motion',
    ],
    progressionTips: [
      'Perform 3 core exercises per session',
      'Plank: 45-60 seconds × 3 sets',
      'Dead Bug: 10 reps per side × 3 sets',
      'Pallof Press: 10 reps per side × 3 sets',
      'Focus on quality over duration',
    ],
  },
])

function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id
}

function toggleComplete(id) {
  const exercise = exercises.value.find(e => e.id === id)
  if (exercise) {
    exercise.completed = !exercise.completed
    if (!exercise.completed) {
      exercise.completedSets = []
    }
  }
}

function toggleSetComplete(exerciseId, setNum) {
  const exercise = exercises.value.find(e => e.id === exerciseId)
  if (exercise) {
    if (exercise.completedSets.includes(setNum)) {
      exercise.completedSets = exercise.completedSets.filter(s => s !== setNum)
    } else {
      exercise.completedSets.push(setNum)
      // Auto-complete exercise if all sets are done
      const totalSets = parseInt(exercise.sets)
      if (exercise.completedSets.length === totalSets) {
        exercise.completed = true
      }
    }
  }
}

// ── Timer / Rep / Set helpers ──
const repCounters = ref({})
const setCounters = ref({})
const restTimers = ref({})
const exTimers = ref({})

onMounted(() => {
  try {
    const s = JSON.parse(localStorage.getItem(LS) || '{}')
    if (s.exercises) exercises.value.forEach(e => {
      const saved = s.exercises[e.id]
      if (saved) { e.completed = saved.completed ?? e.completed; e.completedSets = saved.completedSets ?? e.completedSets; e.notes = saved.notes ?? e.notes }
    })
    if (s.repCounters) repCounters.value = s.repCounters
    if (s.setCounters) setCounters.value = s.setCounters
  } catch {}
})
watch([exercises, repCounters, setCounters], () => {
  const exMap = {}
  exercises.value.forEach(e => { exMap[e.id] = { completed: e.completed, completedSets: e.completedSets, notes: e.notes } })
  localStorage.setItem(LS, JSON.stringify({ exercises: exMap, repCounters: repCounters.value, setCounters: setCounters.value }))
}, { deep: true })

function isTimeBased(reps) { return /sec|min/i.test(reps || '') }
function parseTargetSecs(reps) {
  if (!isTimeBased(reps)) return null
  const m = reps.match(/(\d+)/); return m ? parseInt(m[1]) : null
}
function parseTargetReps(reps) {
  if (isTimeBased(reps)) return null
  const m = reps.match(/(\d+)/); return m ? parseInt(m[1]) : null
}
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

function getExTimer(id) {
  if (!exTimers.value[id]) exTimers.value[id] = { remaining: 0, total: 0, running: false, done: false, _iv: null }
  return exTimers.value[id]
}
function startExTimer(id, sec) {
  const t = getExTimer(id)
  if (t.running) return
  if (!t.total || t.done || t.remaining === 0) { t.remaining = sec; t.total = sec; t.done = false }
  t.running = true
  t._iv = setInterval(() => {
    if (t.remaining <= 1) { t.remaining = 0; t.running = false; t.done = true; clearInterval(t._iv); pingSound() }
    else t.remaining--
  }, 1000)
}
function pauseExTimer(id) { const t = getExTimer(id); clearInterval(t._iv); t.running = false }
function resetExTimer(id, sec) {
  const t = getExTimer(id); clearInterval(t._iv)
  t.running = false; t.done = false; t.remaining = sec; t.total = sec
}

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
onUnmounted(() => {
  Object.values(restTimers.value).forEach(t => clearInterval(t._iv))
  Object.values(exTimers.value).forEach(t => clearInterval(t._iv))
})

function finishWorkout() {
  if (completedCount.value === exercises.value.length) {
    alert('🎉 Great workout! You completed all exercises!')
  } else {
    alert(`You've completed ${completedCount.value}/${exercises.value.length} exercises. Keep going!`)
  }
}

const completedCount = computed(() => exercises.value.filter(e => e.completed).length)

const progressPercent = computed(() => {
  return Math.round((completedCount.value / exercises.value.length) * 100)
})

const totalSets = computed(() => {
  return exercises.value.reduce((sum, e) => sum + parseInt(e.sets), 0)
})

const totalReps = computed(() => {
  return exercises.value.reduce((sum, e) => {
    const repsStr = e.reps.split('-')[1] || e.reps.split('×')[0]
    const repsNum = parseInt(repsStr) || 0
    return sum + repsNum * parseInt(e.sets)
  }, 0)
})

const estimatedDuration = computed(() => {
  // Rough estimate: 2-3 min per set for compound lifts
  const avgTimePerSet = 2.5
  return Math.round(totalSets.value * avgTimePerSet) + ' min'
})
</script>

<style scoped>
.strength-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.strength-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--text-h);
}

.header-sub {
  font-size: 13px;
  color: var(--text);
  margin-top: 4px;
}

.completion-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  background: var(--surface2);
  padding: 12px 16px;
  border-radius: 10px;
}

.badge-value {
  font-size: 20px;
  font-weight: 800;
  color: var(--accent);
}

.badge-label {
  font-size: 11px;
  color: var(--text);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: var(--surface2);
  border-radius: 99px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--accent);
  transition: width 0.3s ease;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
}

.summary-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summary-label {
  font-size: 11px;
  color: var(--text);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.summary-value {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-h);
}

.exercises-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.exercise-card {
  display: flex;
  flex-direction: column;
  transition: all 0.2s;
}

.exercise-card.completed {
  opacity: 0.7;
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px;
  cursor: pointer;
  user-select: none;
}

.exercise-header:hover { background: var(--surface2); border-radius: 10px 10px 0 0; }
.ex-always { padding: 0 14px 12px; display: flex; flex-direction: column; gap: 8px; }

.exercise-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.exercise-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
  flex-shrink: 0;
}

.exercise-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.exercise-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-h);
}

.exercise-quick-info {
  font-size: 12px;
  color: var(--text);
}

.exercise-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.complete-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--border);
  background: var(--surface2);
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.complete-btn:hover {
  border-color: var(--accent);
}

.complete-btn.completed {
  background: #22c55e22;
  border-color: #22c55e;
  color: #22c55e;
}

.expand-icon {
  font-size: 12px;
  color: var(--text);
  transition: transform 0.2s;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.exercise-details-section {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 14px;
  border-top: 1px solid var(--border);
  background: var(--surface2);
  border-radius: 0 0 10px 10px;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-h);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.detail-content {
  font-size: 13px;
  color: var(--text);
  line-height: 1.5;
}

.sets-reps-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.set-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: var(--surface);
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--border);
}

.set-label {
  font-size: 11px;
  color: var(--text);
  font-weight: 600;
}

.set-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-h);
}

.cues-list,
.tips-list {
  font-size: 13px;
  color: var(--text);
  line-height: 1.6;
  padding-left: 20px;
}

.cues-list li,
.tips-list li {
  margin-bottom: 6px;
}

.notes-input {
  width: 100%;
  min-height: 80px;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--text-h);
  font-size: 13px;
  font-family: inherit;
  resize: vertical;
}

.notes-input::placeholder {
  color: var(--text);
}

.set-tracking {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 8px;
}

.set-checkbox {
  padding: 10px;
  border-radius: 8px;
  border: 2px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.set-checkbox:hover {
  border-color: var(--accent);
}

.set-checkbox.completed {
  background: #22c55e22;
  border-color: #22c55e;
  color: #22c55e;
}

.completion-status {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  padding: 10px;
  border-radius: 8px;
  background: var(--surface);
  text-align: center;
}

.completion-status.completed {
  background: #22c55e22;
  color: #22c55e;
}

.tips-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tips-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-h);
}

.finish-btn {
  padding: 14px;
  border-radius: 10px;
  border: none;
  background: var(--accent);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}

.finish-btn:hover {
  opacity: 0.85;
}

.finish-btn.all-completed {
  background: #22c55e;
}

@media (max-width: 768px) {
  .summary-grid { grid-template-columns: 1fr; }
  .sets-reps-grid { grid-template-columns: 1fr; }
  .exercise-header { flex-wrap: wrap; }
}
.rep-counter { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.rep-tap { display: flex; align-items: baseline; gap: 2px; background: var(--surface); border: 2px solid var(--border); border-radius: 10px; padding: 5px 14px; cursor: pointer; transition: all 0.15s; font-weight: 800; }
.rep-tap:hover { border-color: var(--accent); }
.rep-num { font-size: 20px; color: var(--text-h); transition: color 0.2s; }
.rep-num.reached { color: #22c55e; }
.rep-target { font-size: 12px; color: var(--text); }
.rep-reset { background: none; border: 1px solid var(--border); border-radius: 6px; padding: 4px 8px; font-size: 13px; cursor: pointer; color: var(--text); transition: all 0.15s; }
.rep-reset:hover { border-color: var(--accent); color: var(--accent); }
.rep-label { font-size: 10px; color: var(--text); font-weight: 600; }
.ex-timer { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.ex-timer button { padding: 4px 9px; border-radius: 7px; border: 1px solid var(--border); background: var(--surface2); color: var(--text); font-size: 13px; cursor: pointer; transition: all 0.15s; }
.ex-timer button:hover { border-color: var(--accent); color: var(--accent); }
.et-time { font-size: 22px; font-weight: 800; color: var(--text-h); font-variant-numeric: tabular-nums; min-width: 52px; }
.ex-timer.running .et-time { color: #f97316; }
.ex-timer.done .et-time { color: #22c55e; }
.et-label { font-size: 10px; color: var(--text); font-weight: 600; }
.set-counter { display: flex; align-items: center; gap: 5px; margin-left: auto; }
.set-btn { padding: 4px 10px; border-radius: 7px; border: 1px solid var(--accent); background: #6366f122; color: var(--accent); font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
.set-btn:hover { background: var(--accent); color: #fff; }
.set-done { font-size: 16px; font-weight: 800; color: var(--text-h); min-width: 18px; text-align: center; }
.inline-rest { padding: 10px 12px; border-radius: 10px; background: var(--surface); border: 1px solid var(--border); transition: border-color 0.3s; }
.inline-rest.running { border-color: #f9731655; }
.inline-rest.finished { border-color: #22c55e88; }
.irt-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.irt-label { font-size: 11px; font-weight: 700; color: var(--text-h); }
.irt-time { font-size: 18px; font-weight: 800; color: var(--text-h); font-variant-numeric: tabular-nums; }
.irt-bar { width: 100%; height: 5px; background: var(--surface2); border-radius: 99px; overflow: hidden; margin-bottom: 8px; }
.irt-fill { height: 100%; border-radius: 99px; transition: width 0.9s linear, background 0.3s; }
.irt-btns { display: flex; gap: 6px; flex-wrap: wrap; }
.irt-btns button { padding: 5px 10px; border-radius: 7px; border: 1px solid var(--border); background: var(--surface2); color: var(--text); font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
.irt-btns button:hover { border-color: var(--accent); color: var(--accent); }
</style>
