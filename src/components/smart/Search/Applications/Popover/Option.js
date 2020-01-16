import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { generatePath, Link } from 'react-router-dom';

import routes from 'routes';
import { SUGGESTED_TYPE, LINKED_TYPE } from 'constants/search/application/type';
import { ROLE_LABELS } from 'constants/Roles';
import ApplicationSchema from 'store/schemas/Application';

import isNil from '@misakey/helpers/isNil';

import useLocationWorkspace from 'hooks/useLocationWorkspace';


import ApplicationListItem from 'components/dumb/ListItem/Application';

const Option = ({ application, type, ...rest }) => {
  const role = useLocationWorkspace();

  const mainDomain = useMemo(
    () => application.mainDomain,
    [application.mainDomain],
  );

  const citizenLinkTo = useMemo(
    () => (type === LINKED_TYPE ? routes.citizen.application.vault : routes.citizen.application._),
    [type],
  );

  const itemLinkTo = useMemo(
    () => {
      if (isNil(mainDomain)) {
        return null;
      }
      let linkTo = citizenLinkTo;
      if (role === ROLE_LABELS.DPO) {
        linkTo = routes.dpo.service._;
      } else if (role === ROLE_LABELS.ADMIN) {
        linkTo = routes.admin.service._;
      }
      return generatePath(linkTo, { mainDomain });
    },
    [mainDomain, role, citizenLinkTo],
  );

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
  type: PropTypes.oneOf([SUGGESTED_TYPE, LINKED_TYPE]).isRequired,
};

export default Option;
