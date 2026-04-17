<template>
  <div class="checkin-wrap">

    <!-- Streak Banner -->
    <div class="streak-banner card">
      <div class="streak-fire">🔥</div>
      <div>
        <div class="streak-num">{{ streak }} day streak</div>
        <div class="streak-sub">Keep it going — check in every day!</div>
      </div>
      <div class="streak-dots">
        <div
          v-for="(d, i) in last7"
          :key="i"
          class="streak-dot"
          :class="{ filled: d.done, today: d.isToday }"
          :title="d.label"
        >
          <span class="dot-label">{{ d.short }}</span>
        </div>
      </div>
    </div>

    <!-- Today's Check-In -->
    <div class="card checkin-card">
      <div class="checkin-date">📆 {{ todayLabel }}</div>

      <!-- Water -->
      <div class="checkin-section">
        <div class="checkin-header">
          <span class="checkin-icon">💧</span>
          <span class="checkin-title">Water Intake</span>
          <span class="checkin-goal">Goal: {{ waterGoal }} glasses</span>
        </div>
        <div class="glasses-row">
          <button
            v-for="n in waterGoal"
            :key="n"
            class="glass-btn"
            :class="{ filled: today.water >= n }"
            @click="setWater(n)"
          >🥛</button>
        </div>
        <div class="checkin-status" :class="today.water >= waterGoal ? 'done' : 'pending'">
          {{ today.water }}/{{ waterGoal }} glasses
          <span v-if="today.water >= waterGoal"> ✅ Done!</span>
        </div>
      </div>

      <div class="divider" />

      <!-- Meals -->
      <div class="checkin-section">
        <div class="checkin-header">
          <span class="checkin-icon">🍽️</span>
          <span class="checkin-title">Meals</span>
          <span class="checkin-goal">Log what you ate</span>
        </div>
        <div class="meals-list">
          <div v-for="meal in meals" :key="meal.id" class="meal-row">
            <button
              class="meal-check"
              :class="{ checked: today.meals[meal.id] }"
              @click="toggleMeal(meal.id)"
            >
              <span v-if="today.meals[meal.id]">✓</span>
            </button>
            <span class="meal-name">{{ meal.icon }} {{ meal.name }}</span>
            <input
              class="meal-note"
              :placeholder="meal.placeholder"
              :value="today.mealNotes[meal.id] || ''"
              @input="setMealNote(meal.id, $event.target.value)"
            />
          </div>
        </div>
        <div class="checkin-status" :class="mealsChecked >= 3 ? 'done' : 'pending'">
          {{ mealsChecked }}/{{ meals.length }} meals logged
          <span v-if="mealsChecked >= 3"> ✅ On track!</span>
        </div>
      </div>

      <!-- Save Button -->
      <button class="save-btn" :class="{ saved: saved }" @click="save">
        {{ saved ? '✅ Saved!' : '💾 Save Today\'s Check-In' }}
      </button>
    </div>

    <!-- History -->
    <div class="card history-card" v-if="history.length">
      <div class="history-title">📋 Recent Check-Ins</div>
      <div class="history-list">
        <div v-for="entry in history.slice().reverse().slice(0, 7)" :key="entry.date" class="history-row">
          <span class="history-date">{{ entry.date }}</span>
          <span class="history-badge water">💧 {{ entry.water }}/{{ waterGoal }}</span>
          <span class="history-badge meals">🍽️ {{ Object.values(entry.meals).filter(Boolean).length }}/{{ meals.length }}</span>
          <span class="history-streak" :class="entry.done ? 'done' : 'miss'">
            {{ entry.done ? '🔥' : '❌' }}
          </span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({ uid: String })

const waterGoal = 8
const meals = [
  { id: 'breakfast', name: 'Breakfast', icon: '🌅', placeholder: 'e.g. oats, eggs...' },
  { id: 'lunch',     name: 'Lunch',     icon: '☀️',  placeholder: 'e.g. rice, chicken...' },
  { id: 'dinner',    name: 'Dinner',    icon: '🌙',  placeholder: 'e.g. pasta, salad...' },
  { id: 'snack',     name: 'Snack',     icon: '🍎',  placeholder: 'e.g. fruit, nuts...' },
]

const storageKey = computed(() => `vjp_checkin_${props.uid || 'guest'}`)

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function emptyDay() {
  return {
    date: todayStr(),
    water: 0,
    meals: {},
    mealNotes: {},
    done: false,
  }
}

function loadHistory() {
  return JSON.parse(localStorage.getItem(storageKey.value) || '[]')
}

const history = ref(loadHistory())

const today = ref(
  history.value.find(e => e.date === todayStr()) || emptyDay()
)

const saved = ref(false)

const mealsChecked = computed(() => meals.filter(m => today.value.meals[m.id]).length)

const todayLabel = computed(() => {
  const d = new Date()
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
})

function setWater(n) {
  today.value.water = today.value.water === n ? n - 1 : n
  saved.value = false
}

