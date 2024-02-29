import PayloadReact from 'payload-react'
import {
  CardCode,
  CardNumber,
  Expiry,
  PayloadInput,
  PaymentForm,
  ProcessingForm,
  openProcessingForm,
} from 'payload-react'
import React, { useState } from 'react'

import './App.css'

function Example1() {
  return (
    <div>
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
    <div>
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

function Example3() {
  return (
    <ProcessingForm clientToken={process.env.REACT_APP_PAYLOAD_CLIENT_TOKEN} />
  )
}

function Example4() {
  return (
    <div style={{ marginTop: '25px' }}>
      <button
        className="btn btn-primary"
        onClick={(e) =>
          openProcessingForm({
            clientToken: process.env.REACT_APP_PAYLOAD_CLIENT_TOKEN,
          })
        }>
        Open Processing Form Modal
      </button>
    </div>
  )
}

function App() {
  return (
    <div className="App">
      <Example1 />
      <Example2 />
      <Example3 />
      <Example4 />
    </div>
  )
}

export default App
