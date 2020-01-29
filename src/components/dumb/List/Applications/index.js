import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link, generatePath } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import routes from 'routes';

import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';

import Skeleton from '@material-ui/lab/Skeleton';

import ApplicationListItem from 'components/dumb/ListItem/Application';
import BoxMessage from 'components/dumb/Box/Message';

function ApplicationsList({ t, isFetching, error, applications, listLength, toRoute }) {
  const applicationsWithPaths = useMemo(
    () => applications.map((application) => ({
      application,
      to: generatePath(
        toRoute,
        { mainDomain: application.mainDomain },
      ),
    })),
    [applications, toRoute],
  );

  if (isFetching) {
    return (
      <>
        {Array(listLength).map(() => (
          <Skeleton
            variant="text"
            height={31}
          />
        ))}
      </>
    );
  }
  if (error) {
    return (
      <BoxMessage type="error" mt={2}>
        <Typography>
          {t('linkedApplications.error')}
        </Typography>
      </BoxMessage>
    );
  }

  return (
    <List disablePadding>
      {applicationsWithPaths.map(({ application, to }) => (
        <ApplicationListItem
          key={application.mainDomain}
          application={application}
          button
          component={Link}
          to={to}
        />
      ))}
    </List>
  );
}

ApplicationsList.propTypes = {
  t: PropTypes.func.isRequired,
  isFetching: PropTypes.bool.isRequired,
  error: PropTypes.object,
  applications: PropTypes.arrayOf(PropTypes.object).isRequired,
  listLength: PropTypes.number,
  toRoute: PropTypes.string,
};

ApplicationsList.defaultProps = {
  error: undefined,
  listLength: 5,
  toRoute: routes.citizen.application.vault,
};

export default withTranslation(['components'])(ApplicationsList);
