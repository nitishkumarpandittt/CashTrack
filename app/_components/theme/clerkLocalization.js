/**
 * Clerk fills `{{applicationName}}` from the application's name in the Clerk
 * dashboard, which is still "finance-app". Every string that shows that name
 * is overridden here so the product name matches the rest of the UI. Renaming
 * the application in the dashboard would make these redundant, not wrong.
 */
const APP_NAME = "CashTrack";

export const clerkLocalization = {
  signIn: {
    start: {
      title: `Sign in to ${APP_NAME}`,
      titleCombined: `Continue to ${APP_NAME}`,
    },
    emailCode: { subtitle: `to continue to ${APP_NAME}` },
    phoneCode: { subtitle: `to continue to ${APP_NAME}` },
    alternativePhoneCodeProvider: { subtitle: `to continue to ${APP_NAME}` },
  },
  signUp: {
    start: {
      title: `Create your ${APP_NAME} account`,
      titleCombined: `Create your ${APP_NAME} account`,
    },
    alternativePhoneCodeProvider: { title: `Sign up to ${APP_NAME} with {{provider}}` },
  },
  organizationList: { subtitle: `to continue to ${APP_NAME}` },
  oauthConsent: { subtitle: `wants to access ${APP_NAME} on behalf of {{identifier}}` },
};
