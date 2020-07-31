import API from '@misakey/api';
import Endpoint from '@misakey/api/endpoints/Endpoint';

const myEndpoint = API.use(API.endpoints.boxes.read);
console.log(myEndpoint instanceof Endpoint); // true
