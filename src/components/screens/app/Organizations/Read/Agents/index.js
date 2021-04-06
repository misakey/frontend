import React, { useMemo, useCallback, useState, useEffect } from 'react';
import clsx from 'clsx';

import {
  TOOLBAR_MIN_HEIGHT,
  SMALL_AVATAR_SIZE,
  SMALL_AVATAR_SM_SIZE,
} from '@misakey/ui/constants/sizes';
import { ADMIN } from '@misakey/ui/constants/organizations/roles';
import { conflict } from '@misakey/core/api/constants/errorTypes';
import { agentsAddSchema } from 'constants/validationSchemas/organizations';
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';
import { selectors as orgSelectors } from 'store/reducers/identity/organizations/agents';

import { senderMatchesIdentifierValue, identifierValueProp } from 'helpers/sender';
import { addOrganizationAgent } from '@misakey/core/api/helpers/builder/organizations';
import promiseAllNoFailFast from '@misakey/core/helpers/promiseAllNoFailFast';
import { getCode } from '@misakey/core/helpers/apiError';
import path from '@misakey/core/helpers/path';
import prop from '@misakey/core/helpers/prop';
import pluck from '@misakey/core/helpers/pluck';
import isNil from '@misakey/core/helpers/isNil';
import isEmpty from '@misakey/core/helpers/isEmpty';
import partition from '@misakey/core/helpers/partition';
import compose from '@misakey/core/helpers/compose';
import toLower from '@misakey/core/helpers/toLower';

import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useOrgId from '@misakey/react/auth/hooks/useOrgId';
import { useOnAddAgents } from 'hooks/usePaginateOrgAgents/updates';

import ElevationScroll from '@misakey/ui/ElevationScroll';
import Formik from '@misakey/ui/Formik';
import { Form } from 'formik';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import AppbarAccount from 'components/smart/AppBar/Account';
import AppBarStatic from '@misakey/ui/AppBar/Static';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ButtonDrawerOrganization from 'components/smart/IconButton/Drawer/Organization';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Typography from '@misakey/ui/Typography';
import AutocompleteUsersField from '@misakey/ui/Autocomplete/Users/Field';
import ListItemUserMember from '@misakey/ui/ListItem/User/Member';
import ListItemAgentOption from 'components/smart/ListItem/Agent/Option';
import ListItemUserOptionSkeleton from '@misakey/ui/ListItem/User/Option/Skeleton';
import WindowedListOrgAgents from 'components/screens/app/Organizations/Read/Agents/List';
import ListItemAgent from 'components/smart/ListItem/Agent';
import Grow from '@material-ui/core/Grow';
import IconButtonAppBar from '@misakey/ui/IconButton/AppBar';
import Tooltip from '@material-ui/core/Tooltip';

import GroupIcon from '@material-ui/icons/Group';
import AddIcon from '@material-ui/icons/Add';

// CONSTANTS
const TOOLBAR_PROPS = {
  minHeight: `${TOOLBAR_MIN_HEIGHT}px !important`,
};
const SELF = 'SELF';
const AGENTS_FIELD_NAME = 'agents';
const {
  identifierValue: IDENTIFIER_VALUE_SELECTOR,
  identity: IDENTITY_SELECTOR,
} = authSelectors;
const { makeDenormalizeAgents } = orgSelectors;

const INITIAL_VALUES = {
  [AGENTS_FIELD_NAME]: [],
};

// HELPERS
const agentIdentifierValuePath = path(['identity', 'identifierValue']);
const identifierValuePropLowerCase = compose(
  toLower,
  identifierValueProp,
);
const agentProp = prop('agent');
const pluckIndex = pluck('index');
const pluckIdentity = pluck('identity');

// HOOKS
const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.default,
  },
  listItemIcon: {
    color: theme.palette.background.paper,
    minWidth: SMALL_AVATAR_SIZE + theme.spacing(0.5),
    [theme.breakpoints.down('sm')]: {
      minWidth: SMALL_AVATAR_SM_SIZE + theme.spacing(0.5),
    },
  },
  listItemText: {
    margin: 0,
  },
  listItemContainer: {
    [theme.breakpoints.up('md')]: {
      maxWidth: theme.breakpoints.values.md,
      left: '50% !important',
      transform: 'translateX(-50%)',
    },
  },
  buttonRotate: {
    transform: 'rotate(0deg)',
    transition: theme.transitions.create('transform', { duration: theme.transitions.duration.shortest }),
  },
  buttonRotated: {
    transform: 'rotate(180deg)',
  },
}));

