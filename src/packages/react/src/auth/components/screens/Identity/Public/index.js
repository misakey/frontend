import React, { useMemo, useState, useCallback, forwardRef } from 'react';

import PropTypes from 'prop-types';
import clsx from 'clsx';
import { withTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';

import authRoutes from '@misakey/react/auth/routes';
import IdentitySchema from '@misakey/react/auth/store/schemas/Identity';

import isNil from '@misakey/core/helpers/isNil';
import { updateProfileConfig, getProfileConfig as getProfileConfigBuilder } from '@misakey/core/api/helpers/builder/identities';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import { useSnackbar } from 'notistack';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useFetchEffect from '@misakey/hooks/useFetch/effect';

import Formik from '@misakey/ui/Formik';
import FormikAutoSave from '@misakey/ui/Formik/AutoSave';
import { Form, Field } from 'formik';
import FieldBooleanControlSwitch from '@misakey/ui/Form/Field/BooleanControl/Switch';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import AvatarDetailed from '@misakey/ui/Avatar/Detailed';
import CardIdentityHeader from '@misakey/react/auth/components/Card/Identity/Header';
import CardList from '@misakey/ui/Card/List';
import CardActionArea from '@material-ui/core/CardActionArea';
import Card from '@material-ui/core/Card';
import ScreenAction from '@misakey/ui/Screen/Action';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';

// CONSTANTS
const EMAIL_FIELD = 'email';

const INITIAL_VALUES = {
  [EMAIL_FIELD]: false,
};

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
  labelBreak: {
    textAlign: 'center',
  },
  listItemControlRoot: {
    minHeight: '62px',
  },
  listItemControlLabel: {
    marginLeft: '-11px',
    textTransform: 'none',
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
  listItemIconControl: {
    flexDirection: 'column',
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
const IdentityPublic = forwardRef(({ t, identity, isFetching }, ref) => {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const handleHttpErrors = useHandleHttpErrors();

  const [initialValues, setInitialValues] = useState();

  const { id } = useParams();

  const {
    displayName,
    avatarUrl,
    identifierValue,
    identifierKind,
  } = useSafeDestr(identity);


  const listItemDisplayNameTo = useGeneratePathKeepingSearchAndHash(
    authRoutes.identities.displayName,
    { id },
  );

  const listItemAvatarTo = useGeneratePathKeepingSearchAndHash(
    authRoutes.identities.avatar._,
    { id },
  );

  const homePath = useGeneratePathKeepingSearchAndHash(authRoutes.identities._, { id });

  const navigationProps = useMemo(
    () => ({
      homePath,
    }),
    [homePath],
  );

  const isLoading = useMemo(
    () => isFetching || isNil(identity),
    [identity, isFetching],
  );

  const controlLabels = useMemo(
    () => ({
      true: t('common:public'),
      false: t('common:private'),
    }),
    [t],
  );

  const shouldFetch = useMemo(
    () => !isLoading,
    [isLoading],
  );

  const onSubmit = useCallback(
    async ({ [EMAIL_FIELD]: email }, { setSubmitting }) => updateProfileConfig(
      { identityId: id, email },
    )
      .then(() => {
        enqueueSnackbar(t('account:public.success'), { variant: 'success' });
        setInitialValues((prevInitialValues) => ({ ...prevInitialValues, email }));
      })
      .catch(handleHttpErrors)
      .finally(() => { setSubmitting(false); }),
    [handleHttpErrors, t, enqueueSnackbar, setInitialValues, id],
  );

  const getProfileConfig = useCallback(
    () => getProfileConfigBuilder({ identityId: id }),
    [id],
  );

  const onSuccess = useCallback(
    (config) => setInitialValues({ ...INITIAL_VALUES, ...config }),
    [setInitialValues],
  );

  const { isFetching: isFetchingConfig } = useFetchEffect(
    getProfileConfig,
    { shouldFetch },
    { onSuccess },
  );

  return (
    <ScreenAction
      title={t('account:public.title')}
      navigationProps={navigationProps}
      isLoading={isLoading || isFetchingConfig}
    >
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
              <Typography className={classes.labelBreak}>{t('fields:displayName.label')}</Typography>
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
        </CardList>
        <CardIdentityHeader>{t('account:sections.myIdentifiers.title')}</CardIdentityHeader>
        <Formik initialValues={initialValues} onSubmit={onSubmit} enableReinitialize>
          <Box component={Form} width="100%">
            <CardList>
              <ListItem
                divider
                classes={{
                  container: classes.listItemContainer,
                  root: classes.listItemControlRoot,
                }}
              >
                <ListItemIcon className={clsx(classes.listItemIcon, classes.listItemIconControl)}>
                  <Typography>{t(`fields:${identifierKind}.label`)}</Typography>
                  <Field
                    component={FieldBooleanControlSwitch}
                    name={EMAIL_FIELD}
                    color="primary"
                    labels={controlLabels}
                    classes={{ label: classes.listItemControlLabel }}
                  />
                </ListItemIcon>
                <ListItemText primary={identifierValue} primaryTypographyProps={{ nowrap: 'true' }} />
              </ListItem>
            </CardList>
            <FormikAutoSave
              mt={2}
              display="flex"
              justifyContent="center"
              debounceMs={1000}
              debounceLoader
            />
          </Box>
        </Formik>
      </Container>
    </ScreenAction>
  );
});

IdentityPublic.propTypes = {
  identity: PropTypes.shape(IdentitySchema.propTypes),
  isFetching: PropTypes.bool,
  // withTranslation
  t: PropTypes.func.isRequired,
};

IdentityPublic.defaultProps = {
  identity: null,
  isFetching: false,
};

export default withTranslation(['fields', 'account', 'common'], { withRef: true })(IdentityPublic);
