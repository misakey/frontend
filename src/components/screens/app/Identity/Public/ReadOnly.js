import React, { useMemo, useCallback, useContext, useEffect, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { useScreenDrawerContext } from 'components/smart/Screen/Drawer';
import { UserManagerContext } from '@misakey/auth/components/OidcProvider';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import { getProfile as getProfileBuilder } from '@misakey/helpers/builder/identities';
import isEmpty from '@misakey/helpers/isEmpty';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';
import useFetchEffect from '@misakey/hooks/useFetch/effect';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AvatarDetailed from '@misakey/ui/Avatar/Detailed';
import AvatarDetailedSkeleton from '@misakey/ui/Avatar/Detailed/Skeleton';
import AppBarStatic from '@misakey/ui/AppBar/Static';
import CardIdentityHeader from 'components/dumb/Card/Identity/Header';
import CardList from 'components/dumb/Card/List';
import Card from '@material-ui/core/Card';
import CardOnboardDiscover from 'components/dumb/Card/Onboard/Discover';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import ButtonConnect from 'components/dumb/Button/Connect';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import ButtonContactMailto from '@misakey/ui/Button/Contact/Mailto';
import Subtitle from '@misakey/ui/Typography/Subtitle';

import ToggleDrawerButton from 'components/smart/Screen/Drawer/AppBar/ToggleButton';

// CONSTANTS
const { isAuthenticated: IS_AUTHENTICATED_SELECTOR } = authSelectors;

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
    width: '7rem',
    [theme.breakpoints.only('xs')]: {
      width: '4rem',
    },
  },
  actionIcon: {
    width: 40,
    verticalAlign: 'middle',
  },
  cardActionArea: {
    borderRadius: theme.shape.borderRadius,
    userSelect: 'text',
  },
}));

// COMPONENTS
const IdentityPublicReadOnly = forwardRef(({ t }, ref) => {
  const classes = useStyles();

  const { id } = useParams();
  const { setIsDrawerForceClosed } = useScreenDrawerContext();

  const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);

  const { askSigninRedirect } = useContext(UserManagerContext);

  const onCreateAccount = useCallback(
    () => askSigninRedirect({ acrValues: 2, prompt: 'login' }),
    [askSigninRedirect],
  );

  const getProfile = useCallback(
    () => getProfileBuilder({ identityId: id, isAuthenticated }),
    [id, isAuthenticated],
  );

  const { isFetching, data } = useFetchEffect(
    getProfile,
  );

  const { identifier, displayName, avatarUrl } = useSafeDestr(data);
  const { value: identifierValue, kind } = useSafeDestr(identifier);

  const privateIdentifiervalue = useMemo(
    () => isEmpty(identifierValue),
    [identifierValue],
  );

  const primaryTypographyProps = useMemo(
    () => (privateIdentifiervalue ? { color: 'secondary' } : {}),
    [privateIdentifiervalue],
  );

  const title = useMemo(
    () => t('account:public.other.title', { displayName }),
    [t, displayName],
  );
  useUpdateDocHead(title);

  useEffect(
    () => {
      setIsDrawerForceClosed(true);
    },
    [setIsDrawerForceClosed],
  );

  return (
    <>
      <AppBarStatic>
        <ToggleDrawerButton />
        <BoxFlexFill />
        {!isAuthenticated && (
          <>
            <Button
              standing={BUTTON_STANDINGS.MAIN}
              text={t('onboard:createAccount')}
              onClick={onCreateAccount}
            />
            <Box ml={2}>
              <ButtonConnect
                standing={BUTTON_STANDINGS.TEXT}
              />
            </Box>
          </>
        )}
      </AppBarStatic>
      <Container ref={ref} className={classes.container} maxWidth="sm">
        <Card elevation={0}>
          {isFetching ? (
            <AvatarDetailedSkeleton />
          ) : (
            <AvatarDetailed
              classes={{
                root: classes.avatarDetailedRoot,
              }}
              text={displayName}
              image={avatarUrl}
              title={displayName}
              subtitle={identifierValue}
            />
          )}
          {privateIdentifiervalue ? (
            <Subtitle>{t('account:public.private', { displayName })}</Subtitle>
          ) : (
            <ButtonContactMailto email={identifierValue} />
          )}
        </Card>
        <CardIdentityHeader>{t('account:sections.myIdentifiers.title')}</CardIdentityHeader>
        <CardList>
          <ListItem
            divider
            classes={{ container: classes.listItemContainer }}
          >
            <ListItemIcon className={classes.listItemIcon}>
              {/* @FIXME fallback for backend bugged empty kind */}
              <Typography>{t(`fields:${kind || 'email'}.label`)}</Typography>
            </ListItemIcon>
            <ListItemText
              primary={identifierValue || t('account:public.confirmed')}
              primaryTypographyProps={primaryTypographyProps}
            />
          </ListItem>
        </CardList>
        {!isAuthenticated && (
          <CardOnboardDiscover />
        )}
      </Container>
    </>
  );
});

IdentityPublicReadOnly.propTypes = {
  // withTranslation
  t: PropTypes.func.isRequired,
};

IdentityPublicReadOnly.defaultProps = {
};

export default withTranslation(['fields', 'account', 'onboard'], { withRef: true })(IdentityPublicReadOnly);
