'use client'

import Script from 'next/script'

declare global {
  interface Window {
    kofiwidget2?: {
      init: (text: string, color: string, id: string) => void
      draw: () => void
    }
  }
}

export default function KofiWidget() {
  return (
    <div className="kofi-widget">
      <a href='https://ko-fi.com/L3L31T7YLI' target='_blank'>
        <img height='36' style={{ border: '0px', height: '36px' }} src='https://storage.ko-fi.com/cdn/kofi6.png?v=6' alt='Buy Me a Coffee at ko-fi.com' />
      </a>
    </div>
  )
}
