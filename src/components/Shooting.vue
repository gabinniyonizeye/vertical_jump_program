<template>
  <div class="page">

    <!-- Header -->
    <div class="sh-header">
      <div>
        <h1>🎯 Shooting</h1>
        <p class="sh-sub">Track every rep. Build a pure stroke.</p>
      </div>
      <button class="reset-all-btn" @click="confirmReset = true">↺ Reset</button>
    </div>

    <!-- Session Summary Bar -->
    <div class="session-bar card">
      <div class="session-stat">
        <span class="session-val">{{ sessionMade }}</span>
        <span class="session-label">Made</span>
      </div>
      <div class="session-divider"></div>
      <div class="session-stat">
        <span class="session-val">{{ sessionAttempts }}</span>
        <span class="session-label">Attempts</span>
      </div>
      <div class="session-divider"></div>
      <div class="session-stat">
        <span class="session-val" :class="pctClass(sessionPct)">{{ sessionPct }}%</span>
        <span class="session-label">Session %</span>
      </div>
      <div class="session-divider"></div>
      <div class="session-stat">
        <span class="session-val accent">{{ sessionStreak }}</span>
        <span class="session-label">🔥 Streak</span>
      </div>
    </div>

    <!-- Drill Cards -->
    <div class="drills-list">
      <div
        v-for="drill in drills"
        :key="drill.id"
        class="drill-card card"
        :class="{ 'drill-hot': drill.streak >= 5 }"
      >
        <!-- Top row -->
        <div class="drill-top">
          <div class="drill-left">
            <span class="drill-icon">{{ drill.icon }}</span>
            <div>
              <div class="drill-name">{{ drill.name }}</div>
              <div class="drill-meta">{{ drill.sets }} sets · {{ drill.reps }} · {{ drill.distance }}</div>
            </div>
          </div>
          <div class="drill-pct-badge" :class="pctClass(drillPct(drill))">
            {{ drillPct(drill) }}%
          </div>
        </div>

        <!-- Shot bar -->
        <div class="shot-bar">
          <div
            class="shot-fill"
            :style="{ width: drillPct(drill) + '%' }"
            :class="pctClass(drillPct(drill))"
          ></div>
        </div>

        <!-- Stats row -->
        <div class="drill-stats">
          <div class="drill-stat">
            <span class="ds-val green">{{ drill.made }}</span>
            <span class="ds-label">Made</span>
          </div>
          <div class="drill-stat">
            <span class="ds-val">{{ drill.attempts }}</span>
            <span class="ds-label">Attempts</span>
          </div>
          <div class="drill-stat">
            <span class="ds-val accent">{{ drill.streak }}</span>
            <span class="ds-label">Streak</span>
          </div>
          <div class="drill-stat">
            <span class="ds-val purple">{{ drill.best }}</span>
            <span class="ds-label">Best</span>
          </div>
        </div>

        <!-- Shot buttons -->
        <div class="shot-btns">
          <button class="shot-btn made" @click="recordShot(drill, true)">
            ✓ Make
          </button>
          <button class="shot-btn miss" @click="recordShot(drill, false)">
            ✗ Miss
          </button>
          <button class="shot-btn undo" @click="undoShot(drill)" :disabled="!drill.history.length">
            ↩
          </button>
        </div>

        <!-- Tip -->
        <div class="drill-tip">💡 {{ drill.tip }}</div>
      </div>
    </div>

    <!-- Confirm Reset Modal -->
    <div v-if="confirmReset" class="modal-overlay" @click.self="confirmReset = false">
      <div class="modal card">
        <div class="modal-icon">↺</div>
        <div class="modal-title">Reset Session?</div>
        <p class="modal-desc">All made/attempt counts will be cleared.</p>
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

