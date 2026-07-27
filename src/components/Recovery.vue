<template>
  <div class="page">

    <!-- Header -->
    <div class="rc-header">
      <div>
        <h1>🧊 Recovery</h1>
        <p class="rc-sub">Rest is where gains are made.</p>
      </div>
      <button class="reset-btn" @click="confirmReset = true">↺ Reset Day</button>
    </div>

    <!-- Recovery Score Ring -->
    <div class="score-card card">
      <div class="score-ring-wrap">
        <svg viewBox="0 0 80 80" class="score-ring">
          <circle cx="40" cy="40" r="34" fill="none" stroke="var(--surface3)" stroke-width="7"/>
          <circle
            cx="40" cy="40" r="34" fill="none"
            stroke="var(--accent)" stroke-width="7"
            stroke-linecap="round"
            :stroke-dasharray="`${recoveryScore * 2.136} 213.6`"
            stroke-dashoffset="53.4"
            style="transition: stroke-dasharray 0.6s ease"
          />
        </svg>
        <div class="score-inner">
          <span class="score-val">{{ recoveryScore }}</span>
          <span class="score-label">/ 100</span>
        </div>
      </div>
      <div class="score-info">
        <div class="score-title">Recovery Score</div>
        <div class="score-desc">{{ scoreMessage }}</div>
        <div class="score-pills">
          <div class="score-pill">
            <span class="sp-val green">{{ completedCount }}</span>
            <span class="sp-label">Done</span>
          </div>
          <div class="score-pill">
            <span class="sp-val">{{ totalCount - completedCount }}</span>
            <span class="sp-label">Remaining</span>
          </div>
          <div class="score-pill">
            <span class="sp-val accent">{{ sleepHours }}h</span>
            <span class="sp-label">Sleep</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── STRETCHING ── -->
    <div class="section-header" style="margin-top:20px">
      <span class="section-title">🧘 Stretching</span>
      <span class="section-sub">{{ stretchDone }}/{{ stretches.length }} done</span>
    </div>
    <div class="items-list">
      <div
        v-for="item in stretches"
        :key="item.id"
        class="item-card card"
        :class="{ done: item.done }"
        @click="item.done = !item.done"
      >
        <div class="item-check" :class="{ done: item.done }">{{ item.done ? '✓' : '' }}</div>
        <div class="item-body">
          <div class="item-name">{{ item.name }}</div>
          <div class="item-meta">{{ item.duration }} · {{ item.sets }}</div>
        </div>
        <div class="item-tip">{{ item.tip }}</div>
      </div>
    </div>

    <!-- ── FOAM ROLLING ── -->
    <div class="section-header" style="margin-top:20px">
      <span class="section-title">🪵 Foam Rolling</span>
      <span class="section-sub">{{ foamDone }}/{{ foamRolls.length }} done</span>
    </div>
    <div class="items-list">
      <div
        v-for="item in foamRolls"
        :key="item.id"
        class="item-card card"
        :class="{ done: item.done }"
        @click="item.done = !item.done"
      >
        <div class="item-check" :class="{ done: item.done }">{{ item.done ? '✓' : '' }}</div>
        <div class="item-body">
          <div class="item-name">{{ item.name }}</div>
          <div class="item-meta">{{ item.duration }} · {{ item.passes }} passes</div>
        </div>
        <div class="item-tip">{{ item.tip }}</div>
      </div>
    </div>

    <!-- ── ICE BATH ── -->
    <div class="section-header" style="margin-top:20px">
      <span class="section-title">🧊 Ice Bath <span class="optional-tag">Optional</span></span>
    </div>
    <div class="ice-card card" :class="{ done: iceBath.done }">
      <div class="ice-top">
        <div class="ice-left">
          <span class="ice-icon">🧊</span>
          <div>
            <div class="item-name">Ice Bath / Cold Exposure</div>
            <div class="item-meta">{{ iceBath.temp }} · {{ iceBath.duration }}</div>
          </div>
        </div>
        <button
          class="ice-toggle"
          :class="{ done: iceBath.done }"
          @click="iceBath.done = !iceBath.done"
        >{{ iceBath.done ? '✓ Done' : 'Mark Done' }}</button>
      </div>
      <div class="ice-steps">
        <div v-for="(step, i) in iceBath.steps" :key="i" class="ice-step">
          <span class="ice-step-num">{{ i + 1 }}</span>
          <span class="ice-step-text">{{ step }}</span>
        </div>
      </div>
      <div class="drill-tip">💡 {{ iceBath.tip }}</div>
    </div>

    <!-- ── SLEEP TRACKING ── -->
    <div class="section-header" style="margin-top:20px">
      <span class="section-title">😴 Sleep Tracking</span>
    </div>
    <div class="sleep-card card">
      <div class="sleep-row">
        <div class="sleep-field">
          <label class="sleep-label">Bedtime</label>
          <input type="time" v-model="sleep.bedtime" class="sleep-input" />
        </div>
        <div class="sleep-field">
          <label class="sleep-label">Wake Up</label>
          <input type="time" v-model="sleep.wakeup" class="sleep-input" />
        </div>
      </div>
      <div class="sleep-result">
        <div class="sleep-hours-display" :class="sleepQualityClass">
          <span class="sleep-h-val">{{ sleepHours }}h {{ sleepMins }}m</span>
          <span class="sleep-h-label">{{ sleepQualityLabel }}</span>
        </div>
        <div class="sleep-bar">
          <div class="sleep-fill" :class="sleepQualityClass" :style="{ width: sleepBarPct + '%' }"></div>
        </div>
        <div class="sleep-targets">
          <span>0h</span><span>5h</span><span>8h</span><span>10h</span>
        </div>
      </div>
      <div class="sleep-quality-row">
        <span class="sleep-label">Sleep Quality</span>
        <div class="quality-stars">
          <button
            v-for="s in 5" :key="s"
            class="star-btn"
            :class="{ active: s <= sleep.quality }"
            @click="sleep.quality = s"
          >★</button>
        </div>
      </div>
    </div>

    <!-- ── RECOVERY NOTES ── -->
    <div class="section-header" style="margin-top:20px">
      <span class="section-title">📝 Recovery Notes</span>
      <span class="section-sub">{{ notes.length }} notes</span>
    </div>
    <div class="notes-composer card">
      <textarea
        v-model="noteDraft"
        class="note-input"
        placeholder="How does your body feel? Any soreness, tightness, or energy levels to note…"
        rows="3"
      ></textarea>
      <div class="note-actions">
        <div class="note-tags">
          <button
            v-for="tag in noteTags" :key="tag"
            class="chip"
            :class="{ active: noteTag === tag }"
            @click="noteTag = noteTag === tag ? '' : tag"
          >{{ tag }}</button>
        </div>
        <button class="btn-primary" style="width:auto;padding:9px 20px;font-size:13px" :disabled="!noteDraft.trim()" @click="addNote">Add</button>
      </div>
    </div>
    <div class="notes-list" v-if="notes.length">
      <div v-for="note in [...notes].reverse()" :key="note.id" class="note-card card">
        <div class="note-top">
          <span class="chip" v-if="note.tag" style="font-size:11px;padding:2px 8px">{{ note.tag }}</span>
          <span class="note-time">{{ note.time }}</span>
          <button class="entry-delete" @click="deleteNote(note.id)">✕</button>
        </div>
        <p class="note-body">{{ note.body }}</p>
      </div>
    </div>

    <!-- Reset Modal -->
    <div v-if="confirmReset" class="modal-overlay" @click.self="confirmReset = false">
      <div class="modal card">
        <div class="modal-icon">↺</div>
        <div class="modal-title">Reset Today's Recovery?</div>
        <p class="modal-desc">All completions and notes will be cleared.</p>
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

