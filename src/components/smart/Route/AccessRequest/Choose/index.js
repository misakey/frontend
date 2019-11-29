import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { withUserManager } from '@misakey/auth/components/OidcProvider';


import ButtonConnectNoToken from '@misakey/ui/Button/Connect/NoToken';
import ScreenAction from 'components/dumb/Screen/Action';
import Subtitle from 'components/dumb/Typography/Subtitle';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';

const AccessRequestChoose = ({ accessRequest, isFetching, error, location, userManager, t }) => {
  const navigationProps = useMemo(
    () => ({ showGoBack: false }),
    [],
  );

  const appBarProps = useMemo(
    () => ({
      withUser: false,
      withSearchBar: false,
    }),
    [],
  );

  const state = useMemo(
    () => ({
      error,
      isLoading: isFetching,
    }),
    [error, isFetching],
  );

  const fallbackTo = useMemo(
    () => {
      const { search, hash } = location;
      const nextSearch = new URLSearchParams(search);
      nextSearch.set('noAuth', true);
      return {
        search: nextSearch.toString(),
        hash,
      };
    },
    [location],
  );

  const signInAction = useCallback(
    () => {
      userManager.signinRedirect({ referrer: location });
    },
    [location, userManager],
  );

  return (
    <ScreenAction
      title={t('screens:accessRequest.choose.title', accessRequest)}
      appBarProps={appBarProps}
      navigationProps={navigationProps}
      state={state}
    >
      <Container maxWidth="md">
        <Subtitle>{t('screens:accessRequest.choose.subtitle', accessRequest)}</Subtitle>
        <Box mt={3} display="flex" justifyContent="space-between">
          <Button
            variant="outlined"
            color="secondary"
            to={fallbackTo}
            component={Link}
            aria-label={t('screens:accessRequest.choose.noAuth.label')}
          >
            {t('screens:accessRequest.choose.noAuth.label')}
          </Button>
          <ButtonConnectNoToken buttonProps={{ variant: 'contained' }} signInAction={signInAction}>
            {t('screens:accessRequest.choose.auth.label')}
          </ButtonConnectNoToken>
        </Box>
      </Container>

    </ScreenAction>
  );
};

AccessRequestChoose.propTypes = {
  accessRequest: PropTypes.shape({
    dpoEmail: PropTypes.string,
    ownerName: PropTypes.string,
  }),
  isFetching: PropTypes.bool.isRequired,
  error: PropTypes.instanceOf(Error),
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
    hash: PropTypes.string.isRequired,
  }).isRequired,
  t: PropTypes.func.isRequired,
  userManager: PropTypes.shape({
    signinRedirect: PropTypes.func.isRequired,
  }).isRequired,
};

AccessRequestChoose.defaultProps = {
  accessRequest: null,
  error: null,
};

export default withUserManager(withTranslation('screens')(AccessRequestChoose));
