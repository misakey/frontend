import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import moment from 'moment';
import any from '@misakey/core/helpers/any';
import complement from '@misakey/core/helpers/complement';
import isEmpty from '@misakey/core/helpers/isEmpty';
import toLower from '@misakey/core/helpers/toLower';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Card from '@material-ui/core/Card';
import Box from '@material-ui/core/Box';
import CardHeader from '@material-ui/core/CardHeader';
import AvatarUser from '@misakey/ui/Avatar/User';
import Skeleton from '@material-ui/lab/Skeleton';

// HELPERS
const isNotEmptyUser = any(complement(isEmpty));

// HOOKS
const useStyles = makeStyles((theme) => ({
  cardRoot: {
    overflow: 'visible',
    '& .MuiInputBase-input,.MuiInputBase-root': {
      borderRadius: `0 0 ${theme.shape.borderRadius}px ${theme.shape.borderRadius}px`,
    },
    '& .MuiInput-underline, .MuiFilledInput-underline': {
      '&:before,&:after': {
        borderRadius: theme.shape.borderRadius,
      },
      '&:after': {
        height: '100%',
      },
    },
  },
  cardHeaderRoot: ({ disablePadding }) => ({
    padding: theme.spacing(1, 1, disablePadding ? 0 : 1, 1),
    textAlign: 'start',
  }),
  cardHeaderSubheader: ({ expired }) => ({
    color: expired ? theme.palette.error.main : null,
  }),
  cardHeaderAction: {
    // instead of marginTop: -8, to center button
    marginTop: -4,
    marginBottom: -4,
    minWidth: 48,
    minHeight: 48,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

// COMPONENTS
const CardUser = ({
  identifier,
  displayName,
  avatarUrl,
  expired,
  // unix timestamp
  expiresAt,
  action,
  children,
  disablePadding,
  hideSkeleton,
  isLoading,
  ...props
}) => {
  const classes = useStyles({ disablePadding, expired });
  const { t } = useTranslation(['common', 'components']);


  const isNotEmpty = useMemo(
    () => isNotEmptyUser([identifier, displayName, avatarUrl]),
    [identifier, displayName, avatarUrl],
  );

  const subheader = useMemo(
    () => {
      if (isLoading) { return <Skeleton width={400} />; }
      if (expired) {
        const fromNow = isEmpty(expiresAt) ? '' : moment(expiresAt).fromNow();
        return t('common:expired', { fromNow });
      }
      return isNotEmpty ? toLower(identifier) : t('common:noSession');
    },
    [isLoading, expired, isNotEmpty, identifier, t, expiresAt],
  );

  const title = useMemo(
    () => {
      if (isLoading) {
        return <Skeleton width={200} />;
      }
      return isNotEmpty ? displayName : t('common:identity');
    },
    [isLoading, isNotEmpty, displayName, t],
  );

  return (
    <Card
      variant="outlined"
      component={Box}
      classes={{ root: classes.cardRoot }}
      {...props}
    >
      {(!hideSkeleton || isNotEmpty) && (
        <CardHeader
          classes={{
            root: classes.cardHeaderRoot,
            subheader: classes.cardHeaderSubheader,
            action: classes.cardHeaderAction,
          }}
          avatar={(
            <AvatarUser avatarUrl={avatarUrl} displayName={displayName} />
          )}
          action={action}
          title={title}
          subheader={subheader}
        />
      )}
      {children}
    </Card>
  );
};

CardUser.propTypes = {
  avatarUrl: PropTypes.string,
  displayName: PropTypes.string,
  identifier: PropTypes.string,
  expired: PropTypes.bool,
  expiresAt: PropTypes.string,
  action: PropTypes.node,
  children: PropTypes.node,
  disablePadding: PropTypes.bool,
  hideSkeleton: PropTypes.bool,
  isLoading: PropTypes.bool,
};

CardUser.defaultProps = {
  identifier: '',
  displayName: '',
  avatarUrl: '',
  expired: false,
  expiresAt: null,
  action: null,
  children: null,
  disablePadding: false,
  hideSkeleton: false,
  isLoading: false,
};

export default CardUser;
