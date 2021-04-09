import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export default ({ name, prefix, suffix }) => {
  const { t } = useTranslation('fields');
  const label = useMemo(
    () => t([`fields:${prefix}${name}${suffix}.label`, `fields:${name}.label`], ''),
    [name, prefix, suffix, t],
  );
  const placeholder = useMemo(
    () => t([`fields:${prefix}${name}${suffix}.placeholder`, `fields:${name}.placeholder`], ''),
    [name, prefix, suffix, t],
  );
  const helperText = useMemo(
    () => t([`fields:${prefix}${name}${suffix}.helperText`, `fields:${name}.helperText`], ''),
    [name, prefix, suffix, t],
  );

  return useMemo(
    () => ({ label, placeholder, helperText }),
    [label, placeholder, helperText],
  );
};
