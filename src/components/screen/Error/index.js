import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import useWidth from '@misakey/hooks/useWidth';

import Navigation from '@misakey/ui/Navigation';

import './Error.scss';
import ErrorOverlay from 'components/dumb/Error/Overlay';

/**
 * @FIXME add to @misakey/ui
 * @param error
 * @param history
 * @param httpStatus
 * @param t
 * @returns {*}
 * @constructor
 */
function ScreenError({ error, history, httpStatus, t }) {
  const width = useWidth();

  return (
    <section id="ScreenError" className="section">
      {width === 'xs' && <Navigation history={history} t={t} />}
      <ErrorOverlay error={error} httpStatus={httpStatus} />
    </section>
  );
}

ScreenError.propTypes = {
  error: PropTypes.string,
  history: PropTypes.shape({ goBack: PropTypes.func.isRequired }).isRequired,
  httpStatus: PropTypes.number,
  t: PropTypes.func.isRequired,
};

ScreenError.defaultProps = {
  error: null,
  httpStatus: null,
};

export default withRouter(withTranslation(['error'])(ScreenError));
