import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import routes from 'routes';
import IdentitySchema from 'store/schemas/Identity';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';

import Box from '@material-ui/core/Box';
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
import CardActionArea from '@material-ui/core/CardActionArea';
import Card from '@material-ui/core/Card';

// HOOKS
const useStyles = makeStyles((theme) => ({
  avatarDetailedRoot: {
    margin: theme.spacing(1, 1),
    padding: theme.spacing(1, 0),
  },
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
    width: '9rem',
  },
  actionIcon: {
    width: 40,
    verticalAlign: 'middle',
  },
  colorDot: ({ color }) => ({
    backgroundColor: color,
    borderRadius: 50,
    width: 20,
    height: 20,
    marginRight: theme.spacing(1),
  }),
  cardActionArea: {
    borderRadius: theme.shape.borderRadius,
    userSelect: 'text',
  },
}));

// COMPONENTS
const CardIdentity = forwardRef(({ identity, t }, ref) => {
  const {
    displayName, avatarUrl, notifications, color, identifier: { value: identifierValue } = {},
  } = useMemo(() => identity || {}, [identity]);

  const classes = useStyles({ color });

  const { accountId } = useMemo(() => identity || {}, [identity]);

  const listItemDisplayNameTo = useGeneratePathKeepingSearchAndHash(
    routes.accounts.displayName,
    { id: accountId },
  );

  const listItemNotificationsTo = useGeneratePathKeepingSearchAndHash(
    routes.accounts.notifications,
    { id: accountId },
  );

  const listItemColorsTo = useGeneratePathKeepingSearchAndHash(
    routes.accounts.colors,
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
    <Container ref={ref} className={classes.container} maxWidth="sm">
      <Card elevation={0}>
        <CardActionArea
          draggable="false"
          className={classes.cardActionArea}
          component={Link}
          to={listItemAvatarTo}
        >
          <AvatarDetailed
            classes={{ root: classes.avatarDetailedRoot }}
            text={displayName}
            image={avatarUrl}
            title={displayName}
            subtitle={identifierValue}
          />
        </CardActionArea>
      </Card>
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

      <CardIdentityHeader>{t('account:sections.myInterface.title')}</CardIdentityHeader>
      <CardList>
        <ListItem
          button
          to={listItemColorsTo}
          component={Link}
          divider
          aria-label={t('fields:accountColor.action')}
          classes={{ container: classes.listItemContainer }}
        >
          <ListItemIcon className={classes.listItemIcon}>
            <Typography>{t('fields:accountColor.label')}</Typography>
          </ListItemIcon>
          <ListItemText
            primary={(
              <Box display="flex" flexDirection="raw" alignItems="center">
                <div className={classes.colorDot} />
              </Box>
            )}
            disableTypography
          />
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
});

CardIdentity.propTypes = {
  identity: PropTypes.shape(IdentitySchema.propTypes),
  t: PropTypes.func.isRequired,
};

CardIdentity.defaultProps = {
  identity: null,
};

export default withTranslation(['fields', 'account'], { withRef: true })(CardIdentity);
