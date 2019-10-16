import * as Yup from 'yup';
import { malformed, required } from '@misakey/ui/constants/errorTypes';

export const dpoEmailSchema = Yup.object().shape({
  dpoEmail: Yup.string().email(malformed).required(required),
  link: Yup.string().url(malformed),
});

export const privacyLinkSchema = Yup.object().shape({
  link: Yup.string().url(malformed).required(required),
});
