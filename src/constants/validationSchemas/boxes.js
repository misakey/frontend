import * as Yup from 'yup';
import errorTypes from '@misakey/ui/constants/errorTypes';
import parseUrlFromLocation from '@misakey/helpers/parseUrl/fromLocation';
import routes from 'routes';

// CONSTANTS
const { required, malformed } = errorTypes;
const KEY_REGEX = '[A-Za-z0-9-_]+';

// HELPERS
const getInvitationUrl = () => parseUrlFromLocation(`${routes.boxes.invitation}`).href.replace(/[.*+?^${}()/|[\]\\]/g, '\\$&');
const getInvitationUrlForBox = (id) => `${getInvitationUrl()}#${id}&${KEY_REGEX}`;

export const boxNameFieldValidationSchema = Yup.object().shape({
  name: Yup.string().min(5, malformed).max(50, malformed).required(required),
});

export const getBoxInvitationLinkFieldValidationSchema = (id) => Yup.object().shape({
  invitationLink: Yup.string()
    .matches(getInvitationUrlForBox(id), { message: malformed })
    .required(required),
});

export const boxMessageValidationSchema = Yup.object().shape({
  message: Yup.string().trim().required(required),
});
