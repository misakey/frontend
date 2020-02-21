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

import 'components/screens/Account/Avatar/Display/index.scss';

// COMPONENTS
const AccountAvatarDisplay = ({
  t,
  displayName,
  avatarUri,
  name,
  previewName,
  history,
  state,
  ...rest
}) => (
  <ScreenAction
    className="Display"
    title={t('screens:account.avatar.title')}
    state={state}
    pushPath={routes.account._}
    hideAppBar
  >
    <Container maxWidth="md" className="content">
      <Subtitle>
        {t('screens:account.avatar.subtitle')}
      </Subtitle>
      <Card
        primary={{
          type: 'submit',
          'aria-label': t('common:submit'),
          text: t('common:submit'),
        }}
        secondary={{
          to: routes.account.profile.avatar.upload,
          component: Link,
          'aria-label': t('common:edit'),
          text: t('common:edit'),
        }}
      >
        <FormImage
          previewName={previewName}
          name={name}
          text={displayName}
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
};

AccountAvatarDisplay.defaultProps = {
  displayName: '',
  avatarUri: '',
  state: {},
};

export default withTranslation(['common', 'screens'])(AccountAvatarDisplay);
