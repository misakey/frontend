import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';

import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';

import AutoSizer from 'react-virtualized/dist/commonjs/AutoSizer';
import VirtualizedList from 'react-virtualized/dist/commonjs/List';

import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ApplicationSchema from 'store/schemas/Application';

// CONSTANTS
const APP_ROW_HEIGHT = 62;
const TITLE_ROW_HEIGHT = 0.5 * APP_ROW_HEIGHT;
const BOTTOM_ROW_HEIGHT = 2 * APP_ROW_HEIGHT;

// HOOKS
const useStyles = makeStyles(() => ({
  listRoot: {
    height: '100%',
  },
  listSubheaderRoot: {
    display: 'flex',
    alignItems: 'center',
  },
}));

// COMPONENTS
const ApplicationListGroups = ({
  groups,
  BottomAction,
}) => {
  const classes = useStyles();

  const [flatRenderList, titleIndexes] = useMemo(
    () => {
      const titles = [];
      const list = (groups || [])
        .reduce((acc, { title, rowRenderer: RowRenderer, applications, ...rest }) => {
          if (!isEmpty(title)) {
            acc.push((props) => (
              <ListSubheader
                disableSticky
                classes={{ root: classes.listSubheaderRoot }}
                {...props}
              >
                {title}
              </ListSubheader>
            ));
            titles.push(acc.length - 1);
          }
          // eslint-disable-next-line no-param-reassign
          acc = acc.concat(
            applications
              .map((application) => (props) => (
                <RowRenderer
                  application={application}
                  {...rest}
                  {...props}
                />
              )),
          );

          return acc;
        }, []);

      if (!isNil(BottomAction)) {
        list.push(BottomAction);
      }
      return [list, titles];
    },
    [groups, BottomAction, classes],
  );

  const rowCount = useMemo(
    () => flatRenderList.length,
    [flatRenderList],
  );

  const getRowHeight = useCallback(
    ({ index }) => {
      if (index === (flatRenderList.length - 1) && !isNil(BottomAction)) {
        return BOTTOM_ROW_HEIGHT;
      }
      if (titleIndexes.includes(index)) {
        return TITLE_ROW_HEIGHT;
      }
      return APP_ROW_HEIGHT;
    },
    [flatRenderList, BottomAction, titleIndexes],
  );

  const flatListRowRenderer = useCallback(
    ({ index, key, style }) => {
      const Row = flatRenderList[index];
      return <Row key={key} style={style} />;
    },
    [flatRenderList],
  );

  if (isEmpty(flatRenderList)) {
    return null;
  }

  return (
    <List
      dense
      classes={{ root: classes.listRoot }}
      disablePadding
    >
      <AutoSizer>
        {({ width, height }) => (
          <VirtualizedList
            height={height}
            rowCount={rowCount}
            rowHeight={getRowHeight}
            rowRenderer={flatListRowRenderer}
            width={width}
            tabIndex={null}
          />
        )}
      </AutoSizer>
    </List>
  );
};

ApplicationListGroups.propTypes = {
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      applications: PropTypes.arrayOf(PropTypes.shape(ApplicationSchema.propTypes)).isRequired,
      linkTo: PropTypes.string,
      rowRenderer: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
      SecondaryAction: PropTypes.node,
    }),
  ),
  BottomAction: PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.elementType]),
};

ApplicationListGroups.defaultProps = {
  groups: [],
  BottomAction: null,
};

export default ApplicationListGroups;
