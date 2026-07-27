<template>
  <div class="page">

    <!-- Header -->
    <div class="iq-header">
      <div>
        <h1>🧠 Basketball IQ</h1>
        <p class="iq-sub">Study the game. Grow your mind.</p>
      </div>
      <div class="iq-header-stats">
        <span class="iq-total-badge">{{ allEntries.length }} notes</span>
      </div>
    </div>

    <!-- Category Tabs -->
    <div class="scroll-row tab-row">
      <button
        v-for="cat in categories"
        :key="cat.id"
        class="cat-tab"
        :class="{ active: activeTab === cat.id }"
        @click="activeTab = cat.id"
      >
        {{ cat.icon }} {{ cat.label }}
        <span v-if="countFor(cat.id)" class="tab-count">{{ countFor(cat.id) }}</span>
      </button>
    </div>

    <!-- Composer -->
    <div class="composer card">
      <div class="composer-top">
        <span class="composer-cat-icon">{{ activeCat.icon }}</span>
        <textarea
          v-model="draft"
          class="composer-input"
          :placeholder="activeCat.placeholder"
          rows="3"
        ></textarea>
      </div>

      <!-- Film link (only for film tab) -->
      <div v-if="activeTab === 'film'" class="film-link-row">
        <input v-model="filmUrl" placeholder="Paste YouTube / video link (optional)" class="film-input" />
      </div>

      <!-- Tags -->
      <div class="tag-row">
        <button
          v-for="tag in activeCat.tags"
          :key="tag"
          class="chip"
          :class="{ active: selectedTag === tag }"
          @click="selectedTag = selectedTag === tag ? '' : tag"
        >{{ tag }}</button>
        <button
          class="submit-btn btn-primary"
          :disabled="!draft.trim()"
          @click="addEntry"
        >Add</button>
      </div>
    </div>

    <!-- Entries List -->
    <div v-if="filteredEntries.length" class="entries-list">
      <div
        v-for="entry in filteredEntries"
        :key="entry.id"
        class="entry-card card"
        :class="'entry-' + entry.cat"
      >
        <div class="entry-top">
          <div class="entry-meta">
            <span class="entry-cat-icon">{{ catById(entry.cat).icon }}</span>
            <span class="entry-tag chip" v-if="entry.tag">{{ entry.tag }}</span>
            <span class="entry-time">{{ entry.time }}</span>
          </div>
          <button class="entry-delete" @click="deleteEntry(entry.id)" title="Delete">✕</button>
        </div>

        <p class="entry-body">{{ entry.body }}</p>

        <!-- Film embed -->
        <a
          v-if="entry.filmUrl"
          :href="entry.filmUrl"
          target="_blank"
          class="film-link-card"
        >
          🎬 Watch Film →
        </a>

        <!-- Importance toggle -->
        <div class="entry-footer">
          <button
            class="star-btn"
            :class="{ starred: entry.starred }"
            @click="entry.starred = !entry.starred"
          >{{ entry.starred ? '⭐' : '☆' }} {{ entry.starred ? 'Key insight' : 'Mark important' }}</button>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-else class="empty-state">
      <div class="empty-icon">{{ activeCat.icon }}</div>
      <div class="empty-title">No {{ activeCat.label }} yet</div>
      <div class="empty-desc">{{ activeCat.placeholder }}</div>
    </div>

    <!-- Starred / Key Insights section -->
    <div v-if="starredEntries.length" class="starred-section">
      <div class="section-header">
        <span class="section-title">⭐ Key Insights</span>
        <span class="section-sub">{{ starredEntries.length }} saved</span>
      </div>
      <div
        v-for="entry in starredEntries"
        :key="'s' + entry.id"
        class="starred-card card"
      >
        <div class="starred-top">
          <span class="entry-cat-icon">{{ catById(entry.cat).icon }}</span>
          <span class="entry-tag chip" v-if="entry.tag">{{ entry.tag }}</span>
          <span class="entry-time">{{ entry.time }}</span>
        </div>
        <p class="entry-body">{{ entry.body }}</p>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

defineProps({ profile: Object })

const categories = [
  {
    id: 'notes',
    icon: '📝',
    label: 'Game Notes',
    placeholder: 'What happened in the game? Key moments, patterns you noticed…',
    tags: ['Offense', 'Defense', 'Transition', 'Clutch', 'Team'],
  },
  {
    id: 'film',
    icon: '🎬',
    label: 'Film Review',
    placeholder: 'What did you learn from watching film? Tendencies, plays, reads…',
    tags: ['Opponent', 'Self', 'Pro Film', 'Play Design', 'Spacing'],
  },
  {
    id: 'defense',
    icon: '🛡️',
    label: 'Defensive Mistakes',
    placeholder: 'What defensive error did you make? How will you fix it?',
    tags: ['Help D', 'On-Ball', 'Closeout', 'Rotation', 'Communication'],
  },
  {
    id: 'offense',
    icon: '⚡',
    label: 'Offensive Decisions',
    placeholder: 'What offensive decision worked or failed? What would you do differently?',
    tags: ['Shot Selection', 'Passing', 'Dribble', 'Spacing', 'Pick & Roll'],
  },
  {
    id: 'personal',
    icon: '💭',
    label: 'Observations',
    placeholder: 'Personal insight, mindset note, or anything you want to remember…',
    tags: ['Mindset', 'Habit', 'Goal', 'Lesson', 'Motivation'],
  },
]

const activeTab   = ref('notes')
const draft       = ref('')
const filmUrl     = ref('')
const selectedTag = ref('')

const entries = ref([])

