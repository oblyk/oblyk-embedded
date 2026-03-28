<template>
  <div class="gym-spaces-selector">
    <div class="mr-2">
      <v-avatar
        class="gym-space-avatar"
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
      <p class="my-0 text-center">
        Salle
      </p>
    </div>
    <div
      v-for="(space, spaceIndex) in gym.gym_spaces"
      :key="`space-index-${spaceIndex}`"
      class="mr-2"
    >
      <v-avatar
        class="gym-space-avatar"
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
      <p class="my-0 text-center">
        {{ space.name }}
      </p>
    </div>
  </div>
</template>

<script setup>
  import { imageVariant } from '@/composables/useImageVariant'
  const props = defineProps({ gym: Object })
</script>

<style lang="scss">
.gym-spaces-selector {
  overflow-x: auto;
  display: flex;
  scrollbar-width: none;
  .gym-space-avatar {
    border-style: solid;
    border-width: 4px;
    transition: background-color 0.3s, border-color 0.3s;
  }
}
</style>
