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
              class="pt-1"
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
  const { t } = useI18n()

  const props = defineProps({ gym: Object, activeGymSpace: Object, sort: String })

  const loadingRoutes = ref(true)
  const gymRoutes = ref([])
  const page = ref(1)
  const loadingNextPage = ref(false)
  const noMorePages = ref(false)

  watch(() => props.activeGymSpace?.id, resetAndFetchRoutes, { immediate: false })
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
    const url = `http://localhost:3000/api/embedded/gyms/${props.gym.id}/gym_routes.json`
    const params = new URLSearchParams()
    params.append('sort', props.sort)
    params.append('page', page.value)

    loadingNextPage.value = true

    if (props.activeGymSpace) {
      params.gym_space_id = props.activeGymSpace.id
      params.append('gym_space_id', props.activeGymSpace.id)
    }

    const reponse = await fetch(`${url}?${params}`)
    if (!reponse.ok) {
      throw new Error(`Statut de réponse : ${reponse.status}`)
    }
    const resultat = await reponse.json()
    const routes = await resultat

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
