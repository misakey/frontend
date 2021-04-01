import React, { useMemo } from 'react';


import isNil from '@misakey/core/helpers/isNil';

import { useBoxEditEventContext } from 'components/smart/Box/Event/Edit/Context';
import { useBoxReadContext } from 'components/smart/Context/Boxes/BoxRead';

import FooterCreating from 'components/screens/app/Boxes/Read/Events/Footer/Creating';
import FooterEditing from 'components/screens/app/Boxes/Read/Events/Footer/Editing';

const BoxEventsFooter = (props) => {
  const { event, ...rest } = useBoxEditEventContext();
  const { secretKey } = useBoxReadContext();

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
      secretKey={secretKey}
      {...rest}
      {...props}
    />
  );
};


export default BoxEventsFooter;
