import React, { useMemo, forwardRef } from 'react';

import PropTypes from 'prop-types';
import clsx from 'clsx';

import { withTranslation } from 'react-i18next';

import { makeStyles } from '@material-ui/core/styles';
import InputBase from '@material-ui/core/InputBase';
import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';

import omit from '@misakey/core/helpers/omit';
import isFunction from '@misakey/core/helpers/isFunction';

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
    padding: theme.spacing(2),
    transition: theme.transitions.create('width'),
    width: '100%',
    textOverflow: 'ellipsis',
  },
  searchIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
let InputSearch = ({
  t,
  Icon,
  onIconClick,
  inputClasses: { root: inputClassesRoot, input: inputClassesInput, ...inputClassesRest },
  children,
  dark,
  ...rest }, ref) => {
  const classes = useStyles();
  const props = omit(rest, PROPS_INTERNAL);

  const searchClassName = dark ? 'search dark' : 'search';
  const onClick = useOnClick(onIconClick);
  const hasClick = useHasClick(onIconClick);

  return (
    <div className={searchClassName}>
      {hasClick ? (
        <div className={classes.searchIcon}>
          <IconButton onClick={onClick}>
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
        placeholder={t('common:search')}
        classes={{
          root: clsx(classes.inputRoot, inputClassesRoot),
          input: clsx(classes.inputInput, inputClassesInput),
          ...inputClassesRest,
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
  inputClasses: PropTypes.object,
  dark: PropTypes.bool,
  onIconClick: PropTypes.func,
};

InputSearch.defaultProps = {
  Icon: SearchIcon,
  onIconClick: null,
  inputClasses: {},
  children: null,
  dark: false,
};

export default withTranslation('common', { withRef: true })(InputSearch);
