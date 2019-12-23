import API from '@misakey/api';
import Endpoint from '@misakey/api/endpoints/Endpoint';

const myEndpoint = API.use(API.endpoints.application.read);
console.log(myEndpoint instanceof Endpoint); // true
