<template>
  <div>

    <!-- Commitment Agreement -->
    <div v-if="!committed" class="card commitment-card">
      <div class="commit-title">✍️ Air Alert® Commitment Agreement</div>
      <p class="commit-body">
        Over the next 15 weeks, I will improve my vertical by
        <input v-model="goalPerWeek" type="number" min="0" max="5" step="0.5" class="inline-input" /> inches per week.
      </p>
      <p class="commit-body">
        I will improve my vertical by
        <input v-model="goalTotal" type="number" min="0" max="20" class="inline-input" /> inches as a result of using Air Alert®.
      </p>
      <p class="commit-body italic">
        I have a desire and a passion for improving athletically. Therefore, I pledge to follow and commit myself to the Air Alert® training program as written. As a result of using Air Alert® and as a result of practicing other related skills, I will accomplish the following as it relates to my athletic goals:
      </p>
      <textarea v-model="goalStatement" placeholder="Write your athletic goals here…" class="goal-textarea" rows="3" />
      <div class="commit-name-row">
        <input v-model="commitName" placeholder="Your name" class="name-input" />
        <button class="commit-btn" :disabled="!commitName.trim()" @click="committed = true; saveCommit()">
          ✅ I Commit to This Program
        </button>
      </div>
    </div>

    <div v-else class="card commit-done">
      <div class="commit-done-inner">
        <span class="commit-check">✅</span>
        <div>
          <div class="commit-done-name">{{ commitName }} — Committed!</div>
          <div class="commit-done-sub">Goal: +{{ goalTotal }} inches total · +{{ goalPerWeek }} in/week</div>
          <div v-if="goalStatement" class="commit-done-goals">"{{ goalStatement }}"</div>
        </div>
        <button class="edit-btn" @click="committed = false">Edit</button>
      </div>
    </div>

    <!-- Progress Chart -->
    <div class="card">
      <div class="section-head">📊 Air Alert® Progress Chart</div>
      <div class="progress-table-wrap">
        <table class="progress-table">
          <thead>
            <tr>
              <th>Week</th>
              <th v-for="w in 5" :key="w">{{ w }}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="row-label">Date</td>
              <td v-for="i in 5" :key="i"><input v-model="progress[i-1].date" placeholder="—" /></td>
            </tr>
            <tr>
              <td class="row-label">Height (in)</td>
              <td v-for="i in 5" :key="i"><input v-model="progress[i-1].height" type="number" placeholder="—" /></td>
            </tr>
            <tr class="week-divider">
              <th>Week</th>
              <th v-for="w in [6,7,8,9,10]" :key="w">{{ w }}</th>
            </tr>
            <tr>
              <td class="row-label">Date</td>
              <td v-for="i in [5,6,7,8,9]" :key="i"><input v-model="progress[i].date" placeholder="—" /></td>
            </tr>
            <tr>
              <td class="row-label">Height (in)</td>
              <td v-for="i in [5,6,7,8,9]" :key="i"><input v-model="progress[i].height" type="number" placeholder="—" /></td>
            </tr>
            <tr class="week-divider">
              <th>Week</th>
              <th v-for="w in [11,12,13,14,15]" :key="w">{{ w }}</th>
            </tr>
            <tr>
              <td class="row-label">Date</td>
              <td v-for="i in [10,11,12,13,14]" :key="i"><input v-model="progress[i].date" placeholder="—" /></td>
            </tr>
            <tr>
              <td class="row-label">Height (in)</td>
              <td v-for="i in [10,11,12,13,14]" :key="i"><input v-model="progress[i].height" type="number" placeholder="—" /></td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="starting-leap">
        Starting Vertical Leap:
        <input v-model="startingLeap" type="number" placeholder="inches" class="leap-input" /> inches
      </div>
    </div>

    <!-- Workout Chart -->
    <div class="card">
      <div class="section-head">🏃 Air Alert® Workout Chart</div>

      <div class="week-type-label odd">COMPLETE ODD WEEKS ON MONDAY - WEDNESDAY - FRIDAY</div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Week</th>
              <th>Day</th>
              <th colspan="2">Leap Ups</th>
              <th colspan="2">Calf Raises</th>
              <th colspan="2">Step Ups</th>
              <th colspan="2">Thrust Ups</th>
              <th colspan="2">Burnouts</th>
              <th colspan="2">Squat Hops <span class="wed-only">(Wed only)</span></th>
              <th>Done</th>
            </tr>
            <tr class="sub-header">
              <th></th><th></th>
              <th>sets</th><th>reps</th>
              <th>sets</th><th>reps</th>
              <th>sets</th><th>reps</th>
              <th>sets</th><th>reps</th>
              <th>sets</th><th>reps</th>
              <th>sets</th><th>reps</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in oddWeeks" :key="row.week" :class="{ 'rest-row': row.rest }">
              <td class="week-cell">{{ row.week }}</td>
              <td><input v-model="row.date" placeholder="date" class="date-input" /></td>
              <template v-if="!row.rest">
                <td>{{ row.leapUps.sets }}</td><td>{{ row.leapUps.reps }}</td>
                <td>{{ row.calfRaises.sets }}</td><td>{{ row.calfRaises.reps }}</td>
                <td>{{ row.stepUps.sets }}</td><td>{{ row.stepUps.reps }}</td>
                <td>{{ row.thrustUps.sets }}</td><td>{{ row.thrustUps.reps }}</td>
                <td>{{ row.burnouts.sets }}</td><td>{{ row.burnouts.reps }}</td>
                <td>{{ row.squatHops.sets }}</td><td>{{ row.squatHops.reps }}</td>
                <td class="center-cell">
                  <button class="done-btn" :class="{ checked: row.done }" @click="row.done = !row.done">
                    {{ row.done ? '✔' : '○' }}
                  </button>
                </td>
              </template>
              <template v-else>
                <td colspan="13" class="rest-msg">{{ row.restMsg }}</td>
                <td></td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="week-type-label even">COMPLETE EVEN WEEKS ON TUESDAY - WEDNESDAY - THURSDAY</div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Week</th>
              <th>Day</th>
              <th colspan="2">Leap Ups</th>
              <th colspan="2">Calf Raises</th>
              <th colspan="2">Step Ups</th>
              <th colspan="2">Thrust Ups</th>
              <th colspan="2">Burnouts</th>
              <th colspan="2">Squat Hops <span class="wed-only">(Wed only)</span></th>
              <th>Done</th>
            </tr>
            <tr class="sub-header">
              <th></th><th></th>
              <th>sets</th><th>reps</th>
              <th>sets</th><th>reps</th>
              <th>sets</th><th>reps</th>
              <th>sets</th><th>reps</th>
              <th>sets</th><th>reps</th>
              <th>sets</th><th>reps</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in evenWeeks" :key="row.week" :class="{ 'rest-row': row.rest }">
              <td class="week-cell">{{ row.week }}</td>
              <td><input v-model="row.date" placeholder="date" class="date-input" /></td>
              <template v-if="!row.rest">
                <td>{{ row.leapUps.sets }}</td><td>{{ row.leapUps.reps }}</td>
                <td>{{ row.calfRaises.sets }}</td><td>{{ row.calfRaises.reps }}</td>
                <td>{{ row.stepUps.sets }}</td><td>{{ row.stepUps.reps }}</td>
                <td>{{ row.thrustUps.sets }}</td><td>{{ row.thrustUps.reps }}</td>
                <td>{{ row.burnouts.sets }}</td><td>{{ row.burnouts.reps }}</td>
                <td>{{ row.squatHops.sets }}</td><td>{{ row.squatHops.reps }}</td>
                <td class="center-cell">
                  <button class="done-btn" :class="{ checked: row.done }" @click="row.done = !row.done">
                    {{ row.done ? '✔' : '○' }}
                  </button>
                </td>
              </template>
              <template v-else>
                <td colspan="13" class="rest-msg">{{ row.restMsg }}</td>
                <td></td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="finish-note">
        🏁 You have finished Air Alert®. Rest your legs during week 16 or play basketball sparingly. At the beginning of next week, your vertical will be at its highest.
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted } from 'vue'
import { loadUserData, saveUserData } from '../useAuth.js'

