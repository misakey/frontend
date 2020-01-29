import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import isNil from '@misakey/helpers/isNil';
import { makeStyles } from '@material-ui/core/styles';

import MuiCard from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import GroupTitles from 'components/dumb/Typography/GroupTitles';
import CardControls from 'components/dumb/Card/Controls';

const useStyles = makeStyles((theme) => ({
  root: {
    border: `1px solid ${theme.palette.grey.A100}`,
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
  },
  denseRoot: {
    padding: 0,
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
}));

const Card = ({
  children,
  className,
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
  const classes = useStyles();

  const hasTitle = useMemo(
    () => !isNil(title),
    [title],
  );

  const hasActions = useMemo(
    () => primary || secondary,
    [primary, secondary],
  );

  return (
    <MuiCard
      className={clsx(
        classes.root,
        className,
        { [classes.padded]: padded },
        { [classes.denseRoot]: !hasTitle },
      )}
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
      {hasTitle && (
      <CardContent className={clsx({ [classes.denseContent]: !hasTitle && hasActions })}>
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
        <CardActions className={clsx({ [classes.denseActions]: !hasTitle })}>
          <CardControls primary={primary} secondary={secondary} />
        </CardActions>
      )}
    </MuiCard>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
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
  padded: false,
  Header: null,
  title: null,
  subtitle: null,
  primary: null,
  secondary: null,
  subtitleProps: {},
  titleProps: {},
};

export default Card;
