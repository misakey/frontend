import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import REQUEST_TYPES from 'constants/databox/type';

import { ThemeProvider, makeStyles } from '@material-ui/core/styles';
import BoxControls from '@misakey/ui/Box/Controls';

import useGetThemeForRequestType from 'hooks/useGetThemeForRequestType';

import isObject from '@misakey/helpers/isObject';

// HOOKS
const useStyles = makeStyles((theme) => ({
  actionsContainer: {
    '& > *': {
      width: '100%',
      margin: theme.spacing(0.2, 1),
    },
  },
}));

// CONSTANTS
const BUTTON_PROPS = {
  size: 'large',
};

const RequestReadActions = ({ requestType, actions, children }) => {
  const classes = useStyles();

  const themeforType = useGetThemeForRequestType(requestType);

  const primary = useMemo(
    () => (isObject(actions.primary)
      ? { ...actions.primary, ...BUTTON_PROPS }
      : actions.primary),
    [actions],
  );
  const secondary = useMemo(
    () => (isObject(actions.secondary)
      ? { ...actions.secondary, ...BUTTON_PROPS }
      : actions.secondary),
    [actions],
  );

  return (
    <ThemeProvider theme={themeforType}>
      <BoxControls
        primary={primary}
        secondary={secondary}
        className={classes.actionsContainer}
        alignItems="center"
      />
      {children}
    </ThemeProvider>
  );
};


RequestReadActions.propTypes = {
  actions: PropTypes.shape({
    primary: PropTypes.oneOfType([PropTypes.element, PropTypes.node, PropTypes.object]),
    secondary: PropTypes.oneOfType([PropTypes.element, PropTypes.node, PropTypes.object]),
  }).isRequired,
  requestType: PropTypes.oneOf(REQUEST_TYPES).isRequired,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.node]),
};

RequestReadActions.defaultProps = {
  children: null,
};

export default withTranslation('dpo')(RequestReadActions);
