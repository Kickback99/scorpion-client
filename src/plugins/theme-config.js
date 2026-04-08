// src/plugins/theme-config.js
import defaultThemes from './default-theme'

// 集中管理所有主题配置
export const themeConfig = {
  defaultTheme: 'scorpion-light',  // 在这里定义默认主题
  themes: {
    'default-light': defaultThemes['default-light'],
    'default-dark': defaultThemes['default-dark'],
    'scorpion-light': {
      dark: false,
      colors: {
        primary: '#1976D2',
        secondary: '#EDEDED',
        customBlue: '#2196F3',
        background: '#f5f5f5',
        surface: '#FFFFFF',
        error:'#7AC7FA'
      }
    },
    'scorpion-dark': {
      dark: true,
      colors: {
        primary: '#2196F3',
        secondary:'#737373',
        customBlue: '#f0f',
        background: '#121212',
        surface: '#1E1E1E',
        error:'#005B97'
      }
    }
  }
}