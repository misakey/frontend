import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { generatePath } from 'react-router-dom';

import { connect } from 'react-redux';
import ApplicationSchema from 'store/schemas/Application';

import { mailProviderPreferencyUpdate } from 'store/actions/screens/contact';

import routes from 'routes';

import pick from '@misakey/helpers/pick';
import prop from '@misakey/helpers/prop';
import isNil from '@misakey/helpers/isNil';

import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import ListMailProviders from 'components/smart/List/MailProviders';
import Navigation from '@misakey/ui/Navigation';


import 'components/screens/Citizen/Application/Contact/Providers/index.scss';

// CONSTANTS
const APP_CONTACT_PROPS = ['dpoEmail', 'name'];
// HELPERS
const getAppContactProvidersProps = pick(APP_CONTACT_PROPS);
const fromProp = prop('from');
const mainDomainProp = prop('mainDomain');

// HOOKS
const useOnChange = (dispatchUpdateMailProvider, history, params, search, state) => useCallback(
  (provider) => {
    const pathname = generatePath(
      routes.citizen.application.contact.preview,
      { provider, ...params },
    );
    dispatchUpdateMailProvider(provider, history, { pathname, search, state });
  },
  [dispatchUpdateMailProvider, history, params, search, state],
);

const useMailtoProps = (entity, databoxURL, t) => useMemo(
  () => {
    if (isNil(entity)) { return undefined; }
    const { dpoEmail, name } = getAppContactProvidersProps(entity);
    const subject = t('common:emailSubject');
    const body = t('common:emailBody', { databoxURL, dpoEmail, applicationName: name });
    return {
      mailto: dpoEmail,
      applicationName: name,
      subject,
      body,
    };
  },
  [entity, databoxURL, t],
);

const usePushPath = (state, entity) => useMemo(
  () => {
    const from = fromProp(state);
    const mainDomain = mainDomainProp(entity);
    if (isNil(from)) {
      return generatePath(routes.citizen.application.box, { mainDomain });
    }
    return from;
  },
  [state, entity],
);

// COMPONENTS
const ContactProviders = ({
  history,
  match: { params },
  location: { search, state },
  entity,
  databoxURL,
  dispatchUpdateMailProvider,
  t,
}) => {
  const mailtoProps = useMailtoProps(entity, databoxURL, t);

  const pushPath = usePushPath(state, entity);

  const onChange = useOnChange(dispatchUpdateMailProvider, history, params, search, state);

  return (
    <div className="ContactProviders">
      <Navigation
        pushPath={pushPath}
        showGoBack={false}
        toolbarProps={{ maxWidth: 'md' }}
        title={t('screens:contact.providers.title')}
      />
      <Container maxWidth="md">
        <Typography variant="body2" color="textSecondary" gutterBottom>
          {t('screens:contact.providers.subtitle')}
        </Typography>
        <ListMailProviders
          mailtoProps={mailtoProps}
          allowManual
          onChange={onChange}
        />
      </Container>
    </div>
  );
};

ContactProviders.propTypes = {
  match: PropTypes.shape({ params: PropTypes.object }).isRequired,
  location: PropTypes.shape({ search: PropTypes.string, state: PropTypes.object }).isRequired,
  history: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  entity: PropTypes.shape(ApplicationSchema.propTypes),
  databoxURL: PropTypes.string,
  // CONNECT
  dispatchUpdateMailProvider: PropTypes.func.isRequired,
};

ContactProviders.defaultProps = {
  entity: null,
  databoxURL: null,
};

// CONNECT
const mapDispatchToProps = (dispatch) => ({
  dispatchUpdateMailProvider: (mailProvider, history, pushObj) => {
    dispatch(mailProviderPreferencyUpdate(mailProvider));
    history.push(pushObj);
  },
});

export default connect(null, mapDispatchToProps)(withTranslation(['common', 'screens'])(ContactProviders));
