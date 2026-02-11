import PayloadReact, {
  Checkout,
  PaymentForm,
  ProcessingAccountForm,
  openCheckout,
  openProcessingAccountForm,
} from 'payload-react'
import React from 'react'

const form = (
  <PaymentForm
    clientToken="test_token"
    autoSubmit={false}
    onSuccess={(evt) => {
      const id = evt.transaction_id
      void id
    }}>
    <button type="submit">Pay</button>
  </PaymentForm>
)

const checkout = (
  <Checkout
    clientToken="test_token"
    amount={10}
    onSuccess={(evt) => {
      const maybeTransaction = evt.transaction
      void maybeTransaction
    }}
  />
)

const processing = (
  <ProcessingAccountForm
    clientToken="test_token"
    legalEntityId="le_123"
    onAccountCreated={() => undefined}
  />
)

void form
void checkout
void processing

void PayloadReact.input.card_number
void PayloadReact.select.states
void PayloadReact.form.payment

void openCheckout({
  clientToken: 'test_token',
  amount: 12.34,
  onProcessed: () => undefined,
})

void openProcessingAccountForm({
  clientToken: 'test_token',
  legalEntityId: 'le_123',
  onSuccess: () => undefined,
})

// @ts-expect-error - invalid checkout prop should fail.
;<Checkout clientToken="test_token" publishableKey="pk_123" />

// @ts-expect-error - clientToken must be a string.
;<PaymentForm clientToken={123} />
