<template>
  <div class="pending-wrap">
    <div class="pending-card card">
      <div class="pending-icon">⏳</div>
      <div class="pending-title">Account Pending Approval</div>
      <p class="pending-desc">
        Hi <strong>{{ session.name }}</strong>, your account is currently under review by the admin.
        Once your payment is verified and your account is confirmed, you'll have full access.
      </p>

      <div class="payment-reminder">
        <div class="pay-title">💳 Payment Reminder</div>
        <p class="pay-desc">If you haven't paid yet, please dial:</p>
        <div class="pay-code">*182*8*1*437986*1000#</div>
        <p class="pay-desc">Pay <strong>1,000 FRW</strong> via Mobile Money, then contact the admin below.</p>
      </div>

      <div class="contact-box">
        <div class="contact-title">📞 Contact Admin</div>
        <p class="contact-desc">After paying, send a WhatsApp message to confirm your payment so the admin can activate your account:</p>
        <a href="https://wa.me/780960424" target="_blank" class="wa-btn">
          💬 WhatsApp: +780960424
        </a>
      </div>

      <button class="logout-btn" @click="$emit('logout')">← Logout</button>
    </div>
  </div>
</template>

<script setup>
defineProps({ session: Object })
defineEmits(['logout'])
</script>

<style scoped>
.pending-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
}

.pending-card {
  width: 100%;
  max-width: 440px;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pending-icon { font-size: 48px; }
.pending-title { font-size: 22px; font-weight: 700; color: var(--text-h); }
.pending-desc { font-size: 14px; color: var(--text); line-height: 1.6; }

.payment-reminder {
  background: #f9731618;
  border: 1px solid #f97316;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: left;
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

.contact-box {
  background: #22c55e18;
  border: 1px solid #22c55e;
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.contact-title { font-weight: 700; color: #22c55e; font-size: 14px; }
.contact-desc { font-size: 13px; color: var(--text); line-height: 1.5; }

.wa-btn {
  display: inline-block;
  background: #22c55e;
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  padding: 11px 20px;
  border-radius: 8px;
  text-decoration: none;
  transition: opacity 0.2s;
}
.wa-btn:hover { opacity: 0.85; }

.logout-btn {
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 8px;
  padding: 9px 18px;
  font-size: 14px;
  transition: all 0.2s;
  align-self: center;
}
.logout-btn:hover { color: var(--text-h); border-color: var(--text); }
</style>
