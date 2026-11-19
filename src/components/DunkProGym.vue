<template>
  <div class="dunkpro-root">

    <!-- Top Hero Banner -->
    <div class="card dunkpro-hero">
      <div class="hero-top-row">
        <div class="badge-row">
          <span class="edition-badge">🔥 DAILY GYM EDITION</span>
          <button class="lang-toggle" @click="lang = lang === 'en' ? 'rw' : 'en'">
            {{ lang === 'en' ? '🇷🇼 Kinyarwanda' : '🇬🇧 English' }}
          </button>
        </div>
        <div class="mode-toggle">
          <button
            class="mode-btn"
            :class="{ active: mode === 'gym' }"
            @click="mode = 'gym'"
          >
            🏋️ {{ t.gymMode }}
          </button>
          <button
            class="mode-btn"
            :class="{ active: mode === 'home' }"
            @click="mode = 'home'"
          >
            🏠 {{ t.homeMode }}
          </button>
        </div>
      </div>

      <div class="hero-main">
        <div class="hero-title-wrap">
          <h1 class="hero-title">NYIRABYO DUNK PRO</h1>
          <p class="hero-quote">
            "{{ t.coreRule }}"
          </p>
        </div>
        <div class="hero-stat-pill">
          <div class="stat-pill-num">3/7</div>
          <div class="stat-pill-label">{{ t.maxJumpDays }}</div>
        </div>
      </div>

      <!-- Quick Nav Tabs -->
      <div class="subnav-row">
        <button
          v-for="st in subTabs"
          :key="st.id"
          class="subnav-btn"
          :class="{ active: currentTab === st.id }"
          @click="currentTab = st.id"
        >
          <span>{{ st.icon }}</span>
          <span>{{ st.label[lang] }}</span>
        </button>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- TAB 1: 7-DAY SCHEDULE & DAILY GYM WORKOUTS                     -->
    <!-- ============================================================== -->
    <div v-if="currentTab === 'schedule'" class="tab-content fade-in">
      
      <!-- Day Selector Pills -->
      <div class="day-pills-row">
        <button
          v-for="d in daysList"
          :key="d.id"
          class="day-pill"
          :class="{ active: activeDay === d.id, today: todayId === d.id, high: d.isHighJump, rest: d.isRest }"
          @click="activeDay = d.id"
        >
          <span class="day-short">{{ d.short[lang] }}</span>
          <span class="day-dot-indicator" v-if="completedDays[d.id]">✓</span>
          <span class="rest-indicator" v-else-if="d.isRest">😴</span>
          <span class="jump-indicator" v-else-if="d.isHighJump">⚡</span>
        </button>
      </div>

      <!-- Selected Day Overview Card -->
      <div class="card day-card-hero" :style="{ borderColor: activeDayData.color }">
        <div class="day-header-flex">
          <div>
            <div class="day-sub-label" :style="{ color: activeDayData.color }">
              {{ activeDayData.name[lang] }} · {{ activeDayData.intensity[lang] }}
            </div>
            <h2 class="day-main-title">{{ activeDayData.title[lang] }}</h2>
            <p class="day-focus-desc">🎯 {{ activeDayData.focus[lang] }}</p>
          </div>
          <div class="day-tag-badge" :style="{ background: activeDayData.color + '22', color: activeDayData.color }">
            {{ activeDayData.isRest ? '😴 Rest Day' : activeDayData.isHighJump ? '⚡ High Jump Day' : '🛡️ Low Impact' }}
          </div>
        </div>

        <div class="day-action-row">
          <button
            class="btn-complete-day"
            :class="{ done: completedDays[activeDay] }"
            @click="toggleDayComplete(activeDay)"
          >
            {{ completedDays[activeDay] ? '✅ ' + (activeDayData.isRest ? (lang === 'en' ? 'Rest Logged' : 'Waruhutse') : t.dayCompleted) : '○ ' + (activeDayData.isRest ? (lang === 'en' ? 'Log Rest Day' : 'Shyiraho ko Waruhutse') : t.markComplete) }}
          </button>
          <button v-if="!activeDayData.isRest" class="btn-jump-warmup" @click="currentTab = 'warmup'">
            🔥 {{ t.viewWarmup }}
          </button>
          <button v-else class="btn-jump-warmup" @click="currentTab = 'stretching'">
            🧘 {{ lang === 'en' ? 'Stretching & Ankles' : 'Kurambura' }}
          </button>
        </div>
      </div>

      <!-- REST DAY VIEW (Sunday) -->
      <div v-if="activeDayData.isRest" class="card rest-day-card">
        <div class="rest-hero-top">
          <span class="rest-emoji">😴</span>
          <div>
            <h3 class="rest-title">{{ lang === 'en' ? 'Sunday is a Complete Rest Day' : 'Ku Cyumweru ni Umunsi wo Kuruhuka Byuzuye' }}</h3>
            <p class="rest-quote">{{ lang === 'en' ? '"No gym today. Max jumping during the week broke down muscle fibers and stressed your patellar tendons. Sunday is where your body actually rebuilds and gains vertical height."' : '"Uyu munsi nta gym. Gusimbuka cyane mu cyumweru byananiwe imitsi. Ku Cyumweru niho umubiri wisana ukanubaka ubuhanga bwo gusimbuka hejuru."' }}</p>
          </div>
        </div>

        <div class="rest-pillars-grid">
          <div class="rest-pillar">
            <span class="rp-icon">🛌</span>
            <h4>{{ lang === 'en' ? 'Sleep 8–9 Hours' : 'Gusinzira Amasaha 8–9' }}</h4>
            <p>{{ lang === 'en' ? 'Deep sleep releases human growth hormone to repair tendon collagen and nervous system synapses.' : 'Aha niho umubiri wisana ukubaka imitsi isimbuka.' }}</p>
          </div>
          <div class="rest-pillar">
            <span class="rp-icon">💧</span>
            <h4>{{ lang === 'en' ? 'Hydrate 3–4 Liters' : 'Kunywa Amazi Litiro 3–4' }}</h4>
            <p>{{ lang === 'en' ? 'Keeps spinal discs and knee cartilage properly cushioned, elastic, and pain-free.' : 'Bifasha ingingo zose kumererwa neza no kutababara.' }}</p>
          </div>
          <div class="rest-pillar">
            <span class="rp-icon">🍗</span>
            <h4>{{ lang === 'en' ? 'Fuel with Protein & Carbs' : 'Kugaburira Umubiri Neza' }}</h4>
            <p>{{ lang === 'en' ? 'Eggs, beans, fish, chicken, milk, sweet potatoes, bananas, and ugali to replenish glycogen.' : 'Amagi, ibishyimbo, ifi, inkoko, ibijumba, umuceri, n\'ubugari.' }}</p>
          </div>
          <div class="rest-pillar">
            <span class="rp-icon">🦶</span>
            <h4>{{ lang === 'en' ? 'Gentle Ankle Care (5 min)' : 'Kwita ku Kagombambari (5 min)' }}</h4>
            <p>{{ lang === 'en' ? 'Optional gentle ankle rolls and light stretching. Zero heavy lifting or max jumps.' : 'Koroshya akagombambari buhoro. Nta guterura biremereye cyangwa gusimbuka.' }}</p>
          </div>
        </div>

        <div class="rest-action-box">
          <button class="link-btn" style="display:inline-block" @click="currentTab = 'stretching'">
            {{ lang === 'en' ? 'View Gentle Stretching & Ankle Mobility Routine →' : 'Reba Uburyo bwo Kurambura Buhoro →' }}
          </button>
        </div>
      </div>

      <!-- WORKOUT EXERCISES (Monday - Saturday) -->
      <template v-else>
        <div class="exercises-header">
          <div class="section-title">
            <span>{{ mode === 'gym' ? '🏋️ ' + t.gymExercises : '🏠 ' + t.homeExercises }}</span>
          </div>
          <div class="rest-timer-quick" v-if="activeTimer > 0">
            ⏱️ {{ timerCountdown }}s ({{ t.resting }})
          </div>
        </div>

        <div class="exercise-cards-list">
          <div
            v-for="(ex, index) in (mode === 'gym' ? activeDayData.gymExercises : activeDayData.homeExercises)"
            :key="ex.name"
            class="card ex-card"
          >
            <div class="ex-card-top">
              <span class="ex-num">{{ index + 1 }}</span>
              <div class="ex-title-wrap">
                <h3 class="ex-name">{{ ex.name }}</h3>
                <p class="ex-note" v-if="ex.note">{{ ex.note[lang] }}</p>
              </div>
              <div class="ex-sets-badge">{{ ex.sets }}</div>
            </div>

            <!-- Rep & Set Counter Row -->
            <div class="rep-counter-row">
              <!-- If Hold/Time-based (e.g. Plank 3×45 sec, Side Plank 3×30 sec) -->
              <template v-if="isTimeBased(ex.sets)">
                <div class="counter-item timer-mode">
                  <span class="cnt-label">Hold</span>
                  <div class="ex-hold-timer" :class="{ running: getExTimer(activeDay, ex.name).running, done: getExTimer(activeDay, ex.name).done }">
                    <span class="hold-time">{{ timerDisplay(getExTimer(activeDay, ex.name).total ? getExTimer(activeDay, ex.name) : { remaining: parseTargetSecs(ex.sets), total: parseTargetSecs(ex.sets) }) }}</span>
                    <button
                      v-if="!getExTimer(activeDay, ex.name).running && !getExTimer(activeDay, ex.name).done"
                      class="btn-timer-action"
                      @click.stop="startExTimer(activeDay, ex.name, parseTargetSecs(ex.sets))"
                      title="Start hold timer"
                    >▶</button>
                    <button
                      v-if="getExTimer(activeDay, ex.name).running"
                      class="btn-timer-action btn-pause"
                      @click.stop="pauseExTimer(activeDay, ex.name)"
                      title="Pause hold timer"
                    >⏸</button>
                    <button
                      class="cnt-reset"
                      @click.stop="resetExTimer(activeDay, ex.name, parseTargetSecs(ex.sets))"
                      title="Reset hold timer"
                    >↺</button>
                    <span class="hold-badge">{{ getExTimer(activeDay, ex.name).done ? '✅ Done' : getExTimer(activeDay, ex.name).running ? '🔥 Hold' : 'Timer' }}</span>
                  </div>
                </div>
              </template>

              <!-- If Rep-based (e.g. Squat 4×5, Box Jump 4×4) -->
              <template v-else>
                <div class="counter-item">
                  <span class="cnt-label">Reps</span>
                  <button
                    class="rep-count-btn"
                    :class="{ reached: parseTargetReps(ex.sets) && getRepCount(activeDay, ex.name) >= parseTargetReps(ex.sets) }"
                    @click.stop="tapRep(activeDay, ex.name)"
                    title="Tap to count reps"
                  >
                    <span class="cnt-num">{{ getRepCount(activeDay, ex.name) }}</span>
                    <span class="cnt-target" v-if="parseTargetReps(ex.sets)"> / {{ parseTargetReps(ex.sets) }}</span>
                  </button>
                  <button class="cnt-reset" @click.stop="resetReps(activeDay, ex.name)" title="Reset reps">↺</button>
                </div>
              </template>

              <!-- Sets counter (all exercises) -->
              <div class="counter-item">
                <span class="cnt-label">Sets</span>
                <button
                  class="set-count-btn"
                  :class="{ reached: parseTargetSets(ex.sets) && getSetCount(activeDay, ex.name) >= parseTargetSets(ex.sets) }"
                  @click.stop="addSet(activeDay, ex.name, ex.restSecs || 90)"
                  title="Add completed set & start rest timer"
                >
                  <span class="set-plus">+Set</span>
                  <span class="cnt-num">{{ getSetCount(activeDay, ex.name) }}</span>
                  <span class="cnt-target" v-if="parseTargetSets(ex.sets)"> / {{ parseTargetSets(ex.sets) }}</span>
                </button>
                <button class="cnt-reset" @click.stop="resetSets(activeDay, ex.name)" title="Reset sets">↺</button>
              </div>
            </div>

            <!-- Footer: Rest Duration & Interactive Timer -->
            <div class="ex-footer-row">
              <div class="ex-rest">
                <span class="rest-icon">⏱️</span>
                <span>Rest: <strong>{{ ex.rest }}</strong></span>
              </div>
              <div class="timer-controls-group">
                <button
                  class="timer-trigger-btn"
                  :class="{ active: activeTimerEx === ex.name, paused: activeTimerEx === ex.name && timerIsPaused }"
                  @click.stop="toggleRestTimer(ex.restSecs || 90, ex.name)"
                >
                  {{ activeTimerEx === ex.name ? (timerIsPaused ? '⏸ ' + timerCountdown + 's (Paused)' : '⏱️ ' + timerCountdown + 's') : '▶ ' + t.startRest }}
                </button>
                <button
                  v-if="activeTimerEx === ex.name"
                  class="btn-timer-cancel"
                  @click.stop="stopRestTimer()"
                  title="Cancel rest timer"
                >✕</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Day Cooldown Note -->
        <div class="card cooldown-card">
          <div class="cd-icon">🧘</div>
          <div class="cd-info">
            <h4>{{ t.sessionFinishTitle }}</h4>
            <p>{{ t.sessionFinishDesc }}</p>
            <button class="link-btn" @click="currentTab = 'stretching'">
              {{ t.openStretchingRoutine }} →
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- ============================================================== -->
    <!-- TAB 2: WEEKLY DUNK CHALLENGE & PROGRESS TRACKER                -->
    <!-- ============================================================== -->
    <div v-if="currentTab === 'challenge'" class="tab-content fade-in">
      
      <!-- Challenge Hero -->
      <div class="card challenge-hero">
        <div class="ch-badge">🎯 WEEKLY SATURDAY CHALLENGE</div>
        <h2 class="ch-title">{{ t.challengeHeading }}</h2>
        <p class="ch-desc">{{ t.challengeSub }}</p>
        
        <!-- Milestone Visualizer (Levels 1 to 7) -->
        <div class="milestone-stepper">
          <div
            v-for="m in milestoneLevels"
            :key="m.level"
            class="milestone-step"
            :class="{ active: currentMilestoneLevel >= m.level }"
            @click="selectedMilestoneView = m"
          >
            <div class="m-icon">{{ m.icon }}</div>
            <div class="m-level">Lv.{{ m.level }}</div>
            <div class="m-name">{{ m.name[lang] }}</div>
          </div>
        </div>
      </div>

      <!-- Selected Milestone Detail Card -->
      <div class="card milestone-detail-card" v-if="selectedMilestoneView">
        <div class="md-top">
          <span class="md-emoji">{{ selectedMilestoneView.icon }}</span>
          <div>
            <div class="md-target">{{ t.targetMilestone }}: Level {{ selectedMilestoneView.level }}</div>
            <h3 class="md-name">{{ selectedMilestoneView.name[lang] }}</h3>
          </div>
        </div>
        <p class="md-desc">{{ selectedMilestoneView.desc[lang] }}</p>
        <div class="md-tip">💡 <strong>Coach Cue:</strong> {{ selectedMilestoneView.tip[lang] }}</div>
      </div>

      <!-- Log New Weekly Challenge Attempt Form -->
      <div class="card log-challenge-card">
        <div class="section-title">
          <span>📝 {{ t.logWeeklyTest }}</span>
          <span class="badge-week">Week {{ currentWeekProgression }}</span>
        </div>

        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">{{ t.highestMilestoneReached }}</label>
            <select v-model="challengeForm.level">
              <option v-for="m in milestoneLevels" :key="m.level" :value="m.level">
                Level {{ m.level }}: {{ m.name[lang] }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">{{ t.approachStyle }}</label>
            <select v-model="challengeForm.approach">
              <option value="2-foot">{{ t.twoFootTakeoff }}</option>
              <option value="1-foot">{{ t.oneFootTakeoff }}</option>
              <option value="both">{{ t.bothTested }}</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">{{ t.rimDistance }}</label>
            <input
              type="text"
              v-model="challengeForm.distance"
              :placeholder="t.rimDistancePlaceholder"
            />
          </div>

          <div class="form-group">
            <label class="form-label">{{ t.ballSizeTested }}</label>
            <select v-model="challengeForm.ball">
              <option value="None">{{ t.noBall }}</option>
              <option value="Tennis Ball">🎾 Tennis Ball</option>
              <option value="Mini / Small Ball">🏀 Mini Ball (Size 3)</option>
              <option value="Volleyball">🏐 Volleyball</option>
              <option value="Size 6 / Women's">🏀 Size 6 Ball</option>
              <option value="Official Size 7">🏀 Official Size 7 Ball</option>
            </select>
          </div>
        </div>

        <div class="form-group" style="margin-top:12px">
          <label class="form-label">{{ t.penultimateRating }} (1–5 ⭐)</label>
          <div class="star-rating">
            <button
              v-for="s in 5"
              :key="s"
              type="button"
              class="star-btn"
              :class="{ filled: challengeForm.penultimateScore >= s }"
              @click="challengeForm.penultimateScore = s"
            >
              ★
            </button>
            <span class="rating-label">{{ challengeForm.penultimateScore }}/5</span>
          </div>
        </div>

        <div class="form-group" style="margin-top:12px">
          <label class="form-label">{{ t.challengeNotes }}</label>
          <textarea
            v-model="challengeForm.notes"
            rows="2"
            :placeholder="t.challengeNotesPlaceholder"
          ></textarea>
        </div>

        <button
          class="btn-primary"
          style="margin-top:14px; width:100%"
          @click="saveChallengeAttempt"
        >
          💾 {{ t.saveAttempt }}
        </button>
      </div>

      <!-- Weekly History Log -->
      <div class="section-title" style="margin-top:24px">
        <span>📜 {{ t.challengeHistory }} ({{ challengeHistory.length }})</span>
      </div>

      <div class="history-list" v-if="challengeHistory.length">
        <div
          v-for="entry in challengeHistory"
          :key="entry.id"
          class="card history-card"
        >
          <div class="hc-top">
            <div class="hc-left">
              <span class="hc-emoji">{{ getMilestoneIcon(entry.level) }}</span>
              <div>
                <div class="hc-level">Level {{ entry.level }}: {{ getMilestoneName(entry.level) }}</div>
                <div class="hc-date">{{ entry.date }} · {{ entry.approach }}</div>
              </div>
            </div>
            <button class="hc-del" @click="deleteChallengeEntry(entry.id)">✕</button>
          </div>
          <div class="hc-details">
            <span class="hc-tag" v-if="entry.distance">📏 {{ entry.distance }}</span>
            <span class="hc-tag" v-if="entry.ball">⚽ {{ entry.ball }}</span>
            <span class="hc-tag">⭐ Penultimate: {{ entry.penultimateScore }}/5</span>
          </div>
          <p class="hc-notes" v-if="entry.notes">"{{ entry.notes }}"</p>
        </div>
      </div>
      <div v-else class="card empty-card">
        <div class="empty-icon">🏀</div>
        <p>{{ t.noAttemptsYet }}</p>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- TAB 3: 12-WEEK PROGRESSION & RPE GUIDE                         -->
    <!-- ============================================================== -->
    <div v-if="currentTab === 'periodization'" class="tab-content fade-in">
      <div class="card">
        <div class="section-title">
          <span>📈 {{ t.twelveWeekHeading }}</span>
        </div>
        <p class="body-p">{{ t.twelveWeekSub }}</p>

        <!-- Current Week Selector -->
        <div class="week-selector-card">
          <label class="form-label">{{ t.selectCurrentWeek }}:</label>
          <div class="week-buttons">
            <button
              v-for="w in 12"
              :key="w"
              class="week-btn"
              :class="{ active: currentWeekProgression === w, deload: w === 4 || w === 8, test: w === 12 }"
              @click="currentWeekProgression = w; saveWeekChoice(w)"
            >
              W{{ w }}
            </button>
          </div>
        </div>

        <!-- Active Phase Highlight -->
        <div class="card active-phase-card" :class="activePhaseInfo.type">
          <div class="phase-top">
            <span class="phase-icon">{{ activePhaseInfo.icon }}</span>
            <div>
              <div class="phase-tag">{{ activePhaseInfo.weeks }}</div>
              <h3 class="phase-title">{{ activePhaseInfo.title[lang] }}</h3>
            </div>
          </div>
          <p class="phase-desc">{{ activePhaseInfo.desc[lang] }}</p>
          <div class="phase-rpe">
            <strong>Target RPE:</strong> {{ activePhaseInfo.rpe }}
          </div>
        </div>

        <!-- 12-Week Table -->
        <div class="table-wrap" style="margin-top:20px">
          <table class="prog-table">
            <thead>
              <tr>
                <th>{{ t.weeksCol }}</th>
                <th>{{ t.focusCol }}</th>
                <th>{{ t.changesCol }}</th>
              </tr>
            </thead>
            <tbody>
              <tr :class="{ highlighted: currentWeekProgression >= 1 && currentWeekProgression <= 3 }">
                <td><strong>1–3</strong></td>
                <td>Foundation</td>
                <td>Learn form, RPE 7, low jump volume. Squat 4×5.</td>
              </tr>
              <tr class="row-deload" :class="{ highlighted: currentWeekProgression === 4 }">
                <td><strong>4</strong></td>
                <td>⚡ Deload</td>
                <td>Cut volume by 40%, light jumps. Tendon recovery.</td>
              </tr>
              <tr :class="{ highlighted: currentWeekProgression >= 5 && currentWeekProgression <= 7 }">
                <td><strong>5–7</strong></td>
                <td>Strength</td>
                <td>Heavier squats/deadlifts (RPE 8), more box jumps.</td>
              </tr>
              <tr class="row-deload" :class="{ highlighted: currentWeekProgression === 8 }">
                <td><strong>8</strong></td>
                <td>⚡ Deload</td>
                <td>Recover, light mobility, zero max jumps.</td>
              </tr>
              <tr :class="{ highlighted: currentWeekProgression >= 9 && currentWeekProgression <= 11 }">
                <td><strong>9–11</strong></td>
                <td>Explosive / Peak</td>
                <td>Depth jumps, max rim touches, 5×3 RPE 9, max dunk attempts.</td>
              </tr>
              <tr class="row-test" :class="{ highlighted: currentWeekProgression === 12 }">
                <td><strong>12</strong></td>
                <td>🏆 Test & Dunk</td>
                <td>Test max vertical, attempt official dunk, celebrate!</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- RPE Guide Box -->
        <div class="card rpe-card" style="margin-top:20px">
          <h4>💡 What Does RPE Mean?</h4>
          <div class="rpe-row">
            <span class="rpe-badge green">RPE 7</span>
            <span>You could comfortably do <strong>3 more reps</strong> before failure.</span>
          </div>
          <div class="rpe-row">
            <span class="rpe-badge yellow">RPE 8</span>
            <span>You could do <strong>2 more reps</strong> before failure.</span>
          </div>
          <div class="rpe-row">
            <span class="rpe-badge red">RPE 9</span>
            <span>You could only do <strong>1 more rep</strong> with strict form.</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- TAB 4: WARM-UP (10–12 min)                                     -->
    <!-- ============================================================== -->
    <div v-if="currentTab === 'warmup'" class="tab-content fade-in">
      <div class="card">
        <div class="section-title">
          <span>🔥 {{ t.warmupHeading }}</span>
        </div>
        <p class="body-p">{{ t.warmupSub }}</p>

        <div class="warmup-checklist">
          <div
            v-for="(w, idx) in warmupItems"
            :key="w.name"
            class="warmup-item"
            :class="{ checked: warmupChecks[idx] }"
            @click="warmupChecks[idx] = !warmupChecks[idx]"
          >
            <div class="chk-box">
              <span v-if="warmupChecks[idx]">✓</span>
            </div>
            <div class="wi-text">
              <div class="wi-name">{{ w.name }}</div>
              <div class="wi-desc">{{ w.desc[lang] }}</div>
            </div>
            <div class="wi-reps">{{ w.reps }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- TAB 5: POST-SESSION STRETCHING & ANKLE MOBILITY                -->
    <!-- ============================================================== -->
    <div v-if="currentTab === 'stretching'" class="tab-content fade-in">
      <div class="card">
        <div class="section-title">
          <span>🧘 {{ t.stretchingHeading }}</span>
        </div>
        <p class="body-p">{{ t.stretchingSub }}</p>

        <div class="alert-box-warning" style="margin-bottom:16px">
          ⚠️ <strong>{{ t.ankleNoteHeading }}</strong>: {{ t.ankleNoteBody }}
        </div>

        <div class="stretch-grid">
          <div v-for="st in stretchingItems" :key="st.name" class="stretch-card">
            <div class="st-icon">{{ st.icon }}</div>
            <div class="st-info">
              <h4>{{ st.name }}</h4>
              <p>{{ st.target[lang] }}</p>
              <span class="st-hold">⏱️ 30–45s (2 rounds)</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================================== -->
    <!-- TAB 6: DUNK TECHNIQUE & RULES TO GAIN 13 CM                    -->
    <!-- ============================================================== -->
    <div v-if="currentTab === 'technique'" class="tab-content fade-in">
      
      <!-- Dunk Technique Masterclass -->
      <div class="card">
        <div class="section-title">
          <span>🏀 {{ t.techniqueHeading }}</span>
        </div>

        <div class="tech-box">
          <div class="tech-step">
            <div class="ts-num">1</div>
            <div>
              <h4>{{ t.penultimateHeading }}</h4>
              <p>{{ t.penultimateBody }}</p>
            </div>
          </div>

          <div class="tech-step">
            <div class="ts-num">2</div>
            <div>
              <h4>{{ t.armSwingHeading }}</h4>
              <p>{{ t.armSwingBody }}</p>
            </div>
          </div>

          <div class="tech-step">
            <div class="ts-num">3</div>
            <div>
              <h4>{{ t.oneFootHeading }}</h4>
              <p>{{ t.oneFootBody }}</p>
            </div>
          </div>

          <div class="tech-step">
            <div class="ts-num">4</div>
            <div>
              <h4>{{ t.twoFootHeading }}</h4>
              <p>{{ t.twoFootBody }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Rules to gain 13 cm -->
      <div class="card" style="margin-top:16px">
        <div class="section-title">
          <span>⚡ {{ t.rulesHeading }}</span>
        </div>
        <ul class="rules-list">
          <li v-for="(rule, idx) in rulesList" :key="idx">
            <span class="rule-num">{{ idx + 1 }}.</span>
            <span>{{ rule[lang] }}</span>
          </li>
        </ul>
      </div>

      <!-- Realistic Timeline -->
      <div class="card" style="margin-top:16px">
        <div class="section-title">
          <span>⏳ {{ t.timelineHeading }}</span>
        </div>
        <div class="timeline-row">
          <div class="tl-item">
            <div class="tl-time">2–3 WEEKS</div>
            <div class="tl-desc">Feel bouncier, smoother landing, +1–3 cm.</div>
          </div>
          <div class="tl-item">
            <div class="tl-time">6–8 WEEKS</div>
            <div class="tl-desc">Visible jump increase, touching rim with ease.</div>
          </div>
          <div class="tl-item">
            <div class="tl-time">12 WEEKS</div>
            <div class="tl-desc">Significant leap transformation, small ball dunks!</div>
          </div>
          <div class="tl-item highlight">
            <div class="tl-time">+13 CM DUNK</div>
            <div class="tl-desc">Realistic in 3–6 months with dedicated sleep & protein.</div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { loadUserData, saveUserData } from '../useAuth.js'

const props = defineProps({
  uid: String,
  profile: Object
})
defineEmits(['go'])

const lang = ref('en')
const mode = ref('gym') // 'gym' or 'home'
const currentTab = ref('schedule') // schedule, challenge, periodization, warmup, stretching, technique
const currentWeekProgression = ref(1)

// Rest Timer logic
const activeTimer = ref(0)
const timerCountdown = ref(0)
const activeTimerEx = ref('')
const timerIsPaused = ref(false)
let timerInterval = null

function startRestTimer(secs, exName) {
  if (timerInterval) clearInterval(timerInterval)
  activeTimer.value = secs
  timerCountdown.value = secs
  activeTimerEx.value = exName
  timerIsPaused.value = false
  
  timerInterval = setInterval(() => {
    if (timerCountdown.value > 1) {
      timerCountdown.value--
    } else {
      stopRestTimer()
      try {
        const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg')
        audio.play()
      } catch (e) {}
    }
  }, 1000)
}

function stopRestTimer() {
  if (timerInterval) clearInterval(timerInterval)
  activeTimer.value = 0
  timerCountdown.value = 0
  activeTimerEx.value = ''
  timerIsPaused.value = false
}

function toggleRestTimer(secs, exName) {
  if (activeTimerEx.value === exName) {
    if (timerIsPaused.value) {
      timerIsPaused.value = false
      timerInterval = setInterval(() => {
        if (timerCountdown.value > 1) {
          timerCountdown.value--
        } else {
          stopRestTimer()
          try {
            const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg')
            audio.play()
          } catch (e) {}
        }
      }, 1000)
    } else {
      if (timerInterval) clearInterval(timerInterval)
      timerIsPaused.value = true
    }
  } else {
    startRestTimer(secs, exName)
  }
}

// 7 Days definition
const daysList = [
  { id: 'mon', short: { en: 'Mon', rw: 'Mbe' }, isHighJump: true },
  { id: 'tue', short: { en: 'Tue', rw: 'Kab' }, isHighJump: false },
  { id: 'wed', short: { en: 'Wed', rw: 'Gat' }, isHighJump: true },
  { id: 'thu', short: { en: 'Thu', rw: 'Kan' }, isHighJump: false },
  { id: 'fri', short: { en: 'Fri', rw: 'Gtn' }, isHighJump: false },
  { id: 'sat', short: { en: 'Sat', rw: 'Gnd' }, isHighJump: true },
  { id: 'sun', short: { en: 'Sun', rw: 'Cyu' }, isHighJump: false, isRest: true },
]

const todayIndex = new Date().getDay()
const dayIdMap = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const todayId = dayIdMap[todayIndex]
const activeDay = ref(todayId)

const completedDays = ref({})
const warmupChecks = ref(Array(10).fill(false))

// Challenge form
const challengeForm = ref({
  level: 1,
  approach: '2-foot',
  distance: '',
  ball: 'None',
  penultimateScore: 4,
  notes: ''
})
const challengeHistory = ref([])
const selectedMilestoneView = ref(null)

const currentMilestoneLevel = computed(() => {
  if (!challengeHistory.value.length) return 1
  return Math.max(...challengeHistory.value.map(e => e.level))
})

// Milestones
const milestoneLevels = [
  {
    level: 1,
    icon: '🥅',
    name: { en: 'Net / Backboard Touch', rw: 'Gukora ku Rushundura' },
    desc: { en: 'Cleanly touch the basketball net or lower backboard.', rw: 'Kugera ku rushundura cyangwa hasi y\'icyapa.' },
    tip: { en: 'Focus on explosive arm swing and knee drive.', rw: 'Koresha amaboko cyane uzamura hejuru.' }
  },
  {
    level: 2,
    icon: '🖐️',
    name: { en: 'Rim Touch (Fingertips)', rw: 'Gukora ku Cyuma (Inzara)' },
    desc: { en: 'Graze or tap the 10 ft rim with your fingertips.', rw: 'Gukora ku cyuma cya metero 3.05 n\'inzara z\'intoki.' },
    tip: { en: 'Execute the penultimate step long and low.', rw: 'Intambwe ibanziriza iya nyuma igomba kuba ndende kandi hasi.' }
  },
  {
    level: 3,
    icon: '✊',
    name: { en: 'Rim Grab (One Hand)', rw: 'Gufata Icyuma (Ukuboko 1)' },
    desc: { en: 'Grab the iron solidly with your dominant hand.', rw: 'Gufata icyuma ukagikomeza n\'ukuboko kwawe gukomeye.' },
    tip: { en: 'Reach through the rim, not just at it.', rw: 'Rangamira hejuru y\'icyuma aho kugikoreraho gusa.' }
  },
  {
    level: 4,
    icon: '🙌',
    name: { en: 'Rim Hang (Two Hands)', rw: 'Kumanika ku Cyuma (Amaboko 2)' },
    desc: { en: 'Grab and hang on the rim with both hands securely.', rw: 'Gufata no kumanika ku cyuma n\'amaboko yombi.' },
    tip: { en: 'Requires +5-7 cm above the rim for hand clearance.', rw: 'Birasaba kurenga icyuma ho santimetero 5 kugeza kuri 7.' }
  },
  {
    level: 5,
    icon: '🎾',
    name: { en: 'Tennis / Small Ball Dunk', rw: 'Gushyiramo Agapira gato' },
    desc: { en: 'Dunk a tennis ball or size 3 mini basketball cleanly.', rw: 'Gutsinda umupira muto cyangwa tennis muri rim.' },
    tip: { en: 'Teaches timing, wrist action, and aggressive downward snap.', rw: 'Bikwigisha gukubita umupira hasi mu gihe gikwiriye.' }
  },
  {
    level: 6,
    icon: '🏐',
    name: { en: 'Volleyball / 9.5ft Dunk', rw: 'Dunk ya Volleyball' },
    desc: { en: 'Flush a volleyball or size 6 ball into a 10 ft rim.', rw: 'Gutsinda volleyball mu cyuma cyuzuye.' },
    tip: { en: 'Almost there! Grip control and elevation are aligning.', rw: 'Uri hafi cyane! Fata umupira neza unazamuke byuzuye.' }
  },
  {
    level: 7,
    icon: '🏀',
    name: { en: 'Official Size 7 Dunk!', rw: 'DUNK NYAKURI YA BASKETBALL!' },
    desc: { en: 'Throw down an official men\'s size 7 basketball with authority.', rw: 'Kwinjiza umupira munini w\'umukino mu cyuma cy\'umukino!' },
    tip: { en: 'LEGENDARY STATUS. You have conquered the rim.', rw: 'UBWIYONGERE BWA NYABURANGA. Waciye agahigo!' }
  }
]

selectedMilestoneView.value = milestoneLevels[0]

function getMilestoneIcon(lvl) {
  const m = milestoneLevels.find(x => x.level === lvl)
  return m ? m.icon : '🏀'
}
function getMilestoneName(lvl) {
  const m = milestoneLevels.find(x => x.level === lvl)
  return m ? m.name[lang.value] : `Level ${lvl}`
}

// Full 7-Day Workout Data
const dayDataMap = {
  mon: {
    color: '#f97316',
    isHighJump: true,
    name: { en: 'Monday', rw: 'Kuwa Mbere' },
    intensity: { en: 'High Strength + Moderate Jumps', rw: 'Imbaraga nyinshi + Gusimbuka buringaniye' },
    title: { en: 'Lower Strength A — Squat Focus', rw: 'Imbaraga z\'Amaguru A — Squat' },
    focus: { en: 'Build maximal force output in legs & tendons', rw: 'Gufasha amaguru kubaka imbaraga nyinshi zo gusimbuka' },
    gymExercises: [
      { name: 'Back Squat (or Goblet Squat)', sets: '4×5', rest: '2–3 min', restSecs: 150, note: { en: 'Explode up out of the hole, control descent', rw: 'Zamura vuba n\'imbaraga, umanuke witonze' } },
      { name: 'Romanian Deadlift (RDL)', sets: '3×8', rest: '90 sec', restSecs: 90, note: { en: 'Push hips back, feel hamstring stretch', rw: 'Shyira ikibuno inyuma, wumve imikaya y\'inyuma y\'amaguru' } },
      { name: 'Bulgarian Split Squat', sets: '3×8 / leg', rest: '60–90 sec', restSecs: 75, note: { en: 'Full knee flexion, chest proud', rw: 'Pfukama hasi neza, amaguru yose akore' } },
      { name: 'Standing Calf Raise', sets: '4×12–15', rest: '45 sec', restSecs: 45, note: { en: '2-sec pause at the peak, deep stretch at bottom', rw: 'Hagarara ku mano amasegonda 2 mbere yo kumanuka' } },
      { name: 'Box Jump', sets: '4×3–5', rest: '90 sec', restSecs: 90, note: { en: 'Step down, never jump down! Soft landing', rw: 'Ururuke witonze, ntugwe nabi ku maguru' } },
      { name: 'Standing Vertical Jump', sets: '3×3 max intent', rest: '90 sec', restSecs: 90, note: { en: '100% maximum intent every single jump', rw: 'Simbuka n\'imbaraga zawe zose uko ushoboye' } },
      { name: 'Plank', sets: '3×45 sec', rest: '45 sec', restSecs: 45, note: { en: 'Glutes squeezed, ribs tucked', rw: 'Komeza umubiri wose ntiwirekure' } },
    ],
    homeExercises: [
      { name: 'Heavy Backpack Goblet Squat', sets: '4×8', rest: '2 min', restSecs: 120, note: { en: 'Fill bag with books/water bottles', rw: 'Shyira ibitabo cyangwa amazi mu gikapu' } },
      { name: 'Single-Leg Romanian Deadlift', sets: '3×10 / leg', rest: '60 sec', restSecs: 60, note: { en: 'Balance and control hamstring tension', rw: 'Hagarara ku kaguru kamwe witonze' } },
      { name: 'Elevated Bulgarian Split Squat (Couch/Chair)', sets: '3×10 / leg', rest: '60 sec', restSecs: 60, note: { en: 'Back foot on sofa or chair', rw: 'Akaguru k\'inyuma kabe ku ntebe' } },
      { name: 'Single-Leg Deficit Calf Raise (Stair Step)', sets: '4×15 / leg', rest: '45 sec', restSecs: 45, note: { en: 'Full heel drop below step level', rw: 'Ku madarapo, manura igitsinsino hasi' } },
      { name: 'Tuck Jumps (Max Height)', sets: '4×3', rest: '90 sec', restSecs: 90, note: { en: 'Knees to chest, land like a ninja', rw: 'Zamura amavi ku gatuza, ururuke buhoro' } },
      { name: 'Max Standing Jump & Touch High Wall', sets: '3×3', rest: '90 sec', restSecs: 90, note: { en: 'Mark your highest point on the wall', rw: 'Kora ku rukuta hejuru cyane hashoboka' } },
      { name: 'Floor Plank', sets: '3×45 sec', rest: '45 sec', restSecs: 45, note: { en: 'Tight core and hips level', rw: 'Komeza inda yawe' } },
    ]
  },
  tue: {
    color: '#3b82f6',
    isHighJump: false,
    name: { en: 'Tuesday', rw: 'Kuwa Kabiri' },
    intensity: { en: 'Low Jump Impact (Upper + Core + Mobility)', rw: 'Kuruhura amaguru (Iby\'hejuru + Inda)' },
    title: { en: 'Upper Body + Core + Mobility', rw: 'Igice cy\'Hejuru + Inda + Koroshya Imitsi' },
    focus: { en: 'Build arm swing power and core kinetic transfer', rw: 'Gukomeza amaboko azafasha gusimbuka no kuruhura amaguru' },
    gymExercises: [
      { name: 'Bench Press (or Dumbbell Press)', sets: '4×6', rest: '2 min', restSecs: 120, note: { en: 'Drive through floor, stable shoulders', rw: 'Kanda hejuru n\'imbaraga z\'igituza' } },
      { name: 'Pull-up (or Lat Pulldown)', sets: '4×8', rest: '90 sec', restSecs: 90, note: { en: 'Pull elbows down to pockets', rw: 'Kurura n\'imbaraga z\'umugongo' } },
      { name: 'Overhead Press (Dumbbell or Barbell)', sets: '3×8', rest: '90 sec', restSecs: 90, note: { en: 'Direct power for vertical reach', rw: 'Bikwigisha kuzamura amaboko hejuru' } },
      { name: 'Seated Cable Row', sets: '3×10', rest: '60 sec', restSecs: 60, note: { en: 'Squeeze shoulder blades 1 second', rw: 'Kurura wumve ibitugu bihuye' } },
      { name: 'Hanging Leg Raise', sets: '3×10', rest: '45 sec', restSecs: 45, note: { en: 'Control swing, curl pelvis up', rw: 'Manika amaguru hejuru witonze' } },
      { name: 'Dead Bug', sets: '3×10 / side', rest: '45 sec', restSecs: 45, note: { en: 'Lower back glued flat to floor', rw: 'Umugongo wo hasi ugume hasi neza' } },
      { name: 'Side Plank', sets: '3×30 sec / side', rest: '30 sec', restSecs: 30, note: { en: 'Lateral spine stability', rw: 'Komeza imbavu zawe' } },
    ],
    homeExercises: [
      { name: 'Decline / Feet-Elevated Push-ups', sets: '4×10', rest: '90 sec', restSecs: 90, note: { en: 'Feet on chair or bed', rw: 'Amaguru ku ntebe, amaboko hasi' } },
      { name: 'Doorframe / Table Inverted Row', sets: '4×8', rest: '90 sec', restSecs: 90, note: { en: 'Pull chest up to table edge', rw: 'Kurura umubiri ku ntebe cyangwa ameza' } },
      { name: 'Pike Push-ups', sets: '3×8', rest: '90 sec', restSecs: 90, note: { en: 'Hips high, head down between hands', rw: 'Shyira umutwe hasi hagati y\'amaboko' } },
      { name: 'Backpack Single-Arm Row', sets: '3×12 / arm', rest: '60 sec', restSecs: 60, note: { en: 'Loaded bag, squeeze upper back', rw: 'Kurura igikapu kiremereye' } },
      { name: 'Lying Leg Raises', sets: '3×12', rest: '45 sec', restSecs: 45, note: { en: 'Hands under glutes, legs straight', rw: 'Zamura amaguru uryamye' } },
      { name: 'Dead Bug', sets: '3×10 / side', rest: '45 sec', restSecs: 45, note: { en: 'Keep lower back pinned down', rw: 'Umugongo ube hasi' } },
      { name: 'Side Plank', sets: '3×30 sec / side', rest: '30 sec', restSecs: 30, note: { en: 'Hips pushed forward and high', rw: 'Komeza imbavu' } },
    ]
  },
  wed: {
    color: '#6366f1',
    isHighJump: true,
    name: { en: 'Wednesday', rw: 'Kuwa Gatatu' },
    intensity: { en: 'High Plyo, Low Volume', rw: 'Gusimbuka Cyane, Ariko Ibyiciro Bike' },
    title: { en: 'Plyometrics + Dunk Technique', rw: 'Gusimbuka Byihuse + Ubuhanga bwa Dunk' },
    focus: { en: 'Elastic energy recoil, penultimate step, and rim attempts', rw: 'Gutoza imitsi kwisana no kugera ku cyuma cyane' },
    gymExercises: [
      { name: 'Depth Jump from 30–40 cm Box', sets: '4×4', rest: '2 min', restSecs: 120, note: { en: 'Minimal ground contact! Land & explode instantly', rw: 'Gwa hasi ako kanya uhite uzamuka hejuru cyane' } },
      { name: 'Box Jump (High Intent)', sets: '4×3', rest: '90 sec', restSecs: 90, note: { en: 'Focus on max hip extension', rw: 'Koresha ikibuno n\'amaguru uzamuke hejuru' } },
      { name: 'Broad Jump', sets: '3×4', rest: '90 sec', restSecs: 90, note: { en: 'Drive horizontally, stick landing for 1 sec', rw: 'Simbuka ugana imbere cyane' } },
      { name: 'Approach Rim Touches', sets: '5×3 approaches', rest: '90 sec', restSecs: 90, note: { en: 'Test both 1-foot and 2-foot approaches', rw: 'Kina intambwe zawe ushaka gukora ku cyuma' } },
      { name: 'Dunk Attempts (Small Ball or 9.5ft Rim)', sets: '10–15 attempts', rest: '60–90 sec', restSecs: 75, note: { en: 'Feel the ball go through the cylinder', rw: 'Gerageza gushyiramo umupira mu cyuma' } },
      { name: 'Ankle Hops (Stiff Ankles)', sets: '3×20 reps', rest: '45 sec', restSecs: 45, note: { en: 'Springs on your toes, knees barely bend', rw: 'Simbuka ku mano nk\'icyuma cy\'isoko' } },
    ],
    homeExercises: [
      { name: 'Depth Drop & Jump (Off a Step/Bench)', sets: '4×4', rest: '2 min', restSecs: 120, note: { en: 'Step off 30cm, explode back up immediately', rw: 'Kururuka hasi ako kanya uhite usimbuka hejuru' } },
      { name: 'Max Vertical Tuck Jump', sets: '4×3', rest: '90 sec', restSecs: 90, note: { en: 'Maximum air time', rw: 'Guma mu kirere igihe kinini' } },
      { name: 'Standing Broad Jump', sets: '3×4', rest: '90 sec', restSecs: 90, note: { en: 'Jump as far forward as possible', rw: 'Simbuka ugana kure imbere' } },
      { name: 'Approach Jump Touches (Wall or Tree)', sets: '5×3', rest: '90 sec', restSecs: 90, note: { en: 'High touch marker outdoors or on tall wall', rw: 'Kora ku giti cyangwa urukuta rurerure' } },
      { name: 'Tennis Ball Slam Drill', sets: '10 reps', rest: '60 sec', restSecs: 60, note: { en: 'Jump and slam small ball down with force', rw: 'Simbuka ukubite agapira hasi n\'imbaraga' } },
      { name: 'Pogo Ankle Hops', sets: '3×20', rest: '45 sec', restSecs: 45, note: { en: 'Fast reactive contact', rw: 'Gusimbuka ku mano vuba vuba' } },
    ]
  },
  thu: {
    color: '#22c55e',
    isHighJump: false,
    name: { en: 'Thursday', rw: 'Kuwa Kane' },
    intensity: { en: 'High Strength (Posterior Chain & Single-Leg)', rw: 'Imbaraga z\'Inyuma n\'Urugendo rw\'Ukuguru 1' },
    title: { en: 'Lower Strength B — Deadlift + Single-Leg', rw: 'Imbaraga z\'Amaguru B — Deadlift' },
    focus: { en: 'Hamstrings, glute power, and unilateral stability', rw: 'Kubaka imitsi yo munsi y\'ikibuno n\'uburinganire bw\'amaguru' },
    gymExercises: [
      { name: 'Trap Bar Deadlift (or Barbell Deadlift)', sets: '4×5', rest: '2–3 min', restSecs: 150, note: { en: 'Heavy, explosive hip thrust at lockout', rw: 'Zamura n\'imbaraga zose, komeza umugongo' } },
      { name: 'Barbell Hip Thrust', sets: '3×10', rest: '90 sec', restSecs: 90, note: { en: 'Primary horizontal power engine for sprinting & dunking', rw: 'Zamura ikibuno cyane ku murongo' } },
      { name: 'Dumbbell Step-Up (Knee Height Box)', sets: '3×8 / leg', rest: '60 sec', restSecs: 60, note: { en: 'Drive through front heel, don\'t push off back toe', rw: 'Koresha ukuguru kw\'imbere gusa' } },
      { name: 'Single-Leg Standing Calf Raise', sets: '3×12 / leg', rest: '45 sec', restSecs: 45, note: { en: 'Build bulletproof achilles tendons', rw: 'Gukomeza imitsi y\'akagombambari' } },
      { name: 'Nordic Hamstring Curl (or Hamstring Slider)', sets: '3×5', rest: '60 sec', restSecs: 60, note: { en: 'Resist as long as possible on way down', rw: 'Gundama hasi urwanya kumanuka' } },
      { name: 'Lateral Bounds (Skater Jumps)', sets: '3×5 / side', rest: '60 sec', restSecs: 60, note: { en: 'Absorb and transfer lateral force', rw: 'Simbuka ugana ku mpande' } },
      { name: 'Side Plank', sets: '3×30 sec', rest: '30 sec', restSecs: 30, note: { en: 'Keep body in straight arrow line', rw: 'Komeza umubiri umurorereje' } },
    ],
    homeExercises: [
      { name: 'Backpack Heavy Suitcase Deadlift', sets: '4×8', rest: '2 min', restSecs: 120, note: { en: 'Heavy load, hinge hips back', rw: 'Koresha igikapu kiremereye' } },
      { name: 'Single-Leg Elevated Hip Thrust (Couch)', sets: '3×12 / leg', rest: '60 sec', restSecs: 60, note: { en: 'Upper back on sofa, squeeze glute at top', rw: 'Zamura ikibuno wubitse umugongo ku ntebe' } },
      { name: 'Chair Step-Ups', sets: '3×10 / leg', rest: '60 sec', restSecs: 60, note: { en: 'Drive solely with working leg', rw: 'Zamura ku ntebe n\'ukuguru kumwe' } },
      { name: 'Single-Leg Stair Calf Raise', sets: '3×15 / leg', rest: '45 sec', restSecs: 45, note: { en: 'Full stretch and pause', rw: 'Kora ku mano ku idarapo' } },
      { name: 'Floor Towel Hamstring Curls', sets: '3×8', rest: '60 sec', restSecs: 60, note: { en: 'Slide heels in on slick floor/tiles', rw: 'Kuruza ibitsinsino hasi kuri tike' } },
      { name: 'Lateral Bounds', sets: '3×5 / side', rest: '60 sec', restSecs: 60, note: { en: 'Stick each landing for 1 sec', rw: 'Gwa ku kaguru kamwe uhagarare amasegonda 2' } },
      { name: 'Side Plank', sets: '3×30 sec', rest: '30 sec', restSecs: 30, note: { en: 'Straight line posture', rw: 'Komeza imbavu' } },
    ]
  },
  fri: {
    color: '#06b6d4',
    isHighJump: false,
    name: { en: 'Friday', rw: 'Kuwa Gatanu' },
    intensity: { en: 'Medium (Speed + Upper Pull + Core)', rw: 'Hagati (Umuvuduko + Kurura + Inda)' },
    title: { en: 'Speed / Agility + Upper Pull + Core', rw: 'Umuvuduko + Umugongo + Inda' },
    focus: { en: 'Acceleration, posture, low impact — tendons rest for Saturday', rw: 'Gutera intambwe ya mbere vuba no kuruhura amaguru kuri dunk yo kuwa gatandatu' },
    gymExercises: [
      { name: '20-Meter Sprint', sets: '6× reps', rest: '90 sec', restSecs: 90, note: { en: 'Full recovery between runs, 100% speed', rw: 'Iruke n\'umuvuduko wose, uruhuke neza hagati' } },
      { name: 'A-Skips (Rhythm & Knee Drive)', sets: '3×20m', rest: '60 sec', restSecs: 60, note: { en: 'High knees, punch ground with ball of foot', rw: 'Zamura amavi hejuru n\'umuvuduko' } },
      { name: 'Lateral Shuffle', sets: '3×20m', rest: '60 sec', restSecs: 60, note: { en: 'Stay low in defensive stance, don\'t cross feet', rw: 'Genda mu mbavu ugaragaza kwirinda' } },
      { name: 'Bodyweight Pull-ups', sets: '4×8', rest: '90 sec', restSecs: 90, note: { en: 'Full hang to chin over bar', rw: 'Kurura kugeza agatuza kageze ku cyuma' } },
      { name: 'Single-Arm Dumbbell Row', sets: '3×10 / arm', rest: '60 sec', restSecs: 60, note: { en: 'Pull to hip pocket, keep back flat', rw: 'Kurura hejuru ku kibuno' } },
      { name: 'Cable Face Pull', sets: '3×15', rest: '45 sec', restSecs: 45, note: { en: 'Shoulder health and upright jumping posture', rw: 'Bifasha kurinda ibitugu' } },
      { name: 'Core Circuit (Dead bug, Bird dog, Side plank)', sets: '3 rounds', rest: '45 sec', restSecs: 45, note: { en: 'Continuous controlled tempo', rw: 'Imyitozo 3 y\'inda ikurikirana' } },
    ],
    homeExercises: [
      { name: '20m Acceleration Sprints (Outdoors)', sets: '6× reps', rest: '90 sec', restSecs: 90, note: { en: 'Full rest, pure acceleration', rw: 'Iruke hanze n\'imbaraga zose' } },
      { name: 'A-Skips', sets: '3×20m', rest: '60 sec', restSecs: 60, note: { en: 'Punch ground, punch down with toes up', rw: 'Zamura amavi hejuru' } },
      { name: 'Lateral Shuffle', sets: '3×20m', rest: '60 sec', restSecs: 60, note: { en: 'Low defensive stance', rw: 'Genda mu mbavu' } },
      { name: 'Doorframe Pull-ups / Sheet Row', sets: '4×8', rest: '90 sec', restSecs: 90, note: { en: 'Upper back engagement', rw: 'Kurura ku muryango' } },
      { name: 'Heavy Backpack Row', sets: '3×10 / arm', rest: '60 sec', restSecs: 60, note: { en: 'Control cadence', rw: 'Kurura igikapu' } },
      { name: 'Prone Y-T-W Raises (Floor)', sets: '3×12', rest: '45 sec', restSecs: 45, note: { en: 'Upper back & rear delts for posture', rw: 'Zamura amaboko uryamye ku nda' } },
      { name: 'Core Circuit (Dead bug, Bird dog, Side plank)', sets: '3 rounds', rest: '45 sec', restSecs: 45, note: { en: 'Flawless posture', rw: 'Komeza inda' } },
    ]
  },
  sat: {
    color: '#ef4444',
    isHighJump: true,
    name: { en: 'Saturday', rw: 'Kuwa Gatandatu' },
    intensity: { en: 'HIGHEST INTENSITY (Power + Dunk Attempts)', rw: 'UMUNSI UKOMEYE CYANE (Imbaraga zose + Dunk)' },
    title: { en: 'Power + Official Dunk Attempts', rw: 'Imbaraga Zuzuye + Kugerageza Dunk' },
    focus: { en: 'Peak nervous system activation, max jump height & dunk test', rw: 'Umunsi w\'ikirenga: kugerageza kwinjiza dunk n\'imbaraga 100%' },
    gymExercises: [
      { name: 'Depth Jump (30–40 cm)', sets: '4×4', rest: '2 min', restSecs: 120, note: { en: 'Prime the central nervous system', rw: 'Gukangura ubwonko n\'imitsi yose' } },
      { name: 'Light Jump Squat (Barbell or DB)', sets: '3×5', rest: '90 sec', restSecs: 90, note: { en: '20-30% max weight only. Explosive speed!', rw: 'Ibiro bike cyane, ugamije umuvuduko gusa' } },
      { name: 'Max Approach Rim Touches', sets: '5×3 reps', rest: '90 sec', restSecs: 90, note: { en: 'Full run-up, penultimate step perfection', rw: 'Intambwe yuzuye ugamije gufata icyuma' } },
      { name: 'Full Approach Dunk Attempts', sets: '10–15 attempts', rest: '60–90 sec', restSecs: 75, note: { en: 'Use small ball first, then move up. GO FOR IT!', rw: 'Gerageza dunk n\'umupira muto mbere, hanyuma munini!' } },
      { name: 'Kettlebell Swing (or DB Swing)', sets: '3×10', rest: '60 sec', restSecs: 60, note: { en: 'Violent hip snap, glute contraction', rw: 'Koresha ikibuno n\'ingufu nyinshi' } },
      { name: 'Standing Calf Raise', sets: '3×15', rest: '45 sec', restSecs: 45, note: { en: 'Final ankle stabilization', rw: 'Kora ku mano' } },
      { name: 'Pallof Press (Cable or Band)', sets: '3×10 / side', rest: '45 sec', restSecs: 45, note: { en: 'Anti-rotation core lock', rw: 'Kurinda ikibuno kunyeganyega mu kirere' } },
    ],
    homeExercises: [
      { name: 'Depth Drop to Max Vertical Jump', sets: '4×4', rest: '2 min', restSecs: 120, note: { en: 'Drop from bench, launch to ceiling', rw: 'Kururuka ako kanya uguruke hejuru' } },
      { name: 'Unweighted Jump Squat (Max Speed)', sets: '3×5', rest: '90 sec', restSecs: 90, note: { en: 'Highest possible elevation', rw: 'Simbuka cyane nta biro ufite' } },
      { name: 'Approach Jump Touches (Court / Goal)', sets: '5×3 reps', rest: '90 sec', restSecs: 90, note: { en: 'Penultimate step execution', rw: 'Kora ku cyuma n\'intambwe zawe zose' } },
      { name: 'Full Dunk Attempts on Rim', sets: '10–15 attempts', rest: '60–90 sec', restSecs: 75, note: { en: 'Record your progress in the Weekly Challenge tab!', rw: 'Andika uko byagenze muri Weekly Challenge!' } },
      { name: 'Backpack Hip Hinge Swing', sets: '3×12', rest: '60 sec', restSecs: 60, note: { en: 'Violent hip drive', rw: 'Shyira igikapu hagati y\'amaguru uzamure hejuru' } },
      { name: 'Single-Leg Calf Hops', sets: '3×12 / leg', rest: '45 sec', restSecs: 45, note: { en: 'Tendon stiffness', rw: 'Simbuka ku mano y\'ukuguru kumwe' } },
      { name: 'Banded / Towel Pallof Press', sets: '3×10 / side', rest: '45 sec', restSecs: 45, note: { en: 'Anti-rotational stability', rw: 'Komeza inda' } },
    ]
  },
  sun: {
    color: '#eab308',
    isHighJump: false,
    isRest: true,
    name: { en: 'Sunday', rw: 'Ku Cyumweru' },
    intensity: { en: 'REST DAY — Total Recovery & Muscle Repair', rw: 'UMUNSI WO KURUHUKA — Kureka Umubiri Ukisana' },
    title: { en: 'Full Rest & Regeneration Day', rw: 'Umunsi wo Kuruhuka Byuzuye' },
    focus: { en: 'Zero gym, zero lifting, zero jumping. Tendon repair & nervous system restoration.', rw: 'Nta gym, nta guterura, nta gusimbuka. Reka imitsi n\'ubwonko bisubiremo imbaraga.' },
    gymExercises: [],
    homeExercises: []
  }
}

const activeDayData = computed(() => dayDataMap[activeDay.value] || dayDataMap.mon)

// 12-Week Progression Data
const activePhaseInfo = computed(() => {
  const w = currentWeekProgression.value
  if (w >= 1 && w <= 3) {
    return {
      type: 'foundation',
      icon: '🌱',
      weeks: 'WEEKS 1–3',
      title: { en: 'Foundation Phase', rw: 'Icyiciro cy\'Ibanze' },
      desc: { en: 'Learn pristine squat/deadlift technique, maintain RPE 7, and keep jump volume low so tendons adapt.', rw: 'Kwiga uburyo bunoze bwo guterura, kutarenza RPE 7, no kugabanya ingano yo gusimbuka.' },
      rpe: 'RPE 7 (Could do 3 more reps)'
    }
  } else if (w === 4) {
    return {
      type: 'deload',
      icon: '⚡',
      weeks: 'WEEK 4',
      title: { en: 'Deload Phase 1', rw: 'Icyiciro cyo Kuruhura 1' },
      desc: { en: 'Cut total volume by 40%. Light jumps only. This is where your nervous system and tendons supercompensate.', rw: 'Gabanya ibiro n\'ingano ya siporo ho 40%. Aha niho umubiri wubaka imbaraga nshya.' },
      rpe: 'RPE 6 (Very light & bouncy)'
    }
  } else if (w >= 5 && w <= 7) {
    return {
      type: 'strength',
      icon: '💪',
      weeks: 'WEEKS 5–7',
      title: { en: 'Heavy Strength Phase', rw: 'Icyiciro cy\'Imbaraga Nyinshi' },
      desc: { en: 'Increase weight on squats and deadlifts to RPE 8. Add intent to box jumps and penultimate approaches.', rw: 'Kongera ibiro muri squats no muri deadlifts (RPE 8). Gusimbuka n\'imbaraga nyinshi.' },
      rpe: 'RPE 8 (Could do 2 more reps)'
    }
  } else if (w === 8) {
    return {
      type: 'deload',
      icon: '⚡',
      weeks: 'WEEK 8',
      title: { en: 'Deload Phase 2', rw: 'Icyiciro cyo Kuruhura 2' },
      desc: { en: 'Total recovery week before the peaking phase. Light mobility, zero maximal jumps.', rw: 'Kuruhuka byuzuye mbere yo gutangira icyiciro cya nyuma cyo gutsinda dunk.' },
      rpe: 'RPE 6 (Recovery focus)'
    }
  } else if (w >= 9 && w <= 11) {
    return {
      type: 'peak',
      icon: '🔥',
      weeks: 'WEEKS 9–11',
      title: { en: 'Explosive Peak Phase', rw: 'Icyiciro cy\'Ikirenga (Peak)' },
      desc: { en: 'Depth jumps, maximum rim touches, 5×3 reps at RPE 9. Your body is primed for maximum flight.', rw: 'Gusimbuka by\'ikirenga, gukora ku cyuma cyane, gushyiramo umupira n\'imbaraga 100%.' },
      rpe: 'RPE 9 (Peak maximal intent)'
    }
  } else {
    return {
      type: 'test',
      icon: '🏆',
      weeks: 'WEEK 12',
      title: { en: 'Official Dunk Test Week', rw: 'Icyumweru cyo Gutsinda Dunk Nyakuri' },
      desc: { en: 'Rest early in the week, then test your vertical jump and attempt your official first dunk on Saturday!', rw: 'Kuruhuka mu ntangiriro z\'icyumweru, maze kuwa gatandatu ukerekana dunk ya mbere mu buzima bwawe!' },
      rpe: 'TEST DAY (100% Max Effort)'
    }
  }
})

// Warmup items
const warmupItems = [
  { name: 'Jog, Cycle or Row', reps: '3–5 min', desc: { en: 'Raise body temperature & lubricate joints', rw: 'Kuzamura ubushyuhe bw\'umubiri' } },
  { name: 'Leg Swings (Front & Back)', reps: '2×10 / leg', desc: { en: 'Dynamic hamstring and hip flexor stretch', rw: 'Kuzunguza amaguru imbere n\'inyuma' } },
  { name: 'Ankle Rocks (Against Wall)', reps: '2×10 each', desc: { en: 'Increase dorsiflexion for deeper jump loading', rw: 'Koroshya akagombambari ku rukuta' } },
  { name: 'Hip Circles', reps: '2×10 each', desc: { en: 'Open up hip capsule for explosive drive', rw: 'Kuzengurutsa amaguru ku kibuno' } },
  { name: 'Walking Lunges with Torso Twist', reps: '2×10', desc: { en: 'Activate quads, glutes, and thoracic spine', rw: 'Intambwe ndende uzunguza igituza' } },
  { name: 'Inchworm', reps: '2×8', desc: { en: 'Posterior chain stretch & shoulder activation', rw: 'Kugenda n\'amaboko hasi ucuramye' } },
  { name: 'A-Skips', reps: '2×20m', desc: { en: 'Rhythmic coordination & violent knee drive', rw: 'Kuzamura amavi hejuru mu buryo bunyarutse' } },
  { name: 'Pogo Jumps (Ankle Elasticity)', reps: '2×20', desc: { en: 'Fast ground contact, stiff springs', rw: 'Gusimbuka ku mano vuba vuba' } },
  { name: 'Glute Bridge Holds', reps: '2×15', desc: { en: 'Wake up dormant hip extensors', rw: 'Kuzamura ikibuno no kugifatira hejuru' } },
  { name: 'Band Lateral Walk', reps: '2×10 each way', desc: { en: 'Gluteus medius firing for landing stability', rw: 'Kugendera mu mbavu ufite umugozi' } },
]

// Stretching items
const stretchingItems = [
  { name: 'Couch Stretch', icon: '🛋️', target: { en: 'Deep hip flexor & quad release', rw: 'Kurekura imitsi yo hejuru y\'amavi n\'ikibuno' } },
  { name: 'Half-Kneeling Hip Flexor', icon: '🦵', target: { en: 'Psoas opening for posture', rw: 'Kurambura imitsi y\'ikibuno' } },
  { name: 'Hamstring Stretch', icon: '📐', target: { en: 'Lengthen posterior leg muscles', rw: 'Kurambura inyuma y\'amaguru' } },
  { name: 'Calf & Achilles Stretch', icon: '👟', target: { en: 'Decompress achilles tendon after jumping', rw: 'Kuruhura imitsi y\'agatsinsino' } },
  { name: 'Adductor Rockback', icon: '↔️', target: { en: 'Groin and inner thigh elasticity', rw: 'Kurambura imitsi yo mu maguru hagati' } },
  { name: 'Pigeon Pose', icon: '🕊️', target: { en: 'Deep glute and piriformis relief', rw: 'Kurekura ikibuno n\'amatako' } },
  { name: 'Thoracic Open Book', icon: '📖', target: { en: 'Mid-back rotation for arm swing', rw: 'Kurambura umugongo wo hagati' } },
  { name: 'Child\'s Pose', icon: '🧘', target: { en: 'Decompress lumbar spine & lat stretch', rw: 'Kuruhura umugongo wose' } },
  { name: 'Standing Quad Stretch', icon: '🔥', target: { en: 'Patellar tendon recovery', rw: 'Kurambura imbere y\'amaguru' } },
  { name: '5-Min Daily Ankle Mobility', icon: '🦶', target: { en: 'CRITICAL: Ankles are huge for jump height', rw: 'INGENZI: Akagombambari niko gaha amaguru ubutwari' } },
]

// Rules list
const rulesList = [
  {
    en: 'Do not stack Air Alert + this full gym program. Air Alert is already 3 plyo days. Choose one: Use Air Alert if you have no gym; use this if you have gym.',
    rw: 'Ntukavange Air Alert n\'iyi gahunda yose ya Gym. Hitamo imwe: Koresha Air Alert niba udafite gym; koresha iyi niba ufite gym.'
  },
  {
    en: 'Sleep 8–9 hours every night. This is when your body produces growth hormone and repairs jump tendons.',
    rw: 'Sinzira amasaha 8 kugeza kuri 9 buri joro. Aha niho umubiri wisana ukubaka imitsi isimbuka.'
  },
  {
    en: 'Eat protein daily: eggs, beans, fish, chicken, milk, soy to repair muscle micro-tears.',
    rw: 'Rya poroteyine buri munsi: amagi, ibishyimbo, ifi, inkoko, amata, cyangwa soya.'
  },
  {
    en: 'Eat energy carbs: rice, potatoes, sweet potatoes, bananas, ugali, cassava.',
    rw: 'Rya ibitera imbaraga: umuceri, ibirayi, ibijumba, imineke, ubugari, n\'imyumbati.'
  },
  {
    en: 'Drink 3–4 liters of water daily to keep joint cartilage elastic.',
    rw: 'Nwa amazi ahagije (litiro 3–4 ku munsi) kugira ngo ingingo zawe zikore neza.'
  },
  {
    en: 'If knee, ankle, or back pain appears, STOP and rest. Never jump through sharp tendon pain.',
    rw: 'Niwumva ububabare mu mavi, akagombambari, cyangwa umugongo, HAGARARA uruhuke.'
  },
  {
    en: 'Deload every 4th week. Recovery is when the actual vertical jump height increases.',
    rw: 'Ruhuka mu cyumweru cya 4 cya buri kwezi (Deload). Aha niho gusimbuka kwiyongera.'
  }
]

// Navigation subtabs
const subTabs = [
  { id: 'schedule', icon: '📅', label: { en: '7-Day Gym Schedule', rw: 'Gahunda ya Gym' } },
  { id: 'challenge', icon: '🎯', label: { en: 'Weekly Dunk Challenge', rw: 'Kugerageza Dunk' } },
  { id: 'periodization', icon: '📈', label: { en: '12-Week Progression', rw: 'Ibyiciro 12' } },
  { id: 'warmup', icon: '🔥', label: { en: 'Warm-Up (12 min)', rw: 'Gushyushya Umubiri' } },
  { id: 'stretching', icon: '🧘', label: { en: 'Stretching & Ankles', rw: 'Kurambura Imitsi' } },
  { id: 'technique', icon: '🏀', label: { en: 'Dunk Technique & Rules', rw: 'Ubuhanga bwa Dunk' } },
]

// Bilingual Dictionary
const dictionary = {
  en: {
    gymMode: 'Gym Mode',
    homeMode: 'Home Mode',
    coreRule: 'Gym every day is fine. Max jumping every day is not. 3 high-intensity jump days, smart recovery on the rest.',
    maxJumpDays: 'Max Jump Days (Mon, Wed, Sat)',
    dayCompleted: 'Completed',
    markComplete: 'Mark Completed',
    viewWarmup: 'Warm-Up Protocol',
    gymExercises: 'Daily Gym Routine',
    homeExercises: 'Daily Home Equivalent Routine',
    resting: 'Rest Interval',
    startRest: 'Start Rest Timer',
    sessionFinishTitle: 'Session Cooldown Non-Negotiable',
    sessionFinishDesc: 'Spend 10 minutes stretching and working on ankle mobility after this workout.',
    openStretchingRoutine: 'View Stretching Routine',
    challengeHeading: 'Weekly Dunk Milestone Challenge',
    challengeSub: 'Test your highest reach and dunk progress every Saturday during your peak power session.',
    targetMilestone: 'Milestone Goal',
    logWeeklyTest: 'Log Saturday Dunk Test',
    highestMilestoneReached: 'Highest Level Reached Today',
    approachStyle: 'Approach Style',
    twoFootTakeoff: '2-Foot Approach (Penultimate)',
    oneFootTakeoff: '1-Foot Approach (Speed Dribble)',
    bothTested: 'Both 1-Foot and 2-Foot Tested',
    rimDistance: 'Distance from Rim / Touch Height',
    rimDistancePlaceholder: 'e.g. Touched rim! or -3 cm away',
    ballSizeTested: 'Ball Used in Test',
    noBall: 'No Ball (Hand touch only)',
    penultimateRating: 'Penultimate Step Quality',
    challengeNotes: 'Coach Notes & Feeling',
    challengeNotesPlaceholder: 'e.g. Felt explosive today, approach was fast and smooth...',
    saveAttempt: 'Save Weekly Challenge Result',
    challengeHistory: 'Weekly Challenge Progression History',
    noAttemptsYet: 'No challenge attempts recorded yet. Saturday is your day to test and log your progress!',
    twelveWeekHeading: '12-Week Periodization Engine',
    twelveWeekSub: 'How your body safely adapts from foundation to super-explosive dunking over 3 months.',
    selectCurrentWeek: 'Your Current Program Week',
    weeksCol: 'Weeks',
    focusCol: 'Focus',
    changesCol: 'Training Changes & Volume',
    warmupHeading: 'Pre-Workout Dynamic Warm-Up (10–12 min)',
    warmupSub: 'Perform every single drill before lifting weights or jumping. Protect your knees and activate your motor units.',
    stretchingHeading: 'Post-Workout Stretching & Ankle Mobility',
    stretchingSub: 'Hold each stretch for 30–45 seconds across 2 rounds. Spend 5 minutes on ankle mobility every day.',
    ankleNoteHeading: 'Ankles are crucial for jump height',
    ankleNoteBody: 'Stiff, mobile ankles give you trampoline recoil. Never skip daily ankle circles and wall rocks.',
    techniqueHeading: 'Dunk Technique: Penultimate Step & Plant',
    penultimateHeading: 'The Penultimate Step (The Engine)',
    penultimateBody: 'The second-to-last step must be long and low. It lowers your center of gravity and converts fast horizontal momentum into explosive upward launch.',
    armSwingHeading: 'Violent Arm Swing',
    armSwingBody: 'Cock your arms behind your hips on the penultimate step. As your plant foot hits, explosively whip both arms upward toward the sky.',
    oneFootHeading: '1-Foot Dunk Approach',
    oneFootBody: 'Best for fast sprint run-ups. Jump off your opposite plant foot, keep your chest high, and reach up with your dunking hand.',
    twoFootHeading: '2-Foot Dunk Approach',
    twoFootBody: 'Best for power and traffic dunks. The last two steps must be rapid (quick 1-2 plant). Both feet dig into the floor as you jump straight up.',
    rulesHeading: 'Rules to Actually Gain +13 cm & Dunk',
    timelineHeading: 'Realistic Dunk Timeline'
  },
  rw: {
    gymMode: 'Muri Gym',
    homeMode: 'Mu Rugo',
    coreRule: 'Kujya muri gym buri munsi birashoboka. Ariko gusimbuka cyane buri munsi ntibyemewe. Iminsi 3 yo gusimbuka cyane, indi yo gukomeza umubiri no kuruhuka.',
    maxJumpDays: 'Iminsi yo Gusimbuka (Mbe, Gat, Gnd)',
    dayCompleted: 'Byarangiye',
    markComplete: 'Shyiraho ko Warangije',
    viewWarmup: 'Gushyushya Umubiri',
    gymExercises: 'Imyitozo yo Muri Gym',
    homeExercises: 'Imyitozo yo Mu Rugo (Nta Gym)',
    resting: 'Igihe cyo Kuruhuka',
    startRest: 'Tangiza Igihe',
    sessionFinishTitle: 'Kusoza Siporo no Kurambura Imitsi',
    sessionFinishDesc: 'Mbere yo gutaha, fata iminota 10 urambure imitsi kandi ukoroshye akagombambari.',
    openStretchingRoutine: 'Reba Uburyo bwo Kurambura',
    challengeHeading: 'Isuzuma rya Buri Cyumweru rya Dunk',
    challengeSub: 'Gerageza gukora ku cyuma no gushyiramo dunk buri kuwa Gatandatu mu myitozo ikomeye.',
    targetMilestone: 'Intego Yagezweho',
    logWeeklyTest: 'Andika Isuzuma ryo Kuwa Gatandatu',
    highestMilestoneReached: 'Urwego Wagaragaje Uyu Munsi',
    approachStyle: 'Uburyo bwo Gutera Intambwe',
    twoFootTakeoff: 'Gusimbukira ku Maguru Yombi (Penultimate)',
    oneFootTakeoff: 'Gusimbukira ku Kaguru Kamwe n\'Umuvuduko',
    bothTested: 'Nagerageje Yombi',
    rimDistance: 'Intera usigaje kugera ku cyuma',
    rimDistancePlaceholder: 'Urugero: Nakozemo! cyangwa nsanzwe 3cm...',
    ballSizeTested: 'Umupira Wakoreshejwe',
    noBall: 'Nta mupira (Intoki gusa)',
    penultimateRating: 'Ubuziranenge bw\'Intambwe Ibanziriza iya Nyuma',
    challengeNotes: 'Uko wiyumvise n\'Inyandiko zawe',
    challengeNotesPlaceholder: 'Urugero: Niyumvisemo ingufu nyinshi, nateye intambwe nziza...',
    saveAttempt: 'Bika Ibyavuye mu Isuzuma',
    challengeHistory: 'Amateka y\'Isuzuma rya Dunk',
    noAttemptsYet: 'Nta suzuma rirandikwa. Kuwa Gatandatu ni umunsi wawe wo kwipima no kubika intambwe uteye!',
    twelveWeekHeading: 'Inzira y\'Ibyumweru 12 yo Gutera Imbere',
    twelveWeekSub: 'Uko umubiri wawe uzagenda wiyubaka kugeza usimbukira hejuru mu mezi 3.',
    selectCurrentWeek: 'Icyumweru Ugezemo',
    weeksCol: 'Ibyumweru',
    focusCol: 'Intego',
    changesCol: 'Impinduka mu Myitozo',
    warmupHeading: 'Gushyushya Umubiri Mbere yo Gutangira (Iminota 10–12)',
    warmupSub: 'Banza ukore iyi myitozo yose mbere yo guterura cyangwa gusimbuka. Birinda amavi bikongera imbaraga.',
    stretchingHeading: 'Kurambura Imitsi Nyuma ya Siporo n\'Akagombambari',
    stretchingSub: 'Fata amasegonda 30 kugeza kuri 45 kuri buri mwitozo, inshuro 2. Kandi wite ku kagombambari buri munsi.',
    ankleNoteHeading: 'Akagombambari ni ingenzi cyane mu gusimbuka',
    ankleNoteBody: 'Akagombambari gafite imbaraga niko gatuma wisana nk\'icyuma kiguherekeza mu kirere.',
    techniqueHeading: 'Ubuhanga bwa Dunk: Intambwe n\'Amaboko',
    penultimateHeading: 'Intambwe Ibanziriza iya Nyuma (Penultimate)',
    penultimateBody: 'Iyi ntambwe igomba kuba ndende kandi hasi. Igabanya uburemere igatuma umuvuduko wagenderagaho uhindukamo imbaraga zo kuzamuka hejuru.',
    armSwingHeading: 'Guterura Amaboko n\'Imbaraga Zose',
    armSwingBody: 'Subiza amaboko inyuma y\'ikibuno mu ntambwe ibanza. Igihe uhagaze hasi ngo uzamuke, yamazamure vuba cyane mu kirere.',
    oneFootHeading: 'Gusimbukira ku Kaguru Kamwe',
    oneFootBody: 'Byiza mu kwiruka cyane. Simbukira ku kaguru kanyuranye n\'ak\'imbere, wubure igituza hejuru.',
    twoFootHeading: 'Gusimbukira ku Maguru Yombi',
    twoFootBody: 'Bikungura imbaraga nyinshi. Intambwe 2 za nyuma zikwiriye kuba vuba cyane (1-2) uhite uzamuka hejuru nk\'umurabyo.',
    rulesHeading: 'Amategeko yo Kwiyongeraho +13 cm no Gukora Dunk',
    timelineHeading: 'Igihe Nyakuri Bizatwara'
  }
}

const t = computed(() => dictionary[lang.value])

// Day toggle
function toggleDayComplete(dayId) {
  completedDays.value[dayId] = !completedDays.value[dayId]
  saveState()
}

function saveWeekChoice(w) {
  saveState()
}

// Challenge saving
function saveChallengeAttempt() {
  const newEntry = {
    id: 'dunk_test_' + Date.now(),
    date: new Date().toLocaleDateString(),
    week: currentWeekProgression.value,
    level: Number(challengeForm.value.level),
    approach: challengeForm.value.approach,
    distance: challengeForm.value.distance,
    ball: challengeForm.value.ball,
    penultimateScore: challengeForm.value.penultimateScore,
    notes: challengeForm.value.notes
  }
  challengeHistory.value.unshift(newEntry)
  saveState()
  challengeForm.value.notes = ''
}

function deleteChallengeEntry(id) {
  challengeHistory.value = challengeHistory.value.filter(e => e.id !== id)
  saveState()
}

// Rep & Set Counters
const repCounters = ref({})
const setCounters = ref({})

function parseTargetSets(setsStr) {
  if (!setsStr) return null
  const m = setsStr.match(/^(\d+)\s*[×x]/)
  return m ? parseInt(m[1]) : null
}

function parseTargetReps(setsStr) {
  if (!setsStr) return null
  const parts = setsStr.split(/[×x]/)
  if (parts.length > 1) {
    const repPart = parts[1].trim()
    const numMatch = repPart.match(/(\d+)/g)
    if (numMatch) return parseInt(numMatch[numMatch.length - 1])
  }
  const simpleMatch = setsStr.match(/(\d+)\s*(?:reps?|attempts?)/i)
  return simpleMatch ? parseInt(simpleMatch[1]) : null
}

function isTimeBased(str) {
  if (!str) return false
  return /sec|min|hold/i.test(str)
}

function parseTargetSecs(str) {
  if (!str) return 45
  const secM = str.match(/(\d+)\s*sec/i)
  if (secM) return parseInt(secM[1])
  const minM = str.match(/(\d+)\s*min/i)
  if (minM) return parseInt(minM[1]) * 60
  return 45
}

function timerDisplay(t) {
  const s = t && typeof t.remaining === 'number' ? t.remaining : 0
  const m = Math.floor(s / 60)
  const rem = s % 60
  return `${m > 0 ? m + ':' : ''}${rem < 10 && m > 0 ? '0' : ''}${rem}s`
}

const exTimers = ref({})

function getExTimer(dayId, name) {
  const k = `${dayId}_${name}`
  if (!exTimers.value[k]) {
    exTimers.value[k] = { remaining: 0, total: 0, running: false, done: false, _iv: null }
  }
  return exTimers.value[k]
}

function startExTimer(dayId, name, secs = 45) {
  const t = getExTimer(dayId, name)
  if (t._iv) clearInterval(t._iv)
  if (!t.remaining || t.done) {
    t.remaining = secs
    t.total = secs
  }
  t.running = true
  t.done = false
  t._iv = setInterval(() => {
    if (t.remaining > 1) {
      t.remaining--
    } else {
      clearInterval(t._iv)
      t.remaining = 0
      t.running = false
      t.done = true
      try {
        const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg')
        audio.play()
      } catch (e) {}
    }
  }, 1000)
}

function pauseExTimer(dayId, name) {
  const t = getExTimer(dayId, name)
  if (t._iv) clearInterval(t._iv)
  t.running = false
}

function resetExTimer(dayId, name, secs = 45) {
  const t = getExTimer(dayId, name)
  if (t._iv) clearInterval(t._iv)
  t.remaining = secs
  t.total = secs
  t.running = false
  t.done = false
}

function getRepCount(dayId, name) {
  const k = `${dayId}_${name}`
  if (repCounters.value[k] === undefined) repCounters.value[k] = 0
  return repCounters.value[k]
}
function tapRep(dayId, name) {
  const k = `${dayId}_${name}`
  repCounters.value[k] = (repCounters.value[k] || 0) + 1
  saveState()
}
function resetReps(dayId, name) {
  const k = `${dayId}_${name}`
  repCounters.value[k] = 0
  saveState()
}

function getSetCount(dayId, name) {
  const k = `${dayId}_${name}`
  if (setCounters.value[k] === undefined) setCounters.value[k] = 0
  return setCounters.value[k]
}
function addSet(dayId, name, restSecs = 90) {
  const k = `${dayId}_${name}`
  setCounters.value[k] = (setCounters.value[k] || 0) + 1
  repCounters.value[k] = 0
  if (exTimers.value[k]) {
    resetExTimer(dayId, name, exTimers.value[k].total || 45)
  }
  startRestTimer(restSecs, name)
  saveState()
}
function resetSets(dayId, name) {
  const k = `${dayId}_${name}`
  setCounters.value[k] = 0
  saveState()
}

// Storage persistence
async function loadState() {
  let data = null
  if (props.uid) {
    data = await loadUserData(props.uid, 'dunk_pro_data')
  }
  if (!data) {
    try {
      const local = localStorage.getItem('dunk_pro_data_' + (props.uid || 'anon'))
      if (local) data = JSON.parse(local)
    } catch (e) {}
  }

  if (data) {
    if (data.completedDays) completedDays.value = data.completedDays
    if (data.currentWeekProgression) currentWeekProgression.value = data.currentWeekProgression
    if (Array.isArray(data.challengeHistory)) challengeHistory.value = data.challengeHistory
    if (data.repCounters) repCounters.value = data.repCounters
    if (data.setCounters) setCounters.value = data.setCounters
    if (data.mode) mode.value = data.mode
    if (data.lang) lang.value = data.lang
  }
}

async function saveState() {
  const payload = {
    completedDays: completedDays.value,
    currentWeekProgression: currentWeekProgression.value,
    challengeHistory: challengeHistory.value,
    repCounters: repCounters.value,
    setCounters: setCounters.value,
    mode: mode.value,
    lang: lang.value,
    updatedAt: new Date().toISOString()
  }
  if (props.uid) {
    await saveUserData(props.uid, 'dunk_pro_data', payload)
  }
  try {
    localStorage.setItem('dunk_pro_data_' + (props.uid || 'anon'), JSON.stringify(payload))
  } catch (e) {}
}

onMounted(() => {
  loadState()
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
  Object.values(exTimers.value).forEach(t => {
    if (t && t._iv) clearInterval(t._iv)
  })
})
</script>

<style scoped>
.dunkpro-root {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 40px;
}

/* Hero */
.dunkpro-hero {
  border-left: 4px solid var(--accent);
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(15, 15, 30, 0.95) 100%);
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.hero-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.badge-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.edition-badge {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 1px;
  background: var(--accent);
  color: #fff;
  padding: 3px 8px;
  border-radius: 6px;
}
.lang-toggle {
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text-h);
  font-size: 12px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}
.lang-toggle:hover {
  border-color: var(--accent);
}
.mode-toggle {
  display: flex;
  background: var(--surface2);
  padding: 3px;
  border-radius: 10px;
  border: 1px solid var(--border);
}
.mode-btn {
  background: transparent;
  color: var(--text);
  font-size: 12px;
  font-weight: 700;
  padding: 5px 10px;
  border-radius: 7px;
  transition: all 0.2s;
}
.mode-btn.active {
  background: var(--surface3);
  color: var(--text-h);
  border: 1px solid var(--border2);
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.hero-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}
.hero-title {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 900;
  letter-spacing: 0.5px;
  color: var(--text-h);
  margin-bottom: 4px;
}
.hero-quote {
  font-size: 13px;
  font-style: italic;
  color: var(--text2);
  line-height: 1.4;
  max-width: 460px;
}
.hero-stat-pill {
  background: var(--surface2);
  border: 1px solid var(--border);
  padding: 8px 12px;
  border-radius: 12px;
  text-align: center;
  min-width: 90px;
}
.stat-pill-num {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 900;
  color: var(--accent);
}
.stat-pill-label {
  font-size: 10px;
  color: var(--text);
  text-transform: uppercase;
}

/* Subnav */
.subnav-row {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
  scrollbar-width: none;
}
.subnav-row::-webkit-scrollbar { display: none; }
.subnav-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text2);
  font-size: 12px;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}
