<template>
  <div
    v-if="!loading"
    class="embedded-gym"
    :class="mobileToggle"
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
    <div class="embedded-gym-toggle">
      <v-btn-toggle
        v-model="mobileToggle"
        class="border"
        color="black"
        mandatory
        rounded="xl"
      >
        <v-btn
          prepend-icon="mdi-format-list-text"
          value="active-side--left"
        >
          {{ $t('liste') }}
        </v-btn>

        <v-btn
          prepend-icon="mdi-map"
          value="active-side--right"
        >
          {{ $t('map') }}
        </v-btn>
      </v-btn-toggle>
    </div>
  </div>
  <div
    v-else
    class="loading-embedded-gym d-flex align-center justify-center"
  >
    <div class="text-center">
      <animate-oblyk-logo color="#6200EA" stroke-linejoin="round" />
      <p class="font-weight-medium text-disabled mt-0">
        {{ $t('loadingGym') }}
      </p>
    </div>
  </div>
  <v-chip
    class="powered-by-oblyk"
    :href="gym && mode === 'iframe' ? `https://oblyk.org${gym.app_path}` : null"
    size="small"
    target="_blank"
    @click="mode !== 'iframe' ? openOblykDialog() : null"
  >
    <oblyk-logo-name />
  </v-chip>
  <v-dialog
    v-model="oblykDialog"
    max-width="400"
    persistent
  >
    <v-card loading>
      <template #loader>
        <v-progress-linear color="#6200EA" :model-value="oblykDialogProgressToClose" />
      </template>
      <v-card-title class="font-weight-medium d-flex align-center mt-1">
        <svg-icon class="mr-2" :path="oblykLogo" size="30" />
        Oblyk
      </v-card-title>
      <v-card-text class="py-1">
        <p class="text-center font-weight-medium">
          {{ $t('getGymOnPhone', { name: gym?.name }) }}
        </p>
        <div class="d-flex justify-center">
          <div class="border rounded-lg pa-5 pb-4 text-center bg-white">
            <qrcode-vue size="200" :value="gym?.app_path" />
          </div>
        </div>
        <p class="text-center">
          <v-chip class="ma-1" prepend-icon="mdi-bell-ring">
            {{ $t('stayUpDate') }}
          </v-chip>
          <v-chip class="ma-1" prepend-icon="mdi-check-all">
            {{ $t('trackYourProgress') }}
          </v-chip>
          <v-chip class="ma-1" prepend-icon="mdi-heart">
            {{ $t('shareOpinion') }}
          </v-chip>
        </p>
      </v-card-text>
      <v-card-actions>
        <v-btn
          class="font-weight-medium"
          :text="$t('actions.close')"
          variant="text"
          @click="closeOblykDialog"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import QrcodeVue from 'qrcode.vue'
  import { onBeforeMount, provide, ref, watch } from 'vue'
  import { useRoute } from 'vue-router'
  import { useTheme } from 'vuetify'
  import { oblykLogo } from '@/assets/oblyk-icons/index.js'
  import GymSpacesAndRoutes from '@/components/gyms/GymSpacesAndRoutes.vue'
  import GymThreeD from '@/components/gyms/GymThreeD.vue'
  import GymSpaceList from '@/components/gymSpaces/GymSpaceList.vue'
  import GymSpacePlan from '@/components/gymSpaces/GymSpacePlan.vue'
  import GymSpaceThreeD from '@/components/gymSpaces/GymSpaceThreeD.vue'
  import AnimateOblykLogo from '@/components/ui/AnimateOblykLogo.vue'
  import OblykLogoName from '@/components/ui/OblykLogoName.vue'
  import SvgIcon from '@/components/ui/SvgIcon.vue'
  import { oblykApi } from '@/services/oblykApi.js'

  const theme = useTheme()
  const route = useRoute()

  const loading = ref(true)
  const gym = ref(null)
  const mobileToggle = ref('active-side--left')
  const mode = ref('iframe')
  const activeGymSpace = ref(null)
  const activeGymSector = ref(null)
  const oblykDialog = ref(false)
  const oblykDialogProgressToClose = ref(100)
  const oblykDialogTimeInterval = ref(null)

  watch(() => route.params.id, fetchData, { immediate: true })
  provide('Gym:switchGymSpace', switchGymSpace)
  provide('Gym:switchGymSector', switchGymSector)

  onBeforeMount(() => {
    mode.value = route.query.mode ?? 'iframe'
    setStyle()
  })

  async function fetchData (id) {
    loading.value = true

    try {
      gym.value = await oblykApi.get(`/api/embedded/gyms/${id}.json`)

      // Select first space if gym has one space
      if (gym.value.gym_spaces.length === 1) {
        activeGymSpace.value = gym.value.gym_spaces[0]
      }

      document.title = gym.value.name
    } finally {
      setTimeout(() => {
        loading.value = false
      }, 500)
    }
  }

  function switchGymSpace (gymSpace) {
    activeGymSector.value = null
    activeGymSpace.value = gymSpace
  }

  function switchGymSector (gymSector) {
    mobileToggle.value = 'active-side--left'
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

  function openOblykDialog () {
    clearInterval(oblykDialogTimeInterval.value)
    oblykDialogProgressToClose.value = 100
    oblykDialog.value = true
    oblykDialogTimeInterval.value = setInterval(() => {
      oblykDialogProgressToClose.value -= 1
      if (oblykDialogProgressToClose.value <= 0) {
        closeOblykDialog()
      }
    }, 150)
  }

  function closeOblykDialog () {
    clearInterval(oblykDialogTimeInterval.value)
    oblykDialog.value = false
  }
</script>

<style lang="scss">
.embedded-gym {
  height: 100vh;
  position: relative;
  .embedded-gym-container {
    .embedded-gym-left-side {
      max-width: 100%;
      width: 400px;
    }
    .embedded-gym-right-side {
      height: 100vh;
      overflow: hidden;
    }
  }
  .embedded-gym-toggle {
    display: none;
    position: absolute;
    bottom: 13px;
    left: calc(50% - 90px);
  }
}
.loading-embedded-gym {
  height: 100vh;
}
.powered-by-oblyk {
  border-color: rgba(150, 150, 150, 0.5);
  position: fixed;
  bottom: 5px;
  right: 5px;
}
@media (max-width: 800px) {
  .embedded-gym {
    .embedded-gym-container {
      .embedded-gym-left-side {
        width: 100vw;
        position: fixed;
        height: 100vh;
        left: 0;
        opacity: 1;
        transition: left 0.3s, opacity 0.3s;
        z-index: 1;
      }
      .embedded-gym-right-side {
        width: 100vw;
      }
    }
    .embedded-gym-toggle {
      display: block;
      z-index: 2;
    }
    &.active-side--right {
      .embedded-gym-left-side {
        left: -100vw;
        opacity: 0;
      }
    }
  }
}
</style>
