import React from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import isFunction from '@misakey/helpers/isFunction';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import makeStyles from '@material-ui/core/styles/makeStyles';

const TYPO_PROPS = { noWrap: true };

const SERVICE_SHAPE = {
  description: PropTypes.string,
  logoUri: PropTypes.string,
  mainDomain: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

const useStyles = makeStyles((theme) => ({
  popper: { zIndex: 100 },
  logo: {
    height: 24,
    width: 24,
    marginRight: theme.spacing(2),
  },
}));

/**
 * Show a selection Button of Services that can accepts
 * custom actions to its trigger able tags (button, items etc...)
 */
function MenuService({
  afterServices, buttonProps, buttonGroupProps,
  hideLogo, itemProps, selected, services, t,
}) {
  const classes = useStyles();

  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef(null);
  const [selectedIndex, setSelectedIndex] = React.useState(selected);

  const handleClick = React.useCallback(
    () => {
      const { onClick } = buttonProps;
      if (isFunction(onClick)) {
        onClick(services[selectedIndex], selectedIndex, open, setOpen);
      } else { setOpen(true); }
    },
    [buttonProps, selectedIndex, services, open, setOpen],
  );

  const handleMenuItemClick = React.useCallback(
    (event, index) => {
      setSelectedIndex(index);
      setOpen(false);

      const { onClick } = itemProps;
      if (isFunction(onClick)) { onClick(services[index], index); }
    },
    [itemProps, services, setSelectedIndex, setOpen],
  );

  const getHandleMenuItemClick = React.useCallback(
    (i) => (e) => handleMenuItemClick(e, i),
    [handleMenuItemClick],
  );

  const handleToggle = React.useCallback(
    () => { setOpen((prevOpen) => !prevOpen); },
    [setOpen],
  );

  const handleClose = React.useCallback(
    (event) => {
      if (anchorRef.current && anchorRef.current.contains(event.target)) { return; }
      setOpen(false);
    },
    [anchorRef, setOpen],
  );

  const currentService = React.useMemo(
    () => services[selectedIndex],
    [services, selectedIndex],
  );

  return (
    <>
      <ButtonGroup
        variant="outlined"
        aria-label="Service menu"
        {...buttonGroupProps}
        ref={anchorRef}
      >
        <Button {...buttonProps} onClick={handleClick}>
          {!hideLogo && (
            <Avatar
              alt={t('screens:Service.Menu.logoAlt', { mainDomain: currentService.mainDomain })}
              src={currentService.logoUri}
              className={classes.logo}
            />
          )}
          {currentService.name}
        </Button>
        <Button
          color="primary"
          variant="contained"
          size="small"
          aria-owns={open ? 'menu-list-grow' : undefined}
          aria-haspopup="true"
          onClick={handleToggle}
        >
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Popper
        open={open}
        className={classes.popper}
        anchorEl={anchorRef.current}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom' ? 'left top' : 'center bottom',
              width: 320,
            }}
          >
            <Paper id="menu-list-grow">
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList>
                  {services.map(({ description, logoUri, mainDomain, name }, index) => (
                    <>
                      <MenuItem
                        key={mainDomain}
                        alignItems="flex-start"
                        selected={index === selectedIndex}
                        {...itemProps}
                        onClick={getHandleMenuItemClick(index)}
                      >
                        <ListItemAvatar>
                          <Avatar alt="" src={logoUri} component="span" />
                        </ListItemAvatar>
                        <ListItemText
                          primary={name}
                          secondary={description}
                          primaryTypographyProps={TYPO_PROPS}
                          secondaryTypographyProps={TYPO_PROPS}
                        />
                      </MenuItem>
                    </>
                  ))}
                  {afterServices && <Divider component="li" />}
                  {afterServices}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
}

MenuService.propTypes = {
  afterServices: PropTypes.oneOfType([PropTypes.elementType, PropTypes.node]),
  buttonGroupProps: PropTypes.shape({
    color: PropTypes.string,
    variant: PropTypes.string,
  }),
  buttonProps: PropTypes.shape({
    /**
     * overrides the default behavior that opens the selection Menu
     */
    onClick: PropTypes.func,
  }),
  hideLogo: PropTypes.bool,
  itemProps: PropTypes.shape({
    /**
     * comes along the default behavior that selects a MenuItem
     */
    onClick: PropTypes.func,
  }),
  selected: PropTypes.number.isRequired,
  services: PropTypes.arrayOf(PropTypes.shape(SERVICE_SHAPE)),
  t: PropTypes.func.isRequired,
};

MenuService.defaultProps = {
  afterServices: null,
  buttonProps: {},
  buttonGroupProps: {},
  hideLogo: false,
  itemProps: {},
  services: [],
};

export default withTranslation(['screens'])(MenuService);
