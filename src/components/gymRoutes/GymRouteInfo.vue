<template>
  <v-tabs
    v-model="gymRouteTab"
    class="mb-2 font-weight-medium"
    grow
    inset
  >
    <v-tab
      class="px-0"
      style="min-width: 0"
      @click.stop="back"
    >
      <v-icon>mdi-arrow-left</v-icon>
    </v-tab>
    <v-tab prepend-icon="mdi-information" value="info">
      Infos
    </v-tab>
    <v-tab prepend-icon="mdi-play-circle" value="videos">
      Videos
      <v-chip
        v-if="gymRoute?.videos?.length > 0"
        class="ml-2 font-weight-bold"
        color="#6200EA"
      >
        {{ gymRoute?.videos?.length }}
      </v-chip>
    </v-tab>
  </v-tabs>
  <v-tabs-window v-model="gymRouteTab">
    <v-tabs-window-item value="info">
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
        <div class="text-center mt-2">
          <see-on-oblyk-btn :url="gymRoute.app_path" />
        </div>
      </div>
    </v-tabs-window-item>

    <v-tabs-window-item value="videos">
      <gym-route-video-list :videos="gymRoute?.videos ?? []" />
    </v-tabs-window-item>
  </v-tabs-window>
</template>

<script setup>
  import { inject, ref } from 'vue'
  import GymRouteListItem from '@/components/gymRoutes/GymRouteListItem.vue'
  import GymRoutePicture from '@/components/gymRoutes/GymRoutePicture.vue'
  import GymRouteVideoList from '@/components/gymRoutes/GymRouteVideoList.vue'
  import GymSectorAvatar from '@/components/gymSectors/GymSectorAvatar.vue'
  import SeeOnOblykBtn from '@/components/ui/SeeOnOblykBtn.vue'

  const switchTab = inject('GymSpaceAndRoutes:switchTab')
  const props = defineProps({ gym: Object, gymRoute: Object, gymSpace: Object, loading: Boolean })

  const gymRouteTab = ref('info')

  function back (event) {
    event.stopPropagation()
    gymRouteTab.value = 'info'
    switchTab('route-list')
  }
</script>
