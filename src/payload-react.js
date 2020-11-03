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

var __cls_cache = {}

function cacheCls(name, cls) {
	if ( !(name in __cls_cache) )
		__cls_cache[name] = cls
	return __cls_cache[name]
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
		Payload(Payload.client_key)
	}

	form(node) {
		if (!node || node == this.form) return

		this.form = node

		this.pl_form = new Payload.Form({
			form: node
		})
	}

	render() {
		var attrs = getPropAttrs(this.props)
		if ( this._pl_form )
			attrs['pl-form'] = this._pl_form

		return (
			<form {...attrs} ref={this.form.bind(this)}>
			{this.props.children}
			</form>
		)
	}
}

var PayloadReact = {
	sensitive_fields: {
		'account_number': true, 'routing_number': true,
		'card_code': true, 'cvc': true, 'card_number': true, 'expiry': true},
	input: new Proxy({},{get(target, name) {
		if ( PayloadReact.sensitive_fields[name] )
			return cacheCls('input.'+name, class extends PayloadInput {
				render() {
					this._pl_input = name
					return super.render()
				}
			})
		else
			return cacheCls('input.'+name, class extends React.Component {
				render() {
					return ( <input pl-input={name} {...this.props} /> )
				}
			})
	}}),

	select: new Proxy({},{get(target, name) {
		return cacheCls('select.'+name, class extends React.Component {
			render() {
				var attrs = getPropAttrs(this.props)
				return (
					<select pl-input={name} {...attrs}>
						{this.props.children}
					</select>
				)
			}
		})
	}}),

	form: new Proxy({},{get(target,name) {
		return cacheCls( 'form.'+name, class extends PayloadForm {
			render() {
				this._pl_form = name
				return super.render()
			}
		})
	}})
}

export default PayloadReact
