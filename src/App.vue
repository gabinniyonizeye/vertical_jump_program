<template>
  <!-- Splash -->
  <div v-if="loading" class="splash">
    <img src="/NYIRABYOFinal-01.png" class="splash-logo" alt="NYIRABYO Basketball" />
    <div class="splash-brand">NYIRABYO <span>Basketball</span></div>
    <div class="splash-sub">Loading your journey…</div>
  </div>

  <!-- Not logged in -->
  <LoginPage v-else-if="!user" @logged-in="onLogin" />

  <!-- Pending -->
  <div v-else-if="userProfile?.status === 'pending'" class="status-screen">
    <div class="status-card card">
      <div class="status-icon">⏳</div>
      <div class="status-title">Awaiting Approval</div>
      <p class="status-desc">Your account is being reviewed. You'll be notified once confirmed.</p>
      <a href="https://wa.me/250780960424" target="_blank" class="wa-btn">💬 WhatsApp: +250780960424</a>
      <button class="btn-ghost" @click="doLogout">Sign Out</button>
    </div>
  </div>

  <!-- Rejected -->
  <div v-else-if="userProfile?.status === 'rejected'" class="status-screen">
    <div class="status-card card">
      <div class="status-icon">❌</div>
      <div class="status-title">Account Not Approved</div>
      <p class="status-desc">Contact admin to resolve this issue.</p>
      <a href="https://wa.me/250780960424" target="_blank" class="wa-btn">💬 WhatsApp: +250780960424</a>
      <button class="btn-ghost" @click="doLogout">Sign Out</button>
    </div>
  </div>

  <!-- Admin -->
  <div v-else-if="user && isAdmin(user.email)" id="app">
    <header class="app-header">
      <div class="header-brand">
        <img src="/NYIRABYOFinal-01.png" class="header-logo-img" alt="NYIRABYO" />
        <div>
          <div class="header-title">NYIRABYO <span>Basketball</span></div>
          <div class="header-sub">Admin Panel</div>
        </div>
      </div>
      <button class="btn-ghost" @click="doLogout">Sign Out</button>
    </header>
    <AdminPanel />
  </div>

  <!-- Onboarding (new user, profile not complete) -->
  <PlayerOnboarding
    v-else-if="user && userProfile && !userProfile.profileComplete"
    :uid="user.uid"
    @done="onProfileDone"
  />

  <!-- Main App -->
  <div v-else-if="user && userProfile" id="app">
    <!-- Header -->
    <header class="app-header">
      <div class="header-brand">
        <img src="/NYIRABYOFinal-01.png" class="header-logo-img" alt="NYIRABYO" />
        <div>
          <div class="header-title">NYIRABYO <span>Basketball</span></div>
          <div class="header-sub">{{ greeting }}, {{ firstName }} 👋</div>
        </div>
      </div>
      <div class="header-actions">
        <div class="xp-pill">
          <span class="xp-icon">⭐</span>
          <span class="xp-val">Lv {{ playerLevel }}</span>
        </div>
        <button class="btn-ghost" @click="doLogout" style="padding:6px 10px;font-size:12px">Sign Out</button>
      </div>
    </header>

    <!-- Page content -->
    <main>
      <Dashboard      v-if="tab === 'home'"      :uid="user.uid" :profile="userProfile" @go="tab = $event" />
      <TrainingModules v-if="tab === 'train'"    :profile="userProfile" />
      <ProgressTracker v-if="tab === 'progress'" :uid="user.uid" :profile="userProfile" />
      <Tools           v-if="tab === 'tools'"    />
      <Community       v-if="tab === 'community'" :profile="userProfile" />
    </main>

    <!-- Bottom Nav -->
    <nav class="bottom-nav">
      <button v-for="n in navItems" :key="n.id"
        class="nav-item" :class="{ active: tab === n.id }"
        @click="tab = n.id">
        <span class="nav-icon">{{ n.icon }}</span>
        <span>{{ n.label }}</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onAuthChange, logout, getUserProfile, isAdmin } from './useAuth.js'
import LoginPage from './components/LoginPage.vue'
import AdminPanel from './components/AdminPanel.vue'
import PlayerOnboarding from './components/PlayerOnboarding.vue'
import Dashboard from './components/Dashboard.vue'
import TrainingModules from './components/TrainingModules.vue'
import ProgressTracker from './components/ProgressTracker.vue'
import Tools from './components/Tools.vue'
import Community from './components/Community.vue'

const loading = ref(true)
const user = ref(null)
const userProfile = ref(null)
const tab = ref('home')

let unsubscribe = null

onMounted(() => {
  unsubscribe = onAuthChange(async (firebaseUser) => {
    if (firebaseUser) {
      user.value = firebaseUser
      if (!isAdmin(firebaseUser.email)) {
        userProfile.value = await getUserProfile(firebaseUser.uid)
      } else {
        userProfile.value = { name: 'Admin', status: 'confirmed', profileComplete: true }
      }
    } else {
      user.value = null
      userProfile.value = null
    }
    loading.value = false
  })
})

onUnmounted(() => { if (unsubscribe) unsubscribe() })

async function onLogin() {}

async function onProfileDone(profile) {
  userProfile.value = { ...userProfile.value, ...profile, profileComplete: true }
}

async function doLogout() { await logout() }

const navItems = [
  { id: 'home',      icon: '🏠', label: 'Home' },
  { id: 'train',     icon: '🏀', label: 'Train' },
  { id: 'progress',  icon: '📈', label: 'Progress' },
  { id: 'tools',     icon: '🔧', label: 'Tools' },
  { id: 'community', icon: '👥', label: 'Community' },
]

const firstName = computed(() => userProfile.value?.name?.split(' ')[0] || 'Athlete')

const hour = new Date().getHours()
const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

const playerLevel = computed(() => {
  // Simple level based on profile completeness
  return userProfile.value?.profileComplete ? 1 : 0
})
</script>

<style>
/* Status screens */
.status-screen {
  min-height: 100vh;
  display: flex; align-items: center; justify-content: center;
  padding: 24px;
}
.status-card {
  max-width: 380px; width: 100%;
  text-align: center;
  display: flex; flex-direction: column;
  align-items: center; gap: 14px;
}
.status-icon { font-size: 48px; }
.status-title { font-size: 20px; font-weight: 800; color: var(--text-h); }
.status-desc { font-size: 14px; color: var(--text); line-height: 1.6; }
.wa-btn {
  background: #16a34a; color: #fff;
  font-weight: 700; font-size: 14px;
  padding: 12px 24px; border-radius: var(--radius-sm);
  text-decoration: none; width: 100%; text-align: center; display: block;
}

/* XP pill in header */
.xp-pill {
  display: flex; align-items: center; gap: 4px;
  background: var(--surface2); border: 1px solid var(--border);
  border-radius: 99px; padding: 5px 10px;
}
.xp-icon { font-size: 13px; }
.splash-brand {
  font-size: 18px;
  font-weight: 900;
  color: var(--text-h);
  letter-spacing: -0.3px;
  margin-top: -4px;
}
.splash-brand span { color: var(--accent); }

.splash-logo {
  width: 140px;
  object-fit: contain;
  animation: fadeUp 0.6s ease both;
}

.header-logo-img {
  height: 28px;
  width: auto;
  object-fit: contain;
  flex-shrink: 0;
}
</style>
