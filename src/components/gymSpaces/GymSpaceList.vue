<template>
  <div
    class="d-flex align-center justify-center ga-5 overflow-x-auto gym-space-plan-list"
    style="height: 100vh"
  >
    <v-card
      v-for="(gymSpace, gymSpaceIndex) in gym.gym_spaces"
      :key="`gym-space-${gymSpaceIndex}`"
      @click="spaceSwitch(gymSpace)"
    >
      <v-img
        class="mx-1 mt-1 rounded space-banner"
        height="150"
        min-height="250"
        min-width="250"
        :src="imageVariant(gymSpace.attachments.plan, { fit: 'scale-down', height: 500, width: 500 })"
      />
      <v-card-title>
        {{ gymSpace.name }}
      </v-card-title>
    </v-card>
  </div>
</template>

<script setup>
  import { inject } from 'vue'
  import { imageVariant } from '@/composables/useImageVariant.js'
  const props = defineProps({ gym: Object })

  const spaceSwitch = inject('Gym:switchGymSpace')
</script>

<style lang="scss">
.v-theme--light {
  .gym-space-plan-list {
    .space-banner {
      background-color: rgb(240 240 240);
    }
  }
}
.v-theme--dark {
  .gym-space-plan-list {
    .space-banner {
      background-color: #121212
    }
  }
}
</style>
