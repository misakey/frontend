import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';


import makeStyles from '@material-ui/core/styles/makeStyles';

import Box from '@material-ui/core/Box';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

import ApplicationImg from 'components/dumb/Application/Img';

import isNil from '@misakey/helpers/isNil';

const useStyles = makeStyles((theme) => ({
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
}));

function ApplicationListItem({ application, isBox, secondaryLinkTo, ...rest }) {
  const classes = useStyles();
  const { mainDomain, logoUri, name } = application;

  const ListElement = useMemo(() => (isBox ? Box : ListItem), [isBox]);

  const CustomButtonElement = useMemo(
    () => (isNil(secondaryLinkTo) ? undefined : Link),
    [secondaryLinkTo],
  );

  return (
    <ListElement
      position="relative"
      display="flex"
      alignItems="center"
      width="100%"
      className={classes.option}
      {...rest}
    >
      <ListItemAvatar>
        <ApplicationImg
          src={logoUri}
          applicationName={name}
        />
      </ListItemAvatar>
      <ListItemText
        primary={name}
        secondary={mainDomain}
      />
      <ListItemSecondaryAction className={classes.secondaryAction}>
        <IconButton
          edge="end"
          aria-label="see"
          component={CustomButtonElement}
          to={secondaryLinkTo}
        >
          <ArrowForwardIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListElement>
  );
}

ApplicationListItem.propTypes = {
  application: PropTypes.object,
  isBox: PropTypes.bool,
  secondaryLinkTo: PropTypes.string,
};

ApplicationListItem.defaultProps = {
  application: {
    logoUri: '',
    mainDomain: null,
    name: '',
  },
  isBox: false,
  secondaryLinkTo: null,
};

export default ApplicationListItem;
