import API from '@misakey/api';

import objectToSnakeCase from '@misakey/helpers/objectToSnakeCase';
import objectToCamelCase from '@misakey/helpers/objectToCamelCase';
import head from '@misakey/helpers/head';
import isEmpty from '@misakey/helpers/isEmpty';
import pluck from '@misakey/helpers/pluck';

// CONSTANTS
const ENDPOINTS = {
  linkedApplications: {
    list: {
      method: 'GET',
      path: '/user-applications',
      auth: true,
    },
  },
  applicationInfo: {
    list: {
      method: 'GET',
      path: '/application-info',
      auth: true,
    },
  },
};


// HELPERS
const getApplicationsIds = pluck('applicationId');

export const fetchApplicationByMainDomain = (mainDomain, isAuthenticated = false) => API
  .use({ ...ENDPOINTS.applicationInfo.list, auth: isAuthenticated })
  .build(null, null, objectToSnakeCase({ mainDomain, includeRelatedDomains: true }))
  .send()
  .then(head);

export const fetchApplicationsByMainDomains = (mainDomains, isAuthenticated = false) => API
  .use({ ...ENDPOINTS.applicationInfo.list, auth: isAuthenticated })
  .build(null, null, objectToSnakeCase({ mainDomains: mainDomains.join(',') }))
  .send();

export const fetchApplicationsByCategory = (category, options = {}, isAuthenticated = false) => API
  .use({ ...ENDPOINTS.applicationInfo.list, auth: isAuthenticated })
  .build(null, null, objectToSnakeCase({ category, ...options }))
  .send();

const fetchLinks = (userId) => API
  .use(ENDPOINTS.linkedApplications.list)
  .build(null, null, objectToSnakeCase({ userId, sortByDataboxDate: true }))
  .send();

const fetchApplicationByIds = (ids, withBlobCount = false) => API
  .use(ENDPOINTS.applicationInfo.list)
  .build(null, null, objectToSnakeCase({ ids: ids.join(','), withBlobCount }))
  .send();

export const fetchLinkedApplications = (userId) => fetchLinks(userId)
  .then((applicationLinksResponse) => {
    const ids = applicationLinksResponse.map((applicationLinkResponse) => {
      const { applicationId } = objectToCamelCase(applicationLinkResponse);
      return applicationId;
    });

    return isEmpty(ids) ? [] : fetchApplicationByIds(ids, true)
      .then((applications) => applications.map(objectToCamelCase));
  });


export const fetchUserRoleApplications = (userId, roleLabel) => API
  .use(API.endpoints.user.roles.read)
  .build(undefined, undefined, objectToSnakeCase({ userId, roleLabel, valid: true }))
  .send()
  .then((response) => {
    const roles = response.map(objectToCamelCase);
    if (isEmpty(roles)) { return Promise.resolve([]); }
    const applicationsIds = getApplicationsIds(roles);
    return API
      .use(API.endpoints.application.info.find)
      .build(undefined, undefined, { ids: applicationsIds.join() })
      .send()
      .then((applications) => applications.map(objectToCamelCase));
  });
