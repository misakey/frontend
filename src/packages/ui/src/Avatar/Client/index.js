import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withTranslation } from 'react-i18next';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Avatar from '@material-ui/core/Avatar';
import MuiSkeleton from '@material-ui/lab/Skeleton';

// HOOKS
const useStyles = makeStyles({
  root: {
    display: 'none',
    textTransform: 'uppercase',
    textDecoration: 'none',
  },
  loaded: {
    display: 'flex',
  },
  fontSizeSmall: {
    fontSize: '14px',
  },
  fontSizeLarge: {
    fontSize: '30px',
  },
});


// COMPONENTS
export const Skeleton = (props) => (
  <MuiSkeleton
    width={40}
    height={40}
    variant="circle"
    {...props}
  />
);

function ClientAvatar({
  children, className, fontSize, src, name, t, ...rest
}) {
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
          {...omitTranslationProps(rest)}
        />
      )}
      <Avatar
        variant="circle"
        alt={t('components:client.logoAlt', { clientName: name })}
        src={isBroken ? null : src}
        className={clsx(classes.root, {
          [classes.fontSizeSmall]: fontSize === 'small',
          [classes.fontSizeLarge]: fontSize === 'large',
          [classes.loaded]: isLoaded || !src,
        }, className)}
        onError={handleError}
        onLoad={handleLoaded}
        {...omitTranslationProps(rest)}
      >
        {(isBroken || !src) && name.slice(0, 3)}
      </Avatar>
    </>
  );
}

ClientAvatar.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  fontSize: PropTypes.oneOf(['small', 'large']),
  src: PropTypes.string,
  name: PropTypes.string,
  t: PropTypes.func.isRequired,
};

ClientAvatar.defaultProps = {
  children: undefined,
  className: '',
  fontSize: 'small',
  src: undefined,
  name: '',
};

export default withTranslation(['components'])(ClientAvatar);
