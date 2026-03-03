declare module 'payload-react' {
  import { Component, ReactElement, ReactNode, RefAttributes } from 'react'

  export interface PayloadFormSuccessEvent {
    type: 'success'
    transaction_id?: string
    payment_method_id?: string
    account?: { id: string }
  }
  export interface PayloadFormProcessedEvent {
    type: 'processed'
    transaction_id: string
  }
  export interface PayloadFormAuthorizedEvent {
    type: 'authorized'
    transaction_id: string
  }
  export interface PayloadFormDeclinedEvent {
    type: 'declined'
    transaction_id?: string
    message?: string
    error_type?: string
    error_description?: string
    status_code?: string
  }
  export interface PayloadCheckoutDeclinedEvent {
    type: 'declined'
    transaction_id?: string
    message?: string
    payments_attempted?: number
  }
  export interface PayloadErrorEvent {
    type: 'error'
    message?: string
    error_type?: string
    error_description?: string
  }
  export interface PayloadFormCreatedEvent {
    type: 'created'
    payment_method_id: string
  }
  export interface PayloadFormUpdatedEvent {
    type: 'updated'
    payment_method_id?: string
  }
  export interface PayloadAccountCreatedEvent {
    type: 'account_created'
    account: { id: string }
  }
  export interface PayloadInvalidEvent {
    type: 'invalid'
    message?: string
    invalid?: Record<string, string>
    live?: boolean
    target?: HTMLElement
    /** Field name or identifier for the invalid input */
    field?: string
  }
  export interface PayloadValidEvent {
    type: 'valid'
    live?: boolean
    target?: HTMLElement
    /** Field name or identifier for the valid input */
    field?: string
  }
  export interface PayloadChangeEvent {
    type: 'change'
    value?: string
    form_id?: string
    target?: HTMLElement
  }
  export interface PayloadFocusEvent {
    type: 'focus'
    target?: HTMLElement
  }
  export interface PayloadBlurEvent {
    type: 'blur'
    target?: HTMLElement
  }
  export interface PayloadLoadedEvent {
    type: 'loaded'
  }
  export interface PayloadClosedEvent {
    type: 'closed'
  }
  export interface PayloadProcessingEvent {
    type: 'processing'
  }

  // PayloadInput

  interface PayloadInputProps {
    attr?: string
    'pl-input'?: string
    disablePaste?: boolean
    onInvalid?: (evt: PayloadInvalidEvent) => void
    onValid?: (evt: PayloadValidEvent) => void
    onFocus?: (evt: PayloadFocusEvent) => void
    onBlur?: (evt: PayloadBlurEvent) => void
    onChange?: (evt: PayloadChangeEvent) => void
    type?: string
    value?: string
    placeholder?: string
    className?: string
    [key: string]: any // allow pass-through HTML attrs
  }

  export class PayloadInput extends Component<PayloadInputProps> {}

  // PayloadForm

  interface PayloadFormProps {
    clientToken: string
    Payload?: any
    autoSubmit?: boolean
    styles?: Record<string, any>
    payment?: Record<string, any>
    paymentMethod?: Record<string, any>
    preventDefaultOnSubmit?: boolean
    preventSubmitOnEnter?: boolean
    onProcessing?: (evt: PayloadProcessingEvent) => void
    onProcessed?: (evt: PayloadFormProcessedEvent) => void
    onAuthorized?: (evt: PayloadFormAuthorizedEvent) => void
    onError?: (evt: PayloadErrorEvent) => void
    onDeclined?: (evt: PayloadFormDeclinedEvent) => void
    onCreated?: (evt: PayloadFormCreatedEvent) => void
    onSuccess?: (evt: PayloadFormSuccessEvent) => void
    onInvalid?: (evt: PayloadInvalidEvent) => void
    onValid?: (evt: PayloadValidEvent) => void
    onFocus?: (evt: PayloadFocusEvent) => void
    onBlur?: (evt: PayloadBlurEvent) => void
    onChange?: (evt: PayloadChangeEvent) => void
    children?: ReactNode
  }

  export class PayloadForm extends Component<PayloadFormProps> {
    submit(): Promise<any>
  }

  // PaymentForm / PaymentMethodForm (same props as PayloadForm)

  export const PaymentForm: {
    (props: PayloadFormProps & RefAttributes<any>): ReactElement
    displayName?: string
    propTypes?: any
  }

  export const PaymentMethodForm: {
    (props: PayloadFormProps & RefAttributes<any>): ReactElement
    displayName?: string
    propTypes?: any
  }

  // Convenience input components

  type InputComponentProps = Omit<PayloadInputProps, 'pl-input' | 'attr'>

  export function Card(props: InputComponentProps): ReactElement
  export function CardNumber(props: InputComponentProps): ReactElement
  export function Expiry(props: InputComponentProps): ReactElement
  export function CardCode(props: InputComponentProps): ReactElement
  export function RoutingNumber(props: InputComponentProps): ReactElement
  export function AccountNumber(props: InputComponentProps): ReactElement

  // ProcessingAccountForm

  interface ProcessingAccountFormProps {
    clientToken: string
    Payload?: any
    form?: string
    legalEntityId?: string
    onSuccess?: (evt: PayloadFormSuccessEvent) => void
    onAccountCreated?: (evt: PayloadAccountCreatedEvent) => void
    onLoaded?: (evt: PayloadLoadedEvent) => void
    onClosed?: (evt: PayloadClosedEvent) => void
    children?: ReactNode
  }

  export class ProcessingAccountForm extends Component<ProcessingAccountFormProps> {}

  export function openProcessingAccountForm(
    props: ProcessingAccountFormProps
  ): Promise<any>

  // Checkout

  interface CheckoutProps {
    clientToken: string
    Payload?: any
    form?: string
    autoSubmit?: boolean
    amount?: string | number
    onProcessed?: (evt: PayloadFormProcessedEvent) => void
    onAuthorized?: (evt: PayloadFormAuthorizedEvent) => void
    onDeclined?: (evt: PayloadCheckoutDeclinedEvent) => void
    onSuccess?: (evt: PayloadFormSuccessEvent) => void
    onLoaded?: (evt: PayloadLoadedEvent) => void
    onClosed?: (evt: PayloadClosedEvent) => void
    children?: ReactNode
  }

  export class Checkout extends Component<CheckoutProps> {}

  export function openCheckout(props: CheckoutProps): Promise<any>

  // Default export — deprecated in favor of the named exports above (PayloadForm, PayloadInput, etc.)

  const PayloadReact: {
    input: Record<string, any>
    select: Record<string, any>
    form: Record<string, any>
  }

  export default PayloadReact
}
