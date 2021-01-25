import React, { useCallback, useState, useMemo } from 'react';

import useFetchEffect from '@misakey/hooks/useFetch/effect';
import isNil from '@misakey/helpers/isNil';
import LinearProgress from '@material-ui/core/LinearProgress';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';
import Typography from '@material-ui/core/Typography';
import { listStorageQuota, listBoxUsedSpaces, readVaultUsedSpace } from '@misakey/helpers/builder/identities';
import { useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/core/styles';
import { useTranslation } from 'react-i18next';
import formatFileSize from 'helpers/formatFileSize';

// CONSTANTS
const { identityId: IDENTITY_ID_SELECTOR } = authSelectors;

// HOOKS
const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    padding: theme.spacing(1, 0),
  },
}));

// COMPONENTS
function UserStorage() {
  const [storageQuota, setStorageQuota] = useState([]);
  const [boxUsedSpaces, setBoxUsedSpaces] = useState([]);
  const [vaultUsedSpace, setVaultUsedSpace] = useState(null);
  const identityId = useSelector(IDENTITY_ID_SELECTOR);
  const classes = useStyles();
  const { t } = useTranslation('account');

  // fetch quota available
  const onFetchStorageQuota = useCallback(() => listStorageQuota(identityId), [identityId]);
  const shouldFetchStorageQuota = useMemo(() => !isNil(identityId), [identityId]);
  const onSuccessStorageQuota = useCallback((response) => {
    setStorageQuota(response);
  }, []);
  useFetchEffect(
    onFetchStorageQuota,
    { shouldFetch: shouldFetchStorageQuota },
    { onSuccess: onSuccessStorageQuota },
  );

  // fetch box used space
  const onFetchBoxUsedSpaces = useCallback(() => listBoxUsedSpaces({ identityId }), [identityId]);
  const shouldFetchBoxUsedSpaces = useMemo(() => !isNil(identityId), [identityId]);
  const onSuccessBoxUsedSpaces = useCallback((response) => {
    setBoxUsedSpaces(response);
  }, []);
  useFetchEffect(
    onFetchBoxUsedSpaces,
    { shouldFetch: shouldFetchBoxUsedSpaces },
    { onSuccess: onSuccessBoxUsedSpaces },
  );

  // fetch vault used space
  const onFetchVaultUsedSpace = useCallback(() => readVaultUsedSpace(identityId), [identityId]);
  const shouldFetchVaultUsedSpace = useMemo(() => !isNil(identityId), [identityId]);
  const onSuccessVaultUsedSpace = useCallback((response) => {
    setVaultUsedSpace(response);
  }, []);
  useFetchEffect(
    onFetchVaultUsedSpace,
    { shouldFetch: shouldFetchVaultUsedSpace },
    { onSuccess: onSuccessVaultUsedSpace },
  );

  // compute total used space
  const totalUsedSpace = useMemo(() => {
    const total = boxUsedSpaces.reduce((tmpTotal, { value }) => tmpTotal + value, 0);
    if (isNil(vaultUsedSpace)) {
      return total;
    }
    return total + vaultUsedSpace.value;
  }, [boxUsedSpaces, vaultUsedSpace]);

  // compute total quota
  const totalStorageQuota = useMemo(
    () => storageQuota.reduce(
      (tmpTotal, { value }) => tmpTotal + value, 0,
    ), [storageQuota],
  );

  const storageState = useMemo(() => {
    if (totalStorageQuota === 0) {
      return 0;
    }
    return (totalUsedSpace / totalStorageQuota) * 100;
  }, [totalUsedSpace, totalStorageQuota]);

  return (
    <div className={classes.root}>
      <LinearProgress variant="determinate" value={storageState} />
      <Typography color="textSecondary">{t('account:quota.description', { currentUsage: formatFileSize(totalUsedSpace), totalUsage: formatFileSize(totalStorageQuota) })}</Typography>
    </div>
  );
}

export default UserStorage;
