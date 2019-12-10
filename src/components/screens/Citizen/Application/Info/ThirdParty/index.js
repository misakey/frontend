import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import isArray from '@misakey/helpers/isArray';
import isNil from '@misakey/helpers/isNil';

import Box from '@material-ui/core/Box';
import MUILink from '@material-ui/core/Link';

import PluginDownloadCard from 'components/dumb/Card/PluginDownload';

import GridListKeyValue from 'components/dumb/Grid/List/KeyValue';

import Card from 'components/dumb/Card';
import withDialogConnect from 'components/smart/Dialog/Connect/with';
import { IS_PLUGIN } from 'constants/plugin';

import DetectedTrackersSummary from './Summary';

const requiredLinksType = ['cookies'];

const ConnectLink = withDialogConnect(MUILink);

const getMissingLinkCustomizer = (t, handleClick) => {
  const match = (value, key) => requiredLinksType.includes(key) && isNil(value);


  const format = () => (
    <ConnectLink onClick={handleClick} color="primary" component="button">
      {t('screens:application.info.userContribution.linkOpenDialog')}
    </ConnectLink>
  );

  return [match, format];
};

function ThirdParty({
  entity,
  onContributionLinkClick,
  history,
  location,
  t,
}) {
  const missingLinkCustomizer = React.useMemo(
    () => getMissingLinkCustomizer(t, onContributionLinkClick),
    [t, onContributionLinkClick],
  );


  // @FIXME: fix the js-common component to work if all keys of object are null
  let otherInfo = {
    cookies: null,
    pleaseFixMe: 'ASAP',
  };

  if (isArray(entity.links)) {
    const links = {};
    entity.links.forEach(({ type, value }) => {
      if (otherInfo[type] !== undefined) {
        links[type] = value;
      }
    });
    otherInfo = { ...otherInfo, ...links };
  }

  // @FIXME: Add section with Cookies link if present / CTA to add a new one

  return (
    <>
      {IS_PLUGIN && (
        <DetectedTrackersSummary entity={entity} history={history} location={location} />
      )}

      {!entity.unknown && (
        <Card
          my={2}
          title={t('screens:application.info.desc.title')}
        >
          <Box px={3} pb={2}>
            <GridListKeyValue
              t={t}
              cols={2}
              object={otherInfo}
              hideNil={false}
              hideEmpty={false}
              omitKeys={['pleaseFixMe']}
              keyPrefix="screens:application.info.secondary.keys."
              customizers={[
                missingLinkCustomizer,
              ]}
            />
          </Box>
        </Card>
      )}

      {!IS_PLUGIN && <PluginDownloadCard />}
    </>
  );
}

ThirdParty.propTypes = {
  t: PropTypes.func.isRequired,
  entity: PropTypes.object.isRequired,
  onContributionLinkClick: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.shape({
    search: PropTypes.string.isRequired,
  }).isRequired,
};


export default withTranslation(['screens'])(ThirdParty);
