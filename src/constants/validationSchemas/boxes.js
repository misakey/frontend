import * as Yup from 'yup';
import { IDENTIFIER, EMAIL_DOMAIN } from '@misakey/ui/constants/accessTypes';
import ACCESS_LEVELS, { LIMITED } from '@misakey/ui/constants/accessLevels';
import { required, malformed, invalid } from '@misakey/ui/constants/errorTypes';
import routes from 'routes';
import { generatePath } from 'react-router-dom';
import isNil from '@misakey/helpers/isNil';
import { emailFieldValidation } from 'constants/fieldValidations';

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

export const getBoxInvitationLinkFieldValidationSchema = (id) => Yup.object().shape({
  invitationLink: Yup.string()
    .matches(getInvitationUrlForBox(id), { message: malformed })
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
  accessWhitelist: Yup.object().shape({
    type: Yup.string().oneOf([IDENTIFIER, EMAIL_DOMAIN]),
    identifier: Yup.object().when('type',
      (type, schema) => (type === IDENTIFIER
        ? schema.shape({
          value: emailFieldValidation.schema,
        })
        : schema.shape({
          value: emailFieldValidation.domain,
        }))),
  }).nullable(),
};

export const makeAccessValidationSchema = ({ isEmptyMembersNotInWhitelist } = {}) => Yup.object()
  .shape({
    accessWhitelist: accessWhitelistValidationSchema.accessWhitelist
      .when(['accessLevel'], (accessLevel, schema) => {
        const noMembers = isEmptyMembersNotInWhitelist === true
      || isNil(isEmptyMembersNotInWhitelist);
        const isRequired = accessLevel === LIMITED && noMembers;
        return isRequired
          ? schema.required(required)
          : schema;
      }),
    accessLevel: Yup.string().oneOf(ACCESS_LEVELS).required(required),
  });


export const contactFieldsValidationSchema = Yup.object().shape({
  name: Yup.string().min(1, malformed).max(50, malformed),
  message: Yup.string(),
});
