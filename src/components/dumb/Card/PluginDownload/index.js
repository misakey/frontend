import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import Typography from '@material-ui/core/Typography';
import { storeLinks } from 'constants/plugin';
import { isChrome } from 'helpers/devices';
import Card from 'components/dumb/Card';


function PluginDownloadCard({ t }) {
  const pluginHrefToStore = useMemo(
    () => (isChrome() ? storeLinks.chrome : storeLinks.firefox), [],
  );

  return (
    <Card
      my={2}
      title={t('screens:application.thirdParty.inApp.plugin.title')}
      primary={{
        target: '_blank',
        rel: 'noopener noreferrer',
        href: pluginHrefToStore,
        text: t('screens:application.thirdParty.inApp.plugin.button'),
      }}
    >
      <Typography>
        {t('screens:application.thirdParty.inApp.plugin.subtitle')}
      </Typography>
    </Card>
  );
}

PluginDownloadCard.propTypes = {
  t: PropTypes.func.isRequired,
};


export default withTranslation(['screens'])(PluginDownloadCard);
