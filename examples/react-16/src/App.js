import PayloadReact from 'payload-react'
import {
  CardCode,
  CardNumber,
  Checkout,
  Expiry,
  PayloadInput,
  PaymentForm,
  ProcessingAccountForm,
  openCheckout,
  openProcessingAccountForm,
} from 'payload-react'
import React, { useState } from 'react'

import './App.css'

function Example1() {
  return (
    <div className="mt-5">
      <h3>Card Payment Example - deprecated</h3>
      {/* eslint-disable-next-line */}
      <PayloadReact.form.payment
        clientToken={process.env.REACT_APP_PAYLOAD_CLIENT_TOKEN}
        className="container">
        <PayloadReact.input.amount type="hidden" value="10.00" />
        <div className="row pt-2">
          <div className="form-group col7 px-1">
            <label>Card</label>
            {/* eslint-disable-next-line */}
            <PayloadReact.input.card className="form-control" />
          </div>
        </div>
        <div className="row pt-2">
          <button className="btn btn-primary" type="submit">
            Pay Now
          </button>
        </div>
      </PayloadReact.form.payment>
    </div>
  )
}

function Example2() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [invalidExpiry, setInvalidExpiry] = useState(false)
  const [invalidCardNumber, setInvalidCardNumber] = useState(false)
  const [invalidCardCode, setInvalidCardCode] = useState(false)

  return (
    <div className="mt-5">
      <h3>Card Payment Example - New Component Design</h3>
      <PaymentForm
        clientToken={process.env.REACT_APP_PAYLOAD_CLIENT_TOKEN}
        className="container"
        styles={{ invalid: 'is-invalid' }}
        autoSubmit={false}
        onProcessing={(data) => {
          setIsProcessing(true)
        }}
        onProcessed={(data) => {
          setIsProcessing(false)
          alert('Payment Processed')
        }}
        onDeclined={(data) => {
          setIsProcessing(false)
          alert('Payment Declined')
        }}
        onError={() => {
          setIsProcessing(false)
        }}>
        <PayloadInput attr="amount" type="hidden" value="10.00" />
        <div className="row pt-2">
          <div className="form-group col-7 px-1">
            <label>Card Number</label>
            <CardNumber
              className="form-control"
              onInvalid={(evt) => setInvalidCardNumber(evt.message)}
              onValid={(evt) => setInvalidCardNumber(false)}
            />
            {!!invalidCardNumber && (
              <div class="invalid-feedback d-block">{invalidCardNumber}</div>
            )}
          </div>
          <div className="form-group col-3 px-1">
            <label>Expiration</label>
            <Expiry
              className="form-control"
              onInvalid={(evt) => setInvalidExpiry(evt.message)}
              onValid={(evt) => setInvalidExpiry(evt.message)}
            />
            {!!invalidExpiry && (
              <div class="invalid-feedback d-block">{invalidExpiry}</div>
            )}
          </div>
          <div className="form-group col-2 px-1">
            <label>CVC</label>
            <CardCode
              className="form-control"
              onInvalid={(evt) => setInvalidCardCode(evt.message)}
              onValid={(evt) => setInvalidCardCode(false)}
            />
            {!!invalidCardCode && (
              <div class="invalid-feedback d-block">{invalidCardCode}</div>
            )}
          </div>
        </div>
        <div className="row pt-2">
          <button
            className="btn btn-primary"
            type="submit"
            disabled={isProcessing}>
            Pay Now
          </button>
        </div>
      </PaymentForm>
    </div>
  )
}

function ProcessingFormComponentExample() {
  return (
    <div className="mt-5">
      <h3>Embedded Processing Form Example</h3>
      <ProcessingAccountForm
        clientToken={process.env.REACT_APP_PAYLOAD_CLIENT_TOKEN}
        onLoaded={() => {
          console.log('loaded')
        }}
        onAccountCreated={() => {
          console.log('created')
        }}
      />
    </div>
  )
}

function ProcessingFormOpenFunctionExample() {
  return (
    <div className="mt-5">
      <h3>Processing Form Modal Example</h3>
      <button
        className="btn btn-primary"
        onClick={(e) =>
          openProcessingAccountForm({
            clientToken: process.env.REACT_APP_PAYLOAD_CLIENT_TOKEN,
          })
        }>
        Open Processing Account Form Modal
      </button>
    </div>
  )
}

function CheckoutComponentExample() {
  return (
    <div className="mt-5">
      <h3>Checkout Component Example</h3>
      <Checkout
        clientToken={process.env.REACT_APP_PAYLOAD_CLIENT_TOKEN}
        amount={100}
        onLoaded={() => {
          console.log('loaded')
        }}
        onProcessed={() => {
          console.log('processed')
        }}
      />
    </div>
  )
}

function CheckoutOpenFunctionExample() {
  return (
    <div className="mt-5">
      <h3>Checkout Modal Example</h3>
      <button
        className="btn btn-primary"
        onClick={(e) =>
          openCheckout({
            clientToken: process.env.REACT_APP_PAYLOAD_CLIENT_TOKEN,
            amount: 100,
          })
        }>
        Open Checkout Modal
      </button>
    </div>
  )
}

function App() {
  return (
    <div className="App">
      <Example1 />
      <hr />
      <Example2 />
      <hr />
      <ProcessingFormComponentExample />
      <hr />
      <ProcessingFormOpenFunctionExample />
      <hr />
      <CheckoutComponentExample />
      <hr />
      <CheckoutOpenFunctionExample />
    </div>
  )
}

export default App
