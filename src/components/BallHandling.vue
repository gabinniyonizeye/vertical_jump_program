<template>
  <div class="page">
    <div class="header">
      <h1>🏀 Ball Handling</h1>
      <p>Master dribbling techniques from basics to advanced moves</p>
    </div>

    <!-- Level Tabs -->
    <div class="level-tabs">
      <button
        v-for="level in levels"
        :key="level"
        class="level-tab"
        :class="{ active: selectedLevel === level }"
        @click="selectedLevel = level"
      >
        {{ level }}
      </button>
    </div>

    <!-- Drills Grid -->
    <div class="drills-grid">
      <div
        v-for="drill in filteredDrills"
        :key="drill.id"
        class="drill-card"
        :class="{ completed: drill.completed }"
      >
        <!-- Header -->
        <div class="drill-header">
          <div class="drill-title-row">
            <div class="drill-icon">{{ drill.icon }}</div>
            <div>
              <h3>{{ drill.name }}</h3>
              <p class="drill-description">{{ drill.description }}</p>
            </div>
          </div>
          <button
            class="complete-btn"
            :class="{ completed: drill.completed }"
            @click="toggleComplete(drill)"
            :title="drill.completed ? 'Mark as incomplete' : 'Mark as complete'"
          >
            {{ drill.completed ? '✓' : '○' }}
          </button>
        </div>

        <!-- Drill Details -->
        <div class="drill-details">
          <div class="detail-item">
            <span class="detail-label">Duration:</span>
            <span class="detail-value">{{ drill.duration }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Sets:</span>
            <span class="detail-value">{{ drill.sets }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Rest:</span>
            <span class="detail-value">{{ drill.rest }}</span>
          </div>
        </div>

        <!-- Timer Section -->
        <div class="timer-section">
          <div class="timer-display">
            <span class="timer-value">{{ formatTime(drill.timeRemaining) }}</span>
            <span class="timer-label">{{ drill.timerActive ? 'Running' : 'Ready' }}</span>
          </div>
          <div class="timer-controls">
            <button
              class="timer-btn start"
              @click="startTimer(drill)"
              :disabled="drill.timerActive"
            >
              ▶
            </button>
            <button
              class="timer-btn pause"
              @click="pauseTimer(drill)"
              :disabled="!drill.timerActive"
            >
              ⏸
            </button>
            <button
              class="timer-btn reset"
              @click="resetTimer(drill)"
            >
              ↻
            </button>
          </div>
        </div>

        <!-- Tips -->
        <div class="drill-tips">
          <p class="tip-title">💡 Focus:</p>
          <p class="tip-text">{{ drill.tip }}</p>
        </div>
      </div>
    </div>

    <!-- Progress Summary -->
    <div class="progress-section card">
      <h3>📊 Progress</h3>
      <div class="progress-grid">
        <div class="progress-item">
          <div class="progress-label">Beginner</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: beginnerProgress + '%' }"></div>
          </div>
          <div class="progress-text">{{ beginnerCompleted }}/{{ beginnerTotal }}</div>
        </div>
        <div class="progress-item">
          <div class="progress-label">Intermediate</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: intermediateProgress + '%' }"></div>
          </div>
          <div class="progress-text">{{ intermediateCompleted }}/{{ intermediateTotal }}</div>
        </div>
        <div class="progress-item">
          <div class="progress-label">Advanced</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: advancedProgress + '%' }"></div>
          </div>
          <div class="progress-text">{{ advancedCompleted }}/{{ advancedTotal }}</div>
        </div>
      </div>
      <div class="overall-progress">
        <div class="overall-label">Overall Completion</div>
        <div class="overall-bar">
          <div class="overall-fill" :style="{ width: overallProgress + '%' }"></div>
        </div>
        <div class="overall-text">{{ totalCompleted }}/{{ totalDrills }} drills</div>
      </div>
    </div>

    <!-- Tips Section -->
    <div class="tips-section card">
      <h3>🎯 General Tips</h3>
      <ul class="tips-list">
        <li><strong>Ball Control:</strong> Keep the ball close to your body, use fingertips not palms</li>
        <li><strong>Eyes Up:</strong> Practice without looking at the ball to improve court vision</li>
        <li><strong>Both Hands:</strong> Develop equal proficiency with both hands</li>
        <li><strong>Speed Progression:</strong> Master at slow speed before increasing tempo</li>
        <li><strong>Daily Practice:</strong> 15-20 minutes daily is better than long sessions</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

