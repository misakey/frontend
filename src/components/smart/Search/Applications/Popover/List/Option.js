import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { generatePath, Link /* useLocation */ } from 'react-router-dom';

import routes from 'routes';
import { WORKSPACE } from 'constants/workspaces';
import { PORTABILITY } from 'constants/databox/type';
// import { REQUEST } from 'constants/search/application/params';
import ApplicationSchema from 'store/schemas/Application';

import isNil from '@misakey/helpers/isNil';
import isEmpty from '@misakey/helpers/isEmpty';
import prop from '@misakey/helpers/prop';
import compose from '@misakey/helpers/compose';
// import getNextSearch from '@misakey/helpers/getNextSearch';

import useLocationWorkspace from '@misakey/hooks/useLocationWorkspace';

import withRequestCreation from 'components/smart/Requests/New/with';
import ApplicationListItem from 'components/dumb/ListItem/Application';

// import ChevronRightIcon from '@material-ui/icons/ChevronRight';

// CONSTANTS
const REDIRECT_PROPS = { push: true };

// HELPERS
const hasDpoEmail = compose(
  (dpoEmail) => !isEmpty(dpoEmail),
  prop('dpoEmail'),
);

// COMPONENTS
const ApplicationListItemWithRequestCreation = withRequestCreation(ApplicationListItem);

const Option = ({ application, disabled, ...rest }) => {
  // const { search: locationSearch, pathname } = useLocation();

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

  const itemLinkTo = useMemo(
    () => {
      if (isNil(mainDomain)) {
        return null;
      }

      if (isCitizenWorkspace) {
        return {};
      // @FIXME use instead, when implementing request and gafam
      //   return {
      //     pathname,
      //     search: getNextSearch(locationSearch, new Map([
      //       [REQUEST, mainDomain],
      //     ])),
      //   };
      }
      if (workspace === WORKSPACE.DPO) {
        return generatePath(routes.dpo.service._, { mainDomain });
      } if (workspace === WORKSPACE.ADMIN) {
        return generatePath(routes.admin.service._, { mainDomain });
      }
      return null;
    },
    [mainDomain, isCitizenWorkspace, workspace],
  );

  // @FIXME remove this condition once we use second step
  if (isCitizenWorkspace) {
    return (
      <ApplicationListItemWithRequestCreation
        button
        disabled={disabled || !applicationHasDpoEmail}
        application={application}
        producerId={id}
        type={PORTABILITY}
        redirectProps={REDIRECT_PROPS}
        // secondaryAction={applicationHasDpoEmail ? (
        //   <ChevronRightIcon />
        // ) : null}
        {...rest}
      />
    );
  }

  return (
    <ApplicationListItem
      button
      disabled={disabled || !applicationHasDpoEmail}
      component={Link}
      to={itemLinkTo}
      // replace={isCitizenWorkspace}
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
