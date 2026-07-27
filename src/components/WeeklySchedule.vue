<template>
  <div>
    <div class="schedule-grid">
      <div
        v-for="day in schedule"
        :key="day.name"
        class="day-card card"
        :class="{ active: today === day.name }"
        @click="toggleComplete(day)"
      >
        <div class="day-top">
          <span class="day-name">{{ day.name }}</span>
          <span class="badge" :style="{ background: day.color + '22', color: day.color }">{{ day.type }}</span>
          <input type="checkbox" v-model="day.completed" class="complete-checkbox" @click.stop>
        </div>
        <div class="day-title">{{ day.title }}</div>
        <div class="day-focus">🎯 {{ day.focus }}</div>
        <div class="session-item">💪 Gym: {{ day.gym }}</div>
        <div class="session-item">🏀 Basketball: {{ day.basketball }}</div>
        <div class="session-item">🧘 Mobility: {{ day.mobility }}</div>
        <div class="duration">⏱️ {{ day.duration }}</div>
        <div class="status" :class="{ completed: day.completed }">{{ day.completed ? '✓ Completed' : 'Pending' }}</div>
      </div>
    </div>

    <div class="info-row">
      <div class="card info-card">
        <div class="info-icon">🔥</div>
        <div>
          <div class="info-title">Daily Non-Negotiables</div>
          <div class="info-text">Morning mobility 15–20 min · Every single day</div>
        </div>
      </div>
      <div class="card info-card">
        <div class="info-icon">😴</div>
        <div>
          <div class="info-title">Sleep & Recovery</div>
          <div class="info-text">8–9 hours · No phone 30 min before bed</div>
        </div>
      </div>
    </div>

    <div class="weekly-summary card">
      <div class="summary-title">📊 Weekly Volume</div>
      <div class="summary-grid">
        <div v-for="s in weeklySummary" :key="s.label" class="summary-item">
          <span class="summary-icon">{{ s.icon }}</span>
          <span class="summary-val">{{ s.val }}</span>
          <span class="summary-label">{{ s.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const today = computed(() => days[new Date().getDay()])

const schedule = [
  {
    name: 'Monday', type: 'Strength', color: '#f97316', location: 'Gym + Court',
    title: 'Lower Body Strength',
    focus: 'Squat, RDL, Nordic Curl, Ball Handling',
    tags: ['Gym','Basketball','Core'],
    gym: 'Squats, RDL, Nordic Curls - 45 min',
    basketball: 'Ball Handling, Footwork - 30 min',
    mobility: 'Hip Mobility, Stretching - 15 min',
    duration: '90 min',
    completed: false,
  },
  {
    name: 'Tuesday', type: 'Speed', color: '#6366f1', location: 'Track + Court',
    title: 'Speed & Explosiveness',
    focus: 'Sprints, Plyometrics, Shooting',
    tags: ['Sprints','Plyos','Shooting'],
    gym: 'Plyometrics, Box Jumps - 30 min',
    basketball: 'Sprints, Shooting - 45 min',
    mobility: 'Dynamic Stretching - 10 min',
    duration: '85 min',
    completed: false,
  },
  {
    name: 'Wednesday', type: 'Upper', color: '#3b82f6', location: 'Gym + Court',
    title: 'Upper Body',
    focus: 'Bench, Pull-ups, OHP, Finishing',
    tags: ['Gym','Finishing','Film'],
    gym: 'Bench, Pull-ups, OHP - 50 min',
    basketball: 'Finishing Drills - 30 min',
    mobility: 'Shoulder Mobility - 15 min',
    duration: '95 min',
    completed: false,
  },
  {
    name: 'Thursday', type: 'Skill', color: '#8b5cf6', location: 'Court',
    title: 'Skill Day',
    focus: 'Ball Handling, Shooting, 1v1–3v3',
    tags: ['Handles','Shooting','IQ'],
    gym: 'Light Weights - 20 min',
    basketball: 'Ball Handling, 1v1, 3v3 - 60 min',
    mobility: 'Cool Down Stretching - 10 min',
    duration: '90 min',
    completed: false,
  },
  {
    name: 'Friday', type: 'Compete', color: '#ef4444', location: 'Court',
    title: 'Competition Day',
    focus: 'Defense, Finishing, Decision Making',
    tags: ['1v1','3v3','5v5'],
    gym: 'Warm-up Strength - 15 min',
    basketball: '5v5 Games, Competition - 75 min',
    mobility: 'Recovery Stretching - 10 min',
    duration: '100 min',
    completed: false,
  },
  {
    name: 'Saturday', type: 'Power', color: '#22c55e', location: 'Gym + Court',
    title: 'Power Day',
    focus: 'Deadlift, Hip Thrust, Box Jumps, Transition',
    tags: ['Gym','Power','Court'],
    gym: 'Deadlift, Hip Thrust, Box Jumps - 50 min',
    basketball: 'Transition Drills - 35 min',
    mobility: 'Foam Rolling - 15 min',
    duration: '100 min',
    completed: false,
  },
  {
    name: 'Sunday', type: 'Recovery', color: '#eab308', location: 'Rest',
    title: 'Active Recovery',
    focus: 'Walk, Mobility, Foam Roll, Film',
    tags: ['Walk','Mobility','Film'],
    gym: 'Light Movement - 15 min',
    basketball: 'Film Review - 30 min',
    mobility: 'Full Body Mobility - 30 min',
    duration: '75 min',
    completed: false,
  },
]

const weeklySummary = [
  { icon: '💪', val: '2–3×', label: 'Strength' },
  { icon: '🏀', val: '5–6×', label: 'Basketball' },
  { icon: '🧘', val: '7×',   label: 'Mobility' },
  { icon: '🎯', val: '4–5×', label: 'Shooting' },
  { icon: '⚡', val: '5–6×', label: 'Handles' },
  { icon: '😴', val: '1×',   label: 'Recovery' },
]

const toggleComplete = (day) => {
  day.completed = !day.completed
}
</script>

<style scoped>
.schedule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px;
  margin-bottom: 14px;
}
.day-card {
  cursor: pointer;
  transition: all 0.25s;
  display: flex; flex-direction: column; gap: 5px;
  position: relative; overflow: hidden;
}
.day-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--accent2));
  opacity: 0;
  transition: opacity 0.2s;
}
.day-card:hover { transform: translateY(-3px); border-color: var(--border2); box-shadow: 0 8px 24px rgba(0,0,0,0.4); }
.day-card:hover::before { opacity: 1; }
.day-card.active { border-color: var(--accent) !important; box-shadow: 0 0 0 1px var(--accent-dim), 0 8px 24px rgba(249,115,22,0.15); }
.day-card.active::before { opacity: 1; }
.day-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.day-name { font-weight: 800; color: var(--text-h); font-size: 15px; }
.day-title { color: var(--text-h); font-size: 13px; font-weight: 600; }
.day-focus { font-size: 11px; color: var(--text); margin: 4px 0; }
.session-item { font-size: 11px; color: var(--text); line-height: 1.3; }
.duration { font-size: 11px; color: var(--accent); font-weight: 700; margin: 4px 0; }
.status { font-size: 11px; font-weight: 600; color: var(--text); margin-top: 4px; }
.status.completed { color: var(--green); }
.complete-checkbox { width: 18px; height: 18px; cursor: pointer; flex-shrink: 0; accent-color: var(--accent); }

.info-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
.info-card { display: flex; gap: 12px; align-items: flex-start; }
.info-icon { font-size: 24px; flex-shrink: 0; }
.info-title { color: var(--text-h); font-weight: 700; font-size: 13px; margin-bottom: 3px; }
.info-text { font-size: 12px; color: var(--text); }

.weekly-summary { }
.summary-title { font-size: 13px; font-weight: 700; color: var(--text-h); margin-bottom: 12px; }
.summary-grid { display: flex; justify-content: space-between; gap: 4px; }
.summary-item { display: flex; flex-direction: column; align-items: center; gap: 3px; flex: 1; }
.summary-icon { font-size: 18px; }
.summary-val { font-size: 14px; font-weight: 800; color: var(--accent); }
.summary-label { font-size: 9px; color: var(--text); font-weight: 600; text-transform: uppercase; letter-spacing: 0.3px; text-align: center; }

@media (max-width: 600px) {
  .info-row { grid-template-columns: 1fr; }
}
</style>
