import React, { forwardRef, useMemo } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import routes from 'routes';
import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';
import { DRAWER_QUERY_PARAM, TMP_DRAWER_QUERY_PARAMS } from '@misakey/ui/constants/drawers';

import isNil from '@misakey/core/helpers/isNil';
import omitRouteProps from '@misakey/core/helpers/omit/routeProps';

import { useSelector } from 'react-redux';

import { BUTTON_STANDINGS } from '@misakey/ui/Button';
import ButtonWithDialogPassword from '@misakey/react-auth/components/Dialog/Password/with/Button';
import Box from '@material-ui/core/Box';
import { Route } from 'react-router-dom';
import List from '@material-ui/core/List';
import ListItemBoxesCurrent from 'components/smart/ListItem/Boxes/Current';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';

// CONSTANTS
const { accountId: ACCOUNT_ID_SELECTOR, hasAccount: HAS_ACCOUNT_SELECTOR } = authSelectors;

const NEXT_SEARCH_MAP = [[DRAWER_QUERY_PARAM, undefined], [TMP_DRAWER_QUERY_PARAMS, undefined]];

// COMPONENTS
const NoVault = forwardRef(({ t, isFullWidth }, ref) => {
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
    <Container
      disableGutters
      maxWidth={isFullWidth ? 'md' : undefined}
    >
      <Route
        path={routes.boxes.read._}
        render={(routeProps) => (
          <>
            <List disablePadding>
              <ListItemBoxesCurrent
                nextSearchMap={NEXT_SEARCH_MAP}
                {...omitRouteProps(routeProps)}
              />
            </List>
            <Typography variant="body2" color="textSecondary" align="center">
              {t('boxes:closedVault.saveForLater')}
            </Typography>
          </>
        )}
      />
      <Box
        m={1}
        ref={ref}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Box>
          <ButtonWithDialogPassword
            standing={BUTTON_STANDINGS.TEXT}
            size="small"
            text={buttonText}
          />
        </Box>
      </Box>
    </Container>
  );
});

NoVault.propTypes = {
  isFullWidth: PropTypes.bool,
  // withTranslation
  t: PropTypes.func.isRequired,
};

NoVault.defaultProps = {
  isFullWidth: true,
};

export default withTranslation(['boxes'], { withRef: true })(NoVault);
