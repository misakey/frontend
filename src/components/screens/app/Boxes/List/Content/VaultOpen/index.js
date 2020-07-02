import React, { useMemo } from 'react';

import routes from 'routes';

import { useRouteMatch } from 'react-router-dom';
// import { useLocation, useHistory } from 'react-router-dom';
// import { makeStyles } from '@material-ui/core/styles';

import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';
// import getNextSearch from '@misakey/helpers/getNextSearch';

import List from '@material-ui/core/List';
import WindowedListBoxes from 'components/smart/WindowedList/UserBoxes';
// import FilledInput from '@material-ui/core/FilledInput';


// const useStyles = makeStyles((theme) => ({
//   search: {
//     borderRadius: theme.spacing(0.5),
//   },
//   input: {
//     padding: theme.spacing(1, 2),
//   },
// }));

// COMPONENTS
function VaultOpen() {
  // const classes = useStyles();
  const locationSearchParams = useLocationSearchParams();

  const { params } = useRouteMatch(routes.boxes.read._);
  const { id: selectedId } = useMemo(
    () => params || {},
    [params],
  );
  const { search } = locationSearchParams;
  // const { search: locationSearch, pathname } = useLocation();
  // const { push } = useHistory();

  // const openSearch = useCallback(
  //   () => push({ pathname, search: getNextSearch(locationSearch, new Map([['search', '']])) }),
  //   [locationSearch, pathname, push],
  // );

  return (
    <>
      {/* Uncomment when search is implemented in backend */}
      {/* {isNil(search) && (
            <Box m={1}>
              <FilledInput
                classes={{ root: classes.search, input: classes.input }}
                onFocus={openSearch}
                placeholder={t('search')}
                disableUnderline
                fullWidth
                size="small"
                readOnly
              />
            </Box>
          )} */}
      <List
        component={WindowedListBoxes}
        key={search}
        selectedId={selectedId}
        disablePadding
      />
    </>
  );
}


export default VaultOpen;
