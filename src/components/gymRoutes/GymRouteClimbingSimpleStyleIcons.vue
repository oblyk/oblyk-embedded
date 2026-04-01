<template>
  <div class="d-inline">
    <svg-icon
      v-for="(style, styleIndex) in icons()"
      :key="`style-${styleIndex}`"
      class="mr-1"
      :path="ClimbingStyleIcons[style]"
      :size="18"
      :title="t(`climbingStyle.${style}`)"
    />
  </div>
</template>

<script setup>
  import { useI18n } from 'vue-i18n'
  import SvgIcon from '@/components/ui/SvgIcon.vue'
  import { ClimbingStyleIcons } from '@/composables/useClimbingStyleIcons.js'
  const { t } = useI18n()

  const props = defineProps({ gymRoute: Object })

  function icons () {
    const styles = []
    for (const section of props.gymRoute.sections ?? []) {
      for (const style of section.styles ?? []) {
        styles.push(style)
      }
    }
    return [...new Set(styles)]
  }
</script>
