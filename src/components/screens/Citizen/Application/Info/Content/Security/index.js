import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import ApplicationSchema from 'store/schemas/Application';

import isEmpty from '@misakey/helpers/isEmpty';
import propOr from '@misakey/helpers/propOr';

import Typography from '@material-ui/core/Typography';
import ContactButton from 'components/smart/ContactButton';
import Card from 'components/dumb/Card';

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
        return t('screens:application.info.security.dpo');
      }
      if (hasDpoContact) {
        return t('screens:application.info.security.contactForm');
      }

      return t('screens:application.info.security.default');
    },
    [hasDpoEmail, hasDpoContact, isAuthenticated, t],
  );

  return (
    <Card
      mb={3}
      title={t('screens:application.info.security.title')}
      primary={(!hasDpoEmail && hasDpoContact)
        ? ({
          href: dpoContact,
          variant: 'contained',
          text: t('screens:application.info.security.button.contactForm'),
        })
        : (
          <ContactButton
            dpoEmail={dpoEmail}
            onContributionClick={onContributionDpoEmailClick}
            applicationID={id}
            mainDomain={mainDomain}
            buttonProps={{ variant: 'contained' }}
          >
            {t('screens:application.info.security.button.dpo')}
          </ContactButton>
        )}
      secondary={(!hasDpoEmail && hasDpoContact) ? (
        <ContactButton
          dpoEmail={dpoEmail}
          onContributionClick={onContributionDpoEmailClick}
          applicationID={id}
          mainDomain={mainDomain}
          buttonProps={{ variant: 'outlined' }}
        />
      ) : undefined}
    >
      <Typography color="textSecondary">
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
