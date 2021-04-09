import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

// HOOKS
export default ({ displayError, errorKeys, field, helperText, ...rest }) => {
  const { t } = useTranslation('fields');

  const helperTextOrErrorText = useMemo(
    () => (displayError ? t(errorKeys) : helperText),
    [displayError, errorKeys, helperText, t],
  );

  return useMemo(
    () => {
      const { form, prefix, suffix, ...restProps } = rest;
      return {
        ...field,
        ...restProps,
        error: displayError,
        helperText: helperTextOrErrorText,
      };
    },
    [field, rest, displayError, helperTextOrErrorText],
  );
};
