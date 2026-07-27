<template>
  <div class="page">
    <!-- Position badge -->
    <div class="position-banner card" v-if="profile?.position">
      <div class="pos-info">
        <span class="pos-big">{{ posIcon }}</span>
        <div>
          <div class="pos-name-big">{{ posName }} Training</div>
          <div class="pos-focus">Focus: {{ posFocus }}</div>
        </div>
      </div>
      <div class="level-badge" :class="profile.level">{{ profile.level }}</div>
    </div>

    <!-- Category filter -->
    <div class="scroll-row" style="margin-bottom:16px">
      <button v-for="cat in categories" :key="cat.id"
        class="chip" :class="{ active: activeCategory === cat.id }"
        @click="activeCategory = cat.id">
        {{ cat.icon }} {{ cat.label }}
      </button>
    </div>

    <!-- Module cards -->
    <div class="modules-grid">
      <div v-for="mod in filteredModules" :key="mod.id"
        class="module-card card" @click="openModule(mod)">
        <div class="module-top">
          <div class="module-icon-wrap" :style="{ background: mod.color + '22' }">
            <span class="module-icon">{{ mod.icon }}</span>
          </div>
          <div class="module-badge" v-if="mod.recommended">⭐ Recommended</div>
        </div>
        <div class="module-name">{{ mod.name }}</div>
        <div class="module-desc">{{ mod.desc }}</div>
        <div class="module-meta">
          <span class="module-tag">{{ mod.level }}</span>
          <span class="module-tag">{{ mod.sessions }} sessions</span>
        </div>
        <div class="module-progress" v-if="mod.progress > 0">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: mod.progress + '%', background: mod.color }"></div>
          </div>
          <span class="module-pct">{{ mod.progress }}%</span>
        </div>
      </div>
    </div>

    <!-- Module Detail Modal -->
    <div v-if="selectedModule" class="modal-overlay" @click.self="selectedModule = null">
      <div class="modal-sheet">
        <div class="modal-handle"></div>
        <div class="modal-header">
          <div class="modal-icon-big" :style="{ background: selectedModule.color + '22' }">
            {{ selectedModule.icon }}
          </div>
          <div>
            <div class="modal-title">{{ selectedModule.name }}</div>
            <div class="modal-sub">{{ selectedModule.desc }}</div>
          </div>
        </div>

        <div class="modal-tabs">
          <button :class="{ active: modalTab === 'home' }" @click="modalTab = 'home'">🏠 Home</button>
          <button :class="{ active: modalTab === 'gym' }" @click="modalTab = 'gym'">🏋️ Gym</button>
        </div>

        <div class="workout-list">
          <div v-for="(ex, i) in currentWorkout" :key="i" class="workout-item">
            <div class="workout-num">{{ i + 1 }}</div>
            <div class="workout-info">
              <div class="workout-name">{{ ex.name }}</div>
              <div class="workout-detail">{{ ex.sets }} sets × {{ ex.reps }} | Rest: {{ ex.rest }}</div>
              <div class="workout-tip" v-if="ex.tip">💡 {{ ex.tip }}</div>
            </div>
            <div class="workout-icon">{{ ex.icon }}</div>
          </div>
        </div>

        <button class="btn-primary" style="margin-top:16px" @click="startWorkout">
          Start {{ modalTab === 'home' ? 'Home' : 'Gym' }} Workout →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({ profile: Object })

const activeCategory = ref('all')
const selectedModule = ref(null)
const modalTab = ref('home')

const categories = [
  { id: 'all',         icon: '🏀', label: 'All' },
  { id: 'skills',      icon: '🎯', label: 'Skills' },
  { id: 'athletic',    icon: '⚡', label: 'Athletic' },
  { id: 'strength',    icon: '💪', label: 'Strength' },
  { id: 'recovery',    icon: '🧘', label: 'Recovery' },
]

const positionMap = {
  PG: { icon: '⚡', name: 'Point Guard',    focus: 'Ball Handling, Speed, Court Vision' },
  SG: { icon: '🎯', name: 'Shooting Guard', focus: 'Shooting, Off-Ball Movement, Finishing' },
  SF: { icon: '🔥', name: 'Small Forward',  focus: 'Versatility, Finishing, Defense' },
  PF: { icon: '💪', name: 'Power Forward',  focus: 'Strength, Post Moves, Rebounding' },
  C:  { icon: '🏰', name: 'Center',         focus: 'Strength, Footwork, Rim Protection' },
}

const posIcon = computed(() => positionMap[props.profile?.position]?.icon || '🏀')
const posName = computed(() => positionMap[props.profile?.position]?.name || 'Player')
const posFocus = computed(() => positionMap[props.profile?.position]?.focus || 'All-around development')

