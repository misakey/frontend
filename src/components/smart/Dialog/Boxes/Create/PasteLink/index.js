import { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'formik';
import { withTranslation } from 'react-i18next';

import { getBoxInvitationLinkFieldValidationSchema } from 'constants/validationSchemas/boxes';
import { SIDES } from '@misakey/ui/constants/drawers';

import useSafeDestr from '@misakey/hooks/useSafeDestr';
import { useHistory } from 'react-router-dom';
import makeStyles from '@material-ui/core/styles/makeStyles';

import Formik from '@misakey/ui/Formik';
import OpenDrawerAccountButton from 'components/smart/Button/Drawer/Account';
import FormField from '@misakey/ui/Form/Field';
import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import BoxControls from '@misakey/ui/Box/Controls';
import FieldTextStandard from 'components/dumb/Form/Field/Text/Standard';
import Box from '@material-ui/core/Box';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import BoxesSchema from 'store/schemas/Boxes';
import Title from '@misakey/ui/Typography/Title';
import DialogTitleWithCloseFormik from '@misakey/ui/DialogTitle/WithCloseIcon/Formik';
import DialogContent from '@misakey/ui/DialogContent';

// CONSTANTS
const FIELD_NAME = 'invitationLink';
const INITIAL_VALUES = { [FIELD_NAME]: '' };

// HOOKS
const useStyles = makeStyles((theme) => ({
  dialogContentRoot: {
    padding: theme.spacing(0),
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
        <DialogTitleWithCloseFormik onClose={onClose} fullScreen={fullScreen} gutterBottom>
          <BoxFlexFill />
          <OpenDrawerAccountButton side={SIDES.RIGHT} />
        </DialogTitleWithCloseFormik>
        <DialogContent
          className={classes.dialogContentRoot}
          title={<Title gutterBottom={false}>{t('boxes:pasteLink.title')}</Title>}
        >
          <FormField
            prefix="boxes."
            component={FieldTextStandard}
            name={FIELD_NAME}
            fullWidth
          />
          <Button
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