// ── Stretching ──
const stretches = ref([
  { id: 1, name: 'Hip Flexor Stretch',      duration: '60 sec', sets: '2 sets each side', tip: 'Lunge position, push hips forward gently.',       done: false },
  { id: 2, name: 'Hamstring Stretch',        duration: '60 sec', sets: '2 sets each side', tip: 'Keep back flat. Reach toward toes slowly.',        done: false },
  { id: 3, name: 'Quad Stretch',             duration: '45 sec', sets: '2 sets each side', tip: 'Stand tall, pull heel to glute. Use a wall if needed.', done: false },
  { id: 4, name: 'Calf Stretch',             duration: '45 sec', sets: '2 sets each side', tip: 'Straight leg and bent knee versions both.',        done: false },
  { id: 5, name: 'Shoulder Cross-Body',      duration: '30 sec', sets: '2 sets each side', tip: 'Pull arm across chest. Keep shoulder down.',       done: false },
  { id: 6, name: 'Thoracic Spine Rotation',  duration: '45 sec', sets: '2 sets each side', tip: 'Seated or kneeling. Rotate slowly, hold at end.',  done: false },
])

// ── Foam Rolling ──
const foamRolls = ref([
  { id: 1, name: 'Quads',        duration: '60 sec', passes: 10, tip: 'Slow rolls. Pause on tight spots for 5 sec.',    done: false },
  { id: 2, name: 'IT Band',      duration: '60 sec', passes: 10, tip: 'Side-lying. Roll from hip to just above knee.',  done: false },
  { id: 3, name: 'Calves',       duration: '45 sec', passes: 8,  tip: 'Cross one leg over the other for more pressure.', done: false },
  { id: 4, name: 'Upper Back',   duration: '60 sec', passes: 10, tip: 'Arms crossed over chest. Roll T-spine slowly.',  done: false },
  { id: 5, name: 'Glutes / Piriformis', duration: '60 sec', passes: 8, tip: 'Figure-4 position on the roller.',         done: false },
])

