import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { generatePath, Link } from 'react-router-dom';

import routes from 'routes';
import IdentitySchema from 'store/schemas/Identity';
import { MISAKEY_ACCOUNT_ID } from 'constants/account';

import isNil from '@misakey/helpers/isNil';

import { makeStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import ListItem from '@material-ui/core/ListItem';
import ListItemPassword from 'components/smart/ListItem/Password';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import AvatarDetailed from '@misakey/ui/Avatar/Detailed';
// import UserStorage from 'components/oldScreens/Account/Home/UserStorage';
// import DeleteAccountListItem from 'components/oldScreens/Account/Home/DeleteAccount';
import CardIdentityHeader from 'components/dumb/Card/Identity/Header';
import CardList from 'components/dumb/Card/List';

// HOOKS
const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  listItemTextBreak: {
    overflowWrap: 'break-word',
  },
  listItemContainer: {
    width: '100%',
  },
  listItemIcon: {
    textTransform: 'uppercase',
    width: '8rem',
  },
  actionIcon: {
    width: 40,
    verticalAlign: 'middle',
  },
}));

// COMPONENTS
const CardIdentity = ({ identity, t }) => {
  const classes = useStyles();

  const { displayName, avatarUrl, notifications } = useMemo(() => identity || {}, [identity]);
  const { accountId } = useMemo(() => identity || {}, [identity]);
  const hasAccountId = useMemo(() => !isNil(accountId), [accountId]);

  const listItemDisplayNameTo = useMemo(
    () => generatePath(routes.accounts.displayName, { id: accountId || MISAKEY_ACCOUNT_ID }),
    [accountId],
  );

  const listItemNotificationsTo = useMemo(
    () => generatePath(routes.accounts.notifications, { id: accountId || MISAKEY_ACCOUNT_ID }),
    [accountId],
  );

  const listItemAvatarTo = useMemo(
    () => generatePath(routes.accounts.avatar._, { id: accountId || MISAKEY_ACCOUNT_ID }),
    [accountId],
  );

  const listItemPasswordTo = useMemo(
    () => (hasAccountId ? generatePath(routes.accounts.password, { id: accountId }) : null),
    [accountId, hasAccountId],
  );

  return (
    <Container className={classes.container} maxWidth="sm">
      <AvatarDetailed
        text={displayName}
        image={avatarUrl}
        title={displayName}
      />
      <CardList>
        <ListItem
          button
          to={listItemDisplayNameTo}
          component={Link}
          divider
          aria-label={t('fields:displayName.action')}
          classes={{ container: classes.listItemContainer }}
        >
          <ListItemIcon className={classes.listItemIcon}>
            <Typography>{t('fields:displayName.label')}</Typography>
          </ListItemIcon>
          <ListItemText primary={displayName} className={classes.listItemTextBreak} />
          <ChevronRightIcon className={classes.actionIcon} />
        </ListItem>
        <ListItem
          button
          to={listItemAvatarTo}
          component={Link}
          divider
          aria-label={t('fields:avatar.action')}
          classes={{ container: classes.listItemContainer }}
        >
          <ListItemIcon className={classes.listItemIcon}>
            <Typography>{t('fields:avatar.label')}</Typography>
          </ListItemIcon>
          <ListItemText primary={t('fields:avatar.helperText')} />
          <ChevronRightIcon className={classes.actionIcon} />
        </ListItem>
        <ListItemPassword
          classes={{
            container: classes.listItemContainer,
            icon: classes.listItemIcon,
            actionIcon: classes.actionIcon,
          }}
          button
          divider
          to={listItemPasswordTo}
          hasPassword={hasAccountId}
        />
      </CardList>
      <CardIdentityHeader>{t('account:sections.myNotifications.title')}</CardIdentityHeader>
      <CardList>
        <ListItem
          button
          to={listItemNotificationsTo}
          component={Link}
          divider
          aria-label={t('fields:notifications.action')}
          classes={{ container: classes.listItemContainer }}
        >
          <ListItemIcon className={classes.listItemIcon}>
            <Typography>{t('fields:notifications.label')}</Typography>
          </ListItemIcon>
          <ListItemText primary={t(`fields:notifications.${notifications}`)} />
          <ChevronRightIcon className={classes.actionIcon} />
        </ListItem>
      </CardList>
      {/* <CardIdentityHeader>{t('account:sections.myVault.title')}</CardIdentityHeader>
      <CardList>
        <ListItem
          classes={{ container: classes.listItemContainer }}
          divider
        >
          <ListItemIcon className={classes.listItemIcon}>
            <Typography>{t('account:quota.title')}</Typography>
          </ListItemIcon>
          <UserStorage />
        </ListItem>
        <ListItem
          classes={{ container: classes.listItemContainer }}
          button
          component={Link}
          disabled
          // to={routes.accounts.exportCrypto}
        >
          <ListItemIcon className={classes.listItemIcon}>
            <Typography>{t('account:exportCrypto.title')}</Typography>
          </ListItemIcon>
          <ListItemText primary={t('account:exportCrypto.helperText')} />
          <ChevronRightIcon className={classes.actionIcon} />
        </ListItem>
      </CardList> */}
      {/* <CardIdentityHeader>{t('account:sections.myAccount.title')}</CardIdentityHeader>
      <CardList>
        <DeleteAccountListItem
          identity={identity}
          classes={{ listItemIcon: classes.listItemIcon, actionIcon: classes.actionIcon }}
        />
      </CardList> */}
    </Container>
  );
};

CardIdentity.propTypes = {
  identity: PropTypes.shape(IdentitySchema.propTypes),
  t: PropTypes.func.isRequired,
};

CardIdentity.defaultProps = {
  identity: null,
};

export default withTranslation('fields', 'account')(CardIdentity);
