import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import routes from 'routes';
import STATUSES, { ALL } from 'constants/app/boxes/statuses';

import isNil from '@misakey/helpers/isNil';

import usePaginateBoxesByStatus from 'hooks/usePaginateBoxesByStatus';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import WindowedListInfiniteLoaded from 'components/smart/WindowedList/InfiniteLoaded';
import WindowedListAutosized from 'components/smart/WindowedList/Autosized';
import Row, { Skeleton } from 'components/smart/WindowedList/UserBoxes/Row';
import withDialogCreate from 'components/smart/Dialog/Boxes/Create/with';

import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';
import { Box } from '@material-ui/core';
import Title from 'components/dumb/Typography/Title';

const ButtonCreate = withDialogCreate(Button);

// COMPONENTS
function WindowedListBoxes({ activeStatus, t, ...props }) {
  const locationSearchParams = useLocationSearchParams();

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
    }),
    [byPagination],
  );

  if (isNil(itemCount) || itemCount === 0) {
    return (
      <Box m={2} display="flex" flexDirection="column" height="100%" justifyContent="center" alignItems="center">
        <Title align="center">{t('boxes:list.empty.text')}</Title>
        <Box>
          <ButtonCreate standing={BUTTON_STANDINGS.MAIN} text={t('boxes:list.empty.create')} />
        </Box>
      </Box>
    );
  }

  return (
    <WindowedListInfiniteLoaded
      key={itemCount}
      Row={Row}
      Skeleton={Skeleton}
      list={WindowedListAutosized}
      loadMoreItems={loadMoreItems}
      itemCount={itemCount}
      itemSize={72}
      itemData={itemData}
      {...props}
    />
  );
}

WindowedListBoxes.propTypes = {
  activeStatus: PropTypes.oneOf(STATUSES),
  t: PropTypes.func.isRequired,
};

WindowedListBoxes.defaultProps = {
  activeStatus: ALL,
};

export default withTranslation('boxes')(WindowedListBoxes);
