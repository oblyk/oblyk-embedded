<template>
  <div class="embedded-gym-spaces-and-routes pa-2">
    <v-sheet class="embedded-gym-spaces-and-routes-v-sheet rounded-lg pa-2" elevation="1">
      <v-tabs-window v-model="tab">

        <!-- SPACE SELECTOR AND ROUTES LIST (FIRST PANEL) -->
        <v-tabs-window-item
          class="d-flex flex-column"
          style="max-height: 100%; overflow-x: hidden"
          value="route-list"
        >
          <div>
            <!-- GYM SPACES SELECTOR -->
            <gym-spaces-selector
              v-if="gym.gym_spaces.length > 1"
              :active-gym-space="activeGymSpace"
              class="mb-3"
              :gym="gym"
            />

            <!-- GYM SECTORS ACTIVE FILTER -->
            <div
              v-if="activeGymSector"
              :key="`sector-key-${activeGymSector?.id}`"
              class="mb-2 px-2"
            >
              <p class="mt-0 mb-1 font-italic">
                <v-icon class="mr-1" size="small">mdi-filter</v-icon>
                Filtré sur le secteur :
              </p>
              <div class="border rounded-pill d-flex align-center pl-3">
                <gym-sector-avatar :gym-sector="activeGymSector" :gym-space="activeGymSpace" />
                <div class="ml-2 font-weight-medium">
                  {{ activeGymSector.name }}
                </div>
                <v-btn
                  class="ml-auto"
                  elevation="0"
                  icon
                  @click="switchGymSector(null)"
                >
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>
            </div>

            <!-- GYM ROUTES SORTS -->
            <div class="mb-0 font-weight-medium border-b">
              <gym-routes-sort :routes-sort="routesSort" />
            </div>
          </div>

          <!-- GYM ROUTES LIST -->
          <div class="routes-list flex-grow-1">
            <gym-route-list
              :active-gym-sector="activeGymSector"
              :active-gym-space="activeGymSpace"
              :gym="gym"
              :sort="routesSort"
            />
          </div>
        </v-tabs-window-item>

        <!-- SELECTED ROUTE (SECOND PANEL) -->
        <v-tabs-window-item value="route-info">
          <gym-route-info :gym-route="gymRoute" :loading="loadingRoute" />
        </v-tabs-window-item>
      </v-tabs-window>
    </v-sheet>
  </div>
</template>

<script setup>
  import { inject, provide, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import GymRouteInfo from '@/components/gymRoutes/GymRouteInfo.vue'
  import GymRouteList from '@/components/gymRoutes/GymRouteList.vue'
  import GymRoutesSort from '@/components/gymRoutes/GymRoutesSort.vue'
  import GymSectorAvatar from '@/components/gymSectors/GymSectorAvatar.vue'
  import GymSpacesSelector from '@/components/gymSpaces/GymSpacesSelector.vue'
  import { oblykApi } from '@/services/oblykApi.js'

  const { t } = useI18n()

  const props = defineProps({ gym: Object, activeGymSpace: Object, activeGymSector: Object })
  const tab = ref('route-list')
  const routesSort = ref('opened_at')
  const gymRoute = ref({})
  const loadingRoute = ref(true)

  const switchGymSector = inject('Gym:switchGymSector')

  provide('GymSpaceAndRoutes:getRoute', getRoute)
  provide('GymSpaceAndRoutes:sortSwitch', sortSwitch)
  provide('GymSpaceAndRoutes:switchTab', switchTab)

  async function getRoute (route) {
    loadingRoute.value = true
    switchTab('route-info')
    gymRoute.value = await oblykApi.get(`/api/embedded/gyms/${props.gym.id}/gym_routes/${route.id}.json`)
    loadingRoute.value = false
  }

  function sortSwitch (sort) {
    routesSort.value = sort
  }

  function switchTab (tabName) {
    tab.value = tabName
  }
</script>

<style lang="scss">
.embedded-gym-spaces-and-routes {
  height: 100vh;
  h1 {
    font-size: 1.2rem;
  }
  .embedded-gym-spaces-and-routes-v-sheet {
    border-radius: 15px;
    height: 100%;
    .v-tabs-window {
      height: 100%;
    }
    .routes-list {
      overflow-y: auto;
      max-height: 100%;
      scrollbar-width: none;
    }
  }
}
</style>
