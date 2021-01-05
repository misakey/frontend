import { forwardRef } from 'react';

import { useTranslation } from 'react-i18next';

import Typography from '@material-ui/core/Typography';

const TypographyIrreversible = forwardRef((props, ref) => {
  const { t } = useTranslation('common');

  return (
    <Typography
      ref={ref}
      variant="caption"
      color="textSecondary"
      {...props}
    >
      {t('common:irreversible')}
    </Typography>
  );
});

export default TypographyIrreversible;
