import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { Formik, Form, Field } from 'formik';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import withWidth, { isWidthDown } from '@material-ui/core/withWidth';
import { withStyles } from '@material-ui/core/styles';

import FieldText from 'components/dumb/Form/Field/Text';
import ButtonSubmit from 'components/dumb/Button/Submit';

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


const styles = (theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(2),
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500],
  },
});

const DialogTitle = withStyles(styles)(({ children, classes, onClose }) => (
  <MuiDialogTitle disableTypography className={classes.root}>
    <Typography variant="h6">{children}</Typography>
    {onClose ? (
      <IconButton aria-label="close" className={classes.closeButton} onClick={onClose}>
        <CloseIcon />
      </IconButton>
    ) : null}
  </MuiDialogTitle>
));

function UserContributionDialog({
  onClose, onSuccess, open, t,
  width, userContributionType, appName,
}) {
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
      fullScreen={isWidthDown('xs', width)}
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
          <DialogTitle id="alert-dialog-title" onClose={onClose}>
            {t('citizen:userContribution.dialog.title', { appName })}
          </DialogTitle>
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
  width: PropTypes.string.isRequired,
  userContributionType: PropTypes.oneOf(USER_CONTRIBUTION_TYPES),
  appName: PropTypes.string,
};

UserContributionDialog.defaultProps = {
  userContributionType: USER_CONTRIBUTION_TYPE.dpoEmail,
  appName: '',
};

export default withWidth()(withTranslation('citizen')(UserContributionDialog));
