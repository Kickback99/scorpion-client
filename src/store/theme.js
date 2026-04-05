// src/store/theme.js
import { defineStore } from 'pinia'

/**
 * 主题管理 Store
 * 负责应用的主题切换、持久化存储等功能
 */
export const useThemeStore = defineStore('theme', {
  state: () => ({
    // 当前主题名称：'light' 或 'dark'
    currentTheme: 'light'
  }),
  
  getters: {
    /**
     * 判断当前是否为深色模式
     * @returns {boolean} true-深色模式，false-浅色模式
     */
    isDark: (state) => state.currentTheme === 'dark',
    
    /**
     * 获取当前主题名称
     * @returns {string} 'light' 或 'dark'
     */
    themeName: (state) => state.currentTheme,
    
    /**
     * 获取下一个主题名称（用于切换）
     * @returns {string} 'light' 或 'dark'
     */
    nextTheme: (state) => state.currentTheme === 'light' ? 'dark' : 'light'
  },
  
  actions: {
    /**
     * 切换主题（light <-> dark）
     * 会自动保存到 localStorage
     */
    toggleTheme() {
      this.currentTheme = this.nextTheme
    },
    
    /**
     * 设置主题为浅色模式
     */
    setLightTheme() {
      this.currentTheme = 'light'
    },
    
    /**
     * 设置主题为深色模式
     */
    setDarkTheme() {
      this.currentTheme = 'dark'
    },
    
    /**
     * 设置主题（通用方法）
     * @param {string} theme - 'light' 或 'dark'
     */
    setTheme(theme) {
      if (theme === 'light' || theme === 'dark') {
        this.currentTheme = theme
      } else {
        console.warn(`Invalid theme: ${theme}. Use 'light' or 'dark'`)
      }
    },
    
    /**
     * 重置主题为默认值（浅色模式）
     */
    resetTheme() {
      this.currentTheme = 'light'
    },
    
    /**
     * 清除所有主题数据（重置 store）
     */
    clearThemeStore() {
      this.$reset()
    }
  },
  
  // 开启持久化存储（自动保存到 localStorage）
  persist: true
})