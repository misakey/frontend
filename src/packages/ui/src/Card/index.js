import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import clsx from 'clsx';

import isNil from '@misakey/core/helpers/isNil';
import { makeStyles } from '@material-ui/core/styles';

import MuiCard from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import GroupTitles from '@misakey/ui/Typography/GroupTitles';
import BoxControls from '@misakey/ui/Box/Controls';

const useStyles = makeStyles((theme) => ({
  root: {
    border: `1px solid ${theme.palette.divider}`,
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
  highlight: {
    borderColor: theme.palette.primary.main,
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
  dense,
  highlight,
  formik,
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
        { [classes.highlight]: highlight },
        { [classes.padded]: padded },
        { [classes.denseRoot]: !hasTitle },
      )}
      component={Box}
      elevation={0}
      dense={dense ? 'true' : undefined}
      {...rest}
    >
      {Header && (
        <>
          <Header className={clsx({ [classes.headerPadded]: padded })} />
          <Divider className={clsx({ [classes.dividerPadded]: padded })} />
        </>
      )}
      {hasTitle ? (
        <CardContent className={clsx({ [classes.denseContent]: !hasTitle && hasActions })}>
          <GroupTitles
            title={title}
            subtitle={subtitle}
            subtitleProps={subtitleProps}
            titleProps={titleProps}
          />
          {children}
        </CardContent>
      ) : children}
      {hasActions && (
        <CardActions className={clsx({ [classes.denseActions]: !hasTitle })}>
          <BoxControls primary={primary} secondary={secondary} formik={formik} />
        </CardActions>
      )}
    </MuiCard>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  padded: PropTypes.bool,
  dense: PropTypes.bool,
  highlight: PropTypes.bool,
  Header: PropTypes.elementType,
  title: PropTypes.node,
  primary: PropTypes.oneOfType([PropTypes.object, PropTypes.node]),
  secondary: PropTypes.object,
  subtitle: PropTypes.node,
  subtitleProps: PropTypes.object,
  titleProps: PropTypes.object,
  formik: PropTypes.bool,
};

Card.defaultProps = {
  children: null,
  className: '',
  padded: false,
  dense: false,
  highlight: false,
  Header: null,
  title: null,
  subtitle: null,
  primary: null,
  secondary: null,
  subtitleProps: {},
  titleProps: {},
  formik: false,
};

export default Card;
