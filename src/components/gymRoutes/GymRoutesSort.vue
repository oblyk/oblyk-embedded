<template>
  <v-menu>
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        class="pl-1"
        elevation="0"
        text
      >
        <v-icon class="mr-3">mdi-sort</v-icon>
        {{ $t(`gym.routeSorts.${routesSort}`) }}
        <v-icon class="ml-2">mdi-menu-down</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item @click="sortSwitch('opened_at')">
        <template #prepend>
          <v-icon>mdi-calendar</v-icon>
        </template>
        <v-list-item-title>
          {{ $t('gym.opened_at') }}
        </v-list-item-title>
      </v-list-item>
      <v-list-item @click="sortSwitch('sector')">
        <template #prepend>
          <v-icon>mdi-texture-box</v-icon>
        </template>
        <v-list-item-title>
          {{ $t('gym.sector') }}
        </v-list-item-title>
      </v-list-item>
      <v-list-item @click="sortSwitch('color')">
        <template #prepend>
          <v-icon>mdi-palette</v-icon>
        </template>
        <v-list-item-title>
          {{ $t('gym.color') }}
        </v-list-item-title>
      </v-list-item>
      <v-list-item @click="sortSwitch('grade')">
        <template #prepend>
          <v-icon>mdi-exponent</v-icon>
        </template>
        <v-list-item-title>
          {{ $t('gym.grade') }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup>
  import { inject } from 'vue'

  const props = defineProps({ routesSort: String })

  const sortSwitch = inject('GymSpaceAndRoutes:sortSwitch')
</script>
