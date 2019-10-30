import * as Yup from 'yup';

// [http|https]://*;[http|https]://*
const ORIGIN_LIST_REGEX = /^(?:https?:\/\/[^;]+;)*?(?:https?:\/\/[^;]+)$/;

export const allowedOriginsValidationSchema = Yup.object().shape({
  allowedCorsOrigins: Yup
    .string()
    .matches(ORIGIN_LIST_REGEX, { message: 'malformed', excludeEmptyString: true }),
});

export const redirectUriValidationSchema = Yup.object().shape({
  redirectUris: Yup
    .string()
    .url('malformed'),
});
