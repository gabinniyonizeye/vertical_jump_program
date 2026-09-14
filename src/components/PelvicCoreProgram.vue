<template>
  <div class="pcp-wrap">

    <div class="card pcp-header">
      <div class="header-row">
        <div>
          <div class="header-title">🦴 Full Posture Fix</div>
          <div class="header-sub">APT + Rounded Shoulders + Forward Head — full chain correction in 30 days.</div>
        </div>
        <div class="day-badge">
          <div class="badge-val">Day {{ currentDay }}</div>
          <div class="badge-lbl">of 30</div>
        </div>
      </div>
      <div class="progress-bar"><div class="progress-fill" :style="{ width: (completedDays.length / 30 * 100) + '%' }"></div></div>
      <div class="day-nav">
        <button class="day-btn" @click="currentDay = Math.max(1, currentDay - 1)">‹ Prev</button>
        <span class="phase-pill" :style="{ background: currentPhase.color + '22', color: currentPhase.color, border: '1px solid ' + currentPhase.color + '55' }">
          {{ currentPhase.icon }} {{ currentPhase.label }}
        </span>
        <button class="day-btn" @click="currentDay = Math.min(30, currentDay + 1)">Next ›</button>
      </div>
    </div>

    <div class="card chain-banner">
      <div class="chain-title">📐 The Full Posture Chain — Why You Can't Stand Straight</div>
      <div class="chain-steps">
        <div class="chain-step"><span class="cs-num">1</span><div><strong>APT</strong> — pelvis tips forward, lower back over-arches</div></div>
        <div class="chain-arrow">↓</div>
        <div class="chain-step"><span class="cs-num">2</span><div><strong>Rib flare</strong> — ribcage pushes forward, belly protrudes</div></div>
        <div class="chain-arrow">↓</div>
        <div class="chain-step"><span class="cs-num">3</span><div><strong>Thoracic kyphosis</strong> — mid-back rounds, chest caves in</div></div>
        <div class="chain-arrow">↓</div>
        <div class="chain-step"><span class="cs-num">4</span><div><strong>Rounded shoulders</strong> — pec minor pulls shoulders forward</div></div>
        <div class="chain-arrow">↓</div>
        <div class="chain-step"><span class="cs-num">5</span><div><strong>Forward head</strong> — head juts forward, neck strains</div></div>
      </div>
      <div class="chain-fix">⚡ This program fixes every link. Block D targets the upper chain daily.</div>
    </div>

    <div v-if="todayWorkout.isRest" class="card rest-card">
      <div class="rest-icon">💤</div>
      <div class="rest-title">Active Recovery Day</div>
      <div class="rest-desc">10–20 min walk. Let your nervous system consolidate the motor patterns you trained this week.</div>
      <button class="complete-day-btn" :class="{ done: isDayComplete }" @click="markDayComplete">
        {{ isDayComplete ? '✅ Day Logged' : 'Log Rest Day' }}
      </button>
    </div>

    <template v-else>
      <div class="card phase-focus">
        <div class="pf-left">
          <div class="pf-icon">{{ currentPhase.icon }}</div>
          <div>
            <div class="pf-name">{{ currentPhase.label }}</div>
            <div class="pf-desc">{{ currentPhase.focus }}</div>
          </div>
        </div>
        <div class="pf-rounds">{{ currentPhase.rounds }}<span>rounds</span></div>
      </div>

      <!-- Block A -->
      <div class="card block-card">
        <div class="block-header inhibit">
          <div class="block-letter">A</div>
          <div>
            <div class="block-title">Inhibit — Release Tight Muscles</div>
            <div class="block-sub">2–3 min · Do this FIRST.</div>
          </div>
        </div>
        <div class="ex-list">
          <div v-for="ex in todayWorkout.blockA" :key="ex.name" class="ex-card" :class="{ done: isExDone('A', ex.name) }">
            <div class="ex-top">
              <div class="ex-check" :class="{ done: isExDone('A', ex.name) }" @click="toggleEx('A', ex.name)">{{ isExDone('A', ex.name) ? '✓' : '○' }}</div>
              <div class="ex-body">
                <div class="ex-name">{{ ex.name }}</div>
                <div class="ex-dose">{{ getAmount(ex) }}</div>
              </div>
              <button v-if="ex.tutorialUrl" class="ex-vid-toggle" :class="{ active: hiddenVideos[ex.name] === false }" @click.stop="toggleVideo(ex.name)">
                {{ hiddenVideos[ex.name] === false ? '▼ Hide' : '▶ Tutorial' }}
              </button>
            </div>
            <div class="rep-counter">
              <!-- Time-based: show countdown timer -->
              <template v-if="isTimeBased(getAmount(ex))">
                <div class="ex-timer" :class="{ running: getExTimer('A', ex.name).running, done: getExTimer('A', ex.name).done }">
                  <span class="et-time">{{ restDisplay(getExTimer('A', ex.name).total ? getExTimer('A', ex.name) : { remaining: parseTargetSecs(getAmount(ex)) || 0, total: parseTargetSecs(getAmount(ex)) || 1 }) }}</span>
                  <button v-if="!getExTimer('A', ex.name).running && !getExTimer('A', ex.name).done" @click.stop="startExTimer('A', ex.name, parseTargetSecs(getAmount(ex)))">▶</button>
                  <button v-if="getExTimer('A', ex.name).running" @click.stop="pauseExTimer('A', ex.name)">⏸</button>
                  <button @click.stop="resetExTimer('A', ex.name, parseTargetSecs(getAmount(ex)))">↺</button>
                  <span class="et-label">{{ getExTimer('A', ex.name).done ? '✅ Done!' : getExTimer('A', ex.name).running ? 'Hold...' : 'Countdown' }}</span>
                </div>
              </template>
              <!-- Rep-based: show tap counter -->
              <template v-else>
                <button class="rep-tap" @click.stop="tapRep('A', ex.name)">
                  <span class="rep-num" :class="{ reached: parseTargetReps(getAmount(ex)) && getRepCount('A', ex.name) >= parseTargetReps(getAmount(ex)) }">{{ getRepCount('A', ex.name) }}</span>
                  <span class="rep-target" v-if="parseTargetReps(getAmount(ex))"> / {{ parseTargetReps(getAmount(ex)) }}</span>
                </button>
                <button class="rep-reset" @click.stop="resetReps('A', ex.name)">↺</button>
                <span class="rep-label">Tap to count</span>
              </template>
              <!-- Set counter (always shown) -->
              <div class="set-counter">
                <button class="set-btn" @click.stop="addSet('A', ex.name)">+Set</button>
                <span class="set-done">{{ getSetState('A', ex.name).done }}</span>
                <button class="rep-reset" @click.stop="resetSets('A', ex.name)">↺</button>
              </div>
            </div>
            <div class="ex-why">🏀 {{ ex.why }}</div>
            <div v-if="ex.tutorialUrl && hiddenVideos[ex.name] === false" class="ex-video-panel">
              <div class="evp-bar">
                <span class="evp-label">📹 Tutorial</span>
                <a :href="ex.tutorialUrl" target="_blank" class="evp-yt">↗️ YouTube</a>
              </div>
              <div class="evp-frame">
                <iframe :src="getEmbedUrl(ex.tutorialUrl)" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
              </div>
            </div>
            <div v-if="isExDone('A', ex.name)" class="inline-rest" :class="{ running: getRestTimer('A', ex.name).running, finished: getRestTimer('A', ex.name).done }">
              <div class="irt-top">
                <span class="irt-label">{{ getRestTimer('A', ex.name).done ? '✅ Rest Done!' : getRestTimer('A', ex.name).running ? '⏱ Resting...' : '⏸ Rest Timer' }}</span>
                <span class="irt-time">{{ restDisplay(getRestTimer('A', ex.name)) }}</span>
              </div>
              <div class="irt-bar"><div class="irt-fill" :style="{ width: restProgress(getRestTimer('A', ex.name)) + '%', background: getRestTimer('A', ex.name).done ? '#22c55e' : getRestTimer('A', ex.name).running ? '#f97316' : '#6366f1' }"></div></div>
              <div class="irt-btns">
                <button v-if="!getRestTimer('A', ex.name).running && !getRestTimer('A', ex.name).done" @click.stop="startRest('A', ex.name, 60)">▶ Start</button>
                <button v-if="getRestTimer('A', ex.name).running" @click.stop="pauseRest('A', ex.name)">⏸ Pause</button>
                <button @click.stop="resetRest('A', ex.name, 60)">↺</button>
                <button @click.stop="setRest('A', ex.name, 30)">30s</button>
                <button @click.stop="setRest('A', ex.name, 60)">60s</button>
                <button @click.stop="setRest('A', ex.name, 90)">90s</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Block B -->
      <div class="card block-card">
        <div class="block-header activate">
          <div class="block-letter">B</div>
          <div>
            <div class="block-title">Activate — Wake Up Inhibited Muscles</div>
            <div class="block-sub">5–7 min · Glutes + deep core that APT has switched off.</div>
          </div>
        </div>
        <div class="ex-list">
          <div v-for="ex in todayWorkout.blockB" :key="ex.name" class="ex-card" :class="{ done: isExDone('B', ex.name) }">
            <div class="ex-top">
              <div class="ex-check" :class="{ done: isExDone('B', ex.name) }" @click="toggleEx('B', ex.name)">{{ isExDone('B', ex.name) ? '✓' : '○' }}</div>
              <div class="ex-body">
                <div class="ex-name">{{ ex.name }}</div>
                <div class="ex-dose">{{ getAmount(ex) }}</div>
              </div>
              <button v-if="ex.tutorialUrl" class="ex-vid-toggle" :class="{ active: hiddenVideos[ex.name] === false }" @click.stop="toggleVideo(ex.name)">
                {{ hiddenVideos[ex.name] === false ? '▼ Hide' : '▶ Tutorial' }}
              </button>
            </div>
            <div class="rep-counter">
              <template v-if="isTimeBased(getAmount(ex))">
                <div class="ex-timer" :class="{ running: getExTimer('B', ex.name).running, done: getExTimer('B', ex.name).done }">
                  <span class="et-time">{{ restDisplay(getExTimer('B', ex.name).total ? getExTimer('B', ex.name) : { remaining: parseTargetSecs(getAmount(ex)) || 0, total: parseTargetSecs(getAmount(ex)) || 1 }) }}</span>
                  <button v-if="!getExTimer('B', ex.name).running && !getExTimer('B', ex.name).done" @click.stop="startExTimer('B', ex.name, parseTargetSecs(getAmount(ex)))">▶</button>
                  <button v-if="getExTimer('B', ex.name).running" @click.stop="pauseExTimer('B', ex.name)">⏸</button>
                  <button @click.stop="resetExTimer('B', ex.name, parseTargetSecs(getAmount(ex)))">↺</button>
                  <span class="et-label">{{ getExTimer('B', ex.name).done ? '✅ Done!' : getExTimer('B', ex.name).running ? 'Hold...' : 'Countdown' }}</span>
                </div>
              </template>
              <template v-else>
                <button class="rep-tap" @click.stop="tapRep('B', ex.name)">
                  <span class="rep-num" :class="{ reached: parseTargetReps(getAmount(ex)) && getRepCount('B', ex.name) >= parseTargetReps(getAmount(ex)) }">{{ getRepCount('B', ex.name) }}</span>
                  <span class="rep-target" v-if="parseTargetReps(getAmount(ex))"> / {{ parseTargetReps(getAmount(ex)) }}</span>
                </button>
                <button class="rep-reset" @click.stop="resetReps('B', ex.name)">↺</button>
                <span class="rep-label">Tap to count</span>
              </template>
              <div class="set-counter">
                <button class="set-btn" @click.stop="addSet('B', ex.name)">+Set</button>
                <span class="set-done">{{ getSetState('B', ex.name).done }}</span>
                <button class="rep-reset" @click.stop="resetSets('B', ex.name)">↺</button>
              </div>
            </div>
            <div class="ex-why">🏀 {{ ex.why }}</div>
            <div v-if="ex.tutorialUrl && hiddenVideos[ex.name] === false" class="ex-video-panel">
              <div class="evp-bar">
                <span class="evp-label">📹 Tutorial</span>
                <a :href="ex.tutorialUrl" target="_blank" class="evp-yt">↗️ YouTube</a>
              </div>
              <div class="evp-frame">
                <iframe :src="getEmbedUrl(ex.tutorialUrl)" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
              </div>
            </div>
            <div v-if="isExDone('B', ex.name)" class="inline-rest" :class="{ running: getRestTimer('B', ex.name).running, finished: getRestTimer('B', ex.name).done }">
              <div class="irt-top">
                <span class="irt-label">{{ getRestTimer('B', ex.name).done ? '✅ Rest Done!' : getRestTimer('B', ex.name).running ? '⏱ Resting...' : '⏸ Rest Timer' }}</span>
                <span class="irt-time">{{ restDisplay(getRestTimer('B', ex.name)) }}</span>
              </div>
              <div class="irt-bar"><div class="irt-fill" :style="{ width: restProgress(getRestTimer('B', ex.name)) + '%', background: getRestTimer('B', ex.name).done ? '#22c55e' : getRestTimer('B', ex.name).running ? '#f97316' : '#6366f1' }"></div></div>
              <div class="irt-btns">
                <button v-if="!getRestTimer('B', ex.name).running && !getRestTimer('B', ex.name).done" @click.stop="startRest('B', ex.name, 60)">▶ Start</button>
                <button v-if="getRestTimer('B', ex.name).running" @click.stop="pauseRest('B', ex.name)">⏸ Pause</button>
                <button @click.stop="resetRest('B', ex.name, 60)">↺</button>
                <button @click.stop="setRest('B', ex.name, 30)">30s</button>
                <button @click.stop="setRest('B', ex.name, 60)">60s</button>
                <button @click.stop="setRest('B', ex.name, 90)">90s</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Block C -->
      <div class="card block-card">
        <div class="block-header integrate">
          <div class="block-letter">C</div>
          <div>
            <div class="block-title">Integrate — Load the Pattern</div>
            <div class="block-sub">8–10 min · Train the whole system under load.</div>
          </div>
        </div>
        <div class="ex-list">
          <div v-for="ex in todayWorkout.blockC" :key="ex.name" class="ex-card" :class="{ done: isExDone('C', ex.name) }">
            <div class="ex-top">
              <div class="ex-check" :class="{ done: isExDone('C', ex.name) }" @click="toggleEx('C', ex.name)">{{ isExDone('C', ex.name) ? '✓' : '○' }}</div>
              <div class="ex-body">
                <div class="ex-name">{{ ex.name }}</div>
                <div class="ex-dose">{{ getAmount(ex) }}</div>
              </div>
              <button v-if="ex.tutorialUrl" class="ex-vid-toggle" :class="{ active: hiddenVideos[ex.name] === false }" @click.stop="toggleVideo(ex.name)">
                {{ hiddenVideos[ex.name] === false ? '▼ Hide' : '▶ Tutorial' }}
              </button>
            </div>
            <div class="rep-counter">
              <template v-if="isTimeBased(getAmount(ex))">
                <div class="ex-timer" :class="{ running: getExTimer('C', ex.name).running, done: getExTimer('C', ex.name).done }">
                  <span class="et-time">{{ restDisplay(getExTimer('C', ex.name).total ? getExTimer('C', ex.name) : { remaining: parseTargetSecs(getAmount(ex)) || 0, total: parseTargetSecs(getAmount(ex)) || 1 }) }}</span>
                  <button v-if="!getExTimer('C', ex.name).running && !getExTimer('C', ex.name).done" @click.stop="startExTimer('C', ex.name, parseTargetSecs(getAmount(ex)))">▶</button>
                  <button v-if="getExTimer('C', ex.name).running" @click.stop="pauseExTimer('C', ex.name)">⏸</button>
                  <button @click.stop="resetExTimer('C', ex.name, parseTargetSecs(getAmount(ex)))">↺</button>
                  <span class="et-label">{{ getExTimer('C', ex.name).done ? '✅ Done!' : getExTimer('C', ex.name).running ? 'Hold...' : 'Countdown' }}</span>
                </div>
              </template>
              <template v-else>
                <button class="rep-tap" @click.stop="tapRep('C', ex.name)">
                  <span class="rep-num" :class="{ reached: parseTargetReps(getAmount(ex)) && getRepCount('C', ex.name) >= parseTargetReps(getAmount(ex)) }">{{ getRepCount('C', ex.name) }}</span>
                  <span class="rep-target" v-if="parseTargetReps(getAmount(ex))"> / {{ parseTargetReps(getAmount(ex)) }}</span>
                </button>
                <button class="rep-reset" @click.stop="resetReps('C', ex.name)">↺</button>
                <span class="rep-label">Tap to count</span>
              </template>
              <div class="set-counter">
                <button class="set-btn" @click.stop="addSet('C', ex.name)">+Set</button>
                <span class="set-done">{{ getSetState('C', ex.name).done }}</span>
                <button class="rep-reset" @click.stop="resetSets('C', ex.name)">↺</button>
              </div>
            </div>
            <div class="ex-why">🏀 {{ ex.why }}</div>
            <div v-if="ex.tutorialUrl && hiddenVideos[ex.name] === false" class="ex-video-panel">
              <div class="evp-bar">
                <span class="evp-label">📹 Tutorial</span>
                <a :href="ex.tutorialUrl" target="_blank" class="evp-yt">↗️ YouTube</a>
              </div>
              <div class="evp-frame">
                <iframe :src="getEmbedUrl(ex.tutorialUrl)" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
              </div>
            </div>
            <div v-if="isExDone('C', ex.name)" class="inline-rest" :class="{ running: getRestTimer('C', ex.name).running, finished: getRestTimer('C', ex.name).done }">
              <div class="irt-top">
                <span class="irt-label">{{ getRestTimer('C', ex.name).done ? '✅ Rest Done!' : getRestTimer('C', ex.name).running ? '⏱ Resting...' : '⏸ Rest Timer' }}</span>
                <span class="irt-time">{{ restDisplay(getRestTimer('C', ex.name)) }}</span>
              </div>
              <div class="irt-bar"><div class="irt-fill" :style="{ width: restProgress(getRestTimer('C', ex.name)) + '%', background: getRestTimer('C', ex.name).done ? '#22c55e' : getRestTimer('C', ex.name).running ? '#f97316' : '#6366f1' }"></div></div>
              <div class="irt-btns">
                <button v-if="!getRestTimer('C', ex.name).running && !getRestTimer('C', ex.name).done" @click.stop="startRest('C', ex.name, 60)">▶ Start</button>
                <button v-if="getRestTimer('C', ex.name).running" @click.stop="pauseRest('C', ex.name)">⏸ Pause</button>
                <button @click.stop="resetRest('C', ex.name, 60)">↺</button>
                <button @click.stop="setRest('C', ex.name, 30)">30s</button>
                <button @click.stop="setRest('C', ex.name, 60)">60s</button>
                <button @click.stop="setRest('C', ex.name, 90)">90s</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Block D -->
      <div class="card block-card">
        <div class="block-header upper">
          <div class="block-letter">D</div>
          <div>
            <div class="block-title">Upper Posture — Thoracic + Shoulders + Neck</div>
            <div class="block-sub">3–4 min · Fixes the upper chain. Do this to stand straight.</div>
          </div>
        </div>
        <div class="ex-list">
          <div v-for="ex in todayWorkout.blockD" :key="ex.name" class="ex-card" :class="{ done: isExDone('D', ex.name) }">
            <div class="ex-top">
              <div class="ex-check" :class="{ done: isExDone('D', ex.name) }" @click="toggleEx('D', ex.name)">{{ isExDone('D', ex.name) ? '✓' : '○' }}</div>
              <div class="ex-body">
                <div class="ex-name">{{ ex.name }}</div>
                <div class="ex-dose">{{ getAmount(ex) }}</div>
              </div>
              <button v-if="ex.tutorialUrl" class="ex-vid-toggle" :class="{ active: hiddenVideos[ex.name] === false }" @click.stop="toggleVideo(ex.name)">
                {{ hiddenVideos[ex.name] === false ? '▼ Hide' : '▶ Tutorial' }}
              </button>
            </div>
            <div class="rep-counter">
              <template v-if="isTimeBased(getAmount(ex))">
                <div class="ex-timer" :class="{ running: getExTimer('D', ex.name).running, done: getExTimer('D', ex.name).done }">
                  <span class="et-time">{{ restDisplay(getExTimer('D', ex.name).total ? getExTimer('D', ex.name) : { remaining: parseTargetSecs(getAmount(ex)) || 0, total: parseTargetSecs(getAmount(ex)) || 1 }) }}</span>
                  <button v-if="!getExTimer('D', ex.name).running && !getExTimer('D', ex.name).done" @click.stop="startExTimer('D', ex.name, parseTargetSecs(getAmount(ex)))">▶</button>
                  <button v-if="getExTimer('D', ex.name).running" @click.stop="pauseExTimer('D', ex.name)">⏸</button>
                  <button @click.stop="resetExTimer('D', ex.name, parseTargetSecs(getAmount(ex)))">↺</button>
                  <span class="et-label">{{ getExTimer('D', ex.name).done ? '✅ Done!' : getExTimer('D', ex.name).running ? 'Hold...' : 'Countdown' }}</span>
                </div>
              </template>
              <template v-else>
                <button class="rep-tap" @click.stop="tapRep('D', ex.name)">
                  <span class="rep-num" :class="{ reached: parseTargetReps(getAmount(ex)) && getRepCount('D', ex.name) >= parseTargetReps(getAmount(ex)) }">{{ getRepCount('D', ex.name) }}</span>
                  <span class="rep-target" v-if="parseTargetReps(getAmount(ex))"> / {{ parseTargetReps(getAmount(ex)) }}</span>
                </button>
                <button class="rep-reset" @click.stop="resetReps('D', ex.name)">↺</button>
                <span class="rep-label">Tap to count</span>
              </template>
              <div class="set-counter">
                <button class="set-btn" @click.stop="addSet('D', ex.name)">+Set</button>
                <span class="set-done">{{ getSetState('D', ex.name).done }}</span>
                <button class="rep-reset" @click.stop="resetSets('D', ex.name)">↺</button>
              </div>
            </div>
            <div class="ex-why">🧍 {{ ex.why }}</div>
            <div v-if="ex.tutorialUrl && hiddenVideos[ex.name] === false" class="ex-video-panel">
              <div class="evp-bar">
                <span class="evp-label">📹 Tutorial</span>
                <a :href="ex.tutorialUrl" target="_blank" class="evp-yt">↗️ YouTube</a>
              </div>
              <div class="evp-frame">
                <iframe :src="getEmbedUrl(ex.tutorialUrl)" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
              </div>
            </div>
            <div v-if="isExDone('D', ex.name)" class="inline-rest" :class="{ running: getRestTimer('D', ex.name).running, finished: getRestTimer('D', ex.name).done }">
              <div class="irt-top">
                <span class="irt-label">{{ getRestTimer('D', ex.name).done ? '✅ Rest Done!' : getRestTimer('D', ex.name).running ? '⏱ Resting...' : '⏸ Rest Timer' }}</span>
                <span class="irt-time">{{ restDisplay(getRestTimer('D', ex.name)) }}</span>
              </div>
              <div class="irt-bar"><div class="irt-fill" :style="{ width: restProgress(getRestTimer('D', ex.name)) + '%', background: getRestTimer('D', ex.name).done ? '#22c55e' : getRestTimer('D', ex.name).running ? '#f97316' : '#6366f1' }"></div></div>
              <div class="irt-btns">
                <button v-if="!getRestTimer('D', ex.name).running && !getRestTimer('D', ex.name).done" @click.stop="startRest('D', ex.name, 60)">▶ Start</button>
                <button v-if="getRestTimer('D', ex.name).running" @click.stop="pauseRest('D', ex.name)">⏸ Pause</button>
                <button @click.stop="resetRest('D', ex.name, 60)">↺</button>
                <button @click.stop="setRest('D', ex.name, 30)">30s</button>
                <button @click.stop="setRest('D', ex.name, 60)">60s</button>
                <button @click.stop="setRest('D', ex.name, 90)">90s</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card cue-card">
        <div class="cue-label">🧠 Today's Coaching Cue</div>
        <div class="cue-text">"{{ todayWorkout.cue }}"</div>
      </div>

      <button class="complete-day-btn" :class="{ done: isDayComplete }" @click="markDayComplete">
        {{ isDayComplete ? '✅ Day Complete!' : 'Mark Day Complete' }}
      </button>
    </template>

    <div class="card section-card">
      <div class="section-title">📅 Week {{ currentWeek }} of 4</div>
      <div class="week-grid">
        <div v-for="d in weekDays" :key="d.abs" class="wd" :class="{ active: d.abs === currentDay, done: completedDays.includes(d.abs), rest: d.isRest }" @click="currentDay = d.abs">
          <div class="wd-day">{{ d.label }}</div>
          <div class="wd-icon">{{ completedDays.includes(d.abs) ? '✅' : d.isRest ? '💤' : d.icon }}</div>
          <div class="wd-focus">{{ d.focus }}</div>
        </div>
      </div>
    </div>

    <div class="card section-card">
      <div class="section-title">🗺️ 30-Day Roadmap</div>
      <div class="roadmap">
        <div v-for="p in phases" :key="p.days" class="roadmap-row" :class="{ active: currentPhase === p }">
          <div class="rm-dot" :style="{ background: currentPhase === p ? p.color : 'var(--border)' }"></div>
          <div class="rm-body">
            <div class="rm-top">
              <span class="rm-label">{{ p.icon }} {{ p.label }}</span>
              <span class="rm-days">Days {{ p.days }}</span>
            </div>
            <div class="rm-desc">{{ p.roadmapDesc }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="card science-card">
      <div class="sci-title">📚 The Science Behind This Program</div>
      <div class="sci-list">
        <div class="sci-item"><div class="sci-dot"></div><div><strong>Janda's approach:</strong> Inhibit overactive muscles first, then activate inhibited ones.</div></div>
        <div class="sci-item"><div class="sci-dot"></div><div><strong>Glute inhibition:</strong> APT causes reciprocal inhibition of the glutes (Sahrmann 2002). Your glutes produce ~40% of vertical jump force.</div></div>
        <div class="sci-item"><div class="sci-dot"></div><div><strong>Progressive overload:</strong> A 2024 systematic review confirmed chronic strengthening improves posture; stretching alone does not.</div></div>
        <div class="sci-item"><div class="sci-dot"></div><div><strong>Motor learning:</strong> It takes ~3 weeks of consistent practice to begin automating a new movement pattern.</div></div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
defineProps({ profile: Object })

const currentDay = ref(1)
const completedDays = ref([])
const doneExercises = ref({})
const hiddenVideos = ref({})
const repCounters = ref({})
const restTimers = ref({})
const exTimers = ref({})
const setCounters = ref({})

function toggleVideo(name) { hiddenVideos.value[name] = hiddenVideos.value[name] === false ? true : false }
function getEmbedUrl(url) {
  const id = url.split('v=')[1]?.split('&')[0]
  return `https://www.youtube.com/embed/${id}`
}

function exKey(block, name) { return `${currentDay.value}-${block}-${name}` }
function isExDone(block, name) { return !!doneExercises.value[exKey(block, name)] }
function toggleEx(block, name) {
  const k = exKey(block, name)
  const nowDone = !doneExercises.value[k]
  doneExercises.value[k] = nowDone
  if (nowDone) startRest(block, name, 60)
}

function getRepCount(block, name) {
  const k = exKey(block, name) + '-rep'
  if (repCounters.value[k] === undefined) repCounters.value[k] = 0
  return repCounters.value[k]
}
function tapRep(block, name) {
  const k = exKey(block, name) + '-rep'
  repCounters.value[k] = (repCounters.value[k] || 0) + 1
}
function resetReps(block, name) {
  repCounters.value[exKey(block, name) + '-rep'] = 0
}

function getRestTimer(block, name) {
  const k = exKey(block, name) + '-rest'
  if (!restTimers.value[k]) {
    restTimers.value[k] = { remaining: 60, total: 60, running: false, done: false, _iv: null }
  }
  return restTimers.value[k]
}
function startRest(block, name, sec = 60) {
  const t = getRestTimer(block, name)
  if (t.running) return
  if (t.done || t.remaining === 0) { t.remaining = sec; t.total = sec; t.done = false }
  t.running = true
  t._iv = setInterval(() => {
    if (t.remaining <= 1) {
      t.remaining = 0; t.running = false; t.done = true
      clearInterval(t._iv); pingSound()
    } else { t.remaining-- }
  }, 1000)
}
function pauseRest(block, name) {
  const t = getRestTimer(block, name)
  clearInterval(t._iv); t.running = false
}
function resetRest(block, name, sec = 60) {
  const t = getRestTimer(block, name)
  clearInterval(t._iv)
  t.running = false; t.done = false; t.remaining = sec; t.total = sec
}
function setRest(block, name, sec) {
  resetRest(block, name, sec)
  startRest(block, name, sec)
}
function restDisplay(t) {
  const m = Math.floor(t.remaining / 60)
  const s = t.remaining % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}
function restProgress(t) {
  return t.total > 0 ? ((t.total - t.remaining) / t.total) * 100 : 0
}
function pingSound() {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.3, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
    osc.start(); osc.stop(ctx.currentTime + 0.6)
  } catch {}
}
onUnmounted(() => {
  Object.values(restTimers.value).forEach(t => clearInterval(t._iv))
  Object.values(exTimers.value).forEach(t => clearInterval(t._iv))
})

