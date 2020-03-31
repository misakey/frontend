import React, { useMemo, forwardRef } from 'react';
import PropTypes from 'prop-types';

import { SEARCH_WIDTH_LG, SEARCH_WIDTH_MD, SEARCH_WIDTH_SM, SEARCH_WIDTH_XS } from '@misakey/ui/constants/sizes';
import ApplicationSchema from 'store/schemas/Application';

import isNil from '@misakey/helpers/isNil';

import path from '@misakey/helpers/path';
import prop from '@misakey/helpers/prop';
import omit from '@misakey/helpers/omit';

import makeStyles from '@material-ui/core/styles/makeStyles';
import { withRouter } from 'react-router-dom';

import Button from '@material-ui/core/Button';
import ApplicationAvatar from 'components/dumb/Avatar/Application';
import SearchApplicationsButtonEmpty from 'components/smart/Search/Applications/Button/Empty';

import ArrowDropdownIcon from '@material-ui/icons/ArrowDropDown';
import { denormalize } from 'normalizr';
import { connect } from 'react-redux';

// CONSTANTS
const INTERNAL_PROPS = [
  // props
  'mainDomain',
  // withRouter
  'match',
  'staticContext',
];

// HELPERS
const omitInternalProps = (props) => omit(props, INTERNAL_PROPS);

const getMainDomain = (props) => {
  const mainDomainProp = prop('mainDomain')(props);
  return isNil(mainDomainProp) ? path(['match', 'params', 'mainDomain'])(props) : mainDomainProp;
};

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
      {...omitInternalProps(rest)}
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

// CONNECT
const mapStateToProps = (state, ownProps) => {
  const mainDomain = getMainDomain(ownProps);
  return {
    entity: denormalize(
      mainDomain,
      ApplicationSchema.entity,
      state.entities,
    ),
  };
};

export default withRouter(connect(mapStateToProps, {})(SearchApplicationsButton));
