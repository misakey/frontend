import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { generatePath, Link } from 'react-router-dom';
import routes from 'routes';

import makeStyles from '@material-ui/core/styles/makeStyles';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';

import AddIcon from '@material-ui/icons/Add';

// HOOKS
const useStyles = makeStyles((theme) => ({
  option: {
    color: 'inherit',
    textDecoration: 'none',
    flexGrow: 1,
  },
  avatar: {
    backgroundColor: theme.palette.secondary.main,
  },
}));

// COMPONENTS
const ListItemApplicationNotFound = ({ t, ...rest }) => {
  const classes = useStyles();

  const notFoundTo = useMemo(
    () => generatePath(routes.citizen.applications.create),
    [],
  );

  return (
    <ListItem
      button
      alignItems="center"
      className={classes.option}
      component={Link}
      to={notFoundTo}
      {...omitTranslationProps(rest)}
    >
      <ListItemAvatar>
        <Avatar className={classes.avatar}>
          <AddIcon />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={t('screens:applications.notFound.button')}
        secondary={t('screens:applications.notFound.subtitle')}
      />
    </ListItem>
  );
};

ListItemApplicationNotFound.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation('screens')(ListItemApplicationNotFound);