function toggleMeal(id) {
  today.value.meals[id] = !today.value.meals[id]
  saved.value = false
}

function setMealNote(id, val) {
  today.value.mealNotes[id] = val
  saved.value = false
}

function save() {
  today.value.done = today.value.water >= waterGoal && mealsChecked.value >= 3
  const hist = loadHistory().filter(e => e.date !== todayStr())
  hist.push({ ...today.value })
  localStorage.setItem(storageKey.value, JSON.stringify(hist))
  history.value = hist
  saved.value = true
  setTimeout(() => saved.value = false, 2000)
}

// Streak: consecutive days where done === true ending today or yesterday
const streak = computed(() => {
  const hist = [...history.value].sort((a, b) => a.date.localeCompare(b.date))
  let s = 0
  let check = todayStr()
  for (let i = hist.length - 1; i >= 0; i--) {
    if (hist[i].date === check && hist[i].done) {
      s++
      const d = new Date(check)
      d.setDate(d.getDate() - 1)
      check = d.toISOString().slice(0, 10)
    } else if (hist[i].date === check) {
      break
    }
  }
  return s
})

// Last 7 days for dot display
const last7 = computed(() => {
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const entry = history.value.find(e => e.date === dateStr)
    days.push({
      label: dateStr,
      short: ['S','M','T','W','T','F','S'][d.getDay()],
      done: entry?.done || false,
      isToday: i === 0,
    })
  }
  return days
})
</script>

<style scoped>
.checkin-wrap { display: flex; flex-direction: column; gap: 16px; }

.streak-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.streak-fire { font-size: 36px; }
.streak-num { font-size: 22px; font-weight: 700; color: var(--text-h); }
.streak-sub { font-size: 12px; color: var(--text); }
.streak-dots { display: flex; gap: 8px; margin-left: auto; }
.streak-dot {
  width: 34px; height: 34px;
  border-radius: 50%;
  border: 2px solid var(--border);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700; color: var(--text);
  transition: all 0.2s;
}
.streak-dot.filled { background: #f97316; border-color: #f97316; color: #fff; }
.streak-dot.today:not(.filled) { border-color: #f97316; color: var(--text-h); }
.dot-label { font-size: 11px; }

.checkin-card { display: flex; flex-direction: column; gap: 20px; }
.checkin-date { font-size: 13px; color: var(--text); font-weight: 600; }

.checkin-section { display: flex; flex-direction: column; gap: 12px; }
.checkin-header { display: flex; align-items: center; gap: 8px; }
.checkin-icon { font-size: 20px; }
.checkin-title { font-size: 16px; font-weight: 700; color: var(--text-h); }
.checkin-goal { margin-left: auto; font-size: 12px; color: var(--text); }

.glasses-row { display: flex; flex-wrap: wrap; gap: 8px; }
.glass-btn {
  width: 40px; height: 40px;
  border-radius: 8px;
  background: var(--surface2);
  border: 1px solid var(--border);
  font-size: 18px;
  transition: all 0.15s;
  opacity: 0.35;
}
.glass-btn.filled { opacity: 1; background: #3b82f622; border-color: #3b82f6; }

.checkin-status { font-size: 13px; font-weight: 600; }
.checkin-status.done { color: #22c55e; }
.checkin-status.pending { color: var(--text); }

.divider { height: 1px; background: var(--border); }

.meals-list { display: flex; flex-direction: column; gap: 10px; }
.meal-row { display: flex; align-items: center; gap: 10px; }
.meal-check {
  width: 26px; height: 26px; flex-shrink: 0;
  border-radius: 6px;
  border: 2px solid var(--border);
  background: var(--surface2);
  font-size: 14px; font-weight: 700; color: #22c55e;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.15s;
}
.meal-check.checked { background: #22c55e22; border-color: #22c55e; }
.meal-name { font-size: 14px; color: var(--text-h); white-space: nowrap; min-width: 90px; }
.meal-note { font-size: 13px; }

.save-btn {
  background: var(--accent);
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  padding: 12px;
  border-radius: 10px;
  transition: all 0.2s;
}
.save-btn:hover { opacity: 0.85; }
.save-btn.saved { background: #22c55e; }

.history-card { }
.history-title { font-weight: 700; color: var(--text-h); font-size: 14px; margin-bottom: 12px; }
.history-list { display: flex; flex-direction: column; gap: 8px; }
.history-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.history-date { font-size: 13px; color: var(--text); min-width: 90px; }
.history-badge {
  font-size: 12px; font-weight: 600;
  padding: 2px 8px; border-radius: 20px;
  background: var(--surface2); color: var(--text-h);
}
.history-streak { font-size: 16px; margin-left: auto; }
.history-streak.done { }
.history-streak.miss { opacity: 0.5; }

@media (max-width: 600px) {
  .streak-dots { margin-left: 0; width: 100%; justify-content: space-between; }
  .meal-row { flex-wrap: wrap; }
  .meal-note { min-width: 0; }
}
</style>
