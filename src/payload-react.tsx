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
import {
  cacheCls,
  getPayload,
  getPropAttrs,
  invertObject,
  rawProps,
} from './utils'

type ListenerTuple = [React.RefObject<HTMLElement>, PayloadEventHandler]
type ListenerMap = Record<string, ListenerTuple[]>

type PayloadFormState = {
  Payload: PayloadSdkFn | null
  listeners: ListenerMap
}

type ProviderValue = {
  addListener: (
    evt: string,
    ref: React.RefObject<HTMLElement>,
    cb: PayloadEventHandler
  ) => void
  removeListener: (evt: string, ref: React.RefObject<HTMLElement>) => void
}

const PayloadFormContext = React.createContext<ProviderValue | null>(null)

const IGNORED_INPUT_EVENTS: readonly string[] = ignoredEventsForStandardInput

function isFunction(value: unknown): value is PayloadEventHandler {
  return typeof value === 'function'
}

// ── PayloadInput ──

export class PayloadInput extends React.Component<PayloadInputProps> {
  static contextType = PayloadFormContext
  inputRef = React.createRef<HTMLElement>()
  _pl_input?: string

  isSensitiveField(): boolean {
    return Boolean(
      sensitiveFields[
        this.props.attr || this._pl_input || this.props['pl-input'] || ''
      ]
    )
  }

  componentDidMount(): void {
    const ctx = this.context as ProviderValue | null
    if (!ctx) return
    const props = rawProps(this.props)

    Object.entries(inputEventsMap).forEach(([key, value]) => {
      if (!this.isSensitiveField() && IGNORED_INPUT_EVENTS.includes(value))
        return
      if (isFunction(props[value])) {
        ctx.addListener(key, this.inputRef, (...args) => {
          const cb = rawProps(this.props)[value]
          if (isFunction(cb)) cb(...args)
        })
      }
    })
  }

  componentWillUnmount(): void {
    const ctx = this.context as ProviderValue | null
    if (!ctx || !this.isSensitiveField()) return
    const props = rawProps(this.props)

    Object.entries(inputEventsMap).forEach(([key, value]) => {
      if (value in props) ctx.removeListener(key, this.inputRef)
    })
  }

