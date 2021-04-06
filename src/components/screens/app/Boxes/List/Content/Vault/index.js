import React, { useMemo, forwardRef } from 'react';
import PropTypes from 'prop-types';

import { DRAWER_QUERY_PARAM, TMP_DRAWER_QUERY_PARAMS } from '@misakey/ui/constants/drawers';
import routes from 'routes';

import path from '@misakey/core/helpers/path';
import isNil from '@misakey/core/helpers/isNil';
import omitTranslationProps from '@misakey/core/helpers/omit/translationProps';

import useLoadedAnimation from '@misakey/hooks/useLoadedAnimation';
import { useRouteMatch } from 'react-router-dom';
// import { useLocation, useHistory } from 'react-router-dom';
import makeStyles from '@material-ui/core/styles/makeStyles';
import useFetchAutojoinBoxInvitations from 'hooks/useFetchAutojoinBoxInvitations';

// import getNextSearch from '@misakey/core/helpers/getNextSearch';

import List from '@material-ui/core/List';
import Box from '@material-ui/core/Box';
import WindowedListBoxes from 'components/smart/WindowedList/UserBoxes';
import IconProgress from '@misakey/ui/Icon/Progress';
// import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
// import FilledInput from '@material-ui/core/FilledInput';

import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty';
import DoneIcon from '@material-ui/icons/Done';
import UpdateIcon from '@material-ui/icons/Update';

// CONSTANTS
const NEXT_SEARCH_MAP = [[DRAWER_QUERY_PARAM, undefined], [TMP_DRAWER_QUERY_PARAMS, undefined]];
const PROGRESS_PROPS = { disableShrink: true };
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
  loader: {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
  },
  flexTrans: {
    display: 'flex',
  },
}));

// COMPONENTS
const VaultOpen = forwardRef(({ search, isFullWidth, ...props }, ref) => {
  const classes = useStyles({ isFullWidth });

  const match = useRouteMatch(routes.boxes.read._);
  const selectedId = useMemo(
    () => paramsIdPath(match),
    [match],
  );

  const { done, joining } = useFetchAutojoinBoxInvitations();
  const loadedAnimation = useLoadedAnimation(!done);

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
      >
        {(!done || !loadedAnimation) && (
          <Box className={classes.loader}>
            <IconProgress
              isLoading={!done}
              done={done}
              color="primary"
              fontSize="small"
              Icon={isNil(joining) ? HourglassEmptyIcon : UpdateIcon}
              DoneIcon={DoneIcon}
              progressProps={PROGRESS_PROPS}
            />
          </Box>
        )}
      </List>
    </>
  );
});

VaultOpen.propTypes = {
  search: PropTypes.string,
  isFullWidth: PropTypes.bool,
};

VaultOpen.defaultProps = {
  search: null,
  isFullWidth: false,
};

export default VaultOpen;
