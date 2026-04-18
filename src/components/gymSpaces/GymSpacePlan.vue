<template>
  <div>
    <div
      :id="`space-map-${gymSpace.id}`"
      class="space-leaflet-plan"
      style="height: 100vh"
    />
  </div>
</template>

<script setup>
  import L, { CRS } from 'leaflet'
  import { inject, onMounted, onUnmounted, ref } from 'vue'
  import { imageVariant } from '@/composables/useImageVariant.js'
  import 'leaflet/dist/leaflet.css'

  const props = defineProps({ gym: Object, gymSpace: Object })

  const switchGymSector = inject('Gym:switchGymSector')

  const map = ref(null)

  const url = imageVariant(props.gymSpace.attachments.plan, { fit: 'scale-down', height: 4000, width: 4000 })
  const bounds = [[0, 0], [props.gymSpace.scheme_height / 6, props.gymSpace.scheme_width / 6]]

  onMounted(() => {
    map.value = L.map(`space-map-${props.gymSpace.id}`, {
      center: [props.gymSpace.scheme_height / 6, props.gymSpace.scheme_width / 6],
      zoom: 2,
      crs: CRS.Simple,
      zoomControl: false,
      attributionControl: false,
    })
    L.imageOverlay(url, bounds).addTo(map.value)

    // Add sectors
    for (const sector of props.gymSpace.gym_sectors) {
      if (sector.polygon) {
        const sectorPolygon = L.polygon(
          JSON.parse(sector.polygon),
          {
            className: 'gym-sector-polygon',
            fillOpacity: 0,
            weight: 2,
            color: props.gymSpace.sectors_color ?? 'rgb(49, 153, 78)',
            dashArray: [5, 5],
          },
        )
        sectorPolygon.on('click', () => filterBySector(sector))
        sectorPolygon.addTo(map.value)
      }
    }
    setMapView()
  })

  onUnmounted(() => {
    map.value?.remove()
  })

  function setMapView () {
    map.value.fitBounds(bounds)
  }

  function filterBySector (sector) {
    switchGymSector(sector)
  }
</script>

<style lang="scss">
.space-leaflet-plan {
  &.leaflet-container {
    background-color: transparent;
  }
  .gym-sector-polygon {
    transition: fill-opacity 0.2s;
    &:hover {
      fill-opacity: 0.2;
    }
  }
}
</style>
