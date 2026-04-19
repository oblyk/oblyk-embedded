<template>
  <v-skeleton-loader v-if="loadingRoutes" type="list-item-avatar" />
  <div v-else>
    <v-list>
      <template
        v-for="(route, routeIndex) in gymRoutes"
        :key="`route-index-${routeIndex}`"
      >
        <!-- SORT BY OPENED AT -->
        <div
          v-if="sort === 'opened_at' && (routeIndex === 0 || route.opened_at !== gymRoutes[routeIndex - 1].opened_at)"
          class="font-weight-medium"
          :class="routeIndex !== 0 ? 'mt-7' : 'mt-0'"
        >
          <v-icon class="mr-1 vertical-align-sub" size="small">mdi-calendar</v-icon>
          {{ new Date(route.opened_at).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }) }}
        </div>

        <!-- SORT BY SECTOR -->
        <v-list-item
          v-if="sort === 'sector' && (routeIndex === 0 || route.gym_sector_id !== gymRoutes[routeIndex - 1].gym_sector_id)"
          class="font-weight-medium px-0"
          :class="routeIndex !== 0 ? 'mt-7' : 'mt-0'"
        >
          <template #prepend>
            <gym-sector-avatar
              :gym-sector="route.gym_sector"
              :gym-space="sectorGymSpace(route.gym_sector.gym_space_id)"
              :size="40"
            />
          </template>
          <v-list-item-title class="font-weight-medium">
            {{ route.gym_sector.name }}
          </v-list-item-title>
        </v-list-item>

        <!-- ROUTES LISTS -->
        <gym-route-list-item :gym-route="route" />
      </template>
    </v-list>

    <div
      v-if="!loadingRoutes && !noMorePages"
      v-intersect="onIntersect"
    >
      <v-skeleton-loader type="list-item-avatar" />
      <v-skeleton-loader type="list-item-avatar" />
      <v-skeleton-loader type="list-item-avatar" />
    </div>
    <p
      v-if="noMorePages"
      class="text-center text-disabled py-4"
    >
      {{ t('endOfList') }}
    </p>
  </div>
</template>

<script setup>
  import { onMounted, ref, watch } from 'vue'
  import { useI18n } from 'vue-i18n'
  import GymRouteListItem from '@/components/gymRoutes/GymRouteListItem'
  import GymSectorAvatar from '@/components/gymSectors/GymSectorAvatar'
  import { oblykApi } from '@/services/oblykApi.js'

  const { t } = useI18n()

  const props = defineProps({
    gym: Object,
    activeGymSpace: Object,
    activeGymSector: Object,
    sort: String,
  })

  const loadingRoutes = ref(true)
  const gymRoutes = ref([])
  const page = ref(1)
  const loadingNextPage = ref(false)
  const noMorePages = ref(false)

  watch(() => props.activeGymSpace?.id, resetAndFetchRoutes, { immediate: false })
  watch(() => props.activeGymSector?.id, resetAndFetchRoutes, { immediate: false })
  watch(() => props.sort, resetAndFetchRoutes, { immediate: false })

  onMounted(() => {
    resetAndFetchRoutes()
  })

  function resetAndFetchRoutes () {
    loadingRoutes.value = true
    gymRoutes.value = []
    page.value = 1
    fetchRoutes()
  }

  async function fetchRoutes () {
    const params = {
      sort: props.sort,
      page: page.value,
    }

    loadingNextPage.value = true

    if (props.activeGymSpace) {
      params.gym_space_id = props.activeGymSpace.id
    }

    if (props.activeGymSector) {
      params.gym_sector_id = props.activeGymSector.id
    }

    const routes = await oblykApi.get(`/api/embedded/gyms/${props.gym.id}/gym_routes.json`, params)

    if (routes.length < 25) {
      noMorePages.value = true
    }

    gymRoutes.value = gymRoutes.value.concat(routes)
    loadingRoutes.value = false
    loadingNextPage.value = false
  }

  function sectorGymSpace (gymSpaceId) {
    for (const gymSpace of props.gym.gym_spaces) {
      if (gymSpace.id === gymSpaceId) {
        return gymSpace
      }
    }
  }

  function onIntersect (isIntersecting, entries, observer) {
    if (loadingNextPage.value === true) {
      return false
    }

    if (isIntersecting) {
      page.value++
      loadingNextPage.value = true
      fetchRoutes()
    }
  }
</script>
