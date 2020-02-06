import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import routes from 'routes';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';

import log from '@misakey/helpers/log';
import { fetchLinkedApplications } from 'helpers/fetchApplications';

import Redirect from 'components/dumb/Redirect';
import Card from 'components/dumb/Card';
import ApplicationsList from 'components/dumb/List/Applications';
import Onboarding from 'components/dumb/Application/Onboarding';
import Title from 'components/dumb/Typography/Title';
import { IS_PLUGIN } from 'constants/plugin';
import { setOnboardingDone } from 'helpers/plugin';

// COMPONENTS
function LinkedApplicationsList({ t, userId, isAuthenticated }) {
  const [error, setError] = useState();
  const [list, setList] = useState(null);
  const [isFetching, setIsFetching] = useState(false);

  const shouldFetch = useMemo(
    () => !isFetching && isAuthenticated && isNil(list) && isNil(error),
    [isFetching, isAuthenticated, list, error],
  );

  const userHasApps = useMemo(() => !isEmpty(list), [list]);

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

  if (!isAuthenticated || (!isFetching && !userHasApps)) {
    return (<Onboarding isAuthenticated={isAuthenticated} />);
  }

  if (IS_PLUGIN) {
    setOnboardingDone();
    return <Redirect to={routes.plugin._} />;
  }

  return (
    <>
      <Title>
        {t('linkedApplications.title')}
      </Title>
      <Card mb={3}>
        <ApplicationsList
          isFetching={isFetching}
          error={error}
          applications={list || []}
          withBlobCount
        />
      </Card>
    </>
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
