import React from 'react';

import ListHeader from 'components/newScreens/app/Boxes/List/ListHeader';
import SearchHeader from 'components/newScreens/app/Boxes/List/SearchHeader';

import List from '@material-ui/core/List';
import WindowedListBoxes from 'components/smart/WindowedList/UserBoxes';

import isNil from '@misakey/helpers/isNil';
import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';

function BoxesList({ ...props }) {
  const locationSearchParams = useLocationSearchParams();

  const { search } = locationSearchParams;

  return (
    <>
      {!isNil(search) ? <SearchHeader {...props} /> : <ListHeader {...props} />}
      <List
        component={WindowedListBoxes}
        key={search}
        disablePadding
      />
    </>
  );
}

export default BoxesList;
