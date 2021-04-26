import { WEBAUTHN, IDENTITY_PASSWORD, IDENTITY_EMAILED_CODE, TOTP } from '@misakey/core/auth/constants/amr';
import logSentryException from '@misakey/core/helpers/log/sentry/exception';

// IDENTITY_EMAILED_CODE can always be performed
const DEFAULT = IDENTITY_EMAILED_CODE;

export default ({ currentAcr, availableAmrs }, resetPassword = false) => {
  switch (currentAcr) {
    case '0':
      return availableAmrs.includes(IDENTITY_PASSWORD) && !resetPassword
        ? IDENTITY_PASSWORD
        : IDENTITY_EMAILED_CODE;
    case '1':
    case '2':
      if (availableAmrs.includes(TOTP)) { return TOTP; }
      if (availableAmrs.includes(WEBAUTHN)) { return WEBAUTHN; }
      logSentryException(
        new Error(`currentAcr=${currentAcr} but there is no corresponding amrs available: ${availableAmrs}`),
        'computeNextAuthMethod',
        { auth: true },
      );
      return DEFAULT;
    default:
      logSentryException(
        new Error(`No method defined for currentAcr: ${currentAcr}`),
        'computeNextAuthMethod',
        { auth: true },
      );
      return DEFAULT;
  }
};
