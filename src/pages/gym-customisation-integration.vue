<template>
  <v-container>
    <h1>{{ $t('gymCustomisation.title') }}</h1>
    <p v-html="$t('gymCustomisation.intro')" />

    <!-- MODE -->
    <div class="pa-2 rounded border mb-6">
      <h4 class="mb-4 mt-0">
        <v-chip class="mr-1" color="blue" size="small">1</v-chip>
        {{ $t('gymCustomisation.where') }}
      </h4>
      <v-btn-toggle v-model="mode">
        <v-btn
          prepend-icon="mdi-xml"
          value="iframe"
        >
          {{ $t('gymCustomisation.onMyWebSite.title') }}
        </v-btn>
        <v-btn
          prepend-icon="mdi-tablet"
          value="kiosk"
        >
          {{ $t('gymCustomisation.onMyPad.title') }}
        </v-btn>
      </v-btn-toggle>
      <div class="text-disabled">
        <p v-if="mode === 'iframe'" class="mb-0">
          {{ $t('gymCustomisation.onMyWebSite.hint') }}
        </p>
        <p v-if="mode === 'kiosk'" class="mb-0">
          {{ $t('gymCustomisation.onMyPad.hint') }}
        </p>
      </div>
    </div>

    <!-- THEME -->
    <div class="pa-2 rounded border mb-6">
      <h4 class="mb-4 mt-0">
        <v-chip class="mr-1" color="blue" size="small">2</v-chip>
        {{ $t('gymCustomisation.theme') }}
      </h4>
      <v-btn-toggle v-model="theme">
        <v-btn
          prepend-icon="mdi-weather-sunny"
          value="light"
        >
          Light
        </v-btn>
        <v-btn
          prepend-icon="mdi-moon-waning-crescent"
          value="dark"
        >
          Dark
        </v-btn>
      </v-btn-toggle>
    </div>

    <div class="pa-2 rounded border mb-6">
      <h4 class="mb-4 mt-0">
        <v-chip class="mr-1" color="blue" size="small">3</v-chip>
        {{ $t('gymCustomisation.background') }}
      </h4>
      <v-btn
        class="mr-1"
        density="comfortable"
        elevation="0"
        prepend-icon="mdi-circle-off-outline"
        @click="background = false"
      >
        {{ 'no' }}
      </v-btn>
      <v-btn
        class="mr-1"
        color="#000"
        density="comfortable"
        elevation="0"
        @click="applyPreset(['#000'])"
      />
      <v-btn
        class="mr-1"
        color="#fff"
        density="comfortable"
        elevation="0"
        @click="applyPreset(['#fff'])"
      />
      <v-btn
        class="mr-1"
        color="#2196F3"
        density="comfortable"
        elevation="0"
        @click="applyPreset(['#2196F3'])"
      />
      <v-btn
        class="mr-1"
        color="#4CAF50"
        density="comfortable"
        elevation="0"
        @click="applyPreset(['#4CAF50'])"
      />
      <v-btn
        class="mr-1"
        density="comfortable"
        elevation="0"
        style="background: linear-gradient(0deg, #BDBDBD, #fff)"
        @click="applyPreset(['#BDBDBD', '#fff'], 0)"
      />
      <v-btn
        class="mr-1"
        density="comfortable"
        elevation="0"
        style="background: linear-gradient(0deg, #fff, #2196F3)"
        @click="applyPreset(['#fff', '#2196F3'], 0)"
      />
      <v-btn
        class="mr-1"
        density="comfortable"
        elevation="0"
        style="background: linear-gradient(45deg, #69F0AE, #C8E6C9)"
        @click="applyPreset(['#69F0AE', '#C8E6C9'], 45)"
      />
      <v-btn
        class="mr-1"
        density="comfortable"
        elevation="0"
        style="background: linear-gradient(45deg, #651FFF, #B39DDB)"
        @click="applyPreset(['#651FFF', '#B39DDB'], 45)"
      />
      <v-btn
        class="mr-1"
        density="comfortable"
        elevation="0"
        style="background: linear-gradient(90deg, #F44336, #FF9800, #FFEB3B, #4CAF50, #00BCD4, #2196F3, #9C27B0)"
        @click="applyPreset(['#F44336', '#FF9800', '#FFEB3B', '#4CAF50', '#00BCD4', '#2196F3', '#9C27B0'], 90)"
      />
      <v-sheet v-if="background" class="rounded pa-4 mt-4">
        <p class="mt-0 mb-2">
          {{ $t('gymCustomisation.customizeBackground') }}
        </p>
        <div
          v-for="(color, colorIndex) in draftBgColors"
          :key="`color-index-${colorIndex}`"
          class="d-flex align-center mb-1"
        >
          <v-color-input
            v-model="draftBgColors[colorIndex]"
            class="flex-grow-1"
            color-pip
            hide-details
            :label="$t('gymCustomisation.colorIndex', { index: colorIndex + 1 })"
          />
          <v-icon-btn
            v-if="colorIndex > 0"
            color="red"
            icon="mdi-delete"
            variant="text"
            @click="deleteColor(colorIndex)"
          />
        </div>
        <div class="text-right mb-1 d-flex py-2 justify-space-between align-center">
          <v-number-input
            v-if="draftBgColors.length > 1"
            v-model="draftDegree"
            control-variant="stacked"
            hide-details
            :label="$t('gymCustomisation.gradientDirection')"
            :max="360"
            :min="0"
            prepend-icon="mdi-gradient-horizontal"
            suffix="deg"
            variant="outlined"
          />
          <v-spacer />
          <v-btn
            prepend-icon="mdi-plus"
            size="x-large"
            variant="tonal"
            @click="addColorStop"
          >
            {{ $t('actions.addColor') }}
          </v-btn>
        </div>
        <div class="text-right border-t pt-4">
          <v-btn color="deep-purple-accent-3" @click="applyBackground">
            {{ $t('actions.applyBackground') }}
          </v-btn>
        </div>
      </v-sheet>
    </div>

    <div v-if="mode === 'iframe'">
      <div class="pa-2 rounded border mb-6">
        <h4 class="mb-4 mt-0">
          <v-chip class="mr-1" color="blue" size="small">4</v-chip>
          {{ $t('gymCustomisation.heightAndRounding') }}
        </h4>
        <v-number-input
          v-model="borderRadius"
          control-variant="stacked"
          hide-details
          :label="$t('gymCustomisation.borderRadius')"
          :min="0"
          prepend-icon="mdi-border-radius"
          suffix="px"
          variant="outlined"
        />
        <v-sheet class="rounded pa-2 mt-4">
          <p class="mt-0 mb-5 font-weight-bold">
            <v-icon class="mr-1" icon="mdi-arrow-expand-vertical" />
            {{ $t('gymCustomisation.iframeHeight') }}
          </p>
          <v-number-input
            v-model="fixHeight"
            control-variant="stacked"
            :label="$t('gymCustomisation.iframeHeight')"
            :min="0"
            suffix="px"
            variant="outlined"
          />
          <v-number-input
            v-model="maxHeight"
            control-variant="stacked"
            :hint="$t('gymCustomisation.maxHeight.hint')"
            :label="$t('gymCustomisation.maxHeight.label')"
            :min="0"
            persistent-hint
            prefix="calc(100vh - "
            suffix="px)"
            variant="outlined"
          />
        </v-sheet>
      </div>
    </div>

    <h4 class="mb-2">
      <v-chip class="mr-1" color="blue" size="small">
        {{ mode === 'iframe' ? 5 : 4 }}
      </v-chip>
      {{ $t('preview') }}
    </h4>
    <iframe
      :src="iframeSrc"
      style="border: none; border-radius: 22px"
      :style="{ borderRadius: borderRadius + 'px', height: iframeHeight, maxHeight: iframeMaxHeight }"
      width="100%"
    />

    <div class="pa-2 rounded border my-6">
      <h4 class="mb-2 mt-0">
        <v-chip class="mr-1" color="blue" size="small">
          {{ mode === 'iframe' ? 6 : 5 }}
        </v-chip>
        {{ mode === 'iframe' ? $t('gymCustomisation.integration') : $t('gymCustomisation.link') }}
      </h4>
      <div v-if="mode === 'iframe'">
        <p>
          {{ $t('gymCustomisation.iframe.part1') }}
        </p>
        <p class="mb-1">
          {{ $t('gymCustomisation.iframe.part2') }}
        </p>
        <v-textarea
          hide-details
          rows="4"
          :value="iframeCode"
          variant="outlined"
        />
        <div class="text-right mt-2">
          <v-btn
            :color="copied ? 'success' : 'primary'"
            :prepend-icon="copied ? 'mdi-check' : 'mdi-content-copy'"
            :variant="copied ? 'text' : null"
            @click="copyCode"
          >
            {{ copied ? $t('actions.copied') : $t('actions.copy') }}
          </v-btn>
        </div>
      </div>
      <div v-else>
        <p>
          {{ $t('gymCustomisation.padLink.part1') }}
        </p>
        <p class="mb-1">
          {{ $t('gymCustomisation.padLink.part2') }}
        </p>
        <v-text-field
          hide-details
          rows="4"
          :value="iframeSrc"
          variant="outlined"
        />
        <div class="text-right mt-2">
          <v-btn
            :color="copied ? 'success' : 'primary'"
            :prepend-icon="copied ? 'mdi-check' : 'mdi-content-copy'"
            :variant="copied ? 'text' : null"
            @click="copyLink"
          >
            {{ copied ? $t('actions.copied') : $t('actions.copy') }}
          </v-btn>
        </div>
      </div>
    </div>
  </v-container>
