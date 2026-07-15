<template>
  <div class="page">
    <!-- Post composer -->
    <div class="composer card">
      <div class="composer-top">
        <div class="composer-avatar">{{ userInitial }}</div>
        <input v-model="newPost" class="composer-input" placeholder="Share your progress, ask a question…" />
      </div>
      <div class="composer-actions">
        <button class="chip" @click="postType = 'progress'" :class="{ active: postType === 'progress' }">📈 Progress</button>
        <button class="chip" @click="postType = 'question'" :class="{ active: postType === 'question' }">❓ Question</button>
        <button class="chip" @click="postType = 'motivation'" :class="{ active: postType === 'motivation' }">🔥 Motivation</button>
        <button class="btn-primary" style="padding:8px 16px;font-size:13px;width:auto;margin-left:auto" @click="submitPost" :disabled="!newPost.trim()">Post</button>
      </div>
    </div>

    <!-- Feed -->
    <div class="feed">
      <div v-for="post in feed" :key="post.id" class="post-card card">
        <div class="post-header">
          <div class="post-avatar" :style="{ background: post.avatarColor }">{{ post.initials }}</div>
          <div class="post-meta">
            <div class="post-name">{{ post.name }}</div>
            <div class="post-time">{{ post.time }} · <span class="post-type-badge" :class="post.type">{{ typeLabel(post.type) }}</span></div>
          </div>
          <div class="post-position-badge">{{ post.position }}</div>
        </div>

        <div class="post-body">{{ post.body }}</div>

        <div class="post-stat-row" v-if="post.stat">
          <div class="post-stat-item">
            <span class="post-stat-icon">{{ post.stat.icon }}</span>
            <span class="post-stat-val">{{ post.stat.value }}</span>
            <span class="post-stat-label">{{ post.stat.label }}</span>
          </div>
        </div>

        <div class="post-actions">
          <button class="post-action" :class="{ liked: post.liked }" @click="toggleLike(post)">
            {{ post.liked ? '❤️' : '🤍' }} {{ post.likes }}
          </button>
          <button class="post-action" @click="post.showComments = !post.showComments">
            💬 {{ post.comments.length }}
          </button>
          <button class="post-action">🔗 Share</button>
        </div>

        <!-- Comments -->
        <div v-if="post.showComments" class="comments-section">
          <div v-for="c in post.comments" :key="c.id" class="comment">
            <div class="comment-avatar" :style="{ background: c.color }">{{ c.initials }}</div>
            <div class="comment-body">
              <span class="comment-name">{{ c.name }}</span>
              <span class="comment-text">{{ c.text }}</span>
            </div>
          </div>
          <div class="comment-input-row">
            <input v-model="post.newComment" placeholder="Add a comment…" class="comment-input" @keyup.enter="addComment(post)" />
            <button class="comment-send" @click="addComment(post)">→</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({ profile: Object })

const newPost = ref('')
const postType = ref('progress')

const userInitial = computed(() => props.profile?.name?.[0]?.toUpperCase() || 'U')

const feed = ref([
  {
    id: 1, name: 'Mugisha Kevin', initials: 'MK', avatarColor: '#f97316',
    position: 'PG', type: 'progress', time: '2h ago',
    body: 'Just hit 28 inches on my vertical! Started at 20 inches 6 weeks ago. The Air Alert program is no joke 🔥',
    stat: { icon: '⬆️', value: '28"', label: 'Vertical Jump' },
    likes: 24, liked: false, comments: [
      { id: 1, name: 'Uwase Grace', initials: 'UG', color: '#6366f1', text: 'That\'s incredible progress! Keep going! 💪' },
      { id: 2, name: 'Nkusi David', initials: 'ND', color: '#22c55e', text: 'What was your training schedule like?' },
    ], showComments: false, newComment: ''
  },
  {
    id: 2, name: 'Ishimwe Diane', initials: 'ID', avatarColor: '#6366f1',
    position: 'SG', type: 'question', time: '4h ago',
    body: 'How do I improve my shooting consistency? I can hit shots in practice but miss in games. Any tips from experienced players?',
    stat: null,
    likes: 18, liked: false, comments: [
      { id: 1, name: 'Coach Habimana', initials: 'CH', color: '#f97316', text: 'Game speed reps! Practice at game speed, not slow motion. Your muscle memory needs to match game intensity.' },
    ], showComments: false, newComment: ''
  },
  {
    id: 3, name: 'Nzeyimana Eric', initials: 'NE', avatarColor: '#22c55e',
    position: 'C', type: 'motivation', time: '6h ago',
    body: 'Day 30 of the program. Never missed a session. If you\'re reading this and thinking about quitting — DON\'T. The results are coming. Trust the process. 🏆',
    stat: null,
    likes: 67, liked: false, comments: [], showComments: false, newComment: ''
  },
  {
    id: 4, name: 'Uwimana Aline', initials: 'UA', avatarColor: '#3b82f6',
    position: 'SF', type: 'progress', time: '1d ago',
    body: 'Finally touched the rim today!! 6 months ago I couldn\'t even get close. NYIRABYO Basketball changed my game completely 🙏',
    stat: { icon: '🏀', value: 'Rim Touch!', label: 'Milestone Reached' },
    likes: 112, liked: false, comments: [
      { id: 1, name: 'Mugisha Kevin', initials: 'MK', color: '#f97316', text: 'LETS GOOO! You\'re next milestone is the dunk! 🔥' },
    ], showComments: false, newComment: ''
  },
])

