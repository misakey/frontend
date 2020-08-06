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
import Box from '@material-ui/core/Box';
import Title from '@misakey/ui/Typography/Title';
import Typography from '@material-ui/core/Typography';

const ButtonCreate = withDialogCreate(Button);

// CONSTANTS
// Box height + margin
const INNER_ELEMENT_TYPE_HEIGHT = 72 + 51 + 2 * 8;

// HOOKS
const useStyles = makeStyles((theme) => ({
  secondary: {
    color: theme.palette.secondary.main,
  },
}));


const useInnerElementType = (itemCount, activeStatus, search, t) => useMemo(
  () => forwardRef((props, ref) => (
    <div ref={ref}>
      <div {...props} />
      <ListItemBoxesDeleted activeStatus={activeStatus} search={search} />
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
  [itemCount, activeStatus, search, t],
);

// COMPONENTS
const WindowedListBoxes = forwardRef(({ activeStatus, selectedId, t, ...props }, ref) => {
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
    }),
    [byPagination, selectedId],
  );

  const innerElementType = useInnerElementType(itemCount, activeStatus, search, t);

  if (isNil(itemCount) || itemCount === 0) {
    return (
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
    );
  }

  return (
    <WindowedListInfiniteLoaded
      ref={ref}
      key={itemCount}
      Row={Row}
      Skeleton={Skeleton}
      list={WindowedListAutosized}
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
  t: PropTypes.func.isRequired,
};

WindowedListBoxes.defaultProps = {
  activeStatus: ALL,
  selectedId: null,
};

export default withTranslation('boxes', { withRef: true })(WindowedListBoxes);
