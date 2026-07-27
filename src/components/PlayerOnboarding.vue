<template>
  <div class="onboard-root">
    <!-- Step indicator -->
    <div class="onboard-header">
      <div class="step-dots">
        <div v-for="i in totalSteps" :key="i" class="step-dot" :class="{ active: step >= i, current: step === i }"></div>
      </div>
      <div class="step-label">Step {{ step }} of {{ totalSteps }}</div>
    </div>

    <!-- STEP 1: Basic Info -->
    <div v-if="step === 1" class="onboard-step fade-up">
      <div class="step-icon">👤</div>
      <h2 class="step-title">Tell us about yourself</h2>
      <p class="step-desc">We'll build your personalized basketball development plan.</p>
      <div class="form-group">
        <label class="form-label">Age</label>
        <input v-model="form.age" type="number" placeholder="e.g. 17" min="8" max="50" />
      </div>
      <div class="form-group">
        <label class="form-label">Height (cm)</label>
        <input v-model="form.height" type="number" placeholder="e.g. 175" />
      </div>
      <div class="form-group">
        <label class="form-label">Weight (kg)</label>
        <input v-model="form.weight" type="number" placeholder="e.g. 70" />
      </div>
      <div class="form-group">
        <label class="form-label">Dominant Hand</label>
        <div class="option-row">
          <button v-for="h in ['Right','Left','Both']" :key="h"
            class="option-btn" :class="{ active: form.dominantHand === h }"
            type="button" @click="form.dominantHand = h">{{ h }}</button>
        </div>
      </div>
    </div>

    <!-- STEP 2: Position & Experience -->
    <div v-if="step === 2" class="onboard-step fade-up">
      <div class="step-icon">🏀</div>
      <h2 class="step-title">Your position & level</h2>
      <p class="step-desc">This shapes every workout we give you.</p>
      <div class="form-group">
        <label class="form-label">Position</label>
        <div class="position-grid">
          <button v-for="pos in positions" :key="pos.id"
            class="pos-btn" :class="{ active: form.position === pos.id }"
            type="button" @click="form.position = pos.id">
            <span class="pos-icon">{{ pos.icon }}</span>
            <span class="pos-name">{{ pos.name }}</span>
            <span class="pos-abbr">{{ pos.abbr }}</span>
          </button>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Experience Level</label>
        <div class="level-cards">
          <button v-for="lvl in levels" :key="lvl.id"
            class="level-card" :class="{ active: form.level === lvl.id }"
            type="button" @click="form.level = lvl.id">
            <span class="level-icon">{{ lvl.icon }}</span>
            <span class="level-name">{{ lvl.name }}</span>
            <span class="level-desc">{{ lvl.desc }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- STEP 3: Physical Stats -->
    <div v-if="step === 3" class="onboard-step fade-up">
      <div class="step-icon">📏</div>
      <h2 class="step-title">Your current stats</h2>
      <p class="step-desc">Honest numbers help us track your real progress.</p>
      <div class="form-group">
        <label class="form-label">Current Vertical Jump (inches)</label>
        <input v-model="form.verticalJump" type="number" placeholder="e.g. 20" />
      </div>
      <div class="form-group">
        <label class="form-label">Standing Reach (inches)</label>
        <input v-model="form.standingReach" type="number" placeholder="e.g. 84" />
      </div>
      <div class="form-group">
        <label class="form-label">Can you dunk?</label>
        <div class="option-row">
          <button v-for="d in ['Yes 🔥','Almost 😤','Not yet 💪']" :key="d"
            class="option-btn" :class="{ active: form.canDunk === d }"
            type="button" @click="form.canDunk = d">{{ d }}</button>
        </div>
      </div>
    </div>

    <!-- STEP 4: Goals -->
    <div v-if="step === 4" class="onboard-step fade-up">
      <div class="step-icon">🎯</div>
      <h2 class="step-title">What are your goals?</h2>
      <p class="step-desc">Select all that apply. We'll prioritize your training.</p>
      <div class="goals-grid">
        <button v-for="goal in goals" :key="goal.id"
          class="goal-btn" :class="{ active: form.goals.includes(goal.id) }"
          type="button" @click="toggleGoal(goal.id)">
          <span class="goal-icon">{{ goal.icon }}</span>
          <span class="goal-name">{{ goal.name }}</span>
        </button>
      </div>
    </div>

    <!-- STEP 5: Choose Your Journey -->
    <div v-if="step === 5" class="onboard-step fade-up">
      <div class="step-icon">🌟</div>
      <h2 class="step-title">Choose your dream</h2>
      <p class="step-desc">Your entire app experience will be built around this journey.</p>
      <div class="journey-list">
        <button v-for="j in journeys" :key="j.id"
          class="journey-card" :class="{ active: form.journey === j.id }"
          type="button" @click="form.journey = j.id">
          <div class="journey-left">
            <span class="journey-emoji">{{ j.emoji }}</span>
            <div>
              <div class="journey-name">{{ j.name }}</div>
              <div class="journey-sub">{{ j.sub }}</div>
            </div>
          </div>
          <div class="journey-check" v-if="form.journey === j.id">✓</div>
        </button>
      </div>
    </div>

    <!-- Navigation -->
    <div class="onboard-nav">
      <button v-if="step > 1" class="btn-secondary" type="button" @click="step--">← Back</button>
      <button v-if="step < totalSteps" class="btn-primary" type="button"
        :disabled="!canNext" @click="step++">
        Continue →
      </button>
      <button v-if="step === totalSteps" class="btn-primary" type="button"
        :disabled="!canNext || saving" @click="finish">
        {{ saving ? 'Setting up…' : "Let's Go! 🏀" }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { savePlayerProfile } from '../useAuth.js'

const props = defineProps({ uid: String })
const emit = defineEmits(['done'])

const step = ref(1)
const totalSteps = 5
const saving = ref(false)

const form = ref({
  age: '', height: '', weight: '', dominantHand: '',
  position: '', level: '',
  verticalJump: '', standingReach: '', canDunk: '',
  goals: [], journey: ''
})

const positions = [
  { id: 'PG', name: 'Point Guard',     abbr: 'PG', icon: '⚡' },
  { id: 'SG', name: 'Shooting Guard',  abbr: 'SG', icon: '🎯' },
  { id: 'SF', name: 'Small Forward',   abbr: 'SF', icon: '🔥' },
  { id: 'PF', name: 'Power Forward',   abbr: 'PF', icon: '💪' },
  { id: 'C',  name: 'Center',          abbr: 'C',  icon: '🏰' },
]

const levels = [
  { id: 'beginner',     icon: '🌱', name: 'Beginner',     desc: 'Just starting out' },
  { id: 'intermediate', icon: '⚡', name: 'Intermediate', desc: 'Playing regularly' },
  { id: 'advanced',     icon: '🔥', name: 'Advanced',     desc: 'Competitive player' },
]

const goals = [
  { id: 'vertical',    icon: '⬆️', name: 'Jump Higher' },
  { id: 'shooting',    icon: '🎯', name: 'Shoot Better' },
  { id: 'dribbling',   icon: '🏀', name: 'Ball Handling' },
  { id: 'defense',     icon: '🛡️', name: 'Defense' },
  { id: 'speed',       icon: '⚡', name: 'Get Faster' },
  { id: 'strength',    icon: '💪', name: 'Get Stronger' },
  { id: 'explosive',   icon: '💥', name: 'Explosiveness' },
  { id: 'school_team', icon: '🏫', name: 'Make School Team' },
  { id: 'pro',         icon: '🏆', name: 'Go Professional' },
  { id: 'weight',      icon: '⚖️', name: 'Lose Weight' },
]

const journeys = [
  { id: 'first_dunk',  emoji: '🏀', name: 'First Dunk',          sub: 'Touch the rim, then dunk it' },
  { id: 'shooter',     emoji: '🎯', name: 'Deadly Shooter',       sub: 'Become a scoring machine' },
  { id: 'fastest',     emoji: '⚡', name: 'Fastest Guard',        sub: 'Blow past every defender' },
  { id: 'lockdown',    emoji: '🛡️', name: 'Lockdown Defender',    sub: 'Shut down any player' },
  { id: 'school_team', emoji: '🌟', name: 'Make the School Team', sub: 'Earn your spot on the roster' },
  { id: 'pro',         emoji: '🏆', name: 'Become Professional',  sub: 'Play at the highest level' },
]

function toggleGoal(id) {
  const idx = form.value.goals.indexOf(id)
  if (idx === -1) form.value.goals.push(id)
  else form.value.goals.splice(idx, 1)
}

const canNext = computed(() => {
  if (step.value === 1) return form.value.age && form.value.height && form.value.weight && form.value.dominantHand
  if (step.value === 2) return form.value.position && form.value.level
  if (step.value === 3) return form.value.verticalJump
  if (step.value === 4) return form.value.goals.length > 0
  if (step.value === 5) return form.value.journey
  return true
})

async function finish() {
  saving.value = true
  await savePlayerProfile(props.uid, form.value)
  saving.value = false
  emit('done', form.value)
}
</script>

<style scoped>
.onboard-root {
  min-height: 100vh;
  display: flex; flex-direction: column;
  padding: 20px 20px 100px;
  max-width: 480px; margin: 0 auto;
  background: var(--bg);
  position: relative; overflow: hidden;
}
.onboard-root::before {
  content: '';
  position: absolute; top: -80px; left: 50%; transform: translateX(-50%);
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 65%);
  pointer-events: none;
}

.onboard-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }

