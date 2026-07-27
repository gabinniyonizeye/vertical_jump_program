<template>
  <div class="auth-root">
    <!-- Hero -->
    <div class="auth-hero">
      <div class="auth-hero-lines"></div>
      <img src="/NYIRABYOFinal-01.png" class="hero-logo" alt="NYIRABYO Basketball" />
      <div class="hero-brand">NYIRABYO <span>Basketball</span></div>
      <div class="hero-tagline">Your basketball journey starts here.</div>
      <div class="hero-stats">
        <div class="hero-stat"><div class="hero-stat-val">7</div><div class="hero-stat-label">Days/Week</div></div>
        <div class="hero-stat"><div class="hero-stat-val">4</div><div class="hero-stat-label">Months</div></div>
        <div class="hero-stat"><div class="hero-stat-val">1</div><div class="hero-stat-label">Goal</div></div>
      </div>
    </div>

    <div class="auth-body">
      <!-- Tabs -->
      <div class="auth-tabs">
        <button :class="{ active: mode === 'login' }" @click="mode = 'login'; err = ''">Sign In</button>
        <button :class="{ active: mode === 'signup' }" @click="mode = 'signup'; err = ''">Join Now</button>
      </div>

      <!-- LOGIN -->
      <form v-if="mode === 'login'" @submit.prevent="doLogin" class="auth-form fade-up">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input v-model="email" type="email" placeholder="your@email.com" required autocomplete="email" />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input v-model="password" type="password" placeholder="Your password" required autocomplete="current-password" />
        </div>
        <div v-if="err" class="auth-err">{{ err }}</div>
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Signing in…' : 'Sign In →' }}
        </button>
      </form>

      <!-- SIGNUP -->
      <form v-if="mode === 'signup'" @submit.prevent="doSignup" class="auth-form fade-up">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input v-model="name" type="text" placeholder="Your name" required />
        </div>
        <div class="form-group">
          <label class="form-label">Email</label>
          <input v-model="email" type="email" placeholder="your@email.com" required autocomplete="email" />
        </div>
        <div class="form-group">
          <label class="form-label">Password</label>
          <input v-model="password" type="password" placeholder="Create a strong password" required autocomplete="new-password" />
        </div>

        <div class="payment-box">
          <div class="pay-header">
            <span class="pay-icon">💳</span>
            <div>
              <div class="pay-title">Activation Fee — 1,000 FRW</div>
              <div class="pay-sub">One-time payment via Mobile Money</div>
            </div>
          </div>
          <div class="pay-code">*182*8*1*437986*1000#</div>
          <p class="pay-desc">Dial the code above, complete the payment, then check the box below.</p>
          <label class="pay-check-label">
            <input type="checkbox" v-model="paidCheck" class="pay-checkbox" required />
            <span>I have paid 1,000 FRW via Mobile Money</span>
          </label>
        </div>

        <div v-if="err" class="auth-err">{{ err }}</div>
        <button type="submit" class="btn-primary" :disabled="!paidCheck || loading">
          {{ loading ? 'Creating account…' : 'Create Account →' }}
        </button>
        <p class="auth-note">Your account will be reviewed by admin before activation.</p>
      </form>

      <!-- SUCCESS -->
      <div v-if="mode === 'done'" class="done-box fade-up">
        <img src="/NYIRABYOFinal-01.png" class="done-logo" alt="NYIRABYO" />
        <div class="done-title">You're on the court!</div>
        <p class="done-desc">Your account has been submitted. Once the admin confirms your payment, you'll be ready to start your basketball journey.</p>
        <a href="https://wa.me/250780960424" target="_blank" class="wa-btn">💬 WhatsApp Support</a>
        <button class="btn-secondary" @click="mode = 'login'">Back to Sign In</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { login, signup } from '../useAuth.js'

const emit = defineEmits(['logged-in'])

const mode = ref('login')
const name = ref('')
const email = ref('')
const password = ref('')
const paidCheck = ref(false)
const err = ref('')
const loading = ref(false)

async function doLogin() {
  err.value = ''
  loading.value = true
  const res = await login(email.value, password.value)
  loading.value = false
  if (res.ok) {
    emit('logged-in')
  } else if (res.error === 'pending') {
    err.value = '⏳ Your account is pending admin approval.'
  } else if (res.error === 'rejected') {
    err.value = '❌ Account not approved. Contact admin: +250780960424'
  } else {
    err.value = res.error
  }
}

async function doSignup() {
  err.value = ''
  if (!paidCheck.value) { err.value = 'Please confirm you have paid.'; return }
  loading.value = true
  const res = await signup(name.value, email.value, password.value)
  loading.value = false
  if (res.ok) {
    mode.value = 'done'
  } else {
    err.value = res.error
  }
}
</script>

<style scoped>
.auth-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg);
}

