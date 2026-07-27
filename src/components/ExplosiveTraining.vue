<template>
  <div class="explosive-wrap">
    <!-- Header -->
    <div class="card explosive-header">
      <div class="header-content">
        <div>
          <div class="header-title">⚡ Explosive Training</div>
          <div class="header-sub">Build power, speed & athletic explosiveness</div>
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
                {{ exercise.sets }} sets × {{ exercise.reps }} · {{ exercise.rest }} rest
              </div>
            </div>
          </div>
          <div class="exercise-actions">
            <button
              class="complete-btn"
              :class="{ completed: exercise.completed }"
              @click.stop="toggleComplete(exercise.id)"
              :title="exercise.completed ? 'Mark as incomplete' : 'Mark as complete'"
            >
              {{ exercise.completed ? '✓' : '○' }}
            </button>
            <div class="expand-icon" :class="{ expanded: expandedId === exercise.id }">
              ▼
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

          <!-- Sets, Reps & Rest -->
          <div class="detail-section">
            <div class="detail-label">📊 Sets, Reps & Rest</div>
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

          <!-- Benefits -->
          <div class="detail-section">
            <div class="detail-label">💪 Benefits</div>
            <div class="benefits-list">
              <span v-for="benefit in exercise.benefits" :key="benefit" class="benefit-tag">
                {{ benefit }}
              </span>
            </div>
          </div>

          <!-- Technique Tips -->
          <div class="detail-section">
            <div class="detail-label">💡 Technique Tips</div>
            <ul class="tips-list">
              <li v-for="(tip, idx) in exercise.techniqueTips" :key="idx">{{ tip }}</li>
            </ul>
          </div>

          <!-- Safety Cues -->
          <div class="detail-section">
            <div class="detail-label">⚠️ Safety Cues</div>
            <ul class="safety-list">
              <li v-for="(cue, idx) in exercise.safetyCues" :key="idx">{{ cue }}</li>
            </ul>
          </div>

          <!-- Progression -->
          <div class="detail-section">
            <div class="detail-label">📈 Progression</div>
            <div class="detail-content">{{ exercise.progression }}</div>
          </div>

          <!-- Training Notes -->
          <div class="detail-section">
            <div class="detail-label">📝 Training Notes</div>
            <textarea
              v-model="exercise.notes"
              class="notes-input"
              placeholder="Add notes about this exercise (distance, height, how it felt, etc.)"
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
      <div class="tips-title">⚡ Explosive Training Tips</div>
      <ul class="tips-list">
        <li>Always warm up thoroughly before explosive training - 5-10 min light cardio + dynamic stretching</li>
        <li>Focus on maximum effort and speed - quality over quantity</li>
        <li>Rest fully between sets - explosive work requires complete recovery</li>
        <li>Land softly and with control - absorb impact through legs</li>
        <li>Maintain proper form throughout - fatigue = poor form = injury risk</li>
        <li>Perform explosive work early in workout when fresh</li>
        <li>Combine with strength training for optimal power development</li>
        <li>Track distances and heights to measure progress</li>
        <li>Stop if form breaks down - quality over quantity</li>
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
import { ref, computed } from 'vue'

const expandedId = ref(null)

