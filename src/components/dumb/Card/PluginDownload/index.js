import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import Typography from '@material-ui/core/Typography';

import Card from 'components/dumb/Card';


function PluginDownloadCard({ t }) {
  let pluginHrefToStore = 'https://addons.mozilla.org/addon/misakey/';
  if (navigator.userAgent.indexOf('Chrome') !== -1) {
    pluginHrefToStore = 'https://chrome.google.com/webstore/detail/misakey-prenez-le-contr%C3%B4l/lhnflkdbfockggbfaocheaehpmejnaij';
  }

  return (
    <Card
      my={2}
      title={t('screens:application.thirdParty.inApp.plugin.title')}
      primary={{
        variant: 'outlined',
        color: 'secondary',
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
