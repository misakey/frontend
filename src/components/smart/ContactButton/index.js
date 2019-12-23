import React, { useState, useCallback, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { denormalize } from 'normalizr';
import { withTranslation } from 'react-i18next';
import { withRouter, generatePath } from 'react-router-dom';

import API from '@misakey/api';
import routes from 'routes';

import { connect } from 'react-redux';

import DataboxByProducerSchema from 'store/schemas/Databox/ByProducer';
import { contactDataboxURL } from 'store/actions/screens/contact';
import { receiveDataboxesByProducer } from 'store/actions/databox';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import log from '@misakey/helpers/log';
import head from '@misakey/helpers/head';
import prop from '@misakey/helpers/prop';
import compose from '@misakey/helpers/compose';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import parseUrlFromLocation from '@misakey/helpers/parseUrl/fromLocation';
import { redirectToApp } from 'helpers/plugin';
import { IS_PLUGIN } from 'constants/plugin';

import withDialogConnect from 'components/smart/Dialog/Connect/with';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';


// HELPERS
const databoxProp = compose(
  head,
  prop('databoxes'),
);

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

const useOnMailTo = (mainDomain, dispatchContact, history) => useCallback(
  (token) => {
    const databoxURL = parseUrlFromLocation(`${routes.requests}#${token}`).href;
    dispatchContact(databoxURL, mainDomain, history);
  },
  [mainDomain, dispatchContact, history],
);

const useOnAlreadyExists = (getDatabox) => useCallback(
  (onAccessRequest) => getDatabox().then((databox) => {
    if (!isNil(databox)) {
      return onAccessRequest(databox.id);
    }
    throw new Error('databox not found');
  }),
  [getDatabox],
);

const useOnAccessRequest = (onMailTo) => useCallback(
  (id) => requestDataboxAccess(id)
    .then((response) => onMailTo(response.token)),
  [onMailTo],
);

const useOnClick = (
  databox, onAccessRequest, onAlreadyExists, userId, applicationID, setLoading,
) => useCallback(
  () => {
    setLoading(true);
    if (!isNil(databox)) {
      onAccessRequest(databox.id)
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
          (response) => onAccessRequest(response.id),
          (error) => {
            if (error.httpStatus === 409) {
              onAlreadyExists(onAccessRequest)
                .catch((err) => {
                  log(err, 'error');
                })
                .finally(() => {
                  setLoading(false);
                });
            }
            log(error, 'error');
          },
        )
        .finally(() => {
          setLoading(false);
        });
    }
  },
  [databox, onAccessRequest, onAlreadyExists, userId, applicationID, setLoading],
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

  const databox = useMemo(
    () => databoxProp(databoxesByProducer),
    [databoxesByProducer],
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

  const onMailTo = useOnMailTo(mainDomain, dispatchContact, history);
  const onAccessRequest = useOnAccessRequest(onMailTo);
  const onAlreadyExists = useOnAlreadyExists(getDatabox);

  const onClick = useOnClick(
    databox,
    onAccessRequest, onAlreadyExists,
    userId, applicationID,
    setLoading,
  );

  const dpoText = useMemo(
    () => children || t('common:contact.label'),
    [children, t],
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
      redirectToApp(generatePath(routes.citizen.application._, { mainDomain }));
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
        variant="contained"
        color="secondary"
        onClick={onContributionClick}
        dialogConnectProps={dialogConnectProps}
        {...buttonProps}
      >
        {noDpoText}
      </DialogConnectButton>
    );
  }

  if (IS_PLUGIN) {
    return (
      <Button
        onClick={openInNewTab}
        variant="contained"
        color="secondary"
      >
        {t('screens:application.info.contact.goToApp')}
      </Button>
    );
  }

  return (
    <DialogConnectButton
      className={className}
      variant="contained"
      color="secondary"
      onClick={onClick}
      dialogConnectProps={dialogConnectProps}
      {...buttonProps}
    >
      {dpoText}
    </DialogConnectButton>
  );
};

ContactButton.propTypes = {
  buttonProps: PropTypes.object,
  dialogConnectProps: PropTypes.object,
  dpoEmail: PropTypes.string,
  onContributionClick: PropTypes.func.isRequired,
  children: PropTypes.node,
  applicationID: PropTypes.string,
  mainDomain: PropTypes.string.isRequired,
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
  dispatchContact: (databoxURL, mainDomain, history) => {
    dispatch(contactDataboxURL(databoxURL, mainDomain));
    const pathname = generatePath(
      routes.citizen.application.contact.preview,
      { mainDomain },
    );
    history.push({ pathname });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  withRouter(withTranslation('common')(ContactButton)),
);
