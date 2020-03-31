import React, { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { denormalize } from 'normalizr';
import ApplicationSchema from 'store/schemas/Application';
import UserSchema from 'store/schemas/User';


import prop from '@misakey/helpers/prop';
import isNil from '@misakey/helpers/isNil';

import SplashScreen from '@misakey/ui/Screen/Splash';
import DatavizHeader from 'components/dumb/Dataviz/Header';

const Dataviz = ({ decryptedBlob, mainDomain, application, user, id }) => {
  const importName = `./ForDomain/${mainDomain}`;
  const SpecificDataviz = lazy(() => import(importName));

  return (
    <div id={id}>
      <DatavizHeader application={application} user={user} />
      <Suspense fallback={<SplashScreen />}>
        {isNil(decryptedBlob) ? null : (
          <SpecificDataviz decryptedBlob={decryptedBlob} application={application} user={user} />
        )}
      </Suspense>
    </div>
  );
};

Dataviz.propTypes = {
  decryptedBlob: PropTypes.object,
  application: PropTypes.shape(ApplicationSchema.propTypes).isRequired,
  user: PropTypes.shape(UserSchema.propTypes).isRequired,
  mainDomain: PropTypes.string.isRequired,
  id: PropTypes.string,
};

Dataviz.defaultProps = {
  decryptedBlob: null,
  id: 'datavizcontent',
};

const mapStateToProps = (state, ownProps) => {
  const mainDomain = prop('mainDomain')(ownProps);
  return {
    application: denormalize(
      mainDomain,
      ApplicationSchema.entity,
      state.entities,
    ),
    user: state.auth.profile,
  };
};

export default connect(mapStateToProps)(Dataviz);
