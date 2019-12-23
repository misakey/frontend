### @misakey/crypto: Misakey Crypto SDK

```shell
yarn add @misakey/crypto
```

Provides cryptographic operations needed by in-browser applications
(“Frontend” applications)
at Misakey.

For now the Misakey Crypto SDK can be used to run
the MK Data protocol (documented [here](https://gitlab.com/Misakey/rfc/blob/master/mk-data-protocol.md))
as well as the MK Databox protocol.


Documentation for *contributors* of this package is in [CONTRIBUTING.md](./CONTRIBUTING.md).

### Requirements

The SDK depends on https://github.com/antelle/argon2-browser,
but adding this requirement is a bit more complicated.
In a nutshell, the reason is that
Argon2-browser uses the “asm.js” platform
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


### Usage

The package exports two instances:
`ownerCryptoContext` and `producerCryptoContext`.
Note that they are *instances* and not classes,
so you do not have to instantiate them.
`ownerCryptoContext` (respectively `producerCryptoContext`)
implements the owner side of the MK Data and MK Databox protocols
(respectively the producer side,
although the producer side of the MK Data protocol is currently not implemented).


#### Management of Owner Secrets (both MK Data and MK Databox)

Import the `ownerCryptoContext` instance from the package
(you can rename it to `cryptoContext` if you want, or even to `crypto`).

Most methods require that context is first initialized to set the owner ID
with `ownerCryptoContext.initialize(ownerId)`.

An owner in MK Data and MK Databox protocols has *secrets*
which are persisted in an encrypted backup
stored on Misakey's servers
(see https://gitlab.com/Misakey/rfc/blob/master/secrets-backup-protocol.md)
During the creation of the user account,
initial cryptographic values are created and returned by
`ownerCryptoContext.createNewOwnerSecrets(password)`
and should be included in the data sent to the server for user account creation
(unlike most other methods for the MK Data protocol,
this method does not take care of the HTTP call itself).
If the user secrets have already been created in the past,
then one must instead call `ownerCryptoContext.loadSecretBackup(password)`
which will fetch the backup from the server (with an HTTP call)
and decrypt it using the provided password.

When the user updates their password,
the secret backup must be re-encrypted
because the key used to encrypt it depends on the user password.
This is done in a two-steps manner:
first call `ownerCryptoContext.preparedBackupKey(newPassword, oldPassword, ownerId)`;
it returns the new encrypted backup which must be sent as part of the HTTP request
to change the password.
When you have confirmation from the server that the update was successful,
call `ownerCryptoContext.commitBackupKeyUpdate()`
to make changes effective inside the crypto context.
These two methods have respective aliases
`ownerCryptoContext.preparePasswordChange` and `ownerCryptoContext.commitPasswordChange`
which should make more sense in application code.

When the user forgets their password,
method `ownerCryptoContext.hardPasswordChange(newPassword)` can be called
to generate the new crypto values
(encrypted secret backup and active public keys)
that must be sent to the backend as part of the “Forgotten password” procedure.


#### For a MK Data Owner

Before uploading data for a given datatype,
a channel must be created for this datatype
by calling `ownerCryptoContext.makeSureDatatypesAreInitialized(datatypes)`
(note that it takes an *array* of datatypes).
Don't worry about passing datatypes that already have a channel,
the method will detect it and will not do anything for these datatypes.

Data can then be sent to a channel
by calling `ownerCryptoContext.encryptAndUploadDataPoint(dataPoint)`.
`dataPoint` must be a literal object
and must have a `metadata` attribute,
a literal object as well,
with attributes `datatype`, `dataTimestamp`, `producerApplicationId` and `inputSource`
(See [the backend specification for cryptograms][]).

[the backend specification for cryptograms]: https://gitlab.com/Misakey/consent-backend/blob/master/docs/swagger/cryptograms.yaml

Finally a owner can retrieve data points
from channels they own with the method `ownerCryptoContext.getDataPoints(searchQuery)`.

For more details see `src/classes.test.js` and `src/index.test.js`.


### For a MK Databox Owner

Databox methods, unlike methods for MK Data,
*do not* take care of the HTTP calls,
it is the application code that must send and fetch the data.
The reason is that code for Mk Databox is "legacy code" so we do not add new features to it
such as management of HTTP calls.

Encrypted databox blobs can be decrypted
by calling method `ownerCryptoContext.databox.decryptBlob(ciphertext, nonce, ephemeralProducerPubKey)`
(the three values are part of the blob sent by the server)
which outputs a JS Blob object.

Methods `ownerCryptoContext.databox.getPublicKeysWeCanDecryptFrom`
and `ownerCryptoContext.databox.shouldBlobBeDecryptable`
can be used to test what blobs can be decrypted with the cryptographic secrets we currently have
(as secrets may be lost when the user loses her password).


### For a MK Databox Producer

Operations as a MK Databox Producer are provided by `producerCryptoContext.databox`.
Unlike with data owner logic there is no need for initialization.

One just has to add owner public keys
by calling `producerCryptoContext.databox.addOwner(ownerId, ownerPublicKey)`
(will throw if owner was added already, useful to avoid overwriting a public key by mistake)
or `producerCryptoContext.databox.setOwnerPublicKey(ownerId, ownerPublicKey)`
(sets the public key of an existing owner or creates a new owner)
and then blobs can be encrypted
by calling `producerCryptoContext.databox.encryptBlob(data, ownerId)`
with an owner ID for which a public key was added.
