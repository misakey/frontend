import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import isNil from '@misakey/helpers/isNil';

import log from '@misakey/helpers/log';
import { fetchLinkedApplications } from 'helpers/fetchApplications';

import Card from 'components/dumb/Card';
import ApplicationsList from 'components/dumb/List/Applications';
import NoLinkedApplication from 'components/dumb/Application/NoLinked';

// COMPONENTS
function LinkedApplicationsList({ t, userId, isAuthenticated }) {
  const [error, setError] = useState();
  const [list, setList] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const shouldFetch = useMemo(
    () => !isFetching && isAuthenticated && isNil(list) && isNil(error),
    [isFetching, isAuthenticated, list, error],
  );

  const fetchList = useCallback(() => {
    setIsFetching(true);
    return fetchLinkedApplications(userId)
      .then((linkedApplications) => {
        setList(linkedApplications);
      })
      .catch((e) => {
        setError(e);
        log(e);
      })
      .finally(() => setIsFetching(false));
  }, [userId]);

  useEffect(() => {
    if (shouldFetch) {
      fetchList();
    }
  }, [shouldFetch, fetchList]);

  if (!isAuthenticated || (!isFetching && (isNil(list) || list.length === 0))) {
    return (<NoLinkedApplication isAuthenticated={isAuthenticated} />);
  }

  return (
    <Card
      title={t('linkedApplications.title')}
      mb={3}
    >
      <ApplicationsList
        isFetching={isFetching}
        error={error}
        applications={list || []}
      />
    </Card>
  );
}

LinkedApplicationsList.propTypes = {
  t: PropTypes.func.isRequired,
  userId: PropTypes.string,
  isAuthenticated: PropTypes.bool.isRequired,
};

LinkedApplicationsList.defaultProps = {
  userId: null,
};

// CONNECT
const mapStateToProps = (state) => ({
  userId: state.auth.userId,
  isAuthenticated: !!state.auth.token,
});

export default connect(mapStateToProps)(withTranslation(['components', 'screens'])(LinkedApplicationsList));
