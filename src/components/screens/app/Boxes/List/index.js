import React, { useMemo, useState, useCallback } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { TOOLBAR_MIN_HEIGHT } from '@misakey/ui/constants/sizes';
import { selectors } from '@misakey/crypto/store/reducers';

import { useBoxesContext } from 'components/smart/Context/Boxes';

import omitTranslationProps from '@misakey/core/helpers/omit/translationProps';
import isNil from '@misakey/core/helpers/isNil';

import ElevationScroll from '@misakey/ui/ElevationScroll';
import ListHeader from 'components/screens/app/Boxes/List/Header/List';
import SearchHeader from 'components/screens/app/Boxes/List/Header/Search';
import AppbarAccount from 'components/smart/AppBar/Account';
import Box from '@material-ui/core/Box';
import Vault from './Content/Vault';
import NoVault from './Content/NoVault';

// CONSTANTS
const TOOLBAR_PROPS = {
  minHeight: `${TOOLBAR_MIN_HEIGHT}px !important`,
};

// COMPONENTS
function BoxesList({ t, filterId, ...props }) {
  const [contentRef, setContentRef] = useState();

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

  const { search } = useBoxesContext();

  return (
    <>
      <ElevationScroll target={contentRef}>
        <Box display="flex" flexDirection="column">
          <AppbarAccount
            toolbarProps={TOOLBAR_PROPS}
          />
          {!isNil(search)
            ? <SearchHeader {...omitTranslationProps(props)} />
            : <ListHeader {...omitTranslationProps(props)} />}
        </Box>
      </ElevationScroll>
      {isCryptoLoaded
        ? (
          <Vault
            filterId={filterId}
            ref={onContentRef}
            search={search}
            {...omitTranslationProps(props)}
          />
        )
        : (
          <NoVault
            ref={onContentRef}
            {...omitTranslationProps(props)}
          />
        )}
    </>
  );
}

BoxesList.propTypes = {
  filterId: PropTypes.string,
  isFullWidth: PropTypes.bool,
  // withTranslation
  t: PropTypes.func.isRequired,
};

BoxesList.defaultProps = {
  filterId: null,
  isFullWidth: false,
};

export default withTranslation(['common', 'boxes'])(BoxesList);