function parseTargetReps(amount) {
  if (isTimeBased(amount)) return null
  const m = amount?.match(/(\d+)/)
  return m ? parseInt(m[1]) : null
}
function parseTargetSecs(amount) {
  if (!isTimeBased(amount)) return null
  const m = amount?.match(/(\d+)/)
  return m ? parseInt(m[1]) : null
}
function isTimeBased(amount) {
  return /sec|min/i.test(amount || '')
}

// Exercise countdown timer
function getExTimer(block, name) {
  const k = exKey(block, name) + '-ex'
  if (!exTimers.value[k]) exTimers.value[k] = { remaining: 0, total: 0, running: false, done: false, _iv: null }
  return exTimers.value[k]
}
function startExTimer(block, name, sec) {
  const t = getExTimer(block, name)
  if (t.running) return
  if (!t.total || t.done || t.remaining === 0) { t.remaining = sec; t.total = sec; t.done = false }
  t.running = true
  t._iv = setInterval(() => {
    if (t.remaining <= 1) {
      t.remaining = 0; t.running = false; t.done = true
      clearInterval(t._iv); pingSound()
    } else { t.remaining-- }
  }, 1000)
}
function pauseExTimer(block, name) {
  const t = getExTimer(block, name)
  clearInterval(t._iv); t.running = false
}
function resetExTimer(block, name, sec) {
  const t = getExTimer(block, name)
  clearInterval(t._iv)
  t.running = false; t.done = false; t.remaining = sec; t.total = sec
}

