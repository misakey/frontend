import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import routes from 'routes';
import IdentitySchema from 'store/schemas/Identity';

import { makeStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import AvatarDetailed from '@misakey/ui/Avatar/Detailed';
import UserStorage from 'components/screens/Account/Home/UserStorage';
import DeleteAccountListItem from 'components/screens/Account/Home/DeleteAccount';
import CardIdentityHeader from 'components/dumb/Card/Identity/Header';
import CardList from 'components/dumb/Card/List';

// HOOKS
const useStyles = makeStyles(() => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emailItem: {
    maxWidth: '100%',
  },
  emailItemTypo: {
    width: '100%',
    display: 'inline-block',
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

const CardIdentity = ({ identity, t }) => {
  const { displayName, avatarUrl, handle, email, notifications } = identity;
  const classes = useStyles();

  return (
    <Container className={classes.container} maxWidth="sm">
      <AvatarDetailed
        text={displayName}
        image={avatarUrl}
        title={displayName}
        subtitle={`@${handle}`}
      />
      <CardList>
        <ListItem
          button
          to={routes.account.profile.name}
          component={Link}
          divider
          aria-label={t('fields:displayName.action')}
          classes={{ container: classes.listItemContainer }}
        >
          <ListItemIcon className={classes.listItemIcon}>
            <Typography>{t('fields:displayName.label')}</Typography>
          </ListItemIcon>
          <ListItemText primary={displayName} />
          <ChevronRightIcon className={classes.actionIcon} />
        </ListItem>
        <ListItem
          button
          to={routes.account.profile.avatar._}
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
        <ListItem
          button
          to={routes.account.profile.password}
          component={Link}
          divider
          aria-label={t('fields:password.action')}
          classes={{ container: classes.listItemContainer }}
        >
          <ListItemIcon className={classes.listItemIcon}>
            <Typography>{t('fields:password.label')}</Typography>
          </ListItemIcon>
          <ListItemText primary={t('fields:password.placeholder')} />
          <ChevronRightIcon className={classes.actionIcon} />
        </ListItem>
        <ListItem
          classes={{ container: classes.listItemContainer }}
        >
          <ListItemIcon className={classes.listItemIcon}>
            <Typography>{t('fields:email.label')}</Typography>
          </ListItemIcon>
          <ListItemText
            primary={email}
            primaryTypographyProps={{ noWrap: true, className: classes.emailItemTypo }}
            className={classes.emailItem}
          />
        </ListItem>
      </CardList>
      <CardIdentityHeader>{t('account:sections.myNotifications')}</CardIdentityHeader>
      <CardList>
        <ListItem
          button
          to={routes.account.profile.notifications}
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
        <ListItem
          classes={{ container: classes.listItemContainer }}
        >
          <ListItemIcon className={classes.listItemIcon}>
            <Typography>{t('fields:email.label')}</Typography>
          </ListItemIcon>
          <ListItemText
            primary={email}
            primaryTypographyProps={{ noWrap: true, className: classes.emailItemTypo }}
            className={classes.emailItem}
          />
        </ListItem>
      </CardList>
      <CardIdentityHeader>{t('account:sections.myVault')}</CardIdentityHeader>
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
          to={routes.account.profile.exportCrypto}
        >
          <ListItemIcon className={classes.listItemIcon}>
            <Typography>{t('account:exportCrypto.title')}</Typography>
          </ListItemIcon>
          <ListItemText primary={t('account:exportCrypto.helperText')} />
          <ChevronRightIcon className={classes.actionIcon} />
        </ListItem>
      </CardList>
      <CardIdentityHeader>{t('account:sections.myAccount')}</CardIdentityHeader>
      <CardList>
        <DeleteAccountListItem
          identity={identity}
          classes={{ listItemIcon: classes.listItemIcon, actionIcon: classes.actionIcon }}
        />
      </CardList>
    </Container>
  );
};

CardIdentity.propTypes = {
  identity: PropTypes.shape(IdentitySchema.propTypes).isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation('fields', 'account')(CardIdentity);