function typeLabel(type) {
  return { progress: '📈 Progress', question: '❓ Question', motivation: '🔥 Motivation' }[type] || type
}

function toggleLike(post) {
  post.liked = !post.liked
  post.likes += post.liked ? 1 : -1
}

function addComment(post) {
  if (!post.newComment.trim()) return
  post.comments.push({
    id: Date.now(),
    name: props.profile?.name || 'You',
    initials: userInitial.value,
    color: '#f97316',
    text: post.newComment.trim()
  })
  post.newComment = ''
}

function submitPost() {
  if (!newPost.value.trim()) return
  feed.value.unshift({
    id: Date.now(),
    name: props.profile?.name || 'You',
    initials: userInitial.value,
    avatarColor: '#f97316',
    position: props.profile?.position || 'PG',
    type: postType.value,
    time: 'Just now',
    body: newPost.value.trim(),
    stat: null,
    likes: 0, liked: false, comments: [], showComments: false, newComment: ''
  })
  newPost.value = ''
}
</script>

<style scoped>
.composer { margin-bottom: 14px; }
.composer-top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.composer-avatar {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--accent); color: #fff;
  font-size: 15px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.composer-input {
  background: var(--surface2); border: 1.5px solid var(--border);
  border-radius: 99px; padding: 10px 16px;
  font-size: 14px; color: var(--text-h);
}
.composer-actions { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

.feed { display: flex; flex-direction: column; gap: 10px; }

.post-card { display: flex; flex-direction: column; gap: 12px; }

.post-header { display: flex; align-items: center; gap: 10px; }
.post-avatar {
  width: 40px; height: 40px; border-radius: 50%;
  color: #fff; font-size: 15px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.post-meta { flex: 1; }
.post-name { font-size: 14px; font-weight: 700; color: var(--text-h); }
.post-time { font-size: 12px; color: var(--text); }
.post-type-badge { font-size: 11px; font-weight: 600; }
.post-position-badge {
  font-size: 11px; font-weight: 700; color: var(--accent);
  background: var(--accent-dim); padding: 3px 8px; border-radius: 99px;
}

.post-body { font-size: 14px; color: var(--text2); line-height: 1.6; }

.post-stat-row {
  background: var(--surface2); border-radius: var(--radius-sm);
  padding: 10px 14px; display: flex;
}
.post-stat-item { display: flex; align-items: center; gap: 8px; }
.post-stat-icon { font-size: 18px; }
.post-stat-val { font-size: 18px; font-weight: 800; color: var(--text-h); }
.post-stat-label { font-size: 12px; color: var(--text); }

.post-actions { display: flex; gap: 4px; }
.post-action {
  background: var(--surface2); border: 1px solid var(--border);
  color: var(--text); border-radius: 99px;
  padding: 6px 12px; font-size: 13px; font-weight: 600;
  transition: all 0.2s;
}
.post-action:hover { border-color: var(--border2); color: var(--text-h); }
.post-action.liked { color: #ef4444; border-color: #ef444444; background: #ef444411; }

.comments-section { display: flex; flex-direction: column; gap: 8px; }
.comment { display: flex; align-items: flex-start; gap: 8px; }
.comment-avatar {
  width: 28px; height: 28px; border-radius: 50%;
  color: #fff; font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.comment-body { font-size: 13px; color: var(--text2); line-height: 1.5; }
.comment-name { font-weight: 700; color: var(--text-h); margin-right: 6px; }
.comment-input-row { display: flex; gap: 6px; }
.comment-input { border-radius: 99px; padding: 8px 14px; font-size: 13px; }
.comment-send {
  background: var(--accent); color: #fff;
  border-radius: 50%; width: 36px; height: 36px;
  font-size: 14px; font-weight: 700; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
</style>
