export {};

declare global {
  interface Window {
    Devault: any;
    grecaptcha: any;
  }

  interface HTMLElement {
    // TODO: no idea what the exact type is
    __vue__: any;
  }
}
