import React, { useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';
import copy from 'copy-to-clipboard';
import clsx from 'clsx';

import omit from '@misakey/helpers/omit';
import tDefault from '@misakey/helpers/tDefault';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useTheme from '@material-ui/core/styles/useTheme';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '5px 16px',
    border: `1px solid ${theme.palette.grey.A100}`,
    borderRadius: theme.shape.borderRadius,
    ...theme.typography.button,
  },
}));

function Color({ className, color, enableCopy, typographyProps, t, ...rest }) {
  const classes = useStyles();
  const theme = useTheme();
  const { enqueueSnackbar } = useSnackbar();

  const handleCopy = useCallback(() => {
    copy(color);
    const text = t('copied', 'Copied!');
    enqueueSnackbar(text, { variant: 'success' });
  }, [color, enqueueSnackbar, t]);

  const [Wrapper, props] = useMemo(() => {
    if (!enableCopy) { return [Box, {}]; }

    return [Button, {
      onClick: handleCopy,
      variant: 'outlined',
    }];
  }, [enableCopy, handleCopy]);

  return (
    <Wrapper
      display="inline-block"
      style={{ backgroundColor: color }}
      className={clsx(classes.root, className)}
      {...props}
      {...omit(rest, ['i18n', 'tReady'])}
    >
      <Typography
        component="span"
        {...typographyProps}
        style={{ color: theme.palette.getContrastText(color) }}
      >
        {color}
      </Typography>
    </Wrapper>
  );
}

Color.propTypes = {
  className: PropTypes.string,
  color: PropTypes.string.isRequired,
  enableCopy: PropTypes.bool,
  t: PropTypes.func,
  typographyProps: PropTypes.object,
};

Color.defaultProps = {
  className: '',
  enableCopy: false,
  t: tDefault,
  typographyProps: {},
};

export default withTranslation()(Color);
