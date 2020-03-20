import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import numbro from 'numbro';
import { FILE_SIZE_FORMAT } from 'constants/formats/numbers';

import { makeStyles } from '@material-ui/core/styles';

import { connect } from 'react-redux';
import { withTranslation, Trans } from 'react-i18next';

import API from '@misakey/api';

import isNil from '@misakey/helpers/isNil';
import head from '@misakey/helpers/head';
import prop from '@misakey/helpers/prop';
import compose from '@misakey/helpers/compose';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';


import useHandleGenericHttpErrors from '@misakey/hooks/useHandleGenericHttpErrors';

import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';

const TOTAL_STORAGE_SPACE_AVAILABLE = 10 * 1024 * 1024;
const GET_STORAGE_QUOTA_ENDPOINT = {
  method: 'GET',
  path: '/user-storages',
  auth: true,
};

const getUsedSpace = compose(
  prop('usedSpace'),
  objectToCamelCase,
  head,
);

const useStyles = makeStyles((theme) => ({
  root: {
    width: '80%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
}));

const useFetchStorageQuota = (
  setBoxUsage,
  userId,
  handleGenericHttpErrors,
) => useCallback(
  () => API.use(GET_STORAGE_QUOTA_ENDPOINT)
    .build(null, null, objectToSnakeCase({ userId }))
    .send()
    .then((response) => {
      if (response.length > 0) {
        setBoxUsage(getUsedSpace(response));
      } else {
        setBoxUsage(0);
      }
    })
    .catch(handleGenericHttpErrors),
  [
    setBoxUsage,
    userId,
    handleGenericHttpErrors,
  ],
);

const UserStorage = ({ userId }) => {
  const classes = useStyles();
  const mounted = useRef(false);
  const [boxUsage, setBoxUsage] = useState(0);

  const handleGenericHttpErrors = useHandleGenericHttpErrors();
  const fetchStorageQuota = useFetchStorageQuota(setBoxUsage, userId, handleGenericHttpErrors);

  const boxUsagePercent = useMemo(
    () => ((isNil(boxUsage)) ? -1 : Math.round((100 * boxUsage) / TOTAL_STORAGE_SPACE_AVAILABLE)),
    [boxUsage],
  );

  const boxCurrentUsage = useMemo(() => numbro(boxUsage).format(FILE_SIZE_FORMAT), [boxUsage]);
  const boxTotalUsage = useMemo(
    () => numbro(TOTAL_STORAGE_SPACE_AVAILABLE).format(FILE_SIZE_FORMAT),
    [],
  );

  useEffect(
    () => {
      if (mounted.current === false) {
        fetchStorageQuota();
        mounted.current = true;
      }
    },
    [mounted, fetchStorageQuota],
  );

  return (
    <div className={classes.root}>
      <LinearProgress variant="determinate" value={boxUsagePercent} color="secondary" />
      <Typography>
        <Trans
          i18nKey="account:quota.description"
          values={{
            currentUsage: boxCurrentUsage,
            totalUsage: boxTotalUsage,
          }}
        >
          {'{{currentUsage}} of {{totalUsage}} used'}
        </Trans>
      </Typography>
    </div>
  );
};

UserStorage.propTypes = {
  userId: PropTypes.string.isRequired,
};

// CONNECT
const mapStateToProps = (state) => ({
  userId: state.auth.userId,
});


export default connect(mapStateToProps)(withTranslation('account')(UserStorage));
