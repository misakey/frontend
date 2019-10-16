import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import UserSchema from 'store/schemas/User';

import Navigation from '@misakey/ui/Navigation';
import CardProfile from 'components/dumb/Card/Profile';

// COMPONENTS
const AccountHome = ({ t, profile, history }) => {
  if (profile) {
    return (
      <div className="Home">
        <Navigation history={history} title={t('home.title')} />
        <CardProfile profile={profile} />
      </div>
    );
  }
  return null;
};

AccountHome.propTypes = {
  profile: PropTypes.shape(UserSchema.propTypes),
  t: PropTypes.func.isRequired,
  // ROUTER
  history: PropTypes.object.isRequired,
};

AccountHome.defaultProps = {
  profile: null,
};

export default withTranslation('profile')(AccountHome);
