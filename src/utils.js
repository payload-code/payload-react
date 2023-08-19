export function getPayload() {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')

    s.setAttribute('src', 'https://payload.co/Payload.js')
    s.addEventListener('load', resolve)
    s.addEventListener('error', reject)

    document.body.appendChild(s)
  })
}
