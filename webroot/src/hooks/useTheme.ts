import type { GlobalThemeOverrides } from 'naive-ui'
import { computed, watch } from 'vue'
import { darkTheme, useOsTheme } from 'naive-ui'
import { useAppStore } from '@/store'

// 全局修改系统主题颜色
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

	// 覆盖默认样式，深色主题
  const darkThemeOverrides: GlobalThemeOverrides = {
    common: {
			primaryColor: '#5A91FCFF',
			primaryColorHover: '#3074F8FF',
			primaryColorPressed: '#3671E4FF',
            // borderColor: "#5A91FCFF",
			baseColor: '#ffffff',
			// inputColor: '#282848',

			// modalColor: '#3E3E64',
			modalColor: '#15171A',

			// bodyColor: '#1F1F38',
			bodyColor: '#15171A',
			tableHeaderColor: '#282848',
			tableColor: '#282848',
			tableColorHover: '#282848',
			tableColorStriped: '#282848',


    },
    Layout: {
      // color: '#101014FF',
      // siderColor: '#2F2E34',
    },
		Table: {
			borderColor: "#282848",
			borderColorModal: "#282848",
			borderColorPopover: "#282848",
			tdColor: "#282848",
			thColor: "#282848",
			thTextColor:"#282848",
			tdTextColor: "#282848",
		},
		Collapse: {

		}
  }

	// 覆盖默认样式，浅色主题
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
