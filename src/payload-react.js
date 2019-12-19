import React from 'react';
import ReactDOM from 'react-dom';

function getPropAttrs(props) {
	var attrs = {}
	for ( var key in props ) {
		if ( key == 'children' ) continue
		attrs[key] = props[key]
	}
	return attrs
}

class PayloadInput extends React.Component {

	render() {
		var attrs = getPropAttrs(this.props)
		if ( this._pl_input )
			attrs['pl-input'] = this._pl_input

		return ( <div {...attrs}></div> )
	}
};

class PayloadForm extends React.Component {

	componentDidMount() {
		var node = ReactDOM.findDOMNode(this)
		Payload(Payload.client_key)

		this.pl_form = new Payload.Form({
			form: node
		})
	}

	render() {
		var attrs = getPropAttrs(this.props)
		if ( this._pl_form )
			attrs['pl-form'] = this._pl_form

		return (
			<form {...attrs}>
			{this.props.children}
			</form>
		)
	}
}

var PayloadReact = {
	sensitive_fields: {
		'account_number': true, 'routing_number': true,
		'card_code': true, 'card_number': true, 'expiry': true},
	input: new Proxy({},{get(target, name) {
		if ( PayloadReact.sensitive_fields[name] )
			return class extends PayloadInput {
				render() {
					this._pl_input = name
					return super.render()
				}
			}
		else
			return class extends React.Component {
				render() {
					return ( <input pl-input={name} {...this.props} /> )
				}
			}
	}}),

	select: new Proxy({},{get(target, name) {
		return class extends React.Component {
			render() {
				var attrs = getPropAttrs(this.props)
				return (
					<select pl-input={name} {...attrs}>
						{this.props.children}
					</select>
				)
			}
		}
	}}),

	form: new Proxy({},{get(target,name) {
		return class extends PayloadForm {
			render() {
				this._pl_form = name
				return super.render()
			}
		}
	}}),
}

export default PayloadReact
