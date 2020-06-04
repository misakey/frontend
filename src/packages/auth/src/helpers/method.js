import { SECLEVEL_METHOD, EMAILED_CODE, METHOD_METADATA_KEY } from '@misakey/auth/constants/method';

export const makeSeclevelMethod = (seclevel) => SECLEVEL_METHOD[seclevel] || EMAILED_CODE;

export const makeMethodMetadata = (value, method) => {
  const metadataKey = METHOD_METADATA_KEY[method];
  return {
    [metadataKey]: value,
  };
};

export const makeSeclevelMetadata = (value, seclevel) => {
  const method = makeSeclevelMethod(seclevel);
  return makeMethodMetadata(value, method);
};
