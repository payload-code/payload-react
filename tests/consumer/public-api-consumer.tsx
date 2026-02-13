import {
  Checkout,
  PayloadInput,
  PaymentForm,
  openCheckout,
} from 'payload-react'
import React from 'react'

const valid = (
  <PaymentForm clientToken="client_key_test" onSuccess={() => undefined}>
    <PayloadInput attr="amount" type="hidden" value="10.00" />
    <button type="submit">Pay</button>
  </PaymentForm>
)

void valid

const checkout = (
  <Checkout
    clientToken="client_key_test"
    amount={49.99}
    onDeclined={(evt) => {
      const maybeMessage = evt.message
      void maybeMessage
    }}
  />
)

void checkout

void openCheckout({
  clientToken: 'client_key_test',
  amount: 10,
})

// @ts-expect-error Checkout does not support publishableKey.
;<Checkout clientToken="client_key_test" publishableKey="pk_test_123" />

// @ts-expect-error PaymentForm requires clientToken.
;<PaymentForm />
