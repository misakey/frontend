import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { Field } from 'formik';

import prop from '@misakey/helpers/prop';
import isString from '@misakey/helpers/isString';
import isNil from '@misakey/helpers/isNil';

import Box from '@material-ui/core/Box';
import AvatarDetailed from '@misakey/ui/Avatar/Detailed';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import withErrors from '@misakey/ui/Form/Field/withErrors';

// HELPERS
const getImage = prop('value');

// HOOKS
const useStyles = makeStyles(() => ({
  box: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));

const useImage = (field) => useMemo(
  () => {
    const image = getImage(field);

    return isString(image) ? image : null;
  },
  [field],
);

// COMPONENTS
// @FIXME move whole component to js-common
let FormImageField = ({
  displayError,
  errorKeys,
  field,
  text,
  helperText,
  t,
}) => {
  const image = useImage(field);

  return (
    <FormControl>
      {
        isNil(image)
          ? (null)
          : (<AvatarDetailed image={image} text={text} />)
      }
      <FormHelperText error={displayError}>
        {displayError ? t(errorKeys) : helperText}
      </FormHelperText>
    </FormControl>

  );
};

FormImageField.propTypes = {
  displayError: PropTypes.bool.isRequired,
  errorKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  field: PropTypes.shape({ name: PropTypes.string.isRequired, value: PropTypes.any }).isRequired,
  helperText: PropTypes.string,
  text: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
};

FormImageField.defaultProps = {
  helperText: '',
};

FormImageField = withTranslation('fields')(withErrors(FormImageField));

const FormImage = ({
  className,
  name,
  previewName,
  text,
  values,
  ...rest
}) => {
  const classes = useStyles();

  const preview = useMemo(
    () => prop(previewName, values),
    [values, previewName],
  );
  return (
    <Box my={2} className={classes.box}>
      {preview && <AvatarDetailed image={preview} text={text} />}
      <Field
        name={name}
        text={text}
        component={FormImageField}
        {...rest}
      />
    </Box>
  );
};

FormImage.propTypes = {
  className: PropTypes.string,
  text: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  values: PropTypes.objectOf(PropTypes.any).isRequired,
  previewName: PropTypes.string.isRequired,
};

FormImage.defaultProps = {
  className: '',
};

export default FormImage;