.subnav-btn.active {
  background: var(--surface3);
  color: var(--accent);
  border-color: var(--accent);
}

/* Day Pills */
.day-pills-row {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 4px 0 10px;
  scrollbar-width: none;
}
.day-pills-row::-webkit-scrollbar { display: none; }
.day-pill {
  flex: 1;
  min-width: 44px;
  height: 52px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
  transition: all 0.2s;
}
.day-pill.active {
  background: var(--surface2);
  border-color: var(--accent);
  box-shadow: 0 0 16px rgba(249, 115, 22, 0.2);
}
.day-pill.today {
  border-bottom: 3px solid var(--blue);
}
.day-short {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-h);
}
.jump-indicator {
  font-size: 10px;
  margin-top: 2px;
}
.day-dot-indicator {
  font-size: 11px;
  color: var(--green);
  font-weight: 900;
}

/* Day Hero Card */
.day-card-hero {
  border-left: 4px solid var(--accent);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.day-header-flex {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}
.day-sub-label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.day-main-title {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-h);
  margin: 2px 0 4px;
}
.day-focus-desc {
  font-size: 13px;
  color: var(--text2);
}
.day-tag-badge {
  font-size: 11px;
  font-weight: 800;
  padding: 4px 8px;
  border-radius: 8px;
  white-space: nowrap;
}
.day-action-row {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}
.btn-complete-day {
  flex: 1;
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text-h);
  padding: 9px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-complete-day.done {
  background: rgba(34, 197, 94, 0.15);
  border-color: var(--green);
  color: var(--green);
}
.btn-jump-warmup {
  background: rgba(249, 115, 22, 0.15);
  border: 1px solid var(--accent);
  color: var(--accent);
  padding: 9px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

/* Exercises Section */
.exercises-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 12px 0 8px;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 800;
  color: var(--text-h);
}
.rest-timer-quick {
  background: var(--accent);
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 20px;
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.04); }
  100% { transform: scale(1); }
}

