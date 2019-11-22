import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { withRouter, generatePath } from 'react-router-dom';

import API from '@misakey/api';
import routes from 'routes';

import { connect } from 'react-redux';
import { contactDataboxURL } from 'store/actions/screens/contact';
import { selectors as contactSelectors } from 'store/reducers/screens/contact';

import useAsync from '@misakey/hooks/useAsync';

import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';
import isEmpty from '@misakey/helpers/isEmpty';
import log from '@misakey/helpers/log';
import parseJwt from '@misakey/helpers/parseJwt';
import parseUrlFromLocation from '@misakey/helpers/parseUrl/fromLocation';

import withDialogConnect from 'components/smart/Dialog/Connect/with';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';


// HELPERS
const requestDataboxAccess = (id) => API.use(API.endpoints.application.box.requestAccess)
  .build({ id })
  .send();

const listDataboxes = () => API.use(API.endpoints.application.box.find)
  .build()
  .send();

const createDatabox = (payload) => API.use(API.endpoints.application.box.create)
  .build(null, payload)
  .send();

// HOOKS
const useGetDatabox = (applicationID, isAuthenticated) => useCallback(
  () => (!isAuthenticated
    ? Promise.resolve()
    : listDataboxes()
      .then((databoxes) => databoxes.find((databox) => databox.producer_id === applicationID))),
  [applicationID, isAuthenticated],
);

const useOnMailTo = (mainDomain, mailProvider, dispatchContact, history, location) => useCallback(
  (token) => {
    const databoxURL = parseUrlFromLocation(`${routes.requests}#${token}`).href;
    dispatchContact(databoxURL, mainDomain, mailProvider, history, location);
  },
  [mainDomain, mailProvider, dispatchContact, history, location],
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
  databox, onAccessRequest, onAlreadyExists, idToken, applicationID, setLoading,
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
    } else if (idToken) {
      const { sub } = parseJwt(idToken);
      const payload = {
        owner_id: sub,
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
  [databox, onAccessRequest, onAlreadyExists, idToken, applicationID, setLoading],
);


// COMPONENTS
const DialogConnectButton = withDialogConnect(Button);

const ContactButton = (
  {
    mainDomain,
    applicationID,
    idToken,
    dpoEmail,
    onContributionClick,
    contactedView,
    t,
    history,
    location,
    mailProvider,
    buttonProps,
    dialogConnectProps,
    children,
    isAuthenticated,
    dispatchContact,
    customAction,
  },
) => {
  const [loading, setLoading] = useState(false);

  const getDatabox = useGetDatabox(applicationID, isAuthenticated);

  const onMailTo = useOnMailTo(mainDomain, mailProvider, dispatchContact, history, location);
  const onAccessRequest = useOnAccessRequest(onMailTo);
  const onAlreadyExists = useOnAlreadyExists(getDatabox);

  const databox = useAsync(getDatabox, isAuthenticated);

  const onClick = useOnClick(
    databox,
    onAccessRequest, onAlreadyExists,
    idToken, applicationID,
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


  if (loading) {
    return (
      <CircularProgress
        className="contactLoad"
        size={30}
      />
    );
  }

  if (contactedView) {
    return (
      <Button
        color="secondary"
        onClick={isFunction(customAction) ? customAction : onClick}
        {...buttonProps}
      >
        {t('resendEmail', 'resend email')}
      </Button>
    );
  }

  if (!isEmpty(dpoEmail)) {
    return (
      <Button
        variant="contained"
        color="secondary"
        onClick={isFunction(customAction) ? customAction : onClick}
        {...buttonProps}
      >
        {dpoText}
      </Button>
    );
  }
  return (
    <DialogConnectButton
      onClick={onContributionClick}
      variant="contained"
      color="secondary"
      {...buttonProps}
      dialogConnectProps={dialogConnectProps}
    >
      {noDpoText}
    </DialogConnectButton>
  );
};

ContactButton.propTypes = {
  isAuthenticated: PropTypes.bool,
  idToken: PropTypes.string,
  buttonProps: PropTypes.object,
  dialogConnectProps: PropTypes.object,
  contactedView: PropTypes.bool,
  dpoEmail: PropTypes.string.isRequired,
  onContributionClick: PropTypes.func.isRequired,
  children: PropTypes.node,
  applicationID: PropTypes.string.isRequired,
  mainDomain: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  customAction: PropTypes.func,

  // CONNECT
  mailProvider: PropTypes.string,
  dispatchContact: PropTypes.func.isRequired,
};

ContactButton.defaultProps = {
  mailProvider: null,
  contactedView: false,
  buttonProps: {},
  dialogConnectProps: {},
  idToken: null,
  isAuthenticated: false,
  children: null,
  customAction: null,
};

// CONNECT
const mapStateToProps = (state) => ({
  mailProvider: contactSelectors.getMailProviderPreferency(state),
  idToken: state.auth.id,
  isAuthenticated: !!state.auth.token,
});
const mapDispatchToProps = (dispatch) => ({
  dispatchContact: (databoxURL, mainDomain, mailProvider, history, location) => {
    dispatch(contactDataboxURL(databoxURL, mainDomain));
    const pathname = isNil(mailProvider) ? generatePath(
      routes.citizen.application.contact._,
      { mainDomain },
    ) : generatePath(
      routes.citizen.application.contact.preview,
      { mainDomain, provider: mailProvider },
    );
    history.push({ pathname, state: { from: location } });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  withRouter(withTranslation('common')(ContactButton)),
);