.step-dots { display: flex; gap: 6px; }
.step-dot {
  width: 8px; height: 8px;
  border-radius: 99px;
  background: var(--surface3);
  transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
}
.step-dot.active { background: var(--accent); box-shadow: 0 0 8px rgba(249,115,22,0.5); }
.step-dot.current { width: 28px; background: linear-gradient(90deg, var(--accent), var(--accent2)); }

.step-label { font-size: 12px; color: var(--text); font-weight: 700; }

.onboard-step { flex: 1; display: flex; flex-direction: column; gap: 20px; }
.step-icon { font-size: 44px; animation: float 3s ease-in-out infinite; }
.step-title { font-family: var(--font-display); font-size: 26px; font-weight: 900; color: var(--text-h); letter-spacing: 0.3px; text-transform: uppercase; }
.step-desc { font-size: 14px; color: var(--text); line-height: 1.5; margin-top: -10px; }

.option-row { display: flex; gap: 8px; flex-wrap: wrap; }
.option-btn {
  padding: 10px 20px; border-radius: var(--radius-sm);
  background: var(--surface2); border: 1.5px solid var(--border);
  color: var(--text2); font-size: 14px; font-weight: 600; transition: all 0.2s;
}
.option-btn.active { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); box-shadow: 0 0 12px var(--accent-dim); }

