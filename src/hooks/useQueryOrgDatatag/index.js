import isSelfOrg from 'helpers/isSelfOrg';
import isNil from '@misakey/core/helpers/isNil';
import isEmpty from '@misakey/core/helpers/isEmpty';

import { useMemo, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';
import useSafeDestr from '@misakey/hooks/useSafeDestr';
import getNextSearch from '@misakey/core/helpers/getNextSearch';

// HOOKS
// @UNUSED
export default (box) => {
  const { ownerOrgId, datatagId } = useSafeDestr(box);
  const { search, ...restLocation } = useLocation();
  const { orgId: locationOrgId, datatagId: locationDatatagId } = useLocationSearchParams();
  const { replace } = useHistory();

  const isBoxLoaded = useMemo(
    () => !isNil(box),
    [box],
  );

  const isBoxFromSelfOrg = useMemo(
    () => isSelfOrg(ownerOrgId),
    [ownerOrgId],
  );

  const boxHasDatatag = useMemo(
    () => !isEmpty(datatagId),
    [datatagId],
  );

  const orgIdsMatch = useMemo(
    () => (isBoxFromSelfOrg && isEmpty(locationOrgId)) || ownerOrgId === locationOrgId,
    [isBoxFromSelfOrg, locationOrgId, ownerOrgId],
  );

  const datatagIdsMatch = useMemo(
    () => (!boxHasDatatag && isEmpty(locationDatatagId)) || datatagId === locationDatatagId,
    [boxHasDatatag, locationDatatagId, datatagId],
  );

  const nextSearch = useMemo(
    () => {
      const nextSearchMap = [
        ['orgId', isBoxFromSelfOrg ? undefined : ownerOrgId],
        ['datatagId', boxHasDatatag ? datatagId : undefined],
      ];
      return getNextSearch(search, new Map(nextSearchMap));
    },
    [isBoxFromSelfOrg, ownerOrgId, boxHasDatatag, datatagId, search],
  );

  useEffect(
    () => {
      if (isBoxLoaded && (!orgIdsMatch || !datatagIdsMatch)) {
        replace({ search: nextSearch, ...restLocation });
      }
    },
    [datatagIdsMatch, isBoxLoaded, nextSearch, orgIdsMatch, replace, restLocation],
  );
};