.exercise-cards-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ex-card {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: var(--surface);
  border: 1px solid var(--border);
}
.ex-card-top {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.ex-num {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 800;
  background: var(--surface2);
  color: var(--text);
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
}
.ex-title-wrap {
  flex: 1;
}
.ex-name {
  font-size: 15px;
  font-weight: 700;
  color: var(--text-h);
}
.ex-note {
  font-size: 12px;
  color: var(--text);
  margin-top: 2px;
}
.ex-sets-badge {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 800;
  background: rgba(249, 115, 22, 0.15);
  color: var(--accent);
  padding: 3px 8px;
  border-radius: 8px;
  white-space: nowrap;
}
.ex-footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 8px;
  border-top: 1px solid var(--border);
}
.ex-rest {
  font-size: 12px;
  color: var(--text2);
  display: flex;
  align-items: center;
  gap: 4px;
}
.timer-trigger-btn {
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text-h);
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}
.timer-trigger-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}

/* Cooldown card */
.cooldown-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.3);
  margin-top: 6px;
}
.cd-icon { font-size: 24px; }
.cd-info h4 { font-size: 14px; margin-bottom: 2px; }
.cd-info p { font-size: 12px; color: var(--text2); }
.link-btn {
  background: transparent;
  color: var(--blue2);
  font-size: 12px;
  font-weight: 700;
  padding: 0;
  margin-top: 6px;
  text-decoration: underline;
  cursor: pointer;
}

