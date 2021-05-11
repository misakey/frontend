import React, { useMemo, useState, useCallback } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { TOOLBAR_MIN_HEIGHT } from '@misakey/ui/constants/sizes';
import { selectors } from '@misakey/react/crypto/store/reducers';

import omitTranslationProps from '@misakey/core/helpers/omit/translationProps';

import useFetchOrganizations from 'hooks/useFetchOrganizations';
import useFetchDatatags from 'hooks/useFetchDatatags';
import { useSelector } from 'react-redux';
import useXsMediaQuery from '@misakey/hooks/useXsMediaQuery';
import useLoadedAnimation from '@misakey/hooks/useLoadedAnimation';

import ElevationScroll from '@misakey/ui/ElevationScroll';
import ListHeader from 'components/screens/app/Boxes/List/Header/List';
// import SearchHeader from 'components/screens/app/Boxes/List/Header/Search';
import AppbarAccount from 'components/smart/AppBar/Account';
import Box from '@material-ui/core/Box';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import AutocompleteBoxes, { FACET_ORGANIZATION, FACET_DATATAG } from 'components/smart/Autocomplete/Boxes';
import SearchIcon from '@material-ui/icons/Search';
import ScreenSplashVault from '@misakey/ui/Screen/Splash/Vault';
import Vault from './Content/Vault';
import NoVault from './Content/NoVault';

// CONSTANTS
const TOOLBAR_PROPS = {
  minHeight: `${TOOLBAR_MIN_HEIGHT}px !important`,
};

const AUTOCOMPLETE_BOXES_ANCHOR_POSITION = {
  top: 0,
  left: 0,
};

// COMPONENTS
function BoxesList({ t, isFullWidth, ...props }) {
  const [contentRef, setContentRef] = useState();
  const [value, setValue] = useState([]);
  const isXs = useXsMediaQuery();

  const autocompleteButtonProps = useMemo(
    () => (isXs
      ? {
        fullWidth: true,
        text: t('boxes:list.search.title.long'),
      }
      : {
        variant: 'contained',
        startIcon: <SearchIcon />,
        text: t('boxes:list.search.title.short'),
      }),
    [isXs, t],
  );

  const isCryptoLoadedSelector = useMemo(
    () => selectors.isCryptoLoaded,
    [],
  );
  const isCryptoLoaded = useSelector(isCryptoLoadedSelector);

  const {
    isFetching: isFetchingOrganizations,
    shouldFetch: shouldFetchOrganizations,
    organizations,
  } = useFetchOrganizations();
  const {
    isFetching: isFetchingDatatags,
    shouldFetch: shouldFetchDatatags,
    datatags,
  } = useFetchDatatags();

  const boxListReady = useMemo(
    () => !isFetchingOrganizations && !shouldFetchOrganizations
      && !isFetchingDatatags && !shouldFetchDatatags,
    [isFetchingDatatags, isFetchingOrganizations, shouldFetchDatatags, shouldFetchOrganizations],
  );
  const boxListReadyAnimation = useLoadedAnimation(!boxListReady);

  const options = useMemo(
    () => [
      ...(organizations || []).map((org) => ({ ...org, facet: FACET_ORGANIZATION })),
      ...(datatags || []).map((datatag) => ({ ...datatag, facet: FACET_DATATAG })),
    ],
    [datatags, organizations],
  );

  const onContentRef = useCallback(
    (ref) => {
      setContentRef(ref);
    },
    [setContentRef],
  );

  const onChange = useCallback(
    (event, newValue) => {
      setValue(newValue);
    },
    [],
  );

  return (
    <>
      <ElevationScroll target={contentRef}>
        <Box display="flex" flexDirection="column">
          <AppbarAccount
            toolbarProps={TOOLBAR_PROPS}
          >
            {!isXs && <BoxFlexFill />}
            <AutocompleteBoxes
              anchorPosition={AUTOCOMPLETE_BOXES_ANCHOR_POSITION}
              fullScreen={isFullWidth}
              value={value}
              onChange={onChange}
              buttonProps={autocompleteButtonProps}
              options={options}
            />
            {!isXs && <BoxFlexFill />}
          </AppbarAccount>
          <ListHeader {...omitTranslationProps(props)} />
        </Box>
      </ElevationScroll>
      {boxListReadyAnimation ? (
        <>
          {isCryptoLoaded
            ? (
              <Vault
                // filterId={filterId}
                ref={onContentRef}
                // search={search}
                isFullWidth={isFullWidth}
                {...omitTranslationProps(props)}
              />
            )
            : (
              <NoVault
                ref={onContentRef}
                isFullWidth={isFullWidth}
                {...omitTranslationProps(props)}
              />
            )}
        </>
      ) : (
        <ScreenSplashVault done={boxListReady} />
      )}
    </>
  );
}

BoxesList.propTypes = {
  isFullWidth: PropTypes.bool,
  // withTranslation
  t: PropTypes.func.isRequired,
};

BoxesList.defaultProps = {
  isFullWidth: false,
};

export default withTranslation(['common', 'boxes'])(BoxesList);
