### @misakey/api

```shell
yarn add @misakey/api
```

An instance of Class **API** implements one method: `API.use()`.

`use` accepts as parameter an endpoint Types Definition defined 
[like this](https://gitlab.com/Misakey/js-common/blob/master/src/api/endpoints/application/index.js):
<!-- eslint-skip -->
```js static
export default {
  read: {
    method: 'GET',
    path: '/applications/:mainDomain',
    auth: true,
  },
};
```
*It's possible to nest Types Defs*

**API** instance is constructed with these Types Definition
that are given as parameters to the `use` method:

<!-- eslint-skip -->
```js static
// src/screens/MyScreen
import API from '@misakey/api';
import Endpoint from '@misakey/api/endpoints/Endpoint';

const myEndpoint = API.use(API.endpoints.application.read);
console.log(myEndpoint instanceof Endpoint); // true
```
As you can see `use` returns a Class Endpoint instance which implements
the following methods (`build` and `send`):

<!-- eslint-skip -->
```js static
// src/screens/MyScreen
import API from '@misakey/api';

console.log(locationParams); // { mainDomain: 'misakey.com', otherLocationParam: true }

const params = locationParams;
const payload = undefined;
const queryParams = undefined;

const myRequestPromise = API.use(API.endpoints.application.read)
  .build(params, payload, queryParams)
  .send();

console.log(myRequestPromise instanceof Promise); // true

myRequestPromise.then(response => console.log(response)); // { httpStatus: 200, body: {} }
```
If a mock is implemented you can call `fakeReponse` method with an httpStatus code:
`API.use(API.endpoints.application.read).fakeResponse(200).then(handleResponse);`

*New endpoints need to compel with rules defined in [@`src/api/API.test.js`](https://gitlab.com/Misakey/js-common/blob/master/src/API/API.test.js)*
