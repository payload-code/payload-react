import PropTypes from 'prop-types'
import React, { useEffect, useRef } from 'react'

import { getPayload } from './utils.js'

const PayloadFormContext = React.createContext(null)

const sensitiveFields = {
  account_number: true,
  routing_number: true,
  card_code: true,
  cvc: true,
  card_number: true,
  expiry: true,
  card: true,
}

const formParamsMap = {
  autosubmit: 'autoSubmit',
  styles: 'styles',
  payment: 'payment',
  payment_method: 'paymentMethod',
}

const formEventsMap = {
  processing: 'onProcessing',
  processed: 'onProcessed',
  authorized: 'onAuthorized',
  error: 'onError',
  declined: 'onDeclined',
  created: 'onCreated',
  success: 'onSuccess',
}

const inputPropsMap = {
  'disable-paste': 'disablePaste',
}

const inputEventsMap = {
  invalid: 'onInvalid',
  valid: 'onValid',
  focus: 'onFocus',
  blur: 'onBlur',
  change: 'onChange',
}

const processingFormEventsMap = {
  success: 'onSuccess',
  account_created: 'onAccountCreated',
  loaded: 'onLoaded',
  closed: 'onClosed',
}

const processingFormAttributeMap = {
  form: 'form',
  legal_entity_id: 'legalEntityId',
}

const checkoutEventsMap = {
  processed: 'onProcessed',
  authorized: 'onAuthorized',
  declined: 'onDeclined',
  success: 'onSuccess',
  loaded: 'onLoaded',
  closed: 'onClosed',
}

const checkoutAttributeMap = {
  form: 'form',
  autosubmit: 'autoSubmit',
  amount: 'amount',
}

function getPropAttrs(props, ignore) {
  const attrs = {}
  for (const key in props) {
    if (key == 'children') continue
    if (ignore && ignore.includes(key)) continue
    attrs[key] = props[key]
  }
  return attrs
}

const __cls_cache = {}

function cacheCls(name, cls) {
  if (!(name in __cls_cache)) __cls_cache[name] = cls
  return __cls_cache[name]
}

export class PayloadInput extends React.Component {
  static contextType = PayloadFormContext

  constructor(props) {
    super(props)
    this.props = props
    this.inputRef = React.createRef()
  }

  isSensitiveField() {
    return sensitiveFields[
      this.props.attr || this._pl_input || this.props['pl-input']
    ]
  }

  componentDidMount() {
    if (!this.isSensitiveField()) return

    Object.entries(inputEventsMap).forEach(([key, value]) => {
      if (value in this.props)
        this.context.addListener(key, this.inputRef, (...args) =>
          this.props[value](...args)
        )
    })
  }

  componentWillUnmount() {
    if (!this.isSensitiveField()) return

    Object.entries(inputEventsMap).forEach(([key, value]) => {
      if (value in this.props) this.context.removeListener(key, this.inputRef)
    })
  }

  render() {
    const attrs = getPropAttrs(
      this.props,
      this.isSensitiveField() ? Object.values(inputEventsMap) : []
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

    if (!('className' in attrs)) attrs['className'] = ''

    attrs['className'] = (attrs['className'] + ' pl-input').trim()

    if (sensitiveFields[attrs['pl-input']]) {
      attrs['className'] += ' pl-input-sec'
      return <div ref={this.inputRef} {...attrs}></div>
    } else return <input ref={this.inputRef} {...attrs} />
  }
}

export class PayloadForm extends React.Component {
  constructor(props) {
    super(props)
    this.props = props
    this.state = {
      Payload: props.Payload ? props.Payload : null,
      listeners: {},
    }
    this.formRef = React.createRef()
  }

  async componentDidMount() {
    if (!this.props.clientToken) {
      return
    }

    if (!this.state.Payload) {
      if (!window.Payload) {
        await getPayload()
      }
      this.setState((state) => ({ ...state, Payload: window.Payload }))
    } else this.initalizePayload()
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!prevState.Payload && this.state.Payload) {
      // Payload is set in our state we can initialize it
      this.initalizePayload()
    }
  }

