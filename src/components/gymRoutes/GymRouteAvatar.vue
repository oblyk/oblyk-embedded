<template>
  <div style="position: relative">
    <div
      class="my-0"
      style="border-radius: 50% 50% 20px 50%; height: 72px; width: 72px; padding: 5px"
      :style="circleColor()"
    >
      <v-avatar
        :image="imageVariant(gymRoute.attachments.thumbnail, { fit: 'crop', height: 100, width: 100 })"
        size="62"
        style="border-radius: 50% 50% 20px 50%"
      />
    </div>
    <v-sheet
      style="position: absolute; right: 0; bottom: 0; border-radius: 50%; padding: 3px"
      :style="smallCircleColor()"
    >
      <v-sheet
        class="svg-container"
        style="border-radius: 50%; height: 25px; width: 25px; padding: 4px"
      >
        <svg
          class="svg-content"
          preserveAspectRatio="xMinYMin meet"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient
              v-if="!allColorsStop"
              :id="`${gymRoute.id}-hold-gradiant`"
              x1="0%"
              x2="100%"
              y1="0%"
              y2="0%"
            >
              <stop
                v-for="(holdColor, indexColor) in holdOrTagColors()"
                :key="`gym-route-hold-index--${indexColor}`"
                :offset="`${holdColor.offset}%`"
                :style="`stop-color:${holdColor.color};stop-opacity:1`"
              />
            </linearGradient>
            <linearGradient
              v-else
              :id="`${gymRoute.id}-hold-gradiant`"
            >
              <stop offset="0" style="stop-color:#ff0000;stop-opacity:1" />
              <stop offset="0.15507609" style="stop-color:#ff7000;stop-opacity:1;" />
              <stop offset="0.32632306" style="stop-color:#ffcc00;stop-opacity:1" />
              <stop offset="0.51453418" style="stop-color:#71c837;stop-opacity:1" />
              <stop offset="0.70757306" style="stop-color:#0066ff;stop-opacity:1" />
              <stop offset="0.83874756" style="stop-color:#0044aa;stop-opacity:1" />
              <stop offset="1" style="stop-color:#892ca0;stop-opacity:1" />
            </linearGradient>
          </defs>
          <path
            v-if="showHold"
            d="M7.2,11.2C8.97,11.2 10.4,12.63 10.4,14.4C10.4,16.17 8.97,17.6 7.2,17.6C5.43,17.6 4,16.17 4,14.4C4,12.63 5.43,11.2 7.2,11.2M14.8,16A2,2 0 0,1 16.8,18A2,2 0 0,1 14.8,20A2,2 0 0,1 12.8,18A2,2 0 0,1 14.8,16M15.2,4A4.8,4.8 0 0,1 20,8.8C20,11.45 17.85,13.6 15.2,13.6A4.8,4.8 0 0,1 10.4,8.8C10.4,6.15 12.55,4 15.2,4Z"
            :style="`fill:url(#${gymRoute.id}-hold-gradiant)`"
          />
          <path
            v-if="showTag"
            d="M17,3H7A2,2 0 0,0 5,5V21L12,18L19,21V5C19,3.89 18.1,3 17,3Z"
            :style="`fill:url(#${gymRoute.id}-hold-gradiant)`"
          />
        </svg>
      </v-sheet>
    </v-sheet>
  </div>
</template>

<script setup>
  import { computed } from 'vue'
  import { imageVariant } from '@/composables/useImageVariant.js'
  const props = defineProps({ gymRoute: Object })

  const showTag = computed(() => {
    return !props.gymRoute.hold_colors?.length > 0 && props.gymRoute.tag_colors && props.gymRoute.tag_colors.length > 0
  })

  const showHold = computed(() => {
    return props.gymRoute.hold_colors && props.gymRoute.hold_colors.length > 0
  })

  const allColorsStop = computed(() => {
    return showHold.value && props.gymRoute.hold_colors[0] === '#00000000'
  })

  function circleColor () {
    if (props.gymRoute.tag_colors && props.gymRoute.tag_colors.length > 0) {
      return buildCssGradiant(props.gymRoute.tag_colors)
    } else if (props.gymRoute.hold_colors && props.gymRoute.hold_colors.length > 0) {
      return buildCssGradiant(props.gymRoute.hold_colors)
    } else {
      return null
    }
  }

  function smallCircleColor () {
    let color = null
    if (props.gymRoute.tag_colors && props.gymRoute.tag_colors.length > 0) {
      const firstColor = props.gymRoute.tag_colors.at(-1)
      if (firstColor === '#00000000') {
        return 'background: linear-gradient(to right, #009fff 0%, blue 33%, #f0f 66%, red 100%);'
      } else {
        color = firstColor
      }
    } else if (props.gymRoute.hold_colors && props.gymRoute.hold_colors.length > 0) {
      const firstColor = props.gymRoute.hold_colors.at(-1)
      if (firstColor === '#00000000') {
        return 'background: linear-gradient(to right, #009fff 0%, blue 33%, #f0f 66%, red 100%);'
      } else {
        color = firstColor
      }
    } else {
      color = '#00000000'
    }
    return `background-color: ${color}`
  }

  function buildCssGradiant (colors) {
    if (colors.length === 1 && colors[0] === '#00000000') {
      return 'background: linear-gradient(to right, red 0%, #ff0 17%, lime 33%, cyan 50%, blue 66%, #f0f 83%, red 100%);'
    }

    const numberOfColor = colors.length
    const gradiant = []
    if (numberOfColor === 1) {
      gradiant.push(
        { color: colors[0], offset: 0 },
        { color: colors[0], offset: 100 },
      )
    } else {
      let index = 0
      for (const color of colors) {
        gradiant.push(
          { color, offset: 100 / numberOfColor * index },
          { color, offset: 100 / numberOfColor * (index + 1) },
        )
        index++
      }
    }
    const gradiantColors = []
    for (const colorAndOffset of gradiant) {
      gradiantColors.push(`${colorAndOffset.color} ${colorAndOffset.offset}%`)
    }
    return `background: linear-gradient(135deg, ${gradiantColors.join(', ')});`
  }

  function holdOrTagColors () {
    const colors = showTag.value ? props.gymRoute.tag_colors : props.gymRoute.hold_colors
    if (colors && colors.length > 0) {
      return buildStopGradiant(colors, showHold)
    }
  }

  function buildStopGradiant (colors, fluid = true) {
    const numberOfColor = colors.length
    const gradiant = []
    if (numberOfColor === 1) {
      gradiant.push({ color: colors[0], offset: 0 }, { color: colors[0], offset: 100 })
    } else {
      let index = 0
      for (const color of colors) {
        if (fluid) {
          gradiant.push({ color, offset: 100 / (numberOfColor - 1) * index })
        } else {
          gradiant.push({ color, offset: 100 / numberOfColor * index }, { color, offset: 100 / numberOfColor * (index + 1) })
        }
        index++
      }
    }
    return gradiant
  }
</script>
