import PropTypes from 'prop-types'
import React, { forwardRef } from 'react'

import {
  checkoutAttributeMap,
  checkoutEventsMap,
  formEventsMap,
  formParamsMap,
  ignoredEventsForStandardInput,
  inputEventsMap,
  inputPropsMap,
  processingFormAttributeMap,
  processingFormEventsMap,
  sensitiveFields,
} from './mappings'
import type {
  CheckoutProps,
  PayloadEvent,
  PayloadEventHandler,
  PayloadFormProps,
  PayloadInputProps,
  PayloadReactNamespace,
  PayloadSdkCheckout,
  PayloadSdkFn,
  PayloadSdkForm,
  PayloadSdkProcessingAccount,
  ProcessingAccountFormProps,
} from './types'
import { cacheCls, getPayload, getPropAttrs, invertObject } from './utils'

type ListenerRef = React.RefObject<
  HTMLElement | HTMLInputElement | HTMLDivElement
>
type ListenerTuple = [ListenerRef, PayloadEventHandler]
type ListenerMap = Record<string, ListenerTuple[]>

type PayloadFormState = {
  Payload: PayloadSdkFn | null
  listeners: ListenerMap
}

type ProviderValue = {
  addListener: (evt: string, ref: ListenerRef, cb: PayloadEventHandler) => void
  removeListener: (evt: string, ref: ListenerRef) => void
}

const PayloadFormContext = React.createContext<ProviderValue | null>(null)

function isFunction(value: unknown): value is PayloadEventHandler {
  return typeof value === 'function'
}

function getPropValue(
  props: Record<string, unknown>,
  key: string
): unknown | undefined {
  return props[key]
}

export class PayloadInput extends React.Component<PayloadInputProps> {
  static contextType = PayloadFormContext
  inputRef: ListenerRef
  _pl_input?: string

  constructor(props: PayloadInputProps) {
    super(props)
    this.inputRef = React.createRef<
      HTMLElement | HTMLInputElement | HTMLDivElement
    >()
  }

  isSensitiveField(): boolean {
    return Boolean(
      sensitiveFields[
        this.props.attr || this._pl_input || this.props['pl-input'] || ''
      ]
    )
  }

  componentDidMount(): void {
    const context = this.context as ProviderValue | null
    if (!context) return
    const props = this.props as Record<string, unknown>
    Object.entries(inputEventsMap).forEach(([key, value]) => {
      if (
        !this.isSensitiveField() &&
        (ignoredEventsForStandardInput as readonly string[]).includes(value)
      )
        return
      const prop = getPropValue(props, value)
      if (isFunction(prop)) {
        context.addListener(key, this.inputRef, (...args) => {
          const cb = (this.props as unknown as Record<string, unknown>)[value]
          if (isFunction(cb)) cb(...args)
        })
      }
    })
  }

  componentWillUnmount(): void {
    const context = this.context as ProviderValue | null
    if (!context || !this.isSensitiveField()) return
    const props = this.props as Record<string, unknown>
    Object.entries(inputEventsMap).forEach(([key, value]) => {
      if (value in props) context.removeListener(key, this.inputRef)
    })
  }

  render(): React.ReactElement {
    const attrs = getPropAttrs(
      this.props as unknown as Record<string, unknown>,
      Object.values(inputEventsMap).filter(
        (e) =>
          this.isSensitiveField() ||
          !(ignoredEventsForStandardInput as readonly string[]).includes(e)
      )
    )

    Object.entries(inputPropsMap).forEach(([key, value]) => {
      if (value in attrs) {
        attrs[key] = String(attrs[value])
        delete attrs[value]
      }
    })

    if (this._pl_input) attrs['pl-input'] = this._pl_input

    if ('attr' in attrs) {
      attrs['pl-input'] = attrs['attr']
      delete attrs['attr']
    }

    if (!('className' in attrs)) attrs.className = ''
    attrs.className = String(attrs.className || '')
      .concat(' pl-input')
      .trim()

    if (sensitiveFields[String(attrs['pl-input'] || '')]) {
      attrs.className = String(attrs.className || '') + ' pl-input-sec'
      return (
        <div
          ref={this.inputRef as React.RefObject<HTMLDivElement>}
          {...(attrs as React.HTMLAttributes<HTMLDivElement>)}></div>
      )
    }

    return (
      <input
        ref={this.inputRef as React.RefObject<HTMLInputElement>}
        {...(attrs as React.InputHTMLAttributes<HTMLInputElement>)}
      />
    )
  }
}

export class PayloadForm extends React.Component<
  PayloadFormProps,
  PayloadFormState
