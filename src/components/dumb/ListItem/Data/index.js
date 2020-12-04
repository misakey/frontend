import { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';

import isNil from '@misakey/helpers/isNil';
import isObject from '@misakey/helpers/isObject';

import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';

// HOOKS
const useStyles = makeStyles((theme) => ({
  listItemContainer: {
    width: '100%',
  },
  listItemRoot: {
    minHeight: '4rem',
    flexDirection: 'column',
    alignItems: 'flex-start',
    zIndex: 1,
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  },
  listItemSecondaryAction: {
    paddingRight: '3rem',
  },
  title: {
    [theme.breakpoints.up('sm')]: {
      flexBasis: '10rem',
    },
  },
  titleText: {
    fontSize: '0.8rem',
    [theme.breakpoints.up('sm')]: {
      fontSize: '0.9rem',
    },
    textTransform: 'uppercase',
  },
  secondaryActionRoot: {
    width: '3rem',
    display: 'flex',
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const useTextProps = (text) => useMemo(() => {
  if (isNil(text)) {
    return {};
  }
  if (isObject(text)) {
    return text;
  }
  return { primary: text };
}, [text]);

// COMPONENTS
// @FIXME add to @misakey/ui
const ListItemData = ({ action, ariaAction, first, label, linkTo, text, children, ...props }) => {
  const classes = useStyles();

  const textProps = useTextProps(text);

  const linkProps = useMemo(() => (isNil(linkTo) ? {} : { component: Link, to: linkTo }), [linkTo]);

  return (
    <>
      {!first && <Divider variant="fullWidth" component="li" />}
      <ListItem
        button
        {...linkProps}
        aria-label={ariaAction}
        classes={{
          root: classes.listItemRoot,
          container: classes.listItemContainer,
          secondaryAction: classes.listItemSecondaryAction,
        }}
        {...props}
      >
        <ListItemIcon className={classes.title}>
          <Typography className={classes.titleText}>
            {label}
          </Typography>
        </ListItemIcon>
        <ListItemText {...textProps}>{children}</ListItemText>
        <ListItemSecondaryAction classes={{ root: classes.secondaryActionRoot }}>
          {action}
        </ListItemSecondaryAction>
      </ListItem>
    </>
  );
};

ListItemData.propTypes = {
  action: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
  ariaAction: PropTypes.string,
  first: PropTypes.bool,
  label: PropTypes.oneOfType([PropTypes.node, PropTypes.elementType]),
  linkTo: PropTypes.string,
  text: PropTypes.oneOfType([
    PropTypes.shape({
      primary: PropTypes.string,
      secondary: PropTypes.string,
    }),
    PropTypes.string,
  ]),
  children: PropTypes.node,
};

ListItemData.defaultProps = {
  ariaAction: '',
  first: false,
  label: null,
  linkTo: null,
  text: null,
  action: null,
  children: null,
};

export default ListItemData;
