import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { generatePath } from 'react-router-dom';
import routes from 'routes';

import makeStyles from '@material-ui/core/styles/makeStyles';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import getNextSearch from '@misakey/helpers/getNextSearch';
import isEmpty from '@misakey/helpers/isEmpty';

import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';

import AddIcon from '@material-ui/icons/Add';

import LinkWithDialogConnect from 'components/smart/Dialog/Connect/with/Link';

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
const ListItemApplicationNotFound = ({ t, searchValue, ...rest }) => {
  const classes = useStyles();

  const notFoundTo = useMemo(
    () => {
      const pathname = generatePath(routes.citizen.applications.create);
      return isEmpty(searchValue) ? pathname : {
        pathname,
        search: getNextSearch('', new Map([['prefill', searchValue]])),
      };
    },
    [searchValue],
  );

  return (
    <ListItem
      button
      alignItems="center"
      className={classes.option}
      component={LinkWithDialogConnect}
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
  searchValue: PropTypes.string,
};

ListItemApplicationNotFound.defaultProps = {
  searchValue: '',
};

export default withTranslation('screens')(ListItemApplicationNotFound);
