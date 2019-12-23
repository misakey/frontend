```js
import React from 'react';
import MenuService from './index';

const selected = 1;
const services = [{
  description: 'Le sport en direct sur L’Équipe. Les informations, résultats et classements de tous les sports. Directs commentés, images et vidéos à regarder et à partager !',
  logoUri: 'https://static.misakey.com/application-logo/lequipe.fr/4c0846e67f37c3bfdb8febd16b9e4577.png',
  mainDomain: 'lequipe.fr',
  name: 'L\'Équipe',
}, {
  description: 'Google LLC is an American multinational technology company that specializes in Internet-related services and products.',
  logoUri: 'https://static.misakey.com/application-logo/google.fr/9c165e1e8032921866e4585d7d4310e4.png',
  mainDomain: 'google.com',
  name: 'Google',
}];

const MenuServiceExample = () => (
  <MenuService selected={selected} services={services} />
);

  <MenuServiceExample />;
```

#### With additional items
```js
import React from 'react';
import PropTypes from 'prop-types';
import tDefault from '@misakey/helpers/tDefault';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Typography from '@material-ui/core/Typography';
import CreateIcon from '@material-ui/icons/Create';

import MenuService from './index';

const selected = 1;
const services = [{
  description: 'Le sport en direct sur L’Équipe. Les informations, résultats et classements de tous les sports. Directs commentés, images et vidéos à regarder et à partager !',
  logoUri: 'https://static.misakey.com/application-logo/lequipe.fr/4c0846e67f37c3bfdb8febd16b9e4577.png',
  mainDomain: 'lequipe.fr',
  name: 'L\'Équipe',
}, {
  description: 'Google LLC is an American multinational technology company that specializes in Internet-related services and products.',
  logoUri: 'https://static.misakey.com/application-logo/google.fr/9c165e1e8032921866e4585d7d4310e4.png',
  mainDomain: 'google.com',
  name: 'Google',
}];

const AfterServices = ({ t }) => (
  <MenuItem button component="li">
    <ListItemIcon>
      <CreateIcon />
    </ListItemIcon>
    <Typography variant="inherit">
      {t('service.create.label', 'Add a new service')}
    </Typography>
  </MenuItem>
);

AfterServices.propTypes = {
  t: PropTypes.func,
};

AfterServices.defaultProps = {
  t: tDefault,
};

const MenuServiceWithOtherItems = () => (
  <MenuService
    selected={selected}
    services={services}
    afterServices={<AfterServices />}
  />
);

  <MenuServiceWithOtherItems />;
```

