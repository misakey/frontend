import React, { useMemo, forwardRef } from 'react';

import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import makeStyles from '@material-ui/core/styles/makeStyles';

import routes from 'routes';

import isNil from '@misakey/helpers/isNil';
import isSelfOrg from 'helpers/isSelfOrg';

import usePaginateBoxesByStatus from 'hooks/usePaginateBoxesByStatus';
import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';
import useOrgId from '@misakey/react-auth/hooks/useOrgId';

import { BUTTON_STANDINGS } from '@misakey/ui/Button';
import WindowedListInfiniteLoaded from 'components/smart/WindowedList/InfiniteLoaded';
import WindowedListAutosized from 'components/smart/WindowedList/Autosized';
import Row, { Skeleton } from 'components/smart/WindowedList/UserBoxes/Row';
import ButtonCreate from 'components/smart/Dialog/Boxes/Create/with/Button';
// import ListItemBoxesDeleted from 'components/smart/ListItem/Boxes/Deleted';
import Box from '@material-ui/core/Box';
import Title from '@misakey/ui/Typography/Title';
import Typography from '@material-ui/core/Typography';

// HOOKS
const useStyles = makeStyles((theme) => ({
  secondary: {
    color: theme.palette.primary.main,
  },
}));

const useInnerElementType = (
  itemCount, t,
  selfOrgSelected, /* filterId, search, itemClasses */
) => useMemo(
  () => forwardRef((props, ref) => (
    <div ref={ref}>
      <div {...props} />
      {/*
        @FIXME cannot be working if user has boxes in multiple organizations
      <ListItemBoxesDeleted classes={itemClasses} filterId={filterId} search={search} /> */}
      <Box
        m={1}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        <Typography variant="body2" color="textSecondary" align="center">
          {t('boxes:list.count.text', { count: itemCount })}
        </Typography>
        {selfOrgSelected && (
          <Box>
            <ButtonCreate
              standing={BUTTON_STANDINGS.TEXT}
              size="small"
              text={t('boxes:list.empty.create')}
            />
          </Box>
        )}
      </Box>
    </div>
  )),
  [t, itemCount, selfOrgSelected],
);

// COMPONENTS
const WindowedListBoxes = forwardRef(({
  filterId, queryParams, onError,
  selectedId, t, itemClasses, itemProps, ...props
}, ref) => {
  const locationSearchParams = useLocationSearchParams();
  const classes = useStyles();

  const { search } = locationSearchParams;

  const orgId = useOrgId();
  const selfOrgSelected = useMemo(
    () => isSelfOrg(orgId),
    [orgId],
  );

  const {
    byPagination,
    itemCount,
    loadMoreItems,
  } = usePaginateBoxesByStatus(filterId, queryParams, search, onError);

  const itemData = useMemo(
    () => ({
      toRoute: routes.boxes.read._,
      byPagination,
      selectedId,
      classes: itemClasses,
      ...itemProps,
    }),
    [byPagination, selectedId, itemClasses, itemProps],
  );

  const innerElementType = useInnerElementType(
    itemCount, t, selfOrgSelected, /* itemClasses, filterId, search, */
  );

  if (isNil(itemCount) || itemCount === 0) {
    return (
      <>
        <Box m={2} ref={ref} display="flex" flexDirection="column" height="100%" justifyContent="center" alignItems="center">
          <Title align="center">
            <Trans i18nKey={selfOrgSelected ? 'boxes:list.empty.text' : 'boxes:list.empty.disabled'}>
              Commencer un chat sécurisé en cliquant sur
              <strong className={classes.secondary}>+</strong>
              ou
            </Trans>
          </Title>
          {selfOrgSelected && (
          <Box>
            <ButtonCreate
              standing={BUTTON_STANDINGS.MAIN}
              text={t('boxes:list.empty.create')}
            />
          </Box>
          )}
        </Box>
      </>
    );
  }

  return (
    <WindowedListAutosized
      ref={ref}
      key={itemCount}
      Row={Row}
      Skeleton={Skeleton}
      component={WindowedListInfiniteLoaded}
      loadMoreItems={loadMoreItems}
      itemCount={itemCount}
      itemSize={72}
      itemData={itemData}
      innerElementType={innerElementType}
      {...props}
    />
  );
});

WindowedListBoxes.propTypes = {
  filterId: PropTypes.string,
  queryParams: PropTypes.object,
  onError: PropTypes.func,
  selectedId: PropTypes.string,
  itemClasses: PropTypes.object,
  itemProps: PropTypes.object,
  // withTranslation
  t: PropTypes.func.isRequired,
};

WindowedListBoxes.defaultProps = {
  filterId: null,
  queryParams: {},
  onError: null,
  selectedId: null,
  itemClasses: {},
  itemProps: {},
};

export default withTranslation('boxes', { withRef: true })(WindowedListBoxes);
