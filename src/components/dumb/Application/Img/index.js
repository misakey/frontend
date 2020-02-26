import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withTranslation } from 'react-i18next';

import Avatar from '@material-ui/core/Avatar';
import Skeleton from '@material-ui/lab/Skeleton';
import makeStyles from '@material-ui/core/styles/makeStyles';

import omit from '@misakey/helpers/omit';

const useStyles = makeStyles({
  root: {
    display: 'none',
    textTransform: 'uppercase',
    textDecoration: 'none',
  },
  loaded: {
    display: 'flex',
  },
  skeleton: {
    width: '40px', // default MUI Avatar width
    height: '40px',
  },
  fontSizeSmall: {
    fontSize: '14px',
  },
  fontSizeLarge: {
    fontSize: '30px',
  },
});

// @FIXME @misakey/ui
function ApplicationImg({ children, className, fontSize, src, applicationName, t, ...rest }) {
  const classes = useStyles();

  const [isLoaded, setLoaded] = React.useState(false);
  const handleLoaded = React.useCallback(() => { setLoaded(true); }, [setLoaded]);

  const [isBroken, setBroken] = React.useState(false);
  const handleError = React.useCallback(() => {
    setBroken(true);
    handleLoaded();
  }, [setBroken, handleLoaded]);

  React.useEffect(() => {
    setLoaded(false);
    setBroken(false);
  }, [src]);

  return (
    <>
      {(src && !isLoaded && !isBroken) && (
        <Skeleton
          variant="circle"
          className={clsx(classes.skeleton, className)}
          {...omit(rest, ['i18n', 'tReady'])}
        />
      )}
      <Avatar
        variant="circle"
        alt={t('components__new:application.logoAlt', { applicationName })}
        src={isBroken ? null : src}
        className={clsx(classes.root, {
          [classes.fontSizeSmall]: fontSize === 'small',
          [classes.fontSizeLarge]: fontSize === 'large',
          [classes.loaded]: isLoaded || !src,
        }, className)}
        onError={handleError}
        onLoad={handleLoaded}
        {...omit(rest, ['i18n', 'tReady'])}
      >
        {(isBroken || !src) && applicationName.slice(0, 3)}
      </Avatar>
    </>
  );
}

ApplicationImg.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  fontSize: PropTypes.oneOf(['small', 'large']),
  src: PropTypes.string,
  applicationName: PropTypes.string,
  t: PropTypes.func.isRequired,
};

ApplicationImg.defaultProps = {
  children: undefined,
  className: '',
  fontSize: 'small',
  src: undefined,
  applicationName: '',
};

export default withTranslation(['components__new'])(ApplicationImg);
