import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import CardSimpleText from 'components/dumb/Card/Simple/Text';

import ImportButton from './ImportButton';

// @FIXME not used yet, could be used when implementing reimport crypto
const ImportCard = ({ t }) => (
  <CardSimpleText
    text={t('account:exportCrypto.importButton.info')}
    button={<ImportButton />}
  />
);

ImportCard.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation(['account'])(ImportCard);
