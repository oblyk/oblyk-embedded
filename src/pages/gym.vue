<template>
  <div
    v-if="!loading"
    class="embedded-gym"
  >
    <div class="embedded-gym-container d-flex">
      <div class="embedded-gym-left-side">
        <gym-spaces-and-routes
          :active-gym-sector="activeGymSector"
          :active-gym-space="activeGymSpace"
          :gym="gym"
        />
      </div>
      <div
        v-if="gym"
        class="embedded-gym-right-side flex-grow-1"
      >
        <keep-alive>
          <gym-three-d
            v-if="activeGymSpace === null && gym.representation_type === '3d'"
            :gym="gym"
          />
        </keep-alive>
        <keep-alive>
          <gym-space-list
            v-if="activeGymSpace === null && gym.representation_type !== '3d'"
            :gym="gym"
          />
        </keep-alive>
        <keep-alive>
          <gym-space-three-d
            v-if="activeGymSpace && activeGymSpace.representation_type === '3d'"
            :key="`gym-space-three-d-index-${activeGymSpace.id}`"
            :gym="gym"
            :gym-space="activeGymSpace"
          />
        </keep-alive>
        <keep-alive>
          <gym-space-plan
            v-if="activeGymSpace && activeGymSpace.representation_type !== '3d'"
            :key="`gym-space-pan-index-${activeGymSpace.id}`"
            :gym="gym"
            :gym-space="activeGymSpace"
          />
        </keep-alive>
      </div>
    </div>
    <div
      v-if="mobile"
      class="embedded-gym-toggle"
    >
      toggle
    </div>
  </div>
  <div v-else>
    Chargement ...
  </div>
  <v-chip
    class="powered-by-oblyk"
    :href="gym && mode === 'iframe' ? `https://oblyk.org${gym.app_path}` : null"
    size="small"
    target="_blank"
  >
    <oblyk-logo-name />
  </v-chip>
</template>

<script setup>
  import { onBeforeMount, provide, ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { useDisplay, useTheme } from 'vuetify'
  import GymSpacesAndRoutes from '@/components/gyms/GymSpacesAndRoutes.vue'
  import GymThreeD from '@/components/gyms/GymThreeD.vue'
  import GymSpaceList from '@/components/gymSpaces/GymSpaceList.vue'
  import GymSpacePlan from '@/components/gymSpaces/GymSpacePlan.vue'
  import GymSpaceThreeD from '@/components/gymSpaces/GymSpaceThreeD.vue'
  import OblykLogoName from '@/components/ui/OblykLogoName.vue'

  const apiBaseUrl = import.meta.env.VITE_OBLYK_API_BASE_URL
  const { mobile } = useDisplay()
  const theme = useTheme()
  const route = useRoute()

  const loading = ref(true)
  const gym = ref(null)
  const mode = ref('iframe')
  const error = ref(null)
  const activeGymSpace = ref(null)
  const activeGymSector = ref(null)

  watch(() => route.params.id, fetchData, { immediate: true })
  provide('Gym:switchGymSpace', switchGymSpace)
  provide('Gym:switchGymSector', switchGymSector)

  onBeforeMount(() => {
    mode.value = route.query.mode ?? 'iframe'
    setStyle()
  })

  async function fetchData (id) {
    const url = `${apiBaseUrl}/api/embedded/gyms/${id}.json`
    loading.value = true

    try {
      const reponse = await fetch(url)
      if (!reponse.ok) {
        throw new Error(`Statut de réponse : ${reponse.status}`)
      }
      const resultat = await reponse.json()
      gym.value = await resultat

      // select first space if gym has one space
      if (gym.value.gym_spaces.length === 1) {
        activeGymSpace.value = gym.value.gym_spaces[0]
      }

      document.title = gym.value.name
    } catch (error_) {
      error.value = error_.toString()
    } finally {
      loading.value = false
    }
  }

  function switchGymSpace (gymSpace) {
    activeGymSector.value = null
    activeGymSpace.value = gymSpace
  }

  function switchGymSector (gymSector) {
    activeGymSector.value = gymSector
  }

  function setStyle () {
    // Theme (dark or light)
    const queryTheme = route.query.theme ?? 'light'
    theme.change(queryTheme)

    // Background color
    const bgColor = route.query.bg_color?.split('|') ?? []
    const linearDeg = route.query.bg_linear_deg ?? 90
    if (bgColor.length > 0) {
      if (bgColor.length === 1) {
        document.querySelector('.v-application').style.backgroundColor = bgColor[0]
      } else if (bgColor.length > 1) {
        document.querySelector('.v-application').style.background = `linear-gradient(${linearDeg}deg, ${bgColor?.join(', ')})`
      }
    }
  }
</script>

<style lang="scss">
.embedded-gym {
  height: 100vh;
  position: relative;
  .embedded-gym-container {
    .embedded-gym-left-side {
      max-width: 400px;
      width: 400px;
    }
    .embedded-gym-right-side {
      height: 100vh;
      overflow: hidden;
    }
  }
  .embedded-gym-toggle {
    position: absolute;
    bottom: 0;
    left: calc(50% - 50px);
  }
}
.powered-by-oblyk {
  border-color: rgba(150, 150, 150, 0.5);
  position: fixed;
  bottom: 5px;
  right: 5px;
}
</style>
