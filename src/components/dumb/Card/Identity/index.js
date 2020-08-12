import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import routes from 'routes';
import IdentitySchema from 'store/schemas/Identity';

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
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';

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

  const listItemDisplayNameTo = useGeneratePathKeepingSearchAndHash(
    routes.accounts.displayName,
    { id: accountId },
  );

  const listItemNotificationsTo = useGeneratePathKeepingSearchAndHash(
    routes.accounts.notifications,
    { id: accountId },
  );

  const listItemAvatarTo = useGeneratePathKeepingSearchAndHash(
    routes.accounts.avatar._,
    { id: accountId },
  );

  const listItemPasswordTo = useGeneratePathKeepingSearchAndHash(
    routes.accounts.password,
    { id: accountId },
  );

  const listItemExportCryptoTo = useGeneratePathKeepingSearchAndHash(
    routes.accounts.vault,
    { id: accountId },
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
      <CardIdentityHeader>{t('account:sections.myVault.title')}</CardIdentityHeader>
      <CardList>
        <ListItem
          classes={{ container: classes.listItemContainer }}
          button
          component={Link}
          to={listItemExportCryptoTo}
        >
          <ListItemIcon className={classes.listItemIcon}>
            <Typography>{t('account:vault.title')}</Typography>
          </ListItemIcon>
          <ListItemText primary={t('account:vault.helperText')} />
          <ChevronRightIcon className={classes.actionIcon} />
        </ListItem>
        {/* <ListItem
          classes={{ container: classes.listItemContainer }}
          divider
        >
          <ListItemIcon className={classes.listItemIcon}>
            <Typography>{t('account:quota.title')}</Typography>
          </ListItemIcon>
          <UserStorage />
        </ListItem> */}
      </CardList>
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
