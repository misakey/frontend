import { useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';

import useCombinedRefs from '@misakey/hooks/useCombinedRefs';
import makeStyles from '@material-ui/core/styles/makeStyles';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import Box from '@material-ui/core/Box';
import InputFileBase from '@misakey/ui/Input/File/Base';


// HOOKS
const useStyles = makeStyles(() => ({
  container: {
    height: '20rem',
    display: 'flex',
    justifyContent: 'center',
  },
  input: {
    '&:not(:disabled)': {
      cursor: 'pointer',
    },
  },
}));

// COMPONENTS
const InputFile = forwardRef(({ label, dragActiveLabel, buttonText, disabled, ...props }, ref) => {
  const combinedRef = useCombinedRefs(ref);

  const classes = useStyles();

  const onClick = useCallback((event) => {
    const { current } = combinedRef;
    if (current) {
      current.click(event);
    }
  }, [combinedRef]);

  return (
    <InputFileBase
      ref={combinedRef}
      classes={{ input: classes.input, container: classes.container }}
      labelAdornment={(
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          p={3}
        >
          {label}
        </Box>
      )}
      dragActiveLabelAdornment={(
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
          p={3}
        >
          {dragActiveLabel || label}
        </Box>
      )}
      dragInactiveAdornment={(
        <Button
          standing={BUTTON_STANDINGS.TEXT}
          type="button"
          aria-label={buttonText}
          onClick={onClick}
          text={buttonText}
          disabled={disabled}
        />
      )}
      disabled={disabled}
      {...props}
    />
  );
});

InputFile.propTypes = {
  accept: PropTypes.arrayOf(PropTypes.string),
  name: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  label: PropTypes.node,
  dragActiveLabel: PropTypes.node,
  buttonText: PropTypes.string.isRequired,
  autoFocus: PropTypes.bool,
  disabled: PropTypes.bool,
};

InputFile.defaultProps = {
  accept: [],
  onChange: null,
  label: null,
  dragActiveLabel: null,
  autoFocus: false,
  disabled: false,
};

export default InputFile;
