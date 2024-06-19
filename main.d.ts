declare module "utils" {
    export function getPayload(): any;
}
declare module "payload-react" {
    export class PayloadInput {
        static contextType: any;
        constructor(props: any);
        props: any;
        inputRef: any;
        isSensitiveField(): any;
        componentDidMount(): void;
        componentWillUnmount(): void;
        render(): JSX.Element;
    }
    export class PayloadForm {
        constructor(props: any);
        props: any;
        state: {
            Payload: any;
            listeners: {};
        };
        formRef: any;
        componentDidMount(): Promise<void>;
        componentDidUpdate(prevProps: any, prevState: any, snapshot: any): void;
        initalizePayload(): void;
        pl_form: any;
        addListener(evt: any, ref: any, cb: any): void;
        removeListener(evt: any, ref: any): void;
        render(): JSX.Element;
    }
    export namespace PayloadForm {
        namespace propTypes {
            let clientToken: any;
            let Payload: any;
        }
    }
    export function PaymentForm({ children, ...props }: {
        [x: string]: any;
        children: any;
    }): JSX.Element;
    export function PaymentMethodForm({ children, ...props }: {
        [x: string]: any;
        children: any;
    }): JSX.Element;
    export function Card(props: any): JSX.Element;
    export function CardNumber(props: any): JSX.Element;
    export function Expiry(props: any): JSX.Element;
    export function CardCode(props: any): JSX.Element;
    export function RoutingNumber(props: any): JSX.Element;
    export function AccountNumber(props: any): JSX.Element;
    export class ProcessingAccountForm {
        constructor(props: any);
        props: any;
        state: {
            Payload: any;
        };
        procFormRef: any;
        processingAccount: any;
        excludeProps: string[];
        componentDidMount(): Promise<void>;
        componentDidUpdate(prevProps: any, prevState: any, snapshot: any): void;
        initalizePayload(): void;
        render(): JSX.Element;
    }
    export function openProcessingAccountForm(props: any): Promise<any>;
    export class Checkout {
        constructor(props: any);
        props: any;
        state: {
            Payload: any;
        };
        checkoutRef: any;
        checkout: any;
        excludeProps: string[];
        componentDidMount(): Promise<void>;
        componentDidUpdate(prevProps: any, prevState: any, snapshot: any): void;
        initalizePayload(): void;
        render(): JSX.Element;
    }
    export function openCheckout(props: any): Promise<any>;
    export default PayloadReact;
    namespace PayloadReact {
        let input: {};
        let select: {};
        let form: {};
    }
}
