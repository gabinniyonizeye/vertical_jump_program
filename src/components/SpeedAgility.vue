<template>
  <div class="page">
    <div class="header">
      <h1>⚡ Speed & Agility</h1>
      <p>Develop explosive footwork and lateral quickness</p>
    </div>

    <div class="drills-grid">
      <!-- Defensive Slides -->
      <div class="drill-card">
        <div class="drill-icon">↔️</div>
        <h3>Defensive Slides</h3>
        <div class="drill-diagram">
          <svg viewBox="0 0 200 120" class="diagram">
            <rect x="20" y="40" width="160" height="40" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5,5"/>
            <circle cx="50" cy="60" r="8" fill="#f97316"/>
            <circle cx="100" cy="60" r="8" fill="#f97316"/>
            <circle cx="150" cy="60" r="8" fill="#f97316"/>
            <path d="M 50 60 L 100 60 L 150 60" stroke="#f97316" stroke-width="2" fill="none" stroke-dasharray="3,3"/>
            <text x="100" y="110" text-anchor="middle" font-size="12" fill="#64748b">Lateral movement</text>
          </svg>
        </div>
        <div class="drill-details">
          <div class="detail-row">
            <span class="label">Sets:</span>
            <span class="value">4</span>
          </div>
          <div class="detail-row">
            <span class="label">Reps:</span>
            <span class="value">30 sec each direction</span>
          </div>
          <div class="detail-row">
            <span class="label">Rest:</span>
            <span class="value">30 sec</span>
          </div>
        </div>
      </div>

      <!-- Zig-Zag Sprint -->
      <div class="drill-card">
        <div class="drill-icon">⚡</div>
        <h3>Zig-Zag Sprint</h3>
        <div class="drill-diagram">
          <svg viewBox="0 0 200 140" class="diagram">
            <circle cx="30" cy="20" r="5" fill="#f97316"/>
            <circle cx="70" cy="50" r="5" fill="#f97316"/>
            <circle cx="110" cy="80" r="5" fill="#f97316"/>
            <circle cx="150" cy="110" r="5" fill="#f97316"/>
            <path d="M 30 20 L 70 50 L 110 80 L 150 110" stroke="#f97316" stroke-width="2" fill="none"/>
            <text x="100" y="135" text-anchor="middle" font-size="12" fill="#64748b">Diagonal sprints</text>
          </svg>
        </div>
        <div class="drill-details">
          <div class="detail-row">
            <span class="label">Sets:</span>
            <span class="value">5</span>
          </div>
          <div class="detail-row">
            <span class="label">Reps:</span>
            <span class="value">1 full course</span>
          </div>
          <div class="detail-row">
            <span class="label">Rest:</span>
            <span class="value">45 sec</span>
          </div>
        </div>
      </div>

      <!-- Closeout Drill -->
      <div class="drill-card">
        <div class="drill-icon">🏀</div>
        <h3>Closeout Drill</h3>
        <div class="drill-diagram">
          <svg viewBox="0 0 200 120" class="diagram">
            <circle cx="100" cy="30" r="6" fill="#3b82f6"/>
            <circle cx="50" cy="80" r="6" fill="#f97316"/>
            <circle cx="150" cy="80" r="6" fill="#f97316"/>
            <path d="M 100 30 L 50 80" stroke="#f97316" stroke-width="2" fill="none" stroke-dasharray="3,3"/>
            <path d="M 100 30 L 150 80" stroke="#f97316" stroke-width="2" fill="none" stroke-dasharray="3,3"/>
            <text x="100" y="115" text-anchor="middle" font-size="12" fill="#64748b">Sprint to defender</text>
          </svg>
        </div>
        <div class="drill-details">
          <div class="detail-row">
            <span class="label">Sets:</span>
            <span class="value">4</span>
          </div>
          <div class="detail-row">
            <span class="label">Reps:</span>
            <span class="value">8 per set</span>
          </div>
          <div class="detail-row">
            <span class="label">Rest:</span>
            <span class="value">60 sec</span>
          </div>
        </div>
      </div>

      <!-- Lateral Shuffle -->
      <div class="drill-card">
        <div class="drill-icon">🔄</div>
        <h3>Lateral Shuffle</h3>
        <div class="drill-diagram">
          <svg viewBox="0 0 200 120" class="diagram">
            <rect x="30" y="50" width="140" height="30" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="5,5"/>
            <circle cx="50" cy="65" r="6" fill="#f97316"/>
            <circle cx="80" cy="65" r="6" fill="#f97316"/>
            <circle cx="110" cy="65" r="6" fill="#f97316"/>
            <circle cx="140" cy="65" r="6" fill="#f97316"/>
            <path d="M 50 65 L 80 65 L 110 65 L 140 65" stroke="#f97316" stroke-width="2" fill="none"/>
            <text x="100" y="110" text-anchor="middle" font-size="12" fill="#64748b">Side-to-side movement</text>
          </svg>
        </div>
        <div class="drill-details">
          <div class="detail-row">
            <span class="label">Sets:</span>
            <span class="value">4</span>
          </div>
          <div class="detail-row">
            <span class="label">Reps:</span>
            <span class="value">40 ft each way</span>
          </div>
          <div class="detail-row">
            <span class="label">Rest:</span>
            <span class="value">30 sec</span>
          </div>
        </div>
      </div>

      <!-- Sprint-Stop-Sprint -->
      <div class="drill-card">
        <div class="drill-icon">🛑</div>
        <h3>Sprint-Stop-Sprint</h3>
        <div class="drill-diagram">
          <svg viewBox="0 0 200 120" class="diagram">
            <circle cx="30" cy="60" r="5" fill="#f97316"/>
            <circle cx="100" cy="60" r="8" fill="#ef4444" stroke="#ef4444" stroke-width="2"/>
            <circle cx="170" cy="60" r="5" fill="#f97316"/>
            <path d="M 30 60 L 100 60" stroke="#f97316" stroke-width="2" fill="none"/>
            <path d="M 100 60 L 170 60" stroke="#f97316" stroke-width="2" fill="none"/>
            <text x="100" y="90" text-anchor="middle" font-size="11" fill="#64748b">Sprint • Stop • Sprint</text>
            <text x="100" y="110" text-anchor="middle" font-size="11" fill="#64748b">40 ft • Stop • 40 ft</text>
          </svg>
        </div>
        <div class="drill-details">
          <div class="detail-row">
            <span class="label">Sets:</span>
            <span class="value">5</span>
          </div>
          <div class="detail-row">
            <span class="label">Reps:</span>
            <span class="value">1 full course</span>
          </div>
          <div class="detail-row">
            <span class="label">Rest:</span>
            <span class="value">60 sec</span>
          </div>
        </div>
      </div>

      <!-- Cone Drill -->
      <div class="drill-card">
        <div class="drill-icon">🎯</div>
        <h3>Cone Drill</h3>
        <div class="drill-diagram">
          <svg viewBox="0 0 200 140" class="diagram">
            <circle cx="100" cy="20" r="5" fill="#f97316"/>
            <circle cx="60" cy="60" r="5" fill="#f97316"/>
            <circle cx="140" cy="60" r="5" fill="#f97316"/>
            <circle cx="100" cy="100" r="5" fill="#f97316"/>
            <path d="M 100 20 L 60 60 L 140 60 L 100 20 L 100 100" stroke="#f97316" stroke-width="2" fill="none"/>
            <text x="100" y="135" text-anchor="middle" font-size="12" fill="#64748b">T-drill pattern</text>
          </svg>
        </div>
        <div class="drill-details">
          <div class="detail-row">
            <span class="label">Sets:</span>
            <span class="value">4</span>
          </div>
          <div class="detail-row">
            <span class="label">Reps:</span>
            <span class="value">6 per set</span>
          </div>
          <div class="detail-row">
            <span class="label">Rest:</span>
            <span class="value">45 sec</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Tips Section -->
    <div class="tips-section card">
      <h3>💡 Pro Tips</h3>
      <ul class="tips-list">
        <li><strong>Stay Low:</strong> Keep your center of gravity low for better control and explosiveness</li>
        <li><strong>Quick Feet:</strong> Focus on rapid foot placement rather than long strides</li>
        <li><strong>Arm Drive:</strong> Use your arms to generate momentum and maintain balance</li>
        <li><strong>Controlled Stops:</strong> Practice deceleration to prevent injuries and improve court control</li>
        <li><strong>Consistency:</strong> Perform these drills 2-3x per week for best results</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
