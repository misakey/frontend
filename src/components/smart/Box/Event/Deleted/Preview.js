import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import SenderSchema from 'store/schemas/Boxes/Sender';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import path from '@misakey/helpers/path';

import { useSelector } from 'react-redux';

import Typography from '@material-ui/core/Typography';

// CONSTANTS
const { identifierValue: IDENTIFIER_VALUE_SELECTOR } = authSelectors;

// HELPERS
const identifierValuePath = path(['identifier', 'value']);

// COMPONENTS
const BoxEventDeletedPreview = ({ t, byIdentity, ...props }) => {
  const identifierValue = useSelector(IDENTIFIER_VALUE_SELECTOR);

  const senderIdentifierValue = useMemo(
    () => identifierValuePath(byIdentity),
    [byIdentity],
  );

  const deletedByMe = useMemo(
    () => senderIdentifierValue === identifierValue,
    [senderIdentifierValue, identifierValue],
  );

  const text = useMemo(
    () => t(`boxes:read.events.deleted.${deletedByMe ? 'you' : 'they'}`),
    [t, deletedByMe],
  );

  return <Typography variant="body2" {...omitTranslationProps(props)}>{text}</Typography>;
};

BoxEventDeletedPreview.propTypes = {
  byIdentity: PropTypes.shape(SenderSchema.propTypes),
  // withTranslation
  t: PropTypes.func.isRequired,
};

BoxEventDeletedPreview.defaultProps = {
  byIdentity: null,
};

export default withTranslation('boxes')(BoxEventDeletedPreview);
