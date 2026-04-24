<template>
  <div
    v-for="(video, videoIndex) in videos"
    :key="`video-index-${videoIndex}`"
  >
    <div
      v-if="video.video_service !== 'oblyk_video'"
      v-html="video.embedded_code"
    />
    <oblyk-video
      v-else
      class="mb-1"
      rounded
      :video="video"
    />
    <div
      v-if="video.description"
      class="caption mb-2"
    >
      {{ video.description }}
    </div>
  </div>
  <p
    v-if="videos.length === 0"
    class="text-center my-10 text-disabled"
  >
    {{ $t('gymRoute.videos.noVideos') }}
  </p>
</template>

<script setup>
  import OblykVideo from '@/components/videos/OblykVideo.vue'

  const props = defineProps({ videos: Array })
</script>