const drills = ref([
  {
    id: 1, icon: '🧍', name: 'Form Shooting',
    sets: '4 sets', reps: '10 reps', distance: 'Close range',
    tip: 'One hand only. Focus on wrist snap and follow-through.',
    made: 0, attempts: 0, streak: 0, best: 0, history: [],
  },
  {
    id: 2, icon: '🤲', name: 'Catch & Shoot',
    sets: '4 sets', reps: '8 reps', distance: '3-point line',
    tip: 'Feet set before the ball arrives. Shoot in one fluid motion.',
    made: 0, attempts: 0, streak: 0, best: 0, history: [],
  },
  {
    id: 3, icon: '🏃', name: 'Pull-up Jumper',
    sets: '4 sets', reps: '6 reps', distance: 'Mid-range',
    tip: 'Stop on a dime, gather quickly. Balance before release.',
    made: 0, attempts: 0, streak: 0, best: 0, history: [],
  },
  {
    id: 4, icon: '🌊', name: 'Floaters',
    sets: '3 sets', reps: '8 reps', distance: 'Paint area',
    tip: 'Use your off-hand to shield. Release high over the defender.',
    made: 0, attempts: 0, streak: 0, best: 0, history: [],
  },
  {
    id: 5, icon: '🎯', name: 'Free Throws',
    sets: '5 sets', reps: '10 reps', distance: 'FT line',
    tip: 'Same routine every time. Breathe out on release.',
    made: 0, attempts: 0, streak: 0, best: 0, history: [],
  },
  {
    id: 6, icon: '📍', name: 'Spot Shooting',
    sets: '5 spots', reps: '5 reps each', distance: '3-point line',
    tip: 'Hit all 5 spots: corners, wings, top. Track each spot separately.',
    made: 0, attempts: 0, streak: 0, best: 0, history: [],
  },
  {
    id: 7, icon: '⚡', name: 'Game-Speed Shooting',
    sets: '4 sets', reps: '8 reps', distance: 'Various',
    tip: 'Off screens, off dribble, off cuts. Simulate real game actions.',
    made: 0, attempts: 0, streak: 0, best: 0, history: [],
  },
])

function recordShot(drill, made) {
  drill.attempts++
  drill.history.push(made)
  if (made) {
    drill.made++
    drill.streak++
    if (drill.streak > drill.best) drill.best = drill.streak
  } else {
    drill.streak = 0
  }
}

function undoShot(drill) {
  if (!drill.history.length) return
  const last = drill.history.pop()
  drill.attempts--
  if (last) {
    drill.made--
    // recalculate streak from history
    drill.streak = 0
    for (let i = drill.history.length - 1; i >= 0; i--) {
      if (drill.history[i]) drill.streak++
      else break
    }
  }
}

function drillPct(drill) {
  if (!drill.attempts) return 0
  return Math.round((drill.made / drill.attempts) * 100)
}

function pctClass(pct) {
  if (pct >= 60) return 'pct-hot'
  if (pct >= 40) return 'pct-mid'
  return 'pct-cold'
}

const sessionMade = computed(() => drills.value.reduce((s, d) => s + d.made, 0))
const sessionAttempts = computed(() => drills.value.reduce((s, d) => s + d.attempts, 0))
const sessionPct = computed(() => {
  if (!sessionAttempts.value) return 0
  return Math.round((sessionMade.value / sessionAttempts.value) * 100)
})
const sessionStreak = computed(() => {
  // rolling streak across all drills in order of last shots
  let streak = 0
  const all = drills.value.flatMap(d => d.history)
  for (let i = all.length - 1; i >= 0; i--) {
    if (all[i]) streak++
    else break
  }
  return streak
})

function doReset() {
  drills.value.forEach(d => {
    d.made = 0; d.attempts = 0; d.streak = 0; d.best = 0; d.history = []
  })
  confirmReset.value = false
}
</script>

<style scoped>
.sh-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
}
.sh-header h1 { font-size: 26px; font-weight: 800; color: var(--text-h); margin: 0 0 2px; }
.sh-sub { font-size: 13px; color: var(--text); margin: 0; }

