import { getPayload } from '../src/utils'

describe('Payload.js', () => {
  it('should load', () => {
    global.document.body.innerHTML = '<div></div>'

    jest.spyOn(global.document.body, 'appendChild')

    getPayload()
    expect(document.body.appendChild).toHaveBeenCalled()

    const script = document.querySelector('script')
    expect(script.src).toBe('https://payload.co/Payload.js')
  })
})
