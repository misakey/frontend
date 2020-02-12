import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { generatePath, useLocation } from 'react-router-dom';
import ApplicationSchema from 'store/schemas/Application';
import DataboxSchema from 'store/schemas/Databox';

import routes from 'routes';

import prop from '@misakey/helpers/prop';
import isNil from '@misakey/helpers/isNil';
import getSearchParams from '@misakey/helpers/getSearchParams';
import mapDates from '@misakey/helpers/mapDates';
import ContactProvidersBlock from 'components/smart/Contact/Providers';
import Navigation from 'components/dumb/Navigation';

// HELPERS
const mainDomainProp = prop('mainDomain');

// HOOKS
const useMailtoProps = (dpoEmail, name, subject, body) => useMemo(
  () => (isNil(dpoEmail) ? undefined : ([{
    mailto: dpoEmail,
    applicationName: name,
    subject,
    body,
  }])),
  [dpoEmail, name, subject, body],
);

const useDoneTo = (entity) => useMemo(
  () => {
    const mainDomain = mainDomainProp(entity);
    return generatePath(routes.citizen.application.vault, { mainDomain });
  },
  [entity],
);

// COMPONENTS
const ContactProviders = ({
  history,
  entity,
  databoxURL,
  databox,
  t,
}) => {
  const { dpoEmail, name, mainDomain } = useMemo(
    () => (isNil(entity) ? {} : entity),
    [entity],
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
    () => t(
      `common:emailBody.${mailType}`,
      { dpoEmail, databoxURL, mainDomain, ...mapDates(databox) },
    ),
    [databoxURL, databox, dpoEmail, mailType, mainDomain, t],
  );

  const mailtoProps = useMailtoProps(dpoEmail, name, subject, body);

  return (
    <div className="ContactProviders">
      <Navigation
        history={history}
        toolbarProps={{ maxWidth: 'md' }}
        title={t('common:contact.providers.title')}
      />
      <ContactProvidersBlock
        doneTo={doneTo}
        mailtoProps={mailtoProps}
      />
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
};

ContactProviders.defaultProps = {
  entity: null,
  databoxURL: null,
  databox: null,
};

export default (withTranslation(['common', 'screens'])(ContactProviders));
