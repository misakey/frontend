import React, { useMemo, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import { makeDenormalizeSavedFileSelector } from 'store/reducers/files/saved';
import { makeDenormalizeFileSelector } from 'store/reducers/files/saved/decrypted';
import { selectors as cryptoSelectors } from '@misakey/crypto/store/reducers';
import { getSavedFileEncryptedFileId } from 'helpers/boxEvent';

import prop from '@misakey/core/helpers/prop';
import isNil from '@misakey/core/helpers/isNil';

import usePaginateSavedFiles from 'hooks/usePaginateSavedFiles';

import { useSelector } from 'react-redux';
import useDecryptSavedFileCallback from 'hooks/useDecryptSavedFile/callback';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import CarouselFilePreview from 'components/smart/Carousel/FilePreview';

// HELPERS
const byPaginationProp = prop('byPagination');

// COMPONENTS
const CarouselFilePreviewSavedFiles = ({ onChange, selectedId, ...props }) => {
  const [nextId, setNextId] = useState(null);

  const pagination = usePaginateSavedFiles();
  const byPagination = useMemo(
    () => byPaginationProp(pagination),
    [pagination],
  );

  // SELECTORS
  const getSavedFileSelector = useMemo(
    () => makeDenormalizeSavedFileSelector(),
    [],
  );

  const decryptedFileSelector = useMemo(
    () => makeDenormalizeFileSelector(),
    [],
  );

  const vaultKey = useSelector(cryptoSelectors.getVaultKey);

  const nextEncrypted = useSelector((state) => (isNil(nextId)
    ? null
    : getSavedFileSelector(state, nextId)));

  const file = useSelector((state) => decryptedFileSelector(state, selectedId));

  const {
    name, encryption,
  } = useSafeDestr(file);

  const nextSelectedId = useMemo(
    () => (isNil(nextEncrypted)
      ? null
      : getSavedFileEncryptedFileId(nextEncrypted)),
    [nextEncrypted],
  );

  const shouldDecrypt = useMemo(
    () => (!isNil(file) && !isNil(nextEncrypted) && (isNil(encryption) || isNil(name))),
    [encryption, name, file, nextEncrypted],
  );

  const handleChange = useCallback(
    (nextIndex) => setNextId(byPagination[nextIndex]),
    [setNextId, byPagination],
  );

  const decrypt = useDecryptSavedFileCallback(vaultKey);

  useEffect(
    () => {
      if (shouldDecrypt) {
        decrypt(nextEncrypted);
      }
    },
    [shouldDecrypt, nextEncrypted, decrypt, name],
  );

  useEffect(
    () => {
      if (!isNil(nextSelectedId)) {
        onChange(nextSelectedId, { id: nextId });
        setNextId(null);
      }
    },
    [nextSelectedId, onChange, nextId, setNextId],
  );

  return (
    <CarouselFilePreview
      onChange={handleChange}
      selectedId={selectedId}
      file={file}
      {...pagination}
      {...props}
    />
  );
};

CarouselFilePreviewSavedFiles.propTypes = {
  onChange: PropTypes.func.isRequired,
  selectedId: PropTypes.string,
};

CarouselFilePreviewSavedFiles.defaultProps = {
  selectedId: null,
};

export default CarouselFilePreviewSavedFiles;
