<template>
  <div class="page profile-page">
    <div class="profile-hero card">
      <div class="avatar">{{ initials }}</div>
      <div>
        <div class="eyebrow">ATHLETE PROFILE</div>
        <h1>{{ form.name || 'Your Profile' }}</h1>
        <p>Keep your details current so your plan stays personal.</p>
      </div>
    </div>

    <form class="profile-form" @submit.prevent="save">
      <section class="card form-card">
        <h2>About you</h2>
        <div class="form-group">
          <label class="form-label" for="profile-name">Name</label>
          <input id="profile-name" v-model.trim="form.name" type="text" autocomplete="name" placeholder="Your name" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="profile-position">Position</label>
          <select id="profile-position" v-model="form.position">
            <option value="">Select your position</option>
            <option v-for="position in positions" :key="position.id" :value="position.id">{{ position.name }} ({{ position.id }})</option>
          </select>
        </div>
        <div class="physical-grid">
          <div class="form-group"><label class="form-label" for="profile-height">Height (cm)</label><input id="profile-height" v-model.number="form.height" type="number" min="100" max="260" placeholder="175" /></div>
          <div class="form-group"><label class="form-label" for="profile-weight">Weight (kg)</label><input id="profile-weight" v-model.number="form.weight" type="number" min="30" max="300" step="0.1" placeholder="70" /></div>
        </div>
      </section>

      <section class="card form-card">
        <h2>Training profile</h2>
        <label class="form-label">Training Experience</label>
        <div class="experience-grid">
          <button v-for="level in levels" :key="level.id" type="button" class="choice-card" :class="{ active: form.level === level.id }" @click="form.level = level.id">
            <span>{{ level.icon }}</span><strong>{{ level.name }}</strong><small>{{ level.description }}</small>
          </button>
        </div>
        <div class="form-group weekly-goal">
          <label class="form-label" for="weekly-goal">Weekly Goal</label>
          <select id="weekly-goal" v-model.number="form.weeklyGoal"><option v-for="goal in weeklyGoals" :key="goal" :value="goal">{{ goal }} training sessions per week</option></select>
        </div>
      </section>

      <section class="card form-card">
        <div class="goals-heading"><h2>Basketball Goals</h2><span>{{ form.goals.length }} selected</span></div>
        <p class="section-copy">Select the areas you want your training to prioritize.</p>
        <div class="goals-grid">
          <button v-for="goal in goals" :key="goal.id" type="button" class="goal-btn" :class="{ active: form.goals.includes(goal.id) }" @click="toggleGoal(goal.id)"><span>{{ goal.icon }}</span>{{ goal.name }}</button>
        </div>
      </section>

      <p v-if="message" class="save-message" :class="{ error: saveError }">{{ message }}</p>
      <button class="btn-primary" type="submit" :disabled="saving || !form.name">{{ saving ? 'Saving…' : 'Save Profile' }}</button>
    </form>
  </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { savePlayerProfile } from '../useAuth.js'

const props = defineProps({ uid: String, profile: { type: Object, default: () => ({}) } })
const emit = defineEmits(['saved'])
const saving = ref(false), message = ref(''), saveError = ref(false)
const form = reactive({ name: '', position: '', height: '', weight: '', goals: [], level: '', weeklyGoal: 4 })
const positions = [{ id: 'PG', name: 'Point Guard' }, { id: 'SG', name: 'Shooting Guard' }, { id: 'SF', name: 'Small Forward' }, { id: 'PF', name: 'Power Forward' }, { id: 'C', name: 'Center' }]
const levels = [{ id: 'beginner', icon: '🌱', name: 'Beginner', description: 'Just starting out' }, { id: 'intermediate', icon: '⚡', name: 'Intermediate', description: 'Playing regularly' }, { id: 'advanced', icon: '🔥', name: 'Advanced', description: 'Competitive player' }]
const goals = [{ id: 'vertical', icon: '⬆️', name: 'Jump Higher' }, { id: 'shooting', icon: '🎯', name: 'Shoot Better' }, { id: 'dribbling', icon: '🏀', name: 'Ball Handling' }, { id: 'defense', icon: '🛡️', name: 'Defense' }, { id: 'speed', icon: '⚡', name: 'Get Faster' }, { id: 'strength', icon: '💪', name: 'Get Stronger' }, { id: 'explosive', icon: '💥', name: 'Explosiveness' }, { id: 'school_team', icon: '🏫', name: 'Make School Team' }, { id: 'pro', icon: '🏆', name: 'Go Professional' }, { id: 'weight', icon: '⚖️', name: 'Manage Weight' }]
const weeklyGoals = [2, 3, 4, 5, 6, 7]

function populate(profile) { Object.assign(form, { name: profile?.name || '', position: profile?.position || '', height: profile?.height || '', weight: profile?.weight || '', goals: Array.isArray(profile?.goals) ? [...profile.goals] : [], level: profile?.level || '', weeklyGoal: Number(profile?.weeklyGoal) || 4 }) }
populate(props.profile)
watch(() => props.profile, populate, { deep: true })
const initials = computed(() => form.name.split(' ').filter(Boolean).map(part => part[0]).join('').slice(0, 2).toUpperCase() || '🏀')
function toggleGoal(id) { const index = form.goals.indexOf(id); if (index === -1) form.goals.push(id); else form.goals.splice(index, 1) }
async function save() {
  saving.value = true; message.value = ''
  try {
    const profile = { name: form.name, position: form.position, height: form.height || '', weight: form.weight || '', goals: [...form.goals], level: form.level, weeklyGoal: form.weeklyGoal }
    await savePlayerProfile(props.uid, profile); emit('saved', profile); message.value = 'Profile saved successfully.'; saveError.value = false
  } catch (error) { message.value = 'Profile could not be saved. Please try again.'; saveError.value = true } finally { saving.value = false }
}
</script>

<style scoped>
.profile-page,.profile-form,.form-card{display:flex;flex-direction:column;gap:14px}.profile-hero{display:flex;align-items:center;gap:14px;background:linear-gradient(135deg,var(--surface),#29180f)}.avatar{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;flex-shrink:0;background:var(--accent);color:#fff;font-size:20px;font-weight:900}.eyebrow{color:var(--accent);font-size:10px;letter-spacing:1px;font-weight:800}.profile-hero h1{margin:1px 0 2px;font-size:21px}.profile-hero p,.section-copy{color:var(--text);font-size:12px;line-height:1.45}.form-card h2{font-size:16px}.physical-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.experience-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.choice-card,.goal-btn{background:var(--surface2);border:1.5px solid var(--border);color:var(--text2);border-radius:var(--radius-sm);transition:all .2s}.choice-card{display:flex;flex-direction:column;gap:3px;align-items:center;padding:12px 5px}.choice-card span{font-size:20px}.choice-card strong{color:var(--text-h);font-size:11px}.choice-card small{color:var(--text);font-size:9px;line-height:1.2}.choice-card.active,.goal-btn.active{background:var(--accent-dim);border-color:var(--accent);color:var(--accent)}.choice-card.active strong{color:var(--accent)}.weekly-goal{margin-top:2px}.goals-heading{display:flex;align-items:center;justify-content:space-between}.goals-heading span{color:var(--text);font-size:11px;font-weight:600}.goals-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.goal-btn{text-align:left;padding:10px;font-size:12px;font-weight:600;display:flex;align-items:center;gap:7px}.save-message{color:var(--green);font-size:13px;font-weight:600;text-align:center}.save-message.error{color:var(--red)}
</style>
