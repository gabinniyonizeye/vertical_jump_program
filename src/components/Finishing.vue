<template>
  <div class="page">

    <!-- Header -->
    <div class="fn-header">
      <div>
        <h1>🏀 Finishing</h1>
        <p class="fn-sub">Attack the rim. Score through contact.</p>
      </div>
      <button class="reset-btn" @click="confirmReset = true">↺ Reset</button>
    </div>

    <!-- Session Bar -->
    <div class="session-bar card">
      <div class="session-stat">
        <span class="session-val green">{{ sessionMade }}</span>
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
        <span class="session-label">Finish %</span>
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
              <div class="drill-meta">{{ drill.sets }} sets · {{ drill.reps }} reps · {{ drill.side }}</div>
            </div>
          </div>
          <div class="drill-pct-badge" :class="pctClass(drillPct(drill))">
            {{ drillPct(drill) }}%
          </div>
        </div>

        <!-- Difficulty pip row -->
        <div class="difficulty-row">
          <span class="diff-label">Difficulty</span>
          <div class="diff-pips">
            <span
              v-for="i in 5"
              :key="i"
              class="pip"
              :class="{ filled: i <= drill.difficulty }"
            ></span>
          </div>
          <span class="diff-tag" :class="'diff-' + drill.difficulty">{{ diffLabel(drill.difficulty) }}</span>
        </div>

        <!-- Finish bar -->
        <div class="finish-bar">
          <div
            class="finish-fill"
            :style="{ width: drillPct(drill) + '%' }"
            :class="pctClass(drillPct(drill))"
          ></div>
        </div>

        <!-- Stats -->
        <div class="drill-stats">
          <div class="drill-stat">
            <span class="ds-val green">{{ drill.made }}</span>
            <span class="ds-label">Made</span>
          </div>
          <div class="drill-stat">
            <span class="ds-val red">{{ drill.attempts - drill.made }}</span>
            <span class="ds-label">Missed</span>
          </div>
          <div class="drill-stat">
            <span class="ds-val">{{ drill.attempts }}</span>
            <span class="ds-label">Total</span>
          </div>
          <div class="drill-stat">
            <span class="ds-val accent">{{ drill.streak }}</span>
            <span class="ds-label">Streak</span>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="shot-btns">
          <button class="shot-btn made" @click="record(drill, true)">✓ Made</button>
          <button class="shot-btn miss" @click="record(drill, false)">✗ Missed</button>
          <button class="shot-btn undo" @click="undo(drill)" :disabled="!drill.history.length">↩</button>
        </div>

        <!-- Cue -->
        <div class="drill-tip">💡 {{ drill.cue }}</div>
      </div>
    </div>

    <!-- Reset Modal -->
    <div v-if="confirmReset" class="modal-overlay" @click.self="confirmReset = false">
      <div class="modal card">
        <div class="modal-icon">↺</div>
        <div class="modal-title">Reset Session?</div>
        <p class="modal-desc">All finish counts will be cleared.</p>
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
    id: 1, icon: '🏃', name: 'Regular Layups',
    sets: 4, reps: 10, side: 'Both sides',
    difficulty: 1,
    cue: 'Two-step gather. Soft touch off the glass. Use the backboard.',
    made: 0, attempts: 0, streak: 0, best: 0, history: [],
  },
  {
    id: 2, icon: '🔄', name: 'Reverse Layups',
    sets: 4, reps: 8, side: 'Both sides',
    difficulty: 2,
    cue: 'Go under the basket. Shield the ball with your body from the defender.',
    made: 0, attempts: 0, streak: 0, best: 0, history: [],
  },
  {
    id: 3, icon: '✋', name: 'Weak-Hand Finishes',
    sets: 4, reps: 10, side: 'Weak hand only',
    difficulty: 3,
    cue: 'Slow down and focus on control. Repetition builds the muscle memory.',
    made: 0, attempts: 0, streak: 0, best: 0, history: [],
  },
  {
    id: 4, icon: '👣', name: 'Euro Step',
    sets: 4, reps: 8, side: 'Both sides',
    difficulty: 3,
    cue: 'Two legal steps in different directions. Sell the first step hard.',
    made: 0, attempts: 0, streak: 0, best: 0, history: [],
  },
  {
    id: 5, icon: '🌊', name: 'Floater',
    sets: 3, reps: 8, side: 'Both sides',
    difficulty: 4,
    cue: 'Release early before the shot-blocker. High arc, soft touch.',
    made: 0, attempts: 0, streak: 0, best: 0, history: [],
  },
  {
    id: 6, icon: '💥', name: 'Contact Finish',
    sets: 3, reps: 6, side: 'Both sides',
    difficulty: 5,
    cue: 'Absorb contact through your core. Stay balanced and finish strong.',
    made: 0, attempts: 0, streak: 0, best: 0, history: [],
  },
  {
    id: 7, icon: '🌀', name: 'Spin Finish',
    sets: 3, reps: 6, side: 'Both sides',
    difficulty: 4,
    cue: 'Tight spin, keep the ball close. Gather quickly after the spin.',
    made: 0, attempts: 0, streak: 0, best: 0, history: [],
  },
])