const pgRecommended = ['ball_handling', 'speed', 'agility', 'basketball_iq']
const sgRecommended = ['shooting', 'finishing', 'vertical']
const sfRecommended = ['finishing', 'defense', 'strength']
const pfRecommended = ['strength', 'vertical', 'footwork']
const cRecommended  = ['strength', 'footwork', 'core']
const posRec = { PG: pgRecommended, SG: sgRecommended, SF: sfRecommended, PF: pfRecommended, C: cRecommended }

const modules = [
  { id: 'ball_handling', name: 'Ball Handling',    icon: '🏀', color: '#f97316', category: 'skills',   level: props.profile?.level || 'Beginner', sessions: 12, progress: 0, desc: 'Crossovers, behind-the-back, combo moves' },
  { id: 'shooting',      name: 'Shooting',         icon: '🎯', color: '#6366f1', category: 'skills',   level: props.profile?.level || 'Beginner', sessions: 16, progress: 0, desc: 'Form, mid-range, 3-point, free throws' },
  { id: 'finishing',     name: 'Finishing',        icon: '🔥', color: '#ef4444', category: 'skills',   level: props.profile?.level || 'Beginner', sessions: 10, progress: 0, desc: 'Layups, euro step, floater, contact' },
  { id: 'defense',       name: 'Defense',          icon: '🛡️', color: '#22c55e', category: 'skills',   level: props.profile?.level || 'Beginner', sessions: 8,  progress: 0, desc: 'Stance, footwork, on-ball, help defense' },
  { id: 'passing',       name: 'Passing',          icon: '🤝', color: '#3b82f6', category: 'skills',   level: props.profile?.level || 'Beginner', sessions: 6,  progress: 0, desc: 'Chest, bounce, overhead, no-look' },
  { id: 'basketball_iq', name: 'Basketball IQ',    icon: '🧠', color: '#8b5cf6', category: 'skills',   level: 'All',                              sessions: 8,  progress: 0, desc: 'Reads, spacing, pick & roll, film study' },
  { id: 'vertical',      name: 'Vertical Jump',    icon: '⬆️', color: '#f97316', category: 'athletic', level: props.profile?.level || 'Beginner', sessions: 20, progress: 0, desc: 'Air Alert, explosive legs, dunk program' },
  { id: 'speed',         name: 'Speed',            icon: '⚡', color: '#eab308', category: 'athletic', level: props.profile?.level || 'Beginner', sessions: 10, progress: 0, desc: 'Sprint mechanics, acceleration, first step' },
  { id: 'agility',       name: 'Agility',          icon: '🔄', color: '#06b6d4', category: 'athletic', level: props.profile?.level || 'Beginner', sessions: 8,  progress: 0, desc: 'Ladder drills, cone work, change of direction' },
  { id: 'footwork',      name: 'Footwork',         icon: '👟', color: '#f59e0b', category: 'athletic', level: props.profile?.level || 'Beginner', sessions: 8,  progress: 0, desc: 'Pivots, jab step, drop step, post footwork' },
  { id: 'conditioning',  name: 'Conditioning',     icon: '🫁', color: '#10b981', category: 'athletic', level: 'All',                              sessions: 12, progress: 0, desc: 'Suicides, full-court sprints, game fitness' },
  { id: 'strength',      name: 'Strength',         icon: '💪', color: '#dc2626', category: 'strength', level: props.profile?.level || 'Beginner', sessions: 16, progress: 0, desc: 'Squat, deadlift, hip thrust, upper body' },
  { id: 'core',          name: 'Core',             icon: '🔥', color: '#f97316', category: 'strength', level: 'All',                              sessions: 8,  progress: 0, desc: 'Planks, rotational power, anti-rotation' },
  { id: 'reaction',      name: 'Reaction Training',icon: '⚡', color: '#7c3aed', category: 'athletic', level: 'All',                              sessions: 6,  progress: 0, desc: 'Visual cues, first-step reaction, anticipation' },
  { id: 'mobility',      name: 'Mobility',         icon: '🧘', color: '#22c55e', category: 'recovery', level: 'All',                              sessions: 8,  progress: 0, desc: 'Hip, ankle, shoulder mobility for athletes' },
  { id: 'recovery',      name: 'Recovery',         icon: '😴', color: '#3b82f6', category: 'recovery', level: 'All',                              sessions: 6,  progress: 0, desc: 'Foam rolling, sleep, nutrition, ice baths' },
  { id: 'flexibility',   name: 'Flexibility',      icon: '🤸', color: '#06b6d4', category: 'recovery', level: 'All',                              sessions: 6,  progress: 0, desc: 'Dynamic & static stretching routines' },
]