// COMPONENTS
const OrganizationsReadAgents = () => {
  const [contentRef, setContentRef] = useState();
  const [showAddAgents, setShowAddAgents] = useState(false);
  const { t } = useTranslation(['common', 'organizations', 'fields']);
  const classes = useStyles();

  const handleHttpErrors = useHandleHttpErrors();

  const organizationId = useOrgId();

  const getAgentsSelector = useMemo(
    () => makeDenormalizeAgents(),
    [],
  );
  const agents = useSelector((state) => getAgentsSelector(state, organizationId));

  const agentsIdentifierValues = useMemo(
    () => (agents || []).map(agentIdentifierValuePath),
    [agents],
  );

  const meIdentifierValue = useSelector(IDENTIFIER_VALUE_SELECTOR);
  const meIdentity = useSelector(IDENTITY_SELECTOR);

  const members = useMemo(
    () => pluckIdentity(agents || []),
    [agents],
  );

  const onAddAgents = useOnAddAgents(organizationId);

  useUpdateDocHead(t('organizations:agents.title'));

  const onContentRef = useCallback(
    (ref) => {
      setContentRef(ref);
    },
    [setContentRef],
  );

  const onToggleAddAgents = useCallback(
    () => {
      setShowAddAgents((prev) => !prev);
    },
    [setShowAddAgents],
  );

  const renderOption = useCallback(
    ({ avatarUrl, identifierValue, ...rest }) => {
      const lowerCasedIdentifierValue = toLower(identifierValue);
      return (
        <ListItemUserMember
          component={ListItemAgentOption}
          skeleton={ListItemUserOptionSkeleton}
          disableGutters
          avatarUrl={avatarUrl}
          identifier={lowerCasedIdentifierValue}
          isMe={lowerCasedIdentifierValue === meIdentifierValue}
          isAdmin={lowerCasedIdentifierValue === meIdentifierValue}
          members={members}
          {...rest}
        />
      );
    },
    [members, meIdentifierValue],
  );

  const getOptionDisabled = useCallback(
    (option) => {
      const optionIdentifierValue = identifierValuePropLowerCase(option);
      return optionIdentifierValue.endsWith(',')
        || senderMatchesIdentifierValue(option, meIdentifierValue)
        || agentsIdentifierValues.includes(optionIdentifierValue);
    },
    [agentsIdentifierValues, meIdentifierValue],
  );

  const onSubmit = useCallback(
    async ({ [AGENTS_FIELD_NAME]: agentsToAdd }, { setFieldError, setFieldValue, resetForm }) => {
      const responses = await promiseAllNoFailFast(
        agentsToAdd
          .map(async ({ identifierValue }) => addOrganizationAgent(
            organizationId, identifierValue,
          )),
        (index) => (error) => ({ error, index, agent: agentsToAdd[index] }),
      );
      const [successes, errors] = partition(responses, ({ error }) => isNil(error));
      if (!isEmpty(successes)) {
        await onAddAgents(successes);
      }
      const [conflicts, unexpectedErrors] = partition(errors,
        ({ error }) => getCode(error) === conflict);
      if (!isEmpty(conflicts)) {
        setFieldValue(AGENTS_FIELD_NAME, conflicts.map(agentProp));
        const fieldErrors = [];
        const indexes = pluckIndex(conflicts);
        indexes.forEach((index) => { fieldErrors[index] = { identifierValue: conflict }; });
        setFieldError(AGENTS_FIELD_NAME, fieldErrors);
      } else {
        resetForm({ values: INITIAL_VALUES });
      }
      if (!isEmpty(unexpectedErrors)) {
        // @FIXME might produce too many snackbars
        unexpectedErrors.forEach(handleHttpErrors);
      }
    },
    [handleHttpErrors, onAddAgents, organizationId],
  );

  useEffect(
    () => {
      if (!isNil(agents) && isEmpty(agents)) {
        setShowAddAgents(true);
      }
    },
    [agents, setShowAddAgents],
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      width="100%"
      height="100%"
      className={classes.root}
    >
      <ElevationScroll target={contentRef}>
        <Box display="flex" flexDirection="column">
          <AppbarAccount
            toolbarProps={TOOLBAR_PROPS}
          />
          <AppBarStatic
            color="primary"
            toolbarProps={TOOLBAR_PROPS}
          >
            <ButtonDrawerOrganization color="background" />
            <List disablePadding>
              <ListItem disableGutters>
                <ListItemIcon className={classes.listItemIcon}>
                  <GroupIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={(
                    <Typography
                      variant="body2"
                      color="background"
                    >
                      {t('organizations:agents.title')}
                    </Typography>
                    )}
                  disableTypography
                  className={classes.listItemText}
                />
              </ListItem>
            </List>
            <BoxFlexFill />
            <Tooltip title={t('fields:organization.agents.label')}>
              <IconButtonAppBar
                className={clsx(classes.buttonRotate, { [classes.buttonRotated]: showAddAgents })}
                aria-label={t('fields:organization.agents.label')}
                onClick={onToggleAddAgents}
                edge="end"
                color="background"
              >
                <AddIcon />
              </IconButtonAppBar>
            </Tooltip>
          </AppBarStatic>
        </Box>
      </ElevationScroll>
      <Container maxWidth="md">
        {showAddAgents && (
          <Grow in={showAddAgents}>
            <Box>
              <Formik
                onSubmit={onSubmit}
                initialValues={INITIAL_VALUES}
                validationSchema={agentsAddSchema}
                validateOnChange
              >
                <Form>
                  <AutocompleteUsersField
                    name={AGENTS_FIELD_NAME}
                    getOptionDisabled={getOptionDisabled}
                    renderOption={renderOption}
                    noOptionsText={t('organizations:agents.empty')}
                    textFieldProps={{ autoFocus: true, margin: 'normal' }}
                    prefix="organization."
                    fullWidth
                    multiple
                  />
                </Form>
              </Formik>
            </Box>
          </Grow>
        )}
      </Container>
      <List
        component={WindowedListOrgAgents}
        ref={onContentRef}
        organizationId={organizationId}
        itemClasses={{ container: classes.listItemContainer, root: classes.listItemContainer }}
        itemProps={{ guttersTop: 72 }} // list item admin
        innerElementEnding={(
          <Typography variant="body2" color="textSecondary" align="center">
            {t('organizations:admins.count.text', { count: 1 })}
          </Typography>
        )}
      >
        <ListItemAgent
          isMe
          identity={meIdentity}
          id={SELF}
          role={ADMIN}
          classes={{ container: classes.listItemContainer, root: classes.listItemContainer }}
        />
      </List>
    </Box>
  );
};

export default OrganizationsReadAgents;
