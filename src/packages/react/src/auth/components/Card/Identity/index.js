import React, { forwardRef, useMemo } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Link, generatePath, useLocation } from 'react-router-dom';

import authRoutes from '@misakey/react/auth/routes';
import IdentitySchema from '@misakey/react/auth/store/schemas/Identity';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecurity from '@misakey/react/auth/components/ListItem/Security';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import AvatarDetailed from '@misakey/ui/Avatar/Detailed';
import UserStorage from '@misakey/react/auth/components/screens/Identity/Account/UserStorage';
import CardIdentityHeader from '@misakey/react/auth/components/Card/Identity/Header';
import CardList from '@misakey/ui/Card/List';
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
    paddingBottom: theme.spacing(1),
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
const CardIdentity = forwardRef(({ identity, identityId, t }, ref) => {
  const {
    displayName,
    avatarUrl,
    notifications,
    color,
    identifierValue,
    hasCrypto,
    accountId,
  } = useSafeDestr(identity);

  const classes = useStyles({ color });

  const location = useLocation();

  const {
    listItemPublicTo,
    listItemColorsTo,
    listItemSecurityTo,
    listItemExportCryptoTo,
    listItemNotificationsTo,
    listItemDeleteAccountTo,
  } = useMemo(
    () => ({
      listItemPublicTo: {
        ...location,
        pathname: generatePath(authRoutes.identities.public, { id: identityId }),
      },
      listItemNotificationsTo: {
        ...location,
        pathname: generatePath(authRoutes.identities.notifications, { id: identityId }),
      },
      listItemColorsTo: {
        ...location,
        pathname: generatePath(authRoutes.identities.colors, { id: identityId }),
      },
      listItemDeleteAccountTo: {
        ...location,
        pathname: generatePath(
          authRoutes.identities.accounts.delete,
          { id: identityId, accountId },
        ),
      },
      listItemSecurityTo: {
        ...location,
        pathname: generatePath(
          authRoutes.identities.accounts.security,
          { id: identityId, accountId },
        ),
      },
      listItemExportCryptoTo: {
        ...location,
        pathname: generatePath(
          authRoutes.identities.accounts.vault,
          { id: identityId, accountId },
        ),
      },
    }),
    [accountId, identityId, location],
  );

  return (
    <Container ref={ref} className={classes.container} maxWidth="sm">
      <Card elevation={0}>
        <CardActionArea
          draggable="false"
          className={classes.cardActionArea}
          component={Link}
          to={listItemPublicTo}
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
          to={listItemPublicTo}
          component={Link}
          divider
          aria-label={t('common:edit')}
          classes={{ container: classes.listItemContainer }}
        >
          <ListItemIcon className={classes.listItemIcon}>
            <Typography>{t('account:public.title')}</Typography>
          </ListItemIcon>
          <ListItemText primary={displayName} className={classes.listItemTextBreak} />
          <ChevronRightIcon className={classes.actionIcon} />
        </ListItem>
        <ListItemSecurity
          classes={{
            container: classes.listItemContainer,
            icon: classes.listItemIcon,
            actionIcon: classes.actionIcon,
          }}
          button
          divider
          to={listItemSecurityTo}
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
      {hasCrypto && (
        <>
          <CardIdentityHeader>{t('account:sections.myVault.title')}</CardIdentityHeader>
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
              divider
              component={Link}
              to={listItemExportCryptoTo}
            >
              <ListItemIcon className={classes.listItemIcon}>
                <Typography>{t('account:vault.title')}</Typography>
              </ListItemIcon>
              <ListItemText primary={t('account:vault.helperText')} />
              <ChevronRightIcon className={classes.actionIcon} />
            </ListItem>
            <ListItem
              classes={{ container: classes.listItemContainer }}
              button
              component={Link}
              to={listItemDeleteAccountTo}
            >
              <ListItemIcon className={classes.listItemIcon}>
                <Typography>{t('account:delete.title')}</Typography>
              </ListItemIcon>
              <ListItemText primary={t('account:delete.label')} primaryTypographyProps={{ color: 'error' }} />
              <ChevronRightIcon className={classes.actionIcon} />
            </ListItem>
          </CardList>
        </>
      )}
    </Container>
  );
});

CardIdentity.propTypes = {
  identity: PropTypes.shape(IdentitySchema.propTypes),
  identityId: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
};

CardIdentity.defaultProps = {
  identity: null,
};

export default withTranslation(['fields', 'account'], { withRef: true })(CardIdentity);
