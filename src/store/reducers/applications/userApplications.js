import propOr from '@misakey/helpers/propOr';
import isNil from '@misakey/helpers/isNil';

import {
  USER_APPLICATIONS_ADD,
  USER_APPLICATIONS_REMOVE,
} from 'store/actions/applications/userApplications';

// HELPERS
const propOrNull = propOr(null);

export const userApplicationsInitialState = { userApplications: {} };

function addToUserApplications(state, { mainDomain, workspace }) {
  const { userApplications } = state;
  const workspaceApplications = propOrNull('applications', userApplications[workspace]);
  // if userApplications haven't been fetched yet, we don't update them
  if (!isNil(workspaceApplications)) {
    return {
      ...state,
      userApplications: {
        ...userApplications,
        [workspace]: {
          applications: [...workspaceApplications, mainDomain],
          workspace,
        },
      },
    };
  }
  return state;
}

function deleteFromUserApplications(state, { mainDomain, workspace }) {
  const { userApplications } = state;
  const workspaceApplications = propOrNull('applications', userApplications[workspace]);
  // if userApplications haven't been fetched yet, we don't update them
  if (!isNil(workspaceApplications)) {
    return {
      ...state,
      userApplications: {
        ...userApplications,
        [workspace]: {
          applications: workspaceApplications.filter((element) => element !== mainDomain),
          workspace,
        },
      },
    };
  }
  return state;
}

export const userApplicationsReducers = {
  [USER_APPLICATIONS_ADD]: addToUserApplications,
  [USER_APPLICATIONS_REMOVE]: deleteFromUserApplications,
};
