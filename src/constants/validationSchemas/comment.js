import * as Yup from 'yup';
import errorTypes from '@misakey/ui/constants/errorTypes';
import { DPO_COMMENTS } from 'constants/databox/comment';

// CONSTANTS
const { invalid, required } = errorTypes;

export const getOwnerCommentValidationSchema = (availableOptions) => Yup.object().shape({
  ownerComment: Yup
    .string()
    .required(required)
    .oneOf(availableOptions, invalid),
});

export const dpoCommentValidationSchema = Yup.object().shape({
  dpoComment: Yup
    .string()
    .required(required)
    .oneOf(DPO_COMMENTS, invalid),
});