defineProps({ profile: Object })

const selectedLevel = ref('Beginner')
const levels = ['Beginner', 'Intermediate', 'Advanced']

const drills = ref([
  // Beginner
  {
    id: 1,
    name: 'Pound Dribble',
    icon: '⬇️',
    level: 'Beginner',
    description: 'Bounce ball hard on the ground in one spot',
    duration: '30 sec',
    sets: '4',
    rest: '15 sec',
    tip: 'Keep wrist relaxed, let the ball bounce naturally. Focus on consistent rhythm.',
    completed: false,
    timerActive: false,
    timeRemaining: 30,
    totalTime: 30,
  },
  {
    id: 2,
    name: 'Crossovers',
    icon: '✖️',
    level: 'Beginner',
    description: 'Dribble ball from one hand to the other in front of body',
    duration: '45 sec',
    sets: '4',
    rest: '20 sec',
    tip: 'Push the ball hard across your body. Keep your eyes up.',
    completed: false,
    timerActive: false,
    timeRemaining: 45,
    totalTime: 45,
  },
  {
    id: 3,
    name: 'Between the Legs',
    icon: '🦵',
    level: 'Beginner',
    description: 'Dribble ball between your legs while stationary',
    duration: '45 sec',
    sets: '3',
    rest: '20 sec',
    tip: 'Spread your feet shoulder-width apart. Push the ball through with force.',
    completed: false,
    timerActive: false,
    timeRemaining: 45,
    totalTime: 45,
  },
  // Intermediate
  {
    id: 4,
    name: 'Behind the Back',
    icon: '🔄',
    level: 'Intermediate',
    description: 'Dribble ball behind your back from one hand to the other',
    duration: '45 sec',
    sets: '4',
    rest: '20 sec',
    tip: 'Rotate your torso slightly. Feel the ball with your fingertips.',
    completed: false,
    timerActive: false,
    timeRemaining: 45,
    totalTime: 45,
  },
  {
    id: 5,
    name: 'Hesitation',
    icon: '⏸️',
    level: 'Intermediate',
    description: 'Quick dribble pause to change pace and direction',
    duration: '60 sec',
    sets: '4',
    rest: '25 sec',
    tip: 'Slow down suddenly, then accelerate. Use to create space from defenders.',
    completed: false,
    timerActive: false,
    timeRemaining: 60,
    totalTime: 60,
  },
  {
    id: 6,
    name: 'In & Out',
    icon: '↔️',
    level: 'Intermediate',
    description: 'Fake crossover by pushing ball out then pulling it back',
    duration: '45 sec',
    sets: '4',
    rest: '20 sec',
    tip: 'Make the fake convincing. Push the ball out with your fingertips.',
    completed: false,
    timerActive: false,
    timeRemaining: 45,
    totalTime: 45,
  },
  // Advanced
  {
    id: 7,
    name: 'Combo Dribbles',
    icon: '🎪',
    level: 'Advanced',
    description: 'Chain multiple moves together (crossover + between legs + behind back)',
    duration: '60 sec',
    sets: '5',
    rest: '30 sec',
    tip: 'Flow smoothly between moves. Maintain ball control at high speed.',
    completed: false,
    timerActive: false,
    timeRemaining: 60,
    totalTime: 60,
  },
  {
    id: 8,
    name: 'Change of Pace',
    icon: '⚡',
    level: 'Advanced',
    description: 'Alternate between fast and slow dribbling with direction changes',
    duration: '60 sec',
    sets: '5',
    rest: '30 sec',
    tip: 'Use pace changes to create separation. Stay low and controlled.',
    completed: false,
    timerActive: false,
    timeRemaining: 60,
    totalTime: 60,
  },
])