// Set counter
function getSetState(block, name) {
  const k = exKey(block, name) + '-sets'
  if (!setCounters.value[k]) setCounters.value[k] = { done: 0 }
  return setCounters.value[k]
}
function addSet(block, name) {
  getSetState(block, name).done++
}
function resetSets(block, name) {
  const k = exKey(block, name) + '-sets'
  setCounters.value[k] = { done: 0 }
}
function getAmount(ex) {
  if (currentDay.value >= 22 && ex.powerAmount) return ex.powerAmount
  if (currentDay.value >= 15 && ex.advAmount) return ex.advAmount
  return ex.amount
}

const phases = [
  { days: '1–7', label: 'Phase 1: Awareness', icon: '🧠', color: '#3b82f6', rounds: '2', focus: 'Learn to feel your pelvis. Quality over everything.', roadmapDesc: 'Master the movement patterns. 2 rounds. Never push through pain.' },
  { days: '8–14', label: 'Phase 2: Activation', icon: '⚡', color: '#f97316', rounds: '3', focus: 'Wake up the glutes. Feel them working in every rep.', roadmapDesc: '3 rounds. Add a mini-band on bridges/squats if available.' },
  { days: '15–21', label: 'Phase 3: Strength', icon: '💪', color: '#a855f7', rounds: '3', focus: 'Load the pattern. Backpack or band on all strength moves.', roadmapDesc: '3 rounds. Unilateral focus. Heavier = more glute recruitment.' },
  { days: '22–30', label: 'Phase 4: Power', icon: '🚀', color: '#22c55e', rounds: '3–4', focus: 'Transfer to the court. Reactive, explosive, basketball-specific.', roadmapDesc: '3–4 rounds. Plyometric integration. This is where vert gains show up.' },
]
const currentPhase = computed(() => {
  if (currentDay.value <= 7) return phases[0]
  if (currentDay.value <= 14) return phases[1]
  if (currentDay.value <= 21) return phases[2]
  return phases[3]
})

