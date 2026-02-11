import type { PayloadSdkFn } from './types'

let loadingPromise: Promise<PayloadSdkFn | undefined> | null = null

const __clsCache: Record<string, unknown> = {}

declare global {
  interface Window {
    Payload?: PayloadSdkFn
  }
}

/**
 * Retrieves the Payload object asynchronously.
 */
export function getPayload(): Promise<PayloadSdkFn | undefined> {
  if (!loadingPromise)
    loadingPromise = new Promise((resolve, reject) => {
      if (window.Payload) {
        resolve(window.Payload)
        return
      }

      const s = document.createElement('script')

      s.setAttribute('src', 'https://payload.com/Payload.js')
      s.addEventListener('load', () => {
        loadingPromise = null
        resolve(window.Payload)
      })
      s.addEventListener('error', () => {
        loadingPromise = null
        reject(new Error('Failed to load Payload.js'))
      })

      document.body.appendChild(s)
    })

  return loadingPromise
}

export function invertObject(
  obj: Record<string, string>
): Record<string, string> {
  return Object.entries(obj).reduce(
    (a, [k, v]) => ({ ...a, [v]: k }),
    {} as Record<string, string>
  )
}

export function getPropAttrs<T extends Record<string, unknown>>(
  props: T,
  ignore?: readonly string[]
): Record<string, unknown> {
  const attrs: Record<string, unknown> = {}
  for (const key in props) {
    if (key === 'children') continue
    if (ignore && ignore.includes(key)) continue
    attrs[key] = props[key]
  }
  return attrs
}

export function cacheCls<T>(name: string, cls: T): T {
  if (!(name in __clsCache)) __clsCache[name] = cls
  return __clsCache[name] as T
}
