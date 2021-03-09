import React, { useCallback, useMemo } from 'react';

import PropTypes from 'prop-types';
import { Form } from 'formik';
import { withTranslation } from 'react-i18next';

import { getBoxInvitationLinkFieldValidationSchema } from 'constants/validationSchemas/boxes';
import { SIDES } from '@misakey/ui/constants/drawers';

import dialogIsFullScreen from '@misakey/helpers/dialog/isFullScreen';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import { useHistory } from 'react-router-dom';
import makeStyles from '@material-ui/core/styles/makeStyles';

import Formik from '@misakey/ui/Formik';
import OpenDrawerAccountButton from 'components/smart/Button/Drawer/Account';
import FormField from '@misakey/ui/Form/Field';
import { BUTTON_STANDINGS } from '@misakey/ui/Button';
import BoxControls from '@misakey/ui/Box/Controls';
import FormFieldTextField from '@misakey/ui/Form/Field/TextFieldWithErrors';
import Box from '@material-ui/core/Box';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import BoxesSchema from 'store/schemas/Boxes';
import DialogTitleWithCloseFormik from '@misakey/ui/DialogTitle/WithCloseIcon/Formik';
import DialogContent from '@misakey/ui/DialogContent';
import ButtonWithDialogPassword from 'components/smart/Dialog/Password/with/Button';

// CONSTANTS
const FIELD_NAME = 'invitationLink';
const INITIAL_VALUES = { [FIELD_NAME]: '' };

// HOOKS
const useStyles = makeStyles((theme) => ({
  dialogContentRoot: {
    padding: theme.spacing(0, 0, 1, 0),
    [dialogIsFullScreen(theme)]: {
      paddingBottom: theme.spacing(0),
    },
  },
}));

// COMPONENTS
function PasteBoxLinkScreen({
  t, box, onClose, onBack, fullScreen,
}) {
  const { replace } = useHistory();
  const classes = useStyles();

  const { id } = useSafeDestr(box);

  const boxInvitationLinkFieldValidationSchema = useMemo(
    () => getBoxInvitationLinkFieldValidationSchema(id), [id],
  );

  const onSubmit = useCallback(
    ({ [FIELD_NAME]: link }) => {
      const { pathname, hash } = new URL(link);
      return Promise.resolve(replace(`${pathname}${hash}`))
        .then(() => {
          onClose();
        });
    },
    [replace, onClose],
  );

  return (
    <Formik
      validationSchema={boxInvitationLinkFieldValidationSchema}
      initialValues={INITIAL_VALUES}
      onSubmit={onSubmit}
    >
      <Box component={Form} display="flex" flexDirection="column" width="100%">
        <DialogTitleWithCloseFormik
          title={t('boxes:pasteLink.title')}
          onClose={onClose}
          fullScreen={fullScreen}
        >
          <BoxFlexFill />
          {fullScreen && (
            <OpenDrawerAccountButton side={SIDES.RIGHT} />
          )}
        </DialogTitleWithCloseFormik>
        <DialogContent
          className={classes.dialogContentRoot}
        >
          <FormField
            prefix="boxes."
            component={FormFieldTextField}
            name={FIELD_NAME}
            fullWidth
            variant="filled"
          />
          <ButtonWithDialogPassword
            standing={BUTTON_STANDINGS.TEXT}
            text={t('boxes:pasteLink.goBack')}
            onClick={onBack}
          />
          <BoxControls
            primary={{
              type: 'submit',
              text: t('common:join'),
            }}
            formik
          />
        </DialogContent>
      </Box>
    </Formik>
  );
}

PasteBoxLinkScreen.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes),
  fullScreen: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onBack: PropTypes.func.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

PasteBoxLinkScreen.defaultProps = {
  box: null,
  fullScreen: false,
};


export default withTranslation(['common', 'boxes'])(PasteBoxLinkScreen);
