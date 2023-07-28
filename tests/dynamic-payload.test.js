import { getPayload } from '../src/utils'

describe('Payload.js', () => {
  it.skip('should load', async () => {
    global.document.body.innerHTML = '<div></div>'

    jest.spyOn(global.document.body, 'appendChild')
    await getPayload()
    expect(document.body.appendChild).toHaveBeenCalled()
  })
})
