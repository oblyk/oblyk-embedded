<template>
  <v-list-item
    class="px-1"
    rounded="lg"
    @click="getRoute(gymRoute)"
  >
    <template #prepend>
      <gym-route-avatar
        class="mr-2"
        :gym-route="gymRoute"
      />
    </template>
    <v-list-item-title class="d-flex align-center">
      <div class="mr-auto text-truncate">
        {{ gymRoute.name }}
      </div>
      <div class="pt-1 text-no-wrap">
        <gym-route-grade-and-point
          :gym-route="gymRoute"
          inline
        />
        <gym-route-sub-level
          v-if="gymRoute.sub_level"
          class="ml-1"
          :gym-route="gymRoute"
        />
      </div>
    </v-list-item-title>
    <v-list-item-subtitle class="d-flex align-center mt-1">
      <gym-route-climbing-simple-style-icons :gym-route="gymRoute" />
      <div class="mr-auto">
        <small v-if="gymRoute.anchor_number" class="d-block">
          {{ $t('models.gymRoute.anchor_number') }}{{ gymRoute.anchor_number }}
        </small>
      </div>

      <!-- Likes -->
      <strong v-if="gymRoute.likes_count && gymRoute.likes_count > 0">
        <v-icon
          class="vertical-align-sub"
          color="red"
          size="small"
        >
          mdi-heart
        </v-icon>
        {{ gymRoute.likes_count }}
      </strong>

      <!-- videos -->
      <strong
        v-if="gymRoute.videos_count || 0 !== 0"
        class="text-disabled"
      >
        <v-icon
          class="ml-2 text-disabled vertical-align-sub"
          size="small"
        >
          mdi-play-box
        </v-icon>
        {{ gymRoute.videos_count || 0 }}
      </strong>

      <!-- comments -->
      <strong
        v-if="gymRoute.all_comments_count || 0 !== 0"
        class="text-disabled"
      >
        <v-icon
          class="ml-2 text-disabled vertical-align-sub"
          size="small"
        >
          mdi-comment
        </v-icon>
        {{ gymRoute.all_comments_count || 0 }}
      </strong>

      <!-- Ascents -->
      <strong
        v-if="gymRoute.ascents_count || 0 !== 0"
        class="text-disabled"
      >
        <v-icon
          class="ml-2 text-disabled vertical-align-sub"
          size="small"
        >
          mdi-check-all
        </v-icon>
        {{ gymRoute.ascents_count || 0 }}
      </strong>
    </v-list-item-subtitle>
  </v-list-item>
</template>
<script setup>
  import { inject } from 'vue'
  import GymRouteAvatar from '@/components/gymRoutes/GymRouteAvatar'
  import GymRouteClimbingSimpleStyleIcons from '@/components/gymRoutes/GymRouteClimbingSimpleStyleIcons'
  import GymRouteGradeAndPoint from '@/components/gymRoutes/GymRouteGradeAndPoint'
  import GymRouteSubLevel from '@/components/gymRoutes/GymRouteSubLevel'

  const props = defineProps({ gymRoute: Object })
  const getRoute = inject('GymSpaceAndRoutes:getRoute')
</script>
