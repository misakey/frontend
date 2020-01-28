import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import withStyles from '@material-ui/core/styles/withStyles';
import MuiCard from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
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
  denseContent: {
    paddingBottom: 0,
  },
  denseActions: {
    paddingTop: 0,
  },
  padded: {
    padding: theme.spacing(3),
  },
  dividerPadded: {
    margin: theme.spacing(0, -3),
  },
  headerPadded: {
    margin: theme.spacing(-3, -3, 0, -3),
  },
}))(({
  children,
  classes,
  className,
  dense,
  padded,
  primary,
  secondary,
  subtitle,
  title,
  Header,
  subtitleProps,
  titleProps,
  ...rest
}) => {
  const hasActions = useMemo(
    () => primary || secondary,
    [primary, secondary],
  );

  return (
    <MuiCard
      className={clsx(classes.root, className, { [classes.padded]: padded })}
      component={Box}
      elevation={0}
      {...rest}
    >
      {Header && (
        <>
          <Header className={clsx({ [classes.headerPadded]: padded })} />
          <Divider className={clsx({ [classes.dividerPadded]: padded })} />
        </>
      )}
      {title && (
      <CardContent className={clsx({ [classes.denseContent]: dense && hasActions })}>
        <GroupTitles
          title={title}
          subtitle={subtitle}
          subtitleProps={subtitleProps}
          titleProps={titleProps}
        />
        {children}
      </CardContent>
      )}
      {!title && children}
      {hasActions && (
        <CardActions className={clsx({ [classes.denseActions]: dense })}>
          <CardControls primary={primary} secondary={secondary} />
        </CardActions>
      )}
    </MuiCard>
  );
});

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  dense: PropTypes.bool,
  padded: PropTypes.bool,
  Header: PropTypes.elementType,
  title: PropTypes.node,
  primary: PropTypes.oneOfType([PropTypes.object, PropTypes.node]),
  secondary: PropTypes.object,
  subtitle: PropTypes.node,
  subtitleProps: PropTypes.object,
  titleProps: PropTypes.object,
};

Card.defaultProps = {
  children: null,
  className: '',
  dense: false,
  padded: false,
  primary: null,
  secondary: null,
  subtitleProps: {},
  titleProps: {},
};

export default Card;
