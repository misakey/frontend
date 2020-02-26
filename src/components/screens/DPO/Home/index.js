import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import routes from 'routes';
import { withTranslation } from 'react-i18next';

import Screen from 'components/dumb/Screen';
import OnboardingDPO from 'components/dumb/Onboarding/DPO';
import ActiveServices from 'components/smart/List/ActiveServices';
import ApplicationsList from 'components/dumb/List/Applications';
import Card from 'components/dumb/Card';
import Title from 'components/dumb/Typography/Title';
import withMyApplications from 'components/smart/withMyApplications';

import { WORKSPACE } from 'constants/workspaces';

import ApplicationSchema from 'store/schemas/Application';

import Container from '@material-ui/core/Container';
import IconButton from '@material-ui/core/IconButton';
import IconAdd from '@material-ui/icons/Add';
import Box from '@material-ui/core/Box';

function Home({
  isAuthenticated,
  myApplications,
  isFetchingMyApplications,
  t,
}) {
  const { [WORKSPACE.DPO]: userDPOApps } = myApplications;
  const userHasApps = useMemo(() => userDPOApps.length > 0, [userDPOApps.length]);
  const toRoute = useMemo(() => routes.dpo.service._, []);

  const displayOnboarding = useMemo(
    () => !isAuthenticated || !userHasApps,
    [isAuthenticated, userHasApps],
  );

  const state = useMemo(
    () => ({ isLoading: isFetchingMyApplications }),
    [isFetchingMyApplications],
  );

  return (
    <Screen state={state}>
      <Container maxWidth="md">
        {displayOnboarding && (
          <>
            <OnboardingDPO isAuthenticated={isAuthenticated} />
            <ActiveServices />
          </>
        )}
        {userHasApps && (
          <>
            <Box display="flex" justifyContent="space-between">
              <Title>
                {t('components__new:list.applications.linked.title')}
              </Title>
              <IconButton
                to={routes.dpo.services.create}
                component={Link}
                color="secondary"
              >
                <IconAdd />
              </IconButton>
            </Box>
            <Card mb={3}>
              <ApplicationsList
                isFetching={isFetchingMyApplications}
                applications={userDPOApps}
                toRoute={toRoute}
              />
            </Card>
          </>
        )}
      </Container>
    </Screen>
  );
}

Home.propTypes = {
  isAuthenticated: PropTypes.bool.isRequired,
  isFetchingMyApplications: PropTypes.bool,
  myApplications: PropTypes.shape({
    [WORKSPACE.DPO]: PropTypes.arrayOf(PropTypes.shape(ApplicationSchema.propTypes)),
  }),
  t: PropTypes.func.isRequired,
};

Home.defaultProps = {
  myApplications: {
    [WORKSPACE.DPO]: [],
  },
  isFetchingMyApplications: false,
};

export default withMyApplications({ workspace: WORKSPACE.DPO })(withTranslation(['components__new'])(Home));
