<template>
  <div class="page">

    <!-- Header -->
    <div class="nt-header">
      <div>
        <h1>🥗 Nutrition</h1>
        <p class="nt-sub">Fuel your performance. Feed your gains.</p>
      </div>
      <button class="reset-btn" @click="confirmReset = true">↺ Reset Day</button>
    </div>

    <!-- Nutrition Score -->
    <div class="score-card card">
      <div class="score-ring-wrap">
        <svg viewBox="0 0 80 80" class="score-ring">
          <circle cx="40" cy="40" r="34" fill="none" stroke="var(--surface3)" stroke-width="7"/>
          <circle
            cx="40" cy="40" r="34" fill="none"
            stroke="var(--green)" stroke-width="7"
            stroke-linecap="round"
            :stroke-dasharray="`${nutritionScore * 2.136} 213.6`"
            stroke-dashoffset="53.4"
            style="transition:stroke-dasharray 0.6s ease"
          />
        </svg>
        <div class="score-inner">
          <span class="score-val">{{ nutritionScore }}</span>
          <span class="score-lbl">/ 100</span>
        </div>
      </div>
      <div class="score-info">
        <div class="score-title">Nutrition Score</div>
        <div class="score-desc">{{ scoreMessage }}</div>
        <div class="score-pills">
          <div class="score-pill" v-for="p in summaryPills" :key="p.label">
            <span class="sp-val" :style="{ color: p.color }">{{ p.val }}</span>
            <span class="sp-label">{{ p.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── TRACKERS ── -->
    <div class="trackers-list">

      <!-- Calories -->
      <div class="tracker-card card">
        <div class="tracker-top">
          <span class="tracker-icon">🔥</span>
          <div class="tracker-info">
            <div class="tracker-name">Daily Calories</div>
            <div class="tracker-sub">Target: {{ targets.calories }} kcal</div>
          </div>
          <div class="tracker-val-wrap">
            <span class="tracker-val" :style="{ color: barColor(pct(current.calories, targets.calories)) }">
              {{ current.calories }}
            </span>
            <span class="tracker-unit">kcal</span>
          </div>
        </div>
        <div class="track-bar-wrap">
          <div class="track-bar">
            <div class="track-fill" :style="{ width: pct(current.calories, targets.calories) + '%', background: barColor(pct(current.calories, targets.calories)) }"></div>
          </div>
          <span class="track-pct">{{ pct(current.calories, targets.calories) }}%</span>
        </div>
        <div class="stepper">
          <button class="step-btn" @click="adjust('calories', -100)">−100</button>
          <button class="step-btn" @click="adjust('calories', -50)">−50</button>
          <button class="step-btn accent" @click="adjust('calories', 50)">+50</button>
          <button class="step-btn accent" @click="adjust('calories', 100)">+100</button>
          <button class="step-btn accent" @click="adjust('calories', 200)">+200</button>
        </div>
      </div>

      <!-- Protein -->
      <div class="tracker-card card">
        <div class="tracker-top">
          <span class="tracker-icon">🥩</span>
          <div class="tracker-info">
            <div class="tracker-name">Daily Protein</div>
            <div class="tracker-sub">Target: {{ targets.protein }}g · ~{{ Math.round(targets.protein / 4) }} kcal</div>
          </div>
          <div class="tracker-val-wrap">
            <span class="tracker-val" :style="{ color: barColor(pct(current.protein, targets.protein)) }">
              {{ current.protein }}
            </span>
            <span class="tracker-unit">g</span>
          </div>
        </div>
        <div class="track-bar-wrap">
          <div class="track-bar">
            <div class="track-fill" :style="{ width: pct(current.protein, targets.protein) + '%', background: barColor(pct(current.protein, targets.protein)) }"></div>
          </div>
          <span class="track-pct">{{ pct(current.protein, targets.protein) }}%</span>
        </div>
        <div class="stepper">
          <button class="step-btn" @click="adjust('protein', -10)">−10g</button>
          <button class="step-btn" @click="adjust('protein', -5)">−5g</button>
          <button class="step-btn accent" @click="adjust('protein', 5)">+5g</button>
          <button class="step-btn accent" @click="adjust('protein', 10)">+10g</button>
          <button class="step-btn accent" @click="adjust('protein', 25)">+25g</button>
        </div>
      </div>

      <!-- Water -->
      <div class="tracker-card card">
        <div class="tracker-top">
          <span class="tracker-icon">💧</span>
          <div class="tracker-info">
            <div class="tracker-name">Water Intake</div>
            <div class="tracker-sub">Target: {{ targets.water }}L · {{ Math.round(targets.water * 4) }} glasses</div>
          </div>
          <div class="tracker-val-wrap">
            <span class="tracker-val" :style="{ color: barColor(pct(current.water * 10, targets.water * 10)) }">
              {{ current.water.toFixed(1) }}
            </span>
            <span class="tracker-unit">L</span>
          </div>
        </div>
        <div class="track-bar-wrap">
          <div class="track-bar">
            <div class="track-fill" :style="{ width: pct(current.water * 10, targets.water * 10) + '%', background: barColor(pct(current.water * 10, targets.water * 10)) }"></div>
          </div>
          <span class="track-pct">{{ pct(current.water * 10, targets.water * 10) }}%</span>
        </div>
        <!-- Water glasses visual -->
        <div class="water-glasses">
          <button
            v-for="i in 10" :key="i"
            class="glass-btn"
            :class="{ filled: i <= Math.round(current.water * 4) }"
            @click="setGlasses(i)"
            title="1 glass = 250ml"
          >🥤</button>
        </div>
        <div class="stepper">
          <button class="step-btn" @click="adjustWater(-0.25)">−250ml</button>
          <button class="step-btn accent" @click="adjustWater(0.25)">+250ml</button>
          <button class="step-btn accent" @click="adjustWater(0.5)">+500ml</button>
        </div>
      </div>

      <!-- Fruits -->
      <div class="tracker-card card">
        <div class="tracker-top">
          <span class="tracker-icon">🍎</span>
          <div class="tracker-info">
            <div class="tracker-name">Fruits</div>
            <div class="tracker-sub">Target: {{ targets.fruits }} servings/day</div>
          </div>
          <div class="tracker-val-wrap">
            <span class="tracker-val" :style="{ color: barColor(pct(current.fruits, targets.fruits)) }">
              {{ current.fruits }}
            </span>
            <span class="tracker-unit">/ {{ targets.fruits }}</span>
          </div>
        </div>
        <div class="track-bar-wrap">
          <div class="track-bar">
            <div class="track-fill" :style="{ width: pct(current.fruits, targets.fruits) + '%', background: barColor(pct(current.fruits, targets.fruits)) }"></div>
          </div>
          <span class="track-pct">{{ pct(current.fruits, targets.fruits) }}%</span>
        </div>
        <div class="serving-dots">
          <button
            v-for="i in targets.fruits" :key="i"
            class="dot-btn"
            :class="{ filled: i <= current.fruits }"
            @click="current.fruits = current.fruits === i ? i - 1 : i"
          ></button>
        </div>
      </div>

      <!-- Vegetables -->
      <div class="tracker-card card">
        <div class="tracker-top">
          <span class="tracker-icon">🥦</span>
          <div class="tracker-info">
            <div class="tracker-name">Vegetables</div>
            <div class="tracker-sub">Target: {{ targets.veggies }} servings/day</div>
          </div>
          <div class="tracker-val-wrap">
            <span class="tracker-val" :style="{ color: barColor(pct(current.veggies, targets.veggies)) }">
              {{ current.veggies }}
            </span>
            <span class="tracker-unit">/ {{ targets.veggies }}</span>
          </div>
        </div>
        <div class="track-bar-wrap">
          <div class="track-bar">
            <div class="track-fill" :style="{ width: pct(current.veggies, targets.veggies) + '%', background: barColor(pct(current.veggies, targets.veggies)) }"></div>
          </div>
          <span class="track-pct">{{ pct(current.veggies, targets.veggies) }}%</span>
        </div>
        <div class="serving-dots">
          <button
            v-for="i in targets.veggies" :key="i"
            class="dot-btn veggie"
            :class="{ filled: i <= current.veggies }"
            @click="current.veggies = current.veggies === i ? i - 1 : i"
          ></button>
        </div>
      </div>

    </div>

    <!-- ── MEALS ── -->
    <div class="section-header" style="margin-top:20px">
      <span class="section-title">🍽️ Meals</span>
      <span class="section-sub">{{ meals.filter(m=>m.logged).length }}/{{ meals.length }} logged</span>
    </div>
    <div class="meals-list">
      <div
        v-for="meal in meals" :key="meal.id"
        class="meal-card card"
        :class="{ logged: meal.logged }"
      >
        <div class="meal-top">
          <div class="meal-left">
            <span class="meal-icon">{{ meal.icon }}</span>
            <div>
              <div class="meal-name">{{ meal.name }}</div>
              <div class="meal-time">{{ meal.time }}</div>
            </div>
          </div>
          <button
            class="meal-toggle"
            :class="{ logged: meal.logged }"
            @click="meal.logged = !meal.logged"
          >{{ meal.logged ? '✓ Logged' : 'Log Meal' }}</button>
        </div>
        <input
          v-model="meal.note"
          class="meal-note-input"
          :placeholder="`What did you eat for ${meal.name.toLowerCase()}?`"
        />
        <div class="meal-macros" v-if="meal.logged && meal.note">
          <span class="macro-chip">🔥 ~{{ meal.kcal }} kcal</span>
          <span class="macro-chip">🥩 ~{{ meal.prot }}g protein</span>
        </div>
      </div>
    </div>

    <!-- Targets Editor -->
    <div class="section-header" style="margin-top:20px">
      <span class="section-title">⚙️ Daily Targets</span>
    </div>
    <div class="targets-card card">
      <div class="targets-grid">
        <div class="target-field" v-for="t in targetFields" :key="t.key">
          <label class="target-label">{{ t.icon }} {{ t.label }}</label>
          <input type="number" v-model.number="targets[t.key]" class="target-input" :min="t.min" :step="t.step" />
          <span class="target-unit">{{ t.unit }}</span>
        </div>
      </div>
    </div>

    <!-- Reset Modal -->
    <div v-if="confirmReset" class="modal-overlay" @click.self="confirmReset = false">
      <div class="modal card">
        <div class="modal-icon">↺</div>
        <div class="modal-title">Reset Today's Nutrition?</div>
        <p class="modal-desc">All intake values and meal logs will be cleared.</p>
        <div class="modal-actions">
          <button class="btn-secondary" @click="confirmReset = false">Cancel</button>
          <button class="btn-primary" style="width:auto;padding:12px 24px" @click="doReset">Reset</button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

defineProps({ profile: Object })

const confirmReset = ref(false)

const targets = ref({ calories: 2500, protein: 150, water: 2.5, fruits: 3, veggies: 5 })

const current = ref({ calories: 0, protein: 0, water: 0, fruits: 0, veggies: 0 })

const targetFields = [
  { key: 'calories', icon: '🔥', label: 'Calories', unit: 'kcal', min: 500,  step: 100 },
  { key: 'protein',  icon: '🥩', label: 'Protein',  unit: 'g',    min: 20,   step: 5   },
  { key: 'water',    icon: '💧', label: 'Water',     unit: 'L',    min: 0.5,  step: 0.5 },
  { key: 'fruits',   icon: '🍎', label: 'Fruits',    unit: 'srv',  min: 1,    step: 1   },
  { key: 'veggies',  icon: '🥦', label: 'Veggies',   unit: 'srv',  min: 1,    step: 1   },
]

const meals = ref([
  { id: 1, icon: '🌅', name: 'Breakfast', time: '7:00 – 9:00 AM',  logged: false, note: '', kcal: 500,  prot: 30 },
  { id: 2, icon: '🥪', name: 'Snack',     time: '10:30 – 11:00 AM',logged: false, note: '', kcal: 200,  prot: 15 },
  { id: 3, icon: '☀️', name: 'Lunch',     time: '12:00 – 1:30 PM', logged: false, note: '', kcal: 700,  prot: 45 },
  { id: 4, icon: '🍌', name: 'Pre-Workout',time: '3:00 – 4:00 PM', logged: false, note: '', kcal: 300,  prot: 20 },
  { id: 5, icon: '🌙', name: 'Dinner',    time: '6:00 – 8:00 PM',  logged: false, note: '', kcal: 700,  prot: 40 },
])

function pct(val, target) {
  return Math.min(100, target > 0 ? Math.round((val / target) * 100) : 0)
}

function barColor(p) {
  if (p >= 90) return 'var(--green)'
  if (p >= 60) return 'var(--accent)'
  if (p >= 30) return 'var(--yellow)'
  return 'var(--red)'
}

function adjust(key, delta) {
  current.value[key] = Math.max(0, current.value[key] + delta)
}

function adjustWater(delta) {
  current.value.water = Math.max(0, Math.round((current.value.water + delta) * 10) / 10)
}

function setGlasses(n) {
  current.value.water = Math.round((n * 0.25) * 10) / 10
}

const nutritionScore = computed(() => {
  const scores = [
    pct(current.value.calories, targets.value.calories),
    pct(current.value.protein,  targets.value.protein),
    pct(current.value.water * 10, targets.value.water * 10),
    pct(current.value.fruits,   targets.value.fruits),
    pct(current.value.veggies,  targets.value.veggies),
    (meals.value.filter(m => m.logged).length / meals.value.length) * 100,
  ]
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
})

const scoreMessage = computed(() => {
  const s = nutritionScore.value
  if (s >= 85) return 'Excellent fueling 🔥 Peak performance ready.'
  if (s >= 60) return 'Good nutrition. Keep tracking.'
  if (s >= 35) return 'Getting there. Log more meals.'
  return 'Start logging your nutrition.'
})

const summaryPills = computed(() => [
  { label: 'Calories', val: current.value.calories + 'kcal', color: barColor(pct(current.value.calories, targets.value.calories)) },
  { label: 'Protein',  val: current.value.protein + 'g',     color: barColor(pct(current.value.protein, targets.value.protein)) },
  { label: 'Water',    val: current.value.water.toFixed(1) + 'L', color: barColor(pct(current.value.water * 10, targets.value.water * 10)) },
])

function doReset() {
  current.value = { calories: 0, protein: 0, water: 0, fruits: 0, veggies: 0 }
  meals.value.forEach(m => { m.logged = false; m.note = '' })
  confirmReset.value = false
}
</script>

<style scoped>
.nt-header {
  display: flex; align-items: flex-start;
  justify-content: space-between; margin-bottom: 14px;
}
.nt-header h1 { font-size: 26px; font-weight: 800; color: var(--text-h); margin: 0 0 2px; }
.nt-sub { font-size: 13px; color: var(--text); margin: 0; }

.reset-btn {
  background: var(--surface2); border: 1.5px solid var(--border);
  color: var(--text); border-radius: var(--radius-sm);
  padding: 8px 14px; font-size: 13px; font-weight: 600;
  transition: all 0.2s; flex-shrink: 0;
}
.reset-btn:hover { border-color: var(--accent); color: var(--accent); }

/* Score ring */
.score-card { display: flex; align-items: center; gap: 20px; padding: 18px; margin-bottom: 16px; }
.score-ring-wrap { position: relative; width: 80px; height: 80px; flex-shrink: 0; }
.score-ring { width: 80px; height: 80px; transform: rotate(-90deg); }
.score-inner {
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.score-val { font-size: 22px; font-weight: 900; color: var(--text-h); line-height: 1; }
.score-lbl { font-size: 10px; color: var(--text); font-weight: 600; }
.score-info { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.score-title { font-size: 15px; font-weight: 700; color: var(--text-h); }
.score-desc  { font-size: 12px; color: var(--text2); }
.score-pills { display: flex; gap: 6px; }
.score-pill {
  display: flex; flex-direction: column; align-items: center; gap: 1px;
  background: var(--surface2); border-radius: var(--radius-sm);
  padding: 5px 8px; flex: 1; min-width: 0;
}
.sp-val   { font-size: 12px; font-weight: 800; color: var(--text-h); white-space: nowrap; }
.sp-label { font-size: 9px; color: var(--text); font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }

/* Trackers */
.trackers-list { display: flex; flex-direction: column; gap: 12px; }
.tracker-card  { display: flex; flex-direction: column; gap: 10px; }

.tracker-top { display: flex; align-items: center; gap: 10px; }
.tracker-icon { font-size: 28px; flex-shrink: 0; }
.tracker-info { flex: 1; }
.tracker-name { font-size: 15px; font-weight: 700; color: var(--text-h); }
.tracker-sub  { font-size: 11px; color: var(--text); }
.tracker-val-wrap { display: flex; align-items: baseline; gap: 3px; flex-shrink: 0; }
.tracker-val  { font-size: 22px; font-weight: 900; }
.tracker-unit { font-size: 12px; color: var(--text); font-weight: 600; }

.track-bar-wrap { display: flex; align-items: center; gap: 8px; }
.track-bar {
  flex: 1; height: 8px; background: var(--surface3);
  border-radius: 99px; overflow: hidden;
}
.track-fill { height: 100%; border-radius: 99px; transition: width 0.4s ease, background 0.3s; }
.track-pct  { font-size: 11px; font-weight: 700; color: var(--text); min-width: 32px; text-align: right; }

/* Stepper */
.stepper { display: flex; gap: 6px; flex-wrap: wrap; }
.step-btn {
  flex: 1; min-width: 0;
  padding: 8px 4px; border-radius: var(--radius-sm);
  font-size: 12px; font-weight: 700;
  background: var(--surface2); border: 1.5px solid var(--border);
  color: var(--text); transition: all 0.15s;
}
.step-btn:hover { border-color: var(--border2); color: var(--text-h); }
.step-btn:active { transform: scale(0.95); }
.step-btn.accent { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); }
.step-btn.accent:hover { background: #f9731630; }

/* Water glasses */
.water-glasses { display: flex; gap: 4px; flex-wrap: wrap; }
.glass-btn {
  font-size: 20px; background: transparent; border: none;
  opacity: 0.25; transition: opacity 0.15s, transform 0.15s;
  padding: 2px;
}
.glass-btn.filled { opacity: 1; }
.glass-btn:hover  { transform: scale(1.15); }

/* Serving dots */
.serving-dots { display: flex; gap: 8px; flex-wrap: wrap; }
.dot-btn {
  width: 28px; height: 28px; border-radius: 50%;
  background: var(--surface3); border: 2px solid var(--border);
  transition: all 0.15s; cursor: pointer;
}
.dot-btn.filled { background: #ef444488; border-color: #ef4444; }
.dot-btn.veggie.filled { background: #22c55e88; border-color: var(--green); }
.dot-btn:hover { border-color: var(--border2); transform: scale(1.1); }

/* Section header */
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.section-title  { font-size: 15px; font-weight: 700; color: var(--text-h); }
.section-sub    { font-size: 12px; color: var(--text); font-weight: 600; }

/* Meals */
.meals-list { display: flex; flex-direction: column; gap: 8px; }
.meal-card  { display: flex; flex-direction: column; gap: 10px; transition: border-color 0.2s; }
.meal-card.logged { border-color: var(--green); }

.meal-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.meal-left { display: flex; align-items: center; gap: 10px; }
.meal-icon { font-size: 26px; }
.meal-name { font-size: 14px; font-weight: 700; color: var(--text-h); }
.meal-time { font-size: 11px; color: var(--text); }

.meal-toggle {
  background: var(--surface2); border: 1.5px solid var(--border);
  color: var(--text); border-radius: var(--radius-sm);
  padding: 7px 12px; font-size: 12px; font-weight: 700;
  transition: all 0.2s; flex-shrink: 0;
}
.meal-toggle:hover { border-color: var(--green); color: var(--green); }
.meal-toggle.logged { background: #22c55e18; border-color: var(--green); color: var(--green); }

.meal-note-input {
  background: var(--surface2); border: 1.5px solid var(--border);
  border-radius: var(--radius-sm); padding: 8px 12px;
  font-size: 13px; color: var(--text-h); width: 100%;
}
.meal-note-input:focus { border-color: var(--accent); outline: none; }

.meal-macros { display: flex; gap: 8px; flex-wrap: wrap; }
.macro-chip {
  font-size: 11px; font-weight: 600; color: var(--text2);
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: 99px; padding: 3px 10px;
}

/* Targets editor */
.targets-card { padding: 14px; }
.targets-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.target-field { display: flex; flex-direction: column; gap: 4px; }
.target-label { font-size: 11px; font-weight: 700; color: var(--text); text-transform: uppercase; letter-spacing: 0.4px; }
.target-input {
  background: var(--surface2); border: 1.5px solid var(--border);
  border-radius: var(--radius-sm); padding: 8px 10px;
  font-size: 15px; font-weight: 700; color: var(--text-h);
  width: 100%; text-align: center;
}
.target-input:focus { border-color: var(--accent); outline: none; }
.target-unit { font-size: 10px; color: var(--text); font-weight: 600; text-align: center; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  z-index: 500; padding: 24px;
}
.modal {
  width: 100%; max-width: 320px;
  display: flex; flex-direction: column; align-items: center;
  gap: 10px; text-align: center;
}
.modal-icon  { font-size: 36px; }
.modal-title { font-size: 18px; font-weight: 800; color: var(--text-h); }
.modal-desc  { font-size: 13px; color: var(--text); line-height: 1.5; }
.modal-actions { display: flex; gap: 10px; width: 100%; margin-top: 6px; }
.modal-actions .btn-secondary { flex: 1; }
</style>
