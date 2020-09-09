import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import STATUSES, { ALL } from 'constants/app/boxes/statuses';
import { selectors } from '@misakey/crypto/store/reducers';
import routes from 'routes';

import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';
import useInterval from '@misakey/hooks/useInterval';
import usePaginateBoxesByStatusRefresh from 'hooks/usePaginateBoxesByStatus/refresh';
import useResetBoxCount from 'hooks/useResetBoxCount';
import useIdentity from 'hooks/useIdentity';
import { useRouteMatch } from 'react-router-dom';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import isNil from '@misakey/helpers/isNil';
import path from '@misakey/helpers/path';

import ElevationScroll from 'components/dumb/ElevationScroll';
import ListHeader from 'components/screens/app/Boxes/List/Header/List';
import SearchHeader from 'components/screens/app/Boxes/List/Header/Search';
import Vault from './Content/Vault';
import NoVault from './Content/NoVault';

// HELPERS
const paramsIdPath = path(['params', 'id']);

// COMPONENTS
function BoxesList({ t, activeStatus, ...props }) {
  const locationSearchParams = useLocationSearchParams();
  const match = useRouteMatch(routes.boxes.read._);
  const [contentRef, setContentRef] = useState();

  const { search } = locationSearchParams;
  const selectedId = useMemo(
    () => paramsIdPath(match),
    [match],
  );

  const isCryptoLoadedSelector = useMemo(
    () => selectors.isCryptoLoaded,
    [],
  );
  const isCryptoLoaded = useSelector(isCryptoLoadedSelector);

  const onContentRef = useCallback(
    (ref) => {
      setContentRef(ref);
    },
    [setContentRef],
  );

  const { identityId } = useIdentity();

  const hasIdentityId = useMemo(
    () => !isNil(identityId),
    [identityId],
  );

  const onPaginationRefresh = usePaginateBoxesByStatusRefresh(activeStatus, search);
  const resetBoxCount = useResetBoxCount();
  const onRefresh = useCallback(
    () => (isNil(selectedId)
      ? onPaginationRefresh()
      : Promise.all([
        onPaginationRefresh(),
        resetBoxCount({ boxId: selectedId, identityId }),
      ])),
    [selectedId, onPaginationRefresh, resetBoxCount, identityId],
  );

  const intervalConfig = useMemo(
    () => ({
      delay: window.env.AUTO_REFRESH_LIST_DELAY,
      shouldStart: hasIdentityId,
    }),
    [hasIdentityId],
  );

  useInterval(onRefresh, intervalConfig);

  return (
    <>
      <ElevationScroll target={contentRef}>
        {!isNil(search)
          ? <SearchHeader activeStatus={activeStatus} {...omitTranslationProps(props)} />
          : <ListHeader activeStatus={activeStatus} {...omitTranslationProps(props)} />}
      </ElevationScroll>
      {isCryptoLoaded
        ? (
          <Vault ref={onContentRef} activeStatus={activeStatus} {...omitTranslationProps(props)} />)
        : (
          <NoVault
            ref={onContentRef}
            activeStatus={activeStatus}
            {...omitTranslationProps(props)}
          />
        )}
    </>
  );
}

BoxesList.propTypes = {
  t: PropTypes.func.isRequired,
  activeStatus: PropTypes.oneOf(STATUSES),
};

BoxesList.defaultProps = {
  activeStatus: ALL,
};

export default withTranslation(['common', 'boxes'])(BoxesList);
