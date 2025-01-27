import PropTypes from 'prop-types'
import React, { forwardRef } from 'react'

import {
  checkoutAttributeMap,
  checkoutEventsMap,
  formEventsMap,
  formParamsMap,
  inputEventsMap,
  inputPropsMap,
  processingFormAttributeMap,
  processingFormEventsMap,
  sensitiveFields,
} from './mappings.js'
import { cacheCls, getPayload, getPropAttrs, invertObject } from './utils.js'

const PayloadFormContext = React.createContext(null)

/**
 * Represents a form input component that handles sensitive data.
 *
 * @class PayloadInput
 * @extends React.Component
 */
export class PayloadInput extends React.Component {
  /**
   * The context type for the component.
   *
   * @type {PayloadFormContext}
   */
  static contextType = PayloadFormContext

  /**
   * Creates an instance of PayloadInput.
   * @param {Object} props - The props for the component.
   */
  constructor(props) {
    super(props)
    this.props = props
    this.inputRef = React.createRef()
  }

  /**
   * Checks if the field is sensitive.
   *
   * @returns {boolean} - True if the field is sensitive, false otherwise.
   */
  isSensitiveField() {
    return sensitiveFields[
      this.props.attr || this._pl_input || this.props['pl-input']
    ]
  }

  /**
   * Adds event listeners when the component mounts.
   */
  componentDidMount() {
    if (!this.isSensitiveField()) return

    Object.entries(inputEventsMap).forEach(([key, value]) => {
      if (value in this.props)
        this.context.addListener(key, this.inputRef, (...args) =>
          this.props[value](...args)
        )
    })
  }

  /**
   * Removes event listeners when the component unmounts.
   */
  componentWillUnmount() {
    if (!this.isSensitiveField()) return

    Object.entries(inputEventsMap).forEach(([key, value]) => {
      if (value in this.props) this.context.removeListener(key, this.inputRef)
    })
  }

  /**
   * Renders an input element or a div element based on the props and sensitivity of the field.
   *
   * @returns {JSX.Element} - Returns a JSX element representing an input or div element.
   */
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

/**
 * Represents a form component that integrates with the Payload.js library for handling form submissions.
 *
 * @param {Object} props - The properties passed to the component.
 * @param {string} props.clientToken - The client token required for initializing the third-party library.
 * @param {Object} props.children - The child components to be rendered within the form.
 * @param {Function} props.Payload - (Development Use Only) The third-party library for handling form submissions.
 *
 * @returns {JSX.Element} - A form component integrated with the third-party library.
 *
 * @throws {Error} - If the client token is missing or if there is an issue initializing the third-party library.
 */
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

  /**
   * Asynchronously initializes the component by checking for the presence of a client token and Payload.js.
   * If the client token is not provided, the function will return early.
   * If Payload.js is not already stored in the component's state, it will attempt to retrieve it from the window object.
   * If Payload.js is successfully retrieved, it will be stored in the component's state.
   * Finally, the function will call the initializePayload method to initialize the Payload.js component.
   *
   * @returns {void}
   */
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

