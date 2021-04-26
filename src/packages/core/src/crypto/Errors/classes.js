/* eslint-disable max-classes-per-file */
export class DecryptionError extends Error { name = 'DecryptionError' }
export class BackupDecryptionError extends Error { name = 'BackupDecryptionError' }
export class BadPassword extends Error { name = 'BadPassword' }
export class SecretsNotLoadedOrCreated extends Error { name = 'SecretsNotLoadedOrCreated' }
export class NoNewSecretKeys extends Error { name = 'NoNewSecretKeys' }
export class InvalidHash extends Error {name = 'InvalidHash'}
export class BadKeyShareFormat extends InvalidHash { name = 'BadKeyShareFormat' }
export class DecryptionKeyNotFound extends Error { name = 'DecryptionKeyNotFound' }
