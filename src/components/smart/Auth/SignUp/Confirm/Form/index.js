import React from 'react';
import { Form } from 'formik';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';

import { FIELD_PROPTYPES } from 'components/dumb/Form/Fields';
import FormCard from 'components/dumb/Form/Card';
import AuthCardTitle from 'components/smart/Auth/Card/Title';
import AuthCardSubTitle from 'components/smart/Auth/Card/SubTitle';

import SignUpConfirmFormFields from 'components/smart/Auth/SignUp/Confirm/Form/Fields';
import SignUpConfirmFormActions, {
  useSignUpConfirmSecondaryAction,
  useSignUpConfirmPrimaryAction,
  useReSendConfirmCode,
} from 'components/smart/Auth/SignUp/Confirm/Form/Actions';
import SignUpConfirmCardContent from 'components/smart/Auth/SignUp/Confirm/Form/CardContent';

const SignUpConfirmForm = ({ displayCard, fields, values, t, ...formProps }) => {
  const Fields = <SignUpConfirmFormFields {...fields} />;
  const { enqueueSnackbar } = useSnackbar();
  const [isSending, setSending] = React.useState(false);

  const reSendConfirmCode = useReSendConfirmCode(values.email, enqueueSnackbar, setSending, t);
  const signUpConfirmSecondaryAction = useSignUpConfirmSecondaryAction(
    reSendConfirmCode, isSending, t,
  );
  const signUpConfirmPrimaryAction = useSignUpConfirmPrimaryAction({ ...formProps }, t);

  const Card = displayCard && (
    <FormCard
      primary={signUpConfirmSecondaryAction}
      secondary={signUpConfirmPrimaryAction}
      title={<AuthCardTitle name="signUpConfirm" />}
      subtitle={<AuthCardSubTitle name="signUpConfirm" email={values.email} />}
    >
      <SignUpConfirmCardContent fields={Fields} />
    </FormCard>
  );

  return Card || (
    <Form>
      {Fields}
      <SignUpConfirmFormActions values={values} {...formProps} />
    </Form>
  );
};

SignUpConfirmForm.propTypes = {
  displayCard: PropTypes.bool,
  fields: PropTypes.objectOf(FIELD_PROPTYPES),
  values: PropTypes.object.isRequired,
};

SignUpConfirmForm.defaultProps = {
  displayCard: false,
  fields: {},
};

export default withTranslation(['auth'])(SignUpConfirmForm);
