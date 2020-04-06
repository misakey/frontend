import prop from '@misakey/helpers/prop';
import head from '@misakey/helpers/head';
import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';
import compose from '@misakey/helpers/compose';


// HELPERS
const idProp = prop('id');

const getFirstUserEmail = (userEmails) => head(userEmails || []);

const getMainUserEmail = (email, userEmails) => {
  if (isEmpty(email)) {
    return getFirstUserEmail(userEmails);
  }
  const mainUserEmail = (userEmails || [])
    .find(({ email: userEmailMail }) => userEmailMail === email);

  return isNil(mainUserEmail)
    ? getFirstUserEmail(userEmails)
    : mainUserEmail;
};

export const getFirstUserEmailId = compose(
  idProp,
  getFirstUserEmail,
);

// @UNUSED might prove useful ?
export const getMainUserEmaillId = compose(
  idProp,
  getMainUserEmail,
);
