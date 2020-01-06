import * as Yup from 'yup';
import errorTypes from 'constants/errorTypes';
import { OWNER_COMMENTS, DPO_COMMENTS } from 'constants/databox/comment';

// CONSTANTS
const { invalid, required } = errorTypes;

export const ownerCommentValidationSchema = Yup.object().shape({
  ownerComment: Yup
    .string()
    .required(required)
    .oneOf(OWNER_COMMENTS, invalid),
});

export const dpoCommentValidationSchema = Yup.object().shape({
  dpoComment: Yup
    .string()
    .required(required)
    .oneOf(DPO_COMMENTS, invalid),
});
