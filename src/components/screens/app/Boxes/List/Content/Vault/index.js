import React, { useMemo, useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import routes from 'routes';
import STATUSES from 'constants/app/boxes/statuses';

import path from '@misakey/helpers/path';
import isNil from '@misakey/helpers/isNil';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import { useRouteMatch } from 'react-router-dom';
import useInterval from '@misakey/hooks/useInterval';
// import { useLocation, useHistory } from 'react-router-dom';
// import { makeStyles } from '@material-ui/core/styles';

import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';
import usePaginateBoxesByStatusRefresh from 'hooks/usePaginateBoxesByStatus/refresh';
import useResetBoxCount from 'hooks/useResetBoxCount';
import useIdentity from 'hooks/useIdentity';
// import getNextSearch from '@misakey/helpers/getNextSearch';

import List from '@material-ui/core/List';
import WindowedListBoxes from 'components/smart/WindowedList/UserBoxes';
// import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
// import FilledInput from '@material-ui/core/FilledInput';

// HELPERS
const paramsIdPath = path(['params', 'id']);

// const useStyles = makeStyles((theme) => ({
//   search: {
//     borderRadius: theme.spacing(0.5),
//   },
//   input: {
//     padding: theme.spacing(1, 2),
//   },
// }));

// COMPONENTS
const VaultOpen = forwardRef(({ t, activeStatus, ...props }, ref) => {
  // const classes = useStyles();
  const locationSearchParams = useLocationSearchParams();

  const { identityId } = useIdentity();

  const match = useRouteMatch(routes.boxes.read._);
  const selectedId = useMemo(
    () => paramsIdPath(match),
    [match],
  );

  const hasIdentityId = useMemo(
    () => !isNil(identityId),
    [identityId],
  );

  const { search } = locationSearchParams;
  const onPaginationRefresh = usePaginateBoxesByStatusRefresh(activeStatus, search);
  const resetBoxCount = useResetBoxCount();
  const onRefresh = useCallback(
    () => (isNil(selectedId)
      ? onPaginationRefresh()
      : Promise.all([
        onPaginationRefresh(),
        resetBoxCount({ boxId: selectedId, identityId }),
      ])),
    [onPaginationRefresh, resetBoxCount, selectedId, identityId],
  );

  const intervalConfig = useMemo(
    () => ({
      delay: window.env.AUTO_REFRESH_LIST_DELAY,
      shouldStart: hasIdentityId,
    }),
    [hasIdentityId],
  );

  useInterval(onRefresh, intervalConfig);

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
      {/* @FIXME Button instead of autorefresh
      <Button
        isLoading={!hasIdentityId}
        onClick={onRefresh}
        standing={BUTTON_STANDINGS.TEXT}
        text={t('boxes:list.refresh')}
      /> */}
      <List
        ref={ref}
        component={WindowedListBoxes}
        key={search}
        selectedId={selectedId}
        disablePadding
        {...omitTranslationProps(props)}
      />
    </>
  );
});

VaultOpen.propTypes = {
  activeStatus: PropTypes.oneOf(STATUSES).isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
};

export default withTranslation('boxes', { withRef: true })(VaultOpen);