.position-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
.pos-btn {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 12px 6px; border-radius: var(--radius-sm);
  background: var(--surface2); border: 1.5px solid var(--border);
  color: var(--text2); transition: all 0.2s;
}
.pos-btn.active { background: var(--accent-dim); border-color: var(--accent); box-shadow: 0 0 12px var(--accent-dim); }
.pos-icon { font-size: 22px; }
.pos-name { font-size: 9px; color: var(--text); text-align: center; line-height: 1.2; }
.pos-abbr { font-size: 14px; font-weight: 900; color: var(--text-h); }
.pos-btn.active .pos-abbr { color: var(--accent); }

.level-cards { display: flex; gap: 8px; }
.level-card {
  flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 16px 8px; border-radius: var(--radius);
  background: var(--surface2); border: 1.5px solid var(--border);
  color: var(--text2); transition: all 0.2s;
}
.level-card.active { background: var(--accent-dim); border-color: var(--accent); box-shadow: 0 0 16px var(--accent-dim); }
.level-icon { font-size: 26px; }
.level-name { font-size: 13px; font-weight: 800; color: var(--text-h); }
.level-desc { font-size: 11px; color: var(--text); text-align: center; }
.level-card.active .level-name { color: var(--accent); }

.goals-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.goal-btn {
  display: flex; align-items: center; gap: 10px;
  padding: 13px 14px; border-radius: var(--radius-sm);
  background: var(--surface2); border: 1.5px solid var(--border);
  color: var(--text2); font-size: 13px; font-weight: 600;
  transition: all 0.2s; text-align: left;
}
.goal-btn.active { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); box-shadow: 0 0 10px var(--accent-dim); }
.goal-icon { font-size: 20px; }

.journey-list { display: flex; flex-direction: column; gap: 10px; }
.journey-card {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px; border-radius: var(--radius);
  background: var(--surface2); border: 1.5px solid var(--border);
  transition: all 0.25s; text-align: left;
  position: relative; overflow: hidden;
}
.journey-card::before {
  content: '';
  position: absolute; top: 0; left: 0; bottom: 0; width: 3px;
  background: linear-gradient(180deg, var(--accent), var(--accent2));
  opacity: 0; transition: opacity 0.2s;
}
.journey-card:hover { border-color: var(--border2); transform: translateX(3px); }
.journey-card.active {
  background: var(--accent-dim); border-color: var(--accent);
  box-shadow: var(--shadow-accent); transform: translateX(3px);
}
.journey-card.active::before { opacity: 1; }
.journey-left { display: flex; align-items: center; gap: 14px; }
.journey-emoji { font-size: 30px; }
.journey-name { font-size: 15px; font-weight: 800; color: var(--text-h); }
.journey-sub { font-size: 12px; color: var(--text); margin-top: 2px; }
.journey-card.active .journey-name { color: var(--accent); }
.journey-check {
  width: 26px; height: 26px; border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), #ea6a0a);
  color: #fff; font-size: 13px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; box-shadow: 0 2px 8px rgba(249,115,22,0.4);
}

.onboard-nav {
  position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
  width: 100%; max-width: 480px;
  padding: 16px 20px;
  background: rgba(6,6,15,0.92);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255,255,255,0.05);
  display: flex; gap: 10px;
}
.onboard-nav .btn-secondary { flex: 0 0 auto; }
.onboard-nav .btn-primary { flex: 1; }

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
}
</style>
