<template>
  <div class="gym-spaces-selector">
    <div
      class="gym-space-avatar-card"
      @click="spaceSwitch(null)"
    >
      <v-avatar
        class="gym-space-avatar"
        :class="activeGymSpace === null ? '--active' : ''"
        size="60"
      >
        <v-img
          contain
          height="60"
          :src="imageVariant(gym.attachments.logo, { fit: 'scale-down', height: 100, width: 100 })"
          style="max-width: 60px"
          width="60"
        />
      </v-avatar>
      <p
        class="my-0 text-center"
        :class="activeGymSpace === null ? 'font-weight-medium text-deep-purple-accent-4' : ''"
      >
        Salle
      </p>
    </div>
    <div
      v-for="(space, spaceIndex) in gym.gym_spaces"
      :key="`space-index-${spaceIndex}`"
      class="gym-space-avatar-card"
      @click="spaceSwitch(space)"
    >
      <v-avatar
        class="gym-space-avatar"
        :class="activeGymSpace?.id === space.id ? '--active' : ''"
        size="60"
      >
        <v-img
          contain
          height="60"
          :src="imageVariant(space.attachments.avatar, { fit: 'scale-down', height: 100, width: 100 })"
          style="max-width: 60px"
          width="60"
        />
      </v-avatar>
      <p
        class="my-0 text-center"
        :class="activeGymSpace?.id === space.id ? 'font-weight-medium text-deep-purple-accent-4' : ''"
      >
        {{ space.name }}
      </p>
    </div>
  </div>
</template>

<script setup>
  import { inject } from 'vue'
  import { imageVariant } from '@/composables/useImageVariant.js'
  const props = defineProps({ gym: Object, activeGymSpace: Object })

  const spaceSwitch = inject('Gym:switchGymSpace')
</script>

<style lang="scss">
.gym-spaces-selector {
  overflow-x: auto;
  display: flex;
  scrollbar-width: none;
  .gym-space-avatar-card {
    transition: background-color 0.3s;
    border-radius: 8px;
    padding: 5px 4px 0 4px;
    cursor: pointer;
    &:hover {
      background-color: rgba(98, 0, 234, 0.1);
    }
  }
  .gym-space-avatar {
    border-style: solid;
    border-width: 4px;
    transition: background-color 0.3s, border-color 0.3s;
    &.--active {
      border-color: #6200EA;
    }
  }
}
</style>
