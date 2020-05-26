import React from 'react';
import PropTypes from 'prop-types';

import LastBoxes from 'components/newScreens/Boxes/List/LastBoxes';
import SearchView from 'components/newScreens/Boxes/List/SearchView';

const SEARCH = 'search';

function BoxesList({ selectedDrawer, ...props }) {
  if (selectedDrawer === SEARCH) {
    return <SearchView {...props} />;
  }

  return <LastBoxes {...props} />;
}

BoxesList.propTypes = {
  // DRAWER
  selectedDrawer: PropTypes.string,
};

BoxesList.defaultProps = {
  selectedDrawer: null,
};

export default BoxesList;
