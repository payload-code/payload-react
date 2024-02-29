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
}

const inputEventsMap = {
  invalid: 'onInvalid',
  valid: 'onValid',
  focus: 'onFocus',
  blur: 'onBlur',
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

  componentDidMount() {
    Object.entries(inputEventsMap).forEach(([key, value]) => {
      if (value in this.props)
        this.context.addListener(key, this.inputRef, (...args) =>
          this.props[value](...args)
        )
    })
  }

  componentWillUnmount() {
    Object.entries(inputEventsMap).forEach(([key, value]) => {
      if (value in this.props) this.context.removeListener(key, this.inputRef)
    })
  }

  render() {
    const attrs = getPropAttrs(this.props, Object.values(inputEventsMap))

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

export class ProcessingForm extends React.Component {
  constructor(props) {
    super(props)
    this.props = props
    this.state = {
      Payload: props.Payload ? props.Payload : null,
      listeners: {},
    }
    this.procFormRef = React.createRef()
    this.processingAccount = null
    this.events = props.events?.length > 0 ? [...props.events] : []

    if (this.props.events) {
      delete this.props.events
    }
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
      this.processingAccount = new this.state.Payload.ProcessingAccount({
        container: this.procFormRef.current,
        client_key: this.props.clientToken,
        ...this.props,
      })

      for (const event of this.events) {
        this.processingAccount.on(event.name, event.fn)
      }
    }
  }

  initalizePayload() {
    this.state.Payload(this.props.clientToken)
  }

  render() {
    return <div ref={this.procFormRef}></div>
  }
}

export const openProcessingForm = async (props) => {
  await getPayload()
  const events = props.events?.length > 0 ? [...props.events] : []
  if (props.events) {
    delete props.events
  }

  const processingAccount = new window.Payload.ProcessingAccount({
    client_key: props.clientToken,
    ...props,
  })

  for (const event of events) {
    processingAccount.on(event.name, event.fn)
  }
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
