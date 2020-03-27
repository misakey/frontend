import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { generatePath, Link } from 'react-router-dom';

import routes from 'routes';
import ApplicationSchema from 'store/schemas/Application';

import isNil from '@misakey/helpers/isNil';

import useLocationWorkspace from '@misakey/hooks/useLocationWorkspace';

import ApplicationListItem from 'components/dumb/ListItem/Application';
import { PORTABILITY } from 'constants/databox/type';
import withRequestCreation from 'components/smart/Requests/New/with';
import { WORKSPACE } from 'constants/workspaces';

const ApplicationListItemWithRequestCreation = withRequestCreation(ApplicationListItem);

const Option = ({ application, ...rest }) => {
  const workspace = useLocationWorkspace();

  const mainDomain = useMemo(
    () => application.mainDomain,
    [application.mainDomain],
  );

  const propsSimpleSearch = useMemo(
    () => {
      if (workspace === WORKSPACE.DPO || workspace === WORKSPACE.ADMIN) {
        if (isNil(mainDomain)) {
          return {};
        }
        return {
          to: generatePath(routes[workspace].service._, { mainDomain }),
          component: Link,
        };
      }
      return {};
    },
    [mainDomain, workspace],
  );

  if (workspace === WORKSPACE.CITIZEN) {
    return (
      <ApplicationListItemWithRequestCreation
        button
        application={application}
        producerId={application.id}
        type={PORTABILITY}
        {...rest}
      />
    );
  }

  return (
    <ApplicationListItem
      button
      application={application}
      {...rest}
      {...propsSimpleSearch}
    />
  );
};

Option.propTypes = {
  application: PropTypes.shape({
    ...ApplicationSchema.propTypes,
    id: PropTypes.string,
    mainDomain: PropTypes.string,
  }).isRequired,
};

export default Option;
