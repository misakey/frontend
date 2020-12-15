import PropTypes from 'prop-types';

import BoxSchema from 'store/schemas/Boxes';

import { useTranslation } from 'react-i18next';
import makeStyles from '@material-ui/core/styles/makeStyles';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Avatar from '@material-ui/core/Avatar';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import MenuBoxLink from 'components/smart/Menu/BoxLink';

import LinkIcon from '@material-ui/icons/Link';

// HOOKS
const useStyles = makeStyles((theme) => ({
  listItemSpaced: {
    marginBottom: theme.spacing(2),
  },
  avatar: {
    marginRight: theme.spacing(1),
  },
}));

// COMPONENTS
const ListItemShareBoxLink = ({ shareAction, disabled, isOwner, box }) => {
  const { t } = useTranslation(['common', 'boxes']);
  const classes = useStyles();

  return (
    <ListItem
      aria-label={t('common:share')}
      disabled={disabled}
      className={classes.listItemSpaced}
    >
      <ListItemAvatar>
        <Avatar className={classes.avatar}><LinkIcon fontSize="small" /></Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={t('boxes:read.share.link.title')}
        primaryTypographyProps={{ variant: 'h6', color: 'textPrimary' }}
      />
      <Button
        standing={BUTTON_STANDINGS.TEXT}
        text={t('common:share')}
        disabled={disabled}
        onClick={shareAction}
      />
      {isOwner && (
      <ListItemSecondaryAction>
        <MenuBoxLink disabled={disabled} box={box} />
      </ListItemSecondaryAction>
      )}
    </ListItem>
  );
};

ListItemShareBoxLink.propTypes = {
  box: PropTypes.shape(BoxSchema.propTypes).isRequired,
  shareAction: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  isOwner: PropTypes.bool,
};

ListItemShareBoxLink.defaultProps = {
  disabled: false,
  isOwner: false,
};

export default ListItemShareBoxLink;
