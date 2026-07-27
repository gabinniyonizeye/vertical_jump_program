<template>
  <div class="mobility-wrap">
    <!-- Header -->
    <div class="card mobility-header">
      <div class="header-content">
        <div>
          <div class="header-title">🧘 Mobility Training</div>
          <div class="header-sub">Improve flexibility, range of motion & injury prevention</div>
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

    <!-- Filter Tabs -->
    <div class="filter-tabs">
      <button
        v-for="tab in filterTabs"
        :key="tab"
        class="filter-btn"
        :class="{ active: activeFilter === tab }"
        @click="activeFilter = tab"
      >
        {{ tab }}
      </button>
    </div>

    <!-- Exercises Grid -->
    <div class="exercises-grid">
      <div
        v-for="exercise in filteredExercises"
        :key="exercise.id"
        class="exercise-card card"
        :class="{ completed: exercise.completed }"
      >
        <!-- Card Header -->
        <div class="card-header">
          <div class="exercise-name">{{ exercise.name }}</div>
          <button
            class="complete-btn"
            :class="{ completed: exercise.completed }"
            @click="toggleComplete(exercise.id)"
          >
            {{ exercise.completed ? '✓' : '○' }}
          </button>
        </div>

        <!-- Purpose -->
        <div class="exercise-section">
          <div class="section-label">Purpose</div>
          <div class="section-content">{{ exercise.purpose }}</div>
        </div>

        <!-- Duration & Sets -->
        <div class="exercise-meta">
          <div class="meta-item">
            <span class="meta-icon">⏱️</span>
            <div>
              <div class="meta-label">Duration</div>
              <div class="meta-value">{{ exercise.duration }}</div>
            </div>
          </div>
          <div class="meta-item">
            <span class="meta-icon">🔄</span>
            <div>
              <div class="meta-label">Sets</div>
              <div class="meta-value">{{ exercise.sets }}</div>
            </div>
          </div>
        </div>

        <!-- Instructions -->
        <div class="exercise-section">
          <div class="section-label">How to Perform</div>
          <ol class="instructions-list">
            <li v-for="(instruction, idx) in exercise.instructions" :key="idx">
              {{ instruction }}
            </li>
          </ol>
        </div>

        <!-- Benefits -->
        <div class="exercise-section">
          <div class="section-label">Benefits</div>
          <div class="benefits-list">
            <span v-for="benefit in exercise.benefits" :key="benefit" class="benefit-tag">
              {{ benefit }}
            </span>
          </div>
        </div>

        <!-- Completion Status -->
        <div class="completion-status" :class="{ completed: exercise.completed }">
          {{ exercise.completed ? '✅ Completed' : 'Not Started' }}
        </div>
      </div>
    </div>

    <!-- Summary Stats -->
    <div class="stats-grid">
      <div class="card stat-card">
        <div class="stat-icon">⏱️</div>
        <div class="stat-value">{{ totalDuration }}</div>
        <div class="stat-label">Total Duration</div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-value">{{ totalSets }}</div>
        <div class="stat-label">Total Sets</div>
      </div>
      <div class="card stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-value">{{ progressPercent }}%</div>
        <div class="stat-label">Progress</div>
      </div>
    </div>

    <!-- Tips Card -->
    <div class="card tips-card">
      <div class="tips-title">💡 Mobility Tips</div>
      <ul class="tips-list">
        <li>Perform mobility work daily for best results</li>
        <li>Never bounce or force stretches - move slowly and controlled</li>
        <li>Breathe deeply throughout each exercise</li>
        <li>Hold stretches for the full duration to improve flexibility</li>
        <li>Combine with foam rolling for enhanced recovery</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const exercises = ref([
  {
    id: 'cat-cow',
    name: 'Cat-Cow',
    purpose: 'Mobilize the spine and improve thoracic flexibility',
    duration: '2 min',
    sets: '10 reps',
    completed: false,
    category: 'Spine',
    instructions: [
      'Start on hands and knees with wrists under shoulders and knees under hips',
      'Inhale and drop your belly, lift your gaze (Cow position)',
      'Exhale and round your spine, tuck your chin (Cat position)',
      'Flow smoothly between positions for 10 repetitions',
    ],
    benefits: ['Spine mobility', 'Core activation', 'Breathing control'],
  },
  {
    id: 'worlds-greatest',
    name: "World's Greatest Stretch",
    purpose: 'Full-body mobility combining multiple stretches in one movement',
    duration: '3 min',
    sets: '5 reps per side',
    completed: false,
    category: 'Full Body',
    instructions: [
      'Start standing with feet shoulder-width apart',
      'Lunge forward with right leg, place hands on ground',
      'Rotate torso to the right, reaching arm toward ceiling',
      'Place right hand down and push hips back into hamstring stretch',
      'Return to lunge and step back to plank',
      'Repeat on opposite side',
    ],
    benefits: ['Hip mobility', 'Hamstring flexibility', 'Thoracic rotation', 'Core strength'],
  },
  {
    id: '90-90',
    name: '90/90 Stretch',
    purpose: 'Improve hip external rotation and mobility',
    duration: '2 min',
    sets: '30 sec per side',
    completed: false,
    category: 'Hips',
    instructions: [
      'Sit on the ground with both legs bent at 90 degrees',
      'Front leg bent in front of you, back leg bent to the side',
      'Keep your torso upright and lean forward slightly',
      'Feel the stretch in your front hip and glute',
      'Hold for 30 seconds, then switch sides',
    ],
    benefits: ['Hip mobility', 'Glute flexibility', 'Injury prevention'],
  },
  {
    id: 'deep-squat',
    name: 'Deep Squat Hold',
    purpose: 'Improve ankle, hip, and thoracic mobility',
    duration: '2 min',
    sets: '1 hold',
    completed: false,
    category: 'Full Body',
    instructions: [
      'Stand with feet shoulder-width apart',
      'Squat down as deep as possible while keeping heels on ground',
      'Place elbows inside your knees and press them outward',
      'Keep chest upright and maintain the position',
      'Hold for 2 minutes, breathing deeply',
    ],
    benefits: ['Ankle mobility', 'Hip opening', 'Thoracic extension', 'Posture improvement'],
  },
  {
    id: 'couch-stretch',
    name: 'Couch Stretch',
    purpose: 'Deep hip flexor and quad stretch',
    duration: '2 min',
    sets: '1 min per leg',
    completed: false,
    category: 'Hips',
    instructions: [
      'Face away from a couch or bench',
      'Place one knee on the couch behind you, foot elevated',
      'Step forward with the other leg into a lunge position',
      'Keep your torso upright and squeeze your glute',
      'Hold for 1 minute, then switch legs',
    ],
    benefits: ['Hip flexor stretch', 'Quad flexibility', 'Posture correction'],
  },
  {
    id: 'hamstring',
    name: 'Hamstring Stretch',
    purpose: 'Improve hamstring flexibility and reduce lower back tension',
    duration: '2 min',
    sets: '30 sec per leg',
    completed: false,
    category: 'Legs',
    instructions: [
      'Lie on your back with knees bent and feet on the ground',
      'Lift one leg and hold behind the thigh or calf',
      'Gently pull your leg toward your chest',
      'Keep your lower back pressed to the ground',
      'Hold for 30 seconds, then switch legs',
    ],
    benefits: ['Hamstring flexibility', 'Lower back relief', 'Injury prevention'],
  },
  {
    id: 'butterfly',
    name: 'Butterfly Stretch',
    purpose: 'Open hips and improve inner thigh flexibility',
    duration: '2 min',
    sets: '1 hold',
    completed: false,
    category: 'Hips',
    instructions: [
      'Sit on the ground with your back against a wall',
      'Bend both knees and bring soles of feet together',
      'Let your knees fall to the sides naturally',
      'Gently press your knees toward the ground with your elbows',
      'Keep your chest upright and hold the position',
    ],
    benefits: ['Hip opening', 'Inner thigh flexibility', 'Groin mobility'],
  },
  {
    id: 'frog',
    name: 'Frog Stretch',
    purpose: 'Deep hip and groin stretch for maximum mobility',
    duration: '2 min',
    sets: '1 hold',
    completed: false,
    category: 'Hips',
    instructions: [
      'Start on hands and knees',
      'Widen your knees as far as comfortable',
      'Lower your hips back toward your heels',
      'Keep your hands in front for support',
      'Feel the deep stretch in your hips and groin',
    ],
    benefits: ['Hip mobility', 'Groin flexibility', 'Deep hip opening'],
  },
  {
    id: 'pigeon',
    name: 'Pigeon Stretch',
    purpose: 'Intense glute and hip external rotator stretch',
    duration: '2 min',
    sets: '1 min per side',
    completed: false,
    category: 'Hips',
    instructions: [
      'Start in a plank position',
      'Bring right knee forward toward right wrist',
      'Lower your hips and fold forward over your leg',
      'Keep your hips level and chest upright',
      'Hold for 1 minute, then switch sides',
    ],
    benefits: ['Glute stretch', 'Hip external rotation', 'Piriformis relief'],
  },
  {
    id: 'ankle-mobility',
    name: 'Ankle Mobility',
    purpose: 'Improve ankle range of motion and stability',
    duration: '2 min',
    sets: '10 reps per direction',
    completed: false,
    category: 'Ankles',
    instructions: [
      'Stand on one leg or hold onto support',
      'Lift the other foot slightly off the ground',
      'Rotate your ankle in circles - 10 clockwise, 10 counterclockwise',
      'Point your toes down, then pull them up toward your shin',
      'Repeat on the other side',
    ],
    benefits: ['Ankle stability', 'Injury prevention', 'Balance improvement'],
  },
  {
    id: 'thoracic-rotation',
    name: 'Thoracic Rotation',
    purpose: 'Improve upper back mobility and shoulder health',
    duration: '2 min',
    sets: '10 reps per side',
    completed: false,
    category: 'Spine',
    instructions: [
      'Start on hands and knees',
      'Place right hand behind your head with elbow pointing out',
      'Rotate your torso to the right, opening your chest',
      'Return to center and repeat on the left side',
      'Perform 10 rotations on each side',
    ],
    benefits: ['Thoracic mobility', 'Shoulder health', 'Posture improvement', 'Breathing capacity'],
  },
])

