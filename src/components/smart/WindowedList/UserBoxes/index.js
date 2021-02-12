import React, { useMemo, forwardRef } from 'react';

import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import makeStyles from '@material-ui/core/styles/makeStyles';

import routes from 'routes';
import STATUSES, { ALL } from 'constants/app/boxes/statuses';

import isNil from '@misakey/helpers/isNil';

import usePaginateBoxesByStatus from 'hooks/usePaginateBoxesByStatus';
import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import WindowedListInfiniteLoaded from 'components/smart/WindowedList/InfiniteLoaded';
import WindowedListAutosized from 'components/smart/WindowedList/Autosized';
import Row, { Skeleton } from 'components/smart/WindowedList/UserBoxes/Row';
import withDialogCreate from 'components/smart/Dialog/Boxes/Create/with';
import ListItemBoxesDeleted from 'components/smart/ListItem/Boxes/Deleted';
import MisakeyNotificationsListItem from 'components/smart/ListItem/Notifications/Misakey';
import Box from '@material-ui/core/Box';
import Title from '@misakey/ui/Typography/Title';
import Typography from '@material-ui/core/Typography';

const ButtonCreate = withDialogCreate(Button);

// CONSTANTS
// `Deleted boxes height` + `total` box height + `total` box margin
const INNER_ELEMENT_TYPE_BOTTOM_HEIGHT = 72 + 51 + 2 * 8;
// Misakey box height
const INNER_ELEMENT_TYPE_TOP_HEIGHT = 72;
const INNER_ELEMENT_TYPE_HEIGHT = INNER_ELEMENT_TYPE_BOTTOM_HEIGHT + INNER_ELEMENT_TYPE_TOP_HEIGHT;

// HOOKS
const useStyles = makeStyles((theme) => ({
  secondary: {
    color: theme.palette.primary.main,
  },
}));

const useInnerElementType = (itemCount, activeStatus, search, t, itemClasses) => useMemo(
  () => forwardRef((props, ref) => (
    <div ref={ref}>
      <MisakeyNotificationsListItem classes={itemClasses} />
      <div {...props} />
      <ListItemBoxesDeleted classes={itemClasses} activeStatus={activeStatus} search={search} />
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
        <Box>
          <ButtonCreate
            standing={BUTTON_STANDINGS.TEXT}
            size="small"
            text={t('boxes:list.empty.create')}
          />
        </Box>
      </Box>
    </div>
  )),
  [itemClasses, activeStatus, search, t, itemCount],
);

// COMPONENTS
const WindowedListBoxes = forwardRef(({
  activeStatus, selectedId, t, itemClasses, ...props
}, ref) => {
  const locationSearchParams = useLocationSearchParams();
  const classes = useStyles();

  const { search } = locationSearchParams;

  const {
    byPagination,
    itemCount,
    loadMoreItems,
  } = usePaginateBoxesByStatus(activeStatus, search);

  const itemData = useMemo(
    () => ({
      toRoute: routes.boxes.read._,
      byPagination,
      selectedId,
      guttersTop: INNER_ELEMENT_TYPE_TOP_HEIGHT,
      classes: itemClasses,
    }),
    [byPagination, selectedId, itemClasses],
  );

  const innerElementType = useInnerElementType(itemCount, activeStatus, search, t, itemClasses);

  if (isNil(itemCount) || itemCount === 0) {
    return (
      <>
        <MisakeyNotificationsListItem classes={itemClasses} />
        <Box m={2} ref={ref} display="flex" flexDirection="column" height="100%" justifyContent="center" alignItems="center">
          <Title align="center">
            <Trans i18nKey="boxes:list.empty.text">
              Commencer un chat sécurisé en cliquant sur
              <strong className={classes.secondary}>+</strong>
              ou
            </Trans>
          </Title>
          <Box>
            <ButtonCreate standing={BUTTON_STANDINGS.MAIN} text={t('boxes:list.empty.create')} />
          </Box>
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
      innerElementTypeHeight={INNER_ELEMENT_TYPE_HEIGHT}
      {...props}
    />
  );
});

WindowedListBoxes.propTypes = {
  activeStatus: PropTypes.oneOf(STATUSES),
  selectedId: PropTypes.string,
  itemClasses: PropTypes.object,
  // withTranslation
  t: PropTypes.func.isRequired,
};

WindowedListBoxes.defaultProps = {
  activeStatus: ALL,
  selectedId: null,
  itemClasses: {},
};

export default withTranslation('boxes', { withRef: true })(WindowedListBoxes);
