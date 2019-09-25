import * as Yup from 'yup';

// [http|https]://*;[http|https]://*
const ORIGIN_LIST_REGEX = /^(?:https?:\/\/[^;]+;)*?(?:https?:\/\/[^;]+)$/;

export const allowedOriginsForm = Yup.object().shape({
  allowedCorsOrigins: Yup
    .string()
    .matches(ORIGIN_LIST_REGEX, { message: 'malformed', excludeEmptyString: true }),
});

export const redirectUriForm = Yup.object().shape({
  redirectUris: Yup
    .string()
    .url('malformed'),
});
