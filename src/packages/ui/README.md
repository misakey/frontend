### @misakey/ui

```shell
yarn add @misakey/ui
```

### Overwrite i18n translations
If you want to overwrite the common translations, you need to create
a `constants/locales/fr/namespace.json` file and add the same keys with
your own text.

<!-- eslint-skip -->
```js static
import '@misakey/ui/i18n';
import FRCommon from 'constants/locales/fr/common';
import FRFields from 'constants/locales/fr/fields';

i18n.addResourceBundle('fr', 'common', FRCommon, true, true);
i18n.addResourceBundle('fr', 'fields', FRFields, true, true);
```

See https://www.i18next.com/overview/api#addresourcebundle
