import * as Yup from 'yup';
import errorTypes from '@misakey/ui/constants/errorTypes';
import parseUrlFromLocation from '@misakey/helpers/parseUrl/fromLocation';
import routes from 'routes';

// CONSTANTS
const { required, malformed } = errorTypes;
const UUID4_REGEX = '[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9a-fA-F]{12}';
const KEY_REGEX = '[A-Za-z0-9-_]+';

// HELPERS
const makeInvitationUrl = () => parseUrlFromLocation(`${routes.boxes.invitation}`).href.replace(/[.*+?^${}()/|[\]\\]/g, '\\$&');

export const boxNameFieldValidationSchema = Yup.object().shape({
  name: Yup.string().min(5, malformed).max(50, malformed).required(required),
});

export const boxInvitationLinkFieldValidationSchema = Yup.object().shape({
  invitationLink: Yup.string()
    .matches(`${makeInvitationUrl()}#${UUID4_REGEX}&${KEY_REGEX}`, { message: malformed })
    .required(required),
});