const schedule = [
  {
    icon: '🔥', focus: 'Glutes',
    cue: 'Squeeze your glutes so hard at the top of every bridge that you feel your pelvis tuck under. That tuck IS the correction.',
    blockD: [
      { name: 'Pec Minor Stretch (doorway)', tutorialUrl: 'https://www.youtube.com/watch?v=M850sCj9LHQ', amount: '45 sec/side', advAmount: '60 sec/side', why: 'Tight pec minor pulls shoulders forward. Releasing it lets your chest open and shoulders sit back naturally.' },
      { name: 'Thoracic Extension over Foam Roll', amount: '30 sec — 3 spine positions', advAmount: '45 sec — 3 positions', why: 'Directly reverses thoracic kyphosis. Mid-back extension = upright posture + more power in your jump arm swing.' },
      { name: 'Wall Angels', tutorialUrl: 'https://www.youtube.com/watch?v=cvx06snMQ3A', amount: '10 reps — slow', advAmount: '12 reps', powerAmount: '12 reps — 2 sec hold at top', why: 'Trains scapular upward rotation + thoracic extension together. The single best drill for standing straight.' },
    ],
    blockA: [
      { name: 'Kneeling Hip Flexor Stretch', tutorialUrl: 'https://www.youtube.com/watch?v=bW7FqSFKqyE', amount: '45 sec/side', why: 'Releases psoas — the #1 APT culprit. Tight psoas = anterior tilt locked in.' },
      { name: 'Quad Foam Roll / Massage', tutorialUrl: 'https://www.youtube.com/watch?v=8rJ-vMZwvv0', amount: '30 sec/side', why: 'Reduces quad dominance that pulls pelvis forward during jumps.' },
    ],
    blockB: [
      { name: 'Supine Pelvic Tilt', tutorialUrl: 'https://www.youtube.com/watch?v=U0dfnyfhpwk', amount: '15 reps — hold 3 sec each', advAmount: '15 reps — hold 5 sec', why: 'Teaches your pelvis neutral. The foundation of everything.' },
      { name: '90/90 Diaphragmatic Breathing', tutorialUrl: 'https://www.youtube.com/watch?v=LADa1fkj7kE', amount: '8 slow breaths', why: "Resets intra-abdominal pressure. Core can't stabilize without proper breathing mechanics." },
      { name: 'Glute Bridge', tutorialUrl: 'https://www.youtube.com/watch?v=Xp33YgPZgns', amount: '15 reps — 2 sec hold at top', advAmount: '20 reps — 3 sec hold', powerAmount: 'Single-leg bridge 12/side — explosive', why: 'Primary glute activator. Squeeze hard at top to posteriorly tilt pelvis.' },
    ],
    blockC: [
      { name: 'Dead Bug', tutorialUrl: 'https://www.youtube.com/watch?v=g_BYB0R-4Ws', amount: '8/side — slow', advAmount: '10/side — add reach', powerAmount: '10/side — contralateral reach + pause', why: 'Trains deep core (TVA) to stabilize spine while limbs move — exactly what jumping requires.' },
      { name: 'Bird Dog', tutorialUrl: 'https://www.youtube.com/watch?v=xEDnlOxeJH4', amount: '8/side — 3 sec hold', advAmount: '10/side — 5 sec hold', powerAmount: '10/side — add ankle weight', why: 'Glute max + contralateral lat. The same diagonal pattern used in your jump arm swing.' },
      { name: 'Side Plank', tutorialUrl: 'https://www.youtube.com/watch?v=N_s9em1xTqU', amount: '25 sec/side', advAmount: '35 sec/side', powerAmount: '35 sec + hip dip 8 reps', why: 'Lateral core stability prevents hip drop on single-leg landing — protects knees.' },
    ],
  },
  {
    icon: '🧘', focus: 'Mobility',
    cue: 'Your pelvis is supposed to MOVE. Today is about control, not rigidity. Move slowly and feel every position.',
    blockD: [
      { name: 'Chin Tucks', tutorialUrl: 'https://www.youtube.com/watch?v=7rnlAVhAK-8', amount: '15 reps — 3 sec hold', advAmount: '15 reps — 5 sec hold', why: 'Activates deep cervical flexors that forward head posture has switched off.' },
      { name: 'Thoracic Rotation (seated)', tutorialUrl: 'https://www.youtube.com/watch?v=pLerj04KsHw', amount: '10/side — slow', advAmount: '12/side', why: 'Restores thoracic rotation lost from kyphosis. Needed for upright posture and shooting mechanics.' },
      { name: 'Horizontal Pull-Apart (no band)', tutorialUrl: 'https://www.youtube.com/watch?v=xDLHjepRLcQ', amount: '15 reps — squeeze shoulder blades', advAmount: '20 reps — 2 sec squeeze', powerAmount: '20 reps — slow + 3 sec hold', why: 'Strengthens mid/lower trap + rear delts — what holds shoulders back.' },
    ],
    blockA: [
      { name: 'Cat-Cow', tutorialUrl: 'https://www.youtube.com/watch?v=LIVJZZyZ2qM', amount: '10 reps — slow', why: 'Finds the full range of pelvic motion. You need to know both ends to find neutral.' },
      { name: '90/90 Hip Switches', tutorialUrl: 'https://www.youtube.com/watch?v=XnN_68tZfqc', amount: '8/side', why: 'Hip internal + external rotation. Stiff hips = compensated jump mechanics.' },
    ],
    blockB: [
      { name: '90/90 Breathing', tutorialUrl: 'https://www.youtube.com/watch?v=LADa1fkj7kE', amount: '8 breaths — ribs down', why: 'Rib flare is the upper-body version of APT. Breathing fixes both.' },
      { name: 'Pelvic Clock', tutorialUrl: 'https://www.youtube.com/watch?v=Ie9MNEKXfTI', amount: '5 circles each direction', advAmount: '8 circles each direction', why: "Teaches full pelvic mobility. You can't control what you can't feel." },
      { name: 'Glute Bridge with Pelvic Tilt', tutorialUrl: 'https://www.youtube.com/watch?v=brgT1Qq4Tk0', amount: '12 reps — tilt then bridge', advAmount: '15 reps', powerAmount: 'Single-leg 10/side', why: 'Combines the two key corrections into one movement.' },
    ],
    blockC: [
      { name: 'Deep Squat Hold', tutorialUrl: 'https://www.youtube.com/watch?v=HfHZbi1hlbE', amount: '30 sec — chest up', advAmount: '45 sec', powerAmount: '45 sec + thoracic rotation 5/side', why: 'Ankle + hip mobility needed for a deep, powerful jump dip.' },
      { name: 'Couch Stretch', tutorialUrl: 'https://www.youtube.com/watch?v=tCmiffEXK3s', amount: '60 sec/side', why: 'Deepest hip flexor + rectus femoris stretch. Non-negotiable for APT correction.' },
      { name: 'Pigeon Stretch', tutorialUrl: 'https://www.youtube.com/watch?v=h_hV-8suiiA', amount: '60 sec/side', why: 'Piriformis + glute med release. Tight glute med = hip hike on landing = ankle/knee injury risk.' },
    ],
  },
  {
    icon: '💪', focus: 'Strength',
    cue: "Push the floor away — don't pull yourself up. Every squat and lunge should feel like you're driving the ground down.",
    blockD: [
      { name: 'Wall Angels', tutorialUrl: 'https://www.youtube.com/watch?v=cvx06snMQ3A', amount: '10 reps', advAmount: '12 reps', powerAmount: '12 reps — 2 sec hold', why: 'Reinforces scapular control under fatigue — when posture breaks down most.' },
      { name: 'Prone Y-T-W', tutorialUrl: 'https://www.youtube.com/watch?v=QdGTI4Lshg4', amount: '8 reps each shape', advAmount: '10 reps each', why: 'Lower trap + mid trap + rear delt. These three muscles are what keep your shoulders back and chest up.' },
      { name: 'Chin Tucks', tutorialUrl: 'https://www.youtube.com/watch?v=7rnlAVhAK-8', amount: '12 reps — 3 sec hold', advAmount: '15 reps — 5 sec hold', why: 'Deep neck flexor endurance. Weak deep neck flexors = head drifts forward within minutes of standing.' },
    ],
    blockA: [
      { name: 'Kneeling Hip Flexor Stretch', tutorialUrl: 'https://www.youtube.com/watch?v=bW7FqSFKqyE', amount: '45 sec/side', why: 'Pre-stretch before loading. Cold hip flexors under load = injury.' },
      { name: 'Thoracic Extension over Foam Roll', tutorialUrl: 'https://www.youtube.com/watch?v=4Iwfcujrb44', amount: '30 sec — 3 positions', why: 'Upper back extension counteracts the forward lean APT causes during squats.' },
    ],
    blockB: [
      { name: 'Glute Bridge', tutorialUrl: 'https://www.youtube.com/watch?v=Xp33YgPZgns', amount: '15 reps — 2 sec hold', advAmount: '20 reps — backpack on hips', powerAmount: 'Single-leg bridge 12/side — backpack', why: 'Glute activation primer before loading squats/lunges.' },
      { name: 'Clamshell', tutorialUrl: 'https://www.youtube.com/watch?v=KibnWq-HwBM', amount: '15/side — slow, 2 sec hold', advAmount: '15/side — 3 sec hold', powerAmount: '15/side — 3 sec hold + pulse 5 reps', why: 'Glute medius activation. Prevents knee cave on landing — a major vert killer.' },
    ],
    blockC: [
      { name: 'Reverse Lunge', tutorialUrl: 'https://www.youtube.com/watch?v=xrPteyQLGAo', amount: '10/leg', advAmount: '10/leg — backpack', powerAmount: '8/leg — explosive step back', why: 'Posterior chain dominant lunge. Keeps shin vertical = more glute, less quad.' },
      { name: 'Romanian Deadlift (single-leg)', tutorialUrl: 'https://www.youtube.com/watch?v=gPnUTh0k0kc', amount: '8/leg — bodyweight', advAmount: '10/leg — backpack', powerAmount: '10/leg — slow eccentric 3 sec', why: 'Hamstring + glute loading in hip hinge. Hamstrings decelerate your landing — critical for vert safety.' },
      { name: 'Bodyweight Squat', tutorialUrl: 'https://www.youtube.com/watch?v=0EpP3pYUYTk', amount: '15 reps — 3 sec down', advAmount: 'Backpack squat 12 reps', powerAmount: 'Jump squat 8 reps — land soft', why: 'Full posterior chain integration. The jump squat in Phase 4 directly trains your takeoff pattern.' },
    ],
  },
  {
    icon: '🧘', focus: 'Recovery', isRest: false,
    cue: "This is not a day off — it's a day to reinforce the patterns at low intensity. Move well, not hard.",
    blockD: [
      { name: 'Pec Minor Stretch', tutorialUrl: 'https://www.youtube.com/watch?v=M850sCj9LHQ', amount: '60 sec/side', why: 'Longer hold on recovery day = more lasting tissue change in the chest.' },
      { name: 'Chin Tucks', tutorialUrl: 'https://www.youtube.com/watch?v=7rnlAVhAK-8', amount: '10 reps — slow', why: 'Low-load reinforcement of the deep neck flexor pattern.' },
      { name: 'Thoracic Extension over Foam Roll', tutorialUrl: 'https://www.youtube.com/watch?v=4Iwfcujrb44', amount: '60 sec — move slowly', why: 'Recovery-pace thoracic work. Gravity does the work — just breathe and let the spine extend.' },
    ],
    blockA: [
      { name: 'Cat-Cow', tutorialUrl: 'https://www.youtube.com/watch?v=LIVJZZyZ2qM', amount: '10 reps', why: 'Spine mobility maintenance.' },
      { name: "Child's Pose", tutorialUrl: 'https://www.youtube.com/watch?v=iMwDAesHEqw', amount: '60 sec', why: 'Decompresses lumbar spine — often compressed by APT.' },
    ],
    blockB: [
      { name: '90/90 Breathing', tutorialUrl: 'https://www.youtube.com/watch?v=LADa1fkj7kE', amount: '10 breaths', why: 'Nervous system reset. Parasympathetic activation speeds recovery.' },
      { name: 'Supine Pelvic Tilt', tutorialUrl: 'https://www.youtube.com/watch?v=U0dfnyfhpwk', amount: '10 reps — hold 5 sec', why: 'Reinforce the motor pattern at low load.' },
      { name: 'Glute Bridge', tutorialUrl: 'https://www.youtube.com/watch?v=Xp33YgPZgns', amount: '12 reps — slow', why: 'Keep glutes firing without fatiguing them.' },
    ],
    blockC: [
      { name: "World's Greatest Stretch", tutorialUrl: 'https://www.youtube.com/watch?v=OvObOV0WrKw', amount: '5/side — slow', why: 'Full-body mobility in one movement. Hip flexor + thoracic + hamstring.' },
      { name: 'Pigeon Stretch', tutorialUrl: 'https://www.youtube.com/watch?v=h_hV-8suiiA', amount: '90 sec/side', why: 'Longer hold on recovery day = deeper tissue change.' },
      { name: 'Couch Stretch', tutorialUrl: 'https://www.youtube.com/watch?v=tCmiffEXK3s', amount: '90 sec/side', why: 'Longer hold = more lasting hip flexor length.' },
    ],
  },
  {
    icon: '🔥', focus: 'Core',
    cue: "Your core's job is NOT to crunch. It's to resist movement while your legs produce force. Train it that way.",
    blockD: [
      { name: 'Horizontal Pull-Apart (no band)', tutorialUrl: 'https://www.youtube.com/watch?v=xDLHjepRLcQ', amount: '15 reps — squeeze shoulder blades', advAmount: '20 reps — 2 sec squeeze', powerAmount: '20 reps — slow + 3 sec hold', why: 'Scapular retractors under fatigue. Posture breaks down when tired — train it tired.' },
      { name: 'Prone Y-T-W', tutorialUrl: 'https://www.youtube.com/watch?v=QdGTI4Lshg4', amount: '8 reps each', advAmount: '10 reps each', why: 'Full lower/mid trap + rear delt sequence. 3 minutes here = shoulders back all day.' },
      { name: 'Wall Stand', tutorialUrl: 'https://www.youtube.com/watch?v=eD70Re3F3oI', amount: '60 sec — head, shoulders, hips, heels on wall', advAmount: '90 sec', powerAmount: '90 sec — step away and hold the position', why: 'Proprioceptive reset. Teaches your nervous system what truly upright feels like.' },
    ],
    blockA: [
      { name: 'Kneeling Hip Flexor Stretch', tutorialUrl: 'https://www.youtube.com/watch?v=bW7FqSFKqyE', amount: '45 sec/side', why: 'Hip flexors tighten overnight and after sitting. Always release first.' },
      { name: '90/90 Breathing', tutorialUrl: 'https://www.youtube.com/watch?v=LADa1fkj7kE', amount: '8 breaths', why: "Core can't work properly without diaphragm coordination." },
    ],
    blockB: [
      { name: 'Pelvic Tilt', tutorialUrl: 'https://www.youtube.com/watch?v=u0AJnVg0tcc', amount: '15 reps — hold 3 sec', advAmount: '15 reps — hold 5 sec', why: 'Activate TVA before loading the core.' },
      { name: 'Glute Bridge', tutorialUrl: 'https://www.youtube.com/watch?v=Xp33YgPZgns', amount: '15 reps', advAmount: '20 reps — backpack', powerAmount: 'Single-leg 12/side', why: 'Posterior pelvic tilt under load = APT correction under load.' },
    ],
    blockC: [
      { name: 'Dead Bug', tutorialUrl: 'https://www.youtube.com/watch?v=g_BYB0R-4Ws', amount: '10/side', advAmount: '10/side — longer lever', powerAmount: '10/side — add resistance band', why: 'Anti-extension core. Prevents lumbar hyperextension during jump arm swing.' },
      { name: 'Plank', tutorialUrl: 'https://www.youtube.com/watch?v=pvIjsG5Svck', amount: '30 sec — ribs down', advAmount: '45 sec', powerAmount: '45 sec — add shoulder tap 10/side', why: 'Anti-extension endurance. A weak plank = energy leak at takeoff.' },
      { name: 'Side Plank', tutorialUrl: 'https://www.youtube.com/watch?v=N_s9em1xTqU', amount: '30 sec/side', advAmount: '40 sec/side', powerAmount: '40 sec + 8 hip dips/side', why: 'Anti-lateral flexion. Keeps your trunk stiff during single-leg push-off.' },
      { name: 'Pallof Press (band or hands)', tutorialUrl: 'https://www.youtube.com/watch?v=JdGdeJnfai8', amount: '10/side — 2 sec hold', advAmount: '12/side', powerAmount: '12/side — add rotation', why: 'Anti-rotation core. The rotational forces in a jump are massive — train to resist them.' },
    ],
  },
  {
    icon: '🏀', focus: 'Athletic',
    cue: 'Every drill today — think HIPS BACK, CHEST UP, GLUTES LOADED, HEAD TALL. That is your new jump position.',
    blockD: [
      { name: 'Wall Angels', tutorialUrl: 'https://www.youtube.com/watch?v=cvx06snMQ3A', amount: '10 reps', advAmount: '12 reps', powerAmount: '12 reps — 2 sec hold', why: 'Pre-game posture reset. Do this before every basketball session.' },
      { name: 'Chin Tucks', tutorialUrl: 'https://www.youtube.com/watch?v=7rnlAVhAK-8', amount: '12 reps', advAmount: '15 reps', why: 'Head position check before athletic movement. Forward head = 10–12 lbs of extra neck load.' },
      { name: 'Horizontal Pull-Apart (no band)', tutorialUrl: 'https://www.youtube.com/watch?v=xDLHjepRLcQ', amount: '15 reps — squeeze shoulder blades', advAmount: '20 reps', powerAmount: '20 reps — explosive squeeze', why: 'Shoulder blade control during overhead arm swing in jumps.' },
    ],
    blockA: [
      { name: 'Kneeling Hip Flexor Stretch', tutorialUrl: 'https://www.youtube.com/watch?v=bW7FqSFKqyE', amount: '30 sec/side', why: 'Quick release before athletic movement.' },
      { name: 'Glute Bridge', tutorialUrl: 'https://www.youtube.com/watch?v=Xp33YgPZgns', amount: '15 reps — fast squeeze', why: 'Prime the glutes before explosive work.' },
    ],
    blockB: [
      { name: 'Single-Leg Glute Bridge', tutorialUrl: 'https://www.youtube.com/watch?v=sVfp4LN9niA', amount: '10/side', advAmount: '12/side', powerAmount: '12/side — add 1 sec pause', why: 'Single-leg glute strength = single-leg push-off power.' },
      { name: 'Clamshell', tutorialUrl: 'https://www.youtube.com/watch?v=KibnWq-HwBM', amount: '12/side — 2 sec hold', advAmount: '15/side — 3 sec hold', powerAmount: '15/side — 3 sec hold + pulse 5 reps', why: 'Glute med for lateral stability in defensive slides.' },
    ],
    blockC: [
      { name: 'Reverse Lunge', tutorialUrl: 'https://www.youtube.com/watch?v=xrPteyQLGAo', amount: '8/side', advAmount: '10/side — backpack', powerAmount: '8/side — explosive drive up', why: 'Posterior chain loading in a basketball-specific stance.' },
      { name: 'Single-Leg Balance', tutorialUrl: 'https://www.youtube.com/watch?v=Dtgh2_LFkBQ', amount: '30 sec/side', advAmount: '30 sec — eyes closed', powerAmount: '30 sec — eyes closed + arm reach', why: 'Proprioception for landing mechanics. Bad landing = wasted jump.' },
      { name: 'Broad Jump', tutorialUrl: 'https://www.youtube.com/watch?v=uhz-ia-2UcM', amount: '5 reps — land and hold 2 sec', advAmount: '6 reps', powerAmount: '6 reps — stick landing 3 sec', why: 'Horizontal power + landing control. Teaches your body to absorb force with glutes, not knees.' },
      { name: 'Defensive Stance Slides', tutorialUrl: 'https://www.youtube.com/watch?v=aqkELAKmVX8', amount: '30 sec — low and wide', advAmount: '45 sec', powerAmount: '45 sec — explosive change of direction', why: 'Glute med endurance in basketball position. Tired glutes = APT returns on court.' },
    ],
  },
  { isRest: true, icon: '💤', focus: 'Rest' },
]

