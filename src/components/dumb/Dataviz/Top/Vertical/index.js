import React from 'react';
import PropTypes from 'prop-types';

import { makeStyles } from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import laurel from '../laurel.svg';


const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  firstPositionIcon: {
    background: `url(${laurel}) center center no-repeat`,
    backgroundSize: '100%',
  },
  order: {
    color: theme.palette.common.white,
    width: '100%',
    padding: '10px 0',
    fontWeight: 'bold',
  },
  title: {
    fontWeight: 'bold',
    color: theme.palette.common.white,
  },
  subtitle: {
    color: theme.palette.common.white,
  },
  listItem: {
    width: 'inherit',
    justifyContent: 'center',
  },
  textBlock: {
    paddingLeft: theme.spacing(2),
    flexGrow: 0,
    minWidth: 250,
  },
}));

const VerticalTop = ({ data }) => {
  const classes = useStyles();

  return (
    <List dense disablePadding>
      {data.map(({ title, subtitle }, index) => (
        <ListItem className={classes.listItem} key={title}>
          <ListItemIcon className={(index === 0) ? classes.firstPositionIcon : undefined}>
            <Typography variant="h5" className={classes.order} align="center">
              {index + 1}
            </Typography>
          </ListItemIcon>
          <ListItemText
            className={classes.textBlock}
            primary={title}
            primaryTypographyProps={{ className: classes.title, variant: 'h5' }}
            secondary={subtitle}
            secondaryTypographyProps={{ className: classes.subtitle }}
          />
        </ListItem>
      ))}
    </List>
  );
};

VerticalTop.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default VerticalTop;
