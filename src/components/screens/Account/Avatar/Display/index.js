import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import Container from '@material-ui/core/Container';

import omit from '@misakey/helpers/omit';

import Card from 'components/dumb/Card';
import ScreenAction from 'components/dumb/Screen/Action';
import Subtitle from 'components/dumb/Typography/Subtitle';

import routes from 'routes';

import FormImage from './image';

// CONSTANTS
const NAVIGATION_PROPS = {
  homePath: routes.account._,
};

// COMPONENTS
const AccountAvatarDisplay = ({
  t,
  displayName,
  avatarUri,
  name,
  previewName,
  history,
  state,
  dirty,
  ...rest
}) => (
  <ScreenAction
    title={t('account:avatar.title')}
    state={state}
    appBarProps={{ withSearchBar: false }}
    navigationProps={NAVIGATION_PROPS}
  >
    <Container maxWidth="md" className="content">
      <Subtitle>
        {t('account:avatar.subtitle')}
      </Subtitle>
      <Card
        primary={dirty ? {
          type: 'submit',
          'aria-label': t('common:submit'),
          text: t('common:submit'),
        } : undefined}
        secondary={{
          to: routes.account.profile.avatar.upload,
          component: Link,
          'aria-label': t('common:edit'),
          text: t('common:edit'),
        }}
        formik
      >
        <FormImage
          previewName={previewName}
          name={name}
          text={displayName}
          dirty={dirty}
          {...omit(rest, ['i18n', 'tReady'])}
        />
      </Card>
    </Container>
  </ScreenAction>
);

AccountAvatarDisplay.propTypes = {
  t: PropTypes.func.isRequired,
  displayName: PropTypes.string,
  avatarUri: PropTypes.string,
  name: PropTypes.string.isRequired,
  previewName: PropTypes.string.isRequired,
  state: PropTypes.object,
  history: PropTypes.object.isRequired,
  // formik
  dirty: PropTypes.bool.isRequired,
};

AccountAvatarDisplay.defaultProps = {
  displayName: '',
  avatarUri: '',
  state: {},
};

export default withTranslation(['common', 'account'])(AccountAvatarDisplay);
