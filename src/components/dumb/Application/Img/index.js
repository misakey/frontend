import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import Avatar from '@material-ui/core/Avatar';
import Skeleton from '@material-ui/lab/Skeleton';
import makeStyles from '@material-ui/core/styles/makeStyles';

const useStyles = makeStyles({
  root: {
    display: 'none',
    textTransform: 'uppercase',
    textDecoration: 'none',
    borderRadius: '3px',
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
function ApplicationImg({ alt, children, className, fontSize, src, ...rest }) {
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
        <Skeleton variant="rect" className={clsx(classes.skeleton, className)} />
      )}
      <Avatar
        alt={alt}
        src={isBroken ? null : src}
        className={clsx(classes.root, {
          [classes.fontSizeSmall]: fontSize === 'small',
          [classes.fontSizeLarge]: fontSize === 'large',
          [classes.loaded]: isLoaded || !src,
        }, className)}
        onError={handleError}
        onLoad={handleLoaded}
        {...rest}
      >
        {children}
      </Avatar>
    </>
  );
}

ApplicationImg.propTypes = {
  alt: PropTypes.string.isRequired,
  children: PropTypes.node,
  className: PropTypes.string,
  fontSize: PropTypes.oneOf(['small', 'large']),
  src: PropTypes.string,
};

ApplicationImg.defaultProps = {
  children: undefined,
  className: '',
  fontSize: 'small',
  src: undefined,
};

export default ApplicationImg;
