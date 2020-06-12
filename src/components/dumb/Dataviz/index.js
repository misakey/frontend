import React, { lazy, Suspense, useMemo } from 'react';
import PropTypes from 'prop-types';

// import { connect } from 'react-redux';
// import { denormalize } from 'normalizr';
// import ApplicationSchema from 'store/schemas/Application';
import IdentitySchema from 'store/schemas/Identity';


// import prop from '@misakey/helpers/prop';
import isNil from '@misakey/helpers/isNil';

import SplashScreen from '@misakey/ui/Screen/Splash/WithTranslation';

// Webpack require that we don't do import with variables. So we should declare explicitly
// all dataviz here.
// Maybe there is another way to manage that ?

export const AVAILABLE_DATAVIZ_DOMAINS = [
  'trainline.fr',
];

const ENABLED_DATAVIZ = {
  'trainline.fr': lazy(() => import('./ForDomain/trainline.fr')),
};


const Dataviz = ({ decryptedBlob, mainDomain, application, user, id }) => {
  const SpecificDataviz = useMemo(
    () => ENABLED_DATAVIZ[mainDomain],
    [mainDomain],
  );

  return (
    <div id={id}>
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
  application: PropTypes.object.isRequired,
  user: PropTypes.shape(IdentitySchema.propTypes).isRequired,
  mainDomain: PropTypes.string.isRequired,
  id: PropTypes.string,
};

Dataviz.defaultProps = {
  decryptedBlob: null,
  id: 'datavizcontent',
};

// const mapStateToProps = (state, ownProps) => {
//   const mainDomain = prop('mainDomain')(ownProps);
//   return {
//     application: denormalize(
//       mainDomain,
//       ApplicationSchema.entity,
//       state.entities,
//     ),
//     user: state.auth.identity,
//   };
// };

export default /* connect(mapStateToProps) */(Dataviz);
