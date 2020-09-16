
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import isNil from '@misakey/helpers/isNil';
import ButtonWithDialogPassword from 'components/smart/Dialog/Password/with/Button';
import withDialogCreate from 'components/smart/Dialog/Boxes/Create/with';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import BoxControls from '@misakey/ui/Box/Controls';
import { getCurrentUserSelector } from '@misakey/auth/store/reducers/auth';

import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { useTranslation } from 'react-i18next';

const ButtonCreate = withDialogCreate(Button);

const CreateBoxSuggestions = () => {
  const { accountId } = useSelector(getCurrentUserSelector) || {};
  const hasAccount = useMemo(() => !isNil(accountId), [accountId]);
  const { t } = useTranslation('components');

  return (
    <Box pt={6}>
      {hasAccount && (
        <>
          <Typography color="textPrimary" align="center">
            {t('components:createBoxSuggestions.createBox.text')}
          </Typography>
          <BoxControls
            py={2}
            primary={(
              <ButtonCreate
                standing={BUTTON_STANDINGS.MAIN}
                text={t('components:createBoxSuggestions.createBox.button')}
              />
            )}
          />
        </>
      )}
      {!hasAccount && (
        <>
          <Typography color="textPrimary" align="center">
            {t('components:createBoxSuggestions.createAccount.text')}
          </Typography>
          <BoxControls
            py={2}
            primary={(
              <ButtonWithDialogPassword
                standing={BUTTON_STANDINGS.MAIN}
                text={t('components:createBoxSuggestions.createAccount.button')}
              />
            )}
          />

        </>
      )}
    </Box>
  );
};

export default CreateBoxSuggestions;
