# Payload.js React Library

A React library for integrating [Payload.js](https://docs.payload.co/#secure-input) Secure Input.

## Installation

## Install using npm

```bash
npm install payload-react
```

## Get Started

Once you've installed the Payload.js React library to your environment,
import the `payload-react` components to get started.

```javascript
import {
    PaymentForm,
    PaymentMethodForm,
    PayloadInput,
    CardNumber,
    Expiry,
    CardCode,
    RoutingNumber,
    AccountNumber,
    ProcessingAccountForm,
    openProcessingAccountForm
} from 'payload-react';
```

### API Authentication

To authenticate with the Payload, you'll need a live or test client token for Payload.js. Client tokens can be generated using the secret key accessible from within the Payload dashboard. For more information on generating a client token, see [Authentication](https://docs.payload.co/ui/authentication/).

### Simple Checkout Form

Below is an example of a react checkout form utilizing Payload.js Secure Inputs and styled
with Bootstrap 4.

```javascript
import React from 'react';
import {
    PaymentForm,
    PayloadInput,
    CardNumber,
    Expiry,
    CardCode
} from 'payload-react';

function CheckoutForm() {
    return <PaymentForm
      clientToken='client_key_2zsp9Pske5l2Bgcy3bySES'
      className="container"
      styles={{invalid: 'is-invalid'}}
      onProcessed={(evt)=>{
        console.log('processed', evt.transaction_id)
      }}
      onError={(evt)=>{
        alert(evt.message)
      }}
    >
        <PayloadInput attr="amount" type="hidden" value="10.00"/>
        <div className="row pt-2">
            <div className="form-group col-7 px-1">
                <label>Card</label>
                <CardNumber className="form-control" onInvalid={(evt)=>{
                    alert(evt.message)
                }}/>
            </div>
            <div className="form-group col-3 px-1">
                <label>Expiration</label>
                <Expiry className="form-control" onInvalid={(evt)=>{
                    alert(evt.message)
                }}/>
            </div>
            <div className="form-group col-2 px-1">
                <label>CVC</label>
                <CardCode className="form-control"/>
            </div>
        </div>
        <div className="row pt-2">
            <button className="btn btn-primary" type="submit">Pay Now</button>
        </div>
    </PaymentForm>
}
```

### Processing Account Form

Below is an example of how to open the Payload.js ProcessingAccountForm modal from react.

```javascript
import {
    openProcessingAccountForm
} from 'payload-react';

function OnboardButton() {
    return <button
        className="btn btn-primary"
        onClick={(e) =>
          openProcessingAccountForm({
            clientToken: 'client_key_2zsp9Pske5l2Bgcy3bySES',
            onSuccess(evt) {
                console.log(evt.account.id)
            }
          })
        }>
        Open Processing Account Form Modal
    </button>
}
```

## Documentation

To get further information on the Payload.js Secure Input library and capabilities,
visit the unabridged [Payload Documentation](https://docs.payload.co/ui/payload-react/).
