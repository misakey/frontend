import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import pick from '@misakey/helpers/pick';
import head from '@misakey/helpers/head';
import isEmpty from '@misakey/helpers/isEmpty';
import { ERROR_KEYS, STEP } from './Form/constants';

export const getApiErrors = (error) => {
  const { details } = error;
  const fields = { ...objectToCamelCase(details) };
  const identifierErrors = pick(ERROR_KEYS[STEP.identifier], fields);
  const secretErrors = pick(ERROR_KEYS[STEP.secret], fields);
  return { identifierErrors, secretErrors };
};

// @FIXME: see with backend team to use consistent errors (need errors details as object)
export const handleLoginApiErrors = (error, { setStatus, setFieldTouched }) => {
  const { identifierErrors, secretErrors } = getApiErrors(error);

  if (!isEmpty(identifierErrors)) {
    const identifierError = head(Object.values(identifierErrors));
    setStatus({ [STEP.identifier]: identifierError });
    setFieldTouched([STEP.identifier], false);
  }
  if (!isEmpty(secretErrors)) {
    const secretError = head(Object.values(secretErrors));
    setStatus({ [STEP.secret]: secretError });
    setFieldTouched([STEP.secret], false);
  }
};