/* Weekly Dunk Challenge */
.challenge-hero {
  border-left: 4px solid var(--red);
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(15, 15, 30, 0.95) 100%);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.ch-badge {
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 800;
  color: var(--red);
}
.ch-title {
  font-size: 20px;
  font-weight: 900;
  color: var(--text-h);
}
.ch-desc {
  font-size: 13px;
  color: var(--text2);
}

.milestone-stepper {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 10px 0 4px;
  scrollbar-width: none;
}
.milestone-stepper::-webkit-scrollbar { display: none; }
.milestone-step {
  flex: 1;
  min-width: 78px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 8px 6px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}
.milestone-step.active {
  background: rgba(239, 68, 68, 0.15);
  border-color: var(--red);
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.2);
}
.m-icon { font-size: 18px; margin-bottom: 2px; }
.m-level { font-size: 11px; font-weight: 800; color: var(--text-h); }
.m-name { font-size: 9px; color: var(--text); line-height: 1.2; margin-top: 2px; }

.milestone-detail-card {
  border: 1px solid var(--border2);
  background: var(--surface2);
}
.md-top {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}
.md-emoji { font-size: 28px; }
.md-target { font-size: 11px; font-weight: 800; color: var(--accent); text-transform: uppercase; }
.md-name { font-size: 16px; font-weight: 800; color: var(--text-h); }
.md-desc { font-size: 13px; color: var(--text2); margin-bottom: 6px; }
.md-tip {
  font-size: 12px;
  background: var(--surface3);
  padding: 8px 10px;
  border-radius: 8px;
  color: var(--text-h);
}

