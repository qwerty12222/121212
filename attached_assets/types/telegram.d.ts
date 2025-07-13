declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void
        close: () => void
        expand: () => void
        showAlert: (message: string) => void
        showConfirm: (message: string, callback: (confirmed: boolean) => void) => void
        showPopup: (
          params: {
            title?: string
            message: string
            buttons?: Array<{
              id?: string
              type?: "default" | "ok" | "close" | "cancel" | "destructive"
              text: string
            }>
          },
          callback?: (buttonId: string) => void,
        ) => void
        initDataUnsafe: {
          user?: {
            id: number
            first_name: string
            last_name?: string
            username?: string
            photo_url?: string
            language_code?: string
          }
          start_param?: string
        }
        themeParams: {
          bg_color?: string
          text_color?: string
          hint_color?: string
          link_color?: string
          button_color?: string
          button_text_color?: string
          secondary_bg_color?: string
        }
        version: string
        platform: string
        colorScheme: "light" | "dark"
        isExpanded: boolean
        viewportHeight: number
        viewportStableHeight: number
        headerColor: string
        backgroundColor: string
        isClosingConfirmationEnabled: boolean
        BackButton: {
          isVisible: boolean
          show: () => void
          hide: () => void
          onClick: (callback: () => void) => void
          offClick: (callback: () => void) => void
        }
        MainButton: {
          text: string
          color: string
          textColor: string
          isVisible: boolean
          isActive: boolean
          isProgressVisible: boolean
          setText: (text: string) => void
          onClick: (callback: () => void) => void
          offClick: (callback: () => void) => void
          show: () => void
          hide: () => void
          enable: () => void
          disable: () => void
          showProgress: (leaveActive?: boolean) => void
          hideProgress: () => void
          setParams: (params: {
            text?: string
            color?: string
            text_color?: string
            is_active?: boolean
            is_visible?: boolean
          }) => void
        }
        HapticFeedback: {
          impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void
          notificationOccurred: (type: "error" | "success" | "warning") => void
          selectionChanged: () => void
        }
      }
    }
  }
}

export {}
