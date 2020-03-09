import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Field, useFormikContext } from 'formik';

import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Subtitle from 'components/dumb/Typography/Subtitle';
import FieldText from 'components/dumb/Form/Field/Text';
import BoxControls from 'components/dumb/Box/Controls';

// COMPONENTS
const ContactConfigIdentifier = ({ t }) => {
  const { setTouched } = useFormikContext();

  useEffect(
    () => {
      setTouched({ type: true });
    },
    [setTouched],
  );

  return (
    <>
      <DialogContent>
        <Subtitle>
          {t('citizen__new:contact.configure.identifier.subtitle')}
        </Subtitle>
        <Field
          component={FieldText}
          name="email"
          variant="outlined"
          autoFocus
          id="email-address"
          fullWidth
          label={t('fields__new:email.label')}
          placeholder={t('fields__new:email.placeholder')}
        />
      </DialogContent>
      <DialogActions>
        <BoxControls
          primary={{
            type: 'submit',
            text: t('common__new:next'),
          }}
          formik
        />
      </DialogActions>
    </>
  );
};

ContactConfigIdentifier.propTypes = {
  t: PropTypes.func.isRequired,
};


export default withTranslation(['citizen__new', 'common__new', 'fields__new'])(ContactConfigIdentifier);
