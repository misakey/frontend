import React, { useMemo } from 'react';
import PropTypes from 'prop-types';


import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';

// COMPONENTS
// @FIXME add to @misakey/ui
const LimitedList = ({ items, limit, extraText, renderListItem }) => {
  const limitItems = useMemo(() => items.slice(0, limit), [items, limit]);

  const extraCount = useMemo(
    () => (items.length > limit ? items.length - limit : 0),
    [items, limit],
  );

  return (
    <List dense>
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
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  limit: PropTypes.number.isRequired,
  extraText: PropTypes.string,
  renderListItem: PropTypes.func.isRequired,
};

LimitedList.defaultProps = {
  extraText: '',
};

export default LimitedList;
