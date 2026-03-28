<template>
  <div class="embedded-gym-spaces-and-routes pa-2">
    <v-sheet class="embedded-gym-spaces-and-routes-v-sheet rounded-lg pa-2" elevation="1">
      <v-tabs-window v-model="tab">
        <v-tabs-window-item class="d-flex flex-column" style="max-height: 100%; overflow-x: hidden" value="route-list">
          <div>
            <h1 class="my-0">
              <v-avatar class="mr-2" size="30">
                <v-img :src="imageVariant(gym.attachments.logo, { fit: 'crop', width: 100, height: 100 })" />
              </v-avatar>
              {{ gym.name }}
            </h1>

            <gym-spaces-selector :gym="gym" />
            <div class="mb-0 font-weight-medium mt-3 border-b">
              <v-menu>
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    class="pl-1"
                    elevation="0"
                    text
                  >
                    <v-icon class="mr-3">mdi-sort</v-icon>
                    {{ t(`gym.routeSorts.${routesSort}`) }}
                    <v-icon class="ml-2">mdi-menu-down</v-icon>
                  </v-btn>
                </template>
                <v-list>
                  <v-list-item @click="sortSwitch('opened_at')">
                    <template #prepend>
                      <v-icon>mdi-calendar</v-icon>
                    </template>
                    <v-list-item-title>Date d'ouverture</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="sortSwitch('sector')">
                    <template #prepend>
                      <v-icon>mdi-texture-box</v-icon>
                    </template>
                    <v-list-item-title>Secteur</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="sortSwitch('color')">
                    <template #prepend>
                      <v-icon>mdi-palette</v-icon>
                    </template>
                    <v-list-item-title>Couleur</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="sortSwitch('grade')">
                    <template #prepend>
                      <v-icon>mdi-exponent</v-icon>
                    </template>
                    <v-list-item-title>Cotation</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </div>
          </div>

          <div class="routes-list flex-grow-1">
            <gym-routes :gym="gym" :sort="routesSort" />
          </div>
        </v-tabs-window-item>
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
  import GymRoutes from '@/components/gymRoutes/GymRoutes'
  import GymSpacesSelector from '@/components/gyms/GymSpacesSelector'
  import { imageVariant } from '@/composables/useImageVariant'
  const { t } = useI18n()

  const props = defineProps({ gym: Object })

  const tab = ref('route-list')
  const routesSort = ref('opened_at')
  const gymRoute = ref({})

  provide('GymSpaceAndRoutes:getRoute', getRoute)

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
