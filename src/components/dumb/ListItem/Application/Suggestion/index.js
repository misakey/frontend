import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';

import { makeStyles } from '@material-ui/core/styles';
import { Link, generatePath } from 'react-router-dom';

import ApplicationSchema from 'store/schemas/Application';

import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ApplicationImg from 'components/dumb/Application/Img';


// HOOKS
const useStyles = makeStyles((theme) => ({
  listItemRoot: {
    height: '62px',
    overflow: 'hidden',
  },
  letterAvatar: {
    color: theme.palette.grey[500],
    backgroundColor: theme.palette.grey[200],
  },
}));

// COMPONENTS
const SuggestionApplicationListItem = ({
  linkTo,
  application,
  SecondaryAction,
  style,
}) => {
  const classes = useStyles();

  const { logoUri, name, mainDomain } = application;

  const to = useMemo(
    () => (isNil(linkTo)
      ? null
      : { pathname: generatePath(linkTo, application) }),
    [linkTo, application],
  );

  const hasLogoUri = useMemo(
    () => !isEmpty(logoUri),
    [logoUri],
  );

  return (
    <ListItem
      classes={{ root: classes.listItemRoot }}
      button={!!to}
      ContainerProps={{ style }}
      component={to ? Link : 'li'}
      to={to}
      style={style}
    >
      <ListItemAvatar>
        <ApplicationImg
          classes={{
            root: clsx(
              { [classes.letterAvatar]: !hasLogoUri },
            ),
          }}
          alt=""
          src={hasLogoUri ? logoUri : undefined}
        >
          {name.slice(0, 3)}
        </ApplicationImg>
      </ListItemAvatar>
      <ListItemText
        primary={name}
        secondary={mainDomain}
        primaryTypographyProps={{
          variant: 'subtitle1',
          noWrap: true,
        }}
        secondaryTypographyProps={{
          noWrap: true,
        }}
      />
      {SecondaryAction}
    </ListItem>
  );
};

SuggestionApplicationListItem.propTypes = {
  linkTo: PropTypes.string,
  application: PropTypes.shape(ApplicationSchema.propTypes),
  SecondaryAction: PropTypes.node,
  style: PropTypes.object,
};

SuggestionApplicationListItem.defaultProps = {
  linkTo: null,
  application: null,
  SecondaryAction: null,
  style: {},
};

export default SuggestionApplicationListItem;
