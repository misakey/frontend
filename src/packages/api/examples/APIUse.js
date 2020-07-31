// src/screens/MyScreen
import API from '@misakey/api';

console.log(locationParams); // { mainDomain: 'misakey.com', otherLocationParam: true }

const params = locationParams;
const payload = undefined;
const queryParams = undefined;

const myRequestPromise = API.use(API.endpoints.boxes.read)
  .build(params, payload, queryParams)
  .send();

console.log(myRequestPromise instanceof Promise); // true

myRequestPromise.then(response => console.log(response));
