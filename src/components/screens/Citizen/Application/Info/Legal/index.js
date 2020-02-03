import React, { useMemo } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

import ApplicationSchema from 'store/schemas/Application';

import isEmpty from '@misakey/helpers/isEmpty';
import isNil from '@misakey/helpers/isNil';
import { IS_PLUGIN, storeLinks } from 'constants/plugin';
import { isChrome } from 'helpers/devices';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';

import Skeleton from '@material-ui/lab/Skeleton';
import Card from 'components/dumb/Card';
import withDialogConnect from 'components/smart/Dialog/Connect/with';

import Title from 'components/dumb/Typography/Title';
import { BUTTON_STANDINGS } from 'components/dumb/Button';

import CardSimpleTextButton from 'components/dumb/Card/Simple/TextButton';

import DetectedTrackersSummary from 'components/screens/Citizen/Application/Info/Legal/ThirdPartySummary';


// CONSTANTS
const linksType = ['privacy_policy', 'tos', 'cookies'];

const LINK_TO_STORE = isChrome() ? storeLinks.chrome : storeLinks.firefox;


// COMPONENTS
const ButtonWithDialogConnect = withDialogConnect(Button);

const OnLoading = ({ t }) => (
  <Box mt={3}>
    <Title>
      {t('screens:application.info.legal.linksListTitle')}
    </Title>
    <Card><Skeleton variant="text" height={50} /></Card>
    <Card><Skeleton variant="text" height={50} /></Card>
    <Card><Skeleton variant="text" height={50} /></Card>
  </Box>
);

OnLoading.propTypes = {
  t: PropTypes.func.isRequired,
};

const ApplicationInfoLegal = ({
  application,
  isLoading,
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
          text: t('common:IKnowIt'),
          onClick: onContributionLinkClick,
          component: ButtonWithDialogConnect,
        },
      };
    }),
    [t, application, onContributionLinkClick],
  );

  const { isUnknown } = useMemo(() => (application), [application]);

  if (isLoading) { return <OnLoading t={t} />; }

  if (isEmpty(application)) { return null; }

  return (
    <>
      {IS_PLUGIN && (
        <DetectedTrackersSummary entity={application} history={history} location={location} />
      )}

      {/* @FIXME: add a hook to detect if plugin is installed, then don't display that */}
      {!IS_PLUGIN && (
        <Box my={3}>
          <Title>
            {t('screens:application.thirdParty.summary.title')}
          </Title>
          <CardSimpleTextButton
            text={t('screens:application.info.legal.cookies.text')}
            button={{
              standing: BUTTON_STANDINGS.OUTLINED,
              text: t('screens:application.info.legal.cookies.button'),
              component: 'a',
              href: LINK_TO_STORE,
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
            <CardSimpleTextButton key={key} text={label} button={button} my={1} />
          ))}
        </Box>
      )}
    </>
  );
};

ApplicationInfoLegal.propTypes = {
  application: PropTypes.shape(ApplicationSchema.propTypes).isRequired,
  isLoading: PropTypes.bool,
  onContributionLinkClick: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
};

ApplicationInfoLegal.defaultProps = {
  isLoading: false,
};

export default withTranslation(['common', 'screens'])(ApplicationInfoLegal);
