# Documentation for Contributors of this Package

Documentation for *users* of this package is in [README.md](./README.md).

Several files have some documentation at their beginning
explainning what they do.

## File Structure

The “entry point” of this package is file `src/index.js`.
It exports *instances*
so that all parts of the application code get a same object sharing a same state
(this is a “singleton pattern”).

Inside of `src/`, `crypto` provides cryptographic functions
and `classes` uses these functions
and adds the state machine logic to implement the classes that are exported by the package.
This state logic mainly consists in storing values
like the owner ID, and cryptographic keys (public and private).
Part of the storage logic is handled by `classes/ContextStore.js`
like fetching some public info from the server when it is not available in store.

`src/databox` contains the code for the MK Databox protocol
which is due to be discontinued when the MK Data will be able to fully replace it.
This code was mainly copied from a previous project
(https://gitlab.misakey.dev/misakey/crypto-js-sdk)
and was only modified to the minimum possible
because it is only there for legacy reasons
and is supposed to disappear soon.
