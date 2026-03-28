<template>
  <div
    v-if="!loading"
    class="embedded-gym"
  >
    <div class="embedded-gym-container d-flex">
      <div class="embedded-gym-left-side">
        <gym-spaces-and-routes :gym="gym" />
      </div>
      <div class="embedded-gym-right-side flex-grow-1">
        Plan ou 3D
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
  import { ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { useDisplay } from 'vuetify'
  import GymSpacesAndRoutes from '@/components/gyms/GymSpacesAndRoutes'

  const { mobile } = useDisplay()
  const route = useRoute()

  const loading = ref(true)
  const gym = ref(null)
  const error = ref(null)

  watch(() => route.params.id, fetchData, { immediate: true })

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
    } catch (error_) {
      error.value = error_.toString()
    } finally {
      loading.value = false
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
    }
  }
  .embedded-gym-toggle {
    position: absolute;
    bottom: 0;
    left: calc(50% - 50px);
  }
}
</style>
