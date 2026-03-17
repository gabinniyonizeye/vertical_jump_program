<template>
  <div>
    <div class="admin-header card">
      <div class="admin-title">🛡️ Admin Panel</div>
      <div class="admin-sub">Manage user signups and payment confirmations</div>
    </div>

    <!-- Pending users -->
    <div class="section-label">⏳ Pending Approval ({{ pending.length }})</div>
    <div v-if="!pending.length" class="empty-msg">No pending requests.</div>
    <div v-for="u in pending" :key="u.id" class="user-card card">
      <div class="user-info">
        <div class="user-name">{{ u.name }}</div>
        <div class="user-email">{{ u.email }}</div>
        <div class="user-meta">
          Signed up: {{ formatDate(u.signedUpAt) }}
          <span class="paid-badge" :class="u.paidConfirmed ? 'paid' : 'unpaid'">
            {{ u.paidConfirmed ? '✅ Payment confirmed by user' : '⚠️ Payment not confirmed by user' }}
          </span>
        </div>
      </div>
      <div class="user-actions">
        <button class="confirm-btn" @click="confirm(u.id)">✅ Confirm</button>
        <button class="reject-btn" @click="reject(u.id)">❌ Reject</button>
      </div>
    </div>

    <!-- Confirmed users -->
    <div class="section-label">✅ Confirmed Users ({{ confirmed.length }})</div>
    <div v-if="!confirmed.length" class="empty-msg">No confirmed users yet.</div>
    <div v-for="u in confirmed" :key="u.id" class="user-card card confirmed">
      <div class="user-info">
        <div class="user-name">{{ u.name }}</div>
        <div class="user-email">{{ u.email }}</div>
        <div class="user-meta">Confirmed · Signed up: {{ formatDate(u.signedUpAt) }}</div>
      </div>
      <div class="user-actions">
        <button class="reject-btn" @click="reject(u.id)">Revoke</button>
        <button class="delete-btn" @click="del(u.id)">🗑️</button>
      </div>
    </div>

    <!-- Rejected users -->
    <div class="section-label">❌ Rejected ({{ rejected.length }})</div>
    <div v-if="!rejected.length" class="empty-msg">No rejected users.</div>
    <div v-for="u in rejected" :key="u.id" class="user-card card rejected">
      <div class="user-info">
        <div class="user-name">{{ u.name }}</div>
        <div class="user-email">{{ u.email }}</div>
      </div>
      <div class="user-actions">
        <button class="confirm-btn" @click="confirm(u.id)">Re-approve</button>
        <button class="delete-btn" @click="del(u.id)">🗑️</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { adminGetUsers, adminConfirm, adminReject, adminDelete } from '../useAuth.js'

const users = ref(adminGetUsers())

function refresh() { users.value = adminGetUsers() }

const pending   = computed(() => users.value.filter(u => u.status === 'pending'))
const confirmed = computed(() => users.value.filter(u => u.status === 'confirmed'))
const rejected  = computed(() => users.value.filter(u => u.status === 'rejected'))

function confirm(id) { adminConfirm(id); refresh() }
function reject(id)  { adminReject(id);  refresh() }
function del(id)     { if (confirm('Delete this user permanently?')) { adminDelete(id); refresh() } }

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.admin-header {
  margin-bottom: 20px;
  border-left: 3px solid var(--accent);
}
.admin-title { font-size: 20px; font-weight: 700; color: var(--text-h); margin-bottom: 4px; }
.admin-sub { font-size: 13px; color: var(--text); }

.section-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 20px 0 10px;
}

.empty-msg { font-size: 13px; color: var(--text); padding: 10px 0; }

.user-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}
.user-card.confirmed { border-left: 3px solid var(--green); }
.user-card.rejected  { border-left: 3px solid var(--accent); opacity: 0.7; }

.user-info { flex: 1; min-width: 0; }
.user-name  { font-weight: 700; color: var(--text-h); font-size: 15px; }
.user-email { font-size: 13px; color: var(--text); margin: 2px 0; }
.user-meta  { font-size: 12px; color: var(--text); display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

.paid-badge {
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}
.paid-badge.paid   { background: #22c55e22; color: #22c55e; }
.paid-badge.unpaid { background: #f9731622; color: #f97316; }

.user-actions { display: flex; gap: 8px; flex-shrink: 0; }

.confirm-btn {
  background: var(--green);
  color: #fff;
  border-radius: 7px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 600;
  transition: opacity 0.2s;
}
.confirm-btn:hover { opacity: 0.85; }

.reject-btn {
  background: #f9731622;
  color: var(--accent);
  border: 1px solid var(--accent);
  border-radius: 7px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 600;
  transition: opacity 0.2s;
}
.reject-btn:hover { opacity: 0.75; }

.delete-btn {
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 7px;
  padding: 7px 10px;
  font-size: 13px;
  transition: all 0.2s;
}
.delete-btn:hover { color: var(--red); border-color: var(--red); }
</style>
