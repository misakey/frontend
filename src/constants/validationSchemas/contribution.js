import * as Yup from 'yup';
import errorTypes from '@misakey/ui/constants/errorTypes';

const { malformed, required } = errorTypes;

export const dpoEmailSchema = Yup.object().shape({
  dpoEmail: Yup.string().email(malformed).required(required),
  link: Yup.string().url(malformed),
});

export const privacyLinkSchema = Yup.object().shape({
  link: Yup.string().url(malformed).required(required),
});
