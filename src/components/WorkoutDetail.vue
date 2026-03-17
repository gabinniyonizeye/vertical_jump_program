<template>
  <div>
    <div class="workout-tabs">
      <button
        v-for="w in workouts"
        :key="w.day"
        class="tab-btn"
        :class="{ active: active === w.day }"
        @click="active = w.day"
        :style="active === w.day ? { background: w.color + '22', color: w.color, borderColor: w.color } : {}"
      >
        {{ w.day }}
      </button>
    </div>

    <template v-for="w in workouts" :key="w.day">
      <div v-if="active === w.day">
      <div class="workout-header card" :style="{ borderColor: w.color }">
        <div>
          <div class="workout-day" :style="{ color: w.color }">{{ w.day }} — {{ w.subtitle }}</div>
          <div class="workout-focus">👉 {{ w.focus }}</div>
        </div>
        <div class="header-actions">
          <div class="session-time" v-if="sessionStart[w.day]">⏱ {{ elapsed[w.day] }}</div>
          <button class="start-session-btn" v-if="!sessionStart[w.day]" @click="startSession(w.day)" :style="{ background: w.color }">Start Session</button>
          <button class="reset-btn" @click="resetDay(w.day)">Reset</button>
        </div>
      </div>

      <div class="exercises">
        <div
          v-for="(ex, i) in w.exercises"
          :key="i"
          class="exercise-card card"
          :class="{ done: allSetsDone(w.day, i, ex.totalSets) }"
        >
          <div class="ex-header" @click="toggleExpand(w.day, i)">
            <div class="check-box" :style="allSetsDone(w.day, i, ex.totalSets) ? { background: w.color, borderColor: w.color } : {}">
              <span v-if="allSetsDone(w.day, i, ex.totalSets)">✓</span>
            </div>
            <div class="ex-info">
              <div class="ex-name">{{ ex.name }}</div>
              <div class="ex-sets">{{ ex.sets }}</div>
            </div>
            <div v-if="ex.note" class="ex-note">{{ ex.note }}</div>
            <div class="ex-pr" v-if="getPR(w.day, i)">🏆 PR: {{ getPR(w.day, i) }}kg</div>
            <span class="expand-icon">{{ expanded[w.day]?.[i] ? '▲' : '▼' }}</span>
          </div>

          <div v-if="expanded[w.day]?.[i]" class="ex-body">
            <!-- Video Tutorial Button -->
            <button v-if="ex.video" class="video-btn" @click.stop="openVideo(ex.video)">
              <span class="yt-icon">▶</span>
              <span>Watch Tutorial — {{ ex.video.label }}</span>
            </button>

            <div class="sets-grid">
              <div class="set-header">Set</div>
              <div class="set-header">Weight (kg)</div>
              <div class="set-header">Reps</div>
              <div class="set-header">Done</div>

              <template v-for="s in ex.totalSets" :key="s">
                <div class="set-num">{{ s }}</div>
                <input
                  class="set-input"
                  type="number"
                  min="0"
                  placeholder="kg"
                  v-model="logs[w.day][i][s].weight"
                />
                <input
                  class="set-input"
                  type="number"
                  min="0"
                  placeholder="reps"
                  v-model="logs[w.day][i][s].reps"
                />
                <button
                  class="set-done-btn"
                  :class="{ checked: logs[w.day][i][s].done }"
                  :style="logs[w.day][i][s].done ? { background: w.color, borderColor: w.color } : {}"
                  @click="toggleSet(w.day, i, s)"
                >✓</button>
              </template>
            </div>
            <div class="ex-note-full" v-if="ex.tip">💡 {{ ex.tip }}</div>
          </div>
        </div>
      </div>

      <div class="bottom-row">
        <div class="progress-bar-wrap">
          <div class="progress-label">
            <span>Session Progress</span>
            <span>{{ doneCount(w.day, w.exercises) }}/{{ w.exercises.length }} exercises</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :style="{ width: progressPct(w.day, w.exercises) + '%', background: w.color }"></div>
          </div>
        </div>
        <RestTimer />
      </div>
      </div>
    </template>
    <Teleport to="body">
      <div v-if="activeVideo" class="modal-overlay" @click.self="activeVideo = null">
        <div class="modal-box">
          <div class="modal-header">
            <span class="modal-title">🎥 {{ activeVideo.label }}</span>
            <button class="modal-close" @click="activeVideo = null">✕</button>
          </div>
          <div class="video-container">
            <iframe
              :src="`https://www.youtube.com/embed/${activeVideo.id}?autoplay=1&rel=0`"
              frameborder="0"
              allow="autoplay; encrypted-media"
              allowfullscreen
            ></iframe>
          </div>
          <a
            :href="`https://www.youtube.com/watch?v=${activeVideo.id}`"
            target="_blank"
            rel="noopener"
            class="yt-link"
          >▶ Open on YouTube</a>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onUnmounted } from 'vue'
