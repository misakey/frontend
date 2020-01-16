import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import omitTranslationProps from 'helpers/omit/translationProps';
import makeStyles from '@material-ui/core/styles/makeStyles';

import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';

import SearchIcon from '@material-ui/icons/Search';

// HOOKS
const useStyles = makeStyles((theme) => ({
  boxRoot: {
    display: 'flex',
    alignItems: 'center',
  },
  typographyRoot: {
    marginLeft: theme.spacing(2),
  },
}));

// COMPONENTS
const SearchApplicationsButtonEmpty = ({ t, ...props }) => {
  const classes = useStyles();

  return (
    <Box
      classes={{ root: classes.boxRoot }}
      width={1}
      {...omitTranslationProps(props)}
    >
      <Avatar variant="rounded">
        <SearchIcon />
      </Avatar>
      <Typography
        noWrap
        component="span"
        variant="body2"
        color="textSecondary"
        classes={{ root: classes.typographyRoot }}
      >
        {t('nav:search.button.search')}
      </Typography>
    </Box>
  );
};

SearchApplicationsButtonEmpty.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation('nav')(SearchApplicationsButtonEmpty);