.log-challenge-card {
  margin-top: 10px;
}
.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 10px;
}
@media (max-width: 480px) {
  .form-grid-2 { grid-template-columns: 1fr; }
}
.badge-week {
  font-size: 12px;
  background: var(--surface2);
  color: var(--accent);
  padding: 3px 8px;
  border-radius: 6px;
  margin-left: auto;
}
.star-rating {
  display: flex;
  align-items: center;
  gap: 4px;
}
.star-btn {
  background: transparent;
  font-size: 24px;
  color: var(--border2);
  cursor: pointer;
  transition: all 0.15s;
}
.star-btn.filled {
  color: var(--yellow);
}
.rating-label {
  font-size: 13px;
  font-weight: 700;
  margin-left: 8px;
  color: var(--text2);
}

.history-card {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
}
.hc-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.hc-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.hc-emoji { font-size: 24px; }
.hc-level { font-size: 14px; font-weight: 800; color: var(--text-h); }
.hc-date { font-size: 11px; color: var(--text); }
.hc-del {
  background: transparent;
  color: var(--text);
  font-size: 14px;
  cursor: pointer;
  padding: 4px;
}
.hc-details {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.hc-tag {
  background: var(--surface2);
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 6px;
  color: var(--text2);
}
.hc-notes {
  font-size: 12px;
  font-style: italic;
  color: var(--text2);
  border-left: 2px solid var(--accent);
  padding-left: 8px;
}
.empty-card {
  text-align: center;
  padding: 24px;
  color: var(--text);
}
.empty-icon { font-size: 32px; margin-bottom: 6px; }

/* 12-Week Progression */
.week-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}
.week-btn {
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text2);
  font-size: 12px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
}
.week-btn.active {
  background: var(--accent);
  color: #fff;
  border-color: var(--accent);
}
.week-btn.deload { border-color: var(--yellow); }
.week-btn.test { border-color: var(--green); }

