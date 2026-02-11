export const sensitiveFields: Record<string, boolean> = {
  account_number: true,
  routing_number: true,
  card_code: true,
  cvc: true,
  card_number: true,
  expiry: true,
  card: true,
}

export const formParamsMap = {
  autosubmit: 'autoSubmit',
  styles: 'styles',
  payment: 'payment',
  payment_method: 'paymentMethod',
  preventDefaultOnSubmit: 'preventDefaultOnSubmit',
  preventSubmitOnEnter: 'preventSubmitOnEnter',
} as const

export const formEventsMap = {
  processing: 'onProcessing',
  processed: 'onProcessed',
  authorized: 'onAuthorized',
  error: 'onError',
  declined: 'onDeclined',
  created: 'onCreated',
  success: 'onSuccess',
} as const

export const inputPropsMap = {
  'disable-paste': 'disablePaste',
} as const

export const inputEventsMap = {
  invalid: 'onInvalid',
  valid: 'onValid',
  focus: 'onFocus',
  blur: 'onBlur',
  change: 'onChange',
} as const

export const ignoredEventsForStandardInput = [
  'onFocus',
  'onBlur',
  'onChange',
] as const

export const processingFormEventsMap = {
  success: 'onSuccess',
  account_created: 'onAccountCreated',
  loaded: 'onLoaded',
  closed: 'onClosed',
} as const

export const processingFormAttributeMap = {
  form: 'form',
  legal_entity_id: 'legalEntityId',
} as const

export const checkoutEventsMap = {
  processed: 'onProcessed',
  authorized: 'onAuthorized',
  declined: 'onDeclined',
  success: 'onSuccess',
  loaded: 'onLoaded',
  closed: 'onClosed',
} as const

export const checkoutAttributeMap = {
  form: 'form',
  autosubmit: 'autoSubmit',
  amount: 'amount',
} as const
