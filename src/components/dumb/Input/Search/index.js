import React, { useMemo, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';

import omit from '@misakey/helpers/omit';
import isFunction from '@misakey/helpers/isFunction';

// STYLING
import 'components/dumb/Input/Search/index.scss';

// CONSTANTS
const PROPS_INTERNAL = ['tReady', 'i18n', 'staticContext'];

const useStyles = makeStyles((theme) => ({
  inputRoot: {
    color: 'inherit',
    fontSize: 'inherit',
    width: '100%',
  },
  inputInput: {
    padding: theme.spacing(2, 2, 2, 6),
    transition: theme.transitions.create('width'),
    width: '100%',
    textOverflow: 'ellipsis',
  },
  searchIcon: {
    height: '100%',
    width: '3rem',
    position: 'absolute',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIconButton: {
    zIndex: '2',
  },
}));

// HELPERS
const getOnClick = (onIconClick) => (e) => {
  if (isFunction(onIconClick)) {
    onIconClick(e);
  }
};

// HOOKS
const useOnClick = (onIconClick) => useMemo(() => getOnClick(onIconClick), [onIconClick]);
const useHasClick = (onIconClick) => useMemo(() => isFunction(onIconClick), [onIconClick]);
// COMPONENTS
let InputSearch = ({ t, Icon, onIconClick, children, dark, ...rest }, ref) => {
  const classes = useStyles();
  const props = omit(rest, PROPS_INTERNAL);

  const searchClassName = dark ? 'search dark' : 'search';
  const onClick = useOnClick(onIconClick);
  const hasClick = useHasClick(onIconClick);

  return (
    <div className={searchClassName}>
      {hasClick ? (
        <div className={classes.searchIcon}>
          <IconButton onClick={onClick} className={classes.searchIconButton}>
            <Icon />
          </IconButton>
        </div>
      ) : (
        <div className={classes.searchIcon}>
          <Icon />
        </div>
      )}

      {/* autoFocus doesn't seem to spread to InputBase */}
      <InputBase
        inputRef={ref}
        placeholder={t('navigation.search.placeholder', 'Search...')}
        classes={{
          root: classes.inputRoot,
          input: classes.inputInput,
        }}
        {...props}
      />
      {children}
    </div>
  );
};

InputSearch = forwardRef(InputSearch);

InputSearch.propTypes = {
  t: PropTypes.func.isRequired,
  Icon: PropTypes.oneOfType([PropTypes.node, PropTypes.func, PropTypes.object]),
  children: PropTypes.node,
  dark: PropTypes.bool,
  onIconClick: PropTypes.func,
};

InputSearch.defaultProps = {
  Icon: SearchIcon,
  onIconClick: null,
  children: null,
  dark: false,
};

export default withTranslation('common', { withRef: true })(InputSearch);
