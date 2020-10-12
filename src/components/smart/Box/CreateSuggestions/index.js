
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import isNil from '@misakey/helpers/isNil';
import ButtonWithDialogPassword from 'components/smart/Dialog/Password/with/Button';
import withDialogCreate from 'components/smart/Dialog/Boxes/Create/with';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import BoxControls from '@misakey/ui/Box/Controls';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { useTranslation } from 'react-i18next';

// CONSTANTS
const { accountId: ACCOUNT_ID_SELECTOR, hasAccount: HAS_ACCOUNT_SELECTOR } = authSelectors;

// COMPONENTS
const ButtonCreate = withDialogCreate(Button);

const CreateBoxSuggestions = () => {
  const accountId = useSelector(ACCOUNT_ID_SELECTOR);
  const hasAccount = useSelector(HAS_ACCOUNT_SELECTOR);

  const hasAccountOrAccountId = useMemo(
    () => hasAccount || !isNil(accountId),
    [hasAccount, accountId],
  );
  const { t } = useTranslation('components');

  return (
    <Box pt={6}>
      {hasAccountOrAccountId && (
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
