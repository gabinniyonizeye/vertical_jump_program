<template>
  <div class="srp-wrap">

    <!-- Header -->
    <div class="card srp-header">
      <div class="header-row">
        <div>
          <div class="header-title">🎯 Shooting Range Program</div>
          <div class="header-sub">6-week kinetic chain program — add 3–5 ft to your range</div>
        </div>
        <div class="day-badge">
          <div class="badge-val">Wk {{ currentWeek }}</div>
          <div class="badge-lbl">of 6</div>
        </div>
      </div>
      <div class="progress-bar"><div class="progress-fill" :style="{ width: (completedSessions.length / 18 * 100) + '%' }"></div></div>
      <div class="week-nav">
        <button class="day-btn" @click="currentWeek = Math.max(1, currentWeek - 1)">‹ Prev</button>
        <span class="phase-pill" :style="{ background: currentPhase.color + '22', color: currentPhase.color, border: '1px solid ' + currentPhase.color + '55' }">
          {{ currentPhase.icon }} {{ currentPhase.label }}
        </span>
        <button class="day-btn" @click="currentWeek = Math.min(6, currentWeek + 1)">Next ›</button>
      </div>
    </div>

    <!-- Science Banner -->
    <div class="card science-banner">
      <div class="sci-title">⚡ The Kinetic Chain — Why Legs = Range</div>
      <div class="sci-steps">
        <div class="sci-step"><span class="ss-num">1</span><div><strong>Leg drive</strong> — 60–70% of shot power originates from hip extension</div></div>
        <div class="sci-arrow">↓</div>
        <div class="sci-step"><span class="ss-num">2</span><div><strong>Core transfer</strong> — stiff core transmits force upward without energy leak</div></div>
        <div class="sci-arrow">↓</div>
        <div class="sci-step"><span class="ss-num">3</span><div><strong>Shoulder elevation</strong> — deltoid + upper trap launch the ball upward</div></div>
        <div class="sci-arrow">↓</div>
        <div class="sci-step"><span class="ss-num">4</span><div><strong>Elbow extension</strong> — triceps add final velocity at release</div></div>
        <div class="sci-arrow">↓</div>
        <div class="sci-step"><span class="ss-num">5</span><div><strong>Wrist snap</strong> — forearm flexors control arc and backspin</div></div>
      </div>
      <div class="sci-note">🏀 Train every link. Weak link = short range.</div>
    </div>

    <!-- Phase Focus -->
    <div class="card phase-focus">
      <div class="pf-left">
        <div class="pf-icon">{{ currentPhase.icon }}</div>
        <div>
          <div class="pf-name">{{ currentPhase.label }}</div>
          <div class="pf-desc">{{ currentPhase.focus }}</div>
        </div>
      </div>
      <div class="pf-sessions">{{ currentPhase.sessions }}<span>sessions/wk</span></div>
    </div>

    <!-- Sessions for current week -->
    <div v-for="session in currentWeekSessions" :key="session.id" class="card block-card">
      <div class="block-header" :style="{ borderColor: session.color }">
        <div class="block-letter" :style="{ background: session.color }">{{ session.day }}</div>
        <div>
          <div class="block-title">{{ session.name }}</div>
          <div class="block-sub">{{ session.duration }} · {{ session.focus }}</div>
        </div>
        <button class="session-done-btn" :class="{ done: completedSessions.includes(session.id) }" @click="toggleSession(session.id)">
          {{ completedSessions.includes(session.id) ? '✅' : '○' }}
        </button>
      </div>

      <div class="ex-list">
        <div v-for="ex in session.exercises" :key="ex.name" class="ex-card" :class="{ done: isDone(session.id, ex.name) }">
          <div class="ex-top">
            <div class="ex-check" :class="{ done: isDone(session.id, ex.name) }" @click="toggleEx(session.id, ex.name)">
              {{ isDone(session.id, ex.name) ? '✓' : '○' }}
            </div>
            <div class="ex-body">
              <div class="ex-name">{{ ex.name }}</div>
              <div class="ex-dose">{{ ex.sets }} × {{ ex.reps }}</div>
            </div>
            <span class="ex-tag" :style="{ background: ex.tagColor + '22', color: ex.tagColor }">{{ ex.tag }}</span>
          </div>

          <!-- Rep/Timer + Set counter -->
          <div class="rep-counter">
            <template v-if="isTimeBased(ex.reps)">
              <div class="ex-timer" :class="{ running: getExTimer(session.id, ex.name).running, done: getExTimer(session.id, ex.name).done }">
                <span class="et-time">{{ timerDisplay(getExTimer(session.id, ex.name).total ? getExTimer(session.id, ex.name) : { remaining: parseTargetSecs(ex.reps) || 0, total: parseTargetSecs(ex.reps) || 1 }) }}</span>
                <button v-if="!getExTimer(session.id, ex.name).running && !getExTimer(session.id, ex.name).done" @click.stop="startExTimer(session.id, ex.name, parseTargetSecs(ex.reps))">▶</button>
                <button v-if="getExTimer(session.id, ex.name).running" @click.stop="pauseExTimer(session.id, ex.name)">⏸</button>
                <button @click.stop="resetExTimer(session.id, ex.name, parseTargetSecs(ex.reps))">↺</button>
                <span class="et-label">{{ getExTimer(session.id, ex.name).done ? '✅ Done!' : getExTimer(session.id, ex.name).running ? 'Hold...' : 'Timer' }}</span>
              </div>
            </template>
            <template v-else>
              <button class="rep-tap" @click.stop="tapRep(session.id, ex.name)">
                <span class="rep-num" :class="{ reached: parseTargetReps(ex.reps) && getRepCount(session.id, ex.name) >= parseTargetReps(ex.reps) }">{{ getRepCount(session.id, ex.name) }}</span>
                <span class="rep-target" v-if="parseTargetReps(ex.reps)"> / {{ parseTargetReps(ex.reps) }}</span>
              </button>
              <button class="rep-reset" @click.stop="resetReps(session.id, ex.name)">↺</button>
              <span class="rep-label">Tap to count</span>
            </template>
            <div class="set-counter">
              <button class="set-btn" @click.stop="addSet(session.id, ex.name)">+Set</button>
              <span class="set-done">{{ getSetState(session.id, ex.name).done }}</span>
              <button class="rep-reset" @click.stop="resetSets(session.id, ex.name)">↺</button>
            </div>
          </div>

          <div class="ex-why">💡 {{ ex.why }}</div>

          <!-- Rest timer -->
          <div v-if="isDone(session.id, ex.name)" class="inline-rest" :class="{ running: getRestTimer(session.id, ex.name).running, finished: getRestTimer(session.id, ex.name).done }">
            <div class="irt-top">
              <span class="irt-label">{{ getRestTimer(session.id, ex.name).done ? '✅ Rest Done!' : getRestTimer(session.id, ex.name).running ? '⏱ Resting...' : '⏸ Rest Timer' }}</span>
              <span class="irt-time">{{ timerDisplay(getRestTimer(session.id, ex.name)) }}</span>
            </div>
            <div class="irt-bar"><div class="irt-fill" :style="{ width: restProgress(getRestTimer(session.id, ex.name)) + '%', background: getRestTimer(session.id, ex.name).done ? '#22c55e' : getRestTimer(session.id, ex.name).running ? '#f97316' : '#6366f1' }"></div></div>
            <div class="irt-btns">
              <button v-if="!getRestTimer(session.id, ex.name).running && !getRestTimer(session.id, ex.name).done" @click.stop="startRest(session.id, ex.name, ex.restSecs || 90)">▶ Start</button>
              <button v-if="getRestTimer(session.id, ex.name).running" @click.stop="pauseRest(session.id, ex.name)">⏸ Pause</button>
              <button @click.stop="resetRest(session.id, ex.name, 90)">↺</button>
              <button @click.stop="setRest(session.id, ex.name, 60)">60s</button>
              <button @click.stop="setRest(session.id, ex.name, 90)">90s</button>
              <button @click.stop="setRest(session.id, ex.name, 120)">2m</button>
              <button @click.stop="setRest(session.id, ex.name, 180)">3m</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Roadmap -->
    <div class="card section-card">
      <div class="section-title">🗺️ 6-Week Roadmap</div>
      <div class="roadmap">
        <div v-for="p in phases" :key="p.weeks" class="roadmap-row" :class="{ active: currentPhase === p }">
          <div class="rm-dot" :style="{ background: currentPhase === p ? p.color : 'var(--border)' }"></div>
          <div class="rm-body">
            <div class="rm-top">
              <span class="rm-label">{{ p.icon }} {{ p.label }}</span>
              <span class="rm-days">Weeks {{ p.weeks }}</span>
            </div>
            <div class="rm-desc">{{ p.roadmapDesc }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Science card -->
    <div class="card science-card">
      <div class="sci-title2">📚 Research Behind This Program</div>
      <div class="sci-list">
        <div class="sci-item"><div class="sci-dot"></div><div><strong>Leg drive (60–70%):</strong> Elliot et al. (1988) showed the lower body contributes the majority of shooting velocity via ground reaction force.</div></div>
        <div class="sci-item"><div class="sci-dot"></div><div><strong>Push Press:</strong> Transfers triple extension (ankle/knee/hip) directly to overhead force — same pattern as a jump shot.</div></div>
        <div class="sci-item"><div class="sci-dot"></div><div><strong>Med-ball throws:</strong> Behm & Sale (1993) — ballistic training at intended velocity produces greater power gains than slow strength training alone.</div></div>
        <div class="sci-item"><div class="sci-dot"></div><div><strong>Wrist/forearm:</strong> Wrist flexor strength correlates with shooting arc consistency (Okazaki et al., 2015).</div></div>
        <div class="sci-item"><div class="sci-dot"></div><div><strong>Single-leg work:</strong> Jump shots are single-leg dominant off the dribble — unilateral training directly transfers.</div></div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const LS = 'shooting_range_state'
const currentWeek = ref(1)
const completedSessions = ref([])
const doneExercises = ref({})
const repCounters = ref({})
const setCounters = ref({})
const restTimers = ref({})
const exTimers = ref({})

onMounted(() => {
  try {
    const s = JSON.parse(localStorage.getItem(LS) || '{}')
    if (s.currentWeek) currentWeek.value = s.currentWeek
    if (s.completedSessions) completedSessions.value = s.completedSessions
    if (s.doneExercises) doneExercises.value = s.doneExercises
    if (s.repCounters) repCounters.value = s.repCounters
    if (s.setCounters) setCounters.value = s.setCounters
  } catch {}
})
watch([currentWeek, completedSessions, doneExercises, repCounters, setCounters], () => {
  localStorage.setItem(LS, JSON.stringify({
    currentWeek: currentWeek.value,
    completedSessions: completedSessions.value,
    doneExercises: doneExercises.value,
    repCounters: repCounters.value,
    setCounters: setCounters.value,
  }))
}, { deep: true })

const phases = [
  { weeks: '1–2', label: 'Phase 1: Strength', icon: '💪', color: '#3b82f6', sessions: 3,
    focus: 'Build the base. Heavy compound lifts. Perfect form over load.',
    roadmapDesc: '3 sessions/week. Focus on squat depth, hip hinge, and push press lockout. No rushing.' },
  { weeks: '3–4', label: 'Phase 2: Power', icon: '⚡', color: '#f97316', sessions: 3,
    focus: 'Convert strength to explosive force. Med-ball and jump work.',
    roadmapDesc: '3 sessions/week. Ballistic training — move the weight FAST. Rest fully between sets.' },
  { weeks: '5–6', label: 'Phase 3: Transfer', icon: '🎯', color: '#a855f7', sessions: 3,
    focus: 'Basketball-specific. Single-leg, rotational, shot-pattern movements.',
    roadmapDesc: '3 sessions/week. Every exercise mimics the shooting motion. Finish with wrist work.' },
]

const currentPhase = computed(() => {
  if (currentWeek.value <= 2) return phases[0]
  if (currentWeek.value <= 4) return phases[1]
  return phases[2]
})

const allSessions = [
  // ── PHASE 1: STRENGTH (Weeks 1–2) ──
  {
    id: 'w1-a', week: 1, day: 'A', name: 'Lower Power Base', color: '#3b82f6',
    duration: '45 min', focus: 'Legs + Hip Extension',
    exercises: [
      { name: 'Back Squat', sets: '4', reps: '6', restSecs: 180, tag: 'Legs', tagColor: '#3b82f6',
        why: 'Builds the leg drive that generates 60-70% of shot power. Deep squat = full hip extension = more force.' },
      { name: 'Romanian Deadlift', sets: '3', reps: '8', restSecs: 120, tag: 'Posterior', tagColor: '#6366f1',
        why: 'Hamstring + glute loading. These muscles decelerate and re-accelerate in the shot dip.' },
      { name: 'Hip Thrust', sets: '3', reps: '10', restSecs: 90, tag: 'Glutes', tagColor: '#f97316',
        why: 'Isolated glute max activation. Glutes are the primary engine of upward force in a jump shot.' },
      { name: 'Calf Raise', sets: '3', reps: '15', restSecs: 60, tag: 'Ankles', tagColor: '#22c55e',
        why: 'Ankle plantar flexion is the final ground contact force — adds inches to your release height.' },
    ]
  },
  {
    id: 'w1-b', week: 1, day: 'B', name: 'Upper Shooting Chain', color: '#3b82f6',
    duration: '40 min', focus: 'Shoulders + Triceps + Wrist',
    exercises: [
      { name: 'Push Press', sets: '4', reps: '5', restSecs: 180, tag: 'Full Chain', tagColor: '#f97316',
        why: 'THE shooting range exercise. Uses leg drive → core → shoulder → tricep — the exact kinetic chain of a jump shot.' },
      { name: 'Overhead Tricep Extension', sets: '3', reps: '10', restSecs: 90, tag: 'Triceps', tagColor: '#a855f7',
        why: 'Triceps provide the final velocity burst at ball release. Weak triceps = short shots.' },
      { name: 'Wrist Curl (both directions)', sets: '3', reps: '15', restSecs: 60, tag: 'Wrist', tagColor: '#22c55e',
        why: 'Wrist flexor strength controls arc and backspin. Okazaki et al. (2015) linked wrist strength to shooting consistency.' },
      { name: 'Dead Hang', sets: '3', reps: '30 sec', restSecs: 60, tag: 'Grip', tagColor: '#06b6d4',
        why: 'Grip + shoulder stability. A loose grip at release kills arc control.' },
    ]
  },
  {
    id: 'w1-c', week: 1, day: 'C', name: 'Core Transfer', color: '#3b82f6',
    duration: '35 min', focus: 'Anti-rotation + Stiffness',
    exercises: [
      { name: 'Pallof Press', sets: '3', reps: '12', restSecs: 60, tag: 'Anti-Rot', tagColor: '#6366f1',
        why: 'Anti-rotation core stiffness. A loose core leaks the leg power before it reaches your arms.' },
      { name: 'Dead Bug', sets: '3', reps: '10', restSecs: 60, tag: 'Deep Core', tagColor: '#3b82f6',
        why: 'TVA activation — the deep core that stabilizes the spine during the shooting motion.' },
      { name: 'Plank', sets: '3', reps: '45 sec', restSecs: 60, tag: 'Endurance', tagColor: '#22c55e',
        why: 'Core endurance. Late-game shots require the same core stiffness as first-quarter shots.' },
      { name: 'Bulgarian Split Squat', sets: '3', reps: '8', restSecs: 90, tag: 'Unilateral', tagColor: '#f97316',
        why: 'Off-the-dribble shots are single-leg. Unilateral strength directly transfers to pull-up jumpers.' },
    ]
  },
  // Week 2 = same sessions as week 1 (progressive overload — add weight)
  { id: 'w2-a', week: 2, day: 'A', name: 'Lower Power Base +', color: '#3b82f6', duration: '45 min', focus: 'Legs + Hip Extension (+5% load)',
    exercises: [
      { name: 'Back Squat', sets: '4', reps: '5', restSecs: 180, tag: 'Legs', tagColor: '#3b82f6', why: 'Add 5% more weight than week 1. Same depth, same control.' },
      { name: 'Romanian Deadlift', sets: '4', reps: '6', restSecs: 120, tag: 'Posterior', tagColor: '#6366f1', why: 'Extra set this week. Hamstring loading is cumulative.' },
      { name: 'Hip Thrust', sets: '4', reps: '8', restSecs: 90, tag: 'Glutes', tagColor: '#f97316', why: 'Heavier load. Squeeze hard at the top — that is your shot extension.' },
      { name: 'Single-Leg Calf Raise', sets: '3', reps: '12', restSecs: 60, tag: 'Ankles', tagColor: '#22c55e', why: 'Unilateral progression from week 1.' },
    ]
  },
  { id: 'w2-b', week: 2, day: 'B', name: 'Upper Shooting Chain +', color: '#3b82f6', duration: '40 min', focus: 'Shoulders + Triceps (+load)',
    exercises: [
      { name: 'Push Press', sets: '5', reps: '4', restSecs: 180, tag: 'Full Chain', tagColor: '#f97316', why: 'Heavier and more sets. Drive through the heels, lock out overhead.' },
      { name: 'Close-Grip Bench Press', sets: '3', reps: '8', restSecs: 120, tag: 'Triceps', tagColor: '#a855f7', why: 'Tricep mass builder. More tricep strength = more ball velocity at release.' },
      { name: 'Wrist Curl (both directions)', sets: '3', reps: '20', restSecs: 60, tag: 'Wrist', tagColor: '#22c55e', why: 'More reps this week — wrist endurance for late-game shooting.' },
      { name: 'Farmer Carry', sets: '3', reps: '40 sec', restSecs: 60, tag: 'Grip', tagColor: '#06b6d4', why: 'Grip + trap strength. Traps stabilize the shoulder during the shot arc.' },
    ]
  },
  { id: 'w2-c', week: 2, day: 'C', name: 'Core Transfer +', color: '#3b82f6', duration: '35 min', focus: 'Anti-rotation + Unilateral',
    exercises: [
      { name: 'Pallof Press', sets: '4', reps: '10', restSecs: 60, tag: 'Anti-Rot', tagColor: '#6366f1', why: 'Extra set. Increase band/cable resistance.' },
      { name: 'Dead Bug', sets: '3', reps: '12', restSecs: 60, tag: 'Deep Core', tagColor: '#3b82f6', why: 'More reps, slower tempo. 3 sec per rep.' },
      { name: 'Side Plank', sets: '3', reps: '40 sec', restSecs: 60, tag: 'Lateral', tagColor: '#22c55e', why: 'Lateral core for side-step jumpers and fadeaways.' },
      { name: 'Bulgarian Split Squat', sets: '4', reps: '8', restSecs: 90, tag: 'Unilateral', tagColor: '#f97316', why: 'Extra set. Add load if week 1 felt easy.' },
    ]
  },
  // ── PHASE 2: POWER (Weeks 3–4) ──
  {
    id: 'w3-a', week: 3, day: 'A', name: 'Lower Body Power', color: '#f97316',
    duration: '45 min', focus: 'Explosive Leg Drive',
    exercises: [
      { name: 'Jump Squat', sets: '5', reps: '4', restSecs: 180, tag: 'Explosive', tagColor: '#f97316',
        why: 'Converts squat strength to explosive power. Land soft, explode immediately. This IS your shot jump.' },
      { name: 'Box Jump', sets: '4', reps: '4', restSecs: 180, tag: 'Reactive', tagColor: '#ef4444',
        why: 'Reactive strength — the stretch-shortening cycle used in a quick-release jump shot.' },
      { name: 'Single-Leg Jump Squat', sets: '3', reps: '5', restSecs: 120, tag: 'Unilateral', tagColor: '#a855f7',
        why: 'Pull-up jumpers off one leg. Train the exact takeoff pattern.' },
      { name: 'Broad Jump', sets: '4', reps: '4', restSecs: 120, tag: 'Power', tagColor: '#eab308',
        why: 'Horizontal power transfers to vertical. Stick each landing — trains deceleration control.' },
    ]
  },
  {
    id: 'w3-b', week: 3, day: 'B', name: 'Med-Ball Power', color: '#f97316',
    duration: '40 min', focus: 'Rotational + Overhead Power',
    exercises: [
      { name: 'Med-Ball Rotational Throw', sets: '4', reps: '6', restSecs: 120, tag: 'Rotational', tagColor: '#f97316',
        why: 'Behm & Sale (1993): ballistic training at intended velocity > slow strength training for power. Mimics shot rotation.' },
      { name: 'Med-Ball Chest Pass (wall)', sets: '4', reps: '8', restSecs: 90, tag: 'Push Power', tagColor: '#3b82f6',
        why: 'Explosive horizontal push — same muscle pattern as the shooting push. Throw as hard as possible.' },
      { name: 'Med-Ball Overhead Slam', sets: '3', reps: '6', restSecs: 90, tag: 'Full Chain', tagColor: '#a855f7',
        why: 'Full kinetic chain from legs through core to arms. Develops the overhead power needed for deep 3s.' },
      { name: 'Plyometric Push-up', sets: '3', reps: '6', restSecs: 90, tag: 'Upper Explosive', tagColor: '#22c55e',
        why: 'Explosive tricep + chest power. Hands leave the ground = maximum rate of force development.' },
    ]
  },
  {
    id: 'w3-c', week: 3, day: 'C', name: 'Power + Core', color: '#f97316',
    duration: '35 min', focus: 'Rotational Core Power',
    exercises: [
      { name: 'Med-Ball Rotational Slam', sets: '3', reps: '6', restSecs: 90, tag: 'Rotational', tagColor: '#f97316',
        why: 'Oblique power — the rotation in your shot comes from here. Slam with full body rotation.' },
      { name: 'Cable/Band Rotational Press', sets: '3', reps: '8', restSecs: 90, tag: 'Transfer', tagColor: '#6366f1',
        why: 'Directly mimics the shooting motion under resistance. Rotate and press at the same time.' },
      { name: 'Jump Lunge', sets: '3', reps: '6', restSecs: 90, tag: 'Explosive', tagColor: '#ef4444',
        why: 'Explosive single-leg power. Develops the push-off for step-back and pull-up jumpers.' },
      { name: 'Wrist Snap Drill (light ball)', sets: '3', reps: '20', restSecs: 45, tag: 'Wrist', tagColor: '#22c55e',
        why: 'Isolated wrist flexion under fatigue. Trains the follow-through snap that controls arc.' },
    ]
  },
  { id: 'w4-a', week: 4, day: 'A', name: 'Lower Body Power +', color: '#f97316', duration: '45 min', focus: 'Max Explosive Output',
    exercises: [
      { name: 'Jump Squat', sets: '5', reps: '5', restSecs: 180, tag: 'Explosive', tagColor: '#f97316', why: 'One more rep per set. Focus on maximum height every jump.' },
      { name: 'Depth Jump', sets: '4', reps: '4', restSecs: 180, tag: 'Reactive', tagColor: '#ef4444', why: 'Step off box, land, immediately jump. Minimal ground contact = maximum elastic energy.' },
      { name: 'Single-Leg Hop', sets: '3', reps: '6', restSecs: 120, tag: 'Unilateral', tagColor: '#a855f7', why: 'Continuous single-leg hops. Builds the reactive strength for quick-release shots.' },
      { name: 'Vertical Jump Test', sets: '3', reps: '3', restSecs: 120, tag: 'Test', tagColor: '#eab308', why: 'Measure your progress. Mark the wall. Compare to week 1.' },
    ]
  },
  { id: 'w4-b', week: 4, day: 'B', name: 'Med-Ball Power +', color: '#f97316', duration: '40 min', focus: 'Max Velocity Throws',
    exercises: [
      { name: 'Med-Ball Rotational Throw', sets: '5', reps: '5', restSecs: 120, tag: 'Rotational', tagColor: '#f97316', why: 'Heavier ball or more reps. Throw with maximum intent every rep.' },
      { name: 'Med-Ball Chest Pass (partner)', sets: '4', reps: '8', restSecs: 90, tag: 'Push Power', tagColor: '#3b82f6', why: 'Partner adds resistance. Catch and immediately throw back — reactive power.' },
      { name: 'Med-Ball Overhead Slam', sets: '4', reps: '6', restSecs: 90, tag: 'Full Chain', tagColor: '#a855f7', why: 'Extra set. Heavier ball if available.' },
      { name: 'Clap Push-up', sets: '3', reps: '5', restSecs: 90, tag: 'Upper Explosive', tagColor: '#22c55e', why: 'Maximum upper body rate of force development. Every rep = max effort.' },
    ]
  },
  { id: 'w4-c', week: 4, day: 'C', name: 'Power + Core +', color: '#f97316', duration: '35 min', focus: 'Rotational Power Peak',
    exercises: [
      { name: 'Med-Ball Rotational Slam', sets: '4', reps: '6', restSecs: 90, tag: 'Rotational', tagColor: '#f97316', why: 'Extra set. Heavier ball. Maximum rotation speed.' },
      { name: 'Cable/Band Rotational Press', sets: '4', reps: '8', restSecs: 90, tag: 'Transfer', tagColor: '#6366f1', why: 'More resistance. This is the closest gym exercise to the actual shooting motion.' },
      { name: 'Jump Lunge', sets: '4', reps: '6', restSecs: 90, tag: 'Explosive', tagColor: '#ef4444', why: 'Extra set. Explode as high as possible on each rep.' },
      { name: 'Wrist Snap Drill', sets: '3', reps: '25', restSecs: 45, tag: 'Wrist', tagColor: '#22c55e', why: 'More reps. Wrist endurance for late-game deep shots.' },
    ]
  },
  // ── PHASE 3: TRANSFER (Weeks 5–6) ──
  {
    id: 'w5-a', week: 5, day: 'A', name: 'Shot-Pattern Legs', color: '#a855f7',
    duration: '45 min', focus: 'Basketball-Specific Takeoff',
    exercises: [
      { name: 'Single-Leg Jump Squat', sets: '4', reps: '5', restSecs: 120, tag: 'Unilateral', tagColor: '#a855f7',
        why: 'The exact takeoff of a pull-up jumper. Land, reset, explode. This is your shot.' },
      { name: 'Step-Back Jump Squat', sets: '4', reps: '4', restSecs: 120, tag: 'Specific', tagColor: '#f97316',
        why: 'Step back, plant, explode up. Trains the step-back jumper takeoff pattern directly.' },
      { name: 'Lateral Bound to Jump', sets: '3', reps: '5', restSecs: 90, tag: 'Lateral', tagColor: '#3b82f6',
        why: 'Side-step jumper. Lateral momentum converted to vertical — exactly what a side-step 3 requires.' },
      { name: 'Depth Jump to Shot Sim', sets: '3', reps: '4', restSecs: 120, tag: 'Reactive', tagColor: '#ef4444',
        why: 'Drop, land, immediately jump and simulate shot release. Trains the reactive shot off a screen.' },
    ]
  },
  {
    id: 'w5-b', week: 5, day: 'B', name: 'Shot-Pattern Upper', color: '#a855f7',
    duration: '40 min', focus: 'Shooting-Specific Upper Body',
    exercises: [
      { name: 'Push Press', sets: '4', reps: '4', restSecs: 150, tag: 'Full Chain', tagColor: '#f97316',
        why: 'Heavier than phase 1. You have the strength base now — use it. Drive through the heels.' },
      { name: 'Single-Arm DB Press (shooting arm)', sets: '3', reps: '8', restSecs: 90, tag: 'Specific', tagColor: '#a855f7',
        why: 'Isolates the shooting arm. Addresses any strength imbalance between arms.' },
      { name: 'Tricep Pushdown (slow eccentric)', sets: '3', reps: '12', restSecs: 60, tag: 'Triceps', tagColor: '#6366f1',
        why: '3-second lowering phase. Eccentric tricep strength = more control at ball release.' },
      { name: 'Wrist Curl + Finger Extension', sets: '4', reps: '15', restSecs: 45, tag: 'Wrist', tagColor: '#22c55e',
        why: 'Both directions — flexion for power, extension for follow-through control.' },
    ]
  },
  {
    id: 'w5-c', week: 5, day: 'C', name: 'Full Chain Transfer', color: '#a855f7',
    duration: '40 min', focus: 'Complete Kinetic Chain',
    exercises: [
      { name: 'Push Press into Jump', sets: '4', reps: '4', restSecs: 150, tag: 'Full Chain', tagColor: '#a855f7',
        why: 'Press overhead, use the momentum to jump. Trains the continuous kinetic chain from floor to fingertips.' },
      { name: 'Med-Ball Shot Simulation', sets: '4', reps: '6', restSecs: 90, tag: 'Specific', tagColor: '#f97316',
        why: 'Hold med-ball in shooting position, jump and release overhead. The closest gym drill to an actual shot.' },
      { name: 'Cable/Band Rotational Press', sets: '3', reps: '10', restSecs: 90, tag: 'Transfer', tagColor: '#6366f1',
        why: 'Final week of this drill. Maximum resistance. This is your shooting motion under load.' },
      { name: 'Wrist Snap Finisher', sets: '3', reps: '30', restSecs: 30, tag: 'Wrist', tagColor: '#22c55e',
        why: 'High-rep wrist endurance. Shoot 100 shots after this — feel the difference in your arc.' },
    ]
  },
  { id: 'w6-a', week: 6, day: 'A', name: 'Peak Shot Power', color: '#a855f7', duration: '45 min', focus: 'Maximum Transfer',
    exercises: [
      { name: 'Single-Leg Jump Squat', sets: '5', reps: '5', restSecs: 120, tag: 'Unilateral', tagColor: '#a855f7', why: 'Peak week. Maximum effort every rep. This is your pull-up jumper.' },
      { name: 'Step-Back Jump Squat', sets: '4', reps: '5', restSecs: 120, tag: 'Specific', tagColor: '#f97316', why: 'Extra rep. Explode as high as possible.' },
      { name: 'Depth Jump to Shot Sim', sets: '4', reps: '4', restSecs: 120, tag: 'Reactive', tagColor: '#ef4444', why: 'Peak reactive strength. Minimum ground contact time.' },
      { name: 'Vertical Jump Test', sets: '3', reps: '3', restSecs: 120, tag: 'Test', tagColor: '#eab308', why: 'Final test. Compare to week 1 and week 4. Track your progress.' },
    ]
  },
  { id: 'w6-b', week: 6, day: 'B', name: 'Peak Upper Power', color: '#a855f7', duration: '40 min', focus: 'Max Shooting Chain',
    exercises: [
      { name: 'Push Press', sets: '5', reps: '3', restSecs: 180, tag: 'Full Chain', tagColor: '#f97316', why: 'Heaviest week. 3 reps = maximum power output. Drive hard.' },
      { name: 'Single-Arm DB Press (shooting arm)', sets: '4', reps: '6', restSecs: 90, tag: 'Specific', tagColor: '#a855f7', why: 'Heavier than week 5. Shooting arm peak strength.' },
      { name: 'Plyometric Push-up', sets: '3', reps: '6', restSecs: 90, tag: 'Explosive', tagColor: '#22c55e', why: 'Peak upper body explosive power.' },
      { name: 'Wrist Curl + Finger Extension', sets: '4', reps: '20', restSecs: 45, tag: 'Wrist', tagColor: '#22c55e', why: 'Peak wrist endurance. Shoot 200 shots after this session.' },
    ]
  },
  { id: 'w6-c', week: 6, day: 'C', name: 'Final Transfer', color: '#a855f7', duration: '40 min', focus: 'Complete Program Finish',
    exercises: [
      { name: 'Push Press into Jump', sets: '5', reps: '4', restSecs: 150, tag: 'Full Chain', tagColor: '#a855f7', why: 'Final session. Maximum effort. Feel the full kinetic chain.' },
      { name: 'Med-Ball Shot Simulation', sets: '5', reps: '6', restSecs: 90, tag: 'Specific', tagColor: '#f97316', why: 'Peak shot simulation. Explode and release as high as possible.' },
      { name: 'Med-Ball Rotational Throw', sets: '3', reps: '6', restSecs: 90, tag: 'Rotational', tagColor: '#ef4444', why: 'Final rotational power session.' },
      { name: 'Wrist Snap Finisher', sets: '4', reps: '30', restSecs: 30, tag: 'Wrist', tagColor: '#22c55e', why: 'Program complete. Go shoot 300 shots and feel your new range.' },
    ]
  },
]

const currentWeekSessions = computed(() => allSessions.filter(s => s.week === currentWeek.value))

function exKey(sessionId, name) { return `${sessionId}::${name}` }
function isDone(sessionId, name) { return !!doneExercises.value[exKey(sessionId, name)] }
function toggleEx(sessionId, name) {
  const k = exKey(sessionId, name)
  const nowDone = !doneExercises.value[k]
  doneExercises.value[k] = nowDone
  if (nowDone) startRest(sessionId, name, 90)
}
function toggleSession(id) {
  const i = completedSessions.value.indexOf(id)
  if (i === -1) completedSessions.value.push(id)
  else completedSessions.value.splice(i, 1)
}

function isTimeBased(reps) { return /sec|min/i.test(reps || '') }
function parseTargetSecs(reps) {
  if (!isTimeBased(reps)) return null
  const m = reps.match(/(\d+)/); return m ? parseInt(m[1]) : null
}
function parseTargetReps(reps) {
  if (isTimeBased(reps)) return null
  const m = reps.match(/(\d+)/); return m ? parseInt(m[1]) : null
}

function getRepCount(sid, name) {
  const k = exKey(sid, name) + '-rep'
  if (repCounters.value[k] === undefined) repCounters.value[k] = 0
  return repCounters.value[k]
}
function tapRep(sid, name) { const k = exKey(sid, name) + '-rep'; repCounters.value[k] = (repCounters.value[k] || 0) + 1 }
function resetReps(sid, name) { repCounters.value[exKey(sid, name) + '-rep'] = 0 }

function getSetState(sid, name) {
  const k = exKey(sid, name) + '-sets'
  if (!setCounters.value[k]) setCounters.value[k] = { done: 0 }
  return setCounters.value[k]
}
function addSet(sid, name) { getSetState(sid, name).done++ }
function resetSets(sid, name) { setCounters.value[exKey(sid, name) + '-sets'] = { done: 0 } }

function getRestTimer(sid, name) {
  const k = exKey(sid, name) + '-rest'
  if (!restTimers.value[k]) restTimers.value[k] = { remaining: 90, total: 90, running: false, done: false, _iv: null }
  return restTimers.value[k]
}
function startRest(sid, name, sec = 90) {
  const t = getRestTimer(sid, name)
  if (t.running) return
  if (t.done || t.remaining === 0) { t.remaining = sec; t.total = sec; t.done = false }
  t.running = true
  t._iv = setInterval(() => {
    if (t.remaining <= 1) { t.remaining = 0; t.running = false; t.done = true; clearInterval(t._iv); pingSound() }
    else t.remaining--
  }, 1000)
}
function pauseRest(sid, name) { const t = getRestTimer(sid, name); clearInterval(t._iv); t.running = false }
function resetRest(sid, name, sec = 90) {
  const t = getRestTimer(sid, name); clearInterval(t._iv)
  t.running = false; t.done = false; t.remaining = sec; t.total = sec
}
function setRest(sid, name, sec) { resetRest(sid, name, sec); startRest(sid, name, sec) }

function getExTimer(sid, name) {
  const k = exKey(sid, name) + '-ex'
  if (!exTimers.value[k]) exTimers.value[k] = { remaining: 0, total: 0, running: false, done: false, _iv: null }
  return exTimers.value[k]
}
function startExTimer(sid, name, sec) {
  const t = getExTimer(sid, name)
  if (t.running) return
  if (!t.total || t.done || t.remaining === 0) { t.remaining = sec; t.total = sec; t.done = false }
  t.running = true
  t._iv = setInterval(() => {
    if (t.remaining <= 1) { t.remaining = 0; t.running = false; t.done = true; clearInterval(t._iv); pingSound() }
    else t.remaining--
  }, 1000)
}
function pauseExTimer(sid, name) { const t = getExTimer(sid, name); clearInterval(t._iv); t.running = false }
function resetExTimer(sid, name, sec) {
  const t = getExTimer(sid, name); clearInterval(t._iv)
  t.running = false; t.done = false; t.remaining = sec; t.total = sec
}

function timerDisplay(t) {
  const m = Math.floor(t.remaining / 60), s = t.remaining % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
function restProgress(t) { return t.total > 0 ? ((t.total - t.remaining) / t.total) * 100 : 0 }
function pingSound() {
  try {
    const ctx = new AudioContext(), osc = ctx.createOscillator(), gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
    osc.start(); osc.stop(ctx.currentTime + 0.6)
  } catch {}
}
onUnmounted(() => {
  Object.values(restTimers.value).forEach(t => clearInterval(t._iv))
  Object.values(exTimers.value).forEach(t => clearInterval(t._iv))
})
</script>

<style scoped>
.srp-wrap { display: flex; flex-direction: column; gap: 14px; }
.srp-header { display: flex; flex-direction: column; gap: 10px; }
.header-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.header-title { font-size: 20px; font-weight: 800; color: var(--text-h); }
.header-sub { font-size: 12px; color: var(--text); margin-top: 3px; line-height: 1.4; }
.day-badge { display: flex; flex-direction: column; align-items: center; background: var(--surface2); padding: 10px 14px; border-radius: 10px; flex-shrink: 0; }
.badge-val { font-size: 20px; font-weight: 800; color: var(--accent); }
.badge-lbl { font-size: 10px; color: var(--text); font-weight: 600; text-transform: uppercase; }
.progress-bar { width: 100%; height: 6px; background: var(--surface2); border-radius: 99px; overflow: hidden; }
.progress-fill { height: 100%; background: var(--accent); transition: width 0.4s; }
.week-nav { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.day-btn { padding: 7px 16px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface2); color: var(--text); font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.day-btn:hover { border-color: var(--accent); color: var(--accent); }
.phase-pill { font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 20px; }
.science-banner { display: flex; flex-direction: column; gap: 10px; background: #06b6d410; border-color: #06b6d440; }
.sci-title { font-size: 13px; font-weight: 800; color: #06b6d4; }
.sci-steps { display: flex; flex-direction: column; gap: 2px; }
.sci-step { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; color: var(--text); line-height: 1.4; }
.sci-step strong { color: var(--text-h); }
.ss-num { width: 18px; height: 18px; border-radius: 50%; background: #06b6d4; color: #fff; font-size: 10px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
.sci-arrow { font-size: 12px; color: var(--text); padding-left: 9px; line-height: 1; }
.sci-note { font-size: 12px; color: var(--accent); font-weight: 700; padding-top: 4px; border-top: 1px solid var(--border); }
.phase-focus { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.pf-left { display: flex; align-items: center; gap: 12px; }
.pf-icon { font-size: 28px; }
.pf-name { font-size: 14px; font-weight: 800; color: var(--text-h); }
.pf-desc { font-size: 12px; color: var(--text); margin-top: 2px; }
.pf-sessions { font-size: 28px; font-weight: 900; color: var(--accent); line-height: 1; text-align: center; }
.pf-sessions span { display: block; font-size: 10px; font-weight: 600; color: var(--text); text-transform: uppercase; }
.block-card { display: flex; flex-direction: column; gap: 12px; }
.block-header { display: flex; align-items: flex-start; gap: 12px; padding-bottom: 10px; border-bottom: 2px solid var(--border); }
.block-letter { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 900; color: #fff; flex-shrink: 0; }
.block-title { font-size: 13px; font-weight: 800; color: var(--text-h); flex: 1; }
.block-sub { font-size: 11px; color: var(--text); margin-top: 2px; }
.session-done-btn { font-size: 18px; background: none; border: 1px solid var(--border); border-radius: 8px; padding: 4px 8px; cursor: pointer; transition: all 0.2s; color: var(--text); }
.session-done-btn.done { border-color: #22c55e; color: #22c55e; }
.ex-list { display: flex; flex-direction: column; gap: 8px; }
.ex-card { padding: 10px 12px; border-radius: 10px; background: var(--surface2); border: 1px solid transparent; transition: all 0.2s; }
.ex-card:hover { border-color: var(--border2); }
.ex-card.done { opacity: 0.75; background: #22c55e0d; border-color: #22c55e30; }
.ex-top { display: flex; align-items: flex-start; gap: 10px; }
.ex-check { font-size: 17px; font-weight: 700; color: var(--text); min-width: 18px; margin-top: 1px; cursor: pointer; user-select: none; }
.ex-check.done { color: #22c55e; }
.ex-body { flex: 1; }
.ex-name { font-size: 13px; font-weight: 700; color: var(--text-h); }
.ex-dose { font-size: 12px; color: var(--accent); font-weight: 600; margin-top: 2px; }
.ex-tag { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 20px; white-space: nowrap; flex-shrink: 0; }
.ex-why { font-size: 11px; color: var(--text); margin-top: 6px; padding-left: 28px; line-height: 1.4; }
.rep-counter { display: flex; align-items: center; gap: 8px; margin: 8px 0 2px 28px; flex-wrap: wrap; }
.rep-tap { display: flex; align-items: baseline; gap: 2px; background: var(--surface); border: 2px solid var(--border); border-radius: 10px; padding: 5px 14px; cursor: pointer; transition: all 0.15s; font-weight: 800; }
.rep-tap:hover { border-color: var(--accent); }
.rep-num { font-size: 20px; color: var(--text-h); transition: color 0.2s; }
.rep-num.reached { color: #22c55e; }
.rep-target { font-size: 12px; color: var(--text); }
.rep-reset { background: none; border: 1px solid var(--border); border-radius: 6px; padding: 4px 8px; font-size: 13px; cursor: pointer; color: var(--text); transition: all 0.15s; }
.rep-reset:hover { border-color: var(--accent); color: var(--accent); }
.rep-label { font-size: 10px; color: var(--text); font-weight: 600; }
.ex-timer { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.ex-timer button { padding: 4px 9px; border-radius: 7px; border: 1px solid var(--border); background: var(--surface2); color: var(--text); font-size: 13px; cursor: pointer; transition: all 0.15s; }
.ex-timer button:hover { border-color: var(--accent); color: var(--accent); }
.et-time { font-size: 22px; font-weight: 800; color: var(--text-h); font-variant-numeric: tabular-nums; min-width: 52px; }
.ex-timer.running .et-time { color: #f97316; }
.ex-timer.done .et-time { color: #22c55e; }
.et-label { font-size: 10px; color: var(--text); font-weight: 600; }
.set-counter { display: flex; align-items: center; gap: 5px; margin-left: auto; }
.set-btn { padding: 4px 10px; border-radius: 7px; border: 1px solid var(--accent); background: #6366f122; color: var(--accent); font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
.set-btn:hover { background: var(--accent); color: #fff; }
.set-done { font-size: 16px; font-weight: 800; color: var(--text-h); min-width: 18px; text-align: center; }
.inline-rest { margin-top: 10px; padding: 10px 12px; border-radius: 10px; background: var(--surface); border: 1px solid var(--border); transition: border-color 0.3s; }
.inline-rest.running { border-color: #f9731655; }
.inline-rest.finished { border-color: #22c55e88; }
.irt-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.irt-label { font-size: 11px; font-weight: 700; color: var(--text-h); }
.irt-time { font-size: 18px; font-weight: 800; color: var(--text-h); font-variant-numeric: tabular-nums; }
.irt-bar { width: 100%; height: 5px; background: var(--surface2); border-radius: 99px; overflow: hidden; margin-bottom: 8px; }
.irt-fill { height: 100%; border-radius: 99px; transition: width 0.9s linear, background 0.3s; }
.irt-btns { display: flex; gap: 6px; flex-wrap: wrap; }
.irt-btns button { padding: 5px 10px; border-radius: 7px; border: 1px solid var(--border); background: var(--surface2); color: var(--text); font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
.irt-btns button:hover { border-color: var(--accent); color: var(--accent); }
.section-card { display: flex; flex-direction: column; gap: 12px; }
.section-title { font-size: 15px; font-weight: 800; color: var(--text-h); }
.roadmap { display: flex; flex-direction: column; gap: 14px; }
.roadmap-row { display: flex; gap: 12px; align-items: flex-start; }
.rm-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; transition: background 0.3s; }
.rm-body { flex: 1; }
.rm-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
.rm-label { font-size: 13px; font-weight: 700; color: var(--text-h); }
.rm-days { font-size: 11px; color: var(--text); background: var(--surface2); padding: 2px 8px; border-radius: 20px; }
.rm-desc { font-size: 12px; color: var(--text); margin-top: 3px; line-height: 1.4; }
.science-card { display: flex; flex-direction: column; gap: 12px; }
.sci-title2 { font-size: 14px; font-weight: 800; color: var(--text-h); }
.sci-list { display: flex; flex-direction: column; gap: 10px; }
.sci-item { display: flex; gap: 10px; align-items: flex-start; font-size: 12px; color: var(--text); line-height: 1.5; }
.sci-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); margin-top: 5px; flex-shrink: 0; }
.sci-item strong { color: var(--text-h); }
</style>
