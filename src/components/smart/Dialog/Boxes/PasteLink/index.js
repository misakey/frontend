import React, { useCallback, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Form, Field } from 'formik';
import Formik from '@misakey/ui/Formik';
import { withTranslation } from 'react-i18next';
import useDialogFullScreen from '@misakey/hooks/useDialogFullScreen';
import isNil from '@misakey/helpers/isNil';

import { makeStyles } from '@material-ui/core/styles/';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';

import BoxControls from '@misakey/ui/Box/Controls';
import Redirect from 'components/dumb/Redirect';
import { getBoxInvitationLinkFieldValidationSchema } from 'constants/validationSchemas/boxes';
import FieldTextStandard from 'components/dumb/Form/Field/Text/Standard';
import Box from '@material-ui/core/Box';

const FIELD_NAME = 'invitationLink';
const INITIAL_VALUES = { [FIELD_NAME]: '' };

// HOOKS
const useStyles = makeStyles((theme) => ({
  dialogContentRoot: {
    padding: theme.spacing(0, 2),
    marginTop: theme.spacing(3),
  },
  dialogActionsRoot: {
    padding: theme.spacing(2),
  },
  inputField: { width: '70%', margin: theme.spacing(2, 0) },
}));

function PasteBoxLinkDialog({ t, open, boxId }) {
  const classes = useStyles();
  const fullScreen = useDialogFullScreen();
  const [redirectTo, setRedirectTo] = useState(null);

  const boxInvitationLinkFieldValidationSchema = useMemo(
    () => getBoxInvitationLinkFieldValidationSchema(boxId), [boxId],
  );

  const onSubmit = useCallback(({ [FIELD_NAME]: link }) => {
    const { pathname, hash } = new URL(link);
    setRedirectTo(`${pathname}${hash}`);
  }, []);

  if (!isNil(redirectTo)) {
    return <Redirect to={redirectTo} />;
  }

  return (
    <Dialog
      fullWidth
      fullScreen={fullScreen}
      open={open}
      aria-labelledby={t('boxes:pasteLink.dialog.content')}
      aria-describedby={t('boxes:pasteLink.dialog.content')}
    >
      <Formik
        validationSchema={boxInvitationLinkFieldValidationSchema}
        initialValues={INITIAL_VALUES}
        onSubmit={onSubmit}
      >
        <Form>
          <DialogContent className={classes.dialogContentRoot}>
            <Typography>{t('boxes:pasteLink.dialog.content')}</Typography>
            <Box display="flex" justifyContent="center">
              <Field
                prefix="boxes."
                component={FieldTextStandard}
                name={FIELD_NAME}
                className={classes.inputField}
                fullWidth={false}
              />
            </Box>
          </DialogContent>
          <DialogActions className={classes.dialogActionsRoot}>
            <BoxControls
              primary={{
                type: 'submit',
                text: t('common:next'),
              }}
              formik
            />
          </DialogActions>
        </Form>
      </Formik>
    </Dialog>

  );
}

PasteBoxLinkDialog.propTypes = {
  open: PropTypes.bool,
  boxId: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
};

PasteBoxLinkDialog.defaultProps = {
  open: false,
};

export default withTranslation(['common', 'boxes'])(PasteBoxLinkDialog);
