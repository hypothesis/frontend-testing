import * as enzyme from 'enzyme';
import type { ReactWrapper } from 'enzyme';
import type { VNode } from 'preact';

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

/**
 * Render a Preact component using Enzyme and return a wrapper.
 *
 * The component can be unmounted by calling `wrapper.unmount()` or by calling
 * {@link unmountAll} at the end of the test.
 */
export function mount(
  jsx: VNode,
  { connected = false, prepareContainer }: MountOptions = {},
) {
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

  return wrapper;
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
