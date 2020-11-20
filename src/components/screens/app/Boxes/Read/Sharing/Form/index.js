import React, { useMemo, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withTranslation, useTranslation } from 'react-i18next';
import BoxEventsSchema from 'store/schemas/Boxes/Events';
import SenderSchema from 'store/schemas/Boxes/Sender';

import { ACCESS_RM, ACCESS_ADD, ACCESS_BULK } from 'constants/app/boxes/events';
import { RESTRICTION_TYPES } from 'constants/app/boxes/accesses';
import { updateAccessesEvents } from 'store/reducers/box';
import { makeAccessValidationSchema } from 'constants/validationSchemas/boxes';
import { PRIVATE, PUBLIC, LIMITED } from '@misakey/ui/constants/accessLevels';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import { getUpdatedAccesses } from 'helpers/accesses';
import isEmpty from '@misakey/helpers/isEmpty';
import pluck from '@misakey/helpers/pluck';
import sentryLogError from '@misakey/helpers/log/sentry';
import filter from '@misakey/helpers/filter';
import { createBulkBoxEventBuilder } from '@misakey/helpers/builder/boxes';
import { identifierValuePath, senderMatchesIdentifierValue } from 'helpers/sender';

import { useSelector, useDispatch } from 'react-redux';
import { tryAddingAutoInvite } from '@misakey/crypto/box/autoInvitation';
import { useSnackbar } from 'notistack';
import useFetchEffect from '@misakey/hooks/useFetch/effect';

import Formik from '@misakey/ui/Formik';
import Field from '@misakey/ui/Form/Field';
import { Form } from 'formik';
import MenuItem from '@material-ui/core/MenuItem';
import Box from '@material-ui/core/Box';
import ListItemAccessLevel from 'components/dumb/ListItem/AccessLevel';
import SelectItemAccessLevel from 'components/dumb/SelectItem/AccessLevel';
import TextField from '@misakey/ui/Form/Field/TextFieldWithErrors';
import FormikAutoSave from '@misakey/ui/Formik/AutoSave';
import SharingFormWhitelist from 'components/screens/app/Boxes/Read/Sharing/Form/Whitelist';

// CONSTANTS
const { identifierValue: IDENTIFIER_VALUE_SELECTOR } = authSelectors;
const ACCESSES_FIELD_NAME = 'accessLevel';
const WHITELIST_FIELD_NAME = 'accessWhitelist';

const WHITELIST_INITIAL_VALUE = null;

const ACCESS_EVENT_TYPE = {
  RM: ACCESS_RM,
  ADD: ACCESS_ADD,
  ALL: ACCESS_BULK,
};

// HELPERS
const getValues = pluck('value');
const pluckContent = pluck('content');

const membersToWhitelistEvents = (members) => (members || []).map((member) => ({
  type: ACCESS_EVENT_TYPE.ADD,
  content: {
    restrictionType: RESTRICTION_TYPES.IDENTIFIER,
    value: identifierValuePath(member),
  },
}));