  /**
   * componentDidUpdate - Lifecycle method that is invoked immediately after updating occurs.
   *
   * @param {object} prevProps - The previous props before the update.
   * @param {object} prevState - The previous state before the update.
   * @param {object} snapshot - The snapshot value returned by getSnapshotBeforeUpdate.
   *
   * @returns {void}
   *
   * This method checks if the previous state did not have a Payload, but the current state does have a Payload.
   * If this condition is met, it calls the initializePayload method to initialize the Payload.js component.
   */
  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!prevState.Payload && this.state.Payload) {
      // Payload is set in our state we can initialize it
      this.initalizePayload()
    } else {
      this.updatePayload()
    }
  }

  /**
   * Initializes Payload.js for the form based on the client token and form parameters.
   *
   * @returns {void}
   */
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

  updatePayload() {
    if (this.props.payment) this.pl_form.params.payment = this.props.payment
    if (this.props.paymentMethod)
      this.pl_form.params[invertObject(formParamsMap).paymentMethod] =
        this.props.paymentMethod
  }

  /**
   * Adds a listener for a specific event.
   *
   * @param {string} evt - The event to listen for.
   * @param {Object} ref - The reference to the object that the listener is attached to.
   * @param {function} cb - The callback function to be executed when the event is triggered.
   * @returns {void}
   */
  addListener(evt, ref, cb) {
    const listeners = this.state.listeners
    if (!(evt in listeners)) listeners[evt] = []
    listeners[evt].push([ref, cb])
    this.setState({ listeners })
  }

  /**
   * Removes a listener from the event listeners list.
   *
   * @param {string} evt - The event name to remove the listener from.
   * @param {Object} ref - The reference to the listener function to be removed.
   *
   * @returns {void}
   */
  removeListener(evt, ref) {
    const listeners = this.state.listeners
    const index = listeners[evt]?.findIndex(([r]) => r === ref) ?? -1

    if (index != -1) {
      listeners[evt].splice(index, 1)
      this.setState({ listeners })
    }
  }

  /**
   * Submits the form using the Payload.js Form.submit method.
   *
   * This method triggers the submission of the form using the Payload.js library's Form.submit method.
   * It is important to note that this method does not handle the form submission logic itself,
   * but rather delegates it to the Payload.js library.
   *
   * @returns {Promise} A Promise that resolves when the form submission is successful.
   * @throws {Error} If the form submission fails or encounters an error.
   */
  submit() {
    return this.pl_form.submit()
  }

  render() {
    const attrs = getPropAttrs(this.props, [
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
        <form {...attrs} ref={this.formRef}>
          {this.props.children}
        </form>
      </PayloadFormContext.Provider>
    )
  }
}

/**
 * A higher order component that wraps <PayloadForm> for processing payments.
 *
 * @param {Object} children - The child components to be rendered within the PaymentForm.
 * @param {Object} props - Additional props to be passed to the PaymentForm component.
 * @param {Object} ref - A reference to the PaymentForm component.
 *
 * @returns {JSX.Element} - Returns a JSX element representing the PaymentForm component.
 */
export const PaymentForm = forwardRef(({ children, ...props }, ref) => {
  return (
    <PayloadForm ref={ref} pl-form="payment" {...props}>
      {children}
    </PayloadForm>
  )
})

/**
 * A higher order component that wraps <PayloadForm> for collecting payment method information.
 *
 * @param {Object} children - The child components to be rendered within the form.
 * @param {Object} props - Additional props to be passed to the form component.
 * @param {Object} ref - A reference to the form component.
 * @returns {JSX.Element} - The rendered form component with the provided children.
 */
export const PaymentMethodForm = forwardRef(({ children, ...props }, ref) => {
  return (
    <PayloadForm ref={ref} pl-form="payment_method" {...props}>
      {children}
    </PayloadForm>
  )
})

/**
 * Creates a card input component.
 *
 * @param {Object} props - The properties to be passed to the component.
 * @returns {JSX.Element} - A card input component.
 */
export const Card = (props) => {
  return <PayloadInput pl-input="card" {...props} />
}

/**
 * Creates a card number input component.
 *
 * @param {Object} props - The properties to be passed to the component.
 * @returns {JSX.Element} - A card number input component.
 */
export const CardNumber = (props) => {
  return <PayloadInput pl-input="card_number" {...props} />
}

/**
 * Creates an expiry input component.
 *
 * @param {Object} props - The properties to be passed to the component.
 * @returns {JSX.Element} - An expiry input component.
 */
export const Expiry = (props) => {
  return <PayloadInput pl-input="expiry" {...props} />
}

/**
 * Creates a card code input component.
 *
 * @param {Object} props - The properties to be passed to the component.
 * @returns {JSX.Element} - A card code input component.
 */
export const CardCode = (props) => {
  return <PayloadInput pl-input="card_code" {...props} />
}

/**
 * Renders an input field for routing number.
 *
 * @param {Object} props - The props to be passed to the component.
 * @returns {JSX.Element} - A JSX element representing the input field for routing number.
 */
export const RoutingNumber = (props) => {
  return <PayloadInput pl-input="routing_number" {...props} />
}

