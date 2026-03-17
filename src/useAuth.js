// Central auth store — localStorage only, no backend needed

const USERS_KEY = 'vjp_users'
const SESSION_KEY = 'vjp_session'

const ADMIN = { email: 'gabin@admin.com', password: 'February@1002', name: 'Admin', role: 'admin' }

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]')
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

export function getSession() {
  return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}

export function login(email, password) {
  if (email.trim().toLowerCase() === ADMIN.email && password === ADMIN.password) {
    const session = { email: ADMIN.email, name: 'Admin', role: 'admin' }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    return { ok: true, session }
  }
  const users = getUsers()
  const user = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase())
  if (!user) return { ok: false, error: 'No account found with that email.' }
  if (user.password !== password) return { ok: false, error: 'Incorrect password.' }
  if (user.status === 'pending') return { ok: false, error: 'pending' }
  if (user.status === 'rejected') return { ok: false, error: 'rejected' }
  const session = { email: user.email, name: user.name, role: 'user', id: user.id }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return { ok: true, session }
}

export function signup(name, email, password) {
  const users = getUsers()
  if (users.find(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
    return { ok: false, error: 'An account with this email already exists.' }
  }
  const user = {
    id: Date.now().toString(),
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    status: 'pending',
    signedUpAt: new Date().toISOString(),
    paidConfirmed: false,
  }
  users.push(user)
  saveUsers(users)
  return { ok: true }
}

export function confirmPayment(userId) {
  const users = getUsers()
  const u = users.find(u => u.id === userId)
  if (u) { u.paidConfirmed = true; saveUsers(users) }
}

// Admin actions
export function adminGetUsers() { return getUsers() }

export function adminConfirm(userId) {
  const users = getUsers()
  const u = users.find(u => u.id === userId)
  if (u) { u.status = 'confirmed'; saveUsers(users) }
}

export function adminReject(userId) {
  const users = getUsers()
  const u = users.find(u => u.id === userId)
  if (u) { u.status = 'rejected'; saveUsers(users) }
}

export function adminDelete(userId) {
  const users = getUsers().filter(u => u.id !== userId)
  saveUsers(users)
}
