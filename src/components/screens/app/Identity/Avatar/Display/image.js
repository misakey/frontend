import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import { useFormikContext } from 'formik';

import prop from '@misakey/helpers/prop';
import isString from '@misakey/helpers/isString';
import isNil from '@misakey/helpers/isNil';

import { Link } from 'react-router-dom';
import Box from '@material-ui/core/Box';
import FormField from '@misakey/ui/Form/Field';
import AvatarDetailed from '@misakey/ui/Avatar/Detailed';
import CardActionArea from '@material-ui/core/CardActionArea';
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

const useFormImageFieldStyles = makeStyles((theme) => ({
  cardActionArea: {
    borderRadius: theme.shape.borderRadius,
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
  showImage,
  to,
  t,
}) => {
  const classes = useFormImageFieldStyles();
  const image = useImage(field);

  return (
    <FormControl>
      {
        showImage
          ? (
            <CardActionArea
              className={classes.cardActionArea}
              component={Link}
              to={to}
            >
              <AvatarDetailed image={image} text={text} />
            </CardActionArea>
          )
          : (null)
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
  field: PropTypes.shape({
    name: PropTypes.string.isRequired,
    // NB: value can be an object when uploading an image
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }).isRequired,
  helperText: PropTypes.string,
  showImage: PropTypes.bool,
  text: PropTypes.string.isRequired,
  // withTranslation
  t: PropTypes.func.isRequired,
  to: PropTypes.object.isRequired,
};

FormImageField.defaultProps = {
  helperText: '',
  showImage: false,
};

FormImageField = withTranslation('fields')(withErrors(FormImageField));

const FormImage = ({
  className,
  name,
  previewName,
  text,
  ...rest
}) => {
  const classes = useStyles();

  const { status } = useFormikContext();

  const preview = useMemo(
    () => prop(previewName, status),
    [status, previewName],
  );

  const hasPreview = useMemo(
    () => !isNil(preview),
    [preview],
  );

  return (
    <Box my={2} className={classes.box}>
      {hasPreview && <AvatarDetailed image={preview} text={text} />}
      <FormField
        name={name}
        text={text}
        component={FormImageField}
        showImage={!hasPreview}
        {...rest}
      />
    </Box>
  );
};

FormImage.propTypes = {
  className: PropTypes.string,
  text: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  previewName: PropTypes.string.isRequired,
};

FormImage.defaultProps = {
  className: '',
};

export default FormImage;
