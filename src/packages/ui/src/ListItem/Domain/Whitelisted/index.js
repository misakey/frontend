import React from 'react';

import PropTypes from 'prop-types';


import { useTranslation } from 'react-i18next';

import ListItemDomain from '@misakey/ui/ListItem/Domain';
import ListItemSecondaryActionWhitelist from '@misakey/ui/ListItemSecondaryAction/Whitelist';

// COMPONENTS
const ListItemDomainWhitelisted = ({ onRemove, id, ...rest }) => {
  const { t } = useTranslation(['components', 'common']);

  return (
    <ListItemDomain
      {...rest}
      displayName={t('components:whitelist.domainTitle')}
    >
      <ListItemSecondaryActionWhitelist
        id={id}
        color="primary"
        accessStatus="needs_link"
        onRemove={onRemove}
      />
    </ListItemDomain>
  );
};

ListItemDomainWhitelisted.propTypes = {
  id: PropTypes.string.isRequired,
  onRemove: PropTypes.func,
};

ListItemDomainWhitelisted.defaultProps = {
  onRemove: null,
};

export default ListItemDomainWhitelisted;
