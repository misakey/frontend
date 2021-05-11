import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

import isNil from '@misakey/core/helpers/isNil';

import makeStyles from '@material-ui/core/styles/makeStyles';

import MuiListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

// HOOKS
const useStyles = makeStyles((theme) => ({
  multiline: ({ tertiary }) => (isNil(tertiary) ? {} : ({
    marginTop: theme.spacing(0),
    marginBottom: theme.spacing(0),
  })),
}));

// COMPONENTS
const ListItemTextTertiary = forwardRef(({
  primary, secondary, tertiary,
  disableTypography,
  primaryTypographyProps, secondaryTypographyProps, tertiaryTypographyProps,
  ...rest }, ref) => {
  const classes = useStyles({ tertiary });

  if (disableTypography) {
    return (
      <MuiListItemText
        classes={{ multiline: classes.multiline }}
        disableTypography
        ref={ref}
        primary={primary}
        secondary={(
          <>
            {secondary}
            {tertiary}
          </>
        )}
        {...rest}
      />
    );
  }
  return (
    <MuiListItemText
      classes={{ multiline: classes.multiline }}
      disableTypography
      ref={ref}
      primary={primary && (
        <Typography {...primaryTypographyProps}>{primary}</Typography>
      )}
      secondary={(
        <>
          {secondary && <Typography {...secondaryTypographyProps}>{secondary}</Typography>}
          {tertiary && <Typography {...tertiaryTypographyProps}>{tertiary}</Typography>}
        </>
      )}
      {...rest}
    />
  );
});

ListItemTextTertiary.propTypes = {
  primary: PropTypes.node,
  secondary: PropTypes.node,
  tertiary: PropTypes.node,
  disableTypography: PropTypes.bool,
  primaryTypographyProps: PropTypes.object,
  secondaryTypographyProps: PropTypes.object,
  tertiaryTypographyProps: PropTypes.object,
};

ListItemTextTertiary.defaultProps = {
  primary: null,
  secondary: null,
  tertiary: null,
  disableTypography: false,
  primaryTypographyProps: {},
  secondaryTypographyProps: {},
  tertiaryTypographyProps: {},
};

export default ListItemTextTertiary;