const props = defineProps({ uid: String })

const committed     = ref(false)
const commitName    = ref('')
const goalPerWeek   = ref('')
const goalTotal     = ref('')
const goalStatement = ref('')
const startingLeap  = ref('')
const progress = reactive(Array.from({ length: 15 }, () => ({ date: '', height: '' })))
let saving = false

function mk(leapUps, calfRaises, stepUps, thrustUps, burnouts, squatHops) {
  return { leapUps, calfRaises, stepUps, thrustUps, burnouts, squatHops, done: false, date: '' }
}

const oddWeeks = reactive([
  { week: 1,  ...mk({sets:2,reps:20},{sets:2,reps:10},{sets:2,reps:10},{sets:2,reps:15},{sets:1,reps:100},{sets:4,reps:15}) },
  { week: 3,  ...mk({sets:3,reps:25},{sets:2,reps:20},{sets:2,reps:15},{sets:2,reps:25},{sets:1,reps:300},{sets:4,reps:20}) },
  { week: 5,  ...mk({sets:4,reps:25},{sets:2,reps:30},{sets:2,reps:20},{sets:2,reps:35},{sets:2,reps:250},{sets:4,reps:25}) },
  { week: 7,  ...mk({sets:4,reps:30},{sets:2,reps:40},{sets:2,reps:25},{sets:2,reps:50},{sets:2,reps:350},{sets:5,reps:25}) },
  { week: 9,  ...mk({sets:3,reps:45},{sets:2,reps:45},{sets:2,reps:30},{sets:2,reps:60},{sets:4,reps:200},{sets:5,reps:25}) },
  { week: 11, ...mk({sets:5,reps:40},{sets:2,reps:55},{sets:2,reps:35},{sets:2,reps:80},{sets:4,reps:250},{sets:5,reps:30}) },
  { week: 13, ...mk({sets:7,reps:40},{sets:4,reps:35},{sets:2,reps:40},{sets:2,reps:100},{sets:4,reps:300},{sets:5,reps:35}) },
  { week: 15, ...mk({sets:8,reps:50},{sets:5,reps:40},{sets:4,reps:25},{sets:4,reps:50},{sets:5,reps:300},{sets:4,reps:50}) },
])

