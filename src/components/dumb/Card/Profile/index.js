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
import AvatarColorized from '@misakey/ui/Avatar/Colorized';
import AvatarDetailed from '@misakey/ui/Avatar/Detailed';

import 'components/dumb/Card/Profile/index.scss';

// HOOKS
const useStyles = makeStyles(() => ({
  container: {
    width: '100%',
  },
}));

const CardProfile = ({ profile: { displayName, avatarUri, handle }, t }) => {
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
        <ListItem button to={routes.account.profile.name} component={Link} divider aria-label={t('form.field.displayName.action')} classes={classes}>
          <ListItemIcon className="title">
            <Typography>{t('form.field.displayName.label')}</Typography>
          </ListItemIcon>
          <ListItemText primary={displayName} />
          <ListItemSecondaryAction>
            <ChevronRightIcon className="icon" />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem button to={routes.account.profile.avatar._} component={Link} divider aria-label={t('form.field.avatar.action')} classes={classes}>
          <ListItemIcon className="title">
            <Typography>{t('form.field.avatar.label')}</Typography>
          </ListItemIcon>
          <ListItemText primary={t('form.field.avatar.placeholder')} />
          <ListItemSecondaryAction>
            <AvatarColorized
              text={displayName}
              image={avatarUri}
            />
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem button to={routes.account.profile.password} component={Link} divider aria-label={t('form.field.password.action')} classes={classes}>
          <ListItemIcon className="title">
            <Typography>{t('form.field.password.label')}</Typography>
          </ListItemIcon>
          <ListItemText primary={t('form.field.password.placeholder')} />
          <ListItemSecondaryAction>
            <ChevronRightIcon className="icon" />
          </ListItemSecondaryAction>
        </ListItem>
      </List>
    </Container>
  );
};

CardProfile.propTypes = {
  profile: PropTypes.shape({
    displayName: PropTypes.string,
    avatarUri: PropTypes.string,
    handle: PropTypes.string,
  }).isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation('profile')(CardProfile);
