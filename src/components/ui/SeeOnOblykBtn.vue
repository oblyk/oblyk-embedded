<template>
  <v-btn
    class="text-white font-weight-medium text-uppercase"
    color="black"
    elevation="0"
    :href="mode === 'iframe' ? url : null"
    :prepend-icon="mode === 'iframe' ? 'mdi-open-in-new' : 'mdi-cellphone-arrow-down'"
    rounded="xl"
    target="_blank"
    @click="mode !== 'iframe' ? openDialog() : null"
  >
    {{ $t(mode === 'iframe' ? 'seeOnOblyk' : 'actions.seeOnMyPhone') }}
  </v-btn>
  <v-dialog
    v-model="dialog"
    max-width="350"
    persistent
  >
    <v-card loading>
      <template #loader>
        <v-progress-linear color="#6200EA" :model-value="progressToClose" />
      </template>
      <v-card-title class="font-weight-medium d-flex align-center mt-1">
        <v-icon class="mr-1">mdi-cellphone-arrow-down</v-icon>
        {{ $t('actions.seeOnMyPhone') }}
      </v-card-title>
      <v-card-text class="py-1">
        <p class="mt-0">
          {{ $t('scanThisCode') }}
        </p>
        <div class="d-flex justify-center">
          <div class="border rounded-lg pa-3 pb-2 bg-white">
            <qrcode-vue size="200" :value="url" />
          </div>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-btn
          class="font-weight-medium"
          :text="$t('actions.close')"
          variant="text"
          @click="closeDialog"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import QrcodeVue from 'qrcode.vue'
  import { onBeforeMount, ref } from 'vue'
  import { useRoute } from 'vue-router'

  const mode = ref('iframe')
  const timeInterval = ref(null)
  const dialog = ref(false)
  const progressToClose = ref(100)
  const route = useRoute()

  const props = defineProps({ url: String })

  onBeforeMount(() => {
    mode.value = route.query.mode ?? 'iframe'
  })

  function openDialog () {
    clearInterval(timeInterval.value)
    progressToClose.value = 100
    dialog.value = true
    timeInterval.value = setInterval(() => {
      progressToClose.value -= 1
      if (progressToClose.value <= 0) {
        closeDialog()
      }
    }, 150)
  }

  function closeDialog () {
    clearInterval(timeInterval.value)
    dialog.value = false
  }
</script>