const evenWeeks = reactive([
  { week: 2,  ...mk({sets:3,reps:20},{sets:2,reps:15},{sets:2,reps:15},{sets:2,reps:20},{sets:1,reps:200},{sets:4,reps:20}) },
  { week: 4,  ...mk({sets:3,reps:30},{sets:2,reps:25},{sets:2,reps:20},{sets:2,reps:30},{sets:2,reps:200},{sets:4,reps:20}) },
  { week: 6,  ...mk({sets:3,reps:35},{sets:2,reps:35},{sets:2,reps:25},{sets:2,reps:40},{sets:2,reps:300},{sets:4,reps:30}) },
  { week: 8,  rest: true, restMsg: 'Do not perform Air Alert® during week 8. Allow your legs to recover.', done: false, date: '' },
  { week: 10, ...mk({sets:4,reps:40},{sets:2,reps:50},{sets:2,reps:30},{sets:2,reps:70},{sets:3,reps:300},{sets:5,reps:30}) },
  { week: 12, ...mk({sets:6,reps:40},{sets:4,reps:30},{sets:2,reps:35},{sets:2,reps:90},{sets:4,reps:275},{sets:5,reps:35}) },
  { week: 14, ...mk({sets:8,reps:40},{sets:4,reps:35},{sets:2,reps:40},{sets:2,reps:100},{sets:4,reps:350},{sets:5,reps:40}) },
])

onMounted(async () => {
  const data = await loadUserData(props.uid, 'airalert')
  if (data) {
    committed.value     = data.committed || false
    commitName.value    = data.commitName || ''
    goalPerWeek.value   = data.goalPerWeek || ''
    goalTotal.value     = data.goalTotal || ''
    goalStatement.value = data.goalStatement || ''
    startingLeap.value  = data.startingLeap || ''
    if (data.progress)  progress.splice(0, progress.length, ...data.progress)
    if (data.oddWeeks)  oddWeeks.splice(0, oddWeeks.length, ...data.oddWeeks)
    if (data.evenWeeks) evenWeeks.splice(0, evenWeeks.length, ...data.evenWeeks)
  }
})

async function save() {
  if (saving) return
  saving = true
  await saveUserData(props.uid, 'airalert', {
    committed: committed.value, commitName: commitName.value,
    goalPerWeek: goalPerWeek.value, goalTotal: goalTotal.value,
    goalStatement: goalStatement.value, startingLeap: startingLeap.value,
    progress: JSON.parse(JSON.stringify(progress)),
    oddWeeks: JSON.parse(JSON.stringify(oddWeeks)),
    evenWeeks: JSON.parse(JSON.stringify(evenWeeks))
  })
  saving = false
}

function saveCommit() { save() }
watch([committed, commitName, goalPerWeek, goalTotal, goalStatement, startingLeap, progress, oddWeeks, evenWeeks], save, { deep: true })
</script>