import RestTimer from './RestTimer.vue'

const STORAGE_KEY = 'vjp_workout_logs'

const workouts = [
  {
    day: 'Monday', subtitle: 'Strength A', color: '#f97316',
    focus: 'Raw strength = foundation for bounce',
    exercises: [
      { name: 'Back Squat',            sets: '4 × 4–6 reps',   totalSets: 4, tip: 'Break parallel. Drive knees out. Brace your core.',
        video: { id: 'ultWZbUMPL8', label: 'Back Squat Tutorial — Squat University' } },
      { name: 'Bulgarian Split Squat', sets: '3 × 6–8 / leg',  totalSets: 3, tip: 'Keep front shin vertical. Feel the stretch in rear hip.',
        video: { id: '2C-uNgKwPLE', label: 'Bulgarian Split Squat — Jeff Nippard' } },
      { name: 'Romanian Deadlift',     sets: '3 × 6–8 reps',   totalSets: 3, tip: 'Hinge at hips, soft knees. Feel hamstring stretch at bottom.',
        video: { id: 'JCXUYuzwNrM', label: 'Romanian Deadlift — Alan Thrall' } },
      { name: 'Standing Calf Raises',  sets: '4 × 10–15 reps', totalSets: 4, note: 'Slow + full stretch', tip: '3 sec down, pause at bottom, explode up.',
        video: { id: 'gwLzBJYoWlI', label: 'Calf Raises for Vertical Jump — Jump Science' } },
      { name: 'Core (Plank / Pallof)', sets: '3 × 30–45 sec',  totalSets: 3,
        video: { id: 'ASdvN_XEl_c', label: 'Pallof Press Tutorial — Tony Gentilcore' } },
    ]
  },
  {
    day: 'Wednesday', subtitle: 'Posterior Chain + Power', color: '#3b82f6',
    focus: 'Glutes + explosiveness',
    exercises: [
      { name: 'Deadlift / Trap Bar',   sets: '3–4 × 3–5 reps', totalSets: 4, tip: 'Push the floor away. Lock hips at top. Control the descent.',
        video: { id: 'op9kVnSso6Q', label: 'Deadlift for Beginners — Alan Thrall' } },
      { name: 'Hip Thrust',            sets: '3 × 6–8 reps',   totalSets: 3, tip: 'Full hip extension at top. Squeeze glutes hard.',
        video: { id: 'LM8XHLYJoYs', label: 'Hip Thrust Tutorial — Bret Contreras' } },
      { name: 'Box Jumps',             sets: '4 × 4–6 reps',   totalSets: 4, note: 'Fast + soft landing', tip: 'Max intent every rep. Land soft, absorb with hips.',
        video: { id: 'NBY9-kTuHEk', label: 'Box Jump Technique — Overtime Athletes' } },
      { name: 'Step-Ups (Single Leg)', sets: '3 × 8 / leg',    totalSets: 3, tip: 'Drive through the heel of the working leg.',
        video: { id: 'wrwwXE_x-pQ', label: 'Step-Up Tutorial — Jeff Nippard' } },
      { name: 'Farmers Carry',         sets: '2 × 30–40 m',    totalSets: 2, note: 'Optional',
        video: { id: 'rt0UBGBhzQs', label: 'Farmers Carry — Alan Thrall' } },
    ]
  },
  {
    day: 'Saturday', subtitle: 'Power + Plyometrics', color: '#22c55e',
    focus: 'Turn strength into vertical power',
    exercises: [
      { name: 'Power Cleans / KB Swings', sets: '4 × 3–5 reps',   totalSets: 4, tip: 'Explosive hip extension. Speed > weight here.',
        video: { id: 'ySFbZnMKTtw', label: 'Kettlebell Swing Tutorial — Jeff Cavaliere' } },
      { name: 'Weighted Jump Squats',     sets: '4 × 5–6 reps',   totalSets: 4, note: 'Light weight, explosive', tip: 'Use 20–30% of squat max. Jump as high as possible.',
        video: { id: 'CVaEhXotL7M', label: 'Jump Squat for Vertical — Jump Science' } },
      { name: 'Depth / Drop Jumps',       sets: '3 × 4–6 reps',   totalSets: 3, tip: 'Minimal ground contact time. React like the floor is hot.',
        video: { id: 'XQqVoNXdSoQ', label: 'Depth Jump Tutorial — Jump Science' } },
      { name: 'Walking Lunges',           sets: '3 × 10 / leg',   totalSets: 3,
        video: { id: 'L8fvypPrzzs', label: 'Walking Lunge Form — Jeff Nippard' } },
      { name: 'Seated Calf Raises',       sets: '4 × 10–15 reps', totalSets: 4, note: 'Heavy',
        video: { id: 'gwLzBJYoWlI', label: 'Calf Raises for Vertical Jump — Jump Science' } },
    ]
  },
]

