import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { generatePath, Link } from 'react-router-dom';

import routes from 'routes';
import { ROLE_LABELS } from 'constants/Roles';
import ApplicationSchema from 'store/schemas/Application';

import isNil from '@misakey/helpers/isNil';

import useLocationWorkspace from 'hooks/useLocationWorkspace';


import ApplicationListItem from 'components/dumb/ListItem/Application';
import ApplicationListItemNotFound from 'components/dumb/ListItem/Application/NotFound';

const Option = ({ application, ...rest }) => {
  const role = useLocationWorkspace();

  const mainDomain = useMemo(
    () => application.mainDomain,
    [application.mainDomain],
  );

  const itemLinkTo = useMemo(
    () => {
      if (isNil(mainDomain)) {
        return null;
      }
      let linkTo = routes.citizen.application._;
      if (role === ROLE_LABELS.DPO) {
        linkTo = routes.dpo.service._;
      } else if (role === ROLE_LABELS.ADMIN) {
        linkTo = routes.admin.service._;
      }
      return generatePath(linkTo, { mainDomain });
    },
    [mainDomain, role],
  );

  if (isNil(application.mainDomain)) {
    return <ApplicationListItemNotFound application={application} {...rest} />;
  }
  return (
    <ApplicationListItem
      button
      component={Link}
      to={itemLinkTo}
      secondaryLinkTo={itemLinkTo}
      application={application}
      {...rest}
    />
  );
};

Option.propTypes = {
  application: PropTypes.shape({
    ...ApplicationSchema.propTypes,
    mainDomain: PropTypes.string,
  }).isRequired,
};

export default Option;
