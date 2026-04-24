<template>
  <div>
    <p class="mb-0 text-truncate">
      <v-icon
        :color="iconColor"
        left
        small
      >
        {{ icon }}
      </v-icon>
      {{ itemTitle }}
    </p>
    <div class="pl-7">
      <slot
        v-if="hasCustomContent"
        name="content"
      />
      <div v-else>
        <span v-if="itemValue" class="font-weight-bold">
          {{ itemValue }} {{ itemSuffix }}
        </span>
        <span v-else class="text--disabled">
          {{ $t('noInformation') }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { computed, useSlots } from 'vue'
  const slots = useSlots()

  const props = defineProps({
    icon: String,
    iconColor: String,
    itemTitle: String,
    itemValue: [String, Number],
    itemSuffix: String,
  })

  const hasCustomContent = computed(() => {
    return !!slots.content
  })
</script>
