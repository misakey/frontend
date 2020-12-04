import { useMemo, forwardRef } from 'react';
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
    maxWidth: '100%',
  },
  cardMaxWidth: {
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
  selected: {
    backgroundColor: theme.palette.action.selected,
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
    // borderTop: `1px solid ${theme.palette.divider}`,
    '& > *': {
      width: '100%',
      '& *': {
        borderRadius: `0 0 ${CARD_BORDER_RADIUS}px ${CARD_BORDER_RADIUS}px`,
      },
    },
  },
}));

const EventCard = forwardRef(({
  isFromCurrentUser,
  children,
  classes,
  author,
  text,
  date,
  isEdited,
  isSelected,
  actions,
  titleProps,
  disableMaxWidth,
  t,
  ...rest
}, ref) => {
  const internalClasses = useStyles();
  const { displayName, avatarUrl } = useMemo(() => author, [author]);

  return (
    <Box
      display="flex"
      alignItems="flex-end"
      justifyContent={isFromCurrentUser ? 'flex-end' : 'flex-start'}
      py={1}
      px={2}
      className={clsx(
        classes.container,
        internalClasses.root,
        { [internalClasses.selected]: isSelected },
      )}
      {...omitTranslationProps(rest)}
    >
      {!isFromCurrentUser && <Avatar avatarUrl={avatarUrl} displayName={displayName} />}
      <MuiCard
        ref={ref}
        className={clsx(
          internalClasses.card,
          classes.card,
          { [internalClasses.cardMaxWidth]: !disableMaxWidth },
        )}
        elevation={0}
        square
      >
        {!isFromCurrentUser && (
          <CardHeader
            title={displayName}
            titleTypographyProps={titleProps}
          />
        )}
        <Box classes={{ root: internalClasses.boxRoot }}>
          {children}
          <CardContent classes={{ root: internalClasses.content }}>
            {!isNil(text) && (
              <TypographyPreWrapped component={Box} className={internalClasses.text}>
                {text}
              </TypographyPreWrapped>
            )}
            {!isNil(date) && (
              <Typography
                className={internalClasses.date}
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
            <CardActions classes={{ root: internalClasses.footer }}>
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
  classes: PropTypes.shape({
    container: PropTypes.string,
    card: PropTypes.string,
    cardMaxWidth: PropTypes.string,
  }),
  isFromCurrentUser: PropTypes.bool,
  text: PropTypes.node,
  isEdited: PropTypes.bool,
  isSelected: PropTypes.bool,
  disableMaxWidth: PropTypes.bool,
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
  classes: {},
  author: {
    avatar: null,
    name: null,
  },
  text: null,
  isEdited: false,
  isSelected: false,
  disableMaxWidth: false,
  titleProps: {},
  isFromCurrentUser: false,
  actions: null,
  date: null,
};

export default withTranslation('components', { withRef: true })(EventCard);
