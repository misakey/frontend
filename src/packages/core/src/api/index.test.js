import isEmpty from '@misakey/core/helpers/isEmpty';
import forEach from '@misakey/core/helpers/forEach';
import isObject from '@misakey/core/helpers/isObject';

import Endpoint from '@misakey/core/api/Endpoint';
import Mock from '@misakey/core/api/Mock';
import API from '@misakey/core/api';

const matchingMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'];

const matchingNaming = ['create', 'read', 'update', 'delete', 'find', 'search', 'count', 'add'];

// @FIXME to cleanup
const authExtendedNamings = [
  'signOut', 'signUp',
  'confirm', 'askConfirm', 'init', 'userinfo',
  'checkAuthable', 'info', 'loginAuthStep', 'initAuthStep',
];

window.env = {
  API_ENDPOINT: 'https://api.misakey.com.local',
};

describe('testing API', () => {
  describe('Endpoints', () => {
    function testEndpoint(endpoint, key) {
      function areTypesValid({ method, path, innerRules }) {
        expect(method).toBeDefined();
        expect(matchingMethods).toContain(method);
        expect(path).toBeDefined();

        if (innerRules.naming === 'strict') {
          // we could use other naming standards but it needs some research
          expect(matchingNaming.concat(authExtendedNamings)).toContain(key);
        }
      }

      function isMockValid({ mock }) {
        if (!isEmpty(mock)) {
          expect(mock instanceof Mock).toBeTruthy();
        }
      }

      describe(`Endpoint ${endpoint.method} ${endpoint.path}`, () => {
        test('is instance of Endpoint Class', () => expect(endpoint instanceof Endpoint).toBeTruthy());
        test('has a valid definition', () => areTypesValid(endpoint));
        test('has a valid mock if exists', () => isMockValid(endpoint));
      });
    }

    function testEndpoints(collection) {
      forEach(collection, (o, key) => {
        if (isObject(o)) {
          if (o.method) {
            testEndpoint(API.use(o), key);
          } else {
            testEndpoints(o);
          }
        }
      });
    }

    testEndpoints(API.endpoints);
  });

  describe('Send', () => {
    it('should not throw', () => {
      const endpoint = {
        method: 'GET',
        path: '/hello',
      };
      expect(() => API.use(endpoint)
        .build()
        .send()).not.toThrow();
    });
  });
});