const activeFilter = ref('All')

const filterTabs = computed(() => {
  const categories = new Set(exercises.value.map(e => e.category))
  return ['All', ...Array.from(categories).sort()]
})

const filteredExercises = computed(() => {
  if (activeFilter.value === 'All') return exercises.value
  return exercises.value.filter(e => e.category === activeFilter.value)
})

const completedCount = computed(() => exercises.value.filter(e => e.completed).length)

const progressPercent = computed(() => {
  return Math.round((completedCount.value / exercises.value.length) * 100)
})

const totalDuration = computed(() => {
  const minutes = exercises.value.reduce((sum, e) => {
    const match = e.duration.match(/(\d+)/)
    return sum + (match ? parseInt(match[1]) : 0)
  }, 0)
  return `${minutes} min`
})

const totalSets = computed(() => {
  return exercises.value.length + ' exercises'
})

function toggleComplete(id) {
  const exercise = exercises.value.find(e => e.id === id)
  if (exercise) exercise.completed = !exercise.completed
}
</script>

<style scoped>
.mobility-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mobility-header {
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

.filter-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.filter-btn {
  padding: 8px 14px;
  border-radius: 20px;
  border: 1px solid var(--border);
  background: var(--surface2);
  color: var(--text);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  border-color: var(--accent);
}

.filter-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

.exercises-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
}

