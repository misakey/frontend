import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export default ({ name, prefix }) => {
  const { t } = useTranslation('fields');
  const label = useMemo(
    () => t([`fields:${prefix}${name}.label`, `fields:${name}.label`], ''),
    [name, prefix, t],
  );
  const placeholder = useMemo(
    () => t([`fields:${prefix}${name}.placeholder`, `fields:${name}.placeholder`], ''),
    [name, prefix, t],
  );
  const helperText = useMemo(
    () => t([`fields:${prefix}${name}.helperText`, `fields:${name}.helperText`], ''),
    [name, prefix, t],
  );

  return useMemo(
    () => ({ label, placeholder, helperText }),
    [label, placeholder, helperText],
  );
};
