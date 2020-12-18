import { useCallback, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { MSG_TXT } from 'constants/app/boxes/events';
import encryptText from '@misakey/crypto/box/encryptText';
import BoxesSchema from 'store/schemas/Boxes';
import { boxMessageValidationSchema } from 'constants/validationSchemas/boxes';
import { blurText, clearText } from 'store/actions/box';
import { makeGetBoxText } from 'store/reducers/box';

import { createBoxEventBuilder } from '@misakey/helpers/builder/boxes';
import isNil from '@misakey/helpers/isNil';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useBoxPublicKeysWeCanDecryptFrom from 'packages/crypto/src/hooks/useBoxPublicKeysWeCanDecryptFrom';
import { useDispatch, useSelector } from 'react-redux';
import useHandleHttpErrors from '@misakey/hooks/useHandleHttpErrors';
import { useBoxEventSubmitContext } from 'components/smart/Box/Event/Submit/Context';
import { useBoxesUploadContext } from 'components/smart/Input/Boxes/Upload/Context';

import Box from '@material-ui/core/Box';
import Formik from '@misakey/ui/Formik';
import { Form } from 'formik';
import FormField from '@misakey/ui/Form/Field';
import FieldTextMultiline from 'components/dumb/Form/Field/Text/Multiline';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import IconButtonSubmit from '@misakey/ui/IconButton/Submit';

import ResetOnBoxChange from 'components/screens/app/Boxes/Read/Events/Footer/Creating/ResetOnBoxChange';
import { useScreenDrawerContext } from 'components/smart/Screen/Drawer';

import AttachFileIcon from '@material-ui/icons/AttachFile';
import SendIcon from '@material-ui/icons/Send';

// CONSTANTS
const FIELD = 'message';
const BOX_PADDING_SPACING = 1;

const INITIAL_VALUES = {
  [FIELD]: '',
};

const useStyles = makeStyles((theme) => ({
  popper: ({ drawerWidth, isDrawerOpen }) => ({
    width: `calc(100% - ${isDrawerOpen ? drawerWidth : '0px'} - ${theme.spacing(BOX_PADDING_SPACING) * 4}px)`,
  }),
  paper: {
    borderRadius: 10,
  },
  textFieldRoot: {
    alignSelf: 'center',
  },
  textFieldInputRoot: {
    minHeight: 48,
  },
}));

// COMPONENTS
function BoxEventsFooter({ box, t }) {
  const { drawerWidth, isDrawerOpen } = useScreenDrawerContext();

  const classes = useStyles({ drawerWidth, isDrawerOpen });
  const dispatch = useDispatch();
  const handleHttpErrors = useHandleHttpErrors();

  const { scrollToBottom } = useBoxEventSubmitContext();

  const { id, publicKey, title } = useMemo(() => box || {}, [box]);
  const publicKeysWeCanEncryptWith = useBoxPublicKeysWeCanDecryptFrom();

  const { onOpen: onBoxesUploadOpen } = useBoxesUploadContext();

  const disabled = useMemo(
    () => !publicKeysWeCanEncryptWith.has(publicKey),
    [publicKey, publicKeysWeCanEncryptWith],
  );

  const anchorRef = useRef(null);

  // SELECTORS
  const getBoxText = useMemo(
    () => makeGetBoxText(),
    [],
  );
  const boxText = useSelector((state) => getBoxText(state, id));

  const initialValues = useMemo(
    () => (isNil(boxText)
      ? INITIAL_VALUES
      : { ...INITIAL_VALUES, [FIELD]: boxText }),
    [boxText],
  );

  const onBlur = useCallback(
    (e) => {
      dispatch(blurText({ boxId: id, text: e.target.value }));
    },
    [dispatch, id],
  );

  const handleSubmit = useCallback(
    (values, { setSubmitting, resetForm }) => {
      const { [FIELD]: value } = values;
      return Promise.all([
        createBoxEventBuilder(id, {
          type: MSG_TXT,
          content: {
            encrypted: encryptText(value, publicKey),
            publicKey,
          },
        }),
        Promise.resolve(dispatch(clearText({ boxId: id }))),
        resetForm({ values: INITIAL_VALUES, isSubmitting: true }),
      ])
        .then(() => {
          scrollToBottom();
        })
        .catch((error) => {
          resetForm({ values, isSubmitting: true });
          handleHttpErrors(error);
        })
        .finally(() => {
          setSubmitting(false);
        });
    },
    [dispatch, handleHttpErrors, id, publicKey, scrollToBottom],
  );

  return (
    <Box p={BOX_PADDING_SPACING}>
      <Box ref={anchorRef} display="flex" alignContent="center" alignItems="flex-end">
        <Tooltip title={t('boxes:read.actions.upload')}>
          <IconButton
            aria-label={t('boxes:read.actions.upload')}
            color="primary"
            onClick={onBoxesUploadOpen}
            disabled={disabled}
          >
            <AttachFileIcon />
          </IconButton>
        </Tooltip>
        <Formik
          initialValues={initialValues}
          enableReinitialize
          onSubmit={handleSubmit}
          validationSchema={boxMessageValidationSchema}
        >
          <Box component={Form} display="flex" flexGrow="1" alignItems="flex-end">
            <ResetOnBoxChange box={box} />
            <FormField
              component={FieldTextMultiline}
              name={FIELD}
              className={classes.textFieldRoot}
              InputProps={{ classes: { root: classes.textFieldInputRoot } }}
              id="new-message-textarea"
              variant="outlined"
              placeholder={t('boxes:read.actions.write', { title })}
              aria-label={t('boxesread.actions.write', { title })}
              size="small"
              margin="none"
              fullWidth
              rowsMax={8}
              displayError={false}
              disabled={disabled}
              onBlur={onBlur}
            />
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

BoxEventsFooter.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
  // menu actions
};

export default withTranslation(['common', 'boxes'])(BoxEventsFooter);
