import React, { createContext, useContext, useMemo } from 'react';

import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import { selectors as cryptoSelectors } from '@misakey/crypto/store/reducers';
import { getCurrentUserSelector } from '@misakey/react-auth/store/reducers/auth';
import BoxSchema from 'store/schemas/Boxes';
import { sendersIdentifiersMatch } from 'helpers/sender';

const {
  getAsymSecretKey,
} = cryptoSelectors;

// CONTEXT
export const BoxReadContext = createContext({
  secretKey: null,
  id: null,
});

// HOOKS
export const useBoxReadContext = () => useContext(BoxReadContext);

// COMPONENTS
const BoxReadContextProvider = ({ children, box }) => {
  const { publicKey, id, creator } = useMemo(() => box, [box]);

  const secretKey = useSelector(getAsymSecretKey(publicKey));

  const currentUser = useSelector(getCurrentUserSelector);

  const isCurrentUserOwner = useMemo(
    () => sendersIdentifiersMatch(creator, currentUser),
    [creator, currentUser],
  );

  const contextValue = useMemo(
    () => ({
      id,
      secretKey,
      isCurrentUserOwner,
    }),
    [id, isCurrentUserOwner, secretKey],
  );

  return (
    <BoxReadContext.Provider value={contextValue}>
      {children}
    </BoxReadContext.Provider>
  );
};

BoxReadContextProvider.propTypes = {
  box: PropTypes.shape(BoxSchema.propTypes).isRequired,
  children: PropTypes.node,
};

BoxReadContextProvider.defaultProps = {
  children: null,
};

export default BoxReadContextProvider;
