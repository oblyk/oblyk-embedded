<template>
  <div
    v-if="!loading"
    class="embedded-gym"
  >
    <div class="embedded-gym-container d-flex">
      <div class="embedded-gym-left-side">
        <gym-spaces-and-routes :active-gym-space="activeGymSpace" :gym="gym" />
      </div>
      <div class="embedded-gym-right-side flex-grow-1">
        <div v-if="activeGymSpace === null">
          <keep-alive>
            <gym-three-d
              v-if="gym.representation_type === '3d'"
              :gym="gym"
            />
            <div v-else>
              Lise des espaces 2d
            </div>
          </keep-alive>
        </div>
        <keep-alive>
          <gym-space-three-d
            v-if="activeGymSpace && activeGymSpace.representation_type === '3d'"
            :key="`gym-space-three-d-index-${activeGymSpace.id}`"
            :gym="gym"
            :gym-space="activeGymSpace"
          />
          <div v-else>
            Plan 2d
          </div>
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
</template>

<script setup>
  import { provide, ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { useDisplay } from 'vuetify'
  import GymSpacesAndRoutes from '@/components/gyms/GymSpacesAndRoutes.vue'
  import GymThreeD from '@/components/gyms/GymThreeD.vue'
  import GymSpaceThreeD from '@/components/gymSpaces/GymSpaceThreeD.vue'

  const { mobile } = useDisplay()
  const route = useRoute()

  const loading = ref(true)
  const gym = ref(null)
  const error = ref(null)
  const activeGymSpace = ref(null)

  watch(() => route.params.id, fetchData, { immediate: true })
  provide('Gym:switchGymSpace', switchGymSpace)

  async function fetchData (id) {
    const url = `http://localhost:3000/api/embedded/gyms/${id}.json`
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
    } catch (error_) {
      error.value = error_.toString()
    } finally {
      loading.value = false
    }
  }

  function switchGymSpace (gymSpace) {
    activeGymSpace.value = gymSpace
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
</style>