function record(drill, made) {
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

function undo(drill) {
  if (!drill.history.length) return
  const last = drill.history.pop()
  drill.attempts--
  if (last) {
    drill.made--
    drill.streak = 0
    for (let i = drill.history.length - 1; i >= 0; i--) {
      if (drill.history[i]) drill.streak++
      else break
    }
  }
}

function drillPct(drill) {
  return drill.attempts ? Math.round((drill.made / drill.attempts) * 100) : 0
}

function pctClass(pct) {
  if (pct >= 60) return 'pct-hot'
  if (pct >= 40) return 'pct-mid'
  return 'pct-cold'
}

function diffLabel(d) {
  return ['', 'Beginner', 'Easy', 'Medium', 'Hard', 'Elite'][d]
}

const sessionMade      = computed(() => drills.value.reduce((s, d) => s + d.made, 0))
const sessionAttempts  = computed(() => drills.value.reduce((s, d) => s + d.attempts, 0))
const sessionPct       = computed(() => sessionAttempts.value ? Math.round((sessionMade.value / sessionAttempts.value) * 100) : 0)
const sessionStreak    = computed(() => {
  const all = drills.value.flatMap(d => d.history)
  let streak = 0
  for (let i = all.length - 1; i >= 0; i--) {
    if (all[i]) streak++
    else break
  }
  return streak
})

function doReset() {
  drills.value.forEach(d => { d.made = 0; d.attempts = 0; d.streak = 0; d.best = 0; d.history = [] })
  confirmReset.value = false
}
</script>

<style scoped>
.fn-header {
  display: flex; align-items: flex-start;
  justify-content: space-between; margin-bottom: 14px;
}
.fn-header h1 { font-size: 26px; font-weight: 800; color: var(--text-h); margin: 0 0 2px; }
.fn-sub { font-size: 13px; color: var(--text); margin: 0; }

.reset-btn {
  background: var(--surface2); border: 1.5px solid var(--border);
  color: var(--text); border-radius: var(--radius-sm);
  padding: 8px 14px; font-size: 13px; font-weight: 600;
  transition: all 0.2s; flex-shrink: 0;
}
.reset-btn:hover { border-color: var(--accent); color: var(--accent); }

/* Session bar */
.session-bar {
  display: flex; align-items: center;
  justify-content: space-around;
  padding: 14px 10px; margin-bottom: 16px; gap: 4px;
}
.session-stat { display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 1; }
.session-val { font-size: 22px; font-weight: 800; color: var(--text-h); }
.session-val.green  { color: var(--green); }
.session-val.accent { color: var(--accent); }
.session-label { font-size: 10px; color: var(--text); font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; }
.session-divider { width: 1px; height: 36px; background: var(--border); flex-shrink: 0; }

/* Drill list */
.drills-list { display: flex; flex-direction: column; gap: 12px; }

.drill-card { display: flex; flex-direction: column; gap: 10px; transition: border-color 0.2s, box-shadow 0.2s; }
.drill-card.drill-hot { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent-dim); }

