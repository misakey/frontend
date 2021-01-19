import PropTypes from 'prop-types';

import { selectors } from '@misakey/auth/store/reducers/auth';
import { MSG_TXT } from 'constants/app/boxes/events';
import { contactFieldsValidationSchema } from 'constants/validationSchemas/boxes';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import isEmpty from '@misakey/helpers/isEmpty';
import { createBoxEventBuilder } from '@misakey/helpers/builder/boxes';
import encryptText from '@misakey/crypto/box/encryptText';

import makeStyles from '@material-ui/core/styles/makeStyles';
import useContactUser from 'hooks/useContactUser';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useCallback, useMemo } from 'react';
import useDialogFullScreen from '@misakey/hooks/useDialogFullScreen';

import BoxControls from '@misakey/ui/Box/Controls';
import DialogContent from '@misakey/ui/DialogContent';
import DialogTitleWithCloseFormik from '@misakey/ui/DialogTitle/WithCloseIcon/Formik';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import FieldTextMultiline from 'components/dumb/Form/Field/Text/Multiline';
import FormField from '@misakey/ui/Form/Field';
import FormFieldTextFieldWithErrors from '@misakey/ui/Form/Field/TextFieldWithErrors';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import { Form } from 'formik';
import Formik from '@misakey/ui/Formik';

// CONSTANTS
const FIELD_BOX_TITLE = 'title';
const FIELD_BOX_MESSAGE = 'message';

// HOOKS
const useStyles = makeStyles((theme) => ({
  dialogContentRoot: {
    padding: theme.spacing(0),
    marginTop: theme.spacing(3),
  },
  prewrap: {
    whiteSpace: 'pre-wrap',
    overflowWrap: 'break-word',
  },
}));

function ContactBoxDialog({ onClose, open, targetUser, ...props }) {
  const classes = useStyles();

  const { t } = useTranslation('boxes');

  const fullScreen = useDialogFullScreen();

  const { profile: { displayName } } = useMemo(() => targetUser, [targetUser]);

  const userIdentity = useSelector(selectors.identity);

  const onSubmitMessage = useCallback(
    (message) => (box) => {
      if (isEmpty(message)) {
        return Promise.resolve();
      }
      const { publicKey, id } = box;
      return createBoxEventBuilder(id, {
        type: MSG_TXT,
        content: {
          encrypted: encryptText(message, publicKey),
          publicKey,
        },
      });
    },
    [],
  );

  const { onContactUser, boxDefaultTitle } = useContactUser(targetUser, userIdentity);

  const onSubmit = useCallback(
    (form) => {
      const { [FIELD_BOX_MESSAGE]: message, [FIELD_BOX_TITLE]: title } = form;
      const onSuccess = onSubmitMessage(message);
      onContactUser(title, onSuccess);
    },
    [onContactUser, onSubmitMessage],
  );

  return (
    <Dialog
      fullWidth
      fullScreen={fullScreen}
      open={open}
      onClose={onClose}
      aria-label={t('boxes:contact.dialog.title')}
      {...omitTranslationProps(props)}
    >
      <Formik
        validationSchema={contactFieldsValidationSchema}
        initialValues={{
          [FIELD_BOX_TITLE]: boxDefaultTitle,
          [FIELD_BOX_MESSAGE]: '',
        }}
        onSubmit={onSubmit}
      >
        <Form>
          <DialogTitleWithCloseFormik
            title={t('boxes:contact.dialog.title', { displayName })}
            onClose={onClose}
          />
          <DialogContent
            classes={{ root: classes.dialogContentRoot }}
            subtitle={<Subtitle className={classes.prewrap}>{t('boxes:contact.dialog.subtitle', { displayName })}</Subtitle>}
          >
            <FormField
              component={FormFieldTextFieldWithErrors}
              name={FIELD_BOX_TITLE}
              placeholder={boxDefaultTitle}
              prefix="boxes.contact.dialog."
              autoFocus
              type="text"
            />

            <FormField
              component={FieldTextMultiline}
              name={FIELD_BOX_MESSAGE}
              prefix="boxes.contact.dialog."
              fullWidth
              rowsMax={8}
              rows={4}
            />
          </DialogContent>
          <DialogActions>
            <BoxControls
              primary={{
                type: 'submit',
                text: t('common:contact'),
              }}
              formik
            />
          </DialogActions>
        </Form>
      </Formik>
    </Dialog>
  );
}

ContactBoxDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  targetUser: PropTypes.shape({
    identityId: PropTypes.string.isRequired,
    profile: PropTypes.object.isRequired,
  }).isRequired,
};

ContactBoxDialog.defaultProps = {
  open: false,
};

export default ContactBoxDialog;
