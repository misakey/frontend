
import React from 'react';
import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';
import ApplicationSchema from 'store/schemas/Application';
import ApplicationSummary from 'components/dumb/Application/Summary';
import BoxEllipsis from 'components/dumb/Box/Ellipsis';
import { SEARCH_WIDTH_LG, SEARCH_WIDTH_MD, SEARCH_WIDTH_SM, SEARCH_WIDTH_XS } from '@misakey/ui/constants/sizes';

// HOOKS
const useStyles = makeStyles((theme) => ({
  root: {
    position: 'absolute',
    textDecoration: 'none',
    left: '50%',
    transform: 'translateX(-50%)',
    border: `1px solid ${theme.palette.grey.A100}`,
    borderRadius: '50px',
    padding: theme.spacing(0.75, 1),
    margin: theme.spacing(1),
    width: SEARCH_WIDTH_XS,
    [theme.breakpoints.up('sm')]: {
      width: SEARCH_WIDTH_SM,
    },
    [theme.breakpoints.up('md')]: {
      width: SEARCH_WIDTH_MD,
    },
    [theme.breakpoints.up('lg')]: {
      width: SEARCH_WIDTH_LG,
    },
  },
}));

// COMPONENTS
// @FIXME: consider replacing this component by disabled search
const BoxEllipsisApplication = ({ application, ...rest }) => {
  const classes = useStyles();

  return (
    <BoxEllipsis className={classes.root} {...rest}>
      <ApplicationSummary application={application} />
    </BoxEllipsis>
  );
};

BoxEllipsisApplication.propTypes = {
  application: PropTypes.shape(ApplicationSchema.propTypes),
};

BoxEllipsisApplication.defaultProps = {
  application: {},
};


export default BoxEllipsisApplication;
