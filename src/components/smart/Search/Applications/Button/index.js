import React, { useMemo, forwardRef } from 'react';
import PropTypes from 'prop-types';

import { SEARCH_WIDTH_LG, SEARCH_WIDTH_MD, SEARCH_WIDTH_SM, SEARCH_WIDTH_XS } from '@misakey/ui/constants/sizes';
import ApplicationSchema from 'store/schemas/Application';

import isNil from '@misakey/helpers/isNil';

import makeStyles from '@material-ui/core/styles/makeStyles';
import { withRouter } from 'react-router-dom';

import withApplication, { omitWithApplication } from 'components/smart/withApplication';
import Button from '@material-ui/core/Button';
import ApplicationAvatar from 'components/dumb/Avatar/Application';
import SearchApplicationsButtonEmpty from 'components/smart/Search/Applications/Button/Empty';

import ArrowDropdownIcon from '@material-ui/icons/ArrowDropDown';

// HOOKS
const useStyles = makeStyles((theme) => ({
  root: {
    border: `1px solid ${theme.palette.grey.A100}`,
    flexGrow: 1,
    justifyContent: 'flex-start',
    textAlign: 'left',
    margin: 0,
    maxWidth: SEARCH_WIDTH_XS,
    [theme.breakpoints.up('sm')]: {
      maxWidth: SEARCH_WIDTH_SM,
    },
    [theme.breakpoints.up('md')]: {
      maxWidth: SEARCH_WIDTH_MD,
    },
    [theme.breakpoints.up('lg')]: {
      maxWidth: SEARCH_WIDTH_LG,
    },
  },
  label: {
    textTransform: 'none',
  },
  endIcon: {
    marginLeft: theme.spacing(0),
    marginRight: theme.spacing(0.5),
  },
}));

// COMPONENTS
const SearchApplicationsButton = forwardRef(({ entity, disabled, ...rest }, ref) => {
  const classes = useStyles();

  const noEntity = useMemo(
    () => isNil(entity),
    [entity],
  );

  const EndIcon = useMemo(
    () => (disabled ? null : <ArrowDropdownIcon />),
    [disabled],
  );

  return (
    <Button
      ref={ref}
      classes={{
        root: classes.root,
        label: classes.label,
        endIcon: classes.endIcon,
      }}
      endIcon={EndIcon}
      disabled={disabled}
      {...omitWithApplication(rest)}
    >
      {noEntity
        ? (
          <SearchApplicationsButtonEmpty />
        ) : (
          <ApplicationAvatar
            application={entity}
            fullWidth
          />
        )}
    </Button>
  );
});

SearchApplicationsButton.propTypes = {
  entity: PropTypes.shape(ApplicationSchema.propTypes),
  disabled: PropTypes.bool,
};

SearchApplicationsButton.defaultProps = {
  entity: null,
  disabled: false,
};

export default withRouter(
  withApplication(SearchApplicationsButton),
);
