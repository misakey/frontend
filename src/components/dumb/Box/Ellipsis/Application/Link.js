
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

import BoxEllipsisApplication from 'components/dumb/Box/Ellipsis/Application';

import { Link, generatePath } from 'react-router-dom';

import prop from '@misakey/helpers/prop';
import isNil from '@misakey/helpers/isNil';

import routes from 'routes';


const BoxEllipsisApplicationLink = ({ application }) => {
  const mainDomain = prop('mainDomain', application);

  const to = useMemo(
    () => (!isNil(mainDomain)
      ? generatePath(routes.citizen.application._, { mainDomain })
      : null
    ),
    [mainDomain],
  );

  return (
    <BoxEllipsisApplication component={Link} to={to} application={application} />
  );
};

BoxEllipsisApplicationLink.propTypes = {
  application: PropTypes.shape({ mainDomain: PropTypes.string }),
};

BoxEllipsisApplicationLink.defaultProps = {
  application: null,
};

export default BoxEllipsisApplicationLink;
