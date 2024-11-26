// Stubs for the Enzyme types used by this module. We are not using
// `@types/enzyme` because that brings in all the React types.

declare module 'enzyme' {
  export class ReactWrapper {
    getDOMNode(): HTMLElement;
    unmount(): void;
  }

  export function mount(
    elementOrWrapper: VNode | ReactWrapper,
    options?: { attachTo?: HTMLElement },
  ): ReactWrapper;
}
