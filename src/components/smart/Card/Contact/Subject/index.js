import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import RECONTACT_MAIL_TYPES, { LEGAL_RECONTACT } from 'constants/mailTypes/recontact';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import getSearchParams from '@misakey/helpers/getSearchParams';

import ToggleButtonGroupMailType from 'components/smart/ToggleButtonGroup/MailType/WithSearchParams';
import SimpleCard from 'components/dumb/Card/Simple';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

const CardContactSubject = ({ t, subject, ...rest }) => {
  const { search } = useLocation();

  const searchParams = useMemo(
    () => getSearchParams(search),
    [search],
  );

  const recontact = useMemo(
    () => searchParams.recontact === 'true',
    [searchParams],
  );

  const reopen = useMemo(
    () => searchParams.reopen === 'true',
    [searchParams],
  );

  const title = useMemo(
    () => {
      const start = t('citizen__new:contact.email.subject.label');
      const suffix = recontact || reopen ? ` ${t('citizen__new:contact.email.subject.re.label')}` : '';
      return `${start}${suffix} ${subject}`;
    },
    [recontact, reopen, subject, t],
  );

  const groupMailTypeProps = useMemo(
    () => {
      if (reopen) {
        return {
          values: RECONTACT_MAIL_TYPES,
          defaultValue: LEGAL_RECONTACT,
        };
      }
      if (recontact) {
        return {
          values: RECONTACT_MAIL_TYPES,
          defaultValue: LEGAL_RECONTACT,
        };
      }
      return {};
    },
    [recontact, reopen],
  );

  return (
    <SimpleCard
      button={(
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
        >
          <ToggleButtonGroupMailType {...groupMailTypeProps} size="small" />
        </Box>
    )}
      {...omitTranslationProps(rest)}
    >

      <Typography>
        {title}
      </Typography>
    </SimpleCard>
  );
};

CardContactSubject.propTypes = {
  t: PropTypes.func.isRequired,
  subject: PropTypes.string.isRequired,
};

export default withTranslation('citizen__new')(CardContactSubject);
