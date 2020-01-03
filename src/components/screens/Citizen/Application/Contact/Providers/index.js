import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { generatePath, Link, useLocation } from 'react-router-dom';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { connect } from 'react-redux';

import ApplicationSchema from 'store/schemas/Application';
import DataboxSchema from 'store/schemas/Databox';
import { mailProviderPreferencyUpdate } from 'store/actions/screens/contact';

import routes from 'routes';

import prop from '@misakey/helpers/prop';
import isNil from '@misakey/helpers/isNil';
import getSearchParams from '@misakey/helpers/getSearchParams';
import mapDates from 'helpers/mapDates';

import Container from '@material-ui/core/Container';
import Subtitle from 'components/dumb/Typography/Subtitle';
import ListMailProviders from 'components/smart/List/MailProviders';
import Navigation from 'components/dumb/Navigation';
import BoxControls from 'components/dumb/Box/Controls';
import BoxMessage from 'components/dumb/Box/Message';

// HELPERS
const mainDomainProp = prop('mainDomain');

// HOOKS
const useMailtoProps = (dpoEmail, name, subject, body) => useMemo(
  () => (isNil(dpoEmail) ? undefined : ({
    mailto: dpoEmail,
    applicationName: name,
    subject,
    body,
  })),
  [dpoEmail, name, subject, body],
);

const useDoneTo = (entity) => useMemo(
  () => {
    const mainDomain = mainDomainProp(entity);
    return generatePath(routes.citizen.application.vault, { mainDomain });
  },
  [entity],
);

const useStyles = makeStyles(() => ({
  subtitleRoot: {
    whiteSpace: 'pre-wrap',
  },
}));

// COMPONENTS
const ContactProviders = ({
  history,
  entity,
  databoxURL,
  databox,
  dispatchUpdateMailProvider,
  t,
}) => {
  const classes = useStyles();

  const [contacted, setContacted] = useState(false);

  const { dpoEmail, name } = useMemo(
    () => (isNil(entity) ? {} : entity),
    [entity],
  );
  const subtitle = useMemo(
    () => t('screens:contact.providers.subtitle'),
    [t],
  );
  const mailReminder = useMemo(
    () => t('screens:contact.providers.mailReminder', { applicationName: name }),
    [name, t],
  );

  const doneTo = useDoneTo(entity);

  const { search } = useLocation();
  const mailType = useMemo(
    () => getSearchParams(search).mailType,
    [search],
  );

  const subject = useMemo(
    () => t('common:emailSubject'),
    [t],
  );
  const body = useMemo(
    () => t(`common:emailBody.${mailType}`, { dpoEmail, databoxURL, ...mapDates(databox) }),
    [databoxURL, databox, dpoEmail, mailType, t],
  );

  const mailtoProps = useMailtoProps(dpoEmail, name, subject, body);

  const onChange = useCallback(
    (provider) => {
      if (!isNil(provider)) {
        dispatchUpdateMailProvider(provider);
      }
      setContacted(true);
    },
    [dispatchUpdateMailProvider, setContacted],
  );

  const onReset = useCallback(
    () => {
      dispatchUpdateMailProvider(null);
      setContacted(false);
    },
    [dispatchUpdateMailProvider, setContacted],
  );

  const primary = useMemo(
    () => (contacted ? {
      component: Link,
      to: doneTo,
      text: t('common:done'),
    } : null),
    [contacted, doneTo, t],
  );

  const secondary = useMemo(
    () => ((contacted) ? {
      onClick: onReset,
      text: t('common:retry'),
    } : null),
    [contacted, onReset, t],
  );

  return (
    <div className="ContactProviders">
      <Navigation
        history={history}
        toolbarProps={{ maxWidth: 'md' }}
        title={t('screens:contact.providers.title')}
      />
      <Container maxWidth="md">
        <Subtitle>
          {subtitle}
        </Subtitle>
        <BoxMessage text={mailReminder} my={2} type="info" classes={{ root: classes.subtitleRoot }} />
        <ListMailProviders
          mailtoProps={mailtoProps}
          disabled={contacted}
          allowManual
          onChange={onChange}
        />
        <BoxControls
          mt={2}
          primary={primary}
          secondary={secondary}
        />
      </Container>
    </div>
  );
};

ContactProviders.propTypes = {
  match: PropTypes.shape({ params: PropTypes.object }).isRequired,
  history: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  entity: PropTypes.shape(ApplicationSchema.propTypes),
  databoxURL: PropTypes.string,
  databox: PropTypes.shape(DataboxSchema.propTypes),
  // CONNECT
  dispatchUpdateMailProvider: PropTypes.func.isRequired,
};

ContactProviders.defaultProps = {
  entity: null,
  databoxURL: null,
  databox: null,
};

// CONNECT
const mapDispatchToProps = (dispatch) => ({
  dispatchUpdateMailProvider: (mailProvider) => {
    dispatch(mailProviderPreferencyUpdate(mailProvider));
  },
});

export default connect(null, mapDispatchToProps)(withTranslation(['common', 'screens'])(ContactProviders));