  initalizePayload() {
    this.state.Payload(this.props.clientToken)

    const params = { form: this.formRef.current }

    Object.entries(formParamsMap).forEach(([key, value]) => {
      if (value in this.props) params[key] = this.props[value]
    })

    this.pl_form = new this.state.Payload.Form({
      form: this.formRef.current,
      ...params,
    })

    new Array(
      ...Object.entries(formEventsMap),
      ...Object.entries(inputEventsMap)
    ).forEach(([key, value]) => {
      this.pl_form.on(key, (evt, ...args) => {
        if (value in this.props) this.props[value](evt, ...args)

        if (key in this.state.listeners)
          this.state.listeners[key].forEach(([ref, listener]) => {
            if (evt.target === ref?.current) listener(evt, ...args)
          })
      })
    })
  }

  addListener(evt, ref, cb) {
    const listeners = this.state.listeners
    if (!(evt in listeners)) listeners[evt] = []
    listeners[evt].push([ref, cb])
    this.setState({ listeners })
  }

  removeListener(evt, ref) {
    const listeners = this.state.listeners
    const index = listeners[evt]?.findIndex(([r, cb]) => r === ref) ?? -1

    if (index != -1) {
      listeners[evt].splice(index, 1)
      this.setState({ listeners })
    }
  }

  render() {
    const attrs = getPropAttrs(this.props, [
      ...Object.values(formParamsMap),
      ...Object.values(formEventsMap),
      ...Object.values(inputEventsMap),
      'clientToken',
      'Payload',
    ])

    if (this._pl_form) attrs['pl-form'] = this._pl_form

    return (
      <PayloadFormContext.Provider
        value={{
          addListener: (...args) => this.addListener(...args),
          removeListener: (...args) => this.removeListener(...args),
        }}>
        <form {...attrs} ref={this.formRef}>
          {this.props.children}
        </form>
      </PayloadFormContext.Provider>
    )
  }
}

export const PaymentForm = ({ children, ...props }) => {
  return (
    <PayloadForm pl-form="payment" {...props}>
      {children}
    </PayloadForm>
  )
}

export const PaymentMethodForm = ({ children, ...props }) => {
  return (
    <PayloadForm pl-form="payment_method" {...props}>
      {children}
    </PayloadForm>
  )
}

export const Card = (props) => {
  return <PayloadInput pl-input="card" {...props} />
}

export const CardNumber = (props) => {
  return <PayloadInput pl-input="card_number" {...props} />
}

export const Expiry = (props) => {
  return <PayloadInput pl-input="expiry" {...props} />
}

export const CardCode = (props) => {
  return <PayloadInput pl-input="card_code" {...props} />
}

export const RoutingNumber = (props) => {
  return <PayloadInput pl-input="routing_number" {...props} />
}

export const AccountNumber = (props) => {
  return <PayloadInput pl-input="account_number" {...props} />
}

export class ProcessingAccountForm extends React.Component {
  constructor(props) {
    super(props)
    this.props = props
    this.state = {
      Payload: props.Payload ? props.Payload : null,
    }
    this.procFormRef = React.createRef()
    this.processingAccount = null
    this.excludeProps = Object.values(processingFormAttributeMap)
      .concat(Object.values(processingFormEventsMap))
      .concat(['Payload', 'clientToken'])
  }

  async componentDidMount() {
    if (!this.props.clientToken) {
      return
    }

    if (!this.state.Payload) {
      if (!window.Payload) {
        await getPayload()
      }
      this.setState((state) => ({ ...state, Payload: window.Payload }))
    } else {
      this.initalizePayload()
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!prevState.Payload && this.state.Payload) {
      // Payload is set in our state we can initialize it
      this.initalizePayload()

      const props = {}
      Object.entries(processingFormAttributeMap).forEach(([key, value]) => {
        if (value in this.props) props[key] = this.props[value]
      })

      this.processingAccount = new this.state.Payload.ProcessingAccount({
        container: this.procFormRef.current,
        ...props,
      })

      Object.entries(processingFormEventsMap).forEach(([key, value]) => {
        this.processingAccount.on(key, (evt, ...args) => {
          if (value in this.props) this.props[value](evt, ...args)
        })
      })
    }
  }

