# Payload.js React Library

A React library for integrating [Payload.js](https://docs.payload.co/#secure-input) Secure Input.

## Installation

## Install using npm

```bash
npm install payload-react
```

## Get Started

Once you've installed the Payload.js React library to your environment,
import the `payload-react` module to get started. **Note:** We recommend
using the shorthand name of `pl` when importing.

```javascript
import pl from 'payload-react';
```

### API Authentication

To authenticate with the Payload, you'll need a live or test client key for Payload.js. Client API
keys are accessible from within the Payload dashboard.

*Note* Remember to include Payload.js with `<script src="https://payload.co/Payload.js"></script>`.

```javascript
Payload('client_key_2zsp9Pske5l2Bgcy3bySES')
```

### Simple Checkout Form

Below is an example of a react checkout form utilizing Payload.js Secure Inputs and styled
with Bootstrap 4.

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import pl from 'payload-react';

Payload('client_key_2zsp9Pske5l2Bgcy3bySES')

var form = ReactDOM.render(
	<pl.form.payment id="checkout-form" className="container">
		<pl.input.amount type="hidden" value="10.00"/>
		<div className="row pt-2">
			<div className="form-group col-7 px-1">
				<label>Card Number</label>
				<pl.input.card_number className="form-control"/>
			</div>
			<div className="form-group col-3 px-1">
				<label>Expiration</label>
				<pl.input.expiry className="form-control"/>
			</div>
			<div className="form-group col-2 px-1">
				<label>CVC</label>
				<pl.input.cvc className="form-control"/>
			</div>
		</div>
		<div className="row pt-2">
			<button className="btn btn-primary" type="submit">Pay Now</button>
		</div>
	</pl.form.payment>, document.getElementById('root')
);

form.pl_form.params.styles = { invalid: "is-invalid" }

form.pl_form.on('processed', function(data) {
	console.log('processed', data)
})
```

## Documentation

To get further information on the Payload.js Secure Input library and capabilities,
visit the unabridged [Payload Documentation](https://docs.payload.co/?javascript).
