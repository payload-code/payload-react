/**
 * Type test for main.d.ts — verifies the type declarations match what the components actually accept.
 * Run: tsc --noEmit --strict --jsx react-jsx -p tests/types/tsconfig.json
 *
 * Lines marked @ts-expect-error MUST fail compilation. Everything else MUST pass.
 */
import {
  AccountNumber,
  Card,
  CardCode,
  CardNumber,
  Checkout,
  Expiry,
  PayloadForm,
  PayloadInput,
  PaymentForm,
  PaymentMethodForm,
  ProcessingAccountForm,
  RoutingNumber,
  openCheckout,
  openProcessingAccountForm,
} from 'payload-react'

;<PayloadInput attr="card_number" />
;<PayloadInput attr="amount" type="hidden" value="100" placeholder="test" />
;<PayloadInput disablePaste onInvalid={(e) => {}} onValid={(e) => {}} />
;<PayloadInput onFocus={(e) => {}} onBlur={(e) => {}} onChange={(e) => {}} />

// PayloadForm: valid usage
;<PayloadForm clientToken="tok_123">
  <PayloadInput attr="amount" />
</PayloadForm>
;<PayloadForm
  clientToken="tok_123"
  autoSubmit
  preventDefaultOnSubmit
  preventSubmitOnEnter
  styles={{ base: {} }}
  payment={{ type: 'payment' }}
  paymentMethod={{ type: 'card' }}
  onProcessing={(e) => {}}
  onProcessed={(e) => {}}
  onAuthorized={(e) => {}}
  onError={(e) => {}}
  onDeclined={(e) => {}}
  onCreated={(e) => {}}
  onSuccess={(e) => {}}
  onInvalid={(e) => {}}
  onValid={(e) => {}}
  onFocus={(e) => {}}
  onBlur={(e) => {}}
  onChange={(e) => {}}
/>

// PayloadForm: invalid usage

// @ts-expect-error — clientToken is required
;<PayloadForm />

// @ts-expect-error — clientToken must be a string
;<PayloadForm clientToken={123} />

// @ts-expect-error — onSuccess must be a function
;<PayloadForm clientToken="tok" onSuccess={12345} />
;<PayloadForm
  clientToken="tok"
  onSuccess={(evt) => {
    // @ts-expect-error — success event has transaction_id, not transaction.id
    evt.transaction.id
  }}
/>

// PaymentForm / PaymentMethodForm: same props as PayloadForm
;<PaymentForm clientToken="tok_123" onSuccess={(e) => {}}>
  <CardNumber />
</PaymentForm>
;<PaymentMethodForm clientToken="tok_123" onCreated={(e) => {}} />

// @ts-expect-error — clientToken is required
;<PaymentForm />

// @ts-expect-error — unknown prop
;<PaymentForm clientToken="tok" onFake={(e) => {}} />

// Convenience input components
;<Card />
;<CardNumber />
;<Expiry />
;<CardCode />
;<RoutingNumber />
;<AccountNumber />
;<CardNumber onInvalid={(e: any) => {}} onValid={(e: any) => {}} />

// ProcessingAccountForm: valid usage
;<ProcessingAccountForm clientToken="tok_123" />
;<ProcessingAccountForm
  clientToken="tok_123"
  form="processing_account"
  legalEntityId="le_123"
  onSuccess={(e) => {}}
  onAccountCreated={(e) => {}}
  onLoaded={(e) => {}}
  onClosed={(e) => {}}
/>

// @ts-expect-error — clientToken is required
;<ProcessingAccountForm />

// @ts-expect-error — unknown prop
;<ProcessingAccountForm clientToken="tok" onFake={(e: any) => {}} />

// Checkout: valid usage
;<Checkout clientToken="tok_123" />
;<Checkout
  clientToken="tok_123"
  form="checkout"
  autoSubmit
  amount={100}
  onProcessed={(e) => {}}
  onAuthorized={(e) => {}}
  onDeclined={(e) => {}}
  onSuccess={(e) => {}}
  onLoaded={(e) => {}}
  onClosed={(e) => {}}
/>

// @ts-expect-error — clientToken is required
;<Checkout />

// @ts-expect-error — unknown prop
;<Checkout clientToken="tok" onFake={(e: any) => {}} />

// openProcessingAccountForm / openCheckout
openProcessingAccountForm({ clientToken: 'tok_123' })
openCheckout({ clientToken: 'tok_123', amount: 100 })
