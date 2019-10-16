import React from 'react';
import { Form } from 'formik';
import PropTypes from 'prop-types';

import { FIELD_PROPTYPES } from '@misakey/ui/Form/Fields';
import FormCard from '@misakey/ui/Form/Card';
import AuthCardTitle from 'components/smart/Auth/Card/Title';
import AuthCardSubTitle from 'components/smart/Auth/Card/SubTitle';

import SignUpConfirmFormFields from 'components/smart/Auth/SignUp/Confirm/Form/Fields';
import SignUpConfirmFormActions from 'components/smart/Auth/SignUp/Confirm/Form/Actions';
import SignUpConfirmCardContent from 'components/smart/Auth/SignUp/Confirm/Form/CardContent';

const SignUpConfirmForm = ({ displayCard, fields, values, ...formProps }) => {
  const Fields = <SignUpConfirmFormFields {...fields} />;
  const Actions = <SignUpConfirmFormActions values={values} {...formProps} />;

  const Card = displayCard && (
    <FormCard
      actions={Actions}
      title={<AuthCardTitle name="signUpConfirm" />}
      subtitle={<AuthCardSubTitle name="signUpConfirm" email={values.email} />}
    >
      <SignUpConfirmCardContent fields={Fields} />
    </FormCard>
  );

  return Card || (
    <Form>
      {Fields}
      {Actions}
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

export default SignUpConfirmForm;
