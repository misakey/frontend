## Packages

We have created some packages for code separation.

Historically it has been done because we had multiple frontend projects sharing some components
(we had one per workspace)

For now we have some packages:
* `api`: the API client package. Holds all the logic to call Misakey's backends
* `auth`: all auth related logic (usermanager, silent auth, user store, ...)
* `crypto`: all the crypto of the app (encryption/decryption, key management, ...)
* `helpers`: common helpers. Most of them are imported from [either [Lodash](https://lodash.com/) or [Ramda](https://ramdajs.com/)
* `hooks`: our custom hooks
* `store`: global store package
* `ui`: common ui package. Contains reusable presentational components, global theme definition.

:warning: Those "packages" are not used as NPM packages anymore. We have only one app, that use everything.
We decided to keep the package folder structure to avoid a huge refacto, and be free to re use them as NPM packages later,
but for now, they are not usable as is (cross package dependencies are broken). So don't consider them as NPM packages.