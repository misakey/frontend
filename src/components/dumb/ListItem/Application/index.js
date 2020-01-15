import React, { useMemo, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import useTheme from '@material-ui/core/styles/useTheme';

import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { toggleFromSelected } from 'store/actions/screens/applications';

import makeStyles from '@material-ui/core/styles/makeStyles';

import Checkbox from '@material-ui/core/Checkbox';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

import ApplicationImg from 'components/dumb/Application/Img';
import withLongPress from 'components/dumb/withLongPress';

import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';
import { isTouchable } from 'helpers/devices';

const IS_TOUCHABLE = isTouchable();

const useStyles = makeStyles(() => ({
  option: {
    color: 'inherit',
    textDecoration: 'none',
    flexGrow: 1,
  },
}));

function ApplicationListItem({
  application,
  isSelectable,
  secondaryLinkTo,
  dispatch,
  selectedApplications,
  onClick,
  ...rest
}) {
  const classes = useStyles();
  const theme = useTheme();
  const isDownSm = useMediaQuery(theme.breakpoints.down('sm'));
  const [isHovered, setIsHovered] = useState(false);

  const { mainDomain, logoUri, name } = application;

  const CustomButtonElement = useMemo(
    () => (isNil(secondaryLinkTo) ? undefined : Link),
    [secondaryLinkTo],
  );

  const selectedAppsNotEmpty = useMemo(
    () => selectedApplications.length > 0, [selectedApplications.length],
  );

  const isSelecting = useMemo(
    () => selectedAppsNotEmpty && isSelectable && IS_TOUCHABLE,
    [isSelectable, selectedAppsNotEmpty],
  );

  const toggleSelectApp = useCallback(() => {
    dispatch(toggleFromSelected(application.id));
  }, [application.id, dispatch]);

  const onLongPress = useCallback(() => {
    toggleSelectApp();
  }, [toggleSelectApp]);

  const handleClick = useCallback((event) => {
    if (isSelecting) {
      event.preventDefault();
      event.stopPropagation();
      toggleSelectApp();
    } else if (isFunction(onClick)) {
      onClick();
    }
  }, [isSelecting, onClick, toggleSelectApp]);

  const isSelected = useMemo(
    () => selectedApplications.includes(application.id),
    [application.id, selectedApplications],
  );

  const selectableProps = useMemo(
    () => (IS_TOUCHABLE ? {
      onLongPress,
    } : {
      onMouseEnter: () => setIsHovered(true),
      onMouseLeave: () => setIsHovered(false),
    }), [onLongPress],
  );

  const onClickCheckbox = useCallback((event) => {
    event.stopPropagation();
    event.preventDefault();
    toggleSelectApp();
  }, [toggleSelectApp]);

  const ListElement = useMemo(
    () => (isSelectable ? withLongPress(ListItem) : ListItem),
    [isSelectable],
  );

  return (
    <ListElement
      position="relative"
      display="flex"
      alignItems="center"
      width="100%"
      className={classes.option}
      {...(isSelectable ? selectableProps : {})}
      {...rest}
      onClick={handleClick}
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
      {isSelectable && (isSelected || isHovered) && (
      <Checkbox
        edge={isDownSm ? 'end' : null}
        checked={isSelected}
        disableRipple
        onClick={IS_TOUCHABLE ? null : onClickCheckbox}
        inputProps={{ 'aria-labelledby': 'selected-apps' }}
      />
      )}
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
  dispatch: PropTypes.func.isRequired,
  onClick: PropTypes.func,
  secondaryLinkTo: PropTypes.string,
  isSelectable: PropTypes.bool,
  selectedApplications: PropTypes.arrayOf(PropTypes.string),
};

ApplicationListItem.defaultProps = {
  application: {
    logoUri: '',
    mainDomain: null,
    name: '',
  },
  secondaryLinkTo: null,
  isSelectable: true,
  selectedApplications: [],
  onClick: null,
};

const mapStateToProps = (state) => ({
  selectedApplications: state.screens.applications.selected,
});

export default connect(mapStateToProps, null)(ApplicationListItem);
