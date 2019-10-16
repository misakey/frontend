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

import FieldText from '@misakey/ui/Form/Field/Text';
import ButtonSubmit from '@misakey/ui/Button/Submit';

import { privacyLinkSchema, dpoEmailSchema } from './validationSchemas';

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
      if (userContributionType === 'dpoEmail') {
        return dpoEmailSchema;
      }
      if (userContributionType === 'link') {
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

        // validationSchema
        initialValues={INITIAL_VALUES}
      >
        {
          ({ isSubmitting }) => (
            <Form>
              <DialogTitle id="alert-dialog-title" onClose={onClose}>
                {t('application.info.userContribution.dialog.title', { appName })}
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="alert-dialog-description">
                  {t(`application.info.userContribution.dialog.intro.${userContributionType}`, { appName })}
                </DialogContentText>
                {(userContributionType === 'dpoEmail') && (
                  <Field
                    component={FieldText}
                    name="dpoEmail"
                    variant="outlined"
                    autoFocus
                    id="dpo-email-address"
                    fullWidth
                    label={t('application.info.userContribution.dialog.fields.dpoEmail')}
                  />
                )}

                <DialogContentText>
                  {t(`application.info.userContribution.dialog.linkExplaination.${userContributionType}`)}
                </DialogContentText>
                <Field
                  component={FieldText}
                  name="link"
                  variant="outlined"
                  autoFocus={userContributionType === 'link'}
                  id="link-address"
                  type="text"
                  fullWidth
                  label={t(`application.info.userContribution.dialog.fields.link.${userContributionType}`)}
                />
                <DialogContentText>
                  {t('application.info.userContribution.dialog.outro')}
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <ButtonSubmit
                  disabled={isSubmitting}
                  isSubmitting={isSubmitting}
                >
                  {t('application.info.userContribution.dialog.send')}
                </ButtonSubmit>
              </DialogActions>
            </Form>
          )
        }
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
  userContributionType: PropTypes.string,
  appName: PropTypes.string,
};

UserContributionDialog.defaultProps = {
  userContributionType: 'all',
  appName: '',
};

export default withWidth()(withTranslation('screens')(UserContributionDialog));
