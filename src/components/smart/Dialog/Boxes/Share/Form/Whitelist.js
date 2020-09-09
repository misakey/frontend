import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Form, Field } from 'formik';

import Formik from '@misakey/ui/Formik';
import InputAdornment from '@material-ui/core/InputAdornment';
import FieldTextStandard from 'components/dumb/Form/Field/Text/Standard';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import AddIcon from '@material-ui/icons/Add';
import IconButtonSubmit from '@misakey/ui/IconButton/Submit';
import Chip from '@material-ui/core/Chip';
import Box from '@material-ui/core/Box';
import makeStyles from '@material-ui/core/styles/makeStyles';

// HOOKS
const useStyles = makeStyles((theme) => ({
  chip: {
    marginRight: theme.spacing(0.5),
  },
  form: {
    minWidth: '40%',
  },
}));

function AccessWhitelistForm({
  t, values, onSubmit, onRemove, fieldName, validationSchema, startAdornment,
}) {
  const classes = useStyles();
  return (
    <>
      <Subtitle>{t(`boxes:read.share.level.limited.${fieldName}.title`)}</Subtitle>
      <Box display="flex" alignItems="center" flexWrap="wrap">
        {values.map((value) => (
          <Chip
            label={value}
            key={value}
            className={classes.chip}
            onDelete={onRemove(value)}
            variant="outlined"
          />
        ))}
        <Formik
          initialValues={{ [fieldName]: '' }}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          <Form className={classes.form}>
            <Field
              name={fieldName}
              prefix="boxes."
              component={FieldTextStandard}
              fullWidth
              placeholder={t(`fields:boxes.${fieldName}.placeholder`)}
              InputProps={{
                name: fieldName,
                startAdornment,
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButtonSubmit
                      aria-label={t('common:add')}
                      edge="end"
                    >
                      <AddIcon fontSize="small" />
                    </IconButtonSubmit>
                  </InputAdornment>
                ),
              }}
            />
          </Form>
        </Formik>
      </Box>
    </>
  );
}

AccessWhitelistForm.propTypes = {
  t: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  fieldName: PropTypes.string.isRequired,
  validationSchema: PropTypes.object.isRequired,
  startAdornment: PropTypes.node,
  values: PropTypes.arrayOf(PropTypes.string),
};

AccessWhitelistForm.defaultProps = {
  startAdornment: null,
  values: [],
};

export default withTranslation(['common', 'fields'])(AccessWhitelistForm);