.exercise-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.2s;
}

.exercise-card:hover {
  transform: translateY(-2px);
}

.exercise-card.completed {
  opacity: 0.7;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.exercise-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-h);
  flex: 1;
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

.exercise-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-h);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.section-content {
  font-size: 13px;
  color: var(--text);
  line-height: 1.5;
}

.exercise-meta {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.meta-item {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  background: var(--surface2);
  padding: 10px;
  border-radius: 8px;
}

.meta-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.meta-label {
  font-size: 11px;
  color: var(--text);
  font-weight: 600;
}

.meta-value {
  font-size: 13px;
  color: var(--text-h);
  font-weight: 700;
}

.instructions-list {
  font-size: 12px;
  color: var(--text);
  line-height: 1.6;
  padding-left: 20px;
}

.instructions-list li {
  margin-bottom: 6px;
}

.benefits-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.benefit-tag {
  font-size: 11px;
  background: var(--surface2);
  color: var(--text);
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
}

.completion-status {
  font-size: 12px;
  font-weight: 700;
  color: var(--text);
  padding: 8px;
  border-radius: 6px;
  background: var(--surface2);
  text-align: center;
}

.completion-status.completed {
  background: #22c55e22;
  color: #22c55e;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
}

.stat-icon {
  font-size: 24px;
}

.stat-value {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-h);
}

.stat-label {
  font-size: 11px;
  color: var(--text);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  text-align: center;
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

.tips-list {
  font-size: 13px;
  color: var(--text);
  line-height: 1.6;
  padding-left: 20px;
}

.tips-list li {
  margin-bottom: 8px;
}

@media (max-width: 768px) {
  .exercises-grid {
    grid-template-columns: 1fr;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .header-content {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
