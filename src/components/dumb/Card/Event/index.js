import React, { useMemo, forwardRef } from 'react';

import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withTranslation } from 'react-i18next';

import isNil from '@misakey/core/helpers/isNil';
import omitTranslationProps from '@misakey/core/helpers/omit/translationProps';
import eventStopPropagation from '@misakey/core/helpers/event/stopPropagation';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Avatar from '@misakey/ui/Avatar/User';
import TypographyPreWrapped from '@misakey/ui/Typography/PreWrapped';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import MuiCard from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Box from '@material-ui/core/Box';
import CardHeader from '@material-ui/core/CardHeader';

// HOOKS
const useStyles = makeStyles((theme) => ({
  container: {
    '&:hover': {
      '& > $root': {
        borderTopColor: theme.palette.divider,
        borderBottomColor: theme.palette.divider,
      },
    },
  },
  root: {
    position: 'relative',
    borderTop: '1px solid transparent',
    borderBottom: '1px solid transparent',
  },
  avatarRoot: {
    margin: theme.spacing(0.5, 1, 0.5, 0),
  },
  card: {
    overflow: 'hidden',
    background: 'none',
    maxWidth: '100%',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
  },
  cardHeaderRoot: {
    padding: theme.spacing(0),
  },
  content: {
    padding: 0,
  },
  date: {
    padding: theme.spacing(0, 1),
  },
  footer: {
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing(0),
    width: '100%',
  },
}));

const EventCard = forwardRef(({
  containerProps,
  content,
  children,
  classes,
  author,
  text,
  date,
  isEdited,
  actions,
  titleProps,
  t,
  ...rest
}, ref) => {
  const internalClasses = useStyles();
  const { displayName, avatarUrl } = useMemo(() => author, [author]);

  return (
    <Box
      className={clsx(
        internalClasses.container,
        classes.container,
      )}
      {...containerProps}
    >
      <Box
        display="flex"
        alignItems="flex-start"
        justifyContent="flex-start"
        pb={1}
        px={2}
        className={clsx(
          classes.root,
          internalClasses.root,
        )}
        {...omitTranslationProps(rest)}
      >
        <Avatar
          classes={{ root: internalClasses.avatarRoot }}
          avatarUrl={avatarUrl}
          displayName={displayName}
        />
        <MuiCard
          ref={ref}
          className={clsx(
            internalClasses.card,
            classes.card,
          )}
          elevation={0}
          square
        >
          <CardHeader
            classes={{ root: internalClasses.cardHeaderRoot }}
            disableTypography
            title={(
              <Box
                display="flex"
                flexDirection="row"
              >
                <Subtitle variant="caption" gutterBottom={false} color="textPrimary" {...titleProps}>
                  {displayName}
                </Subtitle>
                <Box ml={2}>
                  <Subtitle variant="caption" gutterBottom={false} color="textSecondary">
                    {isEdited ? t('components:cardEvent.edited', { date }) : date}
                  </Subtitle>
                </Box>
              </Box>
            )}
          />
          {!isNil(text) && (
            <TypographyPreWrapped component="div">
              {text}
            </TypographyPreWrapped>
          )}
          <Box
            display="flex"
            justifyContent="flex-start"
          >
            <CardContent
              onTouchStart={eventStopPropagation}
              classes={{ root: clsx(internalClasses.content, classes.content) }}
            >
              {content}
            </CardContent>
            {!isNil(actions) && (
              <CardActions classes={{ root: internalClasses.footer }}>
                <Box
                  width="100%"
                  display="flex"
                  alignItems="center"
                  justifyContent="flex-start"
                >
                  {actions}
                </Box>
              </CardActions>
            )}
            {children}
          </Box>
        </MuiCard>
      </Box>
    </Box>
  );
});

EventCard.propTypes = {
  content: PropTypes.node,
  children: PropTypes.node,
  containerProps: PropTypes.object,
  classes: PropTypes.shape({
    container: PropTypes.string,
    root: PropTypes.string,
    card: PropTypes.string,
    content: PropTypes.string,
  }),
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
  content: null,
  children: null,
  containerProps: {},
  classes: {},
  author: {
    avatar: null,
    name: null,
  },
  text: null,
  isEdited: false,
  titleProps: {},
  actions: null,
  date: null,
};

export default withTranslation('components', { withRef: true })(EventCard);
