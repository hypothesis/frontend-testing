// Stubs for the Enzyme types used by this module. We are not using
// `@types/enzyme` because that brings in all the React types.

declare module 'enzyme' {
  import type { PreactElement } from 'preact';

  export class ReactWrapper {
    getDOMNode(): HTMLElement;
    getElements(): PreactElement[];
  }

  type MountOptions = {
    attachTo: HTMLElement;
  };

  export function mount(
    elementOrWrapper: VNode | ReactWrapper,
    options?: MountOptions,
  );
}
