import React, { useMemo, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

import { makeGetEventSelector } from 'store/reducers/box';
import { makeDenormalizeFileSelector } from 'store/reducers/files/saved/decrypted';
import { selectors as cryptoSelectors } from '@misakey/react/crypto/store/reducers';

import { getEventEncryptedFileId } from 'helpers/boxEvent';
import prop from '@misakey/core/helpers/prop';
import isNil from '@misakey/core/helpers/isNil';

import { useSelector } from 'react-redux';
import useDecryptMsgFileCallback from 'hooks/useDecryptMsgFile/callback';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import CarouselFilePreview from 'components/smart/Carousel/FilePreview';

// CONSTANTS
const {
  makeGetAsymSecretKey,
} = cryptoSelectors;

// HELPERS
const byPaginationProp = prop('byPagination');

// COMPONENTS
const CarouselFilePreviewEventFiles = ({ pagination, onChange, selectedId, id, ...props }) => {
  const [nextId, setNextId] = useState(null);

  const getAsymSecretKey = useMemo(
    () => makeGetAsymSecretKey(),
    [],
  );

  const byPagination = useMemo(
    () => byPaginationProp(pagination),
    [pagination],
  );

  // SELECTORS
  const getEventFileSelector = useMemo(
    () => makeGetEventSelector(),
    [],
  );

  const decryptedFileSelector = useMemo(
    () => makeDenormalizeFileSelector(),
    [],
  );

  const encrypted = useSelector((state) => (isNil(id)
    ? null
    : getEventFileSelector(state, id)));

  const { publicKey } = useSafeDestr(encrypted);

  const secretKey = useSelector((state) => getAsymSecretKey(state, publicKey));

  const nextEncrypted = useSelector((state) => (isNil(nextId)
    ? null
    : getEventFileSelector(state, nextId)));

  const file = useSelector((state) => decryptedFileSelector(state, selectedId));

  const {
    name, encryption,
  } = useSafeDestr(file);

  const nextSelectedId = useMemo(
    () => (isNil(nextEncrypted)
      ? null
      : getEventEncryptedFileId(nextEncrypted)),
    [nextEncrypted],
  );

  const shouldDecrypt = useMemo(
    () => (!isNil(file) && !isNil(encrypted) && (isNil(encryption) || isNil(name))),
    [encryption, name, file, encrypted],
  );

  const handleChange = useCallback(
    (nextIndex) => setNextId(byPagination[nextIndex]),
    [setNextId, byPagination],
  );

  const decrypt = useDecryptMsgFileCallback(secretKey);

  useEffect(
    () => {
      if (shouldDecrypt) {
        decrypt(encrypted);
      }
    },
    [shouldDecrypt, encrypted, decrypt, name],
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
      id={id}
      file={file}
      {...pagination}
      {...props}
    />
  );
};

CarouselFilePreviewEventFiles.propTypes = {
  pagination: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  selectedId: PropTypes.string,
  id: PropTypes.string,
};

CarouselFilePreviewEventFiles.defaultProps = {
  selectedId: null,
  id: null,
};

export default CarouselFilePreviewEventFiles;