const filteredModules = computed(() => {
  const pos = props.profile?.position
  const rec = posRec[pos] || []
  const list = activeCategory.value === 'all'
    ? modules
    : modules.filter(m => m.category === activeCategory.value)
  return list.map(m => ({ ...m, recommended: rec.includes(m.id) }))
    .sort((a, b) => b.recommended - a.recommended)
})

const workoutData = {
  ball_handling: {
    home: [
      { name: 'Stationary Dribbling', sets: '3', reps: '30 sec each hand', rest: '30s', icon: '🏀', tip: 'Keep your eyes up, not on the ball' },
      { name: 'Crossover Dribble', sets: '3', reps: '20 reps', rest: '30s', icon: '🔄', tip: 'Low and quick — protect the ball' },
      { name: 'Figure 8 Dribble', sets: '3', reps: '30 sec', rest: '30s', icon: '8️⃣', tip: 'Stay low in athletic stance' },
      { name: 'Spider Dribble', sets: '3', reps: '20 reps', rest: '30s', icon: '🕷️', tip: 'Alternate hands front and back' },
    ],
    gym: [
      { name: 'Cone Dribbling Slalom', sets: '4', reps: '3 runs', rest: '45s', icon: '🔶', tip: 'Attack each cone, not just weave through' },
      { name: 'Two-Ball Dribbling', sets: '3', reps: '45 sec', rest: '30s', icon: '🏀', tip: 'Alternate and simultaneous patterns' },
      { name: 'Full-Court Dribble Drill', sets: '4', reps: '2 lengths', rest: '60s', icon: '🏃', tip: 'Push the ball ahead, don\'t baby it' },
    ]
  },
  vertical: {
    home: [
      { name: 'Ankle Hops', sets: '3', reps: '20 reps', rest: '60s', icon: '⬆️', tip: 'Minimal ground contact time' },
      { name: 'Squat Jumps', sets: '4', reps: '8 reps', rest: '90s', icon: '💥', tip: 'Land soft, explode up immediately' },
      { name: 'Lateral Bounds', sets: '3', reps: '10 each side', rest: '60s', icon: '↔️', tip: 'Stick each landing for 1 second' },
      { name: 'Depth Drops', sets: '3', reps: '5 reps', rest: '90s', icon: '⬇️', tip: 'Land and absorb — train your tendons' },
    ],
    gym: [
      { name: 'Box Jumps', sets: '4', reps: '5 reps', rest: '2min', icon: '📦', tip: 'Step down, never jump down' },
      { name: 'Weighted Jump Squats', sets: '4', reps: '5 reps', rest: '2min', icon: '🏋️', tip: '20-30% of your squat max only' },
      { name: 'Depth Jumps', sets: '3', reps: '4 reps', rest: '2min', icon: '⚡', tip: 'Minimal ground contact — reactive' },
      { name: 'Bulgarian Split Squat', sets: '3', reps: '8/leg', rest: '90s', icon: '🦵', tip: 'Full range of motion every rep' },
    ]
  }
}

const defaultWorkout = {
  home: [
    { name: 'Warm-up Jog', sets: '1', reps: '5 min', rest: '—', icon: '🏃', tip: 'Get your heart rate up gradually' },
    { name: 'Dynamic Stretching', sets: '1', reps: '5 min', rest: '—', icon: '🤸', tip: 'Leg swings, arm circles, hip rotations' },
    { name: 'Main Exercise A', sets: '3', reps: '10 reps', rest: '60s', icon: '💪', tip: 'Focus on form over speed' },
    { name: 'Main Exercise B', sets: '3', reps: '10 reps', rest: '60s', icon: '🔥', tip: 'Control the movement' },
    { name: 'Cooldown Stretch', sets: '1', reps: '5 min', rest: '—', icon: '😌', tip: 'Hold each stretch 30 seconds' },
  ],
  gym: [
    { name: 'Warm-up Cardio', sets: '1', reps: '5 min', rest: '—', icon: '🏃', tip: 'Bike or treadmill at easy pace' },
    { name: 'Activation Drills', sets: '2', reps: '10 reps', rest: '30s', icon: '⚡', tip: 'Glute bridges, band walks' },
    { name: 'Main Lift A', sets: '4', reps: '6 reps', rest: '2min', icon: '🏋️', tip: 'Progressive overload every session' },
    { name: 'Main Lift B', sets: '3', reps: '8 reps', rest: '90s', icon: '💪', tip: 'Full range of motion' },
    { name: 'Accessory Work', sets: '3', reps: '12 reps', rest: '60s', icon: '🔧', tip: 'Target weak points' },
  ]
}

const currentWorkout = computed(() => {
  if (!selectedModule.value) return []
  const data = workoutData[selectedModule.value.id] || defaultWorkout
  return data[modalTab.value] || defaultWorkout[modalTab.value]
})

