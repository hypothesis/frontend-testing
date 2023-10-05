// Stubs for the Enzyme types used by this module. We are not using
// `@types/enzyme` because that brings in all the React types.

declare module 'enzyme' {
  export class ReactWrapper {
    getDOMNode(): HTMLElement;
  }

  export function mount(
    elementOrWrapper: VNode | ReactWrapper,
    { attachTo: HTMLElement },
  );
}
