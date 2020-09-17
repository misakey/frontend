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

import groupBy from '@misakey/helpers/groupBy';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import pluck from '@misakey/helpers/pluck';
import differenceWith from '@misakey/helpers/differenceWith';
import filter from '@misakey/helpers/filter';
import { createBulkBoxEventBuilder } from '@misakey/helpers/builder/boxes';

import { accessWhitelistValidationSchema } from 'constants/validationSchemas/boxes';
import BoxControls from '@misakey/ui/Box/Controls';

import { updateAccessesEvents } from 'store/reducers/box';
import BoxEventsSchema from 'store/schemas/Boxes/Events';
import withStyles from '@material-ui/core/styles/withStyles';
import { MEMBER_KICK } from 'constants/app/boxes/events';
import { usePaginateEventsContext } from 'components/smart/Context/PaginateEventsByBox';
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
  ALL: 'accesses',
};

const INITIAL_WHITELIST_VALUES = { emailDomains: [], identifiers: [] };

// HELPERS
const getValues = pluck('value');
const getRestrictions = (accesses) => pluck('content', accesses);

const removeFromList = (
  current,
  key,
  element,
) => ({
  ...current,
  [key]: current[key].filter((value) => element !== value),
});

const addToList = (
  key,
  element,
) => (current) => ({
  ...current,
  [key]: [...new Set(current[key].concat([element]))],
});