> {
  formRef: React.RefObject<HTMLFormElement>
  pl_form!: PayloadSdkForm
  _pl_form_type?: string

  constructor(props: PayloadFormProps) {
    super(props)
    this.state = {
      Payload: props.Payload || null,
      listeners: {},
    }
    this.formRef = React.createRef<HTMLFormElement>()
  }

  async componentDidMount(): Promise<void> {
    if (!this.state.Payload) {
      if (!window.Payload) {
        await getPayload()
      }
      this.setState((state) => ({ ...state, Payload: window.Payload || null }))
    } else if (this.props.clientToken) {
      this.initalizePayload()
    }
  }

  componentDidUpdate(
    prevProps: PayloadFormProps,
    prevState: PayloadFormState
  ): void {
    if (
      (!prevState.Payload && this.state.Payload && this.props.clientToken) ||
      (this.state.Payload && !prevProps.clientToken && this.props.clientToken)
    ) {
      this.initalizePayload()
    } else if (this.state.Payload && this.props.clientToken) {
      this.updatePayload()
    }
  }

  initalizePayload(): void {
    const Payload = this.state.Payload
    if (!Payload || !this.formRef.current) return

    Payload(this.props.clientToken)

    const params: Record<string, unknown> = { form: this.formRef.current }
    const props = this.props as Record<string, unknown>

    Object.entries(formParamsMap).forEach(([key, value]) => {
      if (value in props) params[key] = props[value]
    })

    this.pl_form = new Payload.Form({
      form: this.formRef.current,
      ...params,
    })
    ;[
      ...Object.entries(formEventsMap),
      ...Object.entries(inputEventsMap),
    ].forEach(([key, value]) => {
      this.pl_form.on(key, (evt: PayloadEvent, ...args: unknown[]) => {
        const cb = (this.props as unknown as Record<string, unknown>)[value]
        if (isFunction(cb)) cb(evt, ...args)

        if (key in this.state.listeners)
          this.state.listeners[key].forEach(([ref, listener]) => {
            if (evt.target === ref?.current) listener(evt, ...args)
          })
      })
    })
  }

  updatePayload(): void {
    if (!this.pl_form) return
    if (this.props.payment) this.pl_form.params.payment = this.props.payment
    if (this.props.paymentMethod)
      this.pl_form.params[
        invertObject(
          formParamsMap as unknown as Record<string, string>
        ).paymentMethod
      ] = this.props.paymentMethod
  }

  addListener(evt: string, ref: ListenerRef, cb: PayloadEventHandler): void {
    const listeners = this.state.listeners
    if (!(evt in listeners)) listeners[evt] = []
    listeners[evt].push([ref, cb])
    this.setState({ listeners })
  }

  removeListener(evt: string, ref: ListenerRef): void {
    const listeners = this.state.listeners
    const index = listeners[evt]?.findIndex(([r]) => r === ref) ?? -1
    if (index !== -1) {
      listeners[evt].splice(index, 1)
      this.setState({ listeners })
    }
  }

  submit(): Promise<unknown> {
    return this.pl_form.submit()
  }

  render(): React.ReactElement {
    const attrs = getPropAttrs(
      this.props as unknown as Record<string, unknown>,
      [
        ...Object.values(formParamsMap),
        ...Object.values(formEventsMap),
        ...Object.values(inputEventsMap),
        'clientToken',
        'Payload',
      ]
    )

    if (this._pl_form_type) attrs['pl-form'] = this._pl_form_type

    return (
      <PayloadFormContext.Provider
        value={{
          addListener: (...args) => this.addListener(...args),
          removeListener: (...args) => this.removeListener(...args),
        }}>
        <form
          {...(attrs as React.FormHTMLAttributes<HTMLFormElement>)}
          ref={this.formRef}>
          {this.props.children}
        </form>
      </PayloadFormContext.Provider>
    )
  }
}

export const PaymentForm = forwardRef<PayloadForm, PayloadFormProps>(
  ({ children, ...props }, ref) => {
    return (
      <PayloadForm ref={ref} pl-form="payment" {...props}>
        {children}
      </PayloadForm>
    )
  }
)

export const PaymentMethodForm = forwardRef<PayloadForm, PayloadFormProps>(
  ({ children, ...props }, ref) => {
    return (
      <PayloadForm ref={ref} pl-form="payment_method" {...props}>
        {children}
      </PayloadForm>
    )
  }
)

export const Card = (props: PayloadInputProps): React.ReactElement => {
  return <PayloadInput pl-input="card" {...props} />
}

export const CardNumber = (props: PayloadInputProps): React.ReactElement => {
  return <PayloadInput pl-input="card_number" {...props} />
}