.drill-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.drill-left { display: flex; align-items: center; gap: 10px; }
.drill-icon { font-size: 28px; flex-shrink: 0; }
.drill-name { font-size: 15px; font-weight: 700; color: var(--text-h); }
.drill-meta { font-size: 11px; color: var(--text); margin-top: 1px; }

.drill-pct-badge { font-size: 15px; font-weight: 800; padding: 4px 10px; border-radius: 99px; flex-shrink: 0; }
.pct-hot  { color: var(--green);  background: #22c55e18; }
.pct-mid  { color: var(--yellow); background: #eab30818; }
.pct-cold { color: var(--text);   background: var(--surface2); }

/* Difficulty */
.difficulty-row { display: flex; align-items: center; gap: 8px; }
.diff-label { font-size: 11px; color: var(--text); font-weight: 600; }
.diff-pips { display: flex; gap: 3px; }
.pip {
  width: 10px; height: 10px; border-radius: 2px;
  background: var(--surface3); border: 1px solid var(--border);
  transition: background 0.2s;
}
.pip.filled { background: var(--accent); border-color: var(--accent); }
.diff-tag { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 99px; margin-left: auto; }
.diff-1 { color: var(--green);  background: #22c55e18; }
.diff-2 { color: #4ade80;       background: #4ade8018; }
.diff-3 { color: var(--yellow); background: #eab30818; }
.diff-4 { color: var(--accent); background: var(--accent-dim); }
.diff-5 { color: var(--red);    background: #ef444418; }

/* Finish bar */
.finish-bar { height: 6px; background: var(--surface3); border-radius: 99px; overflow: hidden; }
.finish-fill { height: 100%; border-radius: 99px; transition: width 0.4s ease; }
.finish-fill.pct-hot  { background: var(--green); }
.finish-fill.pct-mid  { background: var(--yellow); }
.finish-fill.pct-cold { background: var(--border2); }

/* Stats */
.drill-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.drill-stat {
  display: flex; flex-direction: column; align-items: center; gap: 2px;
  background: var(--surface2); border-radius: var(--radius-sm); padding: 8px 4px;
}
.ds-val { font-size: 18px; font-weight: 800; color: var(--text-h); }
.ds-val.green  { color: var(--green); }
.ds-val.red    { color: var(--red); }
.ds-val.accent { color: var(--accent); }
.ds-label { font-size: 10px; color: var(--text); font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }

/* Buttons */
.shot-btns { display: flex; gap: 8px; }
.shot-btn {
  flex: 1; padding: 12px 8px; border-radius: var(--radius-sm);
  font-size: 14px; font-weight: 700;
  border: 1.5px solid transparent; transition: all 0.15s;
}
.shot-btn.made  { background: #22c55e22; border-color: #22c55e55; color: var(--green); }
.shot-btn.made:hover  { background: #22c55e33; border-color: var(--green); }
.shot-btn.made:active { transform: scale(0.96); }
.shot-btn.miss  { background: #ef444422; border-color: #ef444455; color: var(--red); }
.shot-btn.miss:hover  { background: #ef444433; border-color: var(--red); }
.shot-btn.miss:active { transform: scale(0.96); }
.shot-btn.undo  { flex: 0 0 44px; background: var(--surface2); border-color: var(--border); color: var(--text); font-size: 16px; }
.shot-btn.undo:hover:not(:disabled) { border-color: var(--border2); color: var(--text-h); }
.shot-btn.undo:disabled { opacity: 0.35; cursor: not-allowed; }

/* Tip */
.drill-tip {
  font-size: 12px; color: var(--text); line-height: 1.5;
  padding: 8px 10px; background: var(--surface2);
  border-radius: var(--radius-sm); border-left: 3px solid var(--accent);
}

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
.modal-icon { font-size: 36px; }
.modal-title { font-size: 18px; font-weight: 800; color: var(--text-h); }
.modal-desc { font-size: 13px; color: var(--text); line-height: 1.5; }
.modal-actions { display: flex; gap: 10px; width: 100%; margin-top: 6px; }
.modal-actions .btn-secondary { flex: 1; }
</style>
