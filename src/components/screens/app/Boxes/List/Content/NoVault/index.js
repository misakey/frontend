import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import routes from 'routes';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import isNil from '@misakey/helpers/isNil';

import { useSelector } from 'react-redux';

import { BUTTON_STANDINGS } from '@misakey/ui/Button';
import ButtonWithDialogPassword from 'components/smart/Dialog/Password/with/Button';
import Box from '@material-ui/core/Box';
import { Route } from 'react-router-dom';
import ListItemBoxesCurrent from 'components/smart/ListItem/Boxes/Current';
import Typography from '@material-ui/core/Typography';

// CONSTANTS
const { accountId: ACCOUNT_ID_SELECTOR, hasAccount: HAS_ACCOUNT_SELECTOR } = authSelectors;

// COMPONENTS
const NoVault = forwardRef(({ t }, ref) => {
  const accountId = useSelector(ACCOUNT_ID_SELECTOR);
  const hasAccount = useSelector(HAS_ACCOUNT_SELECTOR);

  const hasAccountOrAccountId = useMemo(
    () => hasAccount || !isNil(accountId),
    [hasAccount, accountId],
  );

  const buttonText = useMemo(
    () => (hasAccountOrAccountId
      ? t('boxes:closedVault.open')
      : t('boxes:closedVault.create')),
    [hasAccountOrAccountId, t],
  );

  return (
    <>
      <Route
        path={routes.boxes.read._}
        component={ListItemBoxesCurrent}
      />
      <Box
        m={1}
        ref={ref}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Typography variant="body2" color="textSecondary" align="center">
          {t('boxes:closedVault.saveForLater')}
        </Typography>
        <Box>
          <ButtonWithDialogPassword
            standing={BUTTON_STANDINGS.TEXT}
            size="small"
            text={buttonText}
          />
        </Box>
      </Box>
    </>
  );
});

NoVault.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation(['boxes'], { withRef: true })(NoVault);
