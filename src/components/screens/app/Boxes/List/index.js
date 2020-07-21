import React, { useMemo, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import STATUSES, { ALL } from 'constants/app/boxes/statuses';

import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';
import { selectors } from '@misakey/crypto/store/reducers';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import isNil from '@misakey/helpers/isNil';

import ElevationScroll from 'components/dumb/ElevationScroll';
import ListHeader from 'components/screens/app/Boxes/List/Header/List';
import SearchHeader from 'components/screens/app/Boxes/List/Header/Search';
import Vault from './Content/Vault';
import NoVault from './Content/NoVault';

// COMPONENTS
function BoxesList({ t, ...props }) {
  const locationSearchParams = useLocationSearchParams();
  const [contentRef, setContentRef] = useState();

  const { search } = locationSearchParams;

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

  return (
    <>
      <ElevationScroll target={contentRef}>
        {!isNil(search)
          ? <SearchHeader {...omitTranslationProps(props)} />
          : <ListHeader {...omitTranslationProps(props)} />}
      </ElevationScroll>
      {isCryptoLoaded
        ? <Vault ref={onContentRef} {...omitTranslationProps(props)} />
        : <NoVault ref={onContentRef} {...omitTranslationProps(props)} />}
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