.active-phase-card {
  margin-top: 14px;
  padding: 14px;
  border-left: 4px solid var(--accent);
}
.active-phase-card.deload { border-left-color: var(--yellow); }
.active-phase-card.peak { border-left-color: var(--red); }
.active-phase-card.test { border-left-color: var(--green); }
.phase-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}
.phase-icon { font-size: 26px; }
.phase-tag { font-size: 11px; font-weight: 800; color: var(--accent); }
.phase-title { font-size: 16px; font-weight: 800; color: var(--text-h); }
.phase-desc { font-size: 13px; color: var(--text2); line-height: 1.4; }
.phase-rpe { font-size: 12px; margin-top: 8px; color: var(--text-h); }

.table-wrap { overflow-x: auto; }
.prog-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.prog-table th, .prog-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}
.prog-table th { color: var(--text); font-size: 11px; text-transform: uppercase; }
.prog-table tr.highlighted {
  background: rgba(249, 115, 22, 0.12);
}
.row-deload { color: var(--yellow); }
.row-test { color: var(--green); }

.rpe-card { background: var(--surface2); }
.rpe-card h4 { font-size: 14px; margin-bottom: 8px; }
.rpe-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
  margin-bottom: 6px;
}
.rpe-badge {
  font-size: 11px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  min-width: 50px;
  text-align: center;
}
.rpe-badge.green { background: rgba(34, 197, 94, 0.2); color: var(--green); }
.rpe-badge.yellow { background: rgba(234, 179, 8, 0.2); color: var(--yellow); }
.rpe-badge.red { background: rgba(239, 68, 68, 0.2); color: var(--red); }

