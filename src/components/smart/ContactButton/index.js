import React, { useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { denormalize } from 'normalizr';
import { withTranslation } from 'react-i18next';
import { withRouter, generatePath } from 'react-router-dom';
import { useSnackbar } from 'notistack';

import API from '@misakey/api';
import routes from 'routes';
import errorTypes from 'constants/errorTypes';
import { CLOSED, DONE } from 'constants/databox/status';

import { connect } from 'react-redux';

import DataboxByProducerSchema from 'store/schemas/Databox/ByProducer';
import { contactDataboxURL } from 'store/actions/screens/contact';
import { receiveDataboxesByProducer } from 'store/actions/databox';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import log from '@misakey/helpers/log';
import head from '@misakey/helpers/head';
import prop from '@misakey/helpers/prop';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import parseUrlFromLocation from '@misakey/helpers/parseUrl/fromLocation';
import { redirectToApp } from 'helpers/plugin';
import { IS_PLUGIN } from 'constants/plugin';
import getNextSearch from 'helpers/getNextSearch';
import { getCurrentDatabox, getStatus } from 'helpers/databox';
import { hasDetailKey, getDetailPairsHead } from 'helpers/apiError';

import withDialogConnect from 'components/smart/Dialog/Connect/with';
import Button, { BUTTON_STANDINGS } from 'components/dumb/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

// CONSTANTS
const { conflict } = errorTypes;

// HELPERS
const databoxesProp = prop('databoxes');
const hasStatusError = hasDetailKey('status');

const canContact = (status) => status !== CLOSED && status !== DONE;

const requestDataboxAccess = (id) => API.use(API.endpoints.application.box.requestAccess)
  .build({ id })
  .send();

const listDataboxes = (applicationID) => API.use(API.endpoints.application.box.find)
  .build(null, null, { producer_id: applicationID })
  .send();

const createDatabox = (payload) => API.use(API.endpoints.application.box.create)
  .build(null, payload)
  .send();

// HOOKS
const useGetDatabox = (
  applicationID,
  isAuthenticated,
  dispatchReceiveDataboxesByProducer,
) => useCallback(
  () => ((!isAuthenticated || isEmpty(applicationID))
    ? Promise.resolve()
    : listDataboxes(applicationID).then((response) => {
      const databoxes = response.map(objectToCamelCase);
      dispatchReceiveDataboxesByProducer(applicationID, databoxes);
      return head(databoxes);
    })),
  [applicationID, isAuthenticated, dispatchReceiveDataboxesByProducer],
);

const useOnMailTo = (mainDomain, dispatchContact, history, search) => useCallback(
  (token, isRecontact) => {
    const databoxURL = parseUrlFromLocation(`${routes.requests}#${token}`).href;
    const nextSearch = isRecontact === true
      ? getNextSearch(search, new Map([['recontact', true]]))
      : search;
    dispatchContact(databoxURL, mainDomain, nextSearch, history);
  },
  [mainDomain, dispatchContact, history, search],
);

const useOnAlreadyExists = (getDatabox) => useCallback(
  (onAccessRequest) => getDatabox().then((databox) => {
    if (!isNil(databox)) {
      return onAccessRequest(databox, true);
    }
    throw new Error('databox not found');
  }),
  [getDatabox],
);

const useOnAccessRequest = (onMailTo) => useCallback(
  (databox, isRecontact = false) => requestDataboxAccess(databox.id)
    .then((response) => onMailTo(response.token, isRecontact)),
  [onMailTo],
);

const useOnClick = (
  databox, onAccessRequest, onAlreadyExists, userId, applicationID, setLoading, enqueueSnackbar, t,
) => useCallback(
  () => {
    setLoading(true);
    if (!isNil(databox)) {
      onAccessRequest(databox, true)
        .catch((error) => {
          log(error, 'error');
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (userId) {
      const payload = {
        owner_id: userId,
        producer_id: applicationID,
      };
      createDatabox(payload)
        .then(
          (response) => onAccessRequest(response),
          (error) => {
            if (error.code === conflict) {
              if (hasStatusError(error)) {
                return onAlreadyExists(onAccessRequest)
                  .catch((err) => {
                    log(err, 'error');
                  });
              }
              const [key, errorType] = getDetailPairsHead(error);
              if (errorType === conflict) {
                return enqueueSnackbar(t(`common:databox.errors.conflict.open.${key}`), { variant: 'error' });
              }
            }
            log(error, 'error');
            return enqueueSnackbar(t('common:httpStatus.error.default'), { variant: 'error' });
          },
        )
        .finally(() => {
          setLoading(false);
        });
    }
  },
  [
    databox,
    onAccessRequest,
    onAlreadyExists,
    userId,
    applicationID,
    setLoading,
    enqueueSnackbar,
    t,
  ],
);


// COMPONENTS
const DialogConnectButton = withDialogConnect(Button);

const ContactButton = (
  {
    mainDomain,
    applicationID,
    userId,
    dpoEmail,
    onContributionClick,
    t,
    history,
    location: { search },
    buttonProps,
    dialogConnectProps,
    children,
    isAuthenticated,
    databoxesByProducer,
    dispatchContact,
    dispatchReceiveDataboxesByProducer,
    className,
  },
) => {
  const [loading, setLoading] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const databox = useMemo(
    () => {
      const databoxes = (databoxesProp(databoxesByProducer) || []);
      return getCurrentDatabox(databoxes, true);
    },
    [databoxesByProducer],
  );

  const status = useMemo(
    () => getStatus(databox),
    [databox],
  );

  const disabled = useMemo(
    () => !isNil(status) && !canContact(status),
    [status],
  );

  const shouldFetch = useMemo(
    () => !isNil(applicationID) && isNil(databox),
    [applicationID, databox],
  );

  const getDatabox = useGetDatabox(
    applicationID,
    isAuthenticated,
    dispatchReceiveDataboxesByProducer,
  );

  const onMailTo = useOnMailTo(mainDomain, dispatchContact, history, search);
  const onAccessRequest = useOnAccessRequest(onMailTo);
  const onAlreadyExists = useOnAlreadyExists(getDatabox);

  const onClick = useOnClick(
    databox,
    onAccessRequest, onAlreadyExists,
    userId, applicationID,
    setLoading,
    enqueueSnackbar,
    t,
  );

  const contactText = useMemo(
    () => {
      if (isNil(status)) {
        return t('common:contact.send');
      }
      return t('common:contact.resend');
    },
    [status, t],
  );

  const dpoText = useMemo(
    () => children || contactText,
    [children, contactText],
  );

  const noDpoText = useMemo(
    () => (isAuthenticated
      ? t('common:contact.dpo')
      : dpoText),
    [isAuthenticated, dpoText, t],
  );

  const openInNewTab = useCallback(
    () => {
      // @FIXME: remove when contact app in plugin is implemented
      const path = isNil(mainDomain)
        ? null
        : generatePath(routes.citizen.application._, { mainDomain });
      redirectToApp(path);
    },
    [mainDomain],
  );

  useEffect(
    () => {
      if (shouldFetch) {
        setLoading(true);
        getDatabox().finally(
          () => { setLoading(false); },
        );
      }
    },
    [getDatabox, shouldFetch],
  );

  if (loading) {
    return (
      <CircularProgress
        className="contactLoad"
        size={30}
      />
    );
  }

  if (isEmpty(dpoEmail)) {
    return (
      <DialogConnectButton
        className={className}
        onClick={onContributionClick}
        text={noDpoText}
        dialogConnectProps={dialogConnectProps}
        standing={BUTTON_STANDINGS.MAIN}
        {...buttonProps}
      />
    );
  }

  if (IS_PLUGIN) {
    return (
      <Button
        onClick={openInNewTab}
        text={t('screens:application.info.contact.goToApp')}
        standing={BUTTON_STANDINGS.MAIN}
        {...buttonProps}
      />
    );
  }

  return (
    <DialogConnectButton
      className={className}
      onClick={onClick}
      disabled={disabled}
      text={dpoText}
      dialogConnectProps={dialogConnectProps}
      standing={BUTTON_STANDINGS.MAIN}
      {...buttonProps}
    />
  );
};

ContactButton.propTypes = {
  buttonProps: PropTypes.object,
  dialogConnectProps: PropTypes.object,
  dpoEmail: PropTypes.string,
  onContributionClick: PropTypes.func.isRequired,
  children: PropTypes.node,
  applicationID: PropTypes.string,
  mainDomain: PropTypes.string,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  className: PropTypes.string,

  // CONNECT
  isAuthenticated: PropTypes.bool,
  userId: PropTypes.string,
  databoxesByProducer: PropTypes.shape(DataboxByProducerSchema.propTypes),
  dispatchContact: PropTypes.func.isRequired,
  dispatchReceiveDataboxesByProducer: PropTypes.func.isRequired,
};

ContactButton.defaultProps = {
  dpoEmail: '',
  buttonProps: {},
  dialogConnectProps: {},
  databoxesByProducer: null,
  userId: null,
  isAuthenticated: false,
  applicationID: null,
  mainDomain: null,
  children: null,
  className: '',
};

// CONNECT
const mapStateToProps = (state, ownProps) => {
  const { applicationID } = ownProps;
  return {
    databoxesByProducer: isNil(applicationID)
      ? null
      : denormalize(
        applicationID,
        DataboxByProducerSchema.entity,
        state.entities,
      ),
    userId: state.auth.userId,
    isAuthenticated: !!state.auth.token,
  };
};

const mapDispatchToProps = (dispatch) => ({
  dispatchReceiveDataboxesByProducer: (producerId, databoxes) => dispatch(
    receiveDataboxesByProducer({ producerId, databoxes }),
  ),
  dispatchContact: (databoxURL, mainDomain, search, history) => {
    dispatch(contactDataboxURL(databoxURL, mainDomain));
    const pathname = generatePath(
      routes.citizen.application.contact.preview,
      { mainDomain },
    );
    history.push({ pathname, search });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  withRouter(withTranslation('common')(ContactButton)),
);
