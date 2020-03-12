import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import routes from 'routes';

import isEmpty from '@misakey/helpers/isEmpty';

import { setOnboardingDone } from '@misakey/helpers/plugin';

import Redirect from 'components/dumb/Redirect';
import Card from 'components/dumb/Card';
import ApplicationsList from 'components/dumb/List/Applications';
import Onboarding from 'components/dumb/Onboarding/Citizen';
import Title from 'components/dumb/Typography/Title';
import withMyApplications from 'components/smart/withMyApplications';

import { IS_PLUGIN } from 'constants/plugin';
import { WORKSPACE } from 'constants/workspaces';

import ApplicationSchema from 'store/schemas/Application';

// COMPONENTS
function LinkedApplicationsList({
  t,
  myApplications,
  isAuthenticated,
  isFetchingMyApplications,
}) {
  const { [WORKSPACE.CITIZEN]: applications } = myApplications;

  const userHasApps = useMemo(() => !isEmpty(applications), [applications]);

  if (!isAuthenticated || (!isFetchingMyApplications && !userHasApps)) {
    return (<Onboarding isAuthenticated={isAuthenticated} />);
  }

  if (IS_PLUGIN) {
    setOnboardingDone();
    return <Redirect to={routes.plugin._} />;
  }

  return (
    <>
      <Title>
        {t('components:list.applications.linked.title')}
      </Title>
      <Card mb={3}>
        <ApplicationsList
          isFetching={isFetchingMyApplications}
          applications={applications}
          withBlobCount
        />
      </Card>
    </>
  );
}

LinkedApplicationsList.propTypes = {
  t: PropTypes.func.isRequired,
  userId: PropTypes.string,
  myApplications: PropTypes.shape({
    [WORKSPACE.CITIZEN]: PropTypes.arrayOf(PropTypes.shape(ApplicationSchema.propTypes)),
  }),
  isAuthenticated: PropTypes.bool.isRequired,
  isFetchingMyApplications: PropTypes.bool,
};

LinkedApplicationsList.defaultProps = {
  userId: null,
  isFetchingMyApplications: false,
  myApplications: {
    [WORKSPACE.CITIZEN]: [],
  },
};

export default withMyApplications({ workspace: WORKSPACE.CITIZEN })(
  withTranslation(['components'])(LinkedApplicationsList),
);
