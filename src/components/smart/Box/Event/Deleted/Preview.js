import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import SenderSchema from 'store/schemas/Boxes/Sender';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';
import { senderMatchesIdentifierId } from 'helpers/sender';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import { useSelector } from 'react-redux';

import Typography from '@material-ui/core/Typography';

// CONSTANTS
const { identifierId: IDENTIFIER_ID_SELECTOR } = authSelectors;

// COMPONENTS
const BoxEventDeletedPreview = ({ t, byIdentity, ...props }) => {
  const identifierId = useSelector(IDENTIFIER_ID_SELECTOR);

  const deletedByMe = useMemo(
    () => senderMatchesIdentifierId(byIdentity, identifierId),
    [byIdentity, identifierId],
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