const todayDOW = computed(() => (currentDay.value - 1) % 7)
const todayWorkout = computed(() => schedule[todayDOW.value])
const currentWeek = computed(() => Math.ceil(currentDay.value / 7))
const weekDays = computed(() => {
  const start = (currentWeek.value - 1) * 7 + 1
  return Array.from({ length: 7 }, (_, i) => {
    const abs = start + i
    const w = schedule[i]
    return { abs, label: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'][i], icon: w.icon || '💤', focus: w.focus || 'Rest', isRest: !!w.isRest }
  })
})
const isDayComplete = computed(() => completedDays.value.includes(currentDay.value))
function markDayComplete() {
  if (!completedDays.value.includes(currentDay.value)) completedDays.value.push(currentDay.value)
}
</script>

<style scoped>
.pcp-wrap { display: flex; flex-direction: column; gap: 14px; }
.pcp-header { display: flex; flex-direction: column; gap: 10px; }
.header-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.header-title { font-size: 20px; font-weight: 800; color: var(--text-h); }
.header-sub { font-size: 12px; color: var(--text); margin-top: 3px; line-height: 1.4; }
.day-badge { display: flex; flex-direction: column; align-items: center; background: var(--surface2); padding: 10px 14px; border-radius: 10px; flex-shrink: 0; }
.badge-val { font-size: 20px; font-weight: 800; color: var(--accent); }
.badge-lbl { font-size: 10px; color: var(--text); font-weight: 600; text-transform: uppercase; }
.progress-bar { width: 100%; height: 6px; background: var(--surface2); border-radius: 99px; overflow: hidden; }
.progress-fill { height: 100%; background: var(--accent); transition: width 0.4s; }
.day-nav { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
.day-btn { padding: 7px 16px; border-radius: 8px; border: 1px solid var(--border); background: var(--surface2); color: var(--text); font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
.day-btn:hover { border-color: var(--accent); color: var(--accent); }
.phase-pill { font-size: 12px; font-weight: 700; padding: 5px 12px; border-radius: 20px; }
.rest-card { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 32px 18px; text-align: center; }
.rest-icon { font-size: 44px; }
.rest-title { font-size: 18px; font-weight: 800; color: var(--text-h); }
.rest-desc { font-size: 13px; color: var(--text); line-height: 1.5; max-width: 280px; }
.phase-focus { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.pf-left { display: flex; align-items: center; gap: 12px; }
.pf-icon { font-size: 28px; }
.pf-name { font-size: 14px; font-weight: 800; color: var(--text-h); }
.pf-desc { font-size: 12px; color: var(--text); margin-top: 2px; }
.pf-rounds { font-size: 28px; font-weight: 900; color: var(--accent); line-height: 1; text-align: center; }
.pf-rounds span { display: block; font-size: 10px; font-weight: 600; color: var(--text); text-transform: uppercase; }
.block-card { display: flex; flex-direction: column; gap: 12px; }
.block-header { display: flex; align-items: flex-start; gap: 12px; padding-bottom: 10px; border-bottom: 1px solid var(--border); }
.block-letter { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 900; color: #fff; flex-shrink: 0; }
.block-header.inhibit .block-letter { background: #3b82f6; }
.block-header.activate .block-letter { background: #f97316; }
.block-header.integrate .block-letter { background: #a855f7; }
.block-header.upper .block-letter { background: #06b6d4; }
.block-title { font-size: 13px; font-weight: 800; color: var(--text-h); }
.block-sub { font-size: 11px; color: var(--text); margin-top: 2px; line-height: 1.4; }
.ex-list { display: flex; flex-direction: column; gap: 8px; }
.ex-card { padding: 10px 12px; border-radius: 10px; background: var(--surface2); transition: all 0.2s; border: 1px solid transparent; }
.ex-card:hover { border-color: var(--border2); }
.ex-card.done { opacity: 0.75; background: #22c55e0d; border-color: #22c55e30; }
.ex-top { display: flex; align-items: flex-start; gap: 10px; }
.ex-check { font-size: 17px; font-weight: 700; color: var(--text); min-width: 18px; margin-top: 1px; cursor: pointer; user-select: none; }
.ex-check.done { color: #22c55e; }
.ex-body { flex: 1; }
.ex-name { font-size: 13px; font-weight: 700; color: var(--text-h); }
.ex-dose { font-size: 12px; color: var(--accent); font-weight: 600; margin-top: 2px; }
.ex-why { font-size: 11px; color: var(--text); margin-top: 6px; padding-left: 28px; line-height: 1.4; }
.ex-vid-toggle { font-size: 11px; font-weight: 700; padding: 4px 9px; border-radius: 6px; border: 1px solid var(--border); background: var(--surface); color: var(--text); cursor: pointer; white-space: nowrap; flex-shrink: 0; transition: all 0.2s; }
.ex-vid-toggle.active { border-color: var(--accent); color: var(--accent); }
.rep-counter { display: flex; align-items: center; gap: 8px; margin: 8px 0 2px 28px; flex-wrap: wrap; }
.rep-tap { display: flex; align-items: baseline; gap: 2px; background: var(--surface); border: 2px solid var(--border); border-radius: 10px; padding: 5px 14px; cursor: pointer; transition: all 0.15s; font-weight: 800; }
.rep-tap:hover { border-color: var(--accent); }
.rep-num { font-size: 20px; color: var(--text-h); transition: color 0.2s; }
.rep-num.reached { color: #22c55e; }
.rep-target { font-size: 12px; color: var(--text); }
.rep-reset { background: none; border: 1px solid var(--border); border-radius: 6px; padding: 4px 8px; font-size: 13px; cursor: pointer; color: var(--text); transition: all 0.15s; }
.rep-reset:hover { border-color: var(--accent); color: var(--accent); }
.rep-label { font-size: 10px; color: var(--text); font-weight: 600; }
.ex-timer { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
.ex-timer button { padding: 4px 9px; border-radius: 7px; border: 1px solid var(--border); background: var(--surface2); color: var(--text); font-size: 13px; cursor: pointer; transition: all 0.15s; }
.ex-timer button:hover { border-color: var(--accent); color: var(--accent); }
.ex-timer.running button { border-color: #f9731655; }
.ex-timer.done button { border-color: #22c55e55; }
.et-time { font-size: 22px; font-weight: 800; color: var(--text-h); font-variant-numeric: tabular-nums; min-width: 52px; }
.ex-timer.running .et-time { color: #f97316; }
.ex-timer.done .et-time { color: #22c55e; }
.et-label { font-size: 10px; color: var(--text); font-weight: 600; }
.set-counter { display: flex; align-items: center; gap: 5px; margin-left: auto; }
.set-btn { padding: 4px 10px; border-radius: 7px; border: 1px solid var(--accent); background: var(--accent-dim, #6366f122); color: var(--accent); font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
.set-btn:hover { background: var(--accent); color: #fff; }
.set-done { font-size: 16px; font-weight: 800; color: var(--text-h); min-width: 18px; text-align: center; }
.ex-video-panel { margin-top: 10px; border-radius: 10px; overflow: hidden; border: 1px solid var(--border); }
.evp-bar { display: flex; justify-content: space-between; align-items: center; padding: 7px 10px; background: var(--surface); }
.evp-label { font-size: 11px; font-weight: 700; color: var(--text-h); }
.evp-yt { font-size: 11px; color: var(--accent); text-decoration: none; font-weight: 700; }
.evp-frame { position: relative; width: 100%; padding-bottom: 56.25%; background: #000; }
.evp-frame iframe { position: absolute; inset: 0; width: 100%; height: 100%; }
.inline-rest { margin-top: 10px; padding: 10px 12px; border-radius: 10px; background: var(--surface); border: 1px solid var(--border); transition: border-color 0.3s; }
.inline-rest.running { border-color: #f9731655; }
.inline-rest.finished { border-color: #22c55e88; }
.irt-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
.irt-label { font-size: 11px; font-weight: 700; color: var(--text-h); }
.irt-time { font-size: 18px; font-weight: 800; color: var(--text-h); font-variant-numeric: tabular-nums; }
.irt-bar { width: 100%; height: 5px; background: var(--surface2); border-radius: 99px; overflow: hidden; margin-bottom: 8px; }
.irt-fill { height: 100%; border-radius: 99px; transition: width 0.9s linear, background 0.3s; }
.irt-btns { display: flex; gap: 6px; flex-wrap: wrap; }
.irt-btns button { padding: 5px 10px; border-radius: 7px; border: 1px solid var(--border); background: var(--surface2); color: var(--text); font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
.irt-btns button:hover { border-color: var(--accent); color: var(--accent); }
.cue-card { background: #7c3aed18; border-color: #7c3aed44; }
.cue-label { font-size: 11px; font-weight: 800; color: #a855f7; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
.cue-text { font-size: 14px; color: var(--text-h); font-style: italic; line-height: 1.5; }
.complete-day-btn { width: 100%; padding: 15px; border-radius: 12px; border: none; background: var(--accent); color: #fff; font-size: 15px; font-weight: 800; cursor: pointer; transition: all 0.2s; }
.complete-day-btn:hover { opacity: 0.9; transform: translateY(-1px); }
.complete-day-btn.done { background: #22c55e; }
.section-card { display: flex; flex-direction: column; gap: 12px; }
.section-title { font-size: 15px; font-weight: 800; color: var(--text-h); }
.week-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; }
.wd { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 8px 3px; border-radius: 10px; background: var(--surface2); border: 1px solid transparent; cursor: pointer; transition: all 0.2s; }
.wd.active { border-color: var(--accent); background: var(--accent-dim); }
.wd.done { background: #22c55e0d; border-color: #22c55e30; }
.wd-day { font-size: 9px; font-weight: 700; color: var(--text); text-transform: uppercase; }
.wd-icon { font-size: 15px; }
.wd-focus { font-size: 8px; color: var(--text); text-align: center; font-weight: 600; }
.roadmap { display: flex; flex-direction: column; gap: 14px; }
.roadmap-row { display: flex; gap: 12px; align-items: flex-start; }
.rm-dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 5px; flex-shrink: 0; transition: background 0.3s; }
.rm-body { flex: 1; }
.rm-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; }
.rm-label { font-size: 13px; font-weight: 700; color: var(--text-h); }
.rm-days { font-size: 11px; color: var(--text); background: var(--surface2); padding: 2px 8px; border-radius: 20px; }
.rm-desc { font-size: 12px; color: var(--text); margin-top: 3px; line-height: 1.4; }
.science-card { display: flex; flex-direction: column; gap: 12px; }
.sci-title { font-size: 14px; font-weight: 800; color: var(--text-h); }
.sci-list { display: flex; flex-direction: column; gap: 10px; }
.sci-item { display: flex; gap: 10px; align-items: flex-start; font-size: 12px; color: var(--text); line-height: 1.5; }
.sci-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); margin-top: 5px; flex-shrink: 0; }
.sci-item strong { color: var(--text-h); }
.chain-banner { display: flex; flex-direction: column; gap: 10px; background: #06b6d410; border-color: #06b6d440; }
.chain-title { font-size: 13px; font-weight: 800; color: #06b6d4; }
.chain-steps { display: flex; flex-direction: column; gap: 2px; }
.chain-step { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; color: var(--text); line-height: 1.4; }
.chain-step strong { color: var(--text-h); }
.cs-num { width: 18px; height: 18px; border-radius: 50%; background: #06b6d4; color: #fff; font-size: 10px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
.chain-arrow { font-size: 12px; color: var(--text); padding-left: 9px; line-height: 1; }
.chain-fix { font-size: 12px; color: var(--accent); font-weight: 700; padding-top: 4px; border-top: 1px solid var(--border); }
@media (max-width: 400px) { .wd-focus { display: none; } }
</style>
