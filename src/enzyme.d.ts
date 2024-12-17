// Stubs for the Enzyme types used by this module. We are not using
// `@types/enzyme` because that brings in all the React types.

declare module 'enzyme' {
  import { ComponentClass, FunctionComponent } from 'preact';

  export interface EnzymePropSelector {
    [key: string]: any;
  }

  export type EnzymeSelector =
    | string
    | FunctionComponent<any>
    | ComponentClass<any>
    | EnzymePropSelector;

  export class ReactWrapper<P = {}, S = {}, C = Component> {
    at(index: number): this;
    exists(selector?: EnzymeSelector): boolean;

    find<P2>(
      statelessComponent: FunctionComponent<P2>,
    ): ReactWrapper<P2, never>;
    find<P2>(component: ComponentType<P2>): ReactWrapper<P2, any>;
    find<C2 extends Component>(
      componentClass: ComponentClass<C2['props']>,
    ): ReactWrapper<C2['props'], C2['state'], C2>;
    find(props: EnzymePropSelector): ReactWrapper<any, any>;
    find(selector: string): ReactWrapper<HTMLAttributes, any>;

    forEach(fn: (wrapper: this, index: number) => any): this;
    getDOMNode(): HTMLElement;
    instance(): C;
    length: number;
    prop<K extends keyof P>(key: K): P[K];
    prop<T>(key: string): T;
    props(): P;
    setProps<K extends keyof P>(props: Pick<P, K>, callback?: () => void): this;
    simulate(event: string, ...args: any[]): this;
    text(): string;
    unmount(): void;
    update(): this;
  }

  export function mount(
    elementOrWrapper: VNode | ReactWrapper,
    options?: { attachTo?: HTMLElement },
  ): ReactWrapper;
}
