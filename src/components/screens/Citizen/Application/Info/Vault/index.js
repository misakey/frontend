import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import CardSimpleText from 'components/dumb/Card/Simple/Text';
import ApplicationSchema from 'store/schemas/Application';
import { PORTABILITY } from 'constants/databox/type';
import { BUTTON_STANDINGS } from 'components/dumb/Button';
import ButtonWithRequestCreation from 'components/smart/Requests/New/with/Button';

// COMPONENTS
function ApplicationInfoVault({
  application,
  t,
}) {
  return (
    <CardSimpleText
      text={t('citizen:application.info.vault.contact.text')}
      button={(
        <ButtonWithRequestCreation
          text={t('citizen:application.info.vault.contact.button')}
          standing={BUTTON_STANDINGS.MAIN}
          size="small"
          producerId={application.id}
          type={PORTABILITY}
        />
      )}
    />
  );
}

ApplicationInfoVault.propTypes = {
  application: PropTypes.shape(ApplicationSchema.propTypes),
  t: PropTypes.func.isRequired,
};

ApplicationInfoVault.defaultProps = {
  application: {},
};

export default withTranslation(['citizen'])(ApplicationInfoVault);
