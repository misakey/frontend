import React from 'react';
import { Form } from 'formik';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { FIELD_PROPTYPES } from 'components/dumb/Form/Fields';
import FormCard from 'components/dumb/Form/Card';
import AuthCardTitle from 'components/smart/Auth/Card/Title';
import AuthCardSubTitle from 'components/smart/Auth/Card/SubTitle';

import SignUpFormFields from 'components/smart/Auth/SignUp/Form/Fields';
import SignUpFormActions, { useSignUpSecondaryAction, useSignUpPrimaryAction } from 'components/smart/Auth/SignUp/Form/Actions';
import SignUpCardContent from 'components/smart/Auth/SignUp/Form/CardContent';

const SignUpForm = ({ displayCard, fields, t, ...formProps }) => {
  const Fields = <SignUpFormFields {...fields} />;
  const signUpFormSecondaryAction = useSignUpSecondaryAction(t);
  const signUpFormPrimaryAction = useSignUpPrimaryAction({ ...formProps }, t);
  const Card = displayCard && (
    <FormCard
      primary={signUpFormPrimaryAction}
      secondary={signUpFormSecondaryAction}
      title={<AuthCardTitle name="signUp" />}
      subtitle={<AuthCardSubTitle name="signUp" />}
    >
      <SignUpCardContent fields={Fields} />
    </FormCard>
  );

  return Card || (
    <Form>
      {Fields}
      <SignUpFormActions {...formProps} t={t} />
    </Form>
  );
};

SignUpForm.propTypes = {
  displayCard: PropTypes.bool,
  t: PropTypes.func.isRequired,
  fields: PropTypes.objectOf(FIELD_PROPTYPES),
};

SignUpForm.defaultProps = {
  displayCard: false,
  fields: {},
};

export default withTranslation(['auth'])(SignUpForm);
