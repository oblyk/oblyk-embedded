<template>
  <div
    class="oblyk-video rounded-lg"
  >
    <v-img
      v-if="thumbnail"
      :src="video.thumbnail_url"
      :style="`aspect-ratio: ${aspectRatio}`"
    />
    <video
      ref="videoPlayer"
      class="oblyk-video-player"
      :class="thumbnail ? 'd-none' : null"
      :controls="fullScreen"
      :muted="muted"
      playsinline
      :poster="thumbnail ? null : video.thumbnail_url"
      preload="none"
      :style="`aspect-ratio: ${aspectRatio}`"
      @canplay="loading = false"
      @click="pauseVideo"
      @ended="endedVideo"
      @timeupdate="timeUpdate"
      @waiting="loading = true"
    >
      <source
        :src="video.oblyk_video.path"
        :type="video.oblyk_video.content_type"
      >
      <p>
        {{ $t('components.video.notSupportVideo') }}
      </p>
    </video>
    <v-slide-y-transition>
      <div
        v-if="!play || ended"
        class="oblyk-video-middle-container"
      >
        <v-btn
          v-if="!ended"
          class="oblyk-video-play-btn text-white"
          elevation="0"
          icon
          x-large
          @click="playVideo"
        >
          <v-icon large>
            mdi-play
          </v-icon>
        </v-btn>
        <div v-if="ended">
          <v-btn
            class="oblyk-video-replay-btn text-white"
            elevation="0"
            text
            @click="replayVideo"
          >
            <v-icon left>
              mdi-replay
            </v-icon>
            {{ $t('actions.replay') }}
          </v-btn>
        </div>
      </div>
    </v-slide-y-transition>
    <div class="oblyk-video-controls d-flex align-center">
      <animate-oblyk-logo
        :animate="loading"
        color="rgb(255,255,255)"
      />
      <v-spacer />
      <v-btn
        class="text-white"
        icon
        variant="text"
        @click="muted = !muted"
      >
        <v-icon>
          {{ muted ? 'mdi-volume-off' : 'mdi-volume-high' }}
        </v-icon>
      </v-btn>
      <v-btn
        class="text-white"
        icon
        variant="text"
        @click="fullScreenVideo"
      >
        <v-icon>
          {{ 'mdi-arrow-expand' }}
        </v-icon>
      </v-btn>
    </div>
    <div
      v-if="currentTime !== 0 && duration"
      class="video-progress-container"
      @click.stop="seek"
    >
      <div
        class="video-progress-bar"
        :style="`width: ${currentTime / duration * 100}%`"
      />
    </div>
    <v-chip
      v-if="workInProgress"
      class="oblyk-video-work-in-progress"
      color="rgba(0,0,0,0.5)"
    >
      {{ $t('components.video.workInProgress') }}
    </v-chip>
  </div>
</template>

<script setup>
  import { onMounted, ref, useTemplateRef } from 'vue'
  import AnimateOblykLogo from '@/components/ui/AnimateOblykLogo.vue'

  const props = defineProps({ video: Object, rounded: Boolean })

  const thumbnail = ref(true)
  const play = ref(false)
  const fullScreen = ref(false)
  const currentTime = ref()
  const duration = ref(null)
  const muted = ref(true)
  const ended = ref(false)
  const loading = ref(false)
  const videoPlayer = useTemplateRef('videoPlayer')
  const workInProgress = ref(false)
  const aspectRatio = ref('4 / 3')

  onMounted(() => {
    initVideoPlayer()
  })

  function initVideoPlayer () {
    if ([undefined, null].includes(props.video.video_metadata)) {
      workInProgress.value = true
      aspectRatio.value = ' 4 / 3'
      duration.value = null
    } else {
      if (props.video.video_metadata.width === undefined || props.video.video_metadata.height === undefined) {
        aspectRatio.value = '4 / 3'
      } else {
        const ratio = props.video.video_metadata.width / props.video.video_metadata.height
        aspectRatio.value = [ratio, '1'].join(' / ')
      }
      if (props.video.video_metadata.duration !== undefined) {
        duration.value = props.video.video_metadata.duration
      }
    }
  }

  function playVideo () {
    thumbnail.value = false
    videoPlayer.value.play()
    ended.value = false
    play.value = true
  }

  function pauseVideo () {
    videoPlayer.value.pause()
    play.value = false
  }

  function endedVideo () {
    ended.value = true
  }

  function replayVideo () {
    videoPlayer.value.currentTime = 0
    playVideo()
  }

  function fullScreenVideo () {
    videoPlayer.value.requestFullscreen()
    fullScreen.value = true
  }

  function timeUpdate () {
    currentTime.value = videoPlayer.value.currentTime
    loading.value = false
    ended.value = false
  }

  function seek (event) {
    const bar = event.currentTarget
    const ratio = event.offsetX / bar.offsetWidth
    videoPlayer.value.currentTime = ratio * duration.value
  }
</script>

<style lang="scss">
.oblyk-video {
  position: relative;
  overflow: hidden;
  .oblyk-video-player {
    width: 100%;
    max-height: calc(100vh - 130px);
  }
  .oblyk-video-middle-container {
    text-align: center;
    position: absolute;
    top: calc(50% - 24px);
    width: 100%;
    .oblyk-video-play-btn, .oblyk-video-replay-btn {
      background-color: rgba(0,0,0,0.5);
    }
  }
  .oblyk-video-info {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 5px 5px;
    .v-chip {
      background-color: rgba(0, 0, 0, 0.5);
    }
  }
  .oblyk-video-work-in-progress {
    position: absolute;
    top: 5px;
    left: 5px;
  }
  .oblyk-video-controls {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 5px 5px;
  }
  .video-progress-container {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding-top: 10px;
    .video-progress-bar {
      border-radius: 2px;
      height: 3px;
      background-color: #6200EA;
    }
  }
  video {
    margin-bottom: -8px;
  }
}
</style>
