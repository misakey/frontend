import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link, generatePath } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

import routes from 'routes';
import { WORKSPACE } from 'constants/workspaces';

import isNil from '@misakey/helpers/isNil';

import useLocationWorkspace from '@misakey/hooks/useLocationWorkspace';

import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import Skeleton from '@material-ui/lab/Skeleton';
import ApplicationListItem from 'components/dumb/ListItem/Application';
import ApplicationListItemQuickDraft from 'components/dumb/ListItem/Application/QuickDraft';
import ApplicationListItemBlobCount from 'components/dumb/ListItem/Application/BlobCount';
import BoxMessage from '@misakey/ui/Box/Message';

function ApplicationsList({
  t, isFetching, error, applications, listLength, toRoute, withBlobCount,
}) {
  const workspace = useLocationWorkspace(true);

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

  const ListItemComponent = useMemo(
    () => {
      if (withBlobCount) {
        return ApplicationListItemBlobCount;
      }
      if (workspace === WORKSPACE.CITIZEN) {
        return ApplicationListItemQuickDraft;
      }
      return ApplicationListItem;
    },
    [withBlobCount, workspace],
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
          {t('components:list.applications.error')}
        </Typography>
      </BoxMessage>
    );
  }

  return (
    <List disablePadding>
      {applicationsWithPaths.map(({ application, to }) => {
        const listItemProps = isNil(to) ? {} : { button: true, component: Link };
        return (
          <ListItemComponent
            key={application.mainDomain}
            application={application}
            to={to}
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

export default withTranslation(['components'])(ApplicationsList);