// COMPONENTS
const AccessLevel = withStyles(() => ({
  wrapText: {
    whiteSpace: 'normal',
  },
}))(({ value, classes }) => {
  const { t } = useTranslation('boxes');
  return (
    <>
      <ListItemIcon>
        {ICONS[value]}
      </ListItemIcon>
      <ListItemText
        className={classes.wrapText}
        primary={t(`boxes:read.share.level.${value}.title`)}
        secondary={t(`boxes:read.share.level.${value}.description`)}
        primaryTypographyProps={{ display: 'block' }}
        secondaryTypographyProps={{ display: 'block' }}
      />
    </>
  );
});

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

  const { addItems } = usePaginateEventsContext();

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
    whitelist,
    setWhitelist,
  ] = useState({ emailDomains: [], identifiers: [] });

  useEffect(
    () => {
      setWhitelist((current) => ({ ...current, emailDomains: initialWhitelistedEmailDomains }));
    },
    [initialWhitelistedEmailDomains],
  );

  useEffect(
    () => {
      setWhitelist((current) => ({ ...current, identifiers: initialWhitelistedIdentifiers }));
    },
    [initialWhitelistedIdentifiers],
  );

  const [isPublic, setIsPublic] = useState(false);

  useEffect(
    () => { setIsPublic(initialIsPublic); },
    [initialIsPublic],
  );

  const hasWhitelistRules = useMemo(
    () => whitelist.identifiers.length > 0 || whitelist.emailDomains.length > 0,
    [whitelist],
  );

  const [showWhitelistForm, setShowWhitelistForm] = useState(false);

  useEffect(
    () => { setShowWhitelistForm(initialHasWhitelistRules); },
    [initialHasWhitelistRules],
  );

  const accessLevelValue = useMemo(
    () => {
      if (hasWhitelistRules || showWhitelistForm) { return VALUES.LIMITED; }
      if (isPublic) { return VALUES.PUBLIC; }
      return VALUES.PRIVATE;
    },
    [hasWhitelistRules, isPublic, showWhitelistForm],
  );

  const onChangeAccessLevel = useCallback(
    (event) => {
      switch (event.target.value) {
        case VALUES.PRIVATE:
          setIsPublic(false);
          setWhitelist(INITIAL_WHITELIST_VALUES);
          setShowWhitelistForm(false);
          break;
        case VALUES.PUBLIC: {
          setIsPublic(true);
          setWhitelist(INITIAL_WHITELIST_VALUES);
          setShowWhitelistForm(false);
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

  const onRemoveFromWhitelist = useCallback((key, value) => {
    setWhitelist((current) => {
      const newValues = removeFromList(current, key, value);
      if (isEmpty(newValues.emailDomains) && isEmpty(newValues.identifiers)) {
        setShowWhitelistForm(false);
      }
      return newValues;
    });
  }, []);

  const onAddWhitelistRule = useCallback(
    ({
      [WHITELIST_FIELD_NAME.emailDomain]: newDomain,
      [WHITELIST_FIELD_NAME.identifier]: newIdentifier,
    }, { resetForm }) => {
      if (!isNil(newDomain)) {
        setWhitelist(addToList('emailDomains', newDomain));
      }
      if (!isNil(newIdentifier)) {
        setWhitelist(addToList('identifiers', newIdentifier));
      }
      setIsPublic(false);
      resetForm();
    },
    [],
  );

  const onRemoveWhitelistIdentifierRule = useCallback(
    (value) => () => {
      onRemoveFromWhitelist('identifiers', value);
    },
    [onRemoveFromWhitelist],
  );

  const onRemoveWhitelistEmailDomainRule = useCallback(
    (value) => () => {
      onRemoveFromWhitelist('emailDomains', value);
    },
    [onRemoveFromWhitelist],
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
        (element) => !whitelist.identifiers.includes(element),
      );
      const domainsToRemove = initialWhitelistedEmailDomains.filter(
        (element) => !whitelist.emailDomains.includes(element),
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

      const identifiersToAdd = whitelist.identifiers.filter(
        (element) => !initialWhitelistedIdentifiers.includes(element),
      );
      const domainsToAdd = whitelist.emailDomains.filter(
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
        ...accessRmEvents,
        ...accessAddDomainsEvents,
        ...accessAddIdentifiersEvents,
        ...invitationLinkEvents,
      ];

      if (isEmpty(newEvents)) {
        enqueueSnackbar(t('boxes:read.share.update.noChanges'), { variant: 'info' });
        return;
      }

      try {
        const bulkEventsPayload = { batchType: ACCESS_EVENT_TYPE.ALL, events: newEvents };
        const response = await createBulkBoxEventBuilder(boxId, bulkEventsPayload);
        const {
          [ACCESS_EVENT_TYPE.RM]: eventsToRemove = [],
          [MEMBER_KICK]: newKickEvents = [],
          [ACCESS_EVENT_TYPE.ADD]: eventsToAdd = [],
        } = groupBy(response, 'type');
        if (!isEmpty(newKickEvents)) {
          addItems(newKickEvents);
        }
        const cleanedAccesses = differenceWith(
          accesses,
          eventsToRemove,
          (initialEvent, rmEvent) => initialEvent.id === rmEvent.referrerId,
        );
        const newAccesses = cleanedAccesses.concat(eventsToAdd);
        enqueueSnackbar(t('boxes:read.share.update.success'), { variant: 'success' });
        Promise.resolve(dispatch(updateAccessesEvents(boxId, newAccesses)))
          .then(() => { setShouldRefresh(true); });
      } catch (err) {
        enqueueSnackbar(t('boxes:read.share.update.error'), { variant: 'warning' });
      }
    },
    [dispatch, enqueueSnackbar, generateInvitationLinkEvent, addItems, t,
      boxId, hasWhitelistRules, isPublic,
      accesses, initialInvitationLinkAccessEvent,
      initialWhitelistedEmailDomains, initialWhitelistedIdentifiers,
      whitelist],
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
            values={whitelist.identifiers}
            validationSchema={accessWhitelistValidationSchema.identifier}
            onSubmit={onAddWhitelistRule}
            onRemove={onRemoveWhitelistIdentifierRule}
          />
          <AccessWhitelistForm
            fieldName={WHITELIST_FIELD_NAME.emailDomain}
            values={whitelist.emailDomains}
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