.reset-all-btn {
  background: var(--surface2);
  border: 1.5px solid var(--border);
  color: var(--text);
  border-radius: var(--radius-sm);
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
  flex-shrink: 0;
}
.reset-all-btn:hover { border-color: var(--accent); color: var(--accent); }

/* Session bar */
.session-bar {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 14px 10px;
  margin-bottom: 16px;
  gap: 4px;
}
.session-stat { display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 1; }
.session-val { font-size: 22px; font-weight: 800; color: var(--text-h); }
.session-label { font-size: 10px; color: var(--text); font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
.session-divider { width: 1px; height: 36px; background: var(--border); flex-shrink: 0; }

/* Drill list */
.drills-list { display: flex; flex-direction: column; gap: 12px; }

.drill-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: border-color 0.2s;
}
.drill-card.drill-hot { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent-dim); }

.drill-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.drill-left { display: flex; align-items: center; gap: 10px; }
.drill-icon { font-size: 26px; flex-shrink: 0; }
.drill-name { font-size: 15px; font-weight: 700; color: var(--text-h); }
.drill-meta { font-size: 11px; color: var(--text); margin-top: 1px; }

.drill-pct-badge {
  font-size: 15px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 99px;
  flex-shrink: 0;
}
.pct-hot  { color: var(--green);  background: #22c55e18; }
.pct-mid  { color: var(--yellow); background: #eab30818; }
.pct-cold { color: var(--text);   background: var(--surface2); }

/* Shot bar */
.shot-bar {
  height: 6px;
  background: var(--surface3);
  border-radius: 99px;
  overflow: hidden;
}
.shot-fill {
  height: 100%;
  border-radius: 99px;
  transition: width 0.4s ease;
}
.shot-fill.pct-hot  { background: var(--green); }
.shot-fill.pct-mid  { background: var(--yellow); }
.shot-fill.pct-cold { background: var(--border2); }

/* Stats row */
.drill-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}
.drill-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  background: var(--surface2);
  border-radius: var(--radius-sm);
  padding: 8px 4px;
}
.ds-val { font-size: 18px; font-weight: 800; color: var(--text-h); }
.ds-val.green  { color: var(--green); }
.ds-val.accent { color: var(--accent); }
.ds-val.purple { color: var(--purple2); }
.ds-label { font-size: 10px; color: var(--text); font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }

/* Shot buttons */
.shot-btns { display: flex; gap: 8px; }
.shot-btn {
  flex: 1;
  padding: 12px 8px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 700;
  border: 1.5px solid transparent;
  transition: all 0.15s;
}
.shot-btn.made {
  background: #22c55e22;
  border-color: #22c55e55;
  color: var(--green);
}
.shot-btn.made:hover { background: #22c55e33; border-color: var(--green); }
.shot-btn.made:active { transform: scale(0.96); }

.shot-btn.miss {
  background: #ef444422;
  border-color: #ef444455;
  color: var(--red);
}
.shot-btn.miss:hover { background: #ef444433; border-color: var(--red); }
.shot-btn.miss:active { transform: scale(0.96); }

.shot-btn.undo {
  flex: 0 0 44px;
  background: var(--surface2);
  border-color: var(--border);
  color: var(--text);
  font-size: 16px;
}
.shot-btn.undo:hover:not(:disabled) { border-color: var(--border2); color: var(--text-h); }
.shot-btn.undo:disabled { opacity: 0.35; cursor: not-allowed; }

/* Tip */
.drill-tip {
  font-size: 12px;
  color: var(--text);
  line-height: 1.5;
  padding: 8px 10px;
  background: var(--surface2);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--accent);
}

/* Accent color helpers */
.accent { color: var(--accent); }

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 500;
  padding: 24px;
}
.modal {
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
}
.modal-icon { font-size: 36px; }
.modal-title { font-size: 18px; font-weight: 800; color: var(--text-h); }
.modal-desc { font-size: 13px; color: var(--text); line-height: 1.5; }
.modal-actions { display: flex; gap: 10px; width: 100%; margin-top: 6px; }
.modal-actions .btn-secondary { flex: 1; }
</style>
