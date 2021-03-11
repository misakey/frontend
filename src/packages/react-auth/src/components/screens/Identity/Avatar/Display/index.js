import React, { useMemo } from 'react';

import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import useGeneratePathKeepingSearchAndHash from '@misakey/hooks/useGeneratePathKeepingSearchAndHash';

import routes from 'routes';

import omit from '@misakey/helpers/omit';

import Card from '@misakey/ui/Card';
import ScreenAction from '@misakey/ui/Screen/Action';
import Subtitle from '@misakey/ui/Typography/Subtitle';
import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import FormImage from './image';

// COMPONENTS
const AccountAvatarDisplay = ({
  t,
  displayName,
  avatarUrl,
  name,
  previewName,
  isLoading,
  dirty,
  ...rest
}) => {
  const { id } = useParams();

  // @FIXME until we change structure, parent is public profile
  const homePath = useGeneratePathKeepingSearchAndHash(routes.identities.public, { id });

  const navigationProps = useMemo(
    () => ({
      homePath,
    }),
    [homePath],
  );

  const secondaryTo = useGeneratePathKeepingSearchAndHash(routes.identities.avatar.upload, { id });

  return (
    <ScreenAction
      title={t('account:avatar.title')}
      navigationProps={navigationProps}
      isLoading={isLoading}
    >
      <Container maxWidth="md" className="content">
        <Box display="flex" flexDirection="column" flexGrow={1}>
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
              to: secondaryTo,
              component: Link,
              'aria-label': t('account:avatar.upload.title'),
              text: t('account:avatar.upload.title'),
            }}
            formik
          >
            <FormImage
              previewName={previewName}
              name={name}
              text={displayName}
              to={secondaryTo}
              {...omit(rest, ['i18n', 'tReady'])}
            />
          </Card>
        </Box>
      </Container>
    </ScreenAction>
  );
};

AccountAvatarDisplay.propTypes = {
  t: PropTypes.func.isRequired,
  displayName: PropTypes.string,
  avatarUrl: PropTypes.string,
  name: PropTypes.string.isRequired,
  previewName: PropTypes.string.isRequired,
  isLoading: PropTypes.bool,
  // formik
  dirty: PropTypes.bool.isRequired,
};

AccountAvatarDisplay.defaultProps = {
  displayName: '',
  avatarUrl: '',
  isLoading: false,
};

export default withTranslation(['common', 'account'])(AccountAvatarDisplay);
