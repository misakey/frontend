import useWithErrorsMapper from '@misakey/hooks/useWithErrorsMapper';

import TextFieldStandard from '@misakey/ui/TextField/Standard';
import withErrors from '@misakey/ui/Form/Field/withErrors';

// @UNUSED
const FormFieldTextStandard = (props) => {
  const textFieldProps = useWithErrorsMapper(props);

  return (
    <TextFieldStandard
      {...textFieldProps}
    />
  );
};

export default withErrors(FormFieldTextStandard);
