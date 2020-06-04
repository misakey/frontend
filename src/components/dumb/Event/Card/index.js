import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import isNil from '@misakey/helpers/isNil';
import Avatar from '@misakey/ui/Avatar/User';
import { makeStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import MuiCard from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Box from '@material-ui/core/Box';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > :first-child': {
      margin: theme.spacing(0, 1, 0, 0),
    },
  },
  card: {
    backgroundColor: theme.palette.grey[100],
    borderRadius: '10px',
    overflow: 'hidden',
  },
  header: {
    padding: theme.spacing(1, 1, 0, 1),
  },
  headerTypography: {
    fontWeight: theme.typography.fontWeightBold,
  },
  content: {
    padding: theme.spacing(1),
  },
  footer: {
    padding: theme.spacing(0),
    borderTop: `1px solid ${theme.palette.grey[300]}`,
    '& > *': {
      width: '100%',
      borderRadius: 0,
    },
  },
}));

const EventCard = ({
  isFromCurrentUser,
  children,
  className,
  author,
  text,
  actions,
  titleProps,
  titleTypographyProps,
  ...rest
}) => {
  const classes = useStyles();

  const { displayName, avatarUrl } = useMemo(() => author, [author]);

  return (
    <Box
      display="flex"
      alignItems="flex-end"
      justifyContent={isFromCurrentUser ? 'flex-end' : 'flex-start'}
      py={1}
      className={classes.root}
    >
      {!isFromCurrentUser && <Avatar avatarUrl={avatarUrl} displayName={displayName} />}
      <MuiCard
        className={clsx(classes.card, className)}
        elevation={0}
        {...rest}
      >
        {!isFromCurrentUser && (
          <CardHeader
            title={displayName}
            titleTypographyProps={{
              variant: 'subtitle1',
              classes: { root: classes.headerTypography },
              ...titleTypographyProps,
            }}
            classes={{ root: classes.header }}
            {...titleProps}
          />
        )}
        <CardContent classes={{ root: classes.content }}>
          {!isNil(text) && <Typography>{text}</Typography>}
          {children}
        </CardContent>
        {!isNil(actions) && (
          <CardActions classes={{ root: classes.footer }}>
            <Box display="flex" flexDirection="column">
              {actions}
            </Box>
          </CardActions>
        )}
      </MuiCard>
    </Box>
  );
};

EventCard.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  isFromCurrentUser: PropTypes.bool,
  text: PropTypes.string,
  author: PropTypes.shape({
    displayName: PropTypes.string,
    avatarUrl: PropTypes.string,
  }),
  titleProps: PropTypes.object,
  titleTypographyProps: PropTypes.object,
  actions: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object, PropTypes.node])),
    PropTypes.object,
    PropTypes.node,
  ]),
};

EventCard.defaultProps = {
  children: null,
  className: '',
  author: {
    avatar: null,
    name: null,
  },
  text: null,
  titleProps: {},
  titleTypographyProps: {},
  isFromCurrentUser: false,
  actions: null,

};

export default EventCard;
