import React, { useMemo, forwardRef } from 'react';
import PropTypes from 'prop-types';

import { AGENT } from '@misakey/ui/constants/organizations/roles';

import isNil from '@misakey/helpers/isNil';

import { useTranslation } from 'react-i18next';
import usePaginateOrgAgents from 'hooks/usePaginateOrgAgents';
import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';

import WindowedListInfiniteLoaded from 'components/smart/WindowedList/InfiniteLoaded';
import WindowedListAutosized from 'components/smart/WindowedList/Autosized';
import Row, { Skeleton } from 'components/screens/app/Organizations/Read/Agents/List/Row';
import Box from '@material-ui/core/Box';
import Title from '@misakey/ui/Typography/Title';
import Typography from '@material-ui/core/Typography';

// COMPONENTS
const WindowedListOrgAgents = forwardRef(({
  organizationId, queryParams, onError, children,
  selectedId, itemClasses, itemProps, innerElementEnding, ...props
}, ref) => {
  const { search } = useLocationSearchParams();
  const { t } = useTranslation('organizations');

  const {
    byPagination,
    itemCount,
    loadMoreItems,
  } = usePaginateOrgAgents(organizationId, queryParams, search, onError);

  const itemData = useMemo(
    () => ({
      role: AGENT,
      byPagination,
      selectedId,
      classes: itemClasses,
      ...itemProps,
    }),
    [byPagination, selectedId, itemClasses, itemProps],
  );

  const innerElementType = useMemo(
    () => forwardRef((innerElementProps, innerElementRef) => (
      <div ref={innerElementRef}>
        {children}
        <div {...innerElementProps} />
        <Box
          m={1}
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
        >
          <Typography variant="body2" color="textSecondary" align="center">
            {t('organizations:agents.count.text', { count: itemCount })}
          </Typography>
          {innerElementEnding}
        </Box>
      </div>
    )),
    [children, t, itemCount, innerElementEnding],
  );

  if (isNil(itemCount) || itemCount === 0) {
    return (
      <Box ref={ref} display="flex" flexDirection="column" height="100%" alignItems="center">
        <Box mx={2}>
          <Title align="center">
            {t('organizations:agents.empty')}
          </Title>
        </Box>
      </Box>
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

WindowedListOrgAgents.propTypes = {
  organizationId: PropTypes.string.isRequired,
  queryParams: PropTypes.object,
  onError: PropTypes.func,
  selectedId: PropTypes.string,
  itemClasses: PropTypes.object,
  itemProps: PropTypes.object,
  children: PropTypes.node,
  innerElementEnding: PropTypes.node,
};

WindowedListOrgAgents.defaultProps = {
  queryParams: {},
  onError: null,
  selectedId: null,
  itemClasses: {},
  itemProps: {},
  children: null,
  innerElementEnding: null,
};

export default WindowedListOrgAgents;
