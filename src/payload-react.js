import PropTypes from 'prop-types'
import React from 'react'

import { getPayload } from './utils'

function getPropAttrs(props) {
  const attrs = {}
  for (const key in props) {
    if (key == 'children') continue
    attrs[key] = props[key]
  }
  return attrs
}

const __cls_cache = {}

function cacheCls(name, cls) {
  if (!(name in __cls_cache)) __cls_cache[name] = cls
  return __cls_cache[name]
}

class PayloadInput extends React.Component {
  render() {
    const attrs = getPropAttrs(this.props)
    if (this._pl_input) attrs['pl-input'] = this._pl_input

    return <div {...attrs}></div>
  }
}

class PayloadForm extends React.Component {
  constructor(props) {
    super(props)
    this.props = props
    this.state = {
      Payload: props.Payload ? props.Payload : null,
    }
    this.newForm = React.createRef()
  }
  async componentDidMount() {
    if (!this.props.client_token) {
      return
    }

    if (!this.state.Payload) {
      if (!window.Payload) {
        await getPayload()
      }
      this.setState((state) => ({ ...state, Payload: window.Payload }))
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!prevState.Payload && this.state.Payload) {
      // Payload it's set in our state we can initialize it
      this.state.Payload(this.props.client_token)
      this.pl_form = new this.state.Payload.Form({
        form: this.newForm.current,
      })
    }
  }

  render() {
    const attrs = getPropAttrs(this.props)

    if (this._pl_form) attrs['pl-form'] = this._pl_form

    return (
      <form {...attrs} ref={this.newForm}>
        {this.props.children}
      </form>
    )
  }
}

PayloadForm.propTypes = {
  client_token: PropTypes.string.isRequired,
  Payload: PropTypes.func,
}

const PayloadReact = {
  sensitive_fields: {
    account_number: true,
    routing_number: true,
    card_code: true,
    cvc: true,
    card_number: true,
    expiry: true,
    card: true,
  },
  input: new Proxy(
    {},
    {
      get(target, name) {
        if (PayloadReact.sensitive_fields[name])
          return cacheCls(
            'input.' + name,
            class extends PayloadInput {
              render() {
                this._pl_input = name
                return super.render()
              }
            }
          )
        else
          return cacheCls(
            'input.' + name,
            class extends React.Component {
              render() {
                return <input pl-input={name} {...this.props} />
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