const savedLogs = (() => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') } catch { return null }
})()

function buildLogs() {
  const l = {}
  workouts.forEach(w => {
    l[w.day] = {}
    w.exercises.forEach((ex, i) => {
      l[w.day][i] = {}
      for (let s = 1; s <= ex.totalSets; s++) {
        l[w.day][i][s] = { weight: '', reps: '', done: false }
      }
    })
  })
  return l
}

const logs = reactive(savedLogs || buildLogs())
const expanded = reactive({})
const sessionStart = reactive({})
const elapsed = reactive({})
let timers = {}

function saveLogs() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs))
}

function toggleSet(day, i, s) {
  logs[day][i][s].done = !logs[day][i][s].done
  saveLogs()
}

function toggleExpand(day, i) {
  if (!expanded[day]) expanded[day] = {}
  expanded[day][i] = !expanded[day][i]
}

function allSetsDone(day, i, total) {
  if (!logs[day]?.[i]) return false
  return Array.from({ length: total }, (_, k) => k + 1).every(s => logs[day][i][s]?.done)
}

function doneCount(day, exercises) {
  return exercises.filter((ex, i) => allSetsDone(day, i, ex.totalSets)).length
}

function progressPct(day, exercises) {
  return Math.round((doneCount(day, exercises) / exercises.length) * 100)
}

function getPR(day, i) {
  const setData = logs[day]?.[i]
  if (!setData) return null
  const weights = Object.values(setData).map(s => Number(s.weight)).filter(v => v > 0)
  return weights.length ? Math.max(...weights) : null
}

function resetDay(day) {
  if (!confirm(`Reset all logs for ${day}?`)) return
  const w = workouts.find(w => w.day === day)
  w.exercises.forEach((ex, i) => {
    for (let s = 1; s <= ex.totalSets; s++) {
      logs[day][i][s] = { weight: '', reps: '', done: false }
    }
  })
  sessionStart[day] = null
  clearInterval(timers[day])
  elapsed[day] = ''
  saveLogs()
}

function startSession(day) {
  sessionStart[day] = Date.now()
  timers[day] = setInterval(() => {
    const diff = Math.floor((Date.now() - sessionStart[day]) / 1000)
    const m = Math.floor(diff / 60), s = diff % 60
    elapsed[day] = `${m}:${s.toString().padStart(2, '0')}`
  }, 1000)
}

const active = ref(workouts[0].day)
const activeVideo = ref(null)

function openVideo(video) { activeVideo.value = video }

onUnmounted(() => Object.values(timers).forEach(clearInterval))
</script>

