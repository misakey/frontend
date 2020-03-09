import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link, generatePath } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import routes from 'routes';
import isNil from '@misakey/helpers/isNil';

import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';

import Skeleton from '@material-ui/lab/Skeleton';

import ApplicationListItem from 'components/dumb/ListItem/Application';
import BoxMessage from '@misakey/ui/Box/Message';

function ApplicationsList({
  t, isFetching, error, applications, listLength, toRoute, withBlobCount,
}) {
  const applicationsWithPaths = useMemo(
    () => applications.map((application) => ({
      application,
      to: (isNil(toRoute) ? null : generatePath(
        toRoute,
        { mainDomain: application.mainDomain },
      )),
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
          {t('components__new:list.applications.error')}
        </Typography>
      </BoxMessage>
    );
  }

  return (
    <List disablePadding>
      {applicationsWithPaths.map(({ application, to }) => {
        const listItemProps = isNil(to) ? {} : { button: true, component: Link };
        return (
          <ApplicationListItem
            key={application.mainDomain}
            application={application}
            to={to}
            withBlobCount={withBlobCount}
            {...listItemProps}
          />
        );
      })}
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
  withBlobCount: PropTypes.bool,
};

ApplicationsList.defaultProps = {
  error: undefined,
  listLength: 5,
  toRoute: routes.citizen.application.vault,
  withBlobCount: false,
};

export default withTranslation(['components__new'])(ApplicationsList);