/**
 * Renders an input field for account number.
 *
 * @param {Object} props - The props to be passed to the component.
 * @returns {JSX.Element} - A JSX element representing the input field for account number.
 */
export const AccountNumber = (props) => {
  return <PayloadInput pl-input="account_number" {...props} />
}

/**
 * ProcessingAccountForm component for rendering a processing account form
 *
 * This component is responsible for rendering a processing account form using the provided client token.
 * It initializes the Payload.js object, sets up event listeners, and renders the form using the provided props.
 *
 * @param {Object} props - The props object containing the Payload object and client token
 * @param {string} props.clientToken - The client token used for authentication
 * @param {Object} props.Payload - (Development Use Only) The Payload object used for processing account form
 *
 * @returns {JSX.Element} - The rendered processing account form component
 *
 * @throws {Error} - If the client token is not provided
 */
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

  /**
   * Asynchronously initializes the component by checking for the presence of a client token and payload.
   * If the client token is not present, the function returns early.
   * If Payload.js is not present in the component state, it checks if Payload.js is available in the global window object.
   * If Payload.js is not available in the global window object, it fetches Payload.js using the getPayload function.
   * Once Payload.js is available, it updates the component state with Payload object.
   * If Payload.js is already present in the component state, it calls the initializePayload function.
   *
   * @returns {void}
   */
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

  /**
   * componentDidUpdate - Lifecycle method that is called after a component has been updated.
   *
   * @param {object} prevProps - The previous props of the component.
   * @param {object} prevState - The previous state of the component.
   * @param {object} snapshot - The snapshot value returned by getSnapshotBeforeUpdate.
   *
   * @returns {void}
   *
   * This method checks if the previous state did not have a 'Payload' property but the current state does.
   * If this condition is met, initialize Payload and create a new 'ProcessingAccount' object.
   * It then maps certain props from the component to the 'ProcessingAccount' object and sets up event listeners.
   */
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

/**
 * Opens the processing account form using the provided props.
 *
 * @param {Object} props - The props object containing the necessary information to populate the form.
 * @returns {Promise<Object>} - A Promise that resolves to the processing account object.
 */
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

/**
 * Checkout component for handling payment processing
 *
 * @param {Object} props - The props for the Checkout component
 * @param {string} props.clientToken - The client token for authentication
 * @param {Object} props.Payload - (Development Use Only) The Payload object for payment processing
 *
 * @returns {JSX.Element} - The rendered Checkout component
 *
 * @throws {Error} - If clientToken is not provided
 */
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

  /**
   * Asynchronously initializes the component by checking for the presence of a client token and payload.
   * If the client token is not present, the function returns early.
   * If Payload.js is not present in the component state, it checks if Payload.js is available in the global window object.
   * If Payload.js is not available in the global window object, it fetches Payload.js using the getPayload function.
   * Once Payload.js is available, it updates the component state with the Payload object.
   * If Payload.js is already present in the component state, it calls the initializePayload function.
   *
   * @returns {void}
   */
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

  /**
   * componentDidUpdate - Lifecycle method that is called after a component has been updated.
   *
   * @param {object} prevProps - The previous props of the component.
   * @param {object} prevState - The previous state of the component.
   * @param {object} snapshot - The snapshot value returned by getSnapshotBeforeUpdate.
   *
   * @returns {void}
   *
   * This method checks if the previous state did not have a 'Payload' property but the current state does.
   * If this condition is met, it initializes the 'Payload' and creates a new 'Checkout' instance using the 'Payload'.
   * It then sets up event listeners for the 'Checkout' instance based on the 'checkoutEventsMap' and calls corresponding props functions.
   */
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

/**
 * Opens Payload.js Checkout using the provided props and returns the checkout object.
 *
 * @param {Object} props - The props object containing clientToken and other checkout attributes.
 * @returns {Object} - The checkout object created using the provided props.
 * @throws {Error} - If there is an issue with getting Payload.js object or creating the checkout object.
 */
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

/**
 * @deprecated Use PayloadForm and PayloadInput and their higher order components
 */
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
              this._pl_form_type = name
              return super.render()
            }
          }
        )
      },
    }
  ),
}

export default PayloadReact
