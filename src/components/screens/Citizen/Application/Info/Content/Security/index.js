import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import { Link } from 'react-router-dom';
import MUILink from '@material-ui/core/Link';


import ApplicationSchema from 'store/schemas/Application';

import isEmpty from '@misakey/helpers/isEmpty';
import propOr from '@misakey/helpers/propOr';

import Typography from '@material-ui/core/Typography';
import ContactButton from 'components/smart/ContactButton';
import { BUTTON_STANDINGS } from 'components/dumb/Button';
import Card from 'components/dumb/Card';
import { openInNewTab } from 'helpers/plugin';
import { IS_PLUGIN } from 'constants/plugin';

// CONSTANTS
const DPO_CONTACT_TYPE = 'dpo_contact';

// HELPERS
const getDpoContactLink = (links = []) => {
  const dpoContactLink = links.find(({ type }) => type === DPO_CONTACT_TYPE);
  return propOr('', 'value', dpoContactLink);
};

const InfoContentSecurity = ({
  onContributionDpoEmailClick,
  isAuthenticated,
  entity: { dpoEmail, links, id, mainDomain },
  t,
}) => {
  const hasDpoEmail = useMemo(
    () => !isEmpty(dpoEmail),
    [dpoEmail],
  );

  const dpoContact = useMemo(
    () => getDpoContactLink(links),
    [links],
  );

  const hasDpoContact = useMemo(
    () => !isEmpty(dpoContact),
    [dpoContact],
  );

  const securityContent = useMemo(
    () => {
      if (!isAuthenticated || hasDpoEmail) {
        return (
          <Trans i18nKey="screens:application.info.security.dpo.text">
            {'Je demande mes données au site au travers d’une '}
            <MUILink
              color="secondary"
              to={t('screens:application.info.security.dpo.faqPortabilityRequest')}
              component={Link}
              target="_blank"
              rel="noopener noreferrer"
            >
              demande de portabilité
            </MUILink>
            .
            <br />
            Je pourrai les retrouver sur mon espace Misakey et en profiter comme bon me semble.
          </Trans>
        );
      }
      if (hasDpoContact) {
        return t('screens:application.info.security.contactForm');
      }

      return t('screens:application.info.security.default');
    },
    [hasDpoEmail, hasDpoContact, isAuthenticated, t],
  );

  const primary = useMemo(() => {
    const buttonProps = {
      variant: 'contained',
      text: t('screens:application.info.security.button.contactForm'),
      ...(IS_PLUGIN ? { onClick: () => openInNewTab(dpoContact) } : { href: dpoContact }),
    };
    if (!hasDpoEmail && hasDpoContact) { return buttonProps; }
    return (
      <ContactButton
        dpoEmail={dpoEmail}
        onContributionClick={onContributionDpoEmailClick}
        applicationID={id}
        mainDomain={mainDomain}
        buttonProps={{ standing: BUTTON_STANDINGS.MAIN }}
      />
    );
  }, [
    dpoContact, dpoEmail, hasDpoContact, hasDpoEmail,
    id, mainDomain, onContributionDpoEmailClick, t,
  ]);

  const secondary = useMemo(
    () => ((!hasDpoEmail && hasDpoContact)
      ? (
        <ContactButton
          dpoEmail={dpoEmail}
          onContributionClick={onContributionDpoEmailClick}
          applicationID={id}
          mainDomain={mainDomain}
          buttonProps={{ standing: BUTTON_STANDINGS.MINOR }}
        />
      )
      : undefined),
    [dpoEmail, hasDpoContact, hasDpoEmail, id, mainDomain, onContributionDpoEmailClick],
  );

  return (
    <Card
      mb={3}
      title={t('screens:application.info.security.title')}
      primary={primary}
      secondary={secondary}
    >
      <Typography>
        {securityContent}
      </Typography>
    </Card>
  );
};

InfoContentSecurity.propTypes = {
  onContributionDpoEmailClick: PropTypes.func.isRequired,
  entity: PropTypes.shape(ApplicationSchema.propTypes),
  isAuthenticated: PropTypes.bool,
  t: PropTypes.func.isRequired,
};

InfoContentSecurity.defaultProps = {
  entity: null,
  isAuthenticated: false,
};

export default withTranslation('screens')(InfoContentSecurity);
