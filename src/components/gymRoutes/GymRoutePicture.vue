<template>
  <div
    class="gym-route-picture-container mobile-interface"
  >
    <div
      class="panzoom-container rounded"
      :class="panzoomContainerClass"
      @click="switchCrop"
    >
      <div
        v-if="gymRoute.gym_route_cover.attachments.picture.attached"
        id="panzoom"
      >
        <v-img
          class="rounded gym-route-picture"
          :min-height="height"
          :src="imageVariant(gymRoute.gym_route_cover.attachments.picture, { fit: 'scale-down', height: 1080, width: 1080 })"
        >
          <div
            v-if="gymRoute.thumbnail_position"
            class="gym-route-thumbnail-position"
            :style="`height: ${thbPos.h}%; width: ${thbPos.w}%; top: calc(50% - ${thbPos.dy}%); left: calc(50% - ${thbPos.dx}%)`"
          >
            <svg xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient
                  id="GymRouteGradient"
                  x1="0"
                  x2="100%"
                  y1="0"
                  y2="0"
                >
                  <stop
                    v-for="(gradiant, gradiantIndex) in thumbnailGradiant"
                    :key="`gradiant-index-${gradiantIndex}`"
                    :offset="`${gradiant.offset}%`"
                    :stop-color="gradiant.color"
                  />
                </linearGradient>
              </defs>
              <rect
                fill="transparent"
                height="100%"
                rx="50%"
                ry="50%"
                stroke="url(#GymRouteGradient)"
                stroke-width="8"
                style="width:calc(100% - 8px);height:calc(100% - 8px)"
                width="100%"
                x="4"
                y="4"
              />
            </svg>
          </div>
        </v-img>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed, onMounted, ref } from 'vue'
  import { imageVariant } from '@/composables/useImageVariant.js'

  const props = defineProps({ gymRoute: Object })

  const height = ref(null)
  const fullPicture = ref(false)

  const thbPos = computed(() => {
    if (props.gymRoute.calculated_thumbnail_position === null) {
      return null
    }

    const thbP = props.gymRoute.calculated_thumbnail_position
    return {
      h: thbP.h,
      w: thbP.w,
      dx: thbP.delta_x,
      dy: thbP.delta_y,
    }
  })

  const orientation = computed(() => {
    return props.gymRoute.cover_metadata.height >= props.gymRoute.cover_metadata.width ? 'portrait' : 'landscape'
  })

  const panzoomContainerClass = computed(() => {
    let cropAlign = '--cropped-center'
    if (props.gymRoute.thumbnail_position && thbPos.value.dy < -10) {
      cropAlign = '--cropped-end'
    } else if (props.gymRoute.thumbnail_position && thbPos.value.dy > 20) {
      cropAlign = '--cropped-start'
    }
    return fullPicture.value || orientation.value === 'landscape' ? '--full' : `${cropAlign} --cropped`
  })

  const thumbnailGradiant = computed(() => {
    if (props.gymRoute.calculated_thumbnail_position === null) {
      return null
    }

    const colors = props.gymRoute.tag_colors && props.gymRoute.tag_colors.length > 0 ? props.gymRoute.tag_colors : props.gymRoute.hold_colors
    const numberOfColor = colors.length
    const gradiant = []
    if (numberOfColor === 1) {
      gradiant.push({
        color: colors[0],
        offset: 0,
      }, {
        color: colors[0],
        offset: 1,
      })
    } else {
      let index = 0
      for (const color of colors) {
        gradiant.push({
          color,
          offset: 100 / (numberOfColor - 1) * index,
        })
        index++
      }
    }
    return gradiant
  })

  onMounted(() => {
    const image = document.querySelector('#panzoom')
    height.value = orientation.value === 'portrait'
      ? 350
      : image.offsetWidth * (props.gymRoute.cover_metadata.height / props.gymRoute.cover_metadata.width)
  })

  function switchCrop () {
    if (orientation.value === 'landscape') {
      return false
    }
    fullPicture.value = !fullPicture.value
  }
</script>

<style lang="scss">
.gym-route-picture-container {
  position: relative;
  z-index: 1;
  .gym-route-picture {
    background-color: rgba(150, 150, 150, 0.5);
  }
  .btn-copper-switch-banner {
    background-color: white;
  }
  .panzoom-container {
    position: relative;
    &.--cropped {
      max-height: 350px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      &.--cropped-start {
        justify-content: start;
      }
      &.--cropped-center {
        justify-content: center;
      }
      &.--cropped-end {
        justify-content: end;
      }
    }
    .cropper-switch-banner {
      position: absolute;
      bottom: 10px;
      right: 10px;
    }
  }
  .gym-route-thumbnail-position {
    box-sizing: border-box;
    position: absolute;
    border-color: rgba(255, 255, 255, 0.5);
    border-width: 2px;
    border-radius: 50%;
    border-style: solid;
    svg {
      opacity: 0.5;
      width:100%;
      height:100%;
    }
  }
}
</style>
