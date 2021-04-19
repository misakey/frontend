import React from 'react';

import { useSelector } from 'react-redux';

import ButtonWithDialogPassword from '@misakey/react/auth/components/Dialog/Password/with/Button';
import withDialogCreate from 'components/smart/Dialog/Boxes/Create/with';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import BoxControlsCard from '@misakey/ui/Box/Controls/Card';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';

import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { useTranslation } from 'react-i18next';

// CONSTANTS
const { hasCrypto: HAS_CRYPTO_SELECTOR } = authSelectors;

// COMPONENTS
const ButtonCreate = withDialogCreate(Button);

const CreateBoxSuggestions = (props) => {
  const hasCrypto = useSelector(HAS_CRYPTO_SELECTOR);

  const { t } = useTranslation('components');

  return (
    <Box pt={6} {...props}>
      {hasCrypto && (
        <>
          <Typography color="textSecondary" align="center">
            {t('components:createBoxSuggestions.createBox.text')}
          </Typography>
          <BoxControlsCard
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
      {!hasCrypto && (
        <>
          <Typography color="textSecondary" align="center">
            {t('components:createBoxSuggestions.createAccount.text')}
          </Typography>
          <BoxControlsCard
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
