// src/store/theme.js
import { defineStore } from 'pinia'
import { themeConfig } from '@/plugins/theme-config'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    currentTheme: themeConfig.defaultTheme
  }),
  
  getters: {
    isDark: (state) => state.currentTheme?.endsWith('-dark') || false,
    
    currentBase: (state) => {
      if (!state.currentTheme) return 'default'
      return state.currentTheme.replace('-light', '').replace('-dark', '')
    }
  },
  
  actions: {
    /**
     * 设置当前主题（直接设置，不验证）
     */
    setTheme(themeName) {
      this.currentTheme = themeName
    },
    
    /**
     * 验证主题是否有效
     * @param {Object} vuetifyTheme - useTheme() 返回的对象
     * @param {string} themeName - 要验证的主题名
     * @returns {boolean}
     */
    isValidTheme(vuetifyTheme, themeName) {
      const availableThemes = Object.keys(vuetifyTheme.themes.value)
      return availableThemes.includes(themeName)
    },
    
    /**
     * 获取有效的主题（如果主题无效，返回默认主题）
     * @param {Object} vuetifyTheme - useTheme() 返回的对象
     * @param {string} themeName - 要验证的主题名
     * @returns {string}
     */
    getValidTheme(vuetifyTheme, themeName) {
      if (this.isValidTheme(vuetifyTheme, themeName)) {
        return themeName
      }
      return themeConfig.defaultTheme
    },
    
    /**
     * 应用主题到 Vuetify 并同步到 Store
     * @param {Object} vuetifyTheme - useTheme() 返回的对象
     * @param {string} themeName - 要应用的主题名
     */
    applyTheme(vuetifyTheme, themeName) {
      const validTheme = this.getValidTheme(vuetifyTheme, themeName)
      vuetifyTheme.global.name.value = validTheme
      this.currentTheme = validTheme
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
     * 初始化主题（从 Store 恢复，应用到 Vuetify）
     * @param {Object} vuetifyTheme - useTheme() 返回的对象
     */
    initTheme(vuetifyTheme) {
      const savedTheme = this.currentTheme
      const defaultTheme = themeConfig.defaultTheme
      
      // 快速路径：保存的主题就是默认主题，直接使用
      if (savedTheme === defaultTheme) {
        vuetifyTheme.global.name.value = defaultTheme
        return
      }
      
      // 验证并应用主题
      this.applyTheme(vuetifyTheme, savedTheme)
    },
    
    /**
     * 重置主题到配置的默认值
     * @param {Object} vuetifyTheme - useTheme() 返回的对象
     */
    resetToDefaultTheme(vuetifyTheme) {
      this.applyTheme(vuetifyTheme, themeConfig.defaultTheme)
    }
  },
  
  persist: true
})