const activeCat      = computed(() => categories.find(c => c.id === activeTab.value))
const filteredEntries = computed(() => entries.value.filter(e => e.cat === activeTab.value).slice().reverse())
const allEntries      = computed(() => entries.value)
const starredEntries  = computed(() => entries.value.filter(e => e.starred))

function countFor(catId) {
  return entries.value.filter(e => e.cat === catId).length
}

function catById(id) {
  return categories.find(c => c.id === id) || categories[0]
}

function addEntry() {
  if (!draft.value.trim()) return
  entries.value.push({
    id: Date.now(),
    cat: activeTab.value,
    body: draft.value.trim(),
    tag: selectedTag.value,
    filmUrl: activeTab.value === 'film' ? filmUrl.value.trim() : '',
    time: new Date().toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
    starred: false,
  })
  draft.value = ''
  filmUrl.value = ''
  selectedTag.value = ''
}

function deleteEntry(id) {
  entries.value = entries.value.filter(e => e.id !== id)
}
</script>

<style scoped>
.iq-header {
  display: flex; align-items: flex-start;
  justify-content: space-between; margin-bottom: 14px;
}
.iq-header h1 { font-size: 26px; font-weight: 800; color: var(--text-h); margin: 0 0 2px; }
.iq-sub { font-size: 13px; color: var(--text); margin: 0; }
.iq-total-badge {
  font-size: 12px; font-weight: 700;
  background: var(--accent-dim); color: var(--accent);
  border: 1px solid var(--accent); border-radius: 99px;
  padding: 4px 12px;
}

/* Tabs */
.tab-row { margin-bottom: 14px; gap: 6px; }
.cat-tab {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 8px 14px; border-radius: 99px;
  font-size: 13px; font-weight: 600;
  background: var(--surface2); border: 1.5px solid var(--border);
  color: var(--text2); white-space: nowrap; transition: all 0.2s;
  flex-shrink: 0;
}
.cat-tab:hover { border-color: var(--border2); color: var(--text-h); }
.cat-tab.active { background: var(--accent-dim); border-color: var(--accent); color: var(--accent); }
.tab-count {
  background: var(--accent); color: #fff;
  font-size: 10px; font-weight: 800;
  border-radius: 99px; padding: 1px 6px; min-width: 18px; text-align: center;
}

/* Composer */
.composer { display: flex; flex-direction: column; gap: 10px; margin-bottom: 16px; }
.composer-top { display: flex; gap: 10px; align-items: flex-start; }
.composer-cat-icon { font-size: 24px; flex-shrink: 0; padding-top: 4px; }
.composer-input {
  flex: 1; resize: none; min-height: 72px;
  background: var(--surface2); border: 1.5px solid var(--border);
  border-radius: var(--radius-sm); padding: 10px 12px;
  font-size: 14px; color: var(--text-h); line-height: 1.5;
  transition: border-color 0.2s;
}
.composer-input:focus { border-color: var(--accent); outline: none; }

.film-link-row { padding-left: 34px; }
.film-input {
  background: var(--surface2); border: 1.5px solid var(--border);
  border-radius: var(--radius-sm); padding: 8px 12px;
  font-size: 13px; color: var(--text-h);
}
.film-input:focus { border-color: var(--accent); outline: none; }

.tag-row { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; padding-left: 34px; }
.submit-btn { margin-left: auto; width: auto; padding: 8px 20px; font-size: 13px; }

/* Entries */
.entries-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }

.entry-card { display: flex; flex-direction: column; gap: 8px; transition: border-color 0.2s; }
.entry-notes   { border-left: 3px solid var(--blue); }
.entry-film    { border-left: 3px solid var(--purple2); }
.entry-defense { border-left: 3px solid var(--red); }
.entry-offense { border-left: 3px solid var(--accent); }
.entry-personal{ border-left: 3px solid var(--green); }

.entry-top { display: flex; align-items: center; gap: 8px; }
.entry-meta { display: flex; align-items: center; gap: 6px; flex: 1; flex-wrap: wrap; }
.entry-cat-icon { font-size: 16px; }
.entry-time { font-size: 11px; color: var(--text); margin-left: auto; white-space: nowrap; }
.entry-tag { padding: 2px 8px; font-size: 11px; }

.entry-delete {
  background: transparent; border: none;
  color: var(--text); font-size: 13px;
  padding: 4px 6px; border-radius: var(--radius-sm);
  transition: all 0.2s; flex-shrink: 0;
}
.entry-delete:hover { color: var(--red); background: #ef444418; }

.entry-body { font-size: 14px; color: var(--text2); line-height: 1.6; margin: 0; }

.film-link-card {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13px; font-weight: 600; color: var(--purple2);
  background: #7c3aed18; border: 1px solid #7c3aed44;
  border-radius: var(--radius-sm); padding: 6px 12px;
  text-decoration: none; transition: all 0.2s;
}
.film-link-card:hover { background: #7c3aed28; }

.entry-footer { display: flex; align-items: center; }
.star-btn {
  background: transparent; border: none;
  font-size: 12px; font-weight: 600; color: var(--text);
  padding: 4px 0; transition: color 0.2s;
}
.star-btn:hover { color: var(--yellow); }
.star-btn.starred { color: var(--yellow); }

/* Empty state */
.empty-state {
  text-align: center; padding: 40px 24px;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
}
.empty-icon { font-size: 44px; }
.empty-title { font-size: 17px; font-weight: 700; color: var(--text-h); }
.empty-desc { font-size: 13px; color: var(--text); line-height: 1.6; max-width: 260px; }

/* Starred section */
.starred-section { margin-top: 8px; display: flex; flex-direction: column; gap: 10px; }
.starred-card { display: flex; flex-direction: column; gap: 8px; border-left: 3px solid var(--yellow); }
.starred-top { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
</style>