// ── Ice Bath ──
const iceBath = ref({
  done: false,
  temp: '10–15 °C',
  duration: '10–15 min',
  tip: 'Breathe slowly and stay calm. Cold exposure reduces inflammation and speeds muscle repair.',
  steps: [
    'Fill tub with cold water and ice',
    'Enter slowly — legs first',
    'Stay 10–15 minutes, breathe steadily',
    'Exit and warm up gradually — no hot shower immediately',
  ],
})

// ── Sleep ──
const sleep = ref({ bedtime: '22:00', wakeup: '06:00', quality: 0 })

const sleepMinutesTotal = computed(() => {
  if (!sleep.value.bedtime || !sleep.value.wakeup) return 0
  const [bh, bm] = sleep.value.bedtime.split(':').map(Number)
  const [wh, wm] = sleep.value.wakeup.split(':').map(Number)
  let mins = (wh * 60 + wm) - (bh * 60 + bm)
  if (mins < 0) mins += 1440
  return mins
})
const sleepHours = computed(() => Math.floor(sleepMinutesTotal.value / 60))
const sleepMins  = computed(() => sleepMinutesTotal.value % 60)
const sleepBarPct = computed(() => Math.min(100, (sleepMinutesTotal.value / 600) * 100))
const sleepQualityClass = computed(() => {
  const h = sleepHours.value
  if (h >= 8) return 'sq-great'
  if (h >= 6) return 'sq-ok'
  return 'sq-poor'
})
const sleepQualityLabel = computed(() => {
  const h = sleepHours.value
  if (h >= 8) return '✅ Great recovery sleep'
  if (h >= 6) return '⚠️ Adequate — aim for 8h'
  return '❌ Too little — prioritize sleep'
})

// ── Notes ──
const noteDraft = ref('')
const noteTag   = ref('')
const noteTags  = ['Soreness', 'Energy', 'Tightness', 'Fatigue', 'Feeling Good']
const notes     = ref([])

function addNote() {
  if (!noteDraft.value.trim()) return
  notes.value.push({
    id: Date.now(),
    body: noteDraft.value.trim(),
    tag: noteTag.value,
    time: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
  })
  noteDraft.value = ''
  noteTag.value = ''
}
function deleteNote(id) { notes.value = notes.value.filter(n => n.id !== id) }

// ── Recovery Score ──
const stretchDone   = computed(() => stretches.value.filter(i => i.done).length)
const foamDone      = computed(() => foamRolls.value.filter(i => i.done).length)
const completedCount = computed(() => stretchDone.value + foamDone.value + (iceBath.value.done ? 1 : 0))
const totalCount     = computed(() => stretches.value.length + foamRolls.value.length + 1)

const recoveryScore = computed(() => {
  let score = 0
  score += (stretchDone.value / stretches.value.length) * 30
  score += (foamDone.value / foamRolls.value.length) * 25
  score += iceBath.value.done ? 15 : 0
  score += Math.min(30, (sleepHours.value / 8) * 30)
  return Math.round(score)
})

