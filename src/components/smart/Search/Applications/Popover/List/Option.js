import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { generatePath, Link, useLocation } from 'react-router-dom';

import routes from 'routes';
import { WORKSPACE } from 'constants/workspaces';
import { REQUEST } from 'constants/search/application/params';
import { PORTABILITY } from 'constants/databox/type';
import ApplicationSchema from 'store/schemas/Application';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import prop from '@misakey/helpers/prop';
import compose from '@misakey/helpers/compose';
import getNextSearch from '@misakey/helpers/getNextSearch';

import useLocationWorkspace from '@misakey/hooks/useLocationWorkspace';

import ApplicationListItemQuickDraft from 'components/dumb/ListItem/Application/QuickDraft';
import ApplicationListItem from 'components/dumb/ListItem/Application';
import withRequestCreation from 'components/smart/Requests/New/with';

// HELPERS
const hasDpoEmail = compose(
  (dpoEmail) => !isEmpty(dpoEmail),
  prop('dpoEmail'),
);

// COMPONENTS
const ApplicationListItemQuickDraftWithRequestCreation = withRequestCreation(
  ApplicationListItemQuickDraft,
);

const Option = ({ application, disabled, ...rest }) => {
  const { search: locationSearch, pathname } = useLocation();

  const workspace = useLocationWorkspace();

  const { mainDomain, id } = useMemo(
    () => application || {},
    [application],
  );

  const applicationHasDpoEmail = useMemo(
    () => hasDpoEmail(application),
    [application],
  );

  const isCitizenWorkspace = useMemo(
    () => workspace === WORKSPACE.CITIZEN,
    [workspace],
  );

  const itemProps = useMemo(
    () => {
      if (isNil(mainDomain)) {
        return {};
      }

      if (isCitizenWorkspace) {
        return {
          to: {
            pathname,
            search: getNextSearch(locationSearch, new Map([
              [REQUEST, mainDomain],
            ])),
          },
          replace: true,
        };
      }
      if (workspace === WORKSPACE.DPO) {
        return { to: generatePath(routes.dpo.service._, { mainDomain }) };
      } if (workspace === WORKSPACE.ADMIN) {
        return { to: generatePath(routes.admin.service._, { mainDomain }) };
      }
      return {};
    },
    [mainDomain, isCitizenWorkspace, workspace, pathname, locationSearch],
  );

  // @FIXME remove this condition once we use second step for request
  if (isCitizenWorkspace && applicationHasDpoEmail) {
    return (
      <ApplicationListItemQuickDraftWithRequestCreation
        button
        disabled={disabled || !applicationHasDpoEmail}
        application={application}
        producerId={id}
        type={PORTABILITY}
        {...rest}
      />
    );
  }

  return (
    <ApplicationListItem
      button
      disabled={disabled}
      component={Link}
      {...itemProps}
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
  disabled: PropTypes.bool,
};

Option.defaultProps = {
  disabled: false,
};

export default Option;
