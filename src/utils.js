let loadingPromise = null

export function getPayload() {
  if (!loadingPromise)
    loadingPromise = new Promise((resolve, reject) => {
      if (window.Payload) {
        resolve(window.Payload)
        return
      }

      const s = document.createElement('script')

      s.setAttribute('src', 'https://payload.com/Payload.js')
      s.addEventListener('load', () => resolve(window.Payload))
      s.addEventListener('error', reject)

      document.body.appendChild(s)
    })

  return loadingPromise
}
