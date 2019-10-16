import React, { useState, useCallback } from 'react';
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
import parseJwt from '@misakey/helpers/parseJwt';

import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';

import './contactButton.scss';

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
const useGetDatabox = (applicationID) => useCallback(
  () => listDataboxes()
    .then((databoxes) => databoxes.find((databox) => databox.producer_id === applicationID)),
  [applicationID],
);

const useOnMailTo = (mainDomain, mailProvider, dispatchContact, history, location) => useCallback(
  (token) => {
    const databoxURL = `${window.env.DATABOX_LOGIN_PAGE}#${token}`;
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
const ContactButton = (
  {
    mainDomain,
    applicationID,
    idToken,
    dpoEmail,
    contactedView,
    t,
    history,
    location,
    mailProvider,
    dispatchContact,
  },
) => {
  const [loading, setLoading] = useState(false);

  const getDatabox = useGetDatabox(applicationID);

  const onMailTo = useOnMailTo(mainDomain, mailProvider, dispatchContact, history, location);
  const onAccessRequest = useOnAccessRequest(onMailTo);
  const onAlreadyExists = useOnAlreadyExists(getDatabox);

  const databox = useAsync(getDatabox);

  const onClick = useOnClick(
    databox,
    onAccessRequest, onAlreadyExists,
    idToken, applicationID,
    setLoading,
  );

  if (loading) {
    return (
      <div className="contactButtonContainer">
        <CircularProgress
          className="contactLoad"
          size={30}
        />
      </div>
    );
  }

  if (contactedView) {
    return (
      <div className="contactButtonContainer">
        <Button color="secondary" onClick={onClick} className="contactButton">
          {t('resendEmail', 'resend email')}
        </Button>
      </div>
    );
  }

  if (!isEmpty(dpoEmail)) {
    return (
      <div className="contactButtonContainer">
        <Button
          variant="contained"
          color="secondary"
          onClick={onClick}
          className="contactButton"
        >
          {t('contact', 'CONTACT')}
        </Button>
      </div>
    );
  }
  return null;
};

ContactButton.propTypes = {
  idToken: PropTypes.string.isRequired,
  contactedView: PropTypes.bool,
  dpoEmail: PropTypes.string.isRequired,
  applicationID: PropTypes.string.isRequired,
  mainDomain: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,

  // CONNECT
  mailProvider: PropTypes.string,
  dispatchContact: PropTypes.func.isRequired,
};

ContactButton.defaultProps = {
  mailProvider: null,
  contactedView: false,
};

// CONNECT
const mapStateToProps = (state) => ({
  mailProvider: contactSelectors.getMailProviderPreferency(state),
});
const mapDispatchToProps = (dispatch) => ({
  dispatchContact: (databoxURL, mainDomain, mailProvider, history, location) => {
    dispatch(contactDataboxURL(databoxURL, mainDomain));
    const pathname = isNil(mailProvider) ? generatePath(
      routes.contact._,
      { mainDomain },
    ) : generatePath(
      routes.contact.preview,
      { mainDomain, provider: mailProvider },
    );
    history.push({ pathname, state: { from: location } });
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(
  withRouter(withTranslation()(ContactButton)),
);
