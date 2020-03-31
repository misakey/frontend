import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import ApplicationSchema from 'store/schemas/Application';

import prop from '@misakey/helpers/prop';
import isEmpty from '@misakey/helpers/isEmpty';

import withApplication from 'components/smart/withApplication';
import SearchApplicationsPopoverNavigation from 'components/smart/Search/Applications/Popover/Navigation';

// HELPERS
const dpoEmailProp = prop('dpoEmail');

// COMPONENTS
const SearchApplicationsPopoverRequest = ({ entity }) => {
  const dpoEmail = useMemo(
    () => dpoEmailProp(entity),
    [entity],
  );

  if (isEmpty(dpoEmail)) {
    // GAFAM
    return <SearchApplicationsPopoverNavigation />;
  }
  // REQUEST
  return <SearchApplicationsPopoverNavigation />;
};

SearchApplicationsPopoverRequest.propTypes = {
  entity: PropTypes.shape(ApplicationSchema.propTypes),

};

SearchApplicationsPopoverRequest.defaultProps = {
  entity: null,
};

export default withApplication(SearchApplicationsPopoverRequest);
