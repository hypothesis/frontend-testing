import * as enzyme from 'enzyme';
import type { ReactWrapper } from 'enzyme';
import { FunctionComponent, JSX, VNode } from 'preact';

let containers: HTMLElement[] = [];
let wrappers: ReactWrapper[] = [];

export type MountOptions = {
  /**
   * If true, the element will be rendered in a container element which is
   * attached to `document.body`.
   */
  connected?: boolean;

  /**
   * When `connected` is true, allows customizing the DOM container in which the
   * component is mounted.
   * Useful to add custom styles and such.
   */
  prepareContainer?: (container: HTMLElement) => void;
};

export type EnzymeSelector = string | FunctionComponent<any>;

/**
 * Inspired by DefinitelyTyped's ReactWrapper.
 * @see https://github.com/DefinitelyTyped/DefinitelyTyped/blob/cebb88fecfa52f854826e216a537867c11b0150e/types/enzyme/index.d.ts
 */
export type ComponentWrapper<P = {}, S = {}> = {
  at(index: number): ComponentWrapper;
  childAt(index: number): ComponentWrapper<any, any>;

  closest<P2>(component: FunctionComponent<P2>): ComponentWrapper<P2, any>;
  closest(selector: string): ComponentWrapper<JSX.HTMLAttributes, any>;

  exists(selector?: EnzymeSelector): boolean;
  filterWhere(
    predicate: (wrapper: ComponentWrapper) => boolean,
  ): ComponentWrapper;

  find<P2>(component: FunctionComponent<P2>): ComponentWrapper<P2, any>;
  find(selector: string): ComponentWrapper<JSX.HTMLAttributes, any>;

  findWhere(
    predicate: (wrapper: ComponentWrapper<any, any>) => boolean,
  ): ComponentWrapper<any, any>;
  first(): ComponentWrapper<P, S>;
  forEach(
    fn: (wrapper: ComponentWrapper<P, S>, index: number) => any,
  ): ComponentWrapper<P, S>;
  getDOMNode(): HTMLElement;
  hasClass(className: string | RegExp): boolean;
  last(): ComponentWrapper<P, S>;
  length: number;
  map<V>(fn: (wrapper: ComponentWrapper<P, S>, index: number) => V): V[];
  prop<K extends keyof P>(key: K): P[K];
  props(): P;
  setProps<K extends keyof P>(props: Pick<P, K>): ComponentWrapper<P, S>;
  simulate(event: string, ...args: any[]): ComponentWrapper<P, S>;
  text(): string;
  unmount(): void;
  update(): ComponentWrapper<P, S>;
};

/**
 * Render a Preact component using Enzyme and return a wrapper.
 *
 * The component can be unmounted by calling `wrapper.unmount()` or by calling
 * {@link unmountAll} at the end of the test.
 */
export function mount<P = {}, S = {}>(
  jsx: VNode,
  { connected = false, prepareContainer }: MountOptions = {},
): ComponentWrapper<P, S> {
  let wrapper;
  if (connected) {
    const container = document.createElement('div');
    container.setAttribute('data-enzyme-container', '');
    containers.push(container);

    prepareContainer?.(container);
    document.body.append(container);

    wrapper = enzyme.mount(jsx, { attachTo: container });
  } else {
    wrapper = enzyme.mount(jsx);
  }

  wrappers.push(wrapper);

  return wrapper as ComponentWrapper<P, S>;
}

/**
 * Unmount all Preact components rendered using {@link mount} and remove their
 * parent container elements (if any) from the DOM.
 */
export function unmountAll() {
  wrappers.forEach(w => w.unmount());
  wrappers = [];

  containers.forEach(c => c.remove());
  containers = [];
}