const exercises = ref([
  {
    id: 'broad-jump',
    name: 'Broad Jump',
    purpose: 'Develop horizontal power and explosiveness',
    sets: '5',
    reps: '3-5 reps',
    rest: '2-3 min',
    completed: false,
    completedSets: [],
    notes: '',
    benefits: ['Horizontal Power', 'Hip Extension', 'Glute Activation'],
    techniqueTips: [
      'Start with feet shoulder-width apart',
      'Swing arms back and bend knees',
      'Explosively extend hips, knees, and ankles',
      'Swing arms forward powerfully',
      'Land on both feet simultaneously',
      'Stick the landing with control',
    ],
    safetyCues: [
      'Land with knees slightly bent to absorb impact',
      'Keep chest upright during landing',
      'Avoid landing on heels - land mid-foot',
      'Ensure adequate space for landing',
      'Stop if form deteriorates',
    ],
    progression: 'Week 1-2: Focus on form and distance. Week 3-4: Increase reps. Week 5+: Add weighted vest or increase distance target.',
  },
  {
    id: 'box-jump',
    name: 'Box Jump',
    purpose: 'Build vertical power and explosiveness',
    sets: '5',
    reps: '3-5 reps',
    rest: '2-3 min',
    completed: false,
    completedSets: [],
    notes: '',
    benefits: ['Vertical Power', 'Ankle Stability', 'Calf Strength'],
    techniqueTips: [
      'Stand facing the box with feet shoulder-width apart',
      'Bend knees and swing arms back',
      'Explosively jump onto the box',
      'Land softly with knees bent',
      'Stand up fully at the top',
      'Step down carefully - do not jump down',
    ],
    safetyCues: [
      'Use appropriate box height for your level',
      'Ensure box is stable and secure',
      'Land in the middle of the box',
      'Keep knees aligned with toes',
      'Step down to reset - preserve nervous system',
    ],
    progression: 'Start with 12-18 inch box. Progress to 24-30 inches. Add depth jumps for advanced training.',
  },
  {
    id: 'skater-jump',
    name: 'Skater Jump',
    purpose: 'Develop lateral power and single-leg stability',
    sets: '4',
    reps: '8-10 reps per side',
    rest: '90 sec',
    completed: false,
    completedSets: [],
    notes: '',
    benefits: ['Lateral Power', 'Single-leg Stability', 'Hip Abduction'],
    techniqueTips: [
      'Start in athletic stance',
      'Jump laterally off one leg',
      'Land on opposite leg with control',
      'Immediately jump back to starting side',
      'Swing arms for momentum',
      'Maintain upright posture throughout',
    ],
    safetyCues: [
      'Land on midfoot, not heel',
      'Keep landing knee aligned with toes',
      'Control the landing before jumping again',
      'Avoid excessive forward lean',
      'Perform on flat, stable surface',
    ],
    progression: 'Week 1-2: Controlled movements. Week 3-4: Increase speed. Week 5+: Add distance or height.',
  },
  {
    id: 'single-leg-hop',
    name: 'Single-leg Hop',
    purpose: 'Build unilateral power and address imbalances',
    sets: '4',
    reps: '8-10 hops per leg',
    rest: '90 sec',
    completed: false,
    completedSets: [],
    notes: '',
    benefits: ['Unilateral Power', 'Balance', 'Ankle Stability'],
    techniqueTips: [
      'Stand on one leg with slight knee bend',
      'Hop forward explosively',
      'Land on same leg with control',
      'Immediately rebound into next hop',
      'Maintain forward momentum',
      'Keep torso upright',
    ],
    safetyCues: [
      'Start with low intensity to build stability',
      'Land on midfoot with knee bent',
      'Avoid excessive side-to-side movement',
      'Stop if ankle feels unstable',
      'Perform on flat surface',
    ],
    progression: 'Week 1-2: 5 hops per leg. Week 3-4: 8 hops per leg. Week 5+: 10+ hops or add distance.',
  },
  {
    id: 'sprint-starts',
    name: 'Sprint Starts',
    purpose: 'Develop acceleration and first-step quickness',
    sets: '6',
    reps: '20-30 meters',
    rest: '2 min',
    completed: false,
    completedSets: [],
    notes: '',
    benefits: ['Acceleration', 'First-step Quickness', 'Hip Extension'],
    techniqueTips: [
      'Start in athletic stance or 3-point position',
      'Drive first step forward explosively',
      'Pump arms powerfully',
      'Maintain low body angle initially',
      'Gradually increase stride length',
      'Accelerate for full distance',
    ],
    safetyCues: [
      'Ensure adequate space for sprinting',
      'Warm up thoroughly before sprinting',
      'Maintain proper running form',
      'Avoid overstriding',
      'Stop if form deteriorates',
    ],
    progression: 'Week 1-2: Focus on form. Week 3-4: Increase distance to 40m. Week 5+: Add resistance or incline.',
  },
  {
    id: 'reactive-jump',
    name: 'Reactive Jump Drill',
    purpose: 'Improve reactive strength and stretch-shortening cycle',
    sets: '4',
    reps: '5-8 reps',
    rest: '2 min',
    completed: false,
    completedSets: [],
    notes: '',
    benefits: ['Reactive Strength', 'Elastic Power', 'Rapid Force Production'],
    techniqueTips: [
      'Drop from a low height (12-18 inches)',
      'Land with minimal ground contact time',
      'Immediately jump vertically',
      'Minimize time between landing and takeoff',
      'Focus on quick, explosive rebound',
      'Maintain upright posture',
    ],
    safetyCues: [
      'Start with low drop height',
      'Land with knees bent to absorb impact',
      'Avoid excessive ground contact time',
      'Stop if knees feel unstable',
      'Perform on padded or forgiving surface',
    ],
    progression: 'Week 1-2: 12-inch drop. Week 3-4: 18-inch drop. Week 5+: Increase reps or add weight.',
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
      const totalSets = parseInt(exercise.sets)
      if (exercise.completedSets.length === totalSets) {
        exercise.completed = true
      }
    }
  }
}

function finishWorkout() {
  if (completedCount.value === exercises.value.length) {
    alert('🎉 Explosive workout complete! Great power development!')
  } else {
    alert(`You've completed ${completedCount.value}/${exercises.value.length} exercises. Keep pushing!`)
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
  const avgTimePerSet = 2
  return Math.round(totalSets.value * avgTimePerSet) + ' min'
})
</script>

<style scoped>
.explosive-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.explosive-header {
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

.exercise-header:hover {
  background: var(--surface2);
  border-radius: 10px;
}

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

.benefits-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.benefit-tag {
  font-size: 12px;
  background: var(--accent);
  color: #fff;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 600;
}

.tips-list,
.safety-list {
  font-size: 13px;
  color: var(--text);
  line-height: 1.6;
  padding-left: 20px;
}

.tips-list li,
.safety-list li {
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
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .sets-reps-grid {
    grid-template-columns: 1fr;
  }

  .exercise-header {
    flex-wrap: wrap;
  }
}
</style>