<style scoped>
.workout-tabs { display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap; }

.tab-btn {
  padding: 8px 18px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.tab-btn:hover { border-color: #555; color: var(--text-h); }

.workout-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  border-left-width: 3px;
  border-left-style: solid;
}

.workout-day { font-size: 16px; font-weight: 700; margin-bottom: 4px; }
.workout-focus { font-size: 13px; color: var(--text); }

.header-actions { display: flex; align-items: center; gap: 8px; }

.session-time { font-size: 13px; font-weight: 700; color: var(--accent); font-variant-numeric: tabular-nums; }

.start-session-btn {
  color: #fff;
  border-radius: 8px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.start-session-btn:hover { opacity: 0.85; }

.reset-btn {
  background: var(--surface2);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.reset-btn:hover { color: var(--red); border-color: var(--red); }

.exercises { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }

.exercise-card { padding: 0; overflow: hidden; transition: opacity 0.2s; }
.exercise-card.done { opacity: 0.55; }

.ex-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
  transition: background 0.15s;
}
.ex-header:hover { background: var(--surface2); }

.check-box {
  width: 22px; height: 22px;
  border-radius: 6px;
  border: 2px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-size: 13px; color: #fff; flex-shrink: 0;
  transition: all 0.2s;
}

.ex-info { flex: 1; }
.ex-name { color: var(--text-h); font-weight: 600; font-size: 14px; }
.ex-sets { font-size: 13px; color: var(--text); }
.ex-note { font-size: 12px; color: var(--yellow); background: #eab30820; padding: 3px 8px; border-radius: 6px; }
.ex-pr { font-size: 12px; color: var(--accent); font-weight: 600; white-space: nowrap; }
.expand-icon { font-size: 11px; color: var(--text); flex-shrink: 0; }

.ex-body {
  border-top: 1px solid var(--border);
  padding: 14px 16px;
  background: var(--surface2);
}

.sets-grid {
  display: grid;
  grid-template-columns: 36px 1fr 1fr 40px;
  gap: 6px 8px;
  align-items: center;
  margin-bottom: 10px;
}

.set-header { font-size: 11px; font-weight: 600; color: var(--text); text-transform: uppercase; letter-spacing: 0.5px; }
.set-num { font-size: 13px; font-weight: 700; color: var(--text-h); text-align: center; }

.set-input { padding: 6px 8px; font-size: 13px; text-align: center; }

.set-done-btn {
  width: 32px; height: 32px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.set-done-btn.checked { color: #fff; }

.ex-note-full { font-size: 13px; color: var(--text); background: #6366f115; border-radius: 8px; padding: 8px 12px; border-left: 3px solid #6366f1; }

.video-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  background: #ff000015;
  border: 1px solid #ff000040;
  border-radius: 8px;
  padding: 10px 14px;
  color: #ff4444;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 12px;
  transition: background 0.2s;
  text-align: left;
}
.video-btn:hover { background: #ff000025; }

.yt-icon {
  width: 28px;
  height: 28px;
  background: #ff0000;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 11px;
  flex-shrink: 0;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.modal-box {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  width: 100%;
  max-width: 720px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border);
}

.modal-title { font-weight: 700; color: var(--text-h); font-size: 14px; }

.modal-close {
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 6px;
  width: 30px;
  height: 30px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}
.modal-close:hover { color: var(--red); border-color: var(--red); }

.video-container {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
}
.video-container iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.yt-link {
  display: block;
  text-align: center;
  padding: 12px;
  font-size: 13px;
  color: #ff4444;
  text-decoration: none;
  border-top: 1px solid var(--border);
  transition: background 0.2s;
}
.yt-link:hover { background: var(--surface2); }

.bottom-row {
  display: grid;
  grid-template-columns: 1fr 260px;
  gap: 16px;
  align-items: start;
}

.progress-bar-wrap { }
.progress-label { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px; }
.progress-track { height: 6px; background: var(--surface2); border-radius: 99px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 99px; transition: width 0.3s; }

@media (max-width: 640px) {
  .bottom-row { grid-template-columns: 1fr; }
}
</style>
