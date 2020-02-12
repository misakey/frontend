# APP

## Pages Roses frontend

This is the source code of Misakey webapp (https://www.misakey.com) and Misakey web extension. 
The code for Misakey webapp is the same as the code for the popup of Misakey web extension. 
Misakey webapp use [CRA](https://github.com/facebook/create-react-app) to be generated.
The rest of the Misakey webextension code (background script and content script) is generated with webpack.

The extension use [mozilla/webextension-polyfill](https://github.com/mozilla/webextension-polyfill) as it is intented to work with Chrome, Firefox, Opera, Edge and Safari.

### Generate production image 

- `make build`

### Webapp & static pages

We have some static pages beside the React App. We want that for performance and easiness of edition of those pages.

For now, we only have a static version of the landing page. We'll also have some other pages (about, team, ...) at a point, and maybe some other static content.

For now this is static HTML page. We'll probably use Hugo soon to manage templating.

#### Development

To develop the static landing page, start the dev server (with `test-and-run`), then you can only go on https://misakey.com.local/landing.html

For now there is no hot reloading for that page.

#### Production

The production build to make work the webapp aside of the static page is this one:
* We create a build of the webapp
* We rename the `index.html` into `app.html`
* We rename the `landing.html` into `index.html`
* We serve the static content with a Nginx server, trying all static files, then index, then give all other URI to app.html

### Generate build folder as plugin (Misakey extension)

To generate the zip files for publishing on store with docker and make (output: `build_plugin`):
- `make build-plugin`

To generate a clean zip of the source_code for reviewers of firefox addons store: (output: `build_plugin/source_code.zip`)
- `make zip-plugin-source-code`

To generate an output folder for the web extension use:
- `yarn install && yarn --cwd plugin install && yarn build-plugin`

To use different env files, use :
- `PLUGIN_ENV=preproduction make build-plugin` or `PLUGIN_ENV=preproduction yarn build-plugin`
- Values supported: `production`, `preproduction`, `development`
-  Default value: `production`

To add version in the zip output name add `VERSION=<version>`

To generate build for firefox only use:
- `TARGET_BROWSER=firefox make build-plugin`
  OR
- `yarn install && yarn install --cwd plugin && yarn build-plugin-firefox`
  
To generate build for chrome only use:
- `TARGET_BROWSER=chrome make build-plugin`
  OR
- `yarn install && yarn install --cwd plugin && yarn build-plugin-chrome`

N.B: To launch this project as a web extension in developer mode with hot reload, see `README.md` in `/plugin` folder.

### Git hook

A pre-commit hook is available to automatically run the linter before any commit
(this way we can avoid "lint" commits)

To install it go to the `devtools/git` folder and run `./pre-commit-install.sh`

### Sending requests

An instance of Class **API** is available in the project `src/API`
and implements only one method wich is `API.use()`.

`use` accepts as parameter an endpoint Types Definition defined in 
[a json](src/API/endpoints/application/index.json):
```json
{
  "read": {
    "method": "GET",
    "path": "/applications/:mainDomain",
    "auth": true
  }
}
```
*It's possible to nest Types Defs*

**API** instance is constructed with these Types Definition
that are given as parameters to the `use` method:

```javascript
// src/screens/MyScreen
import API from '../API';
import Endpoint from '../API/endpoints/Endpoint';

const myEndpoint = API.use(API.endpoints.application.read);
console.log(myEndpoint instanceof Endpoint); // true
```
As you can see `use` returns a Class Endpoint instance which implements
the following methods (`build` and `send`):
```javascript
// src/screens/MyScreen
import API from '../API';

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

*New endpoints need to compel with rules
defined in [@`src/API/API.test.js`](src/API/API.test.js)*

### Deployment

:warning: Make sure the corresponding images exist before running the following commands.

Create a `config.yaml` file with a `config:` key and the `env.js` production content (you can find an example in `/helm/config.sample.yaml`)

When you want to deploy the application for the first time, clone the repo, checkout to the desired tag, then run:

```
helm install --name app-frontend helm/app-frontend -f path/to/config.yaml --set env=production --set image.tag=`git describe --tags --always`

```

If you just need to upgrade the application, then run:
```
helm upgrade app-frontend helm/app-frontend -f path/to/config.yaml --set env=production --set image.tag=`git describe --tags --always`
```


## MKAdmin
Misakey for admin is a platform about Service claiming and management.

A Service is an entity associated to a domain's name that handles several
aspects of like requests, sso, users...

### Run the project
[With test-and-run](https://gitlab.misakey.dev/misakey/test-and-run?nav_source=navbar#run)

### Lint and test
```shell
yarn lint && yarn test
```

### Deployment

:warning: Make sure the corresponding images exist before running the following commands.

Create a `config.yaml` file with a `config:` key and the `env.js` production content (you can find an example in `/helm/config.sample.yaml`)

When you want to deploy the application for the first time, clone the repo, checkout to the desired tag, then run:

```
helm install --name frontend helm/frontend -f path/to/config.yaml --set env=production --set image.tag=`git describe --tags --always`

```

If you just need to upgrade the application, then run:
```
helm upgrade frontend helm/frontend -f path/to/config.yaml --set env=production --set image.tag=`git describe --tags --always`
```
