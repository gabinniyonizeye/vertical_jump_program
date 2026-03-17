<template>
  <div class="auth-wrap">
    <div class="auth-card card">
      <div class="auth-logo">🏀</div>
      <div class="auth-title">Vertical Jump Program</div>
      <div class="auth-sub">Train smart. Jump higher.</div>

      <div class="auth-tabs">
        <button :class="{ active: mode === 'login' }" @click="mode = 'login'; err = ''">Login</button>
        <button :class="{ active: mode === 'signup' }" @click="mode = 'signup'; err = ''">Sign Up</button>
      </div>

      <!-- LOGIN -->
      <form v-if="mode === 'login'" @submit.prevent="doLogin" class="auth-form">
        <label>Email</label>
        <input v-model="email" type="email" placeholder="your@email.com" required autocomplete="email" />
        <label>Password</label>
        <input v-model="password" type="password" placeholder="Password" required autocomplete="current-password" />
        <div v-if="err" class="auth-err">{{ err }}</div>
        <button type="submit" class="auth-btn">Login</button>
      </form>

      <!-- SIGNUP -->
      <form v-if="mode === 'signup'" @submit.prevent="doSignup" class="auth-form">
        <label>Full Name</label>
        <input v-model="name" type="text" placeholder="Your name" required />
        <label>Email</label>
        <input v-model="email" type="email" placeholder="your@email.com" required autocomplete="email" />
        <label>Password</label>
        <input v-model="password" type="password" placeholder="Create a password" required autocomplete="new-password" />

        <div class="payment-box">
          <div class="pay-title">💳 Payment Required — 1,000 FRW</div>
          <p class="pay-desc">Before your account is activated, you must pay <strong>1,000 FRW</strong> via Mobile Money:</p>
          <div class="pay-code">*182*8*1*437986*1000#</div>
          <p class="pay-desc">Dial the code above on your phone, complete the payment, then check the box below.</p>
          <label class="pay-check-label">
            <input type="checkbox" v-model="paidCheck" class="pay-checkbox" required />
            I have paid 1,000 FRW via Mobile Money
          </label>
        </div>

        <div v-if="err" class="auth-err">{{ err }}</div>
        <button type="submit" class="auth-btn" :disabled="!paidCheck">Create Account & Submit for Approval</button>
        <p class="auth-note">After signing up, your account will be reviewed by the admin. You'll be able to log in once confirmed.</p>
      </form>

      <!-- SUCCESS -->
      <div v-if="mode === 'done'" class="done-box">
        <div class="done-icon">✅</div>
        <div class="done-title">Account submitted!</div>
        <p class="done-desc">Your signup request has been sent to the admin for review. Once confirmed, you can log in.</p>
        <p class="done-desc">Need help? Contact us on WhatsApp: <a href="https://wa.me/250780960424" target="_blank" class="wa-link">+780960424</a></p>
        <button class="auth-btn" @click="mode = 'login'">Back to Login</button>
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

async function doLogin() {
  err.value = ''
  const res = await login(email.value, password.value)
  if (res.ok) {
    emit('logged-in')
  } else if (res.error === 'pending') {
    err.value = '⏳ Your account is pending admin approval.'
  } else if (res.error === 'rejected') {
    err.value = '❌ Your account was not approved. Contact admin on WhatsApp: +250780960424'
  } else {
    err.value = res.error
  }
}

async function doSignup() {
  err.value = ''
  if (!paidCheck.value) { err.value = 'Please confirm you have paid.'; return }
  const res = await signup(name.value, email.value, password.value)
  if (res.ok) {
    mode.value = 'done'
  } else {
    err.value = res.error
  }
}
</script>

<style scoped>
.auth-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  text-align: center;
}

.auth-logo { font-size: 40px; margin-bottom: 8px; }
.auth-title { font-size: 22px; font-weight: 700; color: var(--text-h); }
.auth-sub { font-size: 13px; color: var(--text); margin-bottom: 20px; }

.auth-tabs {
  display: flex;
  background: var(--surface2);
  border-radius: 8px;
  padding: 3px;
  margin-bottom: 20px;
  gap: 3px;
}

.auth-tabs button {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  background: transparent;
  color: var(--text);
  transition: all 0.2s;
}
.auth-tabs button.active { background: var(--accent); color: #fff; }

.auth-form { text-align: left; display: flex; flex-direction: column; gap: 8px; }

.auth-form label { font-size: 12px; font-weight: 600; color: var(--text); text-transform: uppercase; letter-spacing: 0.5px; }

.auth-err {
  background: #f9731622;
  border: 1px solid #f97316;
  color: #f97316;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
}

.auth-btn {
  background: var(--accent);
  color: #fff;
  border-radius: 8px;
  padding: 11px;
  font-size: 15px;
  font-weight: 700;
  width: 100%;
  margin-top: 4px;
  transition: opacity 0.2s;
}
.auth-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.auth-btn:not(:disabled):hover { opacity: 0.85; }

.auth-note { font-size: 12px; color: var(--text); text-align: center; line-height: 1.5; }

/* Payment box */
.payment-box {
  background: #f9731618;
  border: 1px solid #f97316;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 4px 0;
}
.pay-title { font-weight: 700; color: #f97316; font-size: 14px; }
.pay-desc { font-size: 13px; color: var(--text); line-height: 1.5; }
.pay-code {
  font-family: monospace;
  font-size: 18px;
  font-weight: 700;
  color: var(--text-h);
  background: var(--surface2);
  border-radius: 8px;
  padding: 10px;
  text-align: center;
  letter-spacing: 1px;
}
.pay-check-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-h);
  font-weight: 600;
  cursor: pointer;
}
.pay-checkbox { width: auto; cursor: pointer; }

/* Done */
.done-box { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 10px 0; }
.done-icon { font-size: 40px; }
.done-title { font-size: 18px; font-weight: 700; color: var(--text-h); }
.done-desc { font-size: 13px; color: var(--text); text-align: center; line-height: 1.6; }
.wa-link { color: #22c55e; font-weight: 700; text-decoration: none; }
.wa-link:hover { text-decoration: underline; }
</style>
