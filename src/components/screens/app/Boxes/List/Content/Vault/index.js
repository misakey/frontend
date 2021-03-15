import React, { useMemo, forwardRef } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { DRAWER_QUERY_PARAM, TMP_DRAWER_QUERY_PARAMS } from '@misakey/ui/constants/drawers';
import routes from 'routes';

import path from '@misakey/helpers/path';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import { useRouteMatch } from 'react-router-dom';
// import { useLocation, useHistory } from 'react-router-dom';
import makeStyles from '@material-ui/core/styles/makeStyles';

// import getNextSearch from '@misakey/helpers/getNextSearch';

import List from '@material-ui/core/List';
import WindowedListBoxes from 'components/smart/WindowedList/UserBoxes';
// import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
// import FilledInput from '@material-ui/core/FilledInput';

// CONSTANTS
const NEXT_SEARCH_MAP = [[DRAWER_QUERY_PARAM, undefined], [TMP_DRAWER_QUERY_PARAMS, undefined]];

// HELPERS
const paramsIdPath = path(['params', 'id']);

const useStyles = makeStyles((theme) => ({
  // search: {
  //   borderRadius: theme.spacing(0.5),
  // },
  // input: {
  //   padding: theme.spacing(1, 2),
  // },
  documents: {
    color: 'inherit',
    display: 'inline-flex',
    justifyContent: 'space-between',
    padding: theme.spacing(2),
    textDecoration: 'none',
    borderTop: `1px solid ${theme.palette.divider}`,
  },
  listItemContainer: ({ isFullWidth }) => (isFullWidth ? {
    [theme.breakpoints.up('md')]: {
      maxWidth: theme.breakpoints.values.md,
      left: '50% !important',
      transform: 'translateX(-50%)',
    },
  } : {}),
}));

// COMPONENTS
const VaultOpen = forwardRef(({ t, search, isFullWidth, ...props }, ref) => {
  const classes = useStyles({ isFullWidth });

  const match = useRouteMatch(routes.boxes.read._);
  const selectedId = useMemo(
    () => paramsIdPath(match),
    [match],
  );

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
        itemClasses={{ container: classes.listItemContainer, root: classes.listItemContainer }}
        itemProps={{ nextSearchMap: NEXT_SEARCH_MAP }}
        {...omitTranslationProps(props)}
      />
    </>
  );
});

VaultOpen.propTypes = {
  search: PropTypes.string,
  isFullWidth: PropTypes.bool,
  // withTranslation
  t: PropTypes.func.isRequired,
};

VaultOpen.defaultProps = {
  search: null,
  isFullWidth: false,
};

export default withTranslation(['boxes', 'document'], { withRef: true })(VaultOpen);
