import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';

import noop from '@misakey/helpers/noop';
import isString from '@misakey/helpers/isString';
import isNil from '@misakey/helpers/isNil';

import InputSearch from 'components/dumb/Input/Search/index';

// CONSTANTS
const useStyles = makeStyles(() => ({
  searchButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

// HELPERS
const getIsSearchEmpty = (value) => isNil(value) || (isString(value) && value.length === 0);
const getOnSearchSubmit = (value, onSubmit) => (e) => {
  e.preventDefault();
  onSubmit(value, e);
};

// HOOKS
const useIsSearchEmpty = (value) => useMemo(() => getIsSearchEmpty(value), [value]);
const useOnSearchSubmit = (value, onSubmit) => useMemo(
  () => getOnSearchSubmit(value, onSubmit), [value, onSubmit],
);

// COMPONENTS
const InputSearchButton = ({ t, value, onSubmit, Icon, iconButtonProps, ...props }) => {
  const classes = useStyles();

  const isSearchEmpty = useIsSearchEmpty(value);

  const onSearchSubmit = useOnSearchSubmit(value, onSubmit);

  return (
    <form onSubmit={onSearchSubmit}>
      <InputSearch value={value} Icon={Icon} {...props}>
        <IconButton
          className={classes.searchButton}
          aria-label={t('common:search')}
          disabled={isSearchEmpty}
          type="submit"
          {...iconButtonProps}
        >
          <SearchIcon />
        </IconButton>
      </InputSearch>
    </form>
  );
};

InputSearchButton.propTypes = {
  t: PropTypes.func.isRequired,
  value: PropTypes.string,
  Icon: PropTypes.oneOfType([PropTypes.node, PropTypes.func, PropTypes.object]),
  iconButtonProps: PropTypes.objectOf(PropTypes.any),
  onSubmit: PropTypes.func,
};

InputSearchButton.defaultProps = {
  value: '',
  onSubmit: noop,
  Icon: () => null,
  iconButtonProps: {},
};

export default withTranslation('common')(InputSearchButton);
