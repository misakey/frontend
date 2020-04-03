import React, { createContext, useState, useMemo, useEffect, useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useSnackbar } from 'notistack';
import { withTranslation } from 'react-i18next';

import API from '@misakey/api';
import ApplicationSchema from 'store/schemas/Application';

import omitTranslationProps from '@misakey/helpers/omit/translationProps';
import isNil from '@misakey/helpers/isNil';

import useHandleGenericHttpErrors from '@misakey/hooks/useHandleGenericHttpErrors';

import DialogUserContribution from 'components/smart/Dialog/UserContribution';

// CONSTANTS
const CONTRIBUTION_ENDPOINT = {
  method: 'POST',
  path: '/application-contributions',
  auth: true,
};

// CONTEXT
export const UserContributionContext = createContext({
  open: false,
  entity: {},
  dialogProps: {},
});

// COMPONENTS
const UserContributionDialogConsumerRender = ({ t, userId, ...rest }) => {
  const { enqueueSnackbar } = useSnackbar();
  const handleGenericHttpErrors = useHandleGenericHttpErrors();

  const {
    open,
    entity: { name, id },
    onClose,
    dialogProps,
  } = useContext(UserContributionContext);

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
    <DialogUserContribution
      appName={name}
      open={open}
      onClose={onClose}
      onSuccess={onSuccess}
      {...omitTranslationProps(rest)}
      {...dialogProps}
    />
  );
};

UserContributionDialogConsumerRender.propTypes = {
  // withTranslation
  t: PropTypes.func.isRequired,
  // CONNECT
  userId: PropTypes.string,
};

UserContributionDialogConsumerRender.defaultProps = {
  userId: null,
};

// CONNECT
const mapStateToProps = (state) => ({
  userId: state.auth.userId,
});

const UserContributionDialogConsumer = connect(mapStateToProps, {})(withTranslation('citizen')(UserContributionDialogConsumerRender));

const UserContributionContextProvider = ({ children, defaultEntity, ...defaultDialogProps }) => {
  const [open, setOpen] = useState(false);
  const [entity, setEntity] = useState(defaultEntity || {});
  const [dialogProps, setDialogProps] = useState({});

  const onContribute = useCallback(
    ({ entity: nextEntity, dialogProps: nextDialogProps = {} }) => {
      setOpen(true);
      if (!isNil(nextEntity)) {
        setEntity(nextEntity);
      }
      setDialogProps(nextDialogProps);
    },
    [setOpen],
  );

  const onClose = useCallback(
    () => { setOpen(false); },
    [setOpen],
  );

  const contextValue = useMemo(
    () => ({
      open,
      entity,
      onContribute,
      onClose,
      dialogProps,
    }),
    [open, entity, onContribute, onClose, dialogProps],
  );

  useEffect(
    () => {
      setEntity(defaultEntity);
    },
    [defaultEntity],
  );

  return (
    <UserContributionContext.Provider value={contextValue}>
      <UserContributionDialogConsumer
        {...defaultDialogProps}
      />
      {children}
    </UserContributionContext.Provider>
  );
};

UserContributionContextProvider.propTypes = {
  children: PropTypes.node,
  defaultEntity: PropTypes.shape(ApplicationSchema.propTypes),
};

UserContributionContextProvider.defaultProps = {
  children: null,
  defaultEntity: null,
};

export default UserContributionContextProvider;
