<template>
  <div v-if="loading" class="splash">
    <div class="splash-icon">🏀</div>
    <div class="splash-text">Loading…</div>
  </div>

  <!-- Not logged in -->
  <LoginPage v-else-if="!user" @logged-in="onLogin" />

  <!-- Pending approval -->
  <PendingPage v-else-if="user && userProfile && userProfile.status === 'pending'"
    :session="userProfile" @logout="doLogout" />

  <!-- Rejected -->
  <div v-else-if="user && userProfile && userProfile.status === 'rejected'" class="rejected-wrap">
    <div class="card rejected-card">
      <div style="font-size:40px">❌</div>
      <div class="rej-title">Account Not Approved</div>
      <p class="rej-desc">Your account was not approved. Please contact the admin on WhatsApp to resolve this.</p>
      <a href="https://wa.me/780960424" target="_blank" class="wa-btn">💬 WhatsApp: +780960424</a>
      <button class="logout-btn" @click="doLogout">Logout</button>
    </div>
  </div>

  <!-- Admin -->
  <div v-else-if="user && isAdmin(user.email)" id="app">
    <header class="app-header">
      <div class="header-inner">
        <div class="logo">
          <span class="logo-icon">🛡️</span>
          <div>
            <div class="logo-title">Admin Panel</div>
            <div class="logo-sub">Vertical Jump Program</div>
          </div>
        </div>
        <button class="logout-btn" @click="doLogout">Logout</button>
      </div>
    </header>
    <main class="main-content">
      <AdminPanel />
    </main>
  </div>

  <!-- Regular confirmed user -->
  <div v-else-if="user && userProfile" id="app">
    <header class="app-header">
      <div class="header-inner">
        <div class="logo">
          <span class="logo-icon">🏀</span>
          <div>
            <div class="logo-title">Vertical Jump Program</div>
            <div class="logo-sub">Train smart. Jump higher.</div>
          </div>
        </div>
        <div class="header-right">
          <span class="badge" :style="{ background: todayColor + '22', color: todayColor }">
            Today: {{ todayName }}
          </span>
          <span class="user-name-badge">👤 {{ userProfile.name }}</span>
          <button class="logout-btn" @click="doLogout">Logout</button>
        </div>
      </div>
      <nav class="tabs">
        <button
          v-for="tab in tabs" :key="tab.id"
          class="tab" :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >{{ tab.icon }} {{ tab.label }}</button>
      </nav>
    </header>

    <main class="main-content">
      <div v-if="activeTab === 'schedule'">
        <div class="section-title">📅 Weekly Schedule</div>
        <WeeklySchedule @select="goToWorkout" />
      </div>
      <div v-if="activeTab === 'workout'">
        <div class="section-title">🏋️ Gym Sessions</div>
        <WorkoutDetail />
      </div>
      <div v-if="activeTab === 'tracker'">
        <div class="section-title">📊 Weekly Tracker</div>
        <WeeklyTracker :uid="user.uid" />
      </div>
      <div v-if="activeTab === 'performance'">
        <div class="section-title">📈 Performance & Recovery</div>
        <PerformanceTracker :uid="user.uid" />
      </div>
      <div v-if="activeTab === 'airalert'">
        <div class="section-title">🏃 Air Alert® Program</div>
        <AirAlert :uid="user.uid" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onAuthChange, logout, getUserProfile, isAdmin } from './useAuth.js'
import LoginPage from './components/LoginPage.vue'
import PendingPage from './components/PendingPage.vue'
import AdminPanel from './components/AdminPanel.vue'
import WeeklySchedule from './components/WeeklySchedule.vue'
import WorkoutDetail from './components/WorkoutDetail.vue'
import WeeklyTracker from './components/WeeklyTracker.vue'
import PerformanceTracker from './components/PerformanceTracker.vue'
import AirAlert from './components/AirAlert.vue'

const loading = ref(true)
const user = ref(null)
const userProfile = ref(null)

let unsubscribe = null

onMounted(() => {
  unsubscribe = onAuthChange(async (firebaseUser) => {
    if (firebaseUser) {
      user.value = firebaseUser
      if (!isAdmin(firebaseUser.email)) {
        userProfile.value = await getUserProfile(firebaseUser.uid)
      } else {
        userProfile.value = { name: 'Admin', status: 'confirmed' }
      }
    } else {
      user.value = null
      userProfile.value = null
    }
    loading.value = false
  })
})

onUnmounted(() => { if (unsubscribe) unsubscribe() })

async function onLogin() {
  // auth state change handled by onAuthChange above
}

async function doLogout() {
  await logout()
}

const tabs = [
  { id: 'schedule',    icon: '📅', label: 'Schedule' },
  { id: 'workout',     icon: '🏋️', label: 'Workouts' },
  { id: 'tracker',     icon: '📊', label: 'Tracker' },
  { id: 'performance', icon: '📈', label: 'Performance' },
  { id: 'airalert',    icon: '🏃', label: 'Air Alert®' },
]
const activeTab = ref('schedule')

const dayColors = {
  Monday: '#f97316', Tuesday: '#6366f1', Wednesday: '#3b82f6',
  Thursday: '#6366f1', Friday: '#6366f1', Saturday: '#22c55e', Sunday: '#eab308'
}
const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const todayName = computed(() => dayNames[new Date().getDay()])
const todayColor = computed(() => dayColors[todayName.value] || '#f97316')

function goToWorkout(day) {
  if (['Monday','Wednesday','Saturday'].includes(day.name)) activeTab.value = 'workout'
}
</script>

<style>
.splash {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}
.splash-icon { font-size: 56px; animation: pulse 1.2s infinite; }
.splash-text { color: var(--text); font-size: 16px; }
@keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.15); } }

.rejected-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.rejected-card {
  max-width: 420px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 14px;
  align-items: center;
}
.rej-title { font-size: 20px; font-weight: 700; color: var(--text-h); }
.rej-desc { font-size: 14px; color: var(--text); line-height: 1.6; }
.wa-btn {
  background: #22c55e;
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  padding: 11px 20px;
  border-radius: 8px;
  text-decoration: none;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  padding: 16px 0 0;
  margin-bottom: 24px;
}
.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.logo { display: flex; align-items: center; gap: 12px; }
.logo-icon { font-size: 28px; }
.logo-title { font-size: 18px; font-weight: 700; color: var(--text-h); }
.logo-sub { font-size: 12px; color: var(--text); }
.header-right { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.user-name-badge { font-size: 13px; color: var(--text); font-weight: 600; }
.logout-btn {
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}
.logout-btn:hover { color: var(--accent); border-color: var(--accent); }
.tabs { display: flex; gap: 4px; overflow-x: auto; padding-bottom: 1px; }
.tab {
  padding: 9px 18px;
  border-radius: 8px 8px 0 0;
  border: 1px solid transparent;
  border-bottom: none;
  background: transparent;
  color: var(--text);
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s;
}
.tab:hover { color: var(--text-h); background: var(--surface); }
.tab.active {
  background: var(--surface);
  color: var(--accent);
  border-color: var(--border);
  border-bottom-color: var(--surface);
}
.main-content { padding-top: 4px; }
.section-title { font-size: 20px; font-weight: 700; color: var(--text-h); margin-bottom: 16px; }
</style>