const filteredDrills = computed(() => {
  return drills.value.filter(d => d.level === selectedLevel.value)
})

const beginnerDrills = computed(() => drills.value.filter(d => d.level === 'Beginner'))
const intermediateDrills = computed(() => drills.value.filter(d => d.level === 'Intermediate'))
const advancedDrills = computed(() => drills.value.filter(d => d.level === 'Advanced'))

const beginnerCompleted = computed(() => beginnerDrills.value.filter(d => d.completed).length)
const beginnerTotal = computed(() => beginnerDrills.value.length)
const beginnerProgress = computed(() => beginnerTotal.value ? Math.round((beginnerCompleted.value / beginnerTotal.value) * 100) : 0)

const intermediateCompleted = computed(() => intermediateDrills.value.filter(d => d.completed).length)
const intermediateTotal = computed(() => intermediateDrills.value.length)
const intermediateProgress = computed(() => intermediateTotal.value ? Math.round((intermediateCompleted.value / intermediateTotal.value) * 100) : 0)

const advancedCompleted = computed(() => advancedDrills.value.filter(d => d.completed).length)
const advancedTotal = computed(() => advancedDrills.value.length)
const advancedProgress = computed(() => advancedTotal.value ? Math.round((advancedCompleted.value / advancedTotal.value) * 100) : 0)

const totalCompleted = computed(() => drills.value.filter(d => d.completed).length)
const totalDrills = computed(() => drills.value.length)
const overallProgress = computed(() => Math.round((totalCompleted.value / totalDrills.value) * 100))

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function startTimer(drill) {
  drill.timerActive = true
  const interval = setInterval(() => {
    if (drill.timeRemaining > 0) {
      drill.timeRemaining--
    } else {
      clearInterval(interval)
      drill.timerActive = false
      drill.intervalId = null
    }
  }, 1000)
  drill.intervalId = interval
}

function pauseTimer(drill) {
  drill.timerActive = false
  if (drill.intervalId) { clearInterval(drill.intervalId); drill.intervalId = null }
}

function resetTimer(drill) {
  drill.timerActive = false
  if (drill.intervalId) { clearInterval(drill.intervalId); drill.intervalId = null }
  drill.timeRemaining = drill.totalTime
}

function toggleComplete(drill) {
  drill.completed = !drill.completed
}
</script>

<style scoped>
.page { padding: 16px; max-width: 1200px; margin: 0 auto; }
.header { margin-bottom: 20px; }
.header h1 { font-size: 30px; font-weight: 900; color: var(--text-h); margin: 0 0 4px 0; font-family: var(--font-display); letter-spacing: 0.5px; }
.header p { font-size: 14px; color: var(--text); margin: 0; }

.level-tabs { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
.level-tab {
  background: var(--surface2);
  border: 1.5px solid var(--border);
  color: var(--text);
  padding: 10px 18px;
  border-radius: 99px;
  font-size: 13px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
}
.level-tab:hover { border-color: var(--accent); color: var(--accent); }
.level-tab.active { background: linear-gradient(135deg, var(--accent), #ea6a0a); border-color: var(--accent); color: #fff; box-shadow: var(--shadow-accent); }

.drills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 14px; margin-bottom: 24px; }

.drill-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px;
  display: flex; flex-direction: column; gap: 12px;
  transition: all 0.25s;
  position: relative; overflow: hidden;
}
.drill-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--accent2));
  opacity: 0; transition: opacity 0.2s;
}
.drill-card:hover { border-color: var(--accent); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(249,115,22,0.12); }
.drill-card:hover::before { opacity: 1; }
.drill-card.completed { background: var(--surface2); opacity: 0.65; }

.drill-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.drill-title-row { display: flex; gap: 10px; flex: 1; }
.drill-icon { font-size: 30px; line-height: 1; flex-shrink: 0; }
.drill-card h3 { font-size: 15px; font-weight: 800; color: var(--text-h); margin: 0 0 2px 0; }
.drill-description { font-size: 12px; color: var(--text); margin: 0; }

