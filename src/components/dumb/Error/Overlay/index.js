import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import clsx from 'clsx';

import API from '@misakey/api';

import Typography from '@material-ui/core/Typography';

import './Overlay.scss';

/**
 * @FIXME add to @misakey/ui
 * @param error
 * @param httpStatus
 * @param t
 * @param variant
 * @returns {*}
 * @constructor
 */
function ErrorOverlay({ error, httpStatus, t, variant }) {
  const getText = React.useMemo(() => error
    || (httpStatus && API.errors.httpStatus.includes(httpStatus) && t(`error:${httpStatus}`))
    || t('error:default'),
  [error, httpStatus, t]);

  return (
    <div className={clsx('ErrorOverlay', variant)}>
      {!!httpStatus && (
        <Typography className="httpStatus" variant="h1" align="center" component="p">
          {httpStatus}
        </Typography>
      )}
      <Typography variant="h5" component="h3" align="center" color="textSecondary">
        {getText}
      </Typography>
    </div>
  );
}

ErrorOverlay.propTypes = {
  error: PropTypes.string,
  httpStatus: PropTypes.number,
  t: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['default', 'backdrop']),
};

ErrorOverlay.defaultProps = {
  error: null,
  httpStatus: null,
  variant: 'default',
};

export default withTranslation(['error'])(ErrorOverlay);