<style scoped>
.section-head {
  font-size: 16px;
  font-weight: 700;
  color: var(--text-h);
  margin-bottom: 14px;
}

/* Commitment */
.commitment-card { margin-bottom: 16px; }
.commit-title { font-size: 17px; font-weight: 700; color: var(--text-h); margin-bottom: 14px; }
.commit-body { font-size: 14px; color: var(--text); margin-bottom: 10px; line-height: 1.6; }
.commit-body.italic { font-style: italic; }
.inline-input { width: 60px; display: inline-block; padding: 3px 8px; margin: 0 4px; text-align: center; }
.goal-textarea { width: 100%; margin-bottom: 14px; padding: 10px; font-size: 14px; resize: vertical; }
.commit-name-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.name-input { flex: 1; min-width: 160px; }
.commit-btn {
  background: var(--accent);
  color: #fff;
  border-radius: 8px;
  padding: 9px 18px;
  font-size: 14px;
  font-weight: 700;
  transition: opacity 0.2s;
  white-space: nowrap;
}
.commit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.commit-btn:not(:disabled):hover { opacity: 0.85; }

.commit-done { margin-bottom: 16px; border-left: 3px solid var(--green); }
.commit-done-inner { display: flex; align-items: flex-start; gap: 14px; }
.commit-check { font-size: 24px; flex-shrink: 0; }
.commit-done-name { font-weight: 700; color: var(--text-h); font-size: 15px; }
.commit-done-sub { font-size: 13px; color: var(--text); margin-top: 2px; }
.commit-done-goals { font-size: 13px; color: var(--text); font-style: italic; margin-top: 4px; }
.edit-btn {
  margin-left: auto;
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 6px;
  padding: 5px 12px;
  font-size: 13px;
  flex-shrink: 0;
}
.edit-btn:hover { color: var(--accent); border-color: var(--accent); }

/* Progress table */
.progress-table-wrap { overflow-x: auto; margin-bottom: 12px; }
.progress-table { width: 100%; border-collapse: collapse; min-width: 420px; }
.progress-table th, .progress-table td {
  padding: 7px 10px;
  border: 1px solid var(--border);
  text-align: center;
  font-size: 13px;
}
.progress-table th { background: var(--surface2); font-weight: 700; color: var(--text-h); }
.progress-table .row-label { font-weight: 600; color: var(--text-h); text-align: left; white-space: nowrap; }
.progress-table .week-divider th { background: var(--surface2); }
.progress-table input { width: 70px; text-align: center; padding: 4px 6px; font-size: 12px; }

.starting-leap { font-size: 14px; color: var(--text); display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.leap-input { width: 70px; text-align: center; }

/* Workout table */
.week-type-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-align: center;
  padding: 7px 12px;
  border-radius: 6px;
  margin-bottom: 10px;
}
.week-type-label.odd { background: #f9731622; color: #f97316; }
.week-type-label.even { background: #6366f122; color: #6366f1; margin-top: 20px; }

.table-wrap { overflow-x: auto; margin-bottom: 8px; }

table { width: 100%; border-collapse: collapse; min-width: 700px; }

th {
  padding: 8px 10px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.4px;
  border-bottom: 1px solid var(--border);
  background: var(--surface2);
  text-align: center;
}

.sub-header th {
  font-size: 10px;
  font-weight: 500;
  background: transparent;
  color: var(--text);
  padding: 4px 10px;
}

td {
  padding: 7px 10px;
  border-bottom: 1px solid var(--border);
  text-align: center;
  font-size: 13px;
  color: var(--text-h);
}

.week-cell { font-weight: 700; color: var(--accent); }
.center-cell { text-align: center; }

.date-input { width: 72px; padding: 4px 6px; font-size: 12px; text-align: center; }

.done-btn {
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 6px;
  width: 30px;
  height: 30px;
  font-size: 13px;
  transition: all 0.2s;
}
.done-btn.checked { background: var(--green); border-color: var(--green); color: #fff; }

.rest-row td { background: #f9731622; }
.rest-msg { font-weight: 600; color: #f97316; font-size: 13px; text-align: left; }

.wed-only { font-size: 9px; font-weight: 400; display: block; color: var(--text); }

.finish-note {
  margin-top: 16px;
  padding: 12px 16px;
  background: #22c55e18;
  border-radius: 8px;
  font-size: 13px;
  color: #22c55e;
  font-weight: 600;
}
</style>