  initalizePayload() {
    this.state.Payload(this.props.clientToken)
  }

  render() {
    const props = {}
    Object.entries(this.props).forEach(([key, value]) => {
      if (!this.excludeProps.includes(key)) props[key] = value
    })

    return <div ref={this.procFormRef} {...props}></div>
  }
}

export const openProcessingAccountForm = async (props) => {
  await getPayload()

  window.Payload(props.clientToken)

  const transformedProps = {}
  Object.entries(processingFormAttributeMap).forEach(([key, value]) => {
    if (value in props) transformedProps[key] = props[value]
  })

  const processingAccount = new window.Payload.ProcessingAccount({
    ...transformedProps,
  })

  Object.entries(processingFormEventsMap).forEach(([key, value]) => {
    if (value in props) processingAccount.on(key, props[value])
  })

  return processingAccount
}

export class Checkout extends React.Component {
  constructor(props) {
    super(props)
    this.props = props
    this.state = {
      Payload: props.Payload ? props.Payload : null,
    }
    this.checkoutRef = React.createRef()
    this.checkout = null
    this.excludeProps = Object.values(checkoutAttributeMap)
      .concat(Object.values(checkoutEventsMap))
      .concat(['Payload', 'clientToken'])
  }

  async componentDidMount() {
    if (!this.props.clientToken) {
      return
    }

    if (!this.state.Payload) {
      if (!window.Payload) {
        await getPayload()
      }
      this.setState((state) => ({ ...state, Payload: window.Payload }))
    } else {
      this.initalizePayload()
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!prevState.Payload && this.state.Payload) {
      // Payload is set in our state we can initialize it
      this.initalizePayload()

      const props = {}
      Object.entries(checkoutAttributeMap).forEach(([key, value]) => {
        if (value in this.props) props[key] = this.props[value]
      })

      this.checkout = new this.state.Payload.Checkout({
        container: this.checkoutRef.current,
        ...props,
      })

      Object.entries(checkoutEventsMap).forEach(([key, value]) => {
        this.checkout.on(key, (evt, ...args) => {
          if (value in this.props) this.props[value](evt, ...args)
        })
      })
    }
  }

  initalizePayload() {
    this.state.Payload(this.props.clientToken)
  }

  render() {
    const props = Object.entries(this.props).reduce((props, [key, value]) => {
      if (!this.excludeProps.includes(key)) {
        props[key] = value
      }
      return props
    }, {})
    return <div ref={this.checkoutRef} {...props}></div>
  }
}

export const openCheckout = async (props) => {
  await getPayload()

  window.Payload(props.clientToken)

  const transformedProps = {}
  Object.entries(checkoutAttributeMap).forEach(([key, value]) => {
    if (value in props) transformedProps[key] = props[value]
  })

  const checkout = new window.Payload.Checkout({
    ...transformedProps,
  })

  Object.entries(checkoutEventsMap).forEach(([key, value]) => {
    if (value in props) checkout.on(key, props[value])
  })

  return checkout
}

PayloadForm.propTypes = {
  clientToken: PropTypes.string.isRequired,
  Payload: PropTypes.func,
}

const PayloadReact = {
  input: new Proxy(
    {},
    {
      get(target, name) {
        return cacheCls(
          'input.' + name,
          class extends PayloadInput {
            render() {
              this._pl_input = name
              return super.render()
            }
          }
        )
      },
    }
  ),

  select: new Proxy(
    {},
    {
      get(target, name) {
        return cacheCls(
          'select.' + name,
          class extends React.Component {
            render() {
              const attrs = getPropAttrs(this.props)
              return (
                <select pl-input={name} {...attrs}>
                  {this.props.children}
                </select>
              )
            }
          }
        )
      },
    }
  ),

  form: new Proxy(
    {},
    {
      get(target, name) {
        return cacheCls(
          'form.' + name,
          class extends PayloadForm {
            render() {
              this._pl_form = name
              return super.render()
            }
          }
        )
      },
    }
  ),
}

export default PayloadReact
