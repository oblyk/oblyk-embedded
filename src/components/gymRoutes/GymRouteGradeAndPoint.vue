<template>
  <div class="text-center d-inline-block">
    <strong
      v-if="gymRoute.points_to_s"
    >
      {{ gymRoute.points_to_s }}
      <small class="font-weight-regular" style="margin-left: 2px; vertical-align: top;">
        pts
      </small>
    </strong>
    <strong
      v-if="gymRoute.grade_to_s"
    >
      {{ gymRoute.grade_to_s }}
    </strong>
  </div>
</template>

<script setup>
  const props = defineProps({ gymRoute: Object })
</script>
