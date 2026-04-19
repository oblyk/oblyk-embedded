<template>
  <div>
    <v-btn
      class="font-weight-medium"
      elevation="0"
      prepend-icon="mdi-arrow-left"
      @click="switchTab('route-list')"
    >
      {{ t('gymRoute.backToList') }}
    </v-btn>
  </div>
  <div>
    <v-skeleton-loader v-if="loading" type="card-avatar" />
    <div v-else>
      <gym-route-picture
        v-if="gymRoute.cover_metadata"
        :gym-route="gymRoute"
      />
      <gym-route-list-item :clickable="false" :gym-route="gymRoute" />
      <div class="border rounded px-2 py-1">
        <div class="d-flex align-center justify-space-between">
          <div class="font-weight-medium">
            <v-icon class="mr-1">mdi-check-all</v-icon>
            {{ gymRoute.ascents_count }}
          </div>
          <div v-if="gymRoute.likes_count > 0" class="font-weight-medium">
            <v-icon class="mr-1" color="red">mdi-heart</v-icon>
            {{ gymRoute.likes_count }}
          </div>
          <div>
            <gym-sector-avatar :gym-sector="gymRoute.gym_sector" :gym-space="gymRoute.gym_sector.gym_space" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { inject } from 'vue'
  import { useI18n } from 'vue-i18n'
  import GymRouteListItem from '@/components/gymRoutes/GymRouteListItem.vue'
  import GymRoutePicture from '@/components/gymRoutes/GymRoutePicture.vue'
  import GymSectorAvatar from '@/components/gymSectors/GymSectorAvatar.vue'

  const { t } = useI18n()
  const switchTab = inject('GymSpaceAndRoutes:switchTab')
  const props = defineProps({ gym: Object, gymRoute: Object, gymSpace: Object, loading: Boolean })
</script>
