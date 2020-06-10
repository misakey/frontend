import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { Form, Field } from 'formik';
import Formik from '@misakey/ui/Formik';

import useDialogFullScreen from '@misakey/hooks/useDialogFullScreen';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';

import FieldText from 'components/dumb/Form/Field/Text';
import DialogTitleWithClose from '@misakey/ui/DialogTitle/WithCloseIcon';
import ButtonSubmit from '@misakey/ui/Button/Submit';

import { privacyLinkSchema, dpoEmailSchema } from 'constants/validationSchemas/contribution';

// CONSTANTS
export const USER_CONTRIBUTION_TYPE = {
  dpoEmail: 'dpoEmail',
  link: 'link',
};

export const USER_CONTRIBUTION_TYPES = Object.values(USER_CONTRIBUTION_TYPE);

const INITIAL_VALUES = {
  link: '',
  dpoEmail: '',
};

function UserContributionDialog({
  onClose, onSuccess, open, t,
  userContributionType, appName,
}) {
  const fullScreen = useDialogFullScreen();

  const onSubmit = useCallback(
    ({ dpoEmail, link }) => onSuccess(dpoEmail, link),
    [onSuccess],
  );

  const validationSchema = useMemo(
    () => {
      if (userContributionType === USER_CONTRIBUTION_TYPE.dpoEmail) {
        return dpoEmailSchema;
      }
      if (userContributionType === USER_CONTRIBUTION_TYPE.link) {
        return privacyLinkSchema;
      }
      return null;
    },
    [userContributionType],
  );

  return (
    <Dialog
      open={open}
      fullScreen={fullScreen}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <Formik
        onSubmit={onSubmit}
        validationSchema={validationSchema}
        initialValues={INITIAL_VALUES}
      >
        <Form>
          <DialogTitleWithClose
            id="alert-dialog-title"
            onClose={onClose}
          >
            {t('citizen:userContribution.dialog.title', { appName })}
          </DialogTitleWithClose>

          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {t(`citizen:userContribution.dialog.intro.${userContributionType}`, { appName })}
            </DialogContentText>
            {(userContributionType === USER_CONTRIBUTION_TYPE.dpoEmail) && (
            <Field
              component={FieldText}
              name="dpoEmail"
              variant="outlined"
              autoFocus
              id="dpo-email-address"
              fullWidth
              label={t('citizen:userContribution.dialog.fields.dpoEmail')}
            />
            )}

            <DialogContentText>
              {t(`citizen:userContribution.dialog.linkExplaination.${userContributionType}`)}
            </DialogContentText>
            <Field
              component={FieldText}
              name="link"
              variant="outlined"
              autoFocus={userContributionType === USER_CONTRIBUTION_TYPE.link}
              id="link-address"
              type="text"
              fullWidth
              label={t(`citizen:userContribution.dialog.fields.link.${userContributionType}`)}
            />
            <DialogContentText>
              {t('citizen:userContribution.dialog.outro')}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <ButtonSubmit
              text={t('citizen:userContribution.dialog.send')}
            />
          </DialogActions>
        </Form>
      </Formik>
    </Dialog>
  );
}

UserContributionDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  t: PropTypes.func.isRequired,
  userContributionType: PropTypes.oneOf(USER_CONTRIBUTION_TYPES),
  appName: PropTypes.string,
};

UserContributionDialog.defaultProps = {
  userContributionType: USER_CONTRIBUTION_TYPE.dpoEmail,
  appName: '',
};

export default withTranslation('citizen')(UserContributionDialog);
