import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import routes from 'routes';

import { makeStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import AvatarDetailed from '@misakey/ui/Avatar/Detailed';

import UserStorage from 'components/screens/Account/Home/UserStorage';
import DeleteAccountListItem from 'components/screens/Account/Home/DeleteAccount';

// HOOKS
const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  list: {
    width: '100%',
    marginBottom: theme.spacing(2),
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

const CardProfile = ({ profile, t }) => {
  const { displayName, avatarUri, handle, email } = profile;
  const classes = useStyles();

  return (
    <Container className={classes.container} maxWidth="sm">
      <AvatarDetailed
        text={displayName}
        image={avatarUri}
        title={displayName}
        subtitle={`@${handle}`}
      />
      <List className={classes.list}>
        <ListItem
          button
          to={routes.account.profile.name}
          component={Link}
          divider
          aria-label={t('fields__new:displayName.action')}
          classes={{ container: classes.listItemContainer }}
        >
          <ListItemIcon className={classes.listItemIcon}>
            <Typography>{t('fields__new:displayName.label')}</Typography>
          </ListItemIcon>
          <ListItemText primary={displayName} />
          <ListItemSecondaryAction>
            <ChevronRightIcon className={classes.actionIcon} />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem
          button
          to={routes.account.profile.avatar._}
          component={Link}
          divider
          aria-label={t('fields__new:avatar.action')}
          classes={{ container: classes.listItemContainer }}
        >
          <ListItemIcon className={classes.listItemIcon}>
            <Typography>{t('fields__new:avatar.label')}</Typography>
          </ListItemIcon>
          <ListItemText primary={t('fields__new:avatar.helperText')} />
          <ListItemSecondaryAction>
            <ChevronRightIcon className={classes.actionIcon} />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem
          button
          to={routes.account.profile.password}
          component={Link}
          divider
          aria-label={t('fields__new:password.action')}
          classes={{ container: classes.listItemContainer }}
        >
          <ListItemIcon className={classes.listItemIcon}>
            <Typography>{t('fields__new:password.label')}</Typography>
          </ListItemIcon>
          <ListItemText primary={t('fields__new:password.placeholder')} />
          <ListItemSecondaryAction>
            <ChevronRightIcon className={classes.actionIcon} />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem
          classes={{ container: classes.listItemContainer }}
          divider
        >
          <ListItemIcon className={classes.listItemIcon}>
            <Typography>{t('fields__new:email.label')}</Typography>
          </ListItemIcon>
          <ListItemText
            primary={email}
            primaryTypographyProps={{ noWrap: true, className: classes.emailItemTypo }}
            className={classes.emailItem}
          />
        </ListItem>
        <ListItem
          classes={{ container: classes.listItemContainer }}
          divider
        >
          <ListItemIcon className={classes.listItemIcon}>
            <Typography>{t('account__new:quota.title')}</Typography>
          </ListItemIcon>
          <UserStorage />
        </ListItem>
        <DeleteAccountListItem
          profile={profile}
          classes={{ listItemIcon: classes.listItemIcon, actionIcon: classes.actionIcon }}
        />
      </List>
    </Container>
  );
};

CardProfile.propTypes = {
  profile: PropTypes.shape({
    displayName: PropTypes.string,
    avatarUri: PropTypes.string,
    handle: PropTypes.string,
    email: PropTypes.string,
  }).isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation('fields__new', 'account__new')(CardProfile);
