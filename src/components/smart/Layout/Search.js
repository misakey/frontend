import React, { useCallback } from 'react';

import { useHistory } from 'react-router-dom';
import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';
import useLocationWorkspace from '@misakey/hooks/useLocationWorkspace';

import SearchIcon from '@material-ui/icons/Search';
import IconButton from '@material-ui/core/IconButton';

const LayoutSearch = (props) => {
  const { push } = useHistory();

  // @FIXME handle role in a future version
  const locationRole = useLocationWorkspace(); // eslint-disable-line no-unused-vars
  const locationSearchParams = useLocationSearchParams();

  const onClick = useCallback(
    () => {
      const nextSearch = new URLSearchParams(locationSearchParams);
      nextSearch.set('search', '');
      push({
        search: nextSearch.toString(),
      });
    },
    [locationSearchParams, push],
  );

  return (
    <IconButton onClick={onClick} {...props}>
      <SearchIcon />
    </IconButton>
  );
};

export default LayoutSearch;
