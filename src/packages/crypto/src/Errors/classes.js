/* eslint-disable max-classes-per-file */
export class DecryptionError extends Error { name = 'DecryptionError' }
export class BackupDecryptionError extends Error { name = 'BackupDecryptionError' }
export class BadPassword extends Error { name = 'BadPassword' }
export class SecretsNotLoadedOrCreated extends Error { name = 'SecretsNotLoadedOrCreated' }
export class NoNewSecretKeys extends Error { name = 'NoNewSecretKeys' }
