import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';

import useWidth from '@misakey/hooks/useWidth';

import map from '@misakey/helpers/map';
import omit from '@misakey/helpers/omit';
import find from '@misakey/helpers/find';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import isArray from '@misakey/helpers/isArray';
import tDefault from '@misakey/helpers/tDefault';
import isObject from '@misakey/helpers/isObject';
import isFunction from '@misakey/helpers/isFunction';

import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import defaultCustomizers from './customizers';

const useStyles = makeStyles((theme) => ({
  title: {
    postiton: 'relative',
  },
  nested: {
    margin: 0,
    border: `1px solid ${theme.palette.grey.A100}`,
    borderRadius: theme.shape.borderRadius,
  },
}));

/**
 * @param props
 * @returns {*}
 * @constructor
 */
function GridListKeyValue(props) {
  const {
    cols,
    customizers,
    hideNil,
    hideEmpty,
    keyPrefix,
    object,
    omitKeys,
    t,
    ...rest
  } = props;

  const classes = useStyles();
  const width = useWidth();
  const cellCols = React.useMemo(() => (['xs', 'sm'].includes(width) ? 2 : 1), [width]);

  const customize = React.useCallback((value, key) => {
    const [match, format] = find(
      customizers.concat(defaultCustomizers),
      ([m]) => m(value, key, t),
    );

    if (isFunction(match) && isFunction(format)) {
      const formatted = format(value, key, t);
      if (formatted !== false) { return formatted; }
    }

    return JSON.stringify(value);
  }, [customizers, t]);

  return (
    <GridList cellHeight="auto" cols={cols} spacing={16} {...omit(rest, ['i18n', 'tReady'])}>
      {map(omit(object, omitKeys), (value, key) => {
        if (hideNil && isNil(value)) { return null; }
        if (hideEmpty && isEmpty(value)) { return null; }

        const label = `${keyPrefix}${key}`;
        const nested = isObject(value);
        const list = isArray(value);

        return (
          <GridListTile
            key={label}
            cols={cellCols}
            className={classes.title}
          >
            <Box
              component={nested ? 'fieldset' : 'div'}
              className={clsx({ [classes.nested]: nested })}
            >
              <Typography variant="body1" color="textSecondary" component={nested ? 'legend' : 'p'}>
                {t(label, key)}
              </Typography>
              {list && (
                <List dense>
                  {map(value, (v, k) => (
                    <ListItem key={`${v}.${k}`}>
                      <ListItemIcon>{`${k}.`}</ListItemIcon>
                      <ListItemText primary={customize(v, k)} />
                    </ListItem>
                  ))}
                </List>
              )}
              {(!list && nested) && (
                <GridListKeyValue
                  {...props}
                  cols={1}
                  object={value}
                  keyPrefix={`${label}.`}
                />
              )}
              {(!nested && !list) && customize(value, key)}
            </Box>
          </GridListTile>
        );
      })}
    </GridList>
  );
}

GridListKeyValue.propTypes = {
  cols: PropTypes.number,
  customizers: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.func)),
  hideEmpty: PropTypes.bool,
  hideNil: PropTypes.bool,
  keyPrefix: PropTypes.string,
  object: PropTypes.object.isRequired,
  omitKeys: PropTypes.arrayOf(PropTypes.string),
  /**
   * needs to be passed by the parent because no translations here are js-common related
   */
  t: PropTypes.func,
};

GridListKeyValue.defaultProps = {
  cols: 3,
  customizers: [],
  hideNil: true,
  hideEmpty: false,
  keyPrefix: '',
  omitKeys: [],
  t: tDefault,
};

export default GridListKeyValue;
