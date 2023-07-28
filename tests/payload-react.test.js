import PayloadReact from '../src/payload-react'
import { cleanup, fireEvent, render } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import * as utils from '../src/utils'
import { mount } from 'enzyme'

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
    const Payload = jest.fn()
    Payload.Form = jest.fn()
    global.Payload = Payload

    const form = mount(
      <PayloadReact.form.payment client_token="test_fake_token_1234567">
        <button type="submit">Submit Payment</button>
      </PayloadReact.form.payment>
    )

    expect(form.state('Payload')).toBeDefined()
    expect(form.state('Payload').Form).toMatchSnapshot()
  })

  it('expect state to be updated with Payload when window.Payload does not exists', () => {
    const Payload = jest.fn()
    Payload.Form = jest.fn()

    const getPayloadMock = jest
      .spyOn(utils, 'getPayload')
      .mockImplementation(() => Promise.resolve(Payload))

    const form = mount(
      <PayloadReact.form.payment client_token="test_fake_token_1234567">
        <button type="submit">Submit Payment</button>
      </PayloadReact.form.payment>
    )

    expect(form.state('Payload')).toBeDefined()
  })

  it('expect state to be updated if we send Payload as a prop', () => {
    const Payload = jest.fn()
    Payload.Form = jest.fn()

    const form = mount(
      <PayloadReact.form.payment client_token="test_fake_token_1234567">
        <button type="submit">Submit Payment</button>
      </PayloadReact.form.payment>
    )

    expect(form.state('Payload')).toBeDefined()
    expect(form.state('Payload').Form).toHaveBeenCalled()
  })
})
