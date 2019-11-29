import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import withStyles from '@material-ui/core/styles/withStyles';
import MuiCard from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Box from '@material-ui/core/Box';

import GroupTitles from 'components/dumb/Typography/GroupTitles';
import CardControls from 'components/dumb/Card/Controls';

const Card = withStyles((theme) => ({
  root: {
    border: `1px solid ${theme.palette.grey.A100}`,
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',

    /* [theme.breakpoints.down('sm')]: {
      marginLeft: theme.spacing(-2),
      marginRight: theme.spacing(-2),
      borderLeft: 0,
      borderRight: 0,
      borderBottom: 0,
      borderRadius: 0,
    }, */
  },
}))(({ children, classes, className, primary, secondary, subtitle, title, ...rest }) => (
  <MuiCard
    className={clsx(classes.root, className)}
    component={Box}
    elevation={0}
    {...rest}
  >
    {title && (
      <CardContent>
        <GroupTitles title={title} subtitle={subtitle} />
        {children}
      </CardContent>
    )}
    {!title && children}
    {(primary || secondary) && (
      <CardActions>
        <CardControls primary={primary} secondary={secondary} />
      </CardActions>
    )}
  </MuiCard>
));

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  title: PropTypes.string,
  primary: PropTypes.oneOfType([PropTypes.object, PropTypes.node]),
  secondary: PropTypes.object,
  subtitle: PropTypes.string,
};

Card.defaultProps = {
  children: null,
  className: '',
  primary: null,
  secondary: null,
};

export default Card;
