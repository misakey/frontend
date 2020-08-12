import React, { useMemo, useCallback } from 'react';
import { normalize } from 'normalizr';
import { useSelector, useDispatch } from 'react-redux';
import { selectors as authSelectors } from '@misakey/auth/store/reducers/auth';

import useFetchEffect from '@misakey/hooks/useFetch/effect';

import isNil from '@misakey/helpers/isNil';
import identity from '@misakey/helpers/identity';

import { mergeReceiveNoEmpty } from '@misakey/store/reducers/helpers/processStrategies';
import SavedFilesByIdentitySchema from 'store/schemas/Files/Saved/ByIdentity';
import { receiveEntities } from '@misakey/store/actions/entities';
import { getSavedFiles as getSavedFilesBuilder } from '@misakey/helpers/builder/vault';
import { makeGetSavedFilesByIdentitySelector } from 'store/reducers/savedFiles';
import SavedFilesSchema from 'store/schemas/Files/Saved';

// CONSTANTS
const { isAuthenticated: IS_AUTHENTICATED_SELECTOR } = authSelectors;

// COMPONENTS
const withSavedFiles = (mapper = identity) => (Component) => {
  const Wrapper = (props) => {
    const getSavedFilesByIdentitySelector = useMemo(
      () => makeGetSavedFilesByIdentitySelector(), [],
    );
    const identityId = useSelector(authSelectors.identityId);
    const savedFiles = useSelector((state) => getSavedFilesByIdentitySelector(state, identityId));
    const isAuthenticated = useSelector(IS_AUTHENTICATED_SELECTOR);

    const dispatch = useDispatch();

    const isAllowedToFetch = useMemo(
      () => isAuthenticated && !isNil(identityId),
      [identityId, isAuthenticated],
    );

    const shouldFetch = useMemo(
      () => isAllowedToFetch && isNil(savedFiles),
      [isAllowedToFetch, savedFiles],
    );

    const getSavedFiles = useCallback(
      () => getSavedFilesBuilder({ identityId }),
      [identityId],
    );

    const onSuccess = useCallback((data) => {
      const { entities: savedFilesEntities, result } = normalize(data, SavedFilesSchema.collection);
      const { entities: savedFilesByIdentityEntities } = normalize(
        { identityId, savedFiles: result },
        SavedFilesByIdentitySchema.entity,
      );
      return Promise.resolve([
        dispatch(receiveEntities(savedFilesEntities, mergeReceiveNoEmpty)),
        dispatch(receiveEntities(savedFilesByIdentityEntities, mergeReceiveNoEmpty)),
      ]);
    }, [dispatch, identityId]);

    const { isFetching } = useFetchEffect(
      getSavedFiles,
      { shouldFetch },
      { onSuccess },
    );

    const mappedProps = useMemo(
      () => (mapper({
        savedFiles: savedFiles || [],
        isFetching,
        ...props,
      })),
      [isFetching, props, savedFiles],
    );

    return <Component {...mappedProps} />;
  };

  return Wrapper;
};

export default withSavedFiles;
