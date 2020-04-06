import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import RECONTACT_MAIL_TYPES, { LEGAL_RECONTACT } from 'constants/mailTypes/recontact';

import getSearchParams from '@misakey/helpers/getSearchParams';

import ToggleButtonGroupMailType from 'components/smart/ToggleButtonGroup/MailType/WithSearchParams';
import Box from '@material-ui/core/Box';


const BoxContactMailType = () => {
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
    <Box display="flex" my={1}>
      <ToggleButtonGroupMailType {...groupMailTypeProps} size="small" />
    </Box>
  );
};

export default BoxContactMailType;
