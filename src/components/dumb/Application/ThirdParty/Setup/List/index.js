import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import isEmpty from 'lodash/isEmpty';

import { makeStyles } from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';

import ApplicationImg from 'components/dumb/Application/Img';

const useStyles = makeStyles((theme) => ({
  listItem: {
    height: '62px',
    overflow: 'hidden',
  },
  letterAvatar: {
    color: theme.palette.grey[500],
    backgroundColor: theme.palette.grey[200],
  },
  empty: {
    margin: theme.spacing(2),
    padding: theme.spacing(3, 2),
  },
  subheader: {
    textTransform: 'uppercase',
    fontSize: '0.8rem',
    lineHeight: '2rem',
    paddingLeft: '1rem',
  },
}));

function TrackerList({ entities, secondaryAction, title }) {
  const classes = useStyles();

  return (
    <List
      dense
      disablePadding
      subheader={(
        <ListSubheader disableSticky color="primary" className={classes.subheader} disableGutters>
          {title}
        </ListSubheader>
      )}
    >
      {entities.map((entity) => (
        <ListItem
          classes={{ root: classes.listItem }}
          key={entity.id}
        >
          <ListItemAvatar>
            <ApplicationImg
              classes={{
                root: clsx(
                  { [classes.letterAvatar]: isEmpty(entity.logoUri) },
                ),
              }}
              alt={entity.name}
              src={!isEmpty(entity.logoUri) ? entity.logoUri : undefined}
            >
              {entity.name.slice(0, 3)}
            </ApplicationImg>
          </ListItemAvatar>
          <ListItemText
            primary={entity.name}
            secondary={entity.shortDesc}
          />
          {secondaryAction && (
            <ListItemSecondaryAction>
              {secondaryAction(entity)}
            </ListItemSecondaryAction>
          )}
        </ListItem>
      ))}
    </List>
  );
}

TrackerList.propTypes = {
  entities: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    logoUri: PropTypes.string,
    shortDesc: PropTypes.string,
  })),
  secondaryAction: PropTypes.func,
  title: PropTypes.string,
};

TrackerList.defaultProps = {
  entities: [],
  secondaryAction: null,
  title: null,
};

export default TrackerList;
