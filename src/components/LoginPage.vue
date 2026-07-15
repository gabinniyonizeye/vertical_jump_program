<template>
  <div class="auth-root">
    <!-- Hero -->
    <div class="auth-hero">
      <div class="hero-ball">🏀</div>
      <div class="hero-brand">NYIRABYO <span>Basketball</span></div>
      <div class="hero-tagline">Your basketball journey starts here.</div>
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
        <div class="done-ball">🏀</div>
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
  background: linear-gradient(160deg, #1a0a00 0%, #0d0d18 60%);
  padding: 48px 24px 36px;
  text-align: center;
  border-bottom: 1px solid var(--border);
  position: relative;
  overflow: hidden;
}

.auth-hero::before {
  content: '';
  position: absolute;
  top: -60px; right: -60px;
  width: 200px; height: 200px;
  background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
  pointer-events: none;
}

.hero-ball {
  font-size: 56px;
  animation: bounceBall 1.4s ease-in-out infinite;
  display: block;
  margin-bottom: 12px;
}

.hero-brand {
  font-size: 28px;
  font-weight: 900;
  color: var(--text-h);
  letter-spacing: -0.5px;
  margin-bottom: 6px;
}
.hero-brand span { color: var(--accent); }

.hero-tagline {
  font-size: 14px;
  color: var(--text);
  font-weight: 500;
}

.auth-body {
  flex: 1;
  padding: 24px 20px 40px;
  max-width: 440px;
  width: 100%;
  margin: 0 auto;
}

.auth-tabs {
  display: flex;
  background: var(--surface2);
  border-radius: 10px;
  padding: 4px;
  margin-bottom: 24px;
  gap: 4px;
}
.auth-tabs button {
  flex: 1;
  padding: 10px;
  border-radius: 7px;
  font-size: 14px;
  font-weight: 700;
  background: transparent;
  color: var(--text);
  transition: all 0.2s;
}
.auth-tabs button.active {
  background: var(--accent);
  color: #fff;
  box-shadow: var(--shadow-accent);
}

.auth-form { display: flex; flex-direction: column; gap: 14px; }

.auth-err {
  background: #ef444422;
  border: 1px solid var(--red);
  color: #fca5a5;
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 500;
}

.auth-note {
  font-size: 12px;
  color: var(--text);
  text-align: center;
  line-height: 1.5;
}

/* Payment */
.payment-box {
  background: linear-gradient(135deg, #1a0e00, #12121e);
  border: 1.5px solid var(--accent);
  border-radius: var(--radius);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.pay-header { display: flex; align-items: center; gap: 12px; }
.pay-icon { font-size: 24px; }
.pay-title { font-weight: 700; color: var(--accent); font-size: 14px; }
.pay-sub { font-size: 12px; color: var(--text); }
.pay-code {
  font-family: 'Courier New', monospace;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-h);
  background: var(--surface3);
  border-radius: var(--radius-sm);
  padding: 12px;
  text-align: center;
  letter-spacing: 2px;
  border: 1px solid var(--border2);
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
}
.pay-checkbox { width: auto; cursor: pointer; accent-color: var(--accent); }

/* Done */
.done-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 20px 0;
  text-align: center;
}
.done-ball { font-size: 56px; animation: bounceBall 1.4s ease-in-out infinite; }
.done-title { font-size: 22px; font-weight: 800; color: var(--text-h); }
.done-desc { font-size: 14px; color: var(--text); line-height: 1.6; max-width: 320px; }
.wa-btn {
  background: #16a34a;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  padding: 12px 24px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  width: 100%;
  text-align: center;
  display: block;
}
</style>
