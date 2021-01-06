import PropTypes from 'prop-types';

import { makeGetEventSelector } from 'store/reducers/box';
import { makeDenormalizeFileSelector } from 'store/reducers/files/saved/decrypted';
import { getEventEncryptedFileId } from 'helpers/boxEvent';

import prop from '@misakey/helpers/prop';
import isNil from '@misakey/helpers/isNil';

import usePaginateFileEventsByBox from 'hooks/usePaginateEventsByBox/Files';
import { useMemo, useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useBoxReadContext } from 'components/smart/Context/Boxes/BoxRead';
import useDecryptMsgFileCallback from 'hooks/useDecryptMsgFile/callback';
import useSafeDestr from '@misakey/hooks/useSafeDestr';

import CarouselFilePreview from 'components/smart/Carousel/FilePreview';

// HELPERS
const byPaginationProp = prop('byPagination');

// COMPONENTS
const CarouselFilePreviewEventFiles = ({ onChange, selectedId, id, ...props }) => {
  const [nextId, setNextId] = useState(null);

  const { id: boxId, secretKey } = useBoxReadContext();

  const pagination = usePaginateFileEventsByBox(boxId);
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
  onChange: PropTypes.func.isRequired,
  selectedId: PropTypes.string,
  id: PropTypes.string,
};

CarouselFilePreviewEventFiles.defaultProps = {
  selectedId: null,
  id: null,
};

export default CarouselFilePreviewEventFiles;
