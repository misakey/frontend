import React, { useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import { useSnackbar } from 'notistack';

import { makeStyles } from '@material-ui/core/styles';

import log from '@misakey/helpers/log';

import importSecrets from '@misakey/crypto/store/actions/importSecrets';
import {
  NoNewSecretKeys,
} from '@misakey/crypto/Errors/classes';

import Button, { BUTTON_STANDINGS } from 'components/dumb/Button';
import { usePasswordPrompt } from 'components/dumb/PasswordPrompt';
import { useDispatch } from 'react-redux';


const useStyles = makeStyles({
  input: {
    display: 'none',
  },
});

const ImportButton = ({ t }) => {
  const { enqueueSnackbar } = useSnackbar();

  const dispatch = useDispatch();
  const openPasswordPrompt = usePasswordPrompt();

  const classes = useStyles();

  const inputRef = useRef();

  const onClick = useCallback(
    (event) => {
      const { current } = inputRef;
      if (current) {
        current.click(event);
      }
    },
    [inputRef],
  );

  const onInputChange = useCallback(
    async (event) => {
      try {
        const file = event.target.files[0];

        await dispatch(importSecrets(file, openPasswordPrompt));
        enqueueSnackbar(
          t('account:exportCrypto.importButton.success'),
          { variant: 'success' },
        );
      } catch (error) {
        if (error instanceof NoNewSecretKeys) {
          enqueueSnackbar(
            t('account:exportCrypto.importButton.noNewSecretKeys'),
            { variant: 'info' },
          );
        } else {
          enqueueSnackbar(
            t('account:exportCrypto.importButton.error'),
            { variant: 'error' },
          );
          log(error, 'error');
        }
      }
    },
    [dispatch, enqueueSnackbar, openPasswordPrompt, t],
  );

  return (
    <label htmlFor="button-file">
      <input
        type="file"
        id="button-file"
        ref={inputRef}
        className={classes.input}
        onChange={onInputChange}
        accept=".json"
      />
      <Button
        standing={BUTTON_STANDINGS.TEXT}
        type="button"
        onClick={onClick}
        text={t('account:exportCrypto.importButton.text')}
      />
    </label>
  );
};

ImportButton.propTypes = {
  t: PropTypes.func.isRequired,
};

export default withTranslation(['account'])(ImportButton);
