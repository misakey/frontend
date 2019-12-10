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
import isEmpty from '@misakey/helpers/isEmpty';
import log from '@misakey/helpers/log';
import head from '@misakey/helpers/head';
import parseUrlFromLocation from '@misakey/helpers/parseUrl/fromLocation';
import { redirectToApp } from 'helpers/plugin';
import { IS_PLUGIN } from 'constants/plugin';

import withDialogConnect from 'components/smart/Dialog/Connect/with';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';


// HELPERS
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
const useGetDatabox = (applicationID, isAuthenticated) => useCallback(
  () => ((!isAuthenticated || isEmpty(applicationID))
    ? Promise.resolve()
    : listDataboxes(applicationID).then((databoxes) => head(databoxes))),
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
    location,
    mailProvider,
    buttonProps,
    dialogConnectProps,
    children,
    isAuthenticated,
    dispatchContact,
    className,
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
  isAuthenticated: PropTypes.bool,
  userId: PropTypes.string,
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
  mailProvider: PropTypes.string,
  dispatchContact: PropTypes.func.isRequired,
};

ContactButton.defaultProps = {
  dpoEmail: '',
  mailProvider: null,
  buttonProps: {},
  dialogConnectProps: {},
  userId: null,
  isAuthenticated: false,
  applicationID: null,
  children: null,
  className: '',
};

// CONNECT
const mapStateToProps = (state) => ({
  mailProvider: contactSelectors.getMailProviderPreferency(state),
  userId: state.auth.userId,
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
