import * as Yup from 'yup';
import errorTypes from '@misakey/ui/constants/errorTypes';

import { MAIN_DOMAIN_REGEX } from 'constants/regex';

const { malformed, required } = errorTypes;

export const dpoEmailSchema = Yup.object().shape({
  dpoEmail: Yup.string().email(malformed).required(required),
  link: Yup.string().url(malformed),
});

export const privacyLinkSchema = Yup.object().shape({
  link: Yup.string().url(malformed).required(required),
});

export const mainDomainDpoSchema = Yup.object().shape({
  mainDomain: Yup
    .string()
    .matches(MAIN_DOMAIN_REGEX, { message: malformed, excludeEmptyString: true })
    .required(required),
  dpoEmail: Yup.string().email(malformed).required(required),
});
