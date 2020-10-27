import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import isNil from '@misakey/helpers/isNil';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Box from '@material-ui/core/Box';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import AvatarUser from '@misakey/ui/Avatar/User';
import Skeleton from '@material-ui/lab/Skeleton';
import { Typography } from '@material-ui/core';

// HOOKS
const useStyles = makeStyles((theme) => ({
  listItemRoot: {
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
  },
  listItemSelected: {
    backgroundColor: 'transparent !important',
  },
  listItemAvatar: {
    display: 'flex',
    justifyContent: 'center',
  },
  floatingLabel: {
    backgroundColor: theme.palette.background.paper,
    textTransform: 'uppercase',
  },
}));

// COMPONENTS
const ListItemConsentEmail = ({ avatarUrl, displayName, email, selected, children }) => {
  const classes = useStyles();
  const { t } = useTranslation('common');

  const hasEmail = useMemo(
    () => !isNil(email),
    [email],
  );

  return (
    <ListItem
      disabled={!hasEmail}
      classes={{ root: classes.listItemRoot, selected: classes.listItemSelected }}
      disableGutters
      selected={selected}
    >
      <ListItemAvatar className={classes.listItemAvatar}>
        <AvatarUser avatarUrl={avatarUrl} displayName={displayName} />
      </ListItemAvatar>
      <Box position="absolute" top={-13} left={26} className={classes.floatingLabel}>
        <Typography variant="caption" color="textSecondary">{t('common:connect.email')}</Typography>
      </Box>
      <ListItemText
        primaryTypographyProps={{ color: 'textSecondary', noWrap: true }}
        primary={hasEmail ? email : (
          <Skeleton animation={false} width="50%" />
        )}
      />
      {children && (
        <ListItemSecondaryAction>
          {children}
        </ListItemSecondaryAction>
      )}
    </ListItem>
  );
};

ListItemConsentEmail.propTypes = {
  avatarUrl: PropTypes.string,
  displayName: PropTypes.string,
  email: PropTypes.string,
  selected: PropTypes.bool,
  children: PropTypes.node,
};

ListItemConsentEmail.defaultProps = {
  avatarUrl: null,
  displayName: null,
  email: null,
  selected: false,
  children: null,
};

export default ListItemConsentEmail;