export const Expiry = (props: PayloadInputProps): React.ReactElement => {
  return <PayloadInput pl-input="expiry" {...props} />
}

export const CardCode = (props: PayloadInputProps): React.ReactElement => {
  return <PayloadInput pl-input="card_code" {...props} />
}

export const RoutingNumber = (props: PayloadInputProps): React.ReactElement => {
  return <PayloadInput pl-input="routing_number" {...props} />
}

export const AccountNumber = (props: PayloadInputProps): React.ReactElement => {
  return <PayloadInput pl-input="account_number" {...props} />
}

type ProcessingAccountState = {
  Payload: PayloadSdkFn | null
}

export class ProcessingAccountForm extends React.Component<
  ProcessingAccountFormProps,
  ProcessingAccountState
> {
  procFormRef: React.RefObject<HTMLDivElement>
  processingAccount: PayloadSdkProcessingAccount | null
  excludeProps: string[]

  constructor(props: ProcessingAccountFormProps) {
    super(props)
    this.state = { Payload: props.Payload || null }
    this.procFormRef = React.createRef<HTMLDivElement>()
    this.processingAccount = null
    this.excludeProps = [
      ...Object.values(processingFormAttributeMap),
      ...Object.values(processingFormEventsMap),
      'Payload',
      'clientToken',
    ]
  }

  async componentDidMount(): Promise<void> {
    if (!this.props.clientToken) return
    if (!this.state.Payload) {
      if (!window.Payload) {
        await getPayload()
      }
      this.setState((state) => ({ ...state, Payload: window.Payload || null }))
    } else {
      this.initalizePayload()
    }
  }

  componentDidUpdate(
    _prevProps: ProcessingAccountFormProps,
    prevState: ProcessingAccountState
  ): void {
    if (!prevState.Payload && this.state.Payload) {
      this.initalizePayload()

      const props: Record<string, unknown> = {}
      const componentProps = this.props as unknown as Record<string, unknown>
      Object.entries(processingFormAttributeMap).forEach(([key, value]) => {
        if (value in componentProps) props[key] = componentProps[value]
      })

      this.processingAccount = new this.state.Payload.ProcessingAccount({
        container: this.procFormRef.current,
        ...props,
      })

      Object.entries(processingFormEventsMap).forEach(([key, value]) => {
        this.processingAccount?.on(
          key,
          (evt: PayloadEvent, ...args: unknown[]) => {
            const cb = (this.props as unknown as Record<string, unknown>)[value]
            if (isFunction(cb)) cb(evt, ...args)
          }
        )
      })
    }
  }

  initalizePayload(): void {
    this.state.Payload?.(this.props.clientToken)
  }

  render(): React.ReactElement {
    const props: Record<string, unknown> = {}
    Object.entries(this.props as unknown as Record<string, unknown>).forEach(
      ([key, value]) => {
        if (!this.excludeProps.includes(key)) props[key] = value
      }
    )
    return (
      <div
        ref={this.procFormRef}
        {...(props as React.HTMLAttributes<HTMLDivElement>)}></div>
    )
  }
}

export const openProcessingAccountForm = async (
  props: ProcessingAccountFormProps
): Promise<PayloadSdkProcessingAccount> => {
  await getPayload()
  if (!window.Payload) throw new Error('Payload.js is not available on window')

  window.Payload(props.clientToken)

  const transformedProps: Record<string, unknown> = {}
  const inputProps = props as unknown as Record<string, unknown>
  Object.entries(processingFormAttributeMap).forEach(([key, value]) => {
    if (value in inputProps) transformedProps[key] = inputProps[value]
  })

  const processingAccount = new window.Payload.ProcessingAccount({
    ...transformedProps,
  })

  Object.entries(processingFormEventsMap).forEach(([key, value]) => {
    const cb = inputProps[value]
    if (isFunction(cb)) processingAccount.on(key, cb)
  })

  return processingAccount
}

type CheckoutState = {
  Payload: PayloadSdkFn | null
}

export class Checkout extends React.Component<CheckoutProps, CheckoutState> {
  checkoutRef: React.RefObject<HTMLDivElement>
  checkout: PayloadSdkCheckout | null
  excludeProps: string[]

  constructor(props: CheckoutProps) {
    super(props)
    this.state = { Payload: props.Payload || null }
    this.checkoutRef = React.createRef<HTMLDivElement>()
    this.checkout = null
    this.excludeProps = [
      ...Object.values(checkoutAttributeMap),
      ...Object.values(checkoutEventsMap),
      'Payload',
      'clientToken',
    ]
  }

