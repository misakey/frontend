import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { generatePath } from 'react-router-dom';
import routes from 'routes';

import makeStyles from '@material-ui/core/styles/makeStyles';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import getNextSearch from '@misakey/helpers/getNextSearch';
import isEmpty from '@misakey/helpers/isEmpty';
import useLocationWorkspace from '@misakey/hooks/useLocationWorkspace';

import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';

import AddIcon from '@material-ui/icons/Add';

import LinkWithDialogConnect from 'components/smart/Dialog/Connect/with/Link';
import { WORKSPACE } from 'constants/workspaces';

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
  const workspace = useLocationWorkspace();
  const toRoute = useMemo(
    () => ((workspace === WORKSPACE.DPO)
      ? routes.dpo.services.create
      : routes.citizen.applications.create),
    [workspace],
  );

  const notFoundTo = useMemo(
    () => {
      const pathname = generatePath(toRoute);
      return isEmpty(searchValue) ? pathname : {
        pathname,
        search: getNextSearch('', new Map([['prefill', searchValue]])),
      };
    },
    [searchValue, toRoute],
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
        primary={t('citizen:application.notFound.create.button')}
        secondary={t('citizen:application.notFound.subtitle')}
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

export default withTranslation('citizen')(ListItemApplicationNotFound);
