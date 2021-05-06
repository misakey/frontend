import React, { useMemo } from 'react';

import PropTypes from 'prop-types';

import { PROP_TYPES as SSO_PROP_TYPES } from '@misakey/react/auth/store/reducers/sso';
import OrganizationsSchema from '@misakey/react/auth/store/schemas/Organizations';

import useSafeDestr from '@misakey/hooks/useSafeDestr';

import { Trans } from 'react-i18next';
import TypographyPreWrapped from '@misakey/ui/Typography/PreWrapped';
import Typography from '@material-ui/core/Typography';

// CONSTANTS
const I18N_KEY = 'components:requestedConsent.title';

// COMPONENTS
const TransRequestedConsent = ({ client, organization, ...props }) => {
  const { name: clientName } = useSafeDestr(client);

  const { name: orgName } = useSafeDestr(organization);

  const values = useMemo(
    () => ({ clientName, orgName }),
    [clientName, orgName],
  );

  return (
    <TypographyPreWrapped
      component={Trans}
      variant="body2"
      color="textSecondary"
      values={values}
      i18nKey={I18N_KEY}
      {...props}
    >
      <Typography display="inline" color="primary">{'{{clientName}}'}</Typography>
      {' asks access to your data from '}
      <Typography display="inline" color="primary">{'{{orgName}}'}</Typography>
    </TypographyPreWrapped>
  );
};

TransRequestedConsent.propTypes = {
  client: SSO_PROP_TYPES.client.isRequired, // flow initiator = the one who wants data
  organization: PropTypes.shape(OrganizationsSchema.propTypes).isRequired, // requested consent org
};

export default TransRequestedConsent;
