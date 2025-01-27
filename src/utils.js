let loadingPromise = null

const __clsCache = {}

/**
 * Retrieves the Payload object asynchronously.
 *
 * This function checks if the Payload object is already available in the window. If not, it dynamically loads the Payload.js script from 'https://payload.com/Payload.js'.
 *
 * @returns {Promise} A Promise that resolves with the Payload object once it is available.
 * @throws {Error} If there is an error loading the Payload.js script.
 */
export function getPayload() {
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
        reject()
      })

      document.body.appendChild(s)
    })

  return loadingPromise
}

/**
 * Inverts the key-value pairs of an object.
 *
 * @param {Object} obj - The object to invert.
 * @returns {Object} - The inverted object with keys and values swapped.
 */
export function invertObject(obj) {
  return Object.entries(obj).reduce((a, [k, v]) => ({ ...a, [v]: k }), {})
}

/**
 * Extracts and returns a new object containing all properties of the input object,
 * except for the 'children' property and any properties specified in the 'ignore' array.
 *
 * @param {Object} props - The input object containing properties to extract.
 * @param {Array} ignore - An optional array of property names to ignore and not
 *                         include in the returned object.
 * @returns {Object} - A new object containing all properties of the input object,
 *                     except for the 'children' property and any properties specified
 *                     in the 'ignore' array.
 */
export function getPropAttrs(props, ignore) {
  const attrs = {}
  for (const key in props) {
    if (key == 'children') continue
    if (ignore && ignore.includes(key)) continue
    attrs[key] = props[key]
  }
  return attrs
}

export function cacheCls(name, cls) {
  if (!(name in __clsCache)) __clsCache[name] = cls
  return __clsCache[name]
}
