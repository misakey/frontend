import API from '@misakey/core/api';
import Endpoint from '@misakey/core/api/endpoints/Endpoint';

const myEndpoint = API.use(API.endpoints.boxes.read);
console.log(myEndpoint instanceof Endpoint); // true
