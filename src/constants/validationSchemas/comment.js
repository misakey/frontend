import * as Yup from 'yup';
import errorTypes from 'constants/errorTypes';
import { OWNER_COMMENTS } from 'constants/databox/comment';

// CONSTANTS
const { invalid, required } = errorTypes;

export const ownerCommentValidationSchema = Yup.object().shape({
  ownerComment: Yup
    .string()
    .required(required)
    .oneOf(OWNER_COMMENTS, invalid),
});
