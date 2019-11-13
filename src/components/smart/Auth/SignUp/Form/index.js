import React from 'react';
import { Form } from 'formik';
import PropTypes from 'prop-types';

import { FIELD_PROPTYPES } from 'components/dumb/Form/Fields';
import FormCard from 'components/dumb/Form/Card';
import AuthCardTitle from 'components/smart/Auth/Card/Title';
import AuthCardSubTitle from 'components/smart/Auth/Card/SubTitle';

import SignUpFormFields from 'components/smart/Auth/SignUp/Form/Fields';
import SignUpFormActions from 'components/smart/Auth/SignUp/Form/Actions';
import SignUpCardContent from 'components/smart/Auth/SignUp/Form/CardContent';

const SignUpForm = ({ displayCard, fields, ...formProps }) => {
  const Fields = <SignUpFormFields {...fields} />;
  const Actions = <SignUpFormActions {...formProps} />;

  const Card = displayCard && (
    <FormCard
      actions={Actions}
      title={<AuthCardTitle name="signUp" />}
      subtitle={<AuthCardSubTitle name="signUp" />}
    >
      <SignUpCardContent fields={Fields} />
    </FormCard>
  );

  return Card || (
    <Form>
      {Fields}
      {Actions}
    </Form>
  );
};

SignUpForm.propTypes = {
  displayCard: PropTypes.bool,
  fields: PropTypes.objectOf(FIELD_PROPTYPES),
};

SignUpForm.defaultProps = {
  displayCard: false,
  fields: {},
};

export default SignUpForm;
