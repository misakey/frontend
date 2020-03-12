import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import clsx from 'clsx';

import omit from '@misakey/helpers/omit';
import tDefault from '@misakey/helpers/tDefault';
import isEllipsis from '@misakey/helpers/isEllipsis';

import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import Collapse from '@material-ui/core/Collapse';
import Link from '@material-ui/core/Link';
import Box from '@material-ui/core/Box';


const useStyles = makeStyles((theme) => ({
  root: {
    position: 'relative',
  },
  ellipsis: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  long: {
    flexGrow: 1,
  },
  hidden: {
    display: 'none',
    visibility: 'hidden',
  },
  button: {
    marginLeft: theme.spacing(1),
  },
}));

/**
 * @param children
 * @param className
 * @param collapsedHeight
 * @param t
 * @param rest
 * @returns {*}
 * @constructor
 */
function LongText({ children, className, ltr, t, ...rest }) {
  const classes = useStyles();
  const textRef = React.useRef(null);
  const buttonRef = React.useRef(null);

  const [isLong, setLong] = React.useState(false);
  const [collapsed, collapse] = React.useState(false);
  const displayAsLong = React.useMemo(() => isLong && !collapsed, [collapsed, isLong]);

  const handleCollapse = React.useCallback(
    () => { collapse(true); },
    [collapse],
  );

  const handleEllipsis = React.useCallback(
    () => { setLong(isEllipsis(textRef.current, buttonRef.current.offsetWidth)); },
    [buttonRef],
  );

  React.useEffect(handleEllipsis, []);

  const ButtonCollapse = () => (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <Link
      ref={buttonRef}
      color="secondary"
      variant="button"
      component="button"
      onClick={handleCollapse}
      className={clsx(classes.button, { [classes.hidden]: !displayAsLong })}
    >
      {t('common:more')}
    </Link>
  );

  return (
    <Collapse
      in={collapsed}
      className={classes.root}
      // NOTE: the 24 value is here as 1.5*16 (the default line height)
      // We decided to put it here as we're using default Typography component
      // To get it computed (as it's in "rem" unit), it'll cost a lot of JS computation
      // for something really not worth it.
      collapsedHeight={`${textRef.current ? textRef.current.offsetHeight : 24}px`}
    >
      <Box display="flex" flexWrap="nowrap">
        {!ltr && <ButtonCollapse />}
        <Typography
          className={clsx(className, {
            [classes.ellipsis]: !collapsed,
            [classes.long]: displayAsLong,
          })}
          {...omit(rest, ['i18n', 'tReady'])}
          ref={textRef}
        >
          {children}
        </Typography>
        {ltr && <ButtonCollapse />}
      </Box>
    </Collapse>
  );
}

LongText.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.node,
    PropTypes.elementType,
    PropTypes.string,
  ]).isRequired,
  className: PropTypes.string,
  ltr: PropTypes.bool,
  t: PropTypes.func,
};

LongText.defaultProps = {
  className: '',
  ltr: true,
  t: tDefault,
};

export default withTranslation('common')(LongText);
