import DecryptedFileSchema from 'store/schemas/Files/Decrypted';

import { connect } from 'react-redux';
import { denormalize } from 'normalizr';
import isNil from '@misakey/core/helpers/isNil';

import FilePreviewDialog from 'components/smart/Dialog/FilePreview';

// CONNECT
const mapStateToProps = (state, { selectedId }) => ({
  file: isNil(selectedId)
    ? null
    : denormalize(selectedId, DecryptedFileSchema.entity, state.entities),
});

export default connect(mapStateToProps, {})(FilePreviewDialog);