function openModule(mod) {
  selectedModule.value = mod
  modalTab.value = 'home'
}

function startWorkout() {
  // TODO: navigate to active workout session
  selectedModule.value = null
}
</script>

<style scoped>
.position-banner {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 14px;
  background: linear-gradient(135deg, #1a0800, var(--surface));
  border-left: 3px solid var(--accent);
  position: relative; overflow: hidden;
}
.position-banner::after {
  content: '';
  position: absolute; top: -30px; right: -30px;
  width: 100px; height: 100px;
  background: radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%);
  pointer-events: none;
}
.pos-info { display: flex; align-items: center; gap: 12px; }
.pos-big { font-size: 30px; animation: float 3s ease-in-out infinite; }
.pos-name-big { font-size: 15px; font-weight: 800; color: var(--text-h); }
.pos-focus { font-size: 12px; color: var(--text); margin-top: 2px; }
.level-badge {
  font-size: 11px; font-weight: 700; padding: 5px 12px;
  border-radius: 99px; text-transform: capitalize;
}
.level-badge.beginner { background: rgba(34,197,94,0.15); color: var(--green); border: 1px solid rgba(34,197,94,0.3); }
.level-badge.intermediate { background: rgba(249,115,22,0.15); color: var(--accent); border: 1px solid rgba(249,115,22,0.3); }
.level-badge.advanced { background: rgba(239,68,68,0.15); color: var(--red); border: 1px solid rgba(239,68,68,0.3); }

.modules-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }

.module-card {
  cursor: pointer; transition: all 0.25s;
  display: flex; flex-direction: column; gap: 8px;
  position: relative; overflow: hidden;
}
.module-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, var(--accent), var(--accent2));
  opacity: 0; transition: opacity 0.2s;
}
.module-card:hover { border-color: var(--border2); transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
.module-card:hover::before { opacity: 1; }

.module-top { display: flex; align-items: flex-start; justify-content: space-between; }
.module-icon-wrap {
  width: 46px; height: 46px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
}
.module-icon { font-size: 24px; }
.module-badge {
  font-size: 9px; font-weight: 700; color: var(--yellow);
  background: rgba(234,179,8,0.15); padding: 3px 7px; border-radius: 99px;
  border: 1px solid rgba(234,179,8,0.3);
}
.module-name { font-size: 14px; font-weight: 800; color: var(--text-h); }
.module-desc { font-size: 12px; color: var(--text); line-height: 1.4; }
.module-meta { display: flex; gap: 6px; flex-wrap: wrap; }
.module-tag {
  font-size: 10px; font-weight: 600; color: var(--text);
  background: var(--surface3); padding: 2px 8px; border-radius: 99px;
  text-transform: capitalize;
}
.module-progress { display: flex; align-items: center; gap: 6px; }
.module-pct { font-size: 11px; color: var(--accent); font-weight: 700; flex-shrink: 0; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.7);
  z-index: 300; display: flex; align-items: flex-end;
}
.modal-sheet {
  background: var(--surface);
  border-radius: 20px 20px 0 0;
  border-top: 1px solid var(--border);
  padding: 16px 20px 40px;
  width: 100%; max-height: 85vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.modal-handle {
  width: 36px; height: 4px; border-radius: 99px;
  background: var(--border2); margin: 0 auto 16px;
}
.modal-header { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
.modal-icon-big {
  width: 52px; height: 52px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 26px; flex-shrink: 0;
}
.modal-title { font-size: 18px; font-weight: 800; color: var(--text-h); }
.modal-sub { font-size: 13px; color: var(--text); margin-top: 2px; }

.modal-tabs {
  display: flex; gap: 8px; margin-bottom: 16px;
  background: var(--surface2); border-radius: 8px; padding: 4px;
}
.modal-tabs button {
  flex: 1; padding: 8px; border-radius: 6px;
  font-size: 13px; font-weight: 700;
  background: transparent; color: var(--text);
  transition: all 0.2s;
}
.modal-tabs button.active { background: var(--accent); color: #fff; }

.workout-list { display: flex; flex-direction: column; gap: 10px; }
.workout-item {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 12px; background: var(--surface2);
  border-radius: var(--radius-sm); border: 1px solid var(--border);
}
.workout-num {
  width: 24px; height: 24px; border-radius: 50%;
  background: var(--accent); color: #fff;
  font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 1px;
}
.workout-info { flex: 1; }
.workout-name { font-size: 14px; font-weight: 700; color: var(--text-h); }
.workout-detail { font-size: 12px; color: var(--text2); margin-top: 2px; }
.workout-tip { font-size: 12px; color: var(--accent); margin-top: 4px; }
.workout-icon { font-size: 20px; flex-shrink: 0; }
</style>
