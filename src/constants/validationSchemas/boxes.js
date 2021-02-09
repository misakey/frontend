import * as Yup from 'yup';
import { IDENTIFIER, EMAIL_DOMAIN } from '@misakey/ui/constants/accessTypes';
import ACCESS_LEVELS from '@misakey/ui/constants/accessModes';
import { required, malformed, invalid } from '@misakey/ui/constants/errorTypes';
import routes from 'routes';
import { generatePath } from 'react-router-dom';
import isNil from '@misakey/helpers/isNil';
import { emailFieldValidation } from '@misakey/ui/constants/fieldValidations';

// CONSTANTS
const KEY_REGEX = '[A-Za-z0-9-_]+';

// HELPERS
const getInvitationUrl = (id) => (isNil(id)
  ? `${generatePath(routes.boxes._).replace(/[.*+?^${}()/|[\]\\]/g, '\\$&')}\\/[^#]+`
  : generatePath(routes.boxes.read._, { id }).replace(/[.*+?^${}()/|[\]\\]/g, '\\$&'));

const getInvitationUrlForBox = (id) => `${getInvitationUrl(id)}#${KEY_REGEX}`;

export const boxNameFieldValidationSchema = Yup.object().shape({
  name: Yup.string().min(1, malformed).max(50, malformed),
});

export const getBoxInvitationLinkFieldValidationSchema = (id, notFoundLocationString = '') => Yup.object().shape({
  invitationLink: Yup.string()
    .matches(getInvitationUrlForBox(id), { message: malformed })
    .notOneOf([notFoundLocationString], malformed)
    .required(required),
});

export const boxMessageValidationSchema = Yup.object().shape({
  message: Yup.string().trim().required(required),
});

export const boxEditMessageValidationSchema = Yup.object().shape({
  message: Yup.string().trim(),
});

export const boxDeletionDialogValidationSchema = (expected) => Yup.object().shape({
  confirm: Yup.string().equals([expected], invalid).required(invalid),
});

export const accessWhitelistValidationSchema = {
  accessWhitelist: Yup.array(Yup.object().shape({
    type: Yup.string().oneOf([IDENTIFIER, EMAIL_DOMAIN]),
    identifierValue: Yup.string().when('type', {
      is: IDENTIFIER,
      then: emailFieldValidation.schema,
      otherwise: emailFieldValidation.domain,
    }),
  })),
};

export const accessValidationSchema = Yup.object()
  .shape({
    accessWhitelist: accessWhitelistValidationSchema.accessWhitelist,
    accessLevel: Yup.string().oneOf(ACCESS_LEVELS).required(required),
  });


export const contactFieldsValidationSchema = Yup.object().shape({
  name: Yup.string().min(1, malformed).max(50, malformed),
  message: Yup.string(),
});
