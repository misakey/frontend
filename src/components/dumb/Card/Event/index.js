import React, { useMemo, forwardRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withTranslation } from 'react-i18next';

import { CARD_BORDER_RADIUS } from '@misakey/ui/constants/sizes';

import isNil from '@misakey/helpers/isNil';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Avatar from '@misakey/ui/Avatar/User';
import TypographyPreWrapped from '@misakey/ui/Typography/PreWrapped';
import Typography from '@material-ui/core/Typography';
import MuiCard from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Box from '@material-ui/core/Box';
import CardHeader from 'components/dumb/Card/Header';

const useStyles = makeStyles((theme) => ({
  root: {
    '& > :first-child': {
      margin: theme.spacing(0, 1, 0, 0),
    },
  },
  card: {
    overflow: 'hidden',
    background: 0,
    [theme.breakpoints.down('xl')]: {
      maxWidth: '50%',
    },
    [theme.breakpoints.down('md')]: {
      maxWidth: '65%',
    },
    [theme.breakpoints.down('sm')]: {
      maxWidth: '80%',
    },
    [theme.breakpoints.up('xl')]: {
      maxWidth: 600,
    },
  },
  boxRoot: {
    borderRadius: CARD_BORDER_RADIUS,
    backgroundColor: theme.palette.background.message,
  },
  content: {
    padding: 0,
  },
  text: {
    padding: theme.spacing(1),
  },
  date: {
    padding: theme.spacing(0, 1),
  },
  footer: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(0),
    borderTop: `1px solid ${theme.palette.divider}`,
    '& > *': {
      width: '100%',
      borderRadius: 0,
    },
  },
}));

const EventCard = forwardRef(({
  isFromCurrentUser,
  children,
  className,
  author,
  text,
  date,
  isEdited,
  actions,
  titleProps,
  t,
  ...rest
}, ref) => {
  const classes = useStyles();

  const { displayName, avatarUrl } = useMemo(() => author, [author]);

  return (
    <Box
      display="flex"
      alignItems="flex-end"
      justifyContent={isFromCurrentUser ? 'flex-end' : 'flex-start'}
      py={1}
      className={classes.root}
      {...omitTranslationProps(rest)}
    >
      {!isFromCurrentUser && <Avatar avatarUrl={avatarUrl} displayName={displayName} />}
      <MuiCard
        ref={ref}
        className={clsx(classes.card, className)}
        elevation={0}
        square
      >
        {!isFromCurrentUser && (
          <CardHeader
            title={displayName}
            {...titleProps}
          />
        )}
        <Box classes={{ root: classes.boxRoot }}>
          {children}
          <CardContent classes={{ root: classes.content }}>
            {!isNil(text) && (
            <TypographyPreWrapped component={Box} className={classes.text}>
              {text}
            </TypographyPreWrapped>
            )}
            {!isNil(date) && (
              <Typography
                className={classes.date}
                variant="caption"
                display="block"
                color="textSecondary"
                align="right"
              >
                {isEdited ? t('components:cardEvent.edited', { date }) : date}
              </Typography>
            )}
          </CardContent>
          {!isNil(actions) && (
            <CardActions classes={{ root: classes.footer }}>
              <Box display="flex" flexDirection="column">
                {actions}
              </Box>
            </CardActions>
          )}
        </Box>
      </MuiCard>
    </Box>
  );
});

EventCard.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  isFromCurrentUser: PropTypes.bool,
  text: PropTypes.node,
  isEdited: PropTypes.bool,
  author: PropTypes.shape({
    displayName: PropTypes.string,
    avatarUrl: PropTypes.string,
  }),
  titleProps: PropTypes.object,
  actions: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object, PropTypes.node])),
    PropTypes.object,
    PropTypes.node,
  ]),
  date: PropTypes.string,
  // withTranslation
  t: PropTypes.func.isRequired,
};

EventCard.defaultProps = {
  children: null,
  className: '',
  author: {
    avatar: null,
    name: null,
  },
  text: null,
  isEdited: false,
  titleProps: {},
  isFromCurrentUser: false,
  actions: null,
  date: null,
};

export default withTranslation('components', { withRef: true })(EventCard);
