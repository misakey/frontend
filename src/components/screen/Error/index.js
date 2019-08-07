import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import API from '@misakey/api';
import useWidth from '@misakey/hooks/useWidth';

import Typography from '@material-ui/core/Typography';
import Navigation from '@misakey/ui/Navigation';

import './Error.scss';

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
  const getText = React.useMemo(() => error
    || (httpStatus && API.errors.httpStatus.includes(httpStatus) && t(`error:${httpStatus}`))
    || t('error:default'),
  [error, httpStatus, t]);

  const width = useWidth();

  return (
    <section id="ScreenError" className="section">
      {width === 'xs' && <Navigation history={history} t={t} />}
      <div className="container">
        {!!httpStatus && (
          <Typography className="httpStatus" variant="h1" align="center" component="p">
            {httpStatus}
          </Typography>
        )}
        <Typography variant="h5" component="h3" align="center" color="textSecondary">
          {getText}
        </Typography>
      </div>
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