</template>

<script setup>
  import { computed, onBeforeMount, ref } from 'vue'
  import { useRoute } from 'vue-router'

  const embeddedBaseUrl = import.meta.env.VITE_OBLYK_EMBEDDED_BASE_URL

  const route = useRoute()

  const mode = ref('iframe')
  const theme = ref('light')
  const background = ref(false)
  const bgColor = ref(null)
  const degree = ref(90)
  const draftBgColors = ref([null])
  const draftDegree = ref(90)
  const borderRadius = ref(22)
  const maxHeight = ref(150)
  const fixHeight = ref(650)
  const gymId = ref(null)
  const gymName = ref(null)
  const copied = ref(false)

  onBeforeMount(() => {
    gymId.value = route.params.id
    gymName.value = route.params.name
    document.title = gymName.value.toString()
  })

  const iframeSrc = computed(() => {
    const url = new URL(`/gyms/${gymId.value}/${gymName.value}`, embeddedBaseUrl)
    url.searchParams.set('theme', theme.value)
    if (background.value && bgColor.value) {
      url.searchParams.set('bg_color', bgColor.value)
      url.searchParams.set('bg_linear_deg', degree.value)
    }
    return url.toString()
  })

  const iframeHeight = computed(() => {
    return `${fixHeight.value}px`
  })

  const iframeMaxHeight = computed(() => {
    return `calc(100vh - ${maxHeight.value}px)`
  })

  const iframeCode = computed(() => {
    return `<iframe src="${iframeSrc.value}" width="100%" height="${iframeHeight.value}" style="max-height: ${iframeMaxHeight.value}; border: none; border-radius: ${borderRadius.value}px;"></iframe>`
  })

  function applyPreset (colors, degrees = 0) {
    background.value = true
    draftBgColors.value = colors
    draftDegree.value = degrees
    applyBackground()
  }

  function applyBackground () {
    bgColor.value = draftBgColors.value.join('|')
    degree.value = draftDegree.value
  }

  function addColorStop () {
    draftBgColors.value.push(null)
  }

  function deleteColor (colorIndex) {
    draftBgColors.value.splice(colorIndex, 1)
  }

  function copyCode () {
    navigator.clipboard.writeText(iframeCode.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }

  function copyLink () {
    navigator.clipboard.writeText(iframeSrc.value)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
</script>
