import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useLocation, useHistory } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { useSelector } from 'react-redux';

import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';
import { selectors } from '@misakey/crypto/store/reducer';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import isNil from '@misakey/helpers/isNil';
import getNextSearch from '@misakey/helpers/getNextSearch';

import List from '@material-ui/core/List';
import ListHeader from 'components/screens/app/Boxes/List/ListHeader';
import SearchHeader from 'components/screens/app/Boxes/List/SearchHeader';
import WindowedListBoxes from 'components/smart/WindowedList/UserBoxes';
import ButtonWithDialogPassword from 'components/smart/Dialog/Password/with/Button';
import Box from '@material-ui/core/Box';
import Title from 'components/dumb/Typography/Title';
import FilledInput from '@material-ui/core/FilledInput';


const useStyles = makeStyles((theme) => ({
  search: {
    borderRadius: theme.spacing(0.5),
  },
  input: {
    padding: theme.spacing(1, 2),
  },
}));

// COMPONENTS
function BoxesList({ t, ...props }) {
  const classes = useStyles();
  const locationSearchParams = useLocationSearchParams();

  const { search } = locationSearchParams;
  const { search: locationSearch, pathname } = useLocation();
  const { push } = useHistory();

  const isCryptoLoadedSelector = useMemo(
    () => selectors.isCryptoLoaded,
    [],
  );
  const isCryptoLoaded = useSelector(isCryptoLoadedSelector);

  const openSearch = useCallback(
    () => push({ pathname, search: getNextSearch(locationSearch, new Map([['search', '']])) }),
    [locationSearch, pathname, push],
  );

  return (
    <>
      {!isNil(search)
        ? <SearchHeader {...omitTranslationProps(props)} />
        : <ListHeader {...omitTranslationProps(props)} />}
      {isCryptoLoaded ? (
        <>
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
          <List
            component={WindowedListBoxes}
            key={search}
            disablePadding
          />
        </>
      ) : (
        <Box m={2} display="flex" flexDirection="column" height="100%" justifyContent="center" alignItems="center">
          <Title align="center">{t('boxes:list.open')}</Title>
          <Box>
            <ButtonWithDialogPassword text={t('common:open')} />
          </Box>
        </Box>
      )}
    </>
  );
}

BoxesList.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation(['common', 'boxes'])(BoxesList);
