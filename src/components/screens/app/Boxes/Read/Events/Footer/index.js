import React, { useMemo } from 'react';

import isNil from '@misakey/helpers/isNil';

import { useBoxEditEventContext } from 'components/smart/Box/Event/Edit/Context';

import FooterCreating from 'components/screens/app/Boxes/Read/Events/Footer/Creating';
import FooterEditing from 'components/screens/app/Boxes/Read/Events/Footer/Editing';

const BoxEventsFooter = (props) => {
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

  return (
    <Footer
      event={event}
      {...rest}
      {...props}
    />
  );
};


export default BoxEventsFooter;
