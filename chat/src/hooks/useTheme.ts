import type { GlobalThemeOverrides } from 'naive-ui'
import { computed, watch } from 'vue'
import { darkTheme, useOsTheme } from 'naive-ui'
import { useAppStore } from '@/store'

export function useTheme() {
  const appStore = useAppStore()

  const OsTheme = useOsTheme()

  const isDark = computed(() => {
    if (appStore.theme === 'auto')
      return OsTheme.value === 'dark'
    else
      return appStore.theme === 'dark'
  })

  const theme = computed(() => {
    return isDark.value ? darkTheme : undefined
  })

  const themeOverrides = computed<GlobalThemeOverrides>(() => {
    if (isDark.value) {
      return {
        common: {},
      }
    }
    return {
      common: {
        primaryColor: '#409eff',
      },
    }
  })

  const darkThemeOverrides: GlobalThemeOverrides = {
    common: {
			primaryColor: '#5A91FCFF',
			primaryColorHover: '#3074F8FF',
			primaryColorPressed: '#3671E4FF',
			baseColor: '#ffffff',
    },
    Layout: {
      // color: '#101014FF',
      // siderColor: '#2F2E34',
    },
  }

  const lightThemeOverrides: GlobalThemeOverrides = {
    common: {
			primaryColor: '#5A91FCFF',
			primaryColorHover: '#3074F8FF',
			primaryColorPressed: '#3671E4FF'
    },
    Layout: {
      // color: '#F7F9FAFF',
      // siderColor: '#EAF3F0FF',
    },
  }

  watch(
    () => isDark.value,
    (dark) => {
      if (dark)
        document.documentElement.classList.add('dark')
      else
        document.documentElement.classList.remove('dark')
    },
    { immediate: true },
  )

  return { theme, themeOverrides, lightThemeOverrides, darkThemeOverrides }
}
