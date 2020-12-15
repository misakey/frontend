import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import moment from 'moment';
import any from '@misakey/helpers/any';
import complement from '@misakey/helpers/complement';
import isEmpty from '@misakey/helpers/isEmpty';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Card from '@material-ui/core/Card';
import Box from '@material-ui/core/Box';
import CardHeader from '@material-ui/core/CardHeader';
import AvatarUser from '@misakey/ui/Avatar/User';

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
      if (expired) {
        const fromNow = isEmpty(expiresAt) ? '' : moment.unix(expiresAt).fromNow();
        return t('common:expired', { fromNow });
      }
      return isNotEmpty ? identifier : t('common:noSession');
    },
    [expired, expiresAt, isNotEmpty, identifier, t],
  );

  const title = useMemo(
    () => (isNotEmpty
      ? displayName
      : t('common:identity')),
    [isNotEmpty, displayName, t],
  );

  return (
    <Card
      variant="outlined"
      component={Box}
      classes={{ root: classes.cardRoot }}
      {...props}
    >
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
      {children}
    </Card>
  );
};

CardUser.propTypes = {
  avatarUrl: PropTypes.string,
  displayName: PropTypes.string,
  identifier: PropTypes.string,
  expired: PropTypes.bool,
  // unix timestamp
  expiresAt: PropTypes.number,
  action: PropTypes.node,
  children: PropTypes.node,
  disablePadding: PropTypes.bool,
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
};

export default CardUser;
