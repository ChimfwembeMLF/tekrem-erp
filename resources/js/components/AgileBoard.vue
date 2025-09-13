<template>
  <div class="agile-board">
    <h1>Agile Board</h1>
    <div class="sprints">
      <h2>Sprints</h2>
      <ul>
        <li v-for="sprint in sprints" :key="sprint.id">
          <strong>{{ sprint.name }}</strong> ({{ sprint.start_date }} - {{ sprint.end_date }})<br>
          Goal: {{ sprint.goal }}
          <ul>
            <li v-for="story in sprint.user_stories" :key="story.id">
              <span :class="'story status-' + story.status">
                {{ story.title }} ({{ story.story_points }} pts) - {{ story.status }}
              </span>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <div class="epics">
      <h2>Epics</h2>
      <ul>
        <li v-for="epic in epics" :key="epic.id">
          <strong>{{ epic.title }}</strong><br>
          {{ epic.description }}
          <ul>
            <li v-for="story in epic.user_stories" :key="story.id">
              <span :class="'story status-' + story.status">
                {{ story.title }} ({{ story.story_points }} pts) - {{ story.status }}
              </span>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <div class="backlog">
      <h2>Backlog</h2>
      <ul>
        <li v-for="story in backlog" :key="story.id">
          <span :class="'story status-' + story.status">
            {{ story.title }} ({{ story.story_points }} pts) - {{ story.status }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const sprints = ref([]);
const epics = ref([]);
const backlog = ref([]);

onMounted(async () => {
  const [sprintRes, epicRes, storyRes] = await Promise.all([
    axios.get('/api/sprints'),
    axios.get('/api/epics'),
    axios.get('/api/user-stories'),
  ]);
  sprints.value = sprintRes.data;
  epics.value = epicRes.data;
  backlog.value = storyRes.data.filter(story => story.status === 'backlog');
});
</script>

<style scoped>
.agile-board {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.sprints, .epics, .backlog {
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 8px;
}
.story {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.25rem;
  display: inline-block;
}
.status-backlog { background: #ffeeba; }
.status-in-progress { background: #bee5eb; }
.status-done { background: #c3e6cb; }
</style>
