import '@testing-library/jest-dom'
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import { mount, shallow } from 'enzyme'
import React, { useState } from 'react'
import { act } from 'react-dom/test-utils'

import PayloadReact, {
  CardCode,
  CardNumber,
  Expiry,
  PayloadInput,
  PaymentForm,
  ProcessingAccountForm,
  openProcessingAccountForm,
} from '../src/payload-react'
import * as utils from '../src/utils'

afterEach(() => {
  delete global.Payload
})

const toCamel = (s) => {
  return s.replace(/([-_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace('-', '').replace('_', '')
  })
}
const getReactEvtName = (evt) =>
  'on' + evt.charAt(0).toUpperCase() + toCamel(evt.slice(1))

function mockPayload() {
  const Payload = jest.fn()
  Payload.Form = jest.fn().mockImplementation(() => {
    return { on: jest.fn() }
  })
  Payload.ProcessingAccount = jest.fn().mockImplementation(() => {
    return { on: jest.fn() }
  })
  return Payload
}

describe('PayloadReact', () => {
  beforeEach(() => {
    cleanup()
    jest.clearAllMocks()
  })

  it('renders .input', () => {
    const onChangedMock = jest.fn()
    const { getByRole } = render(
      <PayloadReact.input.amount
        value="10.00"
        onChange={onChangedMock}
        type="text"
      />
    )
    const input = getByRole('textbox')

    expect(input).toHaveValue('10.00')

    fireEvent.change(input, { target: { value: '11.00' } })

    expect(onChangedMock).toHaveBeenCalled()
  })

  it('renders .select', () => {
    const onChangedMock = jest.fn()
    const { getByRole } = render(
      <PayloadReact.select.states onChange={onChangedMock} defaultValue="NY">
        <option value="NY">New York</option>
        <option value="TX">Texas</option>
      </PayloadReact.select.states>
    )

    const select = getByRole('combobox')
    const option = getByRole('option', { name: 'New York' })
    expect(select).toHaveValue('NY')
    expect(option.selected).toBeTruthy()
  })

  it('expect state to be updated with Payload when window.Payload exists', () => {
    const Payload = mockPayload()
    global.Payload = Payload

    const getPayloadMock = jest.spyOn(utils, 'getPayload')

    const form = mount(
      <PayloadReact.form.payment clientToken="test_fake_token_1234567">
        <button type="submit">Submit Payment</button>
      </PayloadReact.form.payment>
    )

    expect(getPayloadMock).not.toHaveBeenCalled()
    expect(form.state('Payload')).toBeDefined()
    expect(form.state('Payload')).toHaveBeenCalledWith(
      'test_fake_token_1234567'
    )
    expect(form.state('Payload').Form).toMatchSnapshot()
  })

  it('expect state to be updated with Payload when window.Payload does not exists', async () => {
    const Payload = mockPayload()

    const getPayloadMock = jest
      .spyOn(utils, 'getPayload')
      .mockImplementation(() => {
        global.Payload = Payload
        return Promise.resolve()
      })

    const form = mount(
      <PayloadReact.form.payment clientToken="test_fake_token_1234567">
        <button type="submit">Submit Payment</button>
      </PayloadReact.form.payment>
    )

    expect(getPayloadMock).toHaveBeenCalled()

    await waitFor(() => {
      expect(form.state('Payload')).toBeTruthy()
    })

    expect(form.state('Payload')).toBeDefined()
    expect(form.state('Payload')).toHaveBeenCalledWith(
      'test_fake_token_1234567'
    )
    expect(form.state('Payload').Form).toHaveBeenCalled()
  })

  it('expect state to be updated if we send Payload as a prop', () => {
    const Payload = mockPayload()

    const getPayloadMock = jest.spyOn(utils, 'getPayload')

    const form = mount(
      <PayloadReact.form.payment
        clientToken="test_fake_token_1234567"
        Payload={Payload}>
        <button type="submit">Submit Payment</button>
      </PayloadReact.form.payment>
    )

    expect(getPayloadMock).not.toHaveBeenCalled()
    expect(form.state('Payload')).toBeDefined()
    expect(form.state('Payload')).toHaveBeenCalledWith(
      'test_fake_token_1234567'
    )
    expect(form.state('Payload').Form).toHaveBeenCalled()
  })

  it('expect props to pass to Payload.Form initialization for payment form', async () => {
    const Payload = mockPayload()

    const getPayloadMock = jest
      .spyOn(utils, 'getPayload')
      .mockImplementation(() => {
        global.Payload = Payload
        return Promise.resolve()
      })

    const form = mount(
      <PayloadReact.form.payment
        clientToken="test_fake_token_1234567"
        autoSubmit={false}
        styles={{ invalid: 'is-invalid' }}
        payment={{ status: 'authorized' }}>
        <button type="submit">Submit Payment</button>
      </PayloadReact.form.payment>
    )

    await waitFor(() => {
      expect(form.state('Payload')).toBeTruthy()
    })

    expect(form.state('Payload')).toHaveBeenCalledWith(
      'test_fake_token_1234567'
    )
    expect(form.state('Payload').Form).toHaveBeenCalledWith({
      autosubmit: false,
      styles: { invalid: 'is-invalid' },
      payment: { status: 'authorized' },
      form: expect.anything(),
    })
  })

  it('expect props to pass to Payload.Form initialization for payment method form', async () => {
    const Payload = mockPayload()

    const getPayloadMock = jest
      .spyOn(utils, 'getPayload')
      .mockImplementation(() => {
        global.Payload = Payload
        return Promise.resolve()
      })

    const form = mount(
      <PayloadReact.form.payment_method
        clientToken="test_fake_token_1234567"
        autoSubmit={false}
        styles={{ invalid: 'is-invalid' }}
        paymentMethod={{ customet_id: '12345' }}>
        <button type="submit">Submit Payment</button>
      </PayloadReact.form.payment_method>
    )

    await waitFor(() => {
      expect(form.state('Payload')).toBeTruthy()
    })

    expect(form.state('Payload')).toHaveBeenCalledWith(
      'test_fake_token_1234567'
    )
    expect(form.state('Payload').Form).toHaveBeenCalledWith({
      autosubmit: false,
      styles: { invalid: 'is-invalid' },
      payment_method: { customet_id: '12345' },
      form: expect.anything(),
    })
  })

  it('expect event props to pass to Payload.Form.on', async () => {
    const Payload = mockPayload()

    const getPayloadMock = jest
      .spyOn(utils, 'getPayload')
      .mockImplementation(() => {
        global.Payload = Payload
        return Promise.resolve()
      })

    const events = {
      onProcessing: jest.fn(),
      onProcessed: jest.fn(),
      onAuthorized: jest.fn(),
      onError: jest.fn(),
      onDeclined: jest.fn(),
      onCreated: jest.fn(),
      onSuccess: jest.fn(),
      onInvalid: jest.fn(),
      onValid: jest.fn(),
      onFocus: jest.fn(),
      onBlur: jest.fn(),
      onChanged: jest.fn(),
    }

    const form = mount(
      <PayloadReact.form.payment
        clientToken="test_fake_token_1234567"
        {...events}>
        <button type="submit">Submit Payment</button>
      </PayloadReact.form.payment>
    )

    await waitFor(() => {
      expect(form.state('Payload')).toBeTruthy()
    })

    expect(form.state('Payload')).toHaveBeenCalledWith(
      'test_fake_token_1234567'
    )
    expect(
      form.state('Payload').Form.mock.results[0].value.on.mock.calls
    ).toEqual(
      Object.entries(events).map(([evt, cb]) => [
        evt.toLowerCase().substr(2),
        expect.anything(),
      ])
    )
  })

  it('expect input event props to propagate to PayloadInput', async () => {
    const Payload = mockPayload()

    const getPayloadMock = jest
      .spyOn(utils, 'getPayload')
      .mockImplementation(() => {
        global.Payload = Payload
        return Promise.resolve()
      })

    const cardNumberEvents = {
      onInvalid: jest.fn(),
      onValid: jest.fn(),
      onFocus: jest.fn(),
      onBlur: jest.fn(),
    }

    const expiryEvents = {
      onInvalid: jest.fn(),
      onValid: jest.fn(),
      onFocus: jest.fn(),
      onBlur: jest.fn(),
    }

    const form = mount(
      <PaymentForm clientToken="test_fake_token_1234567">
        <CardNumber id="card-number" {...cardNumberEvents} />
        <Expiry id="expiry" {...expiryEvents} />
        <button type="submit">Submit Payment</button>
      </PaymentForm>
    )

    await waitFor(() => {
      expect(Payload).toHaveBeenCalledWith('test_fake_token_1234567')
      expect(form.find('#card-number').exists()).toBe(true)
    })

    const cardNumber = form.find('#card-number').at(1).instance()
      .inputRef.current
    const expiry = form.find('#expiry').at(1).instance().inputRef.current

    Payload.Form.mock.results[0].value.on.mock.calls.forEach(([evt, cb]) => {
      const evtName = getReactEvtName(evt)

      new Array(
        [cardNumber, cardNumberEvents, expiryEvents],
        [expiry, expiryEvents, cardNumberEvents]
      ).forEach(([el, triggeredEvents, skippedEvents]) => {
        if (!(evtName in triggeredEvents)) return

        expect(triggeredEvents[evtName]).not.toHaveBeenCalled()
        expect(skippedEvents[evtName]).not.toHaveBeenCalled()

        const eventObject = { target: el }

        cb(eventObject)

        expect(triggeredEvents[evtName]).toHaveBeenCalledWith(eventObject)
        expect(skippedEvents[evtName]).not.toHaveBeenCalled()

        triggeredEvents[evtName].mockClear()
        skippedEvents[evtName].mockClear()
      })
    })
  })

  it('expect input event props to PayloadInput to unregister when unmounted', async () => {
    const Payload = mockPayload()

    const getPayloadMock = jest
      .spyOn(utils, 'getPayload')
      .mockImplementation(() => {
        global.Payload = Payload
        return Promise.resolve()
      })

    const onInvalid = jest.fn()

    const Test = () => {
      const [hideInput, setHideInput] = useState(false)

      return (
        <PaymentForm clientToken="test_fake_token_1234567">
          {!hideInput && (
            <CardNumber
              id="card-number"
              onInvalid={(evt) => {
                onInvalid(evt)
                setHideInput(true)
              }}
            />
          )}
          <button type="submit">Submit Payment</button>
        </PaymentForm>
      )
    }

    const form = mount(<Test />)

    await waitFor(() => {
      expect(Payload).toHaveBeenCalledWith('test_fake_token_1234567')
      expect(form.find('#card-number').exists()).toBe(true)
    })

    const cardNumberWrapper = form.find('#card-number').at(1)
    const cardNumber = cardNumberWrapper.instance().inputRef.current

    const [evt, cb] = Payload.Form.mock.results[0].value.on.mock.calls.find(
      ([evt, cb]) => evt === 'invalid'
    )

    expect(onInvalid).not.toHaveBeenCalled()

    const eventObject = { target: cardNumber }

    act(() => cb(eventObject))

    expect(onInvalid).toHaveBeenCalledWith(eventObject)

    onInvalid.mockClear()

    expect(onInvalid).not.toHaveBeenCalled()

    act(() => cb(eventObject))

    expect(onInvalid).not.toHaveBeenCalled()
  })

  it('expect input event props to PayloadInput to update when rerendered', async () => {
    const Payload = mockPayload()

    const getPayloadMock = jest
      .spyOn(utils, 'getPayload')
      .mockImplementation(() => {
        global.Payload = Payload
        return Promise.resolve()
      })

    let invalidCountValue = 0

    const Test = () => {
      const [invalidCount, setInvalidCount] = useState(0)

      invalidCountValue = invalidCount

      return (
        <PaymentForm clientToken="test_fake_token_1234567">
          <CardNumber
            id="card-number"
            onInvalid={(evt) => {
              setInvalidCount(invalidCount + 1)
            }}
          />
          <button type="submit">Submit Payment</button>
        </PaymentForm>
      )
    }

    const form = mount(<Test />)

    await waitFor(() => {
      expect(Payload).toHaveBeenCalledWith('test_fake_token_1234567')
      expect(form.find('#card-number').exists()).toBe(true)
    })

    const cardNumberWrapper = form.find('#card-number').at(1)
    const cardNumber = cardNumberWrapper.instance().inputRef.current

    const [evt, cb] = Payload.Form.mock.results[0].value.on.mock.calls.find(
      ([evt, cb]) => evt === 'invalid'
    )

    expect(invalidCountValue).toBe(0)

    const eventObject = { target: cardNumber }

    act(() => cb(eventObject))

    expect(invalidCountValue).toBe(1)

    act(() => cb(eventObject))

    expect(invalidCountValue).toBe(2)
  })

  it.each([
    ['card_number', true],
    ['amount', false],
  ])(
    'expect input to render differently based on secure type',
    (inputName, secure) => {
      const { container } = render(<PayloadInput attr={inputName} />)

      if (secure)
        expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="pl-input pl-input-sec"
    pl-input="${inputName}"
  />
</div>
`)
      else
        expect(container).toMatchInlineSnapshot(`
<div>
  <input
    class="pl-input"
    pl-input="${inputName}"
  />
</div>
`)
    }
  )

  it('expect ProcessingAccountForm event props to fire', async () => {
    const Payload = mockPayload()

    const getPayloadMock = jest
      .spyOn(utils, 'getPayload')
      .mockImplementation(() => {
        global.Payload = Payload
        return Promise.resolve()
      })

    const processingFormEvents = {
      onSuccess: jest.fn(),
      onAccountCreated: jest.fn(),
      onLoaded: jest.fn(),
      onClosed: jest.fn(),
    }

    const form = mount(
      <ProcessingAccountForm
        id="processing-form"
        clientToken="test_fake_token_1234567"
        {...processingFormEvents}
      />
    )

    await waitFor(() => {
      expect(Payload).toHaveBeenCalledWith('test_fake_token_1234567')
      expect(form.instance().procFormRef.current).not.toBeUndefined()
    })

    const processingForm = form.instance().procFormRef.current

    expect(
      Payload.ProcessingAccount.mock.results[0].value.on.mock.calls.length
    ).toBe(Object.keys(processingFormEvents).length)
    Payload.ProcessingAccount.mock.results[0].value.on.mock.calls.forEach(
      ([evt, cb]) => {
        const evtName = getReactEvtName(evt)

        if (!(evtName in processingFormEvents)) return

        expect(processingFormEvents[evtName]).not.toHaveBeenCalled()

        const eventObject = { target: processingForm }

        cb(eventObject)

        expect(processingFormEvents[evtName]).toHaveBeenCalledWith(eventObject)

        processingFormEvents[evtName].mockClear()
      }
    )
  })

  it('expect ProcessingAccountForm event props to update when rerendered', async () => {
    const Payload = mockPayload()

    const getPayloadMock = jest
      .spyOn(utils, 'getPayload')
      .mockImplementation(() => {
        global.Payload = Payload
        return Promise.resolve()
      })

    let successCountValue = 0

    const Test = () => {
      const [successCount, setSuccessCount] = useState(0)

      successCountValue = successCount

      return (
        <ProcessingAccountForm
          id="processing-form"
          clientToken="test_fake_token_1234567"
          onSuccess={(evt) => {
            setSuccessCount(successCount + 1)
          }}
        />
      )
    }

    const form = mount(<Test />)

    await waitFor(() => {
      expect(Payload).toHaveBeenCalledWith('test_fake_token_1234567')
    })

    const [evt, cb] =
      Payload.ProcessingAccount.mock.results[0].value.on.mock.calls.find(
        ([evt, cb]) => evt === 'success'
      )

    expect(successCountValue).toBe(0)

    const eventObject = { target: {} }

    act(() => cb(eventObject))

    expect(successCountValue).toBe(1)

    act(() => cb(eventObject))

    expect(successCountValue).toBe(2)
  })

  it('expect ProcessingAccountForm init props to pass to Payload.ProcessingAccount', async () => {
    const Payload = mockPayload()

    const getPayloadMock = jest
      .spyOn(utils, 'getPayload')
      .mockImplementation(() => {
        global.Payload = Payload
        return Promise.resolve()
      })

    const processingFormEvents = {
      onSuccess: jest.fn(),
      onAccountCreated: jest.fn(),
      onLoaded: jest.fn(),
      onClosed: jest.fn(),
    }

    const form = mount(
      <ProcessingAccountForm
        id="processing-form"
        className="example"
        clientToken="test_fake_token_1234567"
        legalEntityId="le_example"
      />
    )

    await waitFor(() => {
      expect(Payload).toHaveBeenCalledWith('test_fake_token_1234567')
      expect(form.instance().procFormRef.current).not.toBeUndefined()
    })

    const processingForm = form.instance().procFormRef.current
    expect(Payload.ProcessingAccount.mock.calls[0]).toEqual([
      {
        container: expect.any(HTMLElement),
        legal_entity_id: 'le_example',
      },
    ])
    expect(Payload.ProcessingAccount.mock.calls[0][0].container).toBe(
      processingForm
    )
  })

  it('expect ProcessingAccountForm to render html props on div', async () => {
    const { container } = render(
      <ProcessingAccountForm
        clientToken="test_fake_token_1234567"
        className="example"
        legalEntityId="le_example"
      />
    )

    expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="example"
  />
</div>
`)
  })

  it('expect openProcessingAccountForm init props to pass to Payload.ProcessingAccount', async () => {
    const Payload = mockPayload()

    const getPayloadMock = jest
      .spyOn(utils, 'getPayload')
      .mockImplementation(() => {
        global.Payload = Payload
        return Promise.resolve()
      })

    const processingFormEvents = {
      onSuccess: jest.fn(),
      onAccountCreated: jest.fn(),
      onLoaded: jest.fn(),
      onClosed: jest.fn(),
    }

    const processingForm = await openProcessingAccountForm({
      clientToken: 'test_fake_token_1234567',
      legalEntityId: 'le_example',
      ...processingFormEvents,
    })

    await waitFor(() => {
      expect(Payload).toHaveBeenCalledWith('test_fake_token_1234567')
    })

    expect(Payload.ProcessingAccount.mock.calls[0]).toEqual([
      {
        legal_entity_id: 'le_example',
      },
    ])

    expect(
      Payload.ProcessingAccount.mock.results[0].value.on.mock.calls.length
    ).toBe(Object.keys(processingFormEvents).length)
    Payload.ProcessingAccount.mock.results[0].value.on.mock.calls.forEach(
      ([evt, cb]) => {
        const evtName = getReactEvtName(evt)

        expect(cb).toBe(processingFormEvents[evtName])
      }
    )
  })

  it('expect ProcessingAccountForm to render html props on div', async () => {
    const { container } = render(
      <ProcessingAccountForm
        clientToken="test_fake_token_1234567"
        className="example"
        legalEntityId="le_example"
      />
    )

    expect(container).toMatchInlineSnapshot(`
<div>
  <div
    class="example"
  />
</div>
`)
  })
})
