import React, { useMemo, useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormikContext } from 'formik';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import Button, { BUTTON_STANDINGS } from '@misakey/ui/Button';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import Typography from '@material-ui/core/Typography';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import Box from '@material-ui/core/Box';
import makeStyles from '@material-ui/core/styles/makeStyles';

import decodeBuffer from '@misakey/core/helpers/decodeBuffer';
import encodeBuffer from '@misakey/core/helpers/encodeBuffer';

import isNil from '@misakey/core/helpers/isNil';
import WebauthnIncompatibilityWarning from '@misakey/react/auth/components/Webauthn/IncompatibilityWarning';
import { selectors as ssoSelectors } from '@misakey/react/auth/store/reducers/sso';

const { methodMetadata: methodMetadataSelector } = ssoSelectors;

const useStyles = makeStyles(() => ({
  subtitle: {
    whiteSpace: 'pre-wrap',
  },
  icon: {
    fontSize: 60,
    margin: '1rem',
  },
}));

const WebauthnLogin = ({ field: { name } }) => {
  const { t } = useTranslation(['components', 'common']);
  const classes = useStyles();

  const metadata = useSelector(methodMetadataSelector);

  const [shouldLaunchDetection, setShouldLaunchDetection] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);

  const { setFieldValue, errors, submitForm, resetForm } = useFormikContext();
  const { [name]: hasError } = useMemo(
    () => errors,
    [errors],
  );

  const decodedMetadata = useMemo(
    () => {
      if (isNil(metadata)) { return null; }
      const { publicKey, ...rest } = metadata;
      const { challenge, allowCredentials, ...publicKeyRest } = publicKey;
      return {
        publicKey: {
          challenge: decodeBuffer(publicKey.challenge),
          allowCredentials: !isNil(allowCredentials)
            ? allowCredentials.map(({ id, ...credRest }) => ({
              id: decodeBuffer(id),
              ...credRest,
            }))
            : allowCredentials,
          ...publicKeyRest,
        },
        ...rest,
      };
    },
    [metadata],
  );

  const onAskAuth = useCallback(
    async () => {
      if (!('credentials' in navigator)) { return; }
      resetForm();
      try {
        setIsDetecting(true);
        const { id, rawId, response, type } = await navigator.credentials.get(decodedMetadata);
        setFieldValue(name, {
          id,
          rawId: encodeBuffer(rawId),
          response: {
            clientDataJSON: encodeBuffer(response.clientDataJSON),
            authenticatorData: encodeBuffer(response.authenticatorData),
            signature: encodeBuffer(response.signature),
            userHandle: encodeBuffer(response.userHandle),
          },
          type,
        });
      } finally {
        submitForm();
        setIsDetecting(false);
      }
    },
    [decodedMetadata, name, resetForm, setFieldValue, submitForm],
  );

  useEffect(
    () => {
      if (!isDetecting && shouldLaunchDetection && !isNil(metadata)) {
        onAskAuth();
        setShouldLaunchDetection(false);
      }
    },
    [isDetecting, metadata, onAskAuth, shouldLaunchDetection],
  );

  return (
    <Box display="flex" flexDirection="column" alignItems="center" m={1}>
      <Typography variant="h6" align="center">{t('components:webauthnLogin.title')}</Typography>
      <FingerprintIcon className={classes.icon} />
      <WebauthnIncompatibilityWarning />
      {isDetecting && (
        <Subtitle align="center" className={classes.subtitle}>
          {t('components:webauthnLogin.subtitle.detecting')}
        </Subtitle>
      )}
      {hasError && (
        <Subtitle color="error" align="center">
          {t('components:webauthnLogin.subtitle.error')}
        </Subtitle>
      )}
      <Button
        standing={BUTTON_STANDINGS.TEXT}
        onClick={onAskAuth}
        text={t('common:retry')}
        disabled={isDetecting || isNil(metadata)}
      />
    </Box>
  );
};

WebauthnLogin.propTypes = {
  field: PropTypes.shape({ name: PropTypes.string.isRequired }).isRequired,
};

export default WebauthnLogin;
