# @misakey/react/auth

## Install

```shell
yarn add @misakey/react/auth
```

## Add auth reducers

You can either:
1. import one by one the reducers you want
2. import all the reducers and combine them your way

### 1 - import one by one the reducers you want

In your main reducers file
<!-- eslint-skip -->
```js static
import { combineReducers } from 'redux';

import auth from '@misakey/react/auth/store/reducers/auth';

const rootReducer = combineReducers({
  auth
  // ...
});

export default rootReducer;
```


### 2 - import all the reducers and combine them your way

In your main reducers file
<!-- eslint-skip -->
```js static
import { combineReducers } from 'redux';

import reducers from '@misakey/react/auth/store/reducers';

// ...

const rootReducer = combineReducers({
  ...reducers,
  // ...
});

export default rootReducer;
```

### 3 - using auth reducer

#### Store properties

- authenticatedAt (`date`)
- accountId (`string`)
- isAuthenticated (`boolean`)
- identityId (`string`)
- identity (`object`)
```json
{
  "id": "<identityId>",
  "accountId": "<accountId>",
  "hasCrypto": "<boolean>",
  "identifierValue":  "<identifier valut>",
  "identifierKind": "<kind of the identifier (email, ...)>",
  "displayName": "<displayName>",
  "avatarUrl": "<avatarUrl>",
  "notifications": "<notification level>",
}
```
- expiresAt (`date`)
- acr (`number`)
- scope (`string`)

#### Available `reselect` selectors

```js static
import { selectors as authSelectors } from '@misakey/react/auth/store/reducers/auth';

const { 
  identityId, 
  expiresAt,
  identity,
  accountId,
  hasCrypto,
  identifierValue,
  identityId,
  isAuthenticated,
  acr,
} = authSelectors;
```  

## Integrate reducers and OidcProvider

In your main app file, integrate auth reducers to the store and use `OidcProvider` to wrap your app.

### Arguments 

