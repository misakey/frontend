import React, { useCallback } from 'react';
import { useHistory, Link } from 'react-router-dom';
import routes from 'routes';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import ButtonSignOut from '@misakey/auth/components/Button/SignOut';
import CardIdentityThumbnail from 'components/dumb/Card/Identity/Thumbnail';
import AppBarStatic from '@misakey/ui/AppBar/Static';
import IconButtonAppBar from 'components/dumb/IconButton/Appbar';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import withIdentity from 'components/smart/withIdentity';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import Footer from 'components/dumb/Footer';
import DarkmodeSwitch from 'components/smart/Switch/Darkmode';

import ArrowBack from '@material-ui/icons/ArrowBack';

// CONSTANTS
const FOOTER_CONTAINER_PROPS = { mx: 2 };

// COMPONENTS
const CardIdentityThumbnailWithIdentity = withIdentity(CardIdentityThumbnail);

const BoxAccount = ({ t, backTo }) => {
  const history = useHistory();

  const onSignedOut = useCallback(() => history.replace(routes._), [history]);

  return (
    <>
      <AppBarStatic>
        <IconButtonAppBar
          aria-label={t('common:goBack')}
          edge="start"
          component={Link}
          to={backTo}
        >
          <ArrowBack />
        </IconButtonAppBar>
        <BoxFlexFill />
        <DarkmodeSwitch />
      </AppBarStatic>
      <Box display="flex" flexDirection="column" alignItems="center">
        <CardIdentityThumbnailWithIdentity />
      </Box>
      <Divider />
      <Box mx={4} my={2}>
        <ButtonSignOut onSuccess={onSignedOut} />
      </Box>
      <Divider />
      <BoxFlexFill />
      <Footer containerProps={FOOTER_CONTAINER_PROPS} />
    </>
  );
};


BoxAccount.propTypes = {
  backTo: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

export default withTranslation('common')(BoxAccount);