defineProps({ profile: Object })
</script>

<style scoped>
.page { padding: 16px; max-width: 1200px; margin: 0 auto; }

.header { margin-bottom: 24px; }
.header h1 { font-size: 30px; font-weight: 900; color: var(--text-h); margin: 0 0 4px 0; font-family: var(--font-display); letter-spacing: 0.5px; }
.header p { font-size: 14px; color: var(--text); margin: 0; }

.drills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 14px;
  margin-bottom: 24px;
}

.drill-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px;
  display: flex; flex-direction: column; gap: 12px;
  transition: all 0.25s;
  position: relative; overflow: hidden;
}
.drill-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--accent), var(--accent2));
  opacity: 0; transition: opacity 0.2s;
}
.drill-card:hover {
  border-color: var(--accent);
  transform: translateY(-3px);
  box-shadow: 0 8px 28px rgba(249,115,22,0.15);
}
.drill-card:hover::before { opacity: 1; }

.drill-icon { font-size: 34px; line-height: 1; }
.drill-card h3 { font-size: 16px; font-weight: 800; color: var(--text-h); margin: 0; }

.drill-diagram {
  background: var(--surface2);
  border-radius: var(--radius-sm);
  padding: 12px;
  min-height: 140px;
  display: flex; align-items: center; justify-content: center;
  border: 1px solid var(--border);
}
.diagram { width: 100%; height: 100%; max-width: 180px; max-height: 140px; }

.drill-details {
  display: flex; flex-direction: column; gap: 8px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
}
.detail-row { display: flex; justify-content: space-between; font-size: 13px; }
.detail-row .label { color: var(--text); font-weight: 600; }
.detail-row .value { color: var(--accent); font-weight: 700; }

.tips-section {
  background: linear-gradient(135deg, rgba(249,115,22,0.05), var(--surface));
  border: 1px solid rgba(249,115,22,0.2);
  border-radius: var(--radius);
  padding: 18px;
}
.tips-section h3 { font-size: 16px; font-weight: 800; color: var(--text-h); margin: 0 0 14px 0; }
.tips-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.tips-list li { font-size: 13px; color: var(--text2); line-height: 1.6; padding-left: 16px; position: relative; }
.tips-list li::before { content: '▸'; position: absolute; left: 0; color: var(--accent); }
.tips-list strong { color: var(--text-h); }

@media (max-width: 768px) { .drills-grid { grid-template-columns: 1fr; } }
</style>