.complete-btn {
  width: 32px; height: 32px; border-radius: 50%;
  border: 2px solid var(--border);
  background: transparent; color: var(--text);
  font-size: 16px; cursor: pointer; transition: all 0.2s; flex-shrink: 0;
}
.complete-btn:hover { border-color: var(--accent); color: var(--accent); }
.complete-btn.completed { background: linear-gradient(135deg, var(--accent), #ea6a0a); border-color: var(--accent); color: #fff; box-shadow: 0 2px 8px rgba(249,115,22,0.4); }

.drill-details {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
  padding: 10px; background: var(--surface2); border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}
.detail-item { display: flex; flex-direction: column; gap: 2px; }
.detail-label { font-size: 10px; color: var(--text); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
.detail-value { font-size: 13px; color: var(--accent); font-weight: 700; }

.timer-section {
  display: flex; align-items: center; gap: 12px; padding: 14px;
  background: var(--surface2); border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}
.timer-display { display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 1; }
.timer-value { font-size: 28px; font-weight: 900; color: var(--accent); font-family: 'Courier New', monospace; line-height: 1; }
.timer-label { font-size: 10px; color: var(--text); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
.timer-controls { display: flex; gap: 6px; }
.timer-btn {
  width: 34px; height: 34px; border-radius: 50%;
  border: 1.5px solid var(--border);
  background: var(--surface); color: var(--text);
  font-size: 14px; cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center; justify-content: center;
}
.timer-btn:hover:not(:disabled) { border-color: var(--accent); transform: scale(1.1); }
.timer-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.timer-btn.start { color: var(--green); }
.timer-btn.pause { color: var(--yellow); }
.timer-btn.reset { color: var(--blue); }

.drill-tips {
  padding: 10px 12px;
  background: rgba(249,115,22,0.05);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--accent);
}
.tip-title { font-size: 12px; font-weight: 700; color: var(--accent); margin: 0 0 4px 0; }
.tip-text { font-size: 12px; color: var(--text2); margin: 0; line-height: 1.5; }

.progress-section {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius); padding: 18px; margin-bottom: 16px;
}
.progress-section h3 { font-size: 16px; font-weight: 800; color: var(--text-h); margin: 0 0 16px 0; }
.progress-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 16px; }
.progress-item { display: flex; flex-direction: column; gap: 6px; }
.progress-label { font-size: 13px; font-weight: 700; color: var(--text-h); }
.progress-bar { height: 8px; background: var(--surface2); border-radius: 99px; overflow: hidden; }
.progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent2)); transition: width 0.4s ease; }
.progress-text { font-size: 12px; color: var(--accent); font-weight: 700; }
.overall-progress { padding-top: 14px; border-top: 1px solid var(--border); display: flex; flex-direction: column; gap: 6px; }
.overall-label { font-size: 13px; font-weight: 700; color: var(--text-h); }
.overall-bar { height: 10px; background: var(--surface2); border-radius: 99px; overflow: hidden; }
.overall-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--red)); transition: width 0.4s ease; }
.overall-text { font-size: 12px; color: var(--text); font-weight: 600; }

.tips-section { background: linear-gradient(135deg, rgba(249,115,22,0.05), var(--surface)); border: 1px solid rgba(249,115,22,0.2); border-radius: var(--radius); padding: 18px; }
.tips-section h3 { font-size: 16px; font-weight: 800; color: var(--text-h); margin: 0 0 14px 0; }
.tips-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.tips-list li { font-size: 13px; color: var(--text2); line-height: 1.6; padding-left: 16px; position: relative; }
.tips-list li::before { content: '▸'; position: absolute; left: 0; color: var(--accent); }
.tips-list strong { color: var(--text-h); }

@media (max-width: 768px) {
  .drills-grid { grid-template-columns: 1fr; }
  .progress-grid { grid-template-columns: 1fr; }
}
</style>
