import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import isEmpty from 'lodash/isEmpty';
import { withTranslation } from 'react-i18next';
import { Link, generatePath } from 'react-router-dom';

import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import VirtualizedList from 'react-virtualized/dist/commonjs/List';

import { makeStyles } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';

import ApplicationImg from 'components/dumb/Application/Img';
import 'components/dumb/Application/List/ApplicationList.scss';

import routes from 'routes';
import ApplicationSchema from 'store/schemas/Application';

const useStyles = makeStyles((theme) => ({
  listItem: {
    height: '62px',
    overflow: 'hidden',
    left: ({ maxWidth }) => (maxWidth ? 'auto !important' : undefined),
    maxWidth: ({ maxWidth }) => (maxWidth ? theme.breakpoints.values[maxWidth] : 'none'),
  },
  letterAvatar: {
    color: theme.palette.grey[500],
    backgroundColor: theme.palette.grey[200],
  },
  empty: {
    margin: theme.spacing(2),
    padding: theme.spacing(3, 2),
  },
}));

function ApplicationList({
  applications,
  bottomAction,
  linkTo,
  maxWidth,
  search,
  secondaryAction,
  t,
}) {
  const classes = useStyles({ maxWidth });

  // eslint-disable-next-line react/prop-types
  const rowRenderer = ({ index, key, style }) => {
    if (bottomAction && index === applications.length) {
      return (
        <ListItem
          classes={{ root: classes.listItem }}
          key={key}
          component="li"
          style={style}
        >
          {bottomAction()}
        </ListItem>
      );
    }

    const application = applications[index];

    if (!application) return false;

    const { logoUri, name, shortDesc } = application;

    return (
      <ListItem
        classes={{ root: classes.listItem }}
        key={key}
        button={!!linkTo}
        ContainerProps={secondaryAction ? { style } : undefined}
        component={linkTo ? Link : 'li'}
        to={linkTo ? { pathname: generatePath(linkTo, application), search } : {}}
        style={!secondaryAction ? style : {}}
      >
        <ListItemAvatar>
          <ApplicationImg
            classes={{
              root: clsx(
                { [classes.letterAvatar]: isEmpty(logoUri) },
              ),
            }}
            alt={name}
            src={!isEmpty(logoUri) ? logoUri : undefined}
          >
            {name.slice(0, 3)}
          </ApplicationImg>
        </ListItemAvatar>
        <ListItemText
          primary={name}
          secondary={shortDesc}
        />
        {secondaryAction && (
          <ListItemSecondaryAction>
            {secondaryAction(application)}
          </ListItemSecondaryAction>
        )}
      </ListItem>
    );
  };

  if (isEmpty(applications)) {
    return (
      <Typography
        classes={{ root: classes.empty }}
        variant="h6"
        align="center"
        color="textSecondary"
      >
        {t('screens:application.list.empty')}
      </Typography>
    );
  }

  return (
    <List dense className="applicationList" disablePadding>
      <AutoSizer>
        {({ width, height }) => (
          <VirtualizedList
            height={height}
            rowCount={bottomAction ? applications.length + 1 : applications.length}
            rowHeight={62}
            rowRenderer={rowRenderer}
            width={width}
          />
        )}
      </AutoSizer>
    </List>
  );
}

ApplicationList.propTypes = {
  applications: PropTypes.arrayOf(PropTypes.shape(ApplicationSchema.propTypes)),
  bottomAction: PropTypes.func,
  linkTo: PropTypes.string,
  maxWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  search: PropTypes.string,
  secondaryAction: PropTypes.func,
  t: PropTypes.func.isRequired,
};

ApplicationList.defaultProps = {
  applications: [],
  bottomAction: null,
  linkTo: routes.citizen.application.info,
  maxWidth: 'lg',
  search: undefined,
  secondaryAction: null,
};

export default withTranslation(['common', 'screens'])(ApplicationList);
