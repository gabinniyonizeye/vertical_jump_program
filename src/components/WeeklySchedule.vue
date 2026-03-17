<template>
  <div>
    <div class="schedule-grid">
      <div
        v-for="day in schedule"
        :key="day.name"
        class="day-card card"
        :class="{ active: today === day.name }"
        @click="$emit('select', day)"
      >
        <div class="day-top">
          <span class="day-name">{{ day.name }}</span>
          <span class="badge" :style="{ background: day.color + '22', color: day.color }">{{ day.type }}</span>
        </div>
        <div class="day-title">{{ day.title }}</div>
        <div class="day-location">📍 {{ day.location }}</div>
      </div>
    </div>

    <div class="info-row">
      <div class="card info-card">
        <div class="info-icon">🔥</div>
        <div>
          <div class="info-title">Warm-Up (Every Gym Session)</div>
          <div class="info-text">5 min jog/bike · Dynamic mobility · 2×5–8 light jumps</div>
        </div>
      </div>
      <div class="card info-card">
        <div class="info-icon">🧊</div>
        <div>
          <div class="info-title">Cooldown (After Gym)</div>
          <div class="info-text">Stretch hamstrings, quads, calves · Foam rolling · 8–10 min</div>
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
  { name: 'Monday',    type: 'Gym',      color: '#f97316', location: 'Gym',  title: 'Strength A — Squat Focus' },
  { name: 'Tuesday',   type: 'Home',     color: '#6366f1', location: 'Home', title: 'Air Alert' },
  { name: 'Wednesday', type: 'Gym',      color: '#3b82f6', location: 'Gym',  title: 'Strength B — Posterior Chain' },
  { name: 'Thursday',  type: 'Home',     color: '#6366f1', location: 'Home', title: 'Air Alert' },
  { name: 'Friday',    type: 'Home',     color: '#6366f1', location: 'Home', title: 'Air Alert' },
  { name: 'Saturday',  type: 'Gym',      color: '#22c55e', location: 'Gym',  title: 'Power C — Plyometrics' },
  { name: 'Sunday',    type: 'Recovery', color: '#eab308', location: 'Rest', title: 'Active Recovery' },
]

defineEmits(['select'])
</script>

<style scoped>
.schedule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}

.day-card {
  cursor: pointer;
  transition: border-color 0.2s, transform 0.15s;
  border-radius: 12px;
}

.day-card:hover { transform: translateY(-2px); border-color: #444; }
.day-card.active { border-color: var(--accent) !important; }

.day-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.day-name { font-weight: 700; color: var(--text-h); font-size: 15px; }
.day-title { color: var(--text-h); font-size: 14px; margin-bottom: 4px; }
.day-location { font-size: 12px; color: var(--text); }

.info-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.info-card {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.info-icon { font-size: 22px; flex-shrink: 0; }
.info-title { color: var(--text-h); font-weight: 600; font-size: 14px; margin-bottom: 4px; }
.info-text { font-size: 13px; }

@media (max-width: 600px) {
  .info-row { grid-template-columns: 1fr; }
}
</style>
