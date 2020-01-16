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
import AvatarColorized from 'components/dumb/Avatar/Colorized';
import AvatarDetailed from 'components/dumb/Avatar/Detailed';

import UserStorage from 'components/screens/Account/Home/UserStorage';
import DeleteAccountListItem from 'components/screens/Account/Home/DeleteAccount';

import 'components/dumb/Card/Profile/index.scss';

// HOOKS
const useStyles = makeStyles(() => ({
  container: {
    width: '100%',
  },
}));

const CardProfile = ({ profile, t }) => {
  const { displayName, avatarUri, handle, email } = profile;
  const classes = useStyles();

  return (
    <Container className="card" maxWidth="sm">
      <AvatarDetailed
        text={displayName}
        image={avatarUri}
        title={displayName}
        subtitle={`@${handle}`}
      />
      <List className="details">
        <ListItem
          button
          to={routes.account.profile.name}
          component={Link}
          divider
          aria-label={t('fields:displayName.action')}
          classes={classes}
        >
          <ListItemIcon className="title">
            <Typography>{t('fields:displayName.label')}</Typography>
          </ListItemIcon>
          <ListItemText primary={displayName} />
          <ListItemSecondaryAction>
            <ChevronRightIcon className="icon" />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem
          button
          to={routes.account.profile.avatar._}
          component={Link}
          divider
          aria-label={t('fields:avatar.action')}
          classes={classes}
        >
          <ListItemIcon className="title">
            <Typography>{t('fields:avatar.label')}</Typography>
          </ListItemIcon>
          <ListItemText primary={t('fields:avatar.helperText')} />
          <ListItemSecondaryAction>
            <AvatarColorized
              text={displayName}
              image={avatarUri}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem
          button
          to={routes.account.profile.password}
          component={Link}
          divider
          aria-label={t('fields:password.action')}
          classes={classes}
        >
          <ListItemIcon className="title">
            <Typography>{t('fields:password.label')}</Typography>
          </ListItemIcon>
          <ListItemText primary={t('fields:password.placeholder')} />
          <ListItemSecondaryAction>
            <ChevronRightIcon className="icon" />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem
          classes={classes}
          divider
        >
          <ListItemIcon className="title">
            <Typography>{t('fields:email.shortLabel')}</Typography>
          </ListItemIcon>
          <ListItemText primary={email} />
        </ListItem>

        <ListItem
          classes={classes}
          divider
        >
          <ListItemIcon className="title">
            <Typography>{t('screens:account.quota.title')}</Typography>
          </ListItemIcon>
          <UserStorage />
        </ListItem>
        <DeleteAccountListItem
          profile={profile}
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

export default withTranslation('fields', 'screens')(CardProfile);
