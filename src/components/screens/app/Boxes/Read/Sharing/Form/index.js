import { useMemo, useRef, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withTranslation, useTranslation } from 'react-i18next';
import BoxEventsSchema from 'store/schemas/Boxes/Events';
import BoxesSchema from 'store/schemas/Boxes';

import { ACCESS_RM, ACCESS_ADD, ACCESS_BULK, STATE_ACCESS_MODE } from 'constants/app/boxes/events';
import { RESTRICTION_TYPES } from 'constants/app/boxes/accesses';
import { updateAccessesEvents } from 'store/reducers/box';
import { updateEntities } from '@misakey/store/actions/entities';
import { accessValidationSchema } from 'constants/validationSchemas/boxes';
import ACCESS_MODES, { PUBLIC, LIMITED } from '@misakey/ui/constants/accessModes';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import { getUpdatedAccesses } from 'helpers/accesses';
import isEmpty from '@misakey/helpers/isEmpty';
import pluck from '@misakey/helpers/pluck';
import logSentryException from '@misakey/helpers/log/sentry/exception';
import filter from '@misakey/helpers/filter';
import { createBulkBoxEventBuilder, createBoxEventBuilder } from '@misakey/helpers/builder/boxes';
import { identifierValuePath, senderMatchesIdentifierValue } from 'helpers/sender';

import { useSelector, useDispatch } from 'react-redux';
import { tryAddingAutoInvite } from '@misakey/crypto/box/autoInvitation';
import { useSnackbar } from 'notistack';

import Formik from '@misakey/ui/Formik';
import FieldSubmitOnChange from '@misakey/ui/Form/Field/SubmitOnChange';
import { Form } from 'formik';
import MenuItem from '@material-ui/core/MenuItem';
import Box from '@material-ui/core/Box';
import ListItemAccessLevel from 'components/dumb/ListItem/AccessLevel';
import SelectItemAccessLevel from 'components/dumb/SelectItem/AccessLevel';
import TextField from '@misakey/ui/Form/Field/TextFieldWithErrors';
import SharingFormWhitelist from 'components/screens/app/Boxes/Read/Sharing/Form/Whitelist';

// CONSTANTS
const { identifierValue: IDENTIFIER_VALUE_SELECTOR } = authSelectors;
const ACCESSES_FIELD_NAME = 'accessLevel';
const WHITELIST_FIELD_NAME = 'accessWhitelist';

const WHITELIST_INITIAL_VALUE = [];

const ACCESS_EVENT_TYPE = {
  RM: ACCESS_RM,
  ADD: ACCESS_ADD,
  ALL: ACCESS_BULK,
};

// HELPERS
const getValues = pluck('value');
const pluckContent = pluck('content');

// COMPONENTS
function ShareBoxForm({
  accesses, accessMode,
  boxId,
  children,
  isCurrentUserOwner,
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

  const initialValues = useMemo(
    () => ({
      [ACCESSES_FIELD_NAME]: accessMode,
      [WHITELIST_FIELD_NAME]: WHITELIST_INITIAL_VALUE,
    }),
    [accessMode],
  );

  const getOptionDisabled = useCallback(
    (option) => {
      const optionIdentifierValue = identifierValuePath(option);
      return optionIdentifierValue.endsWith(',')
    || senderMatchesIdentifierValue(option, meIdentifierValue)
    || whitelistedValues.includes(optionIdentifierValue);
    },
    [meIdentifierValue, whitelistedValues],
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
      { [ACCESSES_FIELD_NAME]: nextAccessMode, [WHITELIST_FIELD_NAME]: nextWhitelist },
      { resetForm },
    ) => {
      resetForm({
        values: {
          [WHITELIST_FIELD_NAME]: initialValues[WHITELIST_FIELD_NAME],
          [ACCESSES_FIELD_NAME]: nextAccessMode,
        },
      });

      const accessModeChanged = nextAccessMode !== accessMode;
      if (accessModeChanged) {
        await createBoxEventBuilder(boxId, {
          type: STATE_ACCESS_MODE,
          content: {
            value: nextAccessMode,
          },
        });
        await Promise.resolve(dispatch(updateEntities(
          [{ id: boxId, changes: { accessMode: nextAccessMode } }], BoxesSchema,
        )));
      }

      const whitelistValues = nextWhitelist
        .map((el) => {
          const value = identifierValuePath(el);
          const { type } = el;
          return { value, type };
        })
        // @FIXME safety check, but it should never happen
        // getOptionDisabled + validationSchema already handle the case
        .filter(({ value }) => !whitelistedValues.includes(value));
      const whitelistEventsWithAutoInvite = await Promise.all(whitelistValues
        .map(async ({ value, type }) => tryAddingAutoInvite({
          event: {
            type: ACCESS_EVENT_TYPE.ADD,
            content: {
              restrictionType: type,
              value,
            },
          },
          boxKeyShare,
          boxSecretKey,
        })));

      if (isEmpty(whitelistEventsWithAutoInvite) && !accessModeChanged) {
        return enqueueSnackbar(t('boxes:read.share.update.noChanges'), { variant: 'info' });
      }
      if (!isEmpty(whitelistEventsWithAutoInvite)) {
        try {
          await bulkUpdate(whitelistEventsWithAutoInvite);
        } catch (err) {
          logSentryException(err);
          return onBulkError();
        }
      }
      return enqueueSnackbar(t('boxes:read.share.update.success'), { variant: 'success' });
    },
    [
      enqueueSnackbar, t,
      boxId, boxKeyShare, boxSecretKey,
      bulkUpdate, onBulkError,
      initialValues,
      whitelistedValues, accessMode,
      dispatch,
    ],
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
            name={WHITELIST_FIELD_NAME}
            getOptionDisabled={getOptionDisabled}
            disabled={!isCurrentUserOwner}
          />
        </Box>
        {children}
        {isCurrentUserOwner && (
          <FieldSubmitOnChange
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
            <MenuItem value={PUBLIC}>
              <SelectItemAccessLevel value={PUBLIC} />
            </MenuItem>
            <MenuItem value={LIMITED}>
              <SelectItemAccessLevel value={LIMITED} />
            </MenuItem>
          </FieldSubmitOnChange>
        )}
      </Form>
    </Formik>
  );
}

ShareBoxForm.propTypes = {
  accesses: PropTypes.arrayOf(PropTypes.shape(BoxEventsSchema.propTypes)).isRequired,
  accessMode: PropTypes.oneOf(ACCESS_MODES),
  boxId: PropTypes.string.isRequired,
  boxKeyShare: PropTypes.string.isRequired,
  boxSecretKey: PropTypes.string.isRequired,
  children: PropTypes.node,
  isCurrentUserOwner: PropTypes.bool,
};

ShareBoxForm.defaultProps = {
  accessMode: LIMITED,
  children: null,
  isCurrentUserOwner: false,
};

export default withTranslation(['boxes', 'common'])(ShareBoxForm);
