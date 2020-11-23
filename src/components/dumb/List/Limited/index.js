import React, { useMemo } from 'react';
import PropTypes from 'prop-types';


import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

// COMPONENTS
// @FIXME add to @misakey/ui
const LimitedList = ({ items, limit, emptyText, extraText, renderListItem }) => {
  const isEmpty = useMemo(() => items.length === 0, [items]);

  const limitItems = useMemo(() => items.slice(0, limit), [items, limit]);

  const extraCount = useMemo(
    () => (items.length > limit ? items.length - limit : 0),
    [items, limit],
  );

  return (
    <List dense>
      {isEmpty && emptyText}
      {limitItems.map(renderListItem)}
      {extraCount > 0 && (
        <ListItem dense disableGutters>
          <ListItemText disableTypography>
            <Typography variant="body2" color="textSecondary">
              +
              {` ${extraCount} ${extraText}`}
            </Typography>
          </ListItemText>
        </ListItem>
      )}
    </List>
  );
};

LimitedList.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string,
      PropTypes.number,
    ]),
  ).isRequired,
  limit: PropTypes.number.isRequired,
  emptyText: PropTypes.node,
  extraText: PropTypes.node,
  renderListItem: PropTypes.func.isRequired,
};

LimitedList.defaultProps = {
  emptyText: '',
  extraText: '',
};

export default LimitedList;
