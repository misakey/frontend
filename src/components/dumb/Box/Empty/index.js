import React from 'react';
import { PropTypes } from 'prop-types';
import { withTranslation } from 'react-i18next';
import Box from '@material-ui/core/Box';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(() => ({
  root: {
    height: '100%',
    width: '100%',
  },
}));

// @FIXME: js-common
function Empty({ t, text, title }) {
  const classes = useStyles();

  return (
    <Box
      py={3}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      className={classes.root}
    >
      <Typography variant="h5" component="h4" align="center">
        {title || t('components__new:list.empty.title')}
      </Typography>
      <Typography variant="subtitle1" color="textSecondary" align="center">
        {text || t('components__new:list.empty.text')}
      </Typography>
    </Box>
  );
}

Empty.propTypes = {
  t: PropTypes.func.isRequired,
  text: PropTypes.string,
  title: PropTypes.string,
};

Empty.defaultProps = {
  text: null,
  title: null,
};

export default withTranslation('components__new')(Empty);
