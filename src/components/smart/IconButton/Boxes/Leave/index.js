import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';

import BoxesSchema from 'store/schemas/Boxes';

import { useTranslation } from 'react-i18next';
import { useDialogBoxesLeaveContext } from 'components/smart/Dialog/Boxes/Leave/Context';

import ButtonShortcut from '@misakey/ui/Button/Shortcut';

import NoMeetingRoomIcon from '@material-ui/icons/NoMeetingRoom';

// COMPONENTS
const IconButtonBoxesLeave = forwardRef(({ box, ...rest }, ref) => {
  const { t } = useTranslation('boxes');

  const label = useMemo(
    () => t('boxes:read.details.menu.leave.primary'),
    [t],
  );

  const { onOpen } = useDialogBoxesLeaveContext();

  return (
    <ButtonShortcut
      ref={ref}
      onClick={onOpen}
      label={label}
      {...rest}
    >
      <NoMeetingRoomIcon color="action" />
    </ButtonShortcut>
  );
});

IconButtonBoxesLeave.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
};

export default IconButtonBoxesLeave;
