import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { connect } from 'react-redux';

import { mailProviderPreferencyUpdate } from 'store/actions/screens/contact';

import isNil from '@misakey/helpers/isNil';
import isFunction from '@misakey/helpers/isFunction';

import Container from '@material-ui/core/Container';
import Subtitle from 'components/dumb/Typography/Subtitle';
import ListMailProviders from 'components/smart/List/MailProviders';
import BoxControls from 'components/dumb/Box/Controls';
import BoxMessage from '@misakey/ui/Box/Message';

const useStyles = makeStyles(() => ({
  subtitleRoot: {
    whiteSpace: 'pre-wrap',
  },
}));

// COMPONENTS
const ContactProvidersBlock = ({
  doneTo,
  onDone,
  mailtoProps,
  dispatchUpdateMailProvider,
  t,
}) => {
  const classes = useStyles();

  const [contacted, setContacted] = useState(false);

  const subtitle = useMemo(
    () => t('citizen__new:contact.providers.subtitle'),
    [t],
  );

  const onChange = useCallback(
    (provider) => {
      if (!isNil(provider)) {
        dispatchUpdateMailProvider(provider);
      }
      setContacted(true);
    },
    [dispatchUpdateMailProvider, setContacted],
  );

  const onReset = useCallback(
    () => {
      dispatchUpdateMailProvider(null);
      setContacted(false);
    },
    [dispatchUpdateMailProvider, setContacted],
  );

  const primary = useMemo(
    () => ({
      component: Link,
      to: doneTo,
      onClick: isFunction(onDone) ? onDone : undefined,
      text: t('common__new:done'),
      disabled: !contacted,
    }),
    [contacted, doneTo, onDone, t],
  );

  const secondary = useMemo(
    () => ({
      onClick: onReset,
      text: t('common__new:retry'),
      disabled: !contacted,
    }),
    [contacted, onReset, t],
  );

  return (
    <Container maxWidth="md">
      <Subtitle>
        {subtitle}
      </Subtitle>
      <BoxMessage text={t('citizen__new:contact.providers.mailReminder')} my={2} type="info" classes={{ root: classes.subtitleRoot }} />
      <ListMailProviders
        mailtoProps={mailtoProps}
        disabled={contacted}
        allowManual
        onChange={onChange}
      />
      <BoxControls
        mt={2}
        primary={primary}
        secondary={secondary}
      />
    </Container>
  );
};

ContactProvidersBlock.propTypes = {
  doneTo: PropTypes.string.isRequired,
  onDone: PropTypes.func,
  mailtoProps: PropTypes.arrayOf(PropTypes.shape({
    mailto: PropTypes.string.isRequired,
    applicationName: PropTypes.string.isRequired,
    subject: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
  })).isRequired,
  t: PropTypes.func.isRequired,
  // CONNECT
  dispatchUpdateMailProvider: PropTypes.func.isRequired,
};

ContactProvidersBlock.defaultProps = {
  onDone: null,
};

// CONNECT
const mapDispatchToProps = (dispatch) => ({
  dispatchUpdateMailProvider: (mailProvider) => {
    dispatch(mailProviderPreferencyUpdate(mailProvider));
  },
});

export default connect(null, mapDispatchToProps)(withTranslation(['common__new', 'citizen__new'])(ContactProvidersBlock));
