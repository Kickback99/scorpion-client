// src/store/theme.js
import { defineStore } from 'pinia'
import { themeConfig } from '@/plugins/theme-config'

/**
 * 主题管理 Store
 * 负责应用的主题切换、持久化存储等功能
 */
export const useThemeStore = defineStore('theme', {
  state: () => ({
    // 当前主题名称：'light' 或 'dark'
    currentTheme: themeConfig.defaultTheme
  }),
  
  getters: {
    /**
     * 判断当前是否为深色模式
     * @returns {boolean} true-深色模式，false-浅色模式
     */
    isDark: (state) => state.currentTheme?.endsWith('-dark') || false,
    
    // 获取当前主题的基础名（如 scorpion-light → scorpion）
    currentBase: (state) => {
      if (!state.currentTheme) return 'default'
      return state.currentTheme.replace('-light', '').replace('-dark', '')
    }

  },
  
  actions: {
        /**
     * 设置当前主题
     */
    setTheme(themeName) {
      this.currentTheme = themeName
    },
    
    /**
     * 切换主题（深浅切换）
     * @param {Object} vuetifyTheme - useTheme() 返回的对象
     */
    toggleTheme(vuetifyTheme) {
      const currentName = vuetifyTheme.global.name.value
      const currentBase = currentName.replace('-light', '').replace('-dark', '')
      const isDark = currentName.endsWith('-dark')
      const targetSuffix = isDark ? 'light' : 'dark'
      const targetTheme = `${currentBase}-${targetSuffix}`
      
      // 获取所有可用主题
      const availableThemes = Object.keys(vuetifyTheme.themes.value)
      
      // 检查目标主题是否存在
      if (availableThemes.includes(targetTheme)) {
        vuetifyTheme.global.name.value = targetTheme
        this.currentTheme = targetTheme
      } else {
        // 兜底：切换到 default 的对应模式
        const fallbackTheme = `default-${targetSuffix}`
        if (availableThemes.includes(fallbackTheme)) {
          vuetifyTheme.global.name.value = fallbackTheme
          this.currentTheme = fallbackTheme
        }
      }
    },
    
    /**
     * 重置主题到配置的默认值
     */
    resetToDefaultTheme(vuetifyTheme) {
      const defaultTheme = vuetifyConfig.theme.defaultTheme
      vuetifyTheme.global.name.value = defaultTheme
      this.currentTheme = defaultTheme
    }
  },
  
  // 开启持久化存储（自动保存到 localStorage）
  persist: true
})