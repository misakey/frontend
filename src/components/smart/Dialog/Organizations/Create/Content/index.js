import React from 'react';

import dialogIsFullScreen from '@misakey/core/helpers/dialog/isFullScreen';

import { useTranslation } from 'react-i18next';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { useFormikContext } from 'formik';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import FieldText from '@misakey/ui/Form/Field/TextFieldWithErrors';
import DialogContent from '@misakey/ui/DialogContent';
// import BoxControlsCentered from '@misakey/ui/Box/Controls/Centered';
import BoxMessage from '@misakey/ui/Box/Message';
// import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import BoxControlsDialog from '@misakey/ui/Box/Controls/Dialog';
import BoxFloatAvatar, { TOP } from '@misakey/ui/Box/FloatAvatar';
import AvatarColorized, { BACKGROUND_COLOR } from '@misakey/ui/Avatar/Colorized';
import Field from '@misakey/ui/Form/Field';

// CONSTANTS
const PREFIX = 'organization.';
const FIELD_ORG_NAME = 'name';

// HOOKS
const useStyles = makeStyles((theme) => ({
  dialogContentRoot: {
    padding: theme.spacing(0, 0, 1, 0),
    [dialogIsFullScreen(theme)]: {
      paddingBottom: theme.spacing(0),
    },
    marginTop: theme.spacing(3),
  },
  inputField: {
    margin: theme.spacing(2, 0),
  },
}));

// COMPONENTS
const DialogOrganizationCreateContent = () => {
  const classes = useStyles();

  const { t } = useTranslation('fields');

  const { values } = useFormikContext();

  const { name } = useSafeDestr(values);

  return (
    <>
      <BoxFloatAvatar
        size="large"
        direction={TOP}
      >
        <AvatarColorized
          size="large"
          text={name}
          colorizedProp={BACKGROUND_COLOR}
        />
      </BoxFloatAvatar>
      {/* @TODO with avatar upload
       <BoxControlsCentered
        primary={}
        secondary={}
      /> */}
      <DialogContent
        className={classes.dialogContentRoot}
      >
        <Field
          component={FieldText}
          className={classes.inputField}
          name={FIELD_ORG_NAME}
          prefix={PREFIX}
          autoFocus
          type="text"
          variant="filled"
          fullWidth
        />
        <BoxMessage
          text={t(`fields:${PREFIX}${FIELD_ORG_NAME}.info`)}
          type="info"
          my={1}
        />
        {/* <Button
          standing={BUTTON_STANDINGS.TEXT}
          text={t('organizations:join')}
          onClick={onToggleInvitation}
        /> */}
        <BoxControlsDialog
          primary={{
            type: 'submit',
            text: t('common:create'),
          }}
          formik
        />
      </DialogContent>
    </>
  );
};

DialogOrganizationCreateContent.propTypes = {

};

export default DialogOrganizationCreateContent;
