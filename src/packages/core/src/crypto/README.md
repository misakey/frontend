### Misakey Cryptography Utilities

This used to be published as a separate NPM package
that one could install with `yarn add @misakey/core/crypto`
but now we don't guarantee that it can be used that way any more.

Also, there is some code that was added
when we were working on the “MK Data” protocol
which may not be very relevant any more
because we still don't use this MK Data protocol
and so the crypto package underwent significant changes
without this code being tested for integration.

### Requirements

This code depends on https://github.com/antelle/argon2-browser,
but adding this requirement is a bit more complicated.
In a nutshell, the reason is that
Argon2-browser uses the “asm.js” format
which doesn't play nice with the technology stack of “Create React App”
(with WebPack, especially).
For more info on the reasons see
[here](https://github.com/facebook/create-react-app/issues/4912#issuecomment-475849040).

As a result here is how you are supposed to provide Argon2-browser:
- copy the following two files in your `/public` folder:
    - https://github.com/antelle/argon2-browser/raw/master/lib/argon2.js
    - https://github.com/antelle/argon2-browser/raw/master/dist/argon2-asm.min.js
- modify `argon2.js` by setting `defaultDistPath` to the empty string
- add this line to your `public/index.html` file under the link to the manifest in the HTML `<head>`:
```
<script src="%PUBLIC_URL%/argon2.js" charset="utf-8"></script>
```

### File Structure

`crypto/` contains the core cryptographic function,
providing key generation, encryption and decryption (symmetric and asymmetric)
to other parts of the code.

`databox/` contains encryption and decryption functions for the MK Databox protocol,
which was supposed to be terminated “soon” but is still the protocol that we use.
It contains its own encryption and decryption functions,
separate from what is in `crypto/`,
although it is very similar
(TODO make databox use the common crypto functions).

`store/` contains everything related to state management through the Redux store.

`hooks/` contains React hooks that can be used in application code.

`BackupEncryption.js` provides the functions to encrypt/decrypt the user secrets backup.
It is a thin overlay on top of the functions in `crypto/`.

`HttpApi.js` provides helper for HTTP Queries related to the crypto.
