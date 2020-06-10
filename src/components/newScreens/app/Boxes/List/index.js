import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';
import usePublicKeysWeCanDecryptFrom from '@misakey/crypto/hooks/usePublicKeysWeCanDecryptFrom';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';

import List from '@material-ui/core/List';
import ListHeader from 'components/newScreens/app/Boxes/List/ListHeader';
import SearchHeader from 'components/newScreens/app/Boxes/List/SearchHeader';
import WindowedListBoxes from 'components/smart/WindowedList/UserBoxes';
import ButtonWithDialogPassword from 'components/smart/Dialog/Password/with/Button';
import Box from '@material-ui/core/Box';
import Title from 'components/dumb/Typography/Title';

// COMPONENTS
function BoxesList({ t, ...props }) {
  const locationSearchParams = useLocationSearchParams();

  const { search } = locationSearchParams;

  const publicKeysWeCanDecryptFrom = usePublicKeysWeCanDecryptFrom();
  const vaultIsOpen = useMemo(
    () => !isEmpty(publicKeysWeCanDecryptFrom),
    [publicKeysWeCanDecryptFrom],
  );

  return (
    <>
      {!isNil(search)
        ? <SearchHeader {...omitTranslationProps(props)} />
        : <ListHeader {...omitTranslationProps(props)} />}
      {vaultIsOpen ? (
        <List
          component={WindowedListBoxes}
          key={search}
          disablePadding
        />
      ) : (
        <Box
          m={2}
        >
          <Title>{t('boxes:list.open')}</Title>
          <ButtonWithDialogPassword text={t('common:open')} />
        </Box>
      )}
    </>
  );
}

BoxesList.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common', 'boxes'])(BoxesList);
