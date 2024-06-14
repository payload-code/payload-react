import '@testing-library/jest-dom'
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mount, shallow } from 'enzyme'
import React, { useState } from 'react'
import { act } from 'react-dom/test-utils'

import PayloadReact, {
  CardCode,
  CardNumber,
  Checkout,
  Expiry,
  PayloadInput,
  PaymentForm,
  ProcessingAccountForm,
  openCheckout,
  openProcessingAccountForm,
} from '../../../src/payload-react'
import * as utils from '../../../src/utils'

describe('PayloadReact', () => {
  it('testpaste enable', async () => {
    console.log('testpaste')

    const Test = () => {
      return (
        <PaymentForm clientToken="test_fake_token_12345679">
          <CardNumber id="card-number" />
          <button type="submit">Submit Payment</button>
        </PaymentForm>
      )
    }

    const el = document.createElement('div')
    document.body.appendChild(el)

    render(<Test />, { container: el })

    await waitFor(() => {
      const script = document.querySelector('script')
      expect(script).toBeTruthy()
    })

    await waitFor(
      () => {
        const iframe = document.querySelector('#card-number iframe')
        expect(iframe).toBeTruthy()
        expect(
          (iframe.contentDocument || iframe.contentWindow.document)?.readyState
        ).toBe('complete')
      },
      { timeout: 5000 }
    )

    const iframe = document.querySelector('#card-number iframe')
    const iframeContent =
      iframe.contentDocument || iframe.contentWindow.document
    const input = iframeContent.querySelector('input')
    expect(input).toBeTruthy()

    input.focus()
    expect(input).toHaveFocus()
    userEvent.paste('4111', { document: iframeContent })
    expect(input).toHaveValue('4111')
  })
})
