import React, { useRef } from 'react'
import PayloadReact from 'payload-react'

function App() {
  const formRef = useRef()
  return (
    <div className="App">
      <PayloadReact.form.payment
        client_token=""
        className="container"
        ref={formRef}
      >
        <PayloadReact.input.amount type="hidden" value="10.00" />
        <div className="row pt-2">
          <div className="form-group col7 px-1">
            <label>Card Number</label>
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

export default App
