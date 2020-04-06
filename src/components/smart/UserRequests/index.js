import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import REQUEST_STATUSES, { DONE } from 'constants/databox/status';

import isNil from '@misakey/helpers/isNil';

import useLocationSearchParams from '@misakey/hooks/useLocationSearchParams';

import UserRequestsList from 'components/smart/List/UserRequests';
import ChipLinkUserRequests from 'components/smart/Chip/UserRequests/Link';
import ChipUserRequests from 'components/smart/Chip/UserRequests';
import Title from 'components/dumb/Typography/Title';
import Box from '@material-ui/core/Box';
import Card from 'components/dumb/Card';

// HELPERS
const getActiveStatus = (param, defaultActiveStatus) => {
  const activeStatus = REQUEST_STATUSES.find((requestStatus) => requestStatus === param);
  return isNil(activeStatus) ? defaultActiveStatus : activeStatus;
};

// COMPONENTS
const UserRequests = ({
  searchKey,
  defaultActiveStatus,
  t,
}) => {
  const [localActiveStatus, setLocalActiveStatus] = useState(defaultActiveStatus);

  const { [searchKey]: searchActiveStatus } = useLocationSearchParams();

  const isStateMode = useMemo(
    () => isNil(searchKey),
    [searchKey],
  );

  const activeStatus = useMemo(
    () => (isStateMode
      ? localActiveStatus
      : getActiveStatus(searchActiveStatus, defaultActiveStatus)),
    [isStateMode, localActiveStatus, searchActiveStatus, defaultActiveStatus],
  );

  const onChangeLocalActiveStatus = useCallback(
    (e, nextActiveStatus) => setLocalActiveStatus(nextActiveStatus),
    [setLocalActiveStatus],
  );

  const ChipItem = useMemo(
    () => (isStateMode
      ? ChipUserRequests
      : ChipLinkUserRequests),
    [isStateMode],
  );

  const chipItemProps = useMemo(
    () => (isStateMode
      ? {
        onClick: onChangeLocalActiveStatus,
      }
      : {
        searchKey,
      }),
    [isStateMode, onChangeLocalActiveStatus, searchKey],
  );

  return (
    <>
      <Title>
        {t('citizen:requests.list.title')}
      </Title>
      <Box display="flex" justifyContent="flex-start" flexWrap="wrap">
        {REQUEST_STATUSES.map((status) => (
          <ChipItem
            key={status}
            value={status}
            activeValue={activeStatus}
            label={t(`citizen:requests.list.filters.status.${status}`)}
            size="small"
            variant="outlined"
            {...chipItemProps}
          />
        ))}
      </Box>
      <Card mb={3}>
        <UserRequestsList activeStatus={activeStatus} />
      </Card>
    </>
  );
};

UserRequests.propTypes = {
  searchKey: PropTypes.string,
  defaultActiveStatus: PropTypes.oneOf(REQUEST_STATUSES),
  // withTranslation
  t: PropTypes.func.isRequired,
};

UserRequests.defaultProps = {
  // when default (isNil), activates state dependant mode
  // else, activates route search dependant mode
  searchKey: null,
  defaultActiveStatus: DONE,
};

export default withTranslation('citizen')(UserRequests);
