import API from '@misakey/api';

import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';

import { useCallback } from 'react';
import useLocationWorkspace from '@misakey/hooks/useLocationWorkspace';

// HELPERS
/**
 *
 * @param {Object} params
 * @param {string} params.linkLimit
 * @param {string} params.linkOffset
 * @param {string} params.sugLimit
 * @param {string} params.sugOffset
 * @param {string} params.sugPublished
 */
const getApplications = (
  searchQuery,
  isAuthenticated,
  workspace,
  params = {},
) => {
  const endpoint = { ...API.endpoints.application.info.search, auth: isAuthenticated };

  return API.use(endpoint)
    .build(undefined, undefined, objectToSnakeCase({
      searchQuery,
      workspace,
      sugPublished: true,
      ...params,
    }))
    .send();
};

// HOOKS
export default () => {
  const workspace = useLocationWorkspace();

  const searchApplications = useCallback(
    (search, isAuthenticated, params) => getApplications(
      search,
      isAuthenticated,
      workspace,
      params,
    ),
    [workspace],
  );

  return searchApplications;
};