const scoreMessage = computed(() => {
  const s = recoveryScore.value
  if (s >= 85) return 'Elite recovery 🔥 Body is ready.'
  if (s >= 60) return 'Good recovery. Keep it up.'
  if (s >= 35) return 'Moderate. Complete more tasks.'
  return 'Start your recovery routine.'
})

function doReset() {
  stretches.value.forEach(i => i.done = false)
  foamRolls.value.forEach(i => i.done = false)
  iceBath.value.done = false
  sleep.value = { bedtime: '22:00', wakeup: '06:00', quality: 0 }
  notes.value = []
  confirmReset.value = false
}
</script>

<style scoped>
.rc-header {
  display: flex; align-items: flex-start;
  justify-content: space-between; margin-bottom: 14px;
}
.rc-header h1 { font-size: 26px; font-weight: 800; color: var(--text-h); margin: 0 0 2px; }
.rc-sub { font-size: 13px; color: var(--text); margin: 0; }

.reset-btn {
  background: var(--surface2); border: 1.5px solid var(--border);
  color: var(--text); border-radius: var(--radius-sm);
  padding: 8px 14px; font-size: 13px; font-weight: 600;
  transition: all 0.2s; flex-shrink: 0;
}
.reset-btn:hover { border-color: var(--accent); color: var(--accent); }

/* Score card */
.score-card {
  display: flex; align-items: center; gap: 20px;
  padding: 18px;
}
.score-ring-wrap { position: relative; width: 80px; height: 80px; flex-shrink: 0; }
.score-ring { width: 80px; height: 80px; transform: rotate(-90deg); }
.score-inner {
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}
.score-val { font-size: 22px; font-weight: 900; color: var(--text-h); line-height: 1; }
.score-label { font-size: 10px; color: var(--text); font-weight: 600; }

.score-info { flex: 1; display: flex; flex-direction: column; gap: 6px; }
.score-title { font-size: 15px; font-weight: 700; color: var(--text-h); }
.score-desc { font-size: 12px; color: var(--text2); }
.score-pills { display: flex; gap: 8px; }
.score-pill {
  display: flex; flex-direction: column; align-items: center; gap: 1px;
  background: var(--surface2); border-radius: var(--radius-sm);
  padding: 6px 10px; flex: 1;
}
.sp-val { font-size: 16px; font-weight: 800; color: var(--text-h); }
.sp-val.green  { color: var(--green); }
.sp-val.accent { color: var(--accent); }
.sp-label { font-size: 10px; color: var(--text); font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; }

/* Section header */
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
.section-title { font-size: 15px; font-weight: 700; color: var(--text-h); display: flex; align-items: center; gap: 6px; }
.section-sub { font-size: 12px; color: var(--text); font-weight: 600; }
.optional-tag {
  font-size: 10px; font-weight: 700; color: var(--text);
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: 99px; padding: 2px 8px;
}

/* Item cards (stretch + foam) */
.items-list { display: flex; flex-direction: column; gap: 8px; }
.item-card {
  display: grid;
  grid-template-columns: 32px 1fr auto;
  align-items: center; gap: 10px;
  cursor: pointer; transition: all 0.2s;
  padding: 12px 14px;
}
.item-card:hover { border-color: var(--border2); }
.item-card.done { opacity: 0.55; }
.item-card.done .item-name { text-decoration: line-through; color: var(--text); }

.item-check {
  width: 28px; height: 28px; border-radius: 50%;
  border: 2px solid var(--border2);
  display: flex; align-items: center; justify-content: center;
  font-size: 14px; font-weight: 700; color: #fff;
  transition: all 0.2s; flex-shrink: 0;
}
.item-check.done { background: var(--green); border-color: var(--green); }

.item-body { display: flex; flex-direction: column; gap: 2px; }
.item-name { font-size: 14px; font-weight: 600; color: var(--text-h); }
.item-meta { font-size: 11px; color: var(--text); }
.item-tip  { font-size: 11px; color: var(--text); text-align: right; max-width: 120px; line-height: 1.4; }

