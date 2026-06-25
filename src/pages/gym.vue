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
        <div class="embedded-gym-clic-to-space">
          {{
            activeGymSpace === null ? $t('actions.selectSpaceFor') : $t(`actions.selectSectorFor.${activeGymSpace.climbing_type}`)
          }}
        </div>
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
      <v-btn
        class="border"
        color="black"
        prepend-icon="mdi-format-list-text"
        rounded="xl"
        @click="switchSide"
      >
        {{ mobileToggle === 'active-side--left' ? $t('showClimbingGym') : $t('showRouteList') }}
      </v-btn>
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
  <a
    class="powered-by-oblyk"
    :href="gym && mode === 'iframe' ? `https://oblyk.org${gym.app_path}` : null"
    target="_blank"
    @click="mode !== 'iframe' ? openOblykDialog() : null"
  >
    <oblyk-logo-name />
  </a>
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
  <div
    v-if="countdownCounter < 6"
    class="font-weight-bold text-center"
    style="position: fixed; top: 50%; width: 100%"
  >
    {{ $t('gym.reloadingIn') }}<br>
    <strong style="font-size: 3em;">
      {{ countdownCounter }}
    </strong>
  </div>
</template>

<script setup>
  import QrcodeVue from 'qrcode.vue'
  import { onBeforeMount, onBeforeUnmount, provide, ref, watch } from 'vue'
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
  const mobileToggle = ref('active-side--right')
  const mode = ref('iframe')
  const activeGymSpace = ref(null)
  const activeGymSector = ref(null)
  const oblykDialog = ref(false)
  const oblykDialogProgressToClose = ref(100)
  const oblykDialogTimeInterval = ref(null)
  const timeToRefresh = ref(null)
  const refreshSoon = ref(null)
  const countdownInterval = ref(null)
  const countdownCounter = ref(6)

  watch(() => route.params.id, fetchData, { immediate: true })
  provide('Gym:switchGymSpace', switchGymSpace)
  provide('Gym:switchGymSector', switchGymSector)
  provide('Gym:toggleActiveSide', toggleActiveSide)

  onBeforeMount(() => {
    mode.value = route.query.mode ?? 'iframe'
    timeToRefresh.value = setInterval(() => location.reload(), 900_000)
    refreshSoon.value = setTimeout(() => launchCountdown(), 900_000 - 6000)
    setStyle()
  })

  onBeforeUnmount(() => {
    clearInterval(timeToRefresh.value)
    clearInterval(refreshSoon.value)
    clearInterval(countdownInterval.value)
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
    if (activeGymSpace.value === gymSpace) {
      mobileToggle.value = 'active-side--right'
    }
    activeGymSector.value = null
    activeGymSpace.value = gymSpace
  }

  function switchGymSector (gymSector) {
    mobileToggle.value = 'active-side--left'
    activeGymSector.value = gymSector
  }

  function launchCountdown () {
    countdownInterval.value = setInterval(() => countdownCounter.value -= 1, 1000)
  }

  function toggleActiveSide (side) {
    mobileToggle.value = side
  }

  function switchSide () {
    mobileToggle.value = mobileToggle.value === 'active-side--left' ? 'active-side--right' : 'active-side--left'
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
    left: calc(50% - 76px);
  }
  .embedded-gym-clic-to-space {
    position: absolute;
    top: 30px;
    width: calc(100vw - 400px);
    text-align: center;
    font-weight: 800;
    opacity: 0.2;
  }
  .gym-spaces-selector-area {
    .gym-spaces-selector-container {
      width: 100%;
    }
    .gym-spaces-close-left-side {
      display: none;
      width: 56px;
      padding-top: 6px
    }
  }
  .v-tabs--inset .v-tab__slider {
    background: rgba(209, 196, 233, 0.4);
    border-radius: 40px;
  }
}
.loading-embedded-gym {
  height: 100vh;
}
.powered-by-oblyk {
  border-color: rgba(150, 150, 150, 0.5);
  position: fixed;
  cursor: pointer;
  bottom: 8px;
  right: 8px;
  height: 19px;
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
        z-index: 500;
      }
      .embedded-gym-right-side {
        width: 100vw;
      }
    }
    .embedded-gym-toggle {
      display: block;
      z-index: 510;
    }
    .embedded-gym-clic-to-space {
      width: 100vw;
    }
    &.active-side--right {
      .embedded-gym-left-side {
        left: -100vw;
        opacity: 0;
      }
    }
    .gym-spaces-selector-area {
      .gym-spaces-selector-container {
        width: calc(100% - 50px)
      }
      .gym-spaces-close-left-side {
        display: block;
      }
    }
  }
}
</style>
