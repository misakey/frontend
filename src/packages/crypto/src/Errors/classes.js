/* eslint-disable max-classes-per-file */
export class DecryptionError extends Error { name = 'DecryptionError' }
export class BackupDecryptionError extends Error { name = 'BackupDecryptionError' }
export class SecretsNotLoadedOrCreated extends Error { name = 'SecretsNotLoadedOrCreated' }
