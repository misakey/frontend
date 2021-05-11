import React, { useMemo, forwardRef } from 'react';

import PropTypes from 'prop-types';

import isSelfOrg from 'helpers/isSelfOrg';

import Chip from '@misakey/ui/Chip';
import { useTranslation } from 'react-i18next';
import AvatarUser from '@misakey/ui/Avatar/User';
import AvatarColorized from '@misakey/ui/Avatar/Colorized';

// COMPONENTS
const ChipOrganizationRole = forwardRef(({
  id, name, logoUrl, currentIdentityRole,
  identifier, displayName, avatarUrl,
  ...props
}, ref) => {
  const { t } = useTranslation('boxes');

  const isOrgSelfOrg = useMemo(
    () => isSelfOrg(id),
    [id],
  );

  const label = useMemo(
    () => (isOrgSelfOrg
      ? t('boxes:create.dialog.organization.self', { displayName })
      : t('boxes:create.dialog.organization.other', { currentIdentityRole, name })),
    [currentIdentityRole, displayName, isOrgSelfOrg, name, t],
  );

  return (
    <Chip
      ref={ref}
      component="div"
      avatar={isOrgSelfOrg
        ? (
          <AvatarUser
            displayName={displayName}
            avatarUrl={avatarUrl}
          />
        )
        : <AvatarColorized text={name} image={logoUrl} />}
      label={label}
      variant="outlined"
      {...props}
    />
  );
});

ChipOrganizationRole.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  logoUrl: PropTypes.string,
  currentIdentityRole: PropTypes.string,
  identifier: PropTypes.string,
  displayName: PropTypes.string,
  avatarUrl: PropTypes.string,
};

ChipOrganizationRole.defaultProps = {
  id: '',
  name: '',
  logoUrl: '',
  currentIdentityRole: null,
  identifier: '',
  displayName: '',
  avatarUrl: '',
};

export default ChipOrganizationRole;
