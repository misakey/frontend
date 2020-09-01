import React, { useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';

import isNil from '@misakey/helpers/isNil';

import { useBoxEditEventContext } from 'components/smart/Box/Event/Edit/Context';

import FooterCreating from 'components/screens/app/Boxes/Read/Events/Footer/Creating';
import FooterEditing from 'components/screens/app/Boxes/Read/Events/Footer/Editing';

const BoxEventsFooter = ({ isMenuActionOpen, onClose, ...props }) => {
  const { event, ...rest } = useBoxEditEventContext();

  const isEditing = useMemo(
    () => !isNil(event),
    [event],
  );

  const Footer = useMemo(
    () => (isEditing
      ? FooterEditing
      : FooterCreating),
    [isEditing],
  );

  useEffect(
    () => {
      if (isMenuActionOpen && isEditing) {
        onClose();
      }
    },
    [isMenuActionOpen, isEditing, onClose],
  );

  return (
    <Footer
      event={event}
      {...rest}
      isMenuActionOpen={isMenuActionOpen}
      onClose={onClose}
      {...props}
    />
  );
};

BoxEventsFooter.propTypes = {
  isMenuActionOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default BoxEventsFooter;