.auth-hero {
  background: linear-gradient(160deg, #1f0800 0%, #120010 40%, #06060f 100%);
  padding: 52px 24px 40px;
  text-align: center;
  border-bottom: 1px solid rgba(249,115,22,0.15);
  position: relative;
  overflow: hidden;
}
.auth-hero::before {
  content: '';
  position: absolute;
  top: -80px; left: 50%; transform: translateX(-50%);
  width: 360px; height: 360px;
  background: radial-gradient(circle, rgba(249,115,22,0.18) 0%, transparent 65%);
  pointer-events: none;
}
.auth-hero::after {
  content: '';
  position: absolute;
  bottom: -40px; right: -40px;
  width: 180px; height: 180px;
  background: radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 65%);
  pointer-events: none;
}
/* Court lines decoration */
.auth-hero-lines {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.04;
  background-image:
    linear-gradient(0deg, transparent 49%, rgba(255,255,255,0.8) 49%, rgba(255,255,255,0.8) 51%, transparent 51%),
    linear-gradient(90deg, transparent 49%, rgba(255,255,255,0.8) 49%, rgba(255,255,255,0.8) 51%, transparent 51%);
  background-size: 60px 60px;
}

.hero-logo {
  width: 120px;
  object-fit: contain;
  margin-bottom: 14px;
  animation: splashPop 0.7s cubic-bezier(0.34,1.56,0.64,1) both;
  filter: drop-shadow(0 0 20px rgba(249,115,22,0.5));
  position: relative; z-index: 1;
}
.hero-brand {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 900;
  color: var(--text-h);
  letter-spacing: 1px;
  text-transform: uppercase;
  margin-bottom: 8px;
  position: relative; z-index: 1;
}
.hero-brand span { color: var(--accent); }
.hero-tagline {
  font-size: 13px;
  color: var(--text);
  font-weight: 500;
  position: relative; z-index: 1;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}
.hero-tagline::before, .hero-tagline::after {
  content: '';
  width: 20px; height: 1px;
  background: var(--border2);
}
.hero-stats {
  display: flex; justify-content: center; gap: 24px;
  margin-top: 20px;
  position: relative; z-index: 1;
}
.hero-stat { text-align: center; }
.hero-stat-val { font-size: 20px; font-weight: 900; color: var(--accent); }
.hero-stat-label { font-size: 10px; color: var(--text); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }

.auth-body {
  flex: 1;
  padding: 24px 20px 48px;
  max-width: 440px;
  width: 100%;
  margin: 0 auto;
}

.auth-tabs {
  display: flex;
  background: var(--surface2);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 24px;
  gap: 4px;
  border: 1px solid var(--border);
}
.auth-tabs button {
  flex: 1;
  padding: 11px;
  border-radius: 9px;
  font-size: 14px;
  font-weight: 700;
  background: transparent;
  color: var(--text);
  transition: all 0.25s;
}
.auth-tabs button.active {
  background: linear-gradient(135deg, var(--accent), #ea6a0a);
  color: #fff;
  box-shadow: var(--shadow-accent);
}

.auth-form { display: flex; flex-direction: column; gap: 14px; }

.auth-err {
  background: rgba(239,68,68,0.1);
  border: 1px solid var(--red);
  color: #fca5a5;
  border-radius: var(--radius-sm);
  padding: 11px 14px;
  font-size: 13px;
  font-weight: 500;
  display: flex; align-items: center; gap: 8px;
}
.auth-note {
  font-size: 12px;
  color: var(--text);
  text-align: center;
  line-height: 1.5;
}

/* Payment */
.payment-box {
  background: linear-gradient(135deg, rgba(249,115,22,0.06), rgba(15,15,30,0.8));
  border: 1.5px solid rgba(249,115,22,0.4);
  border-radius: var(--radius);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 0 24px rgba(249,115,22,0.08);
}
.pay-header { display: flex; align-items: center; gap: 12px; }
.pay-icon { font-size: 26px; }
.pay-title { font-weight: 700; color: var(--accent); font-size: 14px; }
.pay-sub { font-size: 12px; color: var(--text); }
.pay-code {
  font-family: 'Courier New', monospace;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-h);
  background: var(--surface3);
  border-radius: var(--radius-sm);
  padding: 14px;
  text-align: center;
  letter-spacing: 2px;
  border: 1px solid var(--border2);
  box-shadow: inset 0 2px 8px rgba(0,0,0,0.3);
}
.pay-desc { font-size: 13px; color: var(--text); line-height: 1.5; }
.pay-check-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: var(--text-h);
  font-weight: 600;
  cursor: pointer;
  padding: 10px;
  background: var(--surface3);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  transition: border-color 0.2s;
}
.pay-check-label:hover { border-color: var(--accent); }
.pay-checkbox { width: auto; cursor: pointer; accent-color: var(--accent); }

/* Done */
.done-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px 0;
  text-align: center;
}
.done-logo {
  width: 110px;
  object-fit: contain;
  animation: splashPop 0.7s cubic-bezier(0.34,1.56,0.64,1) both;
  filter: drop-shadow(0 0 16px rgba(249,115,22,0.4));
}
.done-title { font-size: 24px; font-weight: 800; color: var(--text-h); }
.done-desc { font-size: 14px; color: var(--text); line-height: 1.6; max-width: 320px; }

@keyframes splashPop {
  from { opacity: 0; transform: scale(0.6) translateY(20px); }
  to   { opacity: 1; transform: scale(1) translateY(0); }
}
</style>
