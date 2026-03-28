<template>
  <span
    class="font-weight-bold"
    :style="`color: ${color};`"
  >
    <span>
      {{ gymRoute.sub_level }}
    </span>
    <v-icon
      class="vertical-align-text-top"
      :color="color"
      size="small"
      style="margin-left: -6px; padding-top: 1px;"
    >
      mdi-chili-mild
    </v-icon>
  </span>
</template>

<script setup>
  import { computed } from 'vue'
  const props = defineProps({ gymRoute: Object })

  const colors = {
    0: [],
    1: ['#a10026'],
    2: ['#8bbc22', '#a10026'],
    3: ['#8bbc22', '#f2b600', '#a10026'],
    4: ['#8bbc22', '#f2b600', '#fd2605', '#a10026'],
    5: ['#8bbc22', '#f2b600', '#f96a02', '#f11d10', '#a10026'],
  }

  const color = computed(() => {
    return colors[props.gymRoute.sub_level_max][props.gymRoute.sub_level - 1]
  })
</script>
