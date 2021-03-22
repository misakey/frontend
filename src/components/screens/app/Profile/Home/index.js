import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';

import AppBarStatic from '@misakey/ui/AppBar/Static';
import CardIdentity from '@misakey/react-auth/components/Card/Identity';
import AvatarCurrentUser from 'components/smart/Avatar/CurrentUser';
import BoxFlexFill from '@misakey/ui/Box/FlexFill';
import ButtonDrawerDefault from 'components/smart/IconButton/Drawer/Default';
import ButtonDrawerLink from 'components/smart/IconButton/Drawer/Link';

import ArrowBack from '@material-ui/icons/ArrowBack';
import { useParams } from 'react-router-dom';
import routes from 'routes';
import useUpdateDocHead from '@misakey/hooks/useUpdateDocHead';

const ProfileHome = ({ identityMetadata }) => {
  const { id } = useParams();
  const { t } = useTranslation(['account', 'common']);

  useUpdateDocHead(t('account:documentTitle'));

  return (
    <>
      <AppBarStatic>
        <ButtonDrawerLink
          aria-label={t('common:goBack')}
          to={routes.boxes._}
        >
          <ArrowBack />
        </ButtonDrawerLink>
        <BoxFlexFill />
        <ButtonDrawerDefault
          aria-label={t('common:openAccount')}
        >
          <AvatarCurrentUser />
        </ButtonDrawerDefault>
      </AppBarStatic>
      {id && (
        <CardIdentity {...identityMetadata} />
      )}
    </>
  );
};

ProfileHome.propTypes = {
  identityMetadata: PropTypes.object.isRequired,
};

export default ProfileHome;
