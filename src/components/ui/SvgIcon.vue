<template>
  <svg
    fill="currentColor"
    :height="size"
    :style="{ color }"
    viewBox="0 0 24 24"
    :width="size"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path :d="path" />
  </svg>
</template>

<script setup>
  defineProps({
    path: { type: String, required: true },
    size: { type: [Number, String], default: 24 },
    color: { type: String, default: 'primary' },
  })
</script>
