import React from 'react';
import AutocompleteWhitelistField from '@misakey/ui/Autocomplete/Whitelist/Field';

// COMPONENTS
const SharingFormWhitelist = (props) => (
  <AutocompleteWhitelistField
    prefix="boxes."
    fullWidth
    multiple
    {...props}
  />
);

export default SharingFormWhitelist;