  render(): React.ReactElement {
    const attrs = getPropAttrs(
      rawProps(this.props),
      Object.values(inputEventsMap).filter(
        (e) => this.isSensitiveField() || !IGNORED_INPUT_EVENTS.includes(e)
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

    attrs.className = (String(attrs.className || '') + ' pl-input').trim()

    if (sensitiveFields[String(attrs['pl-input'] || '')]) {
      attrs.className += ' pl-input-sec'
      return (
        <div
          ref={this.inputRef as React.RefObject<HTMLDivElement>}
          {...(attrs as React.HTMLAttributes<HTMLDivElement>)}
        />
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

// ── PayloadForm ──

export class PayloadForm extends React.Component<
  PayloadFormProps,
  PayloadFormState
> {
  formRef = React.createRef<HTMLFormElement>()
  pl_form!: PayloadSdkForm
  _pl_form_type?: string

  constructor(props: PayloadFormProps) {
    super(props)
    this.state = {
      Payload: props.Payload || null,
      listeners: {},
    }
  }

  async componentDidMount(): Promise<void> {
    if (!this.state.Payload) {
      if (!window.Payload) await getPayload()
      this.setState((s) => ({ ...s, Payload: window.Payload || null }))
    } else if (this.props.clientToken) {
      this.initializePayload()
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
      this.initializePayload()
    } else if (this.state.Payload && this.props.clientToken) {
      this.updatePayload()
    }
  }

  initializePayload(): void {
    const Payload = this.state.Payload
    if (!Payload || !this.formRef.current) return

    Payload(this.props.clientToken)

    const params: Record<string, unknown> = { form: this.formRef.current }
    const props = rawProps(this.props)

    Object.entries(formParamsMap).forEach(([key, value]) => {
      if (value in props) params[key] = props[value]
    })

    this.pl_form = new Payload.Form({ form: this.formRef.current, ...params })

    const allEvents = [
      ...Object.entries(formEventsMap),
      ...Object.entries(inputEventsMap),
    ]
    allEvents.forEach(([key, value]) => {
      this.pl_form.on(key, (evt: PayloadEvent, ...args: unknown[]) => {
        const cb = rawProps(this.props)[value]
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
      this.pl_form.params[invertObject(formParamsMap).paymentMethod] =
        this.props.paymentMethod
  }

  addListener(
    evt: string,
    ref: React.RefObject<HTMLElement>,
    cb: PayloadEventHandler
  ): void {
    const listeners = this.state.listeners
    if (!(evt in listeners)) listeners[evt] = []
    listeners[evt].push([ref, cb])
    this.setState({ listeners })
  }

  removeListener(evt: string, ref: React.RefObject<HTMLElement>): void {
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
    const attrs = getPropAttrs(rawProps(this.props), [
      ...Object.values(formParamsMap),
      ...Object.values(formEventsMap),
      ...Object.values(inputEventsMap),
      'clientToken',
      'Payload',
    ])

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

// Keep PropTypes for JS consumers that don't use TypeScript.
;(PayloadForm as unknown as { propTypes: unknown }).propTypes = {
  clientToken: PropTypes.string.isRequired,
  Payload: PropTypes.func,
}

// ── Convenience wrappers ──

export const PaymentForm = forwardRef<PayloadForm, PayloadFormProps>(
  ({ children, ...props }, ref) => (
    <PayloadForm ref={ref} pl-form="payment" {...props}>
      {children}
    </PayloadForm>
  )
)

export const PaymentMethodForm = forwardRef<PayloadForm, PayloadFormProps>(
  ({ children, ...props }, ref) => (
    <PayloadForm ref={ref} pl-form="payment_method" {...props}>
      {children}
    </PayloadForm>
  )
)

export const Card = (props: PayloadInputProps) => (
  <PayloadInput pl-input="card" {...props} />
)
export const CardNumber = (props: PayloadInputProps) => (
  <PayloadInput pl-input="card_number" {...props} />
)
export const Expiry = (props: PayloadInputProps) => (
  <PayloadInput pl-input="expiry" {...props} />
)
export const CardCode = (props: PayloadInputProps) => (
  <PayloadInput pl-input="card_code" {...props} />
)
export const RoutingNumber = (props: PayloadInputProps) => (
  <PayloadInput pl-input="routing_number" {...props} />
)
export const AccountNumber = (props: PayloadInputProps) => (
  <PayloadInput pl-input="account_number" {...props} />
)

// ── ProcessingAccountForm ──

type PluginState = { Payload: PayloadSdkFn | null }

export class ProcessingAccountForm extends React.Component<
  ProcessingAccountFormProps,
  PluginState
> {
  procFormRef = React.createRef<HTMLDivElement>()
  processingAccount: PayloadSdkProcessingAccount | null = null
  excludeProps = [
    ...Object.values(processingFormAttributeMap),
    ...Object.values(processingFormEventsMap),
    'Payload',
    'clientToken',
  ]

  constructor(props: ProcessingAccountFormProps) {
    super(props)
    this.state = { Payload: props.Payload || null }
  }

  async componentDidMount(): Promise<void> {
    if (!this.props.clientToken) return
    if (!this.state.Payload) {
      if (!window.Payload) await getPayload()
      this.setState((s) => ({ ...s, Payload: window.Payload || null }))
    } else {
      this.initializePayload()
    }
  }

  componentDidUpdate(
    _prevProps: ProcessingAccountFormProps,
    prevState: PluginState
  ): void {
    if (!prevState.Payload && this.state.Payload) {
      this.initializePayload()

      const sdkProps: Record<string, unknown> = {}
      const props = rawProps(this.props)
      Object.entries(processingFormAttributeMap).forEach(([key, value]) => {
        if (value in props) sdkProps[key] = props[value]
      })

      this.processingAccount = new this.state.Payload.ProcessingAccount({
        container: this.procFormRef.current,
        ...sdkProps,
      })

      Object.entries(processingFormEventsMap).forEach(([key, value]) => {
        const cb = rawProps(this.props)[value]
        if (isFunction(cb)) this.processingAccount?.on(key, cb)
      })
    }
  }

  initializePayload(): void {
    this.state.Payload?.(this.props.clientToken)
  }

  render(): React.ReactElement {
    const attrs = getPropAttrs(rawProps(this.props), this.excludeProps)
    return (
      <div
        ref={this.procFormRef}
        {...(attrs as React.HTMLAttributes<HTMLDivElement>)}
      />
    )
  }
}

export const openProcessingAccountForm = async (
  props: ProcessingAccountFormProps
): Promise<PayloadSdkProcessingAccount> => {
  await getPayload()
  if (!window.Payload) throw new Error('Payload.js is not available on window')

  window.Payload(props.clientToken)

  const sdkProps: Record<string, unknown> = {}
  const p = rawProps(props)
  Object.entries(processingFormAttributeMap).forEach(([key, value]) => {
    if (value in p) sdkProps[key] = p[value]
  })

  const account = new window.Payload.ProcessingAccount({ ...sdkProps })

  Object.entries(processingFormEventsMap).forEach(([key, value]) => {
    const cb = p[value]
    if (isFunction(cb)) account.on(key, cb)
  })

  return account
}

// ── Checkout ──

export class Checkout extends React.Component<CheckoutProps, PluginState> {
  checkoutRef = React.createRef<HTMLDivElement>()
  checkout: PayloadSdkCheckout | null = null
  excludeProps = [
    ...Object.values(checkoutAttributeMap),
    ...Object.values(checkoutEventsMap),
    'Payload',
    'clientToken',
  ]

  constructor(props: CheckoutProps) {
    super(props)
    this.state = { Payload: props.Payload || null }
  }

  async componentDidMount(): Promise<void> {
    if (!this.props.clientToken) return
    if (!this.state.Payload) {
      if (!window.Payload) await getPayload()
      this.setState((s) => ({ ...s, Payload: window.Payload || null }))
    } else {
      this.initializePayload()
    }
  }

  componentDidUpdate(_prevProps: CheckoutProps, prevState: PluginState): void {
    if (!prevState.Payload && this.state.Payload) {
      this.initializePayload()

      const sdkProps: Record<string, unknown> = {}
      const props = rawProps(this.props)
      Object.entries(checkoutAttributeMap).forEach(([key, value]) => {
        if (value in props) sdkProps[key] = props[value]
      })

      this.checkout = new this.state.Payload.Checkout({
        container: this.checkoutRef.current,
        ...sdkProps,
      })

      Object.entries(checkoutEventsMap).forEach(([key, value]) => {
        const cb = rawProps(this.props)[value]
        if (isFunction(cb)) this.checkout?.on(key, cb)
      })
    }
  }

  initializePayload(): void {
    this.state.Payload?.(this.props.clientToken)
  }

  render(): React.ReactElement {
    const attrs = getPropAttrs(rawProps(this.props), this.excludeProps)
    return (
      <div
        ref={this.checkoutRef}
        {...(attrs as React.HTMLAttributes<HTMLDivElement>)}
      />
    )
  }
}

export const openCheckout = async (
  props: CheckoutProps
): Promise<PayloadSdkCheckout> => {
  await getPayload()
  if (!window.Payload) throw new Error('Payload.js is not available on window')

  window.Payload(props.clientToken)

  const sdkProps: Record<string, unknown> = {}
  const p = rawProps(props)
  Object.entries(checkoutAttributeMap).forEach(([key, value]) => {
    if (value in p) sdkProps[key] = p[value]
  })

  const checkout = new window.Payload.Checkout({ ...sdkProps })

  Object.entries(checkoutEventsMap).forEach(([key, value]) => {
    const cb = p[value]
    if (isFunction(cb)) checkout.on(key, cb)
  })

  return checkout
}

// ── Legacy proxy-based API (deprecated) ──

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
              const attrs = getPropAttrs(rawProps(this.props))
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
