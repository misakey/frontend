import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import STATUSES, { ALL } from 'constants/app/boxes/statuses';

import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';
import { selectors } from '@misakey/crypto/store/reducer';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import isNil from '@misakey/helpers/isNil';

import ListHeader from 'components/screens/app/Boxes/List/Header/List';
import SearchHeader from 'components/screens/app/Boxes/List/Header/Search';
import VaultOpen from './Content/VaultOpen';
import VaultLocked from './Content/VaultLocked';

// COMPONENTS
function BoxesList({ t, ...props }) {
  const locationSearchParams = useLocationSearchParams();

  const { search } = locationSearchParams;

  const isCryptoLoadedSelector = useMemo(
    () => selectors.isCryptoLoaded,
    [],
  );
  const isCryptoLoaded = useSelector(isCryptoLoadedSelector);

  return (
    <>
      {!isNil(search)
        ? <SearchHeader {...omitTranslationProps(props)} />
        : <ListHeader {...omitTranslationProps(props)} />}
      {isCryptoLoaded
        ? <VaultOpen {...omitTranslationProps(props)} />
        : <VaultLocked {...omitTranslationProps(props)} />}
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
