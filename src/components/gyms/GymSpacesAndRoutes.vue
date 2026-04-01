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

            <!-- GYM ROUTES SORTS -->
            <div class="mb-0 font-weight-medium border-b">
              <gym-routes-sort :routes-sort="routesSort" />
            </div>
          </div>

          <!-- GYM ROUTES LIST -->
          <div class="routes-list flex-grow-1">
            <gym-route-list
              :active-gym-space="activeGymSpace"
              :gym="gym"
              :sort="routesSort"
            />
          </div>
        </v-tabs-window-item>

        <!-- SELECTED ROUTE (SECOND PANEL) -->
        <v-tabs-window-item value="route-info">
          <v-btn
            elevation="0"
            icon
            @click="tab = 'route-list'"
          >
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          route
        </v-tabs-window-item>
      </v-tabs-window>
    </v-sheet>
  </div>
</template>

<script setup>
  import { provide, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import GymRouteList from '@/components/gymRoutes/GymRouteList'
  import GymRoutesSort from '@/components/gymRoutes/GymRoutesSort'
  import GymSpacesSelector from '@/components/gymSpaces/GymSpacesSelector'
  const { t } = useI18n()

  const props = defineProps({ gym: Object, activeGymSpace: Object })

  const tab = ref('route-list')
  const routesSort = ref('opened_at')
  const gymRoute = ref({})

  provide('GymSpaceAndRoutes:getRoute', getRoute)
  provide('GymSpaceAndRoutes:sortSwitch', sortSwitch)

  function getRoute (route) {
    tab.value = 'route-info'
    gymRoute.value = route
  }

  function sortSwitch (sort) {
    routesSort.value = sort
  }
</script>

<style lang="scss">
.embedded-gym-spaces-and-routes {
  height: 100vh;
  h1 {
    font-size: 1.2rem;
  }
  .embedded-gym-spaces-and-routes-v-sheet {
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
