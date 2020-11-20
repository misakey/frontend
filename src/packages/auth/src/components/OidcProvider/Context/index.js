import React, { createContext, useContext, forwardRef } from 'react';

// CONTEXT
export const UserManagerContext = createContext({
  userManager: null,
  askSigninRedirect: null,
});

export const useUserManagerContext = () => useContext(UserManagerContext);

export const withUserManager = (Component) => forwardRef((props, ref) => (
  <UserManagerContext.Consumer>
    {(context) => <Component {...props} {...context} ref={ref} />}
  </UserManagerContext.Consumer>
));
