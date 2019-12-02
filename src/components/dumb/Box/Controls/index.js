import React, { useMemo, isValidElement } from 'react';
import PropTypes from 'prop-types';

import useTheme from '@material-ui/core/styles/useTheme';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Box from '@material-ui/core/Box';

import isNil from '@misakey/helpers/isNil';
import Button, { BUTTON_STANDINGS } from 'components/dumb/Button';


const { MINOR, MAJOR, MAIN, ENHANCED } = BUTTON_STANDINGS;

const BoxControls = ({ primary, secondary, outlined, ...rest }) => {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));

  const flexDirection = useMemo(
    () => (isXs ? 'column' : 'row'),
    [isXs],
  );

  const justifyContent = useMemo(
    () => (secondary ? 'space-between' : 'flex-end'),
    [secondary],
  );

  const standings = useMemo(
    () => (outlined
      ? { primary: MAIN, secondary: ENHANCED }
      : { primary: MAJOR, secondary: MINOR }
    ),
    [outlined],
  );

  const primaryNode = useMemo(
    () => (
      (isValidElement(primary) || isNil(primary))
        ? primary : (<Button standing={standings.primary} {...primary} />)
    ),
    [standings, primary],
  );

  const secondaryNode = useMemo(
    () => (
      (isValidElement(secondary) || isNil(secondary))
        ? secondary : (<Button standing={standings.secondary} {...secondary} />)
    ),
    [standings, secondary],
  );

  return (
    <Box
      width="100%"
      display="flex"
      flexDirection={flexDirection}
      justifyContent={justifyContent}
      {...rest}
    >
      {secondaryNode}
      {primaryNode}
    </Box>
  );
};

BoxControls.propTypes = {
  outlined: PropTypes.bool,
  primary: PropTypes.oneOfType([PropTypes.object, PropTypes.node]),
  secondary: PropTypes.oneOfType([PropTypes.object, PropTypes.node]),
};

BoxControls.defaultProps = {
  outlined: true,
  primary: null,
  secondary: null,
};

export default BoxControls;
