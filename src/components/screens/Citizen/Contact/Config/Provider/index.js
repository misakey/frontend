import React, { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useFormikContext } from 'formik';

import MANUAL_TYPE from 'constants/mail-providers/manual';

import Box from '@material-ui/core/Box';
import Subtitle from 'components/dumb/Typography/Subtitle';
import List from '@material-ui/core/List';
import ListItemMailProvidersManual from 'components/dumb/ListItem/MailProviders/Manual';

import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import DialogContent from '@material-ui/core/DialogContent';

// CONSTANTS
const FIELD = 'type';

// COMPONENTS
const ContactConfigProvider = ({ t }) => {
  const { setFieldValue, setFieldTouched, setTouched } = useFormikContext();

  const onManualClick = useCallback(
    () => {
      setFieldValue(FIELD, MANUAL_TYPE);
      setFieldTouched(FIELD, true, false);
    },
    [setFieldValue, setFieldTouched],
  );

  useEffect(
    () => {
      setTouched({});
    },
    [setTouched],
  );

  return (
    <DialogContent>
      <Subtitle>
        {t('citizen__new:contact.configure.provider.subtitle')}
      </Subtitle>
      <Box mt={2} mb={6}>
        <List disablePadding>
          <ListItemMailProvidersManual
            component="button"
            type="submit"
            onClick={onManualClick}
            icon={<ChevronRightIcon />}
          />
        </List>
      </Box>
    </DialogContent>
  );
};

ContactConfigProvider.propTypes = {
  t: PropTypes.func.isRequired,
};

ContactConfigProvider.defaultProps = {
};

export default withTranslation('citizen__new')(ContactConfigProvider);
