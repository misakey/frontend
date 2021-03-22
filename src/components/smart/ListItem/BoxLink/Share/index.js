import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import BoxSchema from 'store/schemas/Boxes';

import { useTranslation } from 'react-i18next';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useXsMediaQuery from '@misakey/hooks/useXsMediaQuery';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Avatar from '@material-ui/core/Avatar';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import MenuBoxLink from 'components/smart/Menu/BoxLink';
import withDialogShare from 'components/smart/Dialog/BoxLink/Share/with';
import ButtonCopyBoxLink from 'components/smart/Button/Copy/BoxLink';

import LinkIcon from '@material-ui/icons/Link';

// HOOKS
const useStyles = makeStyles((theme) => ({
  avatar: {
    marginRight: theme.spacing(1),
  },
}));

// COMPONENTS
const ButtonShareBoxLink = withDialogShare(Button);

const ListItemShareBoxLink = ({ disabled, forceEnableMenu, isOwner, box }) => {
  const { t } = useTranslation(['common', 'boxes']);
  const classes = useStyles();

  const isXs = useXsMediaQuery();

  const menuDisabled = useMemo(
    () => disabled && !forceEnableMenu,
    [disabled, forceEnableMenu],
  );

  return (
    <ListItem
      aria-label={t('common:share')}
      disabled={menuDisabled}
    >
      <ListItemAvatar>
        <Avatar className={classes.avatar}><LinkIcon fontSize="small" /></Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={t('boxes:read.share.link.title')}
        primaryTypographyProps={{ variant: 'h6', color: 'textPrimary' }}
      />
      {!isXs && (
        <ButtonCopyBoxLink
          variant="text"
          box={box}
        />
      )}
      <ButtonShareBoxLink
        standing={BUTTON_STANDINGS.TEXT}
        text={t('common:share')}
        disabled={disabled}
        box={box}
      />
      {isOwner && (
      <ListItemSecondaryAction>
        <MenuBoxLink disabled={menuDisabled} box={box} />
      </ListItemSecondaryAction>
      )}
    </ListItem>
  );
};

ListItemShareBoxLink.propTypes = {
  box: PropTypes.shape(BoxSchema.propTypes).isRequired,
  disabled: PropTypes.bool,
  forceEnableMenu: PropTypes.bool,
  isOwner: PropTypes.bool,
};

ListItemShareBoxLink.defaultProps = {
  disabled: false,
  forceEnableMenu: false,
  isOwner: false,
};

export default ListItemShareBoxLink;
