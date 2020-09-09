import * as Yup from 'yup';
import { MAX_FILE_SIZE } from 'constants/file/size';
import errorTypes from '@misakey/ui/constants/errorTypes';
import routes from 'routes';
import { generatePath } from 'react-router-dom';
import isString from '@misakey/helpers/isString';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import { mainDomainFieldValidation, emailFieldValidation } from 'constants/fieldValidations';

// CONSTANTS
const { required, malformed, max, invalid } = errorTypes;
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

export const boxFileUploadValidationSchema = Yup.object().shape({
  files: Yup.array(
    Yup.mixed()
      .test('fileSize', 'size', (file) => isNil(file) || isNil(file.blob) || file.blob.size <= MAX_FILE_SIZE)
      .test('fileExtension', 'extension', (file) => isNil(file) || isNil(file.blob) || (isString(file.blob.name) && file.blob.name.split('.').length > 1))
      .test('fileName', 'name', (file) => isNil(file) || isNil(file.blob) || (isString(file.blob.name) && !isEmpty(file.blob.name.split('.').shift()))),
  ).required(required)
    .max(10, max),
});

export const boxDeletionDialogValidationSchema = (expected) => Yup.object().shape({
  confirm: Yup.string().equals([expected], invalid).required(invalid),
});

export const accessWhitelistValidationSchema = {
  identifier: Yup.object().shape({
    accessWhitelistIdentifier: emailFieldValidation.schema,
  }),
  emailDomain: Yup.object().shape({
    accessWhitelistEmailDomain: mainDomainFieldValidation.schema,
  }),
};
