import React from 'react';
import { PropTypes } from 'prop-types';
import { withTranslation } from 'react-i18next';

import omitTranslationProps from '@misakey/core/helpers/omit/translationProps';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(() => ({
  root: {
    height: '100%',
    width: '100%',
    boxSizing: 'border-box',
  },
}));

// @FIXME: js-common
function Empty({ t, text, title, children, ...rest }) {
  const classes = useStyles();

  return (
    <Box
      py={3}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      className={classes.root}
      {...omitTranslationProps(rest)}
    >
      <Typography variant="h5" component="h4" color="textPrimary" align="center">
        {title || t('components:list.empty.title')}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" align="center">
        {text || t('components:list.empty.text')}
      </Typography>
      {children}
    </Box>
  );
}

Empty.propTypes = {
  t: PropTypes.func.isRequired,
  text: PropTypes.string,
  title: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.node]),
};

Empty.defaultProps = {
  text: null,
  title: null,
  children: null,
};

export default withTranslation('components')(Empty);
