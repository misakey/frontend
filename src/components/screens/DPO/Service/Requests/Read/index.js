import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { generatePath } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import routes from 'routes';
import DataboxSchema from 'store/schemas/Databox';

import prop from '@misakey/helpers/prop';
import isNil from '@misakey/helpers/isNil';
import omit from '@misakey/helpers/omit';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import ScreenAction from 'components/dumb/Screen/Action';
import RequestSummary from 'components/dumb/Request/Summary';
import RequestEvents from 'components/dumb/Request/Events';
import DpoRequestReadActions from 'components/screens/DPO/Service/Requests/Read/Actions';
import withRequestDetails from 'components/smart/withRequestDetails';

// CONSTANTS
const INTERNAL_PROPS = ['tReady', 'isAuthenticated', 'onDelete', 'isLoading'];

const ownerProp = prop('owner');
const ownerNameProp = prop('displayName');

function ServiceRequestsRead({
  match: { params }, request, isFetching, appBarProps, t, ...rest
}) {
  const homePath = useMemo(
    () => generatePath(routes.dpo.service.requests._, { mainDomain: params.mainDomain }),
    [params],
  );

  const navigationProps = useMemo(
    () => ({ noWrap: true, homePath }),
    [homePath],
  );

  const owner = useMemo(
    () => ownerProp(request),
    [request],
  );

  const ownerName = useMemo(
    () => ownerNameProp(owner),
    [owner],
  );

  const state = useMemo(
    () => ({ isLoading: isFetching.request }),
    [isFetching.request],
  );

  return (
    <ScreenAction
      state={state}
      appBarProps={appBarProps}
      {...omit(rest, INTERNAL_PROPS)}
      title={t('dpo:requests.read.title', { ownerName })}
      hideTitle
      navigation={(
        <RequestSummary
          request={request}
          isFetching={isFetching.logs || isFetching.blobs}
          margin="auto"
        />
      )}
      navigationProps={navigationProps}
    >
      <Container component={Box} maxWidth="md" display="flex" flexDirection="column" flexGrow={1} justifyContent="space-between">
        <RequestEvents
          request={request}
          isFetching={isFetching.logs || isFetching.blobs}
        />
        {!isNil(request) && (
          <DpoRequestReadActions
            request={request}
            isFetching={isFetching.request}
          />
        )}
      </Container>
    </ScreenAction>
  );
}

ServiceRequestsRead.propTypes = {
  request: PropTypes.shape(DataboxSchema.propTypes),

  isFetching: PropTypes.shape({
    request: PropTypes.bool,
    logs: PropTypes.bool,
    blobs: PropTypes.bool,
  }),
  appBarProps: PropTypes.object,

  history: PropTypes.object.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({ databoxId: PropTypes.string, mainDomain: PropTypes.string }),
  }).isRequired,
  t: PropTypes.func.isRequired,
};

ServiceRequestsRead.defaultProps = {
  appBarProps: null,
  request: null,
  isFetching: {
    request: false,
    logs: false,
    blobs: false,
  },
};

export default withRequestDetails()(withTranslation(['common', 'dpo'])(
  ServiceRequestsRead,
));
