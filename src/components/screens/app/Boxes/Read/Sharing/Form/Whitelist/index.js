import Field from '@misakey/ui/Form/Field';
import AutocompleteWhitelistField from '@misakey/ui/Autocomplete/Whitelist/Field';

// COMPONENTS
const SharingFormWhitelist = (props) => (
  <Field
    prefix="boxes."
    component={AutocompleteWhitelistField}
    fullWidth
    {...props}
  />
);

export default SharingFormWhitelist;
