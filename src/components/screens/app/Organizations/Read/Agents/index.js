import React, { useMemo, useCallback, useState } from 'react';

import { ADMIN } from '@misakey/ui/constants/organizations/roles';
import { conflict } from '@misakey/ui/constants/errorTypes';
import { agentsAddSchema } from 'constants/validationSchemas/organizations';
import { selectors as authSelectors } from '@misakey/react-auth/store/reducers/auth';
import { selectors as orgSelectors } from 'store/reducers/identity/organizations/agents';

import { senderMatchesIdentifierValue, identifierValueProp } from 'helpers/sender';
import { addOrganizationAgent } from '@misakey/helpers/builder/organizations';
import promiseAllNoFailFast from '@misakey/helpers/promiseAllNoFailFast';
import { getCode } from '@misakey/helpers/apiError';
import path from '@misakey/helpers/path';
import prop from '@misakey/helpers/prop';
import pluck from '@misakey/helpers/pluck';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import partition from '@misakey/helpers/partition';
import compose from '@misakey/helpers/compose';
import toLower from '@misakey/helpers/toLower';

import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import useOrgId from '@misakey/react-auth/hooks/useOrgId';
import { useOnAddAgents } from 'hooks/usePaginateOrgAgents/updates';

import ElevationScroll from '@misakey/ui/ElevationScroll';
import Formik from '@misakey/ui/Formik';
import { Form } from 'formik';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import AppBarStatic from '@misakey/ui/AppBar/Static';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ButtonDrawerOrganization from 'components/smart/IconButton/Drawer/Organization';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import AutocompleteUsersField from '@misakey/ui/Autocomplete/Users/Field';
import ListItemUserMember from '@misakey/ui/ListItem/User/Member';
import ListItemAgentOption from 'components/smart/ListItem/Agent/Option';
import ListItemUserOptionSkeleton from '@misakey/ui/ListItem/User/Option/Skeleton';
import WindowedListOrgAgents from 'components/screens/app/Organizations/Read/Agents/List';
import ListBordered from '@misakey/ui/List/Bordered';
import ListItemOrganizationCurrent from 'components/smart/ListItem/Organization/Current';
import ListItemAgent from 'components/smart/ListItem/Agent';

import GroupIcon from '@material-ui/icons/Group';

// CONSTANTS
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

// HOOKS
const useStyles = makeStyles((theme) => ({
  avatar: {
    marginRight: theme.spacing(1),
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
}));

// COMPONENTS
const OrganizationsReadAgents = () => {
  const [contentRef, setContentRef] = useState();
  const { t } = useTranslation(['common', 'organizations']);
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

  const onAddAgents = useOnAddAgents(organizationId);

  useUpdateDocHead(t('organizations:agents.title'));

  const onContentRef = useCallback(
    (ref) => {
      setContentRef(ref);
    },
    [setContentRef],
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
          members={agents}
          {...rest}
        />
      );
    },
    [agents, meIdentifierValue],
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

  return (
    <Box
      display="flex"
      flexDirection="column"
      width="100%"
      height="100%"
    >
      <ElevationScroll target={contentRef}>
        <AppBarStatic>
          <ButtonDrawerOrganization color="default" />
          <BoxFlexFill />
          <List disablePadding>
            <ListItem>
              <ListItemAvatar>
                <Avatar className={classes.avatar}><GroupIcon fontSize="small" /></Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={t('organizations:agents.title')}
                primaryTypographyProps={{ variant: 'h6', color: 'textPrimary' }}
                className={classes.listItemText}
              />
            </ListItem>
          </List>
          <BoxFlexFill />
          <ListBordered
            dense
            disablePadding
          >
            <ListItemOrganizationCurrent />
          </ListBordered>
        </AppBarStatic>
      </ElevationScroll>
      <Container maxWidth="md">
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
          role={ADMIN}
          classes={{ container: classes.listItemContainer, root: classes.listItemContainer }}
        />
      </List>
    </Box>
  );
};

export default OrganizationsReadAgents;