/* Warmup Checklist */
.warmup-checklist {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}
.warmup-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
}
.warmup-item.checked {
  background: rgba(34, 197, 94, 0.08);
  border-color: var(--green);
}
.chk-box {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 1.5px solid var(--border2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--green);
}
.warmup-item.checked .chk-box {
  background: var(--green);
  color: #fff;
  border-color: var(--green);
}
.wi-text { flex: 1; }
.wi-name { font-size: 14px; font-weight: 700; color: var(--text-h); }
.wi-desc { font-size: 12px; color: var(--text); }
.wi-reps {
  font-size: 12px;
  font-weight: 800;
  color: var(--accent);
  background: var(--surface3);
  padding: 3px 8px;
  border-radius: 6px;
}

/* Stretching */
.alert-box-warning {
  background: rgba(234, 179, 8, 0.1);
  border: 1px solid var(--yellow);
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
  color: var(--text-h);
}
.stretch-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 10px;
}
@media (max-width: 480px) {
  .stretch-grid { grid-template-columns: 1fr; }
}
.stretch-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: var(--surface2);
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
}
.st-icon { font-size: 22px; }
.st-info h4 { font-size: 14px; margin-bottom: 2px; }
.st-info p { font-size: 12px; color: var(--text2); margin-bottom: 4px; }
.st-hold { font-size: 11px; color: var(--accent); font-weight: 700; }

