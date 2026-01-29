declare global {
  interface Window {
    kofiwidget2?: {
      init: (text: string, color: string, id: string) => void
      draw: () => void
    }
    datafast?: (event: string) => void
  }
}

export {}
