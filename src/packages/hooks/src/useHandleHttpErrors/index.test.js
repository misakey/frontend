import PropTypes from 'prop-types';
import { StatusCodes } from 'http-status-codes';

import { renderHook } from '@testing-library/react-hooks';

import { SnackbarProvider } from 'notistack';

import useHandleHttpErrors from '.';

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
  [StatusCodes.BAD_REQUEST],
  [StatusCodes.CONFLICT],
  [StatusCodes.FORBIDDEN],
  [StatusCodes.INTERNAL_SERVER_ERROR],
  [StatusCodes.LOCKED],
  [StatusCodes.METHOD_NOT_ALLOWED],
  [StatusCodes.NOT_FOUND],
  [StatusCodes.PAYMENT_REQUIRED],
  [StatusCodes.REQUEST_TIMEOUT],
  [StatusCodes.REQUEST_TOO_LONG],
  [StatusCodes.SERVICE_UNAVAILABLE],
  [StatusCodes.TOO_MANY_REQUESTS],
  [StatusCodes.UNAUTHORIZED],
  [StatusCodes.UNSUPPORTED_MEDIA_TYPE],
];

// COMPONENTS
const Wrapper = ({ children }) => <SnackbarProvider>{children}</SnackbarProvider>;

Wrapper.propTypes = {
  children: PropTypes.node.isRequired,
};

describe('testing useHandleHttpErrors', () => {
  const { result: handleHttpErrors } = renderHook(
    () => useHandleHttpErrors(),
    { wrapper: Wrapper },
  );

  beforeEach(() => {
    mockEnqueueSnackbar.mockClear();
  });

  it.each(ERROR_STATUSES)('should enqueueSnackbar for error with status %p',
    (status) => {
      const error = new Error();
      error.status = status;
      handleHttpErrors.current(error);
      expect(mockEnqueueSnackbar).toHaveBeenCalledWith([`common:httpStatus.error.${status}`, 'common:anErrorOccurred'], { variant: 'warning' });
    });
});
