import React, { useState, useMemo, useCallback, forwardRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';

import API from '@misakey/api';

import ApplicationSchema from 'store/schemas/Application';

import isFunction from '@misakey/helpers/isFunction';
import omitTranslationProps from '@misakey/helpers/omit/translationProps';

import useHandleGenericHttpErrors from '@misakey/hooks/useHandleGenericHttpErrors';

import DialogUserContribution, { USER_CONTRIBUTION_TYPES } from 'components/smart/Dialog/UserContribution';

// CONSTANTS
const CONTRIBUTION_ENDPOINT = {
  method: 'POST',
  path: '/application-contributions',
  auth: true,
};

// COMPONENTS
const withDialogUserContribution = (Component) => {
  let Wrapper = ({
    onClick,
    entity,
    dialogProps,
    userId,
    t,
    ...props
  }, ref) => {
    const { enqueueSnackbar } = useSnackbar();
    const handleGenericHttpErrors = useHandleGenericHttpErrors();

    const [open, setOpen] = useState(false);

    const { name, id } = useMemo(
      () => entity || {},
      [entity],
    );

    const onWrapperClick = useCallback(
      (...args) => {
        setOpen(true);
        if (isFunction(onClick)) {
          onClick(...args);
        }
      },
      [onClick, setOpen],
    );

    const onClose = useCallback(
      () => { setOpen(false); },
      [setOpen],
    );

    const onSuccess = useCallback(
      (dpoEmail, link) => API.use(CONTRIBUTION_ENDPOINT)
        .build(null, {
          user_id: userId,
          dpo_email: dpoEmail,
          link,
          application_id: id,
        })
        .send()
        .then(() => {
          const text = t('citizen:userContribution.success');
          enqueueSnackbar(text, { variant: 'success' });
        })
        .catch(handleGenericHttpErrors)
        .finally(onClose),
      [enqueueSnackbar, handleGenericHttpErrors, id, onClose, t, userId],
    );

    return (
      <>
        <DialogUserContribution
          appName={name}
          open={open}
          onClose={onClose}
          onSuccess={onSuccess}
          {...dialogProps}
        />
        <Component ref={ref} onClick={onWrapperClick} {...omitTranslationProps(props)} />
      </>
    );
  };

  Wrapper = forwardRef(Wrapper);

  Wrapper.propTypes = {
    onClick: PropTypes.func,
    entity: PropTypes.shape(ApplicationSchema.propTypes),
    dialogProps: PropTypes.shape({
      onClose: PropTypes.func,
      onSuccess: PropTypes.func,
      open: PropTypes.bool,
      userContributionType: PropTypes.oneOf(USER_CONTRIBUTION_TYPES),
    }),
    // withTranslation
    t: PropTypes.func.isRequired,
    // connect
    userId: PropTypes.string,
  };

  Wrapper.defaultProps = {
    onClick: null,
    userId: null,
    entity: null,
    dialogProps: {},
  };

  // CONNECT
  const mapStateToProps = (state) => ({
    userId: state.auth.userId,
  });
  return connect(mapStateToProps, {}, null, { forwardRef: true })(withTranslation('citizen')(Wrapper));
};

export default withDialogUserContribution;
