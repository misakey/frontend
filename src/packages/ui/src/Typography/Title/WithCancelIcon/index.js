import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import isFunction from '@misakey/helpers/isFunction';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import Title from '@misakey/ui/Typography/Title';
import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';

// COMPONENTS
const TitleWithCancelIcon = ({ onCancel, t, ...props }) => {
  const hasOnCancel = useMemo(
    () => isFunction(onCancel),
    [onCancel],
  );

  return (
    <>
      <Box display="flex" width="100%">
        {hasOnCancel && (
        <IconButton edge="start" aria-label={t('common:cancel')} onClick={onCancel}>
          <ArrowBackIcon />
        </IconButton>
        )}
      </Box>
      <Title {...omitTranslationProps(props)} />
    </>
  );
};

TitleWithCancelIcon.propTypes = {
  onCancel: PropTypes.func,
  // withTranslation
  t: PropTypes.func.isRequired,
};

TitleWithCancelIcon.defaultProps = {
  onCancel: null,
};

export default withTranslation('common')(TitleWithCancelIcon);
