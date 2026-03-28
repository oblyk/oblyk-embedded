<template>
  <v-avatar
    ref="gymSectorSvgAvatar"
    class="gym-sector-svg-avatar"
    :size="size"
    tile
  >
    <div v-html="gymSpace.svg_sectors" />
  </v-avatar>
</template>
<script setup>
  import { onMounted, ref } from 'vue'

  const gymSectorSvgAvatar = ref(null)

  const props = defineProps({ gymSector: Object, gymSpace: Object, size: { type: Number, default: 40 } })

  onMounted(() => {
    if (props.gymSpace.svg_sectors) {
      const sectorPolygone = gymSectorSvgAvatar.value.$el.querySelector(`polygon#id-${props.gymSector.id}`)
      const sectorCircle = gymSectorSvgAvatar.value.$el.querySelector(`circle#id-${props.gymSector.id}`)
      sectorPolygone?.classList?.add('--highlighted')
      sectorCircle?.classList?.add('--highlighted')
    }
  })
</script>

<style lang="scss">
.gym-sector-svg-avatar {
  svg {
    height: 100%;
    width: 100%;
    polygon { stroke-width: 5 }
    circle { fill: rgba(150, 150, 150, 0); }
    polygon, circle {
      &.--highlighted {
        fill: red;
      }
    }
  }
}
.v-theme--light {
  .gym-sector-svg-avatar {
    polygon { fill: rgba(150, 150, 150, 0.2); stroke: rgba(0, 0, 0); }
  }
}
.v-theme--dark {
  .gym-sector-svg-avatar {
    polygon { fill: rgba(200, 200, 200, 0.2); stroke: rgba(255, 255, 255); }
  }
}
</style>
