import PropTypes from 'prop-types';

import { useTranslation } from 'react-i18next';
import makeStyles from '@material-ui/core/styles/makeStyles';

import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import Box from '@material-ui/core/Box';
import Subtitle from '@misakey/ui/Typography/Subtitle';

// HOOKS
const useStyles = makeStyles((theme) => ({
  box: {
    '&:first-child:last-child': {
      marginTop: theme.spacing(2),
    },
    marginTop: 0,
  },
}));

// COMPONENTS
const AutocompleteWhitelistPaper = ({ children, ...props }) => {
  const classes = useStyles();
  const { t } = useTranslation('components');

  return (
    <Paper {...props}>
      {children}
      <Box m={2} className={classes.box}>
        <Divider />
        <Subtitle>{t('components:whitelist.addDomain')}</Subtitle>
      </Box>
    </Paper>
  );
};

AutocompleteWhitelistPaper.propTypes = {
  children: PropTypes.node,
};

AutocompleteWhitelistPaper.defaultProps = {
  children: null,
};

export default AutocompleteWhitelistPaper;
