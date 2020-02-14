import React, { useMemo } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import ApplicationSchema from 'store/schemas/Application';

import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';
import { IS_PLUGIN, storeLinks } from 'constants/plugin';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

import withDialogConnect from 'components/smart/Dialog/Connect/with';

import Title from 'components/dumb/Typography/Title';
import { BUTTON_STANDINGS } from 'components/dumb/Button';

import CardSimpleText from 'components/dumb/Card/Simple/Text';
import CardSimpleDoubleButton from 'components/dumb/Card/Simple/DoubleButton';
import DetectedTrackersSummary from 'components/screens/Citizen/Application/Info/Legal/ThirdPartySummary';
import { isPluginDetected } from '@misakey/helpers/plugin';


// CONSTANTS
const linksType = ['privacy_policy', 'tos', 'cookies'];

// COMPONENTS
const ButtonWithDialogConnect = withDialogConnect(Button);

const ApplicationInfoLegal = ({
  application,
  t,
  history,
  location,
  onContributionLinkClick,
}) => {
  const links = useMemo(
    () => linksType.map((linkType) => {
      if (!isNil(application.links)) {
        const link = application.links.find((el) => el.type === linkType);
        if (!isNil(link)) {
          return {
            key: linkType,
            label: t(`screens:application.info.legal.links.${linkType}`),
            button: {
              standing: BUTTON_STANDINGS.OUTLINED,
              size: 'small',
              text: t('common:show'),
              component: 'a',
              href: link.value,
              target: '_blank',
            },
          };
        }
      }
      return {
        key: linkType,
        label: t(`screens:application.info.legal.links.${linkType}`),
        button: {
          standing: BUTTON_STANDINGS.OUTLINED,
          size: 'small',
          text: t('common:add'),
          onClick: onContributionLinkClick,
          component: ButtonWithDialogConnect,
        },
      };
    }),
    [t, application, onContributionLinkClick],
  );

  const { isUnknown } = useMemo(() => (application), [application]);
  const isPluginInstalled = useMemo(() => (isPluginDetected()), []);

  if (isEmpty(application)) { return null; }

  return (
    <>
      {IS_PLUGIN && (
        <DetectedTrackersSummary entity={application} history={history} location={location} />
      )}

      {/* @FIXME: add a hook to detect if plugin is installed, then don't display that */}
      {!IS_PLUGIN && !isPluginInstalled && (
        <Box my={3}>
          <Title>
            {t('screens:application.thirdParty.summary.title')}
          </Title>
          <CardSimpleDoubleButton
            text={t('screens:application.info.legal.cookies.text')}
            primary={{
              standing: BUTTON_STANDINGS.OUTLINED,
              text: t('screens:application.info.legal.cookies.button.chrome'),
              size: 'small',
              component: 'a',
              href: storeLinks.chrome,
              target: '_blank',
              rel: 'noreferrer noopener',
            }}
            secondary={{
              standing: BUTTON_STANDINGS.OUTLINED,
              text: t('screens:application.info.legal.cookies.button.firefox'),
              size: 'small',
              component: 'a',
              href: storeLinks.firefox,
              target: '_blank',
              rel: 'noreferrer noopener',
            }}
          />
        </Box>
      )}
      {!isUnknown && (
        <Box my={3}>
          <Title>
            {t('screens:application.info.legal.linksListTitle')}
          </Title>
          {links.map(({ key, label, button }) => (
            <CardSimpleText key={key} text={label} button={button} my={1} />
          ))}
        </Box>
      )}
    </>
  );
};

ApplicationInfoLegal.propTypes = {
  application: PropTypes.shape(ApplicationSchema.propTypes).isRequired,
  onContributionLinkClick: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

export default withTranslation(['common', 'screens'])(ApplicationInfoLegal);
