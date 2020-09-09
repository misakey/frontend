import React, { useMemo, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { useSnackbar } from 'notistack';

import { withTranslation, useTranslation } from 'react-i18next';

import Box from '@material-ui/core/Box';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import MenuItem from '@material-ui/core/MenuItem';
import ListItem from '@material-ui/core/ListItem';
import Skeleton from '@material-ui/lab/Skeleton';
import ListItemText from '@material-ui/core/ListItemText';
import TextFieldStandard from '@misakey/ui/TextField/Standard';

import LockIcon from '@material-ui/icons/Lock';
import PublicIcon from '@material-ui/icons/Public';
import PeopleIcon from '@material-ui/icons/People';

import partition from '@misakey/helpers/partition';
import groupBy from '@misakey/helpers/groupBy';
import prop from '@misakey/helpers/prop';
import promiseAllNoFailFast from '@misakey/helpers/promiseAllNoFailFast';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import pluck from '@misakey/helpers/pluck';
import pipe from '@misakey/helpers/pipe';
import differenceWith from '@misakey/helpers/differenceWith';
import filter from '@misakey/helpers/filter';
import { createBoxEventBuilder } from '@misakey/helpers/builder/boxes';

import { accessWhitelistValidationSchema } from 'constants/validationSchemas/boxes';
import BoxControls from '@misakey/ui/Box/Controls';

import { updateAccessesEvents } from 'store/reducers/box';
import BoxEventsSchema from 'store/schemas/Boxes/Events';
import AccessWhitelistForm from './Whitelist';

// CONSTANTS
const ACCESSES_FIELD_NAME = 'accessLevel';
const WHITELIST_FIELD_NAME = {
  identifier: 'accessWhitelistIdentifier',
  emailDomain: 'accessWhitelistEmailDomain',
};

const VALUES = {
  PRIVATE: 'private',
  PUBLIC: 'public',
  LIMITED: 'limited',
};

const RESTRICTION_TYPES = {
  INVITATION_LINK: 'invitation_link',
  IDENTIFIER: 'identifier',
  EMAIL_DOMAIN: 'email_domain',
};

const ICONS = {
  [VALUES.PRIVATE]: <LockIcon />,
  [VALUES.PUBLIC]: <PublicIcon />,
  [VALUES.LIMITED]: <PeopleIcon />,
};

const ACCESS_EVENT_TYPE = {
  RM: 'access.rm',
  ADD: 'access.add',
};

// HELPERS
const getValues = pluck('value');
const getRestrictions = (accesses) => pluck('content', accesses);

const removeFromList = (element) => (current) => current.filter((value) => element !== value);
const addToList = (element) => (current) => [...new Set(current.concat([element]))];

const errorPropNil = pipe(
  prop('error'),
  (e) => isNil(e),
);

// COMPONENTS
const AccessLevel = ({ value }) => {
  const { t } = useTranslation('boxes');
  return (
    <>
      <ListItemIcon>
        {ICONS[value]}
      </ListItemIcon>
      <ListItemText
        primary={t(`boxes:read.share.level.${value}.title`)}
        secondary={t(`boxes:read.share.level.${value}.description`)}
        primaryTypographyProps={{ noWrap: true, display: 'block' }}
        secondaryTypographyProps={{ noWrap: true, display: 'block' }}
      />
    </>
  );
};

AccessLevel.propTypes = {
  value: PropTypes.oneOf(Object.values(VALUES)).isRequired,
};

export const AccessLevelFormSkeleton = () => (
  <ListItem>
    <ListItemIcon>
      <Skeleton variant="circle" width={30} height={30} />
    </ListItemIcon>
    <ListItemText
      primary={<Skeleton width={100} />}
      secondary={<Skeleton width={200} />}
    />
  </ListItem>
);


function ShareBoxForm({ accesses, boxId, invitationURL }) {
  const { t } = useTranslation('boxes');
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const [initialAccesses, setInitialAccesses] = useState([]);
  const [shouldRefresh, setShouldRefresh] = useState([]);

  /* COMPUTE INITIAL VALUES FOR FORM */
  useEffect(
    () => {
      if (shouldRefresh) {
        setShouldRefresh(false);
        setInitialAccesses(getRestrictions(accesses));
      }
    },
    // Do not recompte volontary each time accesses changes to avoid form to be reset
    // on refresh boxes while user is parametrizing
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [shouldRefresh],
  );

  const getByRestrictionType = useCallback(
    (type) => getValues(filter(initialAccesses, ['restrictionType', type])),
    [initialAccesses],
  );

  const initialWhitelistedEmailDomains = useMemo(
    () => getByRestrictionType(RESTRICTION_TYPES.EMAIL_DOMAIN),
    [getByRestrictionType],
  );

  const initialWhitelistedIdentifiers = useMemo(
    () => getByRestrictionType(RESTRICTION_TYPES.IDENTIFIER),
    [getByRestrictionType],
  );

  const initialInvitationLinkAccessEvent = useMemo(
    () => getByRestrictionType(RESTRICTION_TYPES.INVITATION_LINK),
    [getByRestrictionType],
  );

  const initialIsPublic = useMemo(
    () => !isEmpty(initialInvitationLinkAccessEvent),
    [initialInvitationLinkAccessEvent],
  );

  const initialHasWhitelistRules = useMemo(
    () => initialWhitelistedEmailDomains.length > 0 || initialWhitelistedIdentifiers.length > 0,
    [initialWhitelistedEmailDomains.length, initialWhitelistedIdentifiers.length],
  );

  /* METHODS TO FILL THE FORM */
  const [
    whitelistedEmailDomains,
    setWhitelistedEmailDomains,
  ] = useState([]);

  useEffect(
    () => { setWhitelistedEmailDomains(initialWhitelistedEmailDomains); },
    [initialWhitelistedEmailDomains],
  );

  const [
    whitelistedIdentifiers,
    setWhitelistedIdentifiers,
  ] = useState([]);

  useEffect(
    () => { setWhitelistedIdentifiers(initialWhitelistedIdentifiers); },
    [initialWhitelistedIdentifiers],
  );

  const [isPublic, setIsPublic] = useState(false);

  useEffect(
    () => { setIsPublic(initialIsPublic); },
    [initialIsPublic],
  );

  const hasWhitelistRules = useMemo(
    () => whitelistedIdentifiers.length > 0 || whitelistedEmailDomains.length > 0,
    [whitelistedEmailDomains.length, whitelistedIdentifiers.length],
  );

  const [showWhitelistForm, setShowWhitelistForm] = useState(false);

  useEffect(
    () => { setShowWhitelistForm(initialHasWhitelistRules); },
    [initialHasWhitelistRules],
  );

  const accessLevelValue = useMemo(
    () => {
      if (hasWhitelistRules) { return VALUES.LIMITED; }
      if (isPublic) { return VALUES.PUBLIC; }
      return VALUES.PRIVATE;
    },
    [hasWhitelistRules, isPublic],
  );

  const onChangeAccessLevel = useCallback(
    (event) => {
      switch (event.target.value) {
        case VALUES.PRIVATE:
          setIsPublic(false);
          setWhitelistedEmailDomains([]);
          setWhitelistedIdentifiers([]);
          break;
        case VALUES.PUBLIC: {
          setIsPublic(true);
          setWhitelistedEmailDomains([]);
          setWhitelistedIdentifiers([]);
          break;
        }
        case VALUES.LIMITED:
          setShowWhitelistForm(true);
          break;
        default:
      }
    },
    [],
  );

  const onAddWhitelistRule = useCallback(
    ({
      [WHITELIST_FIELD_NAME.emailDomain]: newDomain,
      [WHITELIST_FIELD_NAME.identifier]: newIdentifier,
    }, { resetForm }) => {
      if (!isNil(newDomain)) {
        setWhitelistedEmailDomains(addToList(newDomain));
      }
      if (!isNil(newIdentifier)) {
        setWhitelistedIdentifiers(addToList(newIdentifier));
      }
      setIsPublic(false);
      resetForm();
    },
    [],
  );

  const onRemoveWhitelistIdentifierRule = useCallback(
    (value) => () => {
      setWhitelistedIdentifiers(removeFromList(value));
    },
    [],
  );

  const onRemoveWhitelistEmailDomainRule = useCallback(
    (value) => () => {
      setWhitelistedEmailDomains(removeFromList(value));
    },
    [],
  );

  /* METHODS TO COMPUTE EVENTS TO GENERATE FROM FORM */
  const generateInvitationLinkEvent = useCallback(
    () => {
      const { hash } = new URL(invitationURL);
      return {
        type: ACCESS_EVENT_TYPE.ADD,
        content: {
          restrictionType: RESTRICTION_TYPES.INVITATION_LINK,
          value: hash,
        },
      };
    },
    [invitationURL],
  );

  const onValidate = useCallback(
    async () => {
      // COMPUTATION OF ACCESS.RM EVENTS
      const needToRemoveInvitationEvent = !isEmpty(initialInvitationLinkAccessEvent)
        && !isPublic && !hasWhitelistRules;

      const identifiersToRemove = initialWhitelistedIdentifiers.filter(
        (element) => !whitelistedIdentifiers.includes(element),
      );
      const domainsToRemove = initialWhitelistedEmailDomains.filter(
        (element) => !whitelistedEmailDomains.includes(element),
      );
      const eventIdsToRemove = accesses.reduce((eventIds, { id: eventId, content }) => {
        const { restrictionType, value } = content;
        if (restrictionType === RESTRICTION_TYPES.IDENTIFIER
          && identifiersToRemove.includes(value)) {
          return [...eventIds, eventId];
        }
        if (restrictionType === RESTRICTION_TYPES.EMAIL_DOMAIN && domainsToRemove.includes(value)) {
          return [...eventIds, eventId];
        }
        if (restrictionType === RESTRICTION_TYPES.INVITATION_LINK && needToRemoveInvitationEvent) {
          return [...eventIds, eventId];
        }
        return eventIds;
      }, []);

      const accessRmEvents = eventIdsToRemove.map((eventId) => ({
        type: ACCESS_EVENT_TYPE.RM,
        referrerId: eventId,
      }));

      // COMPUTATION OF ACCESS.ADD EVENTS
      const needToAddInvitationEvent = (isPublic || hasWhitelistRules)
        && isEmpty(initialInvitationLinkAccessEvent);

      const identifiersToAdd = whitelistedIdentifiers.filter(
        (element) => !initialWhitelistedIdentifiers.includes(element),
      );
      const domainsToAdd = whitelistedEmailDomains.filter(
        (element) => !initialWhitelistedEmailDomains.includes(element),
      );

      const accessAddDomainsEvents = domainsToAdd.map((value) => ({
        type: ACCESS_EVENT_TYPE.ADD,
        content: {
          restrictionType: RESTRICTION_TYPES.EMAIL_DOMAIN,
          value,
        },
      }));

      const accessAddIdentifiersEvents = identifiersToAdd.map((value) => ({
        type: ACCESS_EVENT_TYPE.ADD,
        content: {
          restrictionType: RESTRICTION_TYPES.IDENTIFIER,
          value,
        },
      }));

      const invitationLinkEvents = needToAddInvitationEvent ? [generateInvitationLinkEvent()] : [];

      // ARRAYS OF EVENTS TO POST
      const newEvents = [
        ...accessAddDomainsEvents,
        ...accessAddIdentifiersEvents,
        ...accessRmEvents,
        ...invitationLinkEvents,
      ];

      if (newEvents.length === 0) {
        enqueueSnackbar(t('boxes:read.share.update.noChanges'), { variant: 'info' });
        return;
      }

      // Will change in next MR to use a bulk rm access endpoint (UN: members.kick)
      const newEventsList = await promiseAllNoFailFast(
        newEvents.map(async (event) => {
          try {
            const response = await createBoxEventBuilder(boxId, event);
            return { ...response, success: true };
          } catch (e) {
            return { ...event, error: true };
          }
        }),
      );

      const [successes, errors] = partition(newEventsList, errorPropNil);

      if (!isEmpty(successes)) {
        const {
          [ACCESS_EVENT_TYPE.RM]: eventsToRemove = [],
          [ACCESS_EVENT_TYPE.ADD]: eventsToAdd = [],
        } = groupBy(successes, 'type');
        const cleanedAccesses = differenceWith(
          accesses,
          eventsToRemove,
          (initialEvent, rmEvent) => initialEvent.id === rmEvent.referrerId,
        );
        const newAccesses = cleanedAccesses.concat(eventsToAdd);

        Promise.resolve(dispatch(updateAccessesEvents(boxId, newAccesses)))
          .then(() => { setShouldRefresh(true); });
      }

      if (isEmpty(errors)) {
        enqueueSnackbar(t('boxes:read.share.update.success'), { variant: 'success' });
      } else {
        enqueueSnackbar(t('boxes:read.share.update.error'), { variant: 'warning' });
      }
    },
    [dispatch, enqueueSnackbar, generateInvitationLinkEvent, t,
      boxId, hasWhitelistRules, isPublic,
      accesses, initialInvitationLinkAccessEvent,
      initialWhitelistedEmailDomains, initialWhitelistedIdentifiers,
      whitelistedEmailDomains, whitelistedIdentifiers],
  );

  return (
    <>
      <TextFieldStandard
        prefix="boxes."
        as="select"
        name={ACCESSES_FIELD_NAME}
        value={accessLevelValue}
        onChange={onChangeAccessLevel}
        margin="dense"
        select
        SelectProps={{
          renderValue: (value) => (
            <ListItem value={value}><AccessLevel value={value} /></ListItem>
          ),
        }}
      >
        <MenuItem value={VALUES.PRIVATE}>
          <AccessLevel value={VALUES.PRIVATE} />
        </MenuItem>
        <MenuItem value={VALUES.PUBLIC}>
          <AccessLevel value={VALUES.PUBLIC} />
        </MenuItem>
        <MenuItem value={VALUES.LIMITED}>
          <AccessLevel value={VALUES.LIMITED} />
        </MenuItem>
      </TextFieldStandard>
      {showWhitelistForm && (
        <Box my={1}>
          <AccessWhitelistForm
            fieldName={WHITELIST_FIELD_NAME.identifier}
            values={whitelistedIdentifiers}
            validationSchema={accessWhitelistValidationSchema.identifier}
            onSubmit={onAddWhitelistRule}
            onRemove={onRemoveWhitelistIdentifierRule}
          />
          <AccessWhitelistForm
            fieldName={WHITELIST_FIELD_NAME.emailDomain}
            values={whitelistedEmailDomains}
            validationSchema={accessWhitelistValidationSchema.emailDomain}
            onSubmit={onAddWhitelistRule}
            onRemove={onRemoveWhitelistEmailDomainRule}
            startAdornment="@"
          />
        </Box>
      )}
      <BoxControls
        mt={1}
        primary={{
          text: t('common:validate'),
          onClick: onValidate,
        }}
      />
    </>
  );
}

ShareBoxForm.propTypes = {
  accesses: PropTypes.arrayOf(PropTypes.shape(BoxEventsSchema.propTypes)).isRequired,
  boxId: PropTypes.string.isRequired,
  invitationURL: PropTypes.object.isRequired,
};

export default withTranslation(['boxes', 'common'])(ShareBoxForm);
