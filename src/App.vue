<template>
  <!-- Splash -->
  <div v-if="loading" class="splash">
    <img src="/NYIRABYOFinal-01.png" class="splash-logo" alt="NYIRABYO Basketball" />
    <div class="splash-brand-inline">NYIRABYO <span>Basketball</span></div>
    <div class="splash-sub">Loading your journey…</div>
    <div class="splash-dots">
      <div class="splash-dot"></div>
      <div class="splash-dot"></div>
      <div class="splash-dot"></div>
    </div>
  </div>

  <!-- Not logged in -->
  <LoginPage v-else-if="!user" @logged-in="onLogin" />

  <!-- Pending -->
  <div v-else-if="userProfile?.status === 'pending'" class="status-screen">
    <div class="status-card card glow-border">
      <div class="status-icon">⏳</div>
      <div class="status-title">Awaiting Approval</div>
      <p class="status-desc">Your account is being reviewed. You'll be notified once confirmed.</p>
      <a href="https://wa.me/250780960424" target="_blank" class="wa-btn">💬 WhatsApp: +250780960424</a>
      <button class="btn-ghost" @click="doLogout">Sign Out</button>
    </div>
  </div>

  <!-- Rejected -->
  <div v-else-if="userProfile?.status === 'rejected'" class="status-screen">
    <div class="status-card card" style="border-color:var(--red);box-shadow:0 0 0 1px #ef444422,inset 0 0 20px #ef444411">
      <div class="status-icon">❌</div>
      <div class="status-title">Account Not Approved</div>
      <p class="status-desc">Contact admin to resolve this issue.</p>
      <a href="https://wa.me/250780960424" target="_blank" class="wa-btn">💬 WhatsApp: +250780960424</a>
      <button class="btn-ghost" @click="doLogout">Sign Out</button>
    </div>
  </div>

  <!-- Admin -->
  <div v-else-if="user && isAdmin(user.email)" class="app-shell">
    <header class="app-header">
      <div class="header-brand">
        <img src="/NYIRABYOFinal-01.png" class="header-logo-img" alt="NYIRABYO" />
        <div>
          <div class="header-title">NYIRABYO <span>Basketball</span></div>
          <div class="header-sub">🔐 Admin Panel</div>
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
  <div v-else-if="user && userProfile" class="app-shell desktop-grid">

    <!-- Sidebar (desktop only) -->
    <nav class="sidebar-nav">
      <div class="sidebar-logo">
        <img src="/NYIRABYOFinal-01.png" alt="NYIRABYO" />
        <div class="sidebar-logo-text">NYIRABYO <span>Bball</span></div>
      </div>

      <div class="sidebar-items">
        <div class="sidebar-section-label">Overview</div>
        <button v-for="n in navGroups.overview" :key="n.id"
          class="sidebar-item" :class="{ active: tab === n.id }"
          @click="tab = n.id">
          <span class="s-icon">{{ n.icon }}</span>
          <span>{{ n.label }}</span>
        </button>

        <div class="sidebar-section-label">Training</div>
        <button v-for="n in navGroups.training" :key="n.id"
          class="sidebar-item" :class="{ active: tab === n.id }"
          @click="tab = n.id">
          <span class="s-icon">{{ n.icon }}</span>
          <span>{{ n.label }}</span>
        </button>

        <div class="sidebar-section-label">Skills</div>
        <button v-for="n in navGroups.skills" :key="n.id"
          class="sidebar-item" :class="{ active: tab === n.id }"
          @click="tab = n.id">
          <span class="s-icon">{{ n.icon }}</span>
          <span>{{ n.label }}</span>
        </button>

        <div class="sidebar-section-label">More</div>
        <button v-for="n in navGroups.more" :key="n.id"
          class="sidebar-item" :class="{ active: tab === n.id }"
          @click="tab = n.id">
          <span class="s-icon">{{ n.icon }}</span>
          <span>{{ n.label }}</span>
        </button>
      </div>

      <div class="sidebar-footer">
        <div class="xp-pill" style="margin-bottom:10px">
          <span class="xp-icon">⭐</span>
          <span class="xp-val">Level {{ playerLevel }} — {{ firstName }}</span>
        </div>
        <button class="btn-ghost" style="width:100%;text-align:left" @click="doLogout">🚪 Sign Out</button>
      </div>
    </nav>

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
        <button class="btn-ghost" @click="doLogout" style="padding:6px 10px;font-size:12px">Out</button>
      </div>
    </header>

    <!-- Page content -->
    <main class="app-main">
      <Dashboard         v-if="tab === 'home'"         :uid="user.uid" :profile="userProfile" @go="tab = $event" />
      <DailyDashboard    v-if="tab === 'daily'"        :uid="user.uid" @go="tab = $event" />
      <MobilityModule    v-if="tab === 'mobility'" />
      <LowerBodyStrength v-if="tab === 'lower'" />
      <UpperBodyStrength v-if="tab === 'upper'" />
      <ExplosiveTraining v-if="tab === 'explosive'" />
      <TrainingModules   v-if="tab === 'train'"        :profile="userProfile" />
      <WeeklySchedule    v-if="tab === 'schedule'" />
      <BallHandling      v-if="tab === 'ballhandling'" />
      <SpeedAgility      v-if="tab === 'speed'" />
      <ProgressPage      v-if="tab === 'progress'"     :uid="user.uid" :profile="userProfile" />
      <Tools             v-if="tab === 'tools'" />
      <Community         v-if="tab === 'community'"    :profile="userProfile" />
      <Shooting          v-if="tab === 'shooting'"     :profile="userProfile" />
      <Finishing         v-if="tab === 'finishing'"    :profile="userProfile" />
      <BasketballIQ      v-if="tab === 'iq'"           :profile="userProfile" />
      <Recovery          v-if="tab === 'recovery'"     :profile="userProfile" />
      <Nutrition         v-if="tab === 'nutrition'"    :profile="userProfile" />
      <ProfilePage       v-if="tab === 'profile'"      :uid="user.uid" :profile="userProfile" @saved="onProfileSaved" />
    </main>

    <!-- Bottom Nav (mobile only) -->
    <nav class="bottom-nav">
      <button v-for="n in bottomNavItems" :key="n.id"
        class="nav-item" :class="{ active: n.id === 'more' ? moreOpen || isMoreTab : tab === n.id }"
        @click="n.id === 'more' ? moreOpen = !moreOpen : (tab = n.id, moreOpen = false)">
        <span class="nav-icon">{{ n.icon }}</span>
        <span>{{ n.label }}</span>
      </button>
    </nav>

    <!-- More Drawer (mobile only) -->
    <Transition name="drawer">
      <div v-if="moreOpen" class="more-overlay" @click.self="moreOpen = false">
        <div class="more-drawer">
          <div class="more-drawer-handle"></div>
          <div v-for="group in moreGroups" :key="group.label">
            <div class="more-group-label">{{ group.label }}</div>
            <div class="more-grid">
              <button v-for="n in group.items" :key="n.id"
                class="more-item" :class="{ active: tab === n.id }"
                @click="tab = n.id; moreOpen = false">
                <span class="more-icon">{{ n.icon }}</span>
                <span>{{ n.label }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { onAuthChange, logout, getUserProfile, isAdmin } from './useAuth.js'
import LoginPage from './components/LoginPage.vue'
import AdminPanel from './components/AdminPanel.vue'
import PlayerOnboarding from './components/PlayerOnboarding.vue'
import Dashboard from './components/Dashboard.vue'
import DailyDashboard from './components/DailyDashboard.vue'
import MobilityModule from './components/MobilityModule.vue'
import LowerBodyStrength from './components/LowerBodyStrength.vue'
import UpperBodyStrength from './components/UpperBodyStrength.vue'
import ExplosiveTraining from './components/ExplosiveTraining.vue'
import TrainingModules from './components/TrainingModules.vue'
import WeeklySchedule from './components/WeeklySchedule.vue'
import BallHandling from './components/BallHandling.vue'
import SpeedAgility from './components/SpeedAgility.vue'
import ProgressPage from './components/ProgressPage.vue'
import Tools from './components/Tools.vue'
import Community from './components/Community.vue'
import Shooting from './components/Shooting.vue'
import Finishing from './components/Finishing.vue'
import BasketballIQ from './components/BasketballIQ.vue'
import Recovery from './components/Recovery.vue'
import Nutrition from './components/Nutrition.vue'
import ProfilePage from './components/ProfilePage.vue'

const loading = ref(true)
const user = ref(null)
const userProfile = ref(null)
const tab = ref('home')
const moreOpen = ref(false)

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

function onProfileSaved(profile) {
  userProfile.value = { ...userProfile.value, ...profile }
}

async function doLogout() { await logout() }

const navItems = [
  { id: 'home',        icon: '🏠', label: 'Home' },
  { id: 'daily',       icon: '📋', label: 'Daily' },
  { id: 'mobility',    icon: '🧘', label: 'Mobility' },
  { id: 'lower',       icon: '🦵', label: 'Lower' },
  { id: 'upper',       icon: '💪', label: 'Upper' },
  { id: 'explosive',   icon: '⚡', label: 'Explosive' },
  { id: 'train',       icon: '🏀', label: 'Train' },
  { id: 'progress',    icon: '📈', label: 'Progress' },
  { id: 'tools',       icon: '🔧', label: 'Tools' },
  { id: 'community',   icon: '👥', label: 'Community' },
  { id: 'shooting',    icon: '🎯', label: 'Shooting' },
  { id: 'finishing',   icon: '🏀', label: 'Finishing' },
  { id: 'iq',          icon: '🧠', label: 'IQ' },
  { id: 'recovery',    icon: '🧊', label: 'Recovery' },
  { id: 'nutrition',   icon: '🥗', label: 'Nutrition' },
  { id: 'profile',     icon: '👤', label: 'Profile' },
]

const bottomNavItems = [
  { id: 'home',     icon: '🏠', label: 'Home' },
  { id: 'daily',    icon: '📋', label: 'Daily' },
  { id: 'train',    icon: '🏀', label: 'Train' },
  { id: 'progress', icon: '📈', label: 'Progress' },
  { id: 'more',     icon: '☰',  label: 'More' },
]

const moreGroups = [
  { label: 'Training', items: [
    { id: 'mobility',    icon: '🧘', label: 'Mobility' },
    { id: 'lower',       icon: '🦵', label: 'Lower Body' },
    { id: 'upper',       icon: '💪', label: 'Upper Body' },
    { id: 'explosive',   icon: '⚡', label: 'Explosive' },
    { id: 'speed',       icon: '🏃', label: 'Speed' },
    { id: 'schedule',    icon: '📅', label: 'Schedule' },
  ]},
  { label: 'Skills', items: [
    { id: 'ballhandling', icon: '🏀', label: 'Ball Handling' },
    { id: 'shooting',     icon: '🎯', label: 'Shooting' },
    { id: 'finishing',    icon: '🔥', label: 'Finishing' },
    { id: 'iq',           icon: '🧠', label: 'IQ' },
  ]},
  { label: 'More', items: [
    { id: 'recovery',   icon: '🧊', label: 'Recovery' },
    { id: 'nutrition',  icon: '🥗', label: 'Nutrition' },
    { id: 'tools',      icon: '🔧', label: 'Tools' },
    { id: 'community',  icon: '👥', label: 'Community' },
    { id: 'profile',    icon: '👤', label: 'Profile' },
  ]},
]

const moreTabIds = moreGroups.flatMap(g => g.items.map(i => i.id))
const isMoreTab = computed(() => moreTabIds.includes(tab.value))

const navGroups = {
  overview: [
    { id: 'home',      icon: '🏠', label: 'Home' },
    { id: 'daily',     icon: '📋', label: 'Daily Plan' },
    { id: 'schedule',  icon: '📅', label: 'Schedule' },
    { id: 'progress',  icon: '📈', label: 'Progress' },
    { id: 'profile',   icon: '👤', label: 'Profile' },
  ],
  training: [
    { id: 'mobility',  icon: '🧘', label: 'Mobility' },
    { id: 'lower',     icon: '🦵', label: 'Lower Body' },
    { id: 'upper',     icon: '💪', label: 'Upper Body' },
    { id: 'explosive', icon: '⚡', label: 'Explosive' },
    { id: 'speed',     icon: '🏃', label: 'Speed & Agility' },
    { id: 'train',     icon: '🏀', label: 'All Modules' },
  ],
  skills: [
    { id: 'ballhandling', icon: '🏀', label: 'Ball Handling' },
    { id: 'shooting',     icon: '🎯', label: 'Shooting' },
    { id: 'finishing',    icon: '🔥', label: 'Finishing' },
    { id: 'iq',           icon: '🧠', label: 'Basketball IQ' },
  ],
  more: [
    { id: 'recovery',   icon: '🧊', label: 'Recovery' },
    { id: 'nutrition',  icon: '🥗', label: 'Nutrition' },
    { id: 'tools',      icon: '🔧', label: 'Tools' },
    { id: 'community',  icon: '👥', label: 'Community' },
  ],
}

const firstName = computed(() => userProfile.value?.name?.split(' ')[0] || 'Athlete')

const hour = new Date().getHours()
const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

const playerLevel = computed(() => {
  // Matches Dashboard XP system: 500 XP per level
  const xp = (userProfile.value?.totalXP || 0)
  return Math.floor(xp / 500) + 1
})
</script>

<style>
/* All design tokens live in style.css — only component-specific overrides here */
</style>
