<!-- components/ThemeDebugger.vue -->
<template>
  <v-card class="pa-4">
    <v-card-title>当前主题颜色</v-card-title>
    <v-list>
      <v-list-item v-for="(color, name) in themeColors" :key="name">
        <template v-slot:prepend>
          <div 
            :style="{ 
              width: '24px', 
              height: '24px', 
              backgroundColor: color,
              border: '1px solid #ccc',
              borderRadius: '4px'
            }"
          ></div>
        </template>
        <v-list-item-title>
          <strong>{{ name }}</strong>: {{ color }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script setup>
import { useTheme } from 'vuetify'
import { computed } from 'vue'

const theme = useTheme()

const themeColors = computed(() => {
  return theme.current.value.colors
})
</script>