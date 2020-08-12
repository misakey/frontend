import React from 'react';
import PropTypes from 'prop-types';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Title from '@misakey/ui/Typography/Title';
import CardHeader from '@material-ui/core/CardHeader';

// HOOKS
const useStyles = makeStyles((theme) => ({
  cardHeaderRoot: {
    padding: theme.spacing(0),
  },
}));

// COMPONENTS
const EventCardHeader = ({ title, titleTypographyProps, ...rest }) => {
  const classes = useStyles();

  return (
    <CardHeader
      classes={{ root: classes.cardHeaderRoot }}
      disableTypography
      title={(
        <Title variant="subtitle1" color="textSecondary" {...titleTypographyProps}>{title}</Title>
    )}
      {...rest}
    />
  );
};

EventCardHeader.propTypes = {
  title: PropTypes.string.isRequired,
  titleTypographyProps: PropTypes.object,
};

EventCardHeader.defaultProps = {
  titleTypographyProps: {},
};

export default EventCardHeader;
