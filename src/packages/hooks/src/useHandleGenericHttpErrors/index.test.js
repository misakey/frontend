import React from 'react';
import PropTypes from 'prop-types';
import HttpStatus from 'http-status-codes';

import { renderHook } from '@testing-library/react-hooks';

import { SnackbarProvider } from 'notistack';

import useHandleGenericHttpErrors from '.';

// MOCKS
const mockEnqueueSnackbar = jest.fn();

jest.mock('notistack', () => ({
  __esModule: true,
  ...jest.requireActual('notistack'),
  useSnackbar: () => ({
    enqueueSnackbar: mockEnqueueSnackbar,
  }),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key,
  }),
}));

// CONSTANTS
const ERROR_STATUSES = [
  [HttpStatus.BAD_REQUEST],
  [HttpStatus.CONFLICT],
  [HttpStatus.FORBIDDEN],
  [HttpStatus.INTERNAL_SERVER_ERROR],
  [HttpStatus.LOCKED],
  [HttpStatus.METHOD_NOT_ALLOWED],
  [HttpStatus.NOT_FOUND],
  [HttpStatus.PAYMENT_REQUIRED],
  [HttpStatus.REQUEST_TIMEOUT],
  [HttpStatus.REQUEST_TOO_LONG],
  [HttpStatus.SERVICE_UNAVAILABLE],
  [HttpStatus.TOO_MANY_REQUESTS],
  [HttpStatus.UNAUTHORIZED],
  [HttpStatus.UNSUPPORTED_MEDIA_TYPE],
];

const ERROR_STATUSES_EXCEPT_INTERNAL = [
  [HttpStatus.BAD_REQUEST],
  [HttpStatus.CONFLICT],
  [HttpStatus.FORBIDDEN],
  [HttpStatus.LOCKED],
  [HttpStatus.METHOD_NOT_ALLOWED],
  [HttpStatus.NOT_FOUND],
  [HttpStatus.PAYMENT_REQUIRED],
  [HttpStatus.REQUEST_TIMEOUT],
  [HttpStatus.REQUEST_TOO_LONG],
  [HttpStatus.SERVICE_UNAVAILABLE],
  [HttpStatus.TOO_MANY_REQUESTS],
  [HttpStatus.UNAUTHORIZED],
  [HttpStatus.UNSUPPORTED_MEDIA_TYPE],
];

// COMPONENTS
const Wrapper = ({ children }) => <SnackbarProvider>{children}</SnackbarProvider>;

Wrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

describe('testing useHandleGenericHttpErrors', () => {
  const { result: handleHttpErrors } = renderHook(
    () => useHandleGenericHttpErrors(),
    { wrapper: Wrapper },
  );

  beforeEach(() => {
    mockEnqueueSnackbar.mockClear();
  });

  it.each(ERROR_STATUSES)('should enqueueSnackbar for error with status %p',
    (status) => {
      const error = new Error();
      error.status = status;
      expect(handleHttpErrors.current(error)).toBe(true);
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith([`common:httpStatus.error.${status}`, 'common:anErrorOccurred'], { variant: 'error' });
    });

  it.each(ERROR_STATUSES_EXCEPT_INTERNAL)('should rethrow error when details is not empty, with status %p',
    (status) => {
      const error = new Error();
      error.status = status;
      error.details = { iam: 'notEmpty' };
      expect(() => handleHttpErrors.current(error)).toThrow();
      expect(mockEnqueueSnackbar).not.toHaveBeenCalled();
    });

  it('should enqueueSnackbar for internal error status with details', () => {
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const error = new Error();
    error.status = status;
    expect(handleHttpErrors.current(error)).toBe(true);
    expect(mockEnqueueSnackbar).toHaveBeenCalledWith([`common:httpStatus.error.${status}`, 'common:anErrorOccurred'], { variant: 'error' });
  });
});