/* Ice bath */
.ice-card { display: flex; flex-direction: column; gap: 12px; }
.ice-card.done { border-color: var(--blue); }
.ice-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.ice-left { display: flex; align-items: center; gap: 10px; }
.ice-icon { font-size: 28px; }
.ice-toggle {
  background: var(--surface2); border: 1.5px solid var(--border);
  color: var(--text); border-radius: var(--radius-sm);
  padding: 8px 14px; font-size: 13px; font-weight: 700;
  transition: all 0.2s; flex-shrink: 0;
}
.ice-toggle:hover { border-color: var(--blue); color: var(--blue); }
.ice-toggle.done { background: #3b82f618; border-color: var(--blue); color: var(--blue); }

.ice-steps { display: flex; flex-direction: column; gap: 6px; }
.ice-step { display: flex; align-items: flex-start; gap: 10px; }
.ice-step-num {
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--surface3); border: 1px solid var(--border);
  font-size: 11px; font-weight: 700; color: var(--text-h);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.ice-step-text { font-size: 13px; color: var(--text2); line-height: 1.5; }

/* Sleep */
.sleep-card { display: flex; flex-direction: column; gap: 14px; }
.sleep-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.sleep-field { display: flex; flex-direction: column; gap: 6px; }
.sleep-label { font-size: 11px; font-weight: 700; color: var(--text); text-transform: uppercase; letter-spacing: 0.4px; }
.sleep-input {
  background: var(--surface2); border: 1.5px solid var(--border);
  border-radius: var(--radius-sm); padding: 10px 12px;
  font-size: 15px; font-weight: 700; color: var(--text-h);
  text-align: center; width: 100%;
}
.sleep-input:focus { border-color: var(--accent); outline: none; }

.sleep-result { display: flex; flex-direction: column; gap: 6px; }
.sleep-hours-display { display: flex; align-items: center; justify-content: space-between; }
.sleep-h-val { font-size: 20px; font-weight: 800; color: var(--text-h); }
.sleep-h-label { font-size: 12px; font-weight: 600; }
.sq-great .sleep-h-label { color: var(--green); }
.sq-ok    .sleep-h-label { color: var(--yellow); }
.sq-poor  .sleep-h-label { color: var(--red); }

.sleep-bar { height: 8px; background: var(--surface3); border-radius: 99px; overflow: hidden; }
.sleep-fill { height: 100%; border-radius: 99px; transition: width 0.5s ease; }
.sq-great .sleep-fill, .sleep-fill.sq-great { background: var(--green); }
.sq-ok    .sleep-fill, .sleep-fill.sq-ok    { background: var(--yellow); }
.sq-poor  .sleep-fill, .sleep-fill.sq-poor  { background: var(--red); }

.sleep-targets { display: flex; justify-content: space-between; font-size: 10px; color: var(--text); }

.sleep-quality-row { display: flex; align-items: center; justify-content: space-between; }
.quality-stars { display: flex; gap: 4px; }
.star-btn {
  background: transparent; border: none;
  font-size: 22px; color: var(--surface3);
  transition: color 0.15s; padding: 0;
}
.star-btn:hover { color: var(--yellow); }
.star-btn.active { color: var(--yellow); }

/* Notes */
.notes-composer { display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px; }
.note-input {
  resize: none; background: var(--surface2);
  border: 1.5px solid var(--border); border-radius: var(--radius-sm);
  padding: 10px 12px; font-size: 14px; color: var(--text-h);
  line-height: 1.5; width: 100%;
}
.note-input:focus { border-color: var(--accent); outline: none; }
.note-actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.note-tags { display: flex; gap: 6px; flex-wrap: wrap; flex: 1; }

.notes-list { display: flex; flex-direction: column; gap: 8px; }
.note-card { display: flex; flex-direction: column; gap: 6px; }
.note-top { display: flex; align-items: center; gap: 6px; }
.note-time { font-size: 11px; color: var(--text); margin-left: auto; }
.note-body { font-size: 14px; color: var(--text2); line-height: 1.6; margin: 0; }
.entry-delete {
  background: transparent; border: none; color: var(--text);
  font-size: 13px; padding: 4px 6px; border-radius: var(--radius-sm); transition: all 0.2s;
}
.entry-delete:hover { color: var(--red); background: #ef444418; }

/* Tip */
.drill-tip {
  font-size: 12px; color: var(--text); line-height: 1.5;
  padding: 8px 10px; background: var(--surface2);
  border-radius: var(--radius-sm); border-left: 3px solid var(--blue);
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
