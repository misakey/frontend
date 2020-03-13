import * as Yup from 'yup';
import {
  linkFieldValidation, emailFieldValidation, mainDomainFieldValidation,
} from 'constants/fieldValidations';

export const dpoEmailSchema = Yup.object().shape({
  dpoEmail: emailFieldValidation.schema,
  link: linkFieldValidation.optionalSchema,
});

export const privacyLinkSchema = Yup.object().shape({
  link: linkFieldValidation.schema,
});

export const createApplicationDpoValidationSchema = Yup.object().shape({
  mainDomain: mainDomainFieldValidation.schema,
  dpoEmail: emailFieldValidation.schema,
});

export const createApplicationCitizenValidationSchema = Yup.object().shape({
  mainDomain: mainDomainFieldValidation.schema,
});
