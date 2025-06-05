const name: string = window.Devault.Name || "Devault";
const company: string = window.Devault.Name || "Build With Saksham";
const disableExternal: boolean = window.Devault.DisableExternal;
const disableUsedPercentage: boolean = window.Devault.DisableUsedPercentage;
const baseURL: string = window.Devault.BaseURL;
const staticURL: string = window.Devault.StaticURL;
const recaptcha: string = window.Devault.ReCaptcha;
const recaptchaKey: string = window.Devault.ReCaptchaKey;
const signup: boolean = window.Devault.Signup;
const version: string = window.Devault.Version;
const logoURL = `${staticURL}/img/logo.svg`;
const noAuth: boolean = window.Devault.NoAuth;
const authMethod = window.Devault.AuthMethod;
const loginPage: boolean = window.Devault.LoginPage;
const theme: UserTheme = window.Devault.Theme;
const enableThumbs: boolean = window.Devault.EnableThumbs;
const resizePreview: boolean = window.Devault.ResizePreview;
const enableExec: boolean = window.Devault.EnableExec;
const tusSettings = window.Devault.TusSettings;
const origin = window.location.origin;
const tusEndpoint = `/api/tus`;

export {
  name,
  company,
  disableExternal,
  disableUsedPercentage,
  baseURL,
  logoURL,
  recaptcha,
  recaptchaKey,
  signup,
  version,
  noAuth,
  authMethod,
  loginPage,
  theme,
  enableThumbs,
  resizePreview,
  enableExec,
  tusSettings,
  origin,
  tusEndpoint,
};
