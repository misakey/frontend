import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { generatePath, useHistory } from 'react-router-dom';

import map from '@misakey/helpers/map';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import isNil from '@misakey/helpers/isNil';
import isObject from '@misakey/helpers/isObject';

import API from '@misakey/api';
import routes from 'routes';

import { makeStyles } from '@material-ui/core';
import { fade } from '@material-ui/core/styles';
import { ceriseRed } from '@misakey/ui/colors';
import { MIN_PX_0_LANDSCAPE, MIN_PX_600 } from 'constants/ui/medias';
import useLocationWorkspace from 'hooks/useLocationWorkspace';
import { ROLE_LABELS } from 'constants/Roles';

import SearchAsync from 'components/dumb/Search/Async';

import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import AddIcon from '@material-ui/icons/Add';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';

import ApplicationListItem from 'components/dumb/ListItem/Application';

function getPopperListboxHeight(theme, media) {
  const toolbar = theme.mixins.toolbar[media] || theme.mixins.toolbar;
  return { height: `calc(100vh - ${toolbar.minHeight}px)` };
}

export const SEARCH_WIDTH_MD = 400;
export const SEARCH_WIDTH_LG = 600;

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    position: 'relative',
    marginLeft: 0,
    marginRight: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.grey['500'], 0.15),
    '&:hover': { backgroundColor: fade(theme.palette.grey['500'], 0.25) },
    [theme.breakpoints.up('md')]: {
      width: SEARCH_WIDTH_MD,
      position: 'absolute',
      left: '50%',
      transform: 'translateX(-50%)',
      margin: 0,
    },
    [theme.breakpoints.up('lg')]: {
      width: SEARCH_WIDTH_LG,
    },
  },
  paper: {
    [theme.breakpoints.down('sm')]: {
      margin: 0,
      border: 0,
      borderRadius: 0,
    },
  },
  listbox: {
    [theme.breakpoints.down('sm')]: {
      maxHeight: 'none !important',
      [MIN_PX_0_LANDSCAPE]: getPopperListboxHeight(theme, MIN_PX_0_LANDSCAPE),
      [MIN_PX_600]: getPopperListboxHeight(theme, MIN_PX_600),
      ...getPopperListboxHeight(theme),
    },
  },
  popup: {
    [theme.breakpoints.down('sm')]: {
      position: 'fixed !important',
      width: '100% !important',
      transform: 'none !important',
      [MIN_PX_0_LANDSCAPE]: { top: `${theme.mixins.toolbar[MIN_PX_0_LANDSCAPE].minHeight}px !important` },
      [MIN_PX_600]: { top: `${theme.mixins.toolbar[MIN_PX_0_LANDSCAPE].minHeight}px !important` },
      top: `${theme.mixins.toolbar.minHeight}px !important`,
    },
  },
  option: {
    color: 'inherit',
    textDecoration: 'none',
    flexGrow: 1,
  },
  secondaryAction: {
    [theme.breakpoints.down('sm')]: {
      display: 'none',
    },
  },
  avatar: {
    backgroundColor: ceriseRed[400],
  },
}));

function NoOption({ classes, t }) {
  return (
    <Box
      position="relative"
      display="flex"
      alignItems="center"
      width="100%"
      className={classes.option}
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
      <ListItemSecondaryAction className={classes.secondaryAction}>
        <IconButton edge="end">
          <ArrowForwardIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </Box>
  );
}

NoOption.propTypes = {
  classes: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};

const NoOptionWithTranslation = withTranslation('screens')(NoOption);

function Option({ classes, application }) {
  if (isNil(application.mainDomain)) { return <NoOptionWithTranslation classes={classes} />; }

  // @FIXME: find a way to make it work with a listItem and not a Box as component
  // Or understand why it's broken with a ListItem (probably there is already a list item in the
  // render used by the autocomplete component)
  // It's possible we don't want to use autoocmplete for our usecase here, it seems to bring a lot
  // of complexity and it's hard to reuse components.
  return <ApplicationListItem application={application} isBox />;
}

Option.propTypes = {
  classes: PropTypes.object.isRequired,
  application: PropTypes.object,
};

Option.defaultProps = {
  application: {
    logoUri: '',
    mainDomain: null,
    name: '',
  },
};

function SearchApplications({ isAuthenticated, ...rest }) {
  const classes = useStyles();
  const role = useLocationWorkspace();
  const history = useHistory();

  const getApplications = useCallback((value, setOptionsIfActive, setLoading) => {
    setLoading(true);

    const endpoint = API.endpoints.application.find;

    if (!isAuthenticated) { endpoint.auth = false; }

    API.use(endpoint)
      .build(undefined, undefined, { search: value, heavier_than: 99, published: true })
      .send()
      .then((response) => {
        setOptionsIfActive(map(response, objectToCamelCase).concat([{ mainDomain: null }]));
      })
      .finally(() => { setLoading(false); });
  }, [isAuthenticated]);

  const handleChange = useCallback((event, option) => {
    if (isObject(option)) {
      const { mainDomain } = option;

      if (mainDomain === null) {
        history.push(generatePath(routes.citizen.applications.create));
      } else {
        let linkTo = routes.citizen.application._;
        if (role === ROLE_LABELS.DPO) {
          linkTo = routes.dpo.service._;
        } else if (role === ROLE_LABELS.ADMIN) {
          linkTo = routes.admin.service._;
        }

        history.push(generatePath(linkTo, { mainDomain }));
      }
    }
  }, [history, role]);

  return (
    <SearchAsync
      freeSolo
      classes={{
        root: classes.root,
        paper: classes.paper,
        popup: classes.popup,
        listbox: classes.listbox,
      }}
      onAutocomplete={handleChange}
      filterOptions={(x) => x}
      ListboxComponent={List}
      onGetOptions={getApplications}
      onSubmit={(e) => { e.preventDefault(); }}
      renderOption={
        (application) => <Option application={application} classes={classes} role={role} />
      }
      {...rest}
    />
  );
}

SearchApplications.propTypes = {
  isAuthenticated: PropTypes.bool,
};

SearchApplications.defaultProps = {
  isAuthenticated: false,
};

export default connect((state) => ({
  isAuthenticated: !!state.auth.token,
}), {})(SearchApplications);
