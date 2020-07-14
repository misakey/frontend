import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import makeStyles from '@material-ui/core/styles/makeStyles';

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
import Box from '@material-ui/core/Box';
import Title from '@misakey/ui/Typography/Title';

const useStyles = makeStyles((theme) => ({
  secondary: {
    color: theme.palette.secondary.main,
  },
}));

const ButtonCreate = withDialogCreate(Button);

// COMPONENTS
function WindowedListBoxes({ activeStatus, selectedId, t, ...props }) {
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

  if (isNil(itemCount) || itemCount === 0) {
    return (
      <Box m={2} display="flex" flexDirection="column" height="100%" justifyContent="center" alignItems="center">
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
  selectedId: PropTypes.string,
  t: PropTypes.func.isRequired,
};

WindowedListBoxes.defaultProps = {
  activeStatus: ALL,
  selectedId: null,
};

export default withTranslation('boxes')(WindowedListBoxes);
