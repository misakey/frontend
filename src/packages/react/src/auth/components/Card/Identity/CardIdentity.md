In your main app file
<!-- eslint-skip -->
```js static
import CardIdentity from '@misakey/react/auth/components/Card/Identity';

// COMPONENTS
const Example = () => {
  return (
    <CardIdentity 
      identityId="b5b82b4e-0a5f-4488-8df2-36ae708ef679"
      identity={{
        "id": "b5b82b4e-0a5f-4488-8df2-36ae708ef679",
        "accountId": "b5b82b4e-0a5f-4488-8df2-36ae708ef679",
        "hasAccount": false,
        "identifierValue":  "johnny@misakey.com",
        "identifierKind": "email",
        "displayName": "Johnny",
        "avatarUrl": null,
      }}
    />
  );
};
```