/* Technique */
.tech-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
}
.tech-step {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: var(--surface2);
  padding: 12px;
  border-radius: 10px;
}
.ts-num {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 900;
  color: var(--accent);
  background: var(--surface3);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}
.tech-step h4 { font-size: 14px; margin-bottom: 2px; }
.tech-step p { font-size: 13px; color: var(--text2); line-height: 1.4; }

.rules-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}
.rules-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  color: var(--text2);
  line-height: 1.4;
}
.rule-num {
  font-weight: 800;
  color: var(--accent);
}

.timeline-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 10px;
}
@media (max-width: 480px) {
  .timeline-row { grid-template-columns: 1fr; }
}
.tl-item {
  background: var(--surface2);
  border: 1px solid var(--border);
  padding: 10px 12px;
  border-radius: 10px;
}
.tl-item.highlight {
  border-color: var(--accent);
  background: rgba(249, 115, 22, 0.1);
}
.tl-time {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 900;
  color: var(--accent);
  margin-bottom: 2px;
}
.tl-desc { font-size: 12px; color: var(--text2); }

.body-p {
  font-size: 13px;
  color: var(--text2);
  margin-top: 4px;
}
.fade-in {
  animation: fadeIn 0.25s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Rep & Set Counter Bar */
.rep-counter-row {
  display: flex;
  gap: 10px;
  background: var(--surface2);
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid var(--border);
}
.counter-item {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
}
.cnt-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text);
  min-width: 32px;
}
.rep-count-btn, .set-count-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: var(--surface3);
  border: 1px solid var(--border2);
  color: var(--text-h);
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}
.rep-count-btn:active, .set-count-btn:active {
  transform: scale(0.96);
}
.rep-count-btn.reached {
  background: rgba(34, 197, 94, 0.2);
  border-color: var(--green);
  color: var(--green);
}
.set-count-btn.reached {
  background: rgba(249, 115, 22, 0.2);
  border-color: var(--accent);
  color: var(--accent);
}
.cnt-num {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 900;
}
.cnt-target {
  font-size: 12px;
  color: var(--text2);
}
.set-plus {
  font-size: 11px;
  font-weight: 800;
  color: var(--accent);
  margin-right: 2px;
}
.cnt-reset {
  background: transparent;
  color: var(--text);
  font-size: 14px;
  padding: 4px;
  cursor: pointer;
  transition: color 0.15s;
}
.cnt-reset:hover {
  color: var(--text-h);
}

/* Hold / Time-Based Counter Styles */
.ex-hold-timer {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  background: var(--surface3);
  border: 1px solid var(--border2);
  color: var(--text-h);
  padding: 5px 8px;
  border-radius: 8px;
  transition: all 0.2s;
}
.ex-hold-timer.running {
  border-color: var(--accent);
  background: rgba(249, 115, 22, 0.15);
}
.ex-hold-timer.done {
  border-color: var(--green);
  background: rgba(34, 197, 94, 0.18);
}
.hold-time {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 800;
  color: var(--text-h);
  font-variant-numeric: tabular-nums;
  min-width: 34px;
  text-align: center;
}
.ex-hold-timer.running .hold-time {
  color: var(--accent);
}
.ex-hold-timer.done .hold-time {
  color: var(--green);
}
.btn-timer-action {
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text-h);
  border-radius: 6px;
  padding: 3px 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-timer-action:hover {
  border-color: var(--accent);
  color: var(--accent);
}
.btn-pause {
  color: var(--accent);
  border-color: var(--accent);
}
.hold-badge {
  font-size: 10px;
  font-weight: 700;
  color: var(--text2);
  margin-left: 2px;
}

/* Timer Controls Group */
.timer-controls-group {
  display: flex;
  align-items: center;
  gap: 6px;
}
.timer-trigger-btn.paused {
  background: rgba(234, 179, 8, 0.15);
  border-color: var(--yellow);
  color: var(--yellow);
}
.btn-timer-cancel {
  background: var(--surface2);
  border: 1px solid var(--border);
  color: var(--text2);
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-timer-cancel:hover {
  border-color: #ef4444;
  color: #ef4444;
}

/* Rest Day Styles */
.rest-day-card {
  border-left: 4px solid var(--yellow);
  background: linear-gradient(135deg, rgba(234, 179, 8, 0.12) 0%, rgba(15, 15, 30, 0.95) 100%);
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
}
.rest-hero-top {
  display: flex;
  align-items: center;
  gap: 14px;
}
.rest-emoji {
  font-size: 36px;
}
.rest-title {
  font-size: 18px;
  font-weight: 800;
  color: var(--text-h);
}
.rest-quote {
  font-size: 13px;
  font-style: italic;
  color: var(--text2);
  margin-top: 3px;
}
.rest-pillars-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
@media (max-width: 480px) {
  .rest-pillars-grid { grid-template-columns: 1fr; }
}
.rest-pillar {
  background: var(--surface2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px;
}
.rp-icon {
  font-size: 22px;
  display: block;
  margin-bottom: 6px;
}
.rest-pillar h4 {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-h);
  margin-bottom: 4px;
}
.rest-pillar p {
  font-size: 12px;
  color: var(--text2);
  line-height: 1.4;
}
.rest-action-box {
  margin-top: 4px;
}
.rest-indicator {
  font-size: 11px;
}
</style>
