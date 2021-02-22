import React, { useCallback, useRef, useState, useMemo, useEffect } from 'react';

import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { gone } from '@misakey/ui/constants/errorTypes';
import BoxesSchema from 'store/schemas/Boxes';
import BoxesEventsSchema from 'store/schemas/Boxes/Events';
import { boxEditMessageValidationSchema } from 'constants/validationSchemas/boxes';

import pluck from '@misakey/helpers/pluck';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import { createEditTextBoxEventBuilder } from 'helpers/builder/boxes';
import { getCode } from '@misakey/helpers/apiError';
import { selectors as cryptoSelectors } from '@misakey/crypto/store/reducers';

import { useSnackbar } from 'notistack';
import useDecryptedEventText from 'hooks/useDecryptedEventText';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import Box from '@material-ui/core/Box';
import Formik from '@misakey/ui/Formik';
import { Form } from 'formik';
import FormField from '@misakey/ui/Form/Field';
import FieldTextMultiline from 'components/dumb/Form/Field/Text/Multiline';
import Tooltip from '@material-ui/core/Tooltip';
import IconButtonSubmit from '@misakey/ui/IconButton/Submit';
import DialogEventDelete from 'components/dumb/Dialog/Event/Delete';
import FooterEditingHeader from 'components/screens/app/Boxes/Read/Events/Footer/Editing/Header';

import SendIcon from '@material-ui/icons/Send';

// CONSTANTS
const FIELD = 'editMessage';
const BOX_PADDING_SPACING = 1;

const INITIAL_VALUES = {
  [FIELD]: '',
};

const BUTTON_WIDTH = 6;

const {
  getAsymSecretKey,
} = cryptoSelectors;

// HELPERS
const pluckId = pluck('id');

// HOOKS
const useStyles = makeStyles((theme) => ({
  textField: {
    alignSelf: 'center',
  },
  textFieldInputRoot: {
    minHeight: 48,
  },
  inputBox: {
    maxWidth: `calc(100% - ${theme.spacing(BUTTON_WIDTH)}px)`,
  },
}));

// COMPONENTS
// @FIXME factorize footer common code
function BoxEventsFooterEditing({ box, event, clearEvent, t }) {
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const handleHttpErrors = useHandleHttpErrors();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { id: boxId, publicKey, events } = useSafeDestr(box);
  const { id: eventId } = useSafeDestr(event);
  const secretKey = useSelector(getAsymSecretKey(publicKey));

  const disabled = useMemo(
    () => isNil(secretKey),
    [secretKey],
  );

  const eventValue = useDecryptedEventText(event);

  const initialValues = useMemo(
    () => ({
      ...INITIAL_VALUES,
      [FIELD]: eventValue,
    }),
    [eventValue],
  );

  const anchorRef = useRef(null);
  const inputRef = useRef();

  const boxContainsEvent = useMemo(
    () => !isNil(events) && pluckId(events).includes(eventId),
    [events, eventId],
  );

  const onDelete = useCallback(
    () => clearEvent(),
    [clearEvent],
  );

  const onOpen = useCallback(
    () => {
      setIsDialogOpen(true);
    },
    [setIsDialogOpen],
  );

  const onClose = useCallback(
    () => {
      setIsDialogOpen(false);
    },
    [setIsDialogOpen],
  );

  const handleSubmit = useCallback(
    ({ [FIELD]: value }, { resetForm, setSubmitting }) => {
      if (isEmpty(value)) {
        setSubmitting(false);
        return onOpen();
      }
      return createEditTextBoxEventBuilder({
        publicKey, boxId, referrerId: eventId, value,
      })
        .then(() => Promise.all([
          resetForm(),
          clearEvent(),
        ]))
        .catch((error) => {
          const code = getCode(error);
          if (code === gone) {
            enqueueSnackbar(t('boxes:read.events.gone'), { variant: 'warning' });
          } else {
            handleHttpErrors(error);
          }
        })
        .finally(() => {
          setSubmitting(false);
        });
    },
    [enqueueSnackbar, handleHttpErrors, boxId, eventId, publicKey, clearEvent, onOpen, t],
  );

  useEffect(
    () => {
      const { current } = inputRef;
      if (!isNil(current)) {
        current.focus();
        // focus end of input text
        current.setSelectionRange(eventValue.length, eventValue.length);
      }
    },
    [inputRef, eventValue, eventId, event],
  );

  useEffect(
    () => {
      if (!boxContainsEvent) {
        clearEvent();
      }
    },
    [boxContainsEvent, clearEvent],
  );

  return (
    <Box p={BOX_PADDING_SPACING}>
      <DialogEventDelete
        boxId={boxId}
        eventId={eventId}
        onDelete={onDelete}
        onClose={onClose}
        isDialogOpen={isDialogOpen}
      />
      <Box ref={anchorRef} display="flex" alignContent="center" alignItems="flex-end" width="100%">
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validationSchema={boxEditMessageValidationSchema}
          enableReinitialize
        >
          <Box component={Form} display="flex" flexGrow="1" alignItems="flex-end" width="100%">
            <Box display="flex" flexGrow="1" flexDirection="column" className={classes.inputBox}>
              <FooterEditingHeader
                onClose={clearEvent}
                value={eventValue}
                ml="14px" // => field text multiline padding
              />
              <FormField
                component={FieldTextMultiline}
                name={FIELD}
                inputRef={inputRef}
                className={classes.textField}
                InputProps={{ classes: { root: classes.textFieldInputRoot } }}
                id="edit-message-textarea"
                variant="outlined"
                size="small"
                margin="none"
                fullWidth
                rowsMax={8}
                displayError={false}
                disabled={disabled}
              />
            </Box>
            <Tooltip title={t('boxes:read.actions.send')}>
              <IconButtonSubmit
                aria-label={t('boxes:read.actions.send')}
                color="primary"
                disabled={disabled}
              >
                <SendIcon />
              </IconButtonSubmit>
            </Tooltip>
          </Box>
        </Formik>
      </Box>
    </Box>
  );
}

BoxEventsFooterEditing.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  event: PropTypes.shape(BoxesEventsSchema.propTypes).isRequired,
  clearEvent: PropTypes.func.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common', 'boxes'])(BoxEventsFooterEditing);