  async componentDidMount(): Promise<void> {
    if (!this.props.clientToken) return
    if (!this.state.Payload) {
      if (!window.Payload) {
        await getPayload()
      }
      this.setState((state) => ({ ...state, Payload: window.Payload || null }))
    } else {
      this.initalizePayload()
    }
  }

  componentDidUpdate(
    _prevProps: CheckoutProps,
    prevState: CheckoutState
  ): void {
    if (!prevState.Payload && this.state.Payload) {
      this.initalizePayload()

      const props: Record<string, unknown> = {}
      const componentProps = this.props as unknown as Record<string, unknown>
      Object.entries(checkoutAttributeMap).forEach(([key, value]) => {
        if (value in componentProps) props[key] = componentProps[value]
      })

      this.checkout = new this.state.Payload.Checkout({
        container: this.checkoutRef.current,
        ...props,
      })

      Object.entries(checkoutEventsMap).forEach(([key, value]) => {
        this.checkout?.on(key, (evt: PayloadEvent, ...args: unknown[]) => {
          const cb = (this.props as unknown as Record<string, unknown>)[value]
          if (isFunction(cb)) cb(evt, ...args)
        })
      })
    }
  }

  initalizePayload(): void {
    this.state.Payload?.(this.props.clientToken)
  }

  render(): React.ReactElement {
    const props = Object.entries(
      this.props as unknown as Record<string, unknown>
    ).reduce(
      (acc, [key, value]) => {
        if (!this.excludeProps.includes(key)) {
          acc[key] = value
        }
        return acc
      },
      {} as Record<string, unknown>
    )
    return (
      <div
        ref={this.checkoutRef}
        {...(props as React.HTMLAttributes<HTMLDivElement>)}></div>
    )
  }
}

export const openCheckout = async (
  props: CheckoutProps
): Promise<PayloadSdkCheckout> => {
  await getPayload()
  if (!window.Payload) throw new Error('Payload.js is not available on window')

  window.Payload(props.clientToken)

  const transformedProps: Record<string, unknown> = {}
  const inputProps = props as unknown as Record<string, unknown>
  Object.entries(checkoutAttributeMap).forEach(([key, value]) => {
    if (value in inputProps) transformedProps[key] = inputProps[value]
  })

  const checkout = new window.Payload.Checkout({
    ...transformedProps,
  })

  Object.entries(checkoutEventsMap).forEach(([key, value]) => {
    const cb = inputProps[value]
    if (isFunction(cb)) checkout.on(key, cb)
  })

  return checkout
}
;(PayloadForm as unknown as { propTypes: Record<string, unknown> }).propTypes =
  {
    clientToken: PropTypes.string.isRequired,
    Payload: PropTypes.func,
  }

const PayloadReact: PayloadReactNamespace = {
  input: new Proxy(
    {},
    {
      get(_target, name: string | symbol) {
        if (typeof name !== 'string') return undefined
        return cacheCls(
          'input.' + name,
          class extends PayloadInput {
            render(): React.ReactElement {
              this._pl_input = name
              return super.render()
            }
          }
        )
      },
    }
  ) as PayloadReactNamespace['input'],

  select: new Proxy(
    {},
    {
      get(_target, name: string | symbol) {
        if (typeof name !== 'string') return undefined
        return cacheCls(
          'select.' + name,
          class extends React.Component<
            React.SelectHTMLAttributes<HTMLSelectElement>
          > {
            render(): React.ReactElement {
              const attrs = getPropAttrs(
                this.props as unknown as Record<string, unknown>
              )
              return (
                <select
                  pl-input={name}
                  {...(attrs as React.SelectHTMLAttributes<HTMLSelectElement>)}>
                  {this.props.children}
                </select>
              )
            }
          }
        )
      },
    }
  ) as PayloadReactNamespace['select'],

  form: new Proxy(
    {},
    {
      get(_target, name: string | symbol) {
        if (typeof name !== 'string') return undefined
        return cacheCls(
          'form.' + name,
          class extends PayloadForm {
            render(): React.ReactElement {
              this._pl_form_type = name
              return super.render()
            }
          }
        )
      },
    }
  ) as PayloadReactNamespace['form'],
}

export default PayloadReact

export type {
  CheckoutProps,
  PayloadEvent,
  PayloadEventHandler,
  PayloadFormProps,
  PayloadInputProps,
  PayloadReactNamespace,
  PayloadSdkCheckout,
  PayloadSdkFn,
  PayloadSdkForm,
  PayloadSdkProcessingAccount,
  ProcessingAccountFormProps,
} from './types'
