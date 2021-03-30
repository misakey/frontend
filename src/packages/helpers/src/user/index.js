import pick from '@misakey/helpers/pick';
import compose from '@misakey/helpers/compose';

// CONSTANTS
const USER_PROPS = ['avatarUrl', 'displayName', 'id'];

// HELPERS
export const pickUserProps = pick(USER_PROPS);

export const pickUserPropsIdentifierValue = pick([...USER_PROPS, 'identifierValue']);

export const pickUsersPropsRemapIdentifier = compose(
  ({ identifierValue, ...rest }) => ({ ...rest, identifier: identifierValue }),
  pickUserPropsIdentifierValue,
);