// COMPONENTS
function ShareBoxForm({
  accesses,
  boxId,
  invitationURL,
  children,
  isCurrentUserOwner,
  membersNotInWhitelist,
  isRemoving,
  boxKeyShare, boxSecretKey,
}) {
  const { t } = useTranslation('boxes');
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();

  const meIdentifierValue = useSelector(IDENTIFIER_VALUE_SELECTOR);

  const accessesRef = useRef(accesses);

  const restrictions = useMemo(
    () => pluckContent(accesses || []),
    [accesses],
  );

  const getByRestrictionType = useCallback(
    (type) => getValues(filter(restrictions, ['restrictionType', type])),
    [restrictions],
  );

  const whitelistedEmailDomains = useMemo(
    () => getByRestrictionType(RESTRICTION_TYPES.EMAIL_DOMAIN),
    [getByRestrictionType],
  );

  const whitelistedIdentifiers = useMemo(
    () => getByRestrictionType(RESTRICTION_TYPES.IDENTIFIER),
    [getByRestrictionType],
  );

  const whitelistedValues = useMemo(
    () => whitelistedEmailDomains.concat(whitelistedIdentifiers),
    [whitelistedEmailDomains, whitelistedIdentifiers],
  );

  const invitationLinkAccessEvent = useMemo(
    () => getByRestrictionType(RESTRICTION_TYPES.INVITATION_LINK),
    [getByRestrictionType],
  );

  const isPublic = useMemo(
    () => !isEmpty(invitationLinkAccessEvent),
    [invitationLinkAccessEvent],
  );

  const hasWhitelistRules = useMemo(
    () => whitelistedValues.length > 0,
    [whitelistedValues],
  );

  const accessLevelValue = useMemo(
    () => {
      if (hasWhitelistRules) { return LIMITED; }
      if (isPublic) { return PUBLIC; }
      return PRIVATE;
    },
    [hasWhitelistRules, isPublic],
  );

  const initialValues = useMemo(
    () => ({
      [ACCESSES_FIELD_NAME]: accessLevelValue,
      [WHITELIST_FIELD_NAME]: WHITELIST_INITIAL_VALUE,
    }),
    [accessLevelValue],
  );

  const isEmptyMembersNotInWhitelist = useMemo(
    () => isEmpty(membersNotInWhitelist),
    [membersNotInWhitelist],
  );

  const accessValidationSchema = useMemo(
    () => makeAccessValidationSchema({ isEmptyMembersNotInWhitelist }),
    [isEmptyMembersNotInWhitelist],
  );

  const getOptionDisabled = useCallback(
    (option) => senderMatchesIdentifierValue(option, meIdentifierValue)
    || whitelistedValues.includes(identifierValuePath(option)),
    [meIdentifierValue, whitelistedValues],
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

  const getNextAccesses = useCallback(
    (newAccesses) => getUpdatedAccesses(accessesRef.current, newAccesses),
    [accessesRef],
  );

  const bulkUpdate = useCallback(
    async (newEvents) => {
      const bulkEventsPayload = { batchType: ACCESS_EVENT_TYPE.ALL, events: newEvents };
      const response = await createBulkBoxEventBuilder(boxId, bulkEventsPayload);
      const newAccesses = getNextAccesses(response);
      await Promise.resolve(dispatch(updateAccessesEvents(boxId, newAccesses)));
    },
    [boxId, getNextAccesses, dispatch],
  );

  const onBulkError = useCallback(
    () => enqueueSnackbar(t('boxes:read.share.update.error'), { variant: 'warning' }),
    [enqueueSnackbar, t],
  );

  const onSubmit = useCallback(
    async (
      { [ACCESSES_FIELD_NAME]: nextAccessLevel, [WHITELIST_FIELD_NAME]: nextWhitelist },
      { resetForm },
    ) => {
      let newEvents = [];

      switch (nextAccessLevel) {
        case PRIVATE: {
          const accessRmEvents = accesses.map(({ id: referrerId }) => ({
            type: ACCESS_EVENT_TYPE.RM,
            referrerId,
          }));
          newEvents = accessRmEvents;
          break;
        }
        case PUBLIC: {
          const accessRmEvents = accesses.reduce((aggr, { id: referrerId, content }) => {
            const { restrictionType } = content;
            if (restrictionType !== RESTRICTION_TYPES.INVITATION_LINK) {
              return [...aggr, {
                type: ACCESS_EVENT_TYPE.RM,
                referrerId,
              }];
            }
            return aggr;
          }, []);
          const needToAddInvitationEvent = (!isPublic || hasWhitelistRules)
            && isEmpty(invitationLinkAccessEvent);
          const invitationLinkEvents = needToAddInvitationEvent
            ? [generateInvitationLinkEvent()]
            : [];
          newEvents = [...accessRmEvents, ...invitationLinkEvents];
          break;
        }
        case LIMITED: {
          const needToAddInvitationEvent = (!isPublic || hasWhitelistRules)
            && isEmpty(invitationLinkAccessEvent);
          const invitationLinkEvents = needToAddInvitationEvent
            ? [generateInvitationLinkEvent()]
            : [];
          const value = identifierValuePath(nextWhitelist);
          // @FIXME safety check, but it should never happen
          // getOptionDisabled + validationSchema already handle the case
          const whitelistEvents = isEmpty(nextWhitelist) || whitelistedValues.includes(value)
            ? []
            : [await tryAddingAutoInvite({
              event: {
                type: ACCESS_EVENT_TYPE.ADD,
                content: {
                  restrictionType: nextWhitelist.type,
                  value,
                },
              },
              boxKeyShare,
              boxSecretKey,
            })];
          const identifiersToWhitelistEvents = isPublic && !isEmptyMembersNotInWhitelist
            ? membersToWhitelistEvents(membersNotInWhitelist)
            : [];
          newEvents = [
            ...identifiersToWhitelistEvents,
            ...whitelistEvents,
            ...invitationLinkEvents,
          ];
          break;
        }
        default:
      }
      if (isEmpty(newEvents)) {
        return enqueueSnackbar(t('boxes:read.share.update.noChanges'), { variant: 'info' });
      }
      try {
        await bulkUpdate(newEvents);
        enqueueSnackbar(t('boxes:read.share.update.success'), { variant: 'success' });
        return resetForm({ values: {
          [WHITELIST_FIELD_NAME]: initialValues[WHITELIST_FIELD_NAME],
          [ACCESSES_FIELD_NAME]: nextAccessLevel,
        } });
      } catch (err) {
        sentryLogError(err);
        return onBulkError();
      }
    },
    [
      enqueueSnackbar, generateInvitationLinkEvent, t,
      boxKeyShare, boxSecretKey,
      bulkUpdate, onBulkError,
      hasWhitelistRules, isPublic,
      initialValues,
      accesses, invitationLinkAccessEvent, whitelistedValues,
      isEmptyMembersNotInWhitelist, membersNotInWhitelist,
    ],
  );

  // @FIXME frontend dirty trick until redesigned
  const shouldFetch = useMemo(
    () => accessLevelValue === LIMITED && !isEmptyMembersNotInWhitelist && !isRemoving,
    [accessLevelValue, isEmptyMembersNotInWhitelist, isRemoving],
  );

  // add to whitelist members who joined when limited
  const bulkUpdateMembers = useCallback(
    () => {
      const identifiersToWhitelistEvents = membersToWhitelistEvents(membersNotInWhitelist);
      bulkUpdate(identifiersToWhitelistEvents);
    },
    [membersNotInWhitelist, bulkUpdate],
  );

  useFetchEffect(
    bulkUpdateMembers,
    { shouldFetch },
    { onError: onBulkError },
  );

  useEffect(
    () => {
      accessesRef.current = accesses;
    },
    [accessesRef, accesses],
  );

  return (
    <Formik
      onSubmit={onSubmit}
      initialValues={initialValues}
      validationSchema={accessValidationSchema}
      enableReinitialize
    >
      <Form>
        <Box my={2}>
          <SharingFormWhitelist
            parent={ACCESSES_FIELD_NAME}
            name={WHITELIST_FIELD_NAME}
            getOptionDisabled={getOptionDisabled}
            initialValue={WHITELIST_INITIAL_VALUE}
            disabled={!isCurrentUserOwner}
          />
        </Box>
        {children}
        {isCurrentUserOwner && (
          <Field
            name={ACCESSES_FIELD_NAME}
            prefix="boxes."
            variant="outlined"
            component={TextField}
            select
            SelectProps={{
              renderValue: (value) => (
                <ListItemAccessLevel value={value} dense />
              ),
            }}
          >
            <MenuItem value={PRIVATE}>
              <SelectItemAccessLevel value={PRIVATE} />
            </MenuItem>
            <MenuItem value={PUBLIC}>
              <SelectItemAccessLevel value={PUBLIC} />
            </MenuItem>
            <MenuItem value={LIMITED}>
              <SelectItemAccessLevel value={LIMITED} />
            </MenuItem>
          </Field>
        )}
        <FormikAutoSave />
      </Form>
    </Formik>
  );
}

ShareBoxForm.propTypes = {
  accesses: PropTypes.arrayOf(PropTypes.shape(BoxEventsSchema.propTypes)).isRequired,
  boxId: PropTypes.string.isRequired,
  boxKeyShare: PropTypes.string.isRequired,
  boxSecretKey: PropTypes.string.isRequired,
  invitationURL: PropTypes.object.isRequired,
  children: PropTypes.node,
  isCurrentUserOwner: PropTypes.bool,
  membersNotInWhitelist: PropTypes.arrayOf(PropTypes.shape(SenderSchema.propTypes)),
  isRemoving: PropTypes.bool,
};

ShareBoxForm.defaultProps = {
  children: null,
  isCurrentUserOwner: false,
  membersNotInWhitelist: [],
  isRemoving: false,
};

export default withTranslation(['boxes', 'common'])(ShareBoxForm);
