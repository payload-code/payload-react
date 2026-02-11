import type * as React from 'react'

export type PayloadEvent = {
  target?: EventTarget | null
} & Record<string, any>

export type PayloadEventHandler<E = PayloadEvent> = (
  evt: E,
  ...args: unknown[]
) => void

export interface PayloadSdkForm {
  on(eventName: string, cb: PayloadEventHandler): void
  submit(): Promise<unknown>
  params: Record<string, unknown>
}

export interface PayloadSdkCheckout {
  on(eventName: string, cb: PayloadEventHandler): void
}

export interface PayloadSdkProcessingAccount {
  on(eventName: string, cb: PayloadEventHandler): void
}

export interface PayloadSdkFn {
  (clientToken: string): void
  Form: new (options: Record<string, unknown>) => PayloadSdkForm
  Checkout: new (options: Record<string, unknown>) => PayloadSdkCheckout
  ProcessingAccount: new (
    options: Record<string, unknown>
  ) => PayloadSdkProcessingAccount
}

export interface InputEventProps {
  onInvalid?: PayloadEventHandler
  onValid?: PayloadEventHandler
  onFocus?: PayloadEventHandler
  onBlur?: PayloadEventHandler
  onChange?: PayloadEventHandler
}

export interface PayloadInputProps
  extends Omit<
      React.InputHTMLAttributes<HTMLInputElement>,
      keyof InputEventProps
    >,
    InputEventProps {
  attr?: string
  'pl-input'?: string
  disablePaste?: boolean
}

export interface FormEventProps extends InputEventProps {
  onProcessing?: PayloadEventHandler
  onProcessed?: PayloadEventHandler
  onAuthorized?: PayloadEventHandler
  onError?: PayloadEventHandler
  onDeclined?: PayloadEventHandler
  onCreated?: PayloadEventHandler
  onSuccess?: PayloadEventHandler
}

export interface PayloadFormProps
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, keyof FormEventProps>,
    FormEventProps {
  clientToken: string
  Payload?: PayloadSdkFn
  autoSubmit?: boolean
  styles?: Record<string, unknown>
  payment?: Record<string, unknown>
  paymentMethod?: Record<string, unknown>
  preventDefaultOnSubmit?: boolean
  preventSubmitOnEnter?: boolean
}

export interface ProcessingAccountFormProps
  extends React.HTMLAttributes<HTMLDivElement> {
  clientToken: string
  Payload?: PayloadSdkFn
  form?: string
  legalEntityId?: string
  onSuccess?: PayloadEventHandler
  onAccountCreated?: PayloadEventHandler
  onLoaded?: PayloadEventHandler
  onClosed?: PayloadEventHandler
}

export interface CheckoutProps extends React.HTMLAttributes<HTMLDivElement> {
  clientToken: string
  Payload?: PayloadSdkFn
  form?: string
  autoSubmit?: boolean
  amount?: string | number
  onProcessed?: PayloadEventHandler
  onAuthorized?: PayloadEventHandler
  onDeclined?: PayloadEventHandler
  onSuccess?: PayloadEventHandler
  onLoaded?: PayloadEventHandler
  onClosed?: PayloadEventHandler
}

export interface PayloadReactNamespace {
  input: Record<string, React.ComponentType<PayloadInputProps>>
  select: Record<
    string,
    React.ComponentType<React.SelectHTMLAttributes<HTMLSelectElement>>
  >
  form: Record<string, React.ComponentType<PayloadFormProps>>
}
