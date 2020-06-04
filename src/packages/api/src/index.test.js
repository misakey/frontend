import isEmpty from '@misakey/helpers/isEmpty';
import forEach from '@misakey/helpers/forEach';
import isObject from '@misakey/helpers/isObject';

import Endpoint from '@misakey/api/Endpoint';
import Mock from '@misakey/api/Mock';
import API from '@misakey/api';

const matchingMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD'];

const matchingNaming = ['create', 'read', 'update', 'delete', 'find', 'search', 'count'];

// @FIXME to cleanup
const authExtendedNamings = [
  'signIn', 'signOut', 'signUp',
  'resetPassword', 'forgotPassword', 'confirm',
  'askConfirm', 'init',
  // @FIXME latest to validate
  'checkAuthable', 'info', 'loginAuthStep', 'renewAuthStep',
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