| name | description | status |
| -- | -- | -- |
| config | arguments passed to the constructor of [userManager](#usermanager) | required |
| redirectProps | props passed to component `AuthCallback` that handle the response redirection of the auth provider. `fallbackReferrer` (string) is the path where user is redirected in case no `referrer` information is found at the end of the flow. `loadingPlaceholder` is the element displayed while the component does computation before the redirection | default:<br> `fallbackReferrer="/"`<br>`loadingPlaceholder=null` |
 
`OidcProvider` is a [context provider](#UserManagerContext) that provides:
- [userManager](#usermanager): instance of userManager class
- [askSigninRedirect](#asksigninredirect): this method displays a screen to ask user to authenticate or upgrade their current authentication state
- [onSignIn](#onsignin): method to sign or sign up  
- [onSignOut](#onsignout): method to logout the current user 

It contains all the routes related to auth form screens and end of auth flow (the routes known by backend for redirection during auth flow). 

It also contains a `SigninDialog` that can be displayed with [askSigninRedirect](#asksigninredirect) method.

This component cannot be used without a redux store for now.

<!-- eslint-skip -->
```js static
// Redux
import { Provider as StoreProvider } from 'react-redux';
import { applyMiddleware, compose, createStore } from 'redux';
import reducers from 'store/reducers';

// Persistence
import { PersistGate } from 'redux-persist/integration/react';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Silent auth 
import oidcSilentRenewalWrapper from '@misakey/core/auth/helpers/oidcSilentRenewalWrapper'; 

// OIDC provider
import OidcProvider from '@misakey/react/auth/components/OidcProvider';

const oidcConfig = {
  authority: 'https://auth.misakey.com.local/',
  client_id: '<client_id>',
  redirect_uri: 'https://api.misakey.com.local/auth/callback',
}

// required only if you haven't set `config.disableAutomaticSilentRenew` to true in `OidcProvider`
oidcSilentRenewalWrapper(oidcConfig, () => {
  // integrate auth reducers
  const store = createStore(reducers);

  ReactDOM.render((
      // OidcProvider must be wrapped with the store
      <StoreProvider store={store}>
        <OidcProvider 
          config={oidcConfig}
          // optional
          redirectProps={{
            fallbackReferrer: '/',
            loadingPlaceholder: <div>Loading...</div>,
          }}>
            {/* Your app */}
        </OidcProvider>
      </StoreProvider>
  ), document.getElementById('root'));
});
```


## UserManagerContext

How to use the context provider

```js static
import { useMemo } from 'react';
import { UserManagerContext } from '@misakey/react/auth/components/OidcProvider/Context';

const AuthButton = () => {
  const { onSignIn, onSignOut, getUser } = useContext(UserManagerContext);

  const user = useMemo(() => getUser(), [getUser])

  return user !== null 
    ? <Button onClick={onSignOut}>Logout</Button> 
    : <Button onClick={onSignIn}>Login</Button>;
};
```


### userManager

#### Arguments

| name | description | status |
| -- | -- | -- |
| authority (`string`) |  The URL of the OIDC provider | required |
| clientId (`string`) | the identifier of client application registered with the OIDC provider | required |
| redirectUri (`string`) | The redirect URI of the client application to receive a response from the OIDC provider | required |
| scope (`string`) | The scope being requested from the OIDC provider | default: `openid tos privacy_policy` |
| disableAutomaticSilentRenew (`boolean`) | disable silent token renewal | default: `false` |
| clockSkew (`number`) |  The window of time (in seconds) to allow the current time to deviate when validating id_token's iat, nbf, and exp values | default: `300` |

#### Methods


| name | description | arguments |
| -- | -- | -- |
| `getUser()` | returns current authenticated user information, returns null if no user is authenticated | - |
```json
{
  "expired": "true|false", 
  "identityId": "<user identity id>",  // string
  "accountId": "<user account id>", // null if user has no account
  "hasCrypto": "true|false", 
  "scope": "<current access token scope>", // string 
  "acr": "<current access token ACR>", // string
  "amr": "<current access token AMR>", // array of string
  "email": "<current access token email>", // string
  "sub":"<current access token sub>" // string
}

```

| | | |
| -- | -- | -- |
| removeUser | Remove user information from userManager and localStorage | preventBroadcast (`bool`), default: `false` |
| signinRedirect | Cf. [onSignIn](#onsignin) | `object`, default: `{}` |
| signinCallback | Process response from the end session endpoint, used in `AuthCallback` component | 1. url (`string`): response url<br>2. silent (boolean): if the auth flow was silent or not, default: `false`) |
| loadSilentAuthTimer | launch timer to renew access token silently, from the `expiresAt` value linked to the token. Used inside `userManager` class, when token change | - |


### onSignIn

Build URL to ask auth flow to the backend OidcProvider and redirect browser on it 

#### Arguments


| name | description | default |
| -- | -- | -- |
| authority (`string`) | The URL of the OIDC provider | the one passed to [userManager](#usermanager) |
| endpointUrl (`string`) | The endpoint of OIDC provider to ask authentification | `${authority}/oauth2/auth` |
| clientId (`string`) |  the identifier of client application registered with the OIDC provider |  the one passed to [userManager](#usermanager) |
| redirectUri (`string`) | The redirect URI of the client application to receive a response from the OIDC provider | the one passed to [userManager](#usermanager)   |
| responseType (`string`) | The type of response desired from the OIDC provider | `"code"`, no other value is handled for now |
| scope (`string`) | The scope being requested from the OIDC provider | the one passed to [userManager](#usermanager) |
| referrer (`string`) | the URL (pathname) where user will be redirected at the end of the flow | pathname from where auth flow has be asked |
| loginHint (`string`) | Stringify JSON object that contains hints about the user of the querier of auth flow. Handled props: `resourceName`, `creatorName`, `creatorIdentityId`, `client` (object with `name` and `logoUri`), `identifier` | `undefined` |
| acrValues (`number`) | Authentication Context Class Reference: specify the minimum ACR asked for the authentication flow | `null`, backend will compute the ACR according to user identity |
| extraQueryParams (`object`) | -- |  |
| display<br>maxAge<br>uiLocales<br>idTokenHint<br>resource<br>request<br>requestUri<br>responseMode | [See openid documentation](https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest) |


### askSigninRedirect

Display a prompt screen to ask user to authenticate with the arguments passed to the function

#### Arguments

- Same arguments than for [onSignIn](#onsignin)
- `fullScreen` (boolean): put the « auth needed » screen in a dialog or full screen
- `canCancelRedirect` (boolean): if the « auth needed » screen can be closed or not
- `loginHints` (object): object that will be transformed in JSON stringified to be passed as `loginHint`

### onSignOut

It calls the backend endpoint to logout, hydra session and related auth cookies are invalidated. On successful logout, it removes all information about the user in the javascript context (with [`userManager.removeUser`](#usermanager)) 

## Integrate translations

`@misakey/react/auth` uses `react-i18n` for its translations. 

You should integrate in your main file: 

```js static
// translations
import configureI18n from '@misakey/ui/i18n';

configureI18n();
```

and put in your public folder:
- https://gitlab.com/Misakey/frontend/-/raw/master/public/locales/en/account.json
- https://gitlab.com/Misakey/frontend/-/raw/master/public/locales/fr/account.json
- https://gitlab.com/Misakey/frontend/-/raw/master/public/locales/en/auth.json
- https://gitlab.com/Misakey/frontend/-/raw/master/public/locales/fr/auth.json
