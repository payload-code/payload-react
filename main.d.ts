declare module 'payload-react' {
  import { Component, ReactElement, ReactNode, RefAttributes } from 'react'

  type EventHandler = (event: any) => void

  // PayloadInput

  interface PayloadInputProps {
    attr?: string
    'pl-input'?: string
    disablePaste?: boolean
    onInvalid?: EventHandler
    onValid?: EventHandler
    onFocus?: EventHandler
    onBlur?: EventHandler
    onChange?: EventHandler
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
    onProcessing?: EventHandler
    onProcessed?: EventHandler
    onAuthorized?: EventHandler
    onError?: EventHandler
    onDeclined?: EventHandler
    onCreated?: EventHandler
    onSuccess?: EventHandler
    onInvalid?: EventHandler
    onValid?: EventHandler
    onFocus?: EventHandler
    onBlur?: EventHandler
    onChange?: EventHandler
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
    onSuccess?: EventHandler
    onAccountCreated?: EventHandler
    onLoaded?: EventHandler
    onClosed?: EventHandler
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
    onProcessed?: EventHandler
    onAuthorized?: EventHandler
    onDeclined?: EventHandler
    onSuccess?: EventHandler
    onLoaded?: EventHandler
    onClosed?: EventHandler
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
