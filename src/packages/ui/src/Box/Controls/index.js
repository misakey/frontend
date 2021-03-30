import React, { useMemo, isValidElement } from 'react';

import PropTypes from 'prop-types';

import isNil from '@misakey/helpers/isNil';
import isObject from '@misakey/helpers/isObject';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Box from '@material-ui/core/Box';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import ButtonSubmit from '@misakey/ui/Button/Submit';
import TypographyIrreversible from '@misakey/ui/Typography/Irreversible';

// HOOKS
const useStyles = makeStyles((theme) => ({
  boxRoot: {
    [theme.breakpoints.down('xs')]: {
      '& > *:not(:last-child)': {
        marginRight: theme.spacing(0.5),
      },
      '& > *:not(:first-child)': {
        marginLeft: theme.spacing(0.5),
      },
    },
  },
}));

// COMPONENTS
const BoxControls = ({ primary, secondary, formik, irreversible, ...rest }) => {
  const classes = useStyles();

  const justifyContent = useMemo(
    () => (secondary ? 'space-between' : 'flex-end'),
    [secondary],
  );

  const PrimaryButton = useMemo(
    () => {
      if (formik) {
        return ButtonSubmit;
      }
      return Button;
    },
    [formik],
  );

  const primaryNode = useMemo(
    () => {
      if (isValidElement(primary) || isNil(primary)) {
        return primary;
      }
      if (isObject(primary)) {
        return (
          <PrimaryButton
            standing={BUTTON_STANDINGS.MAIN}
            {...primary}
          />
        );
      }
      return null;
    },
    [primary],
  );

  const secondaryNode = useMemo(
    () => {
      if (isValidElement(secondary) || isNil(secondary)) {
        return secondary;
      }
      if (isObject(secondary)) {
        return <Button standing={BUTTON_STANDINGS.CANCEL} {...secondary} />;
      }
      return null;
    },
    [secondary],
  );

  return (
    <Box
      width="100%"
      display="flex"
      flexDirection="row"
      flexWrap="wrap"
      justifyContent={justifyContent}
      className={classes.boxRoot}
      {...rest}
    >
      {secondaryNode}
      {irreversible
        ? (
          <Box display="flex" flexDirection="column">
            <TypographyIrreversible />
            {primaryNode}
          </Box>
        )
        : primaryNode}
    </Box>
  );
};

BoxControls.propTypes = {
  formik: PropTypes.bool,
  irreversible: PropTypes.bool,
  primary: PropTypes.oneOfType([PropTypes.object, PropTypes.node]),
  secondary: PropTypes.oneOfType([PropTypes.object, PropTypes.node]),
};

BoxControls.defaultProps = {
  formik: false,
  irreversible: false,
  primary: null,
  secondary: null,
};

export default BoxControls;
