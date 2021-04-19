import React from 'react';
import PropTypes from 'prop-types';

import BoxesSchema from 'store/schemas/Boxes';
import IconButtonBoxesShare from 'components/smart/IconButton/Boxes/Share';
import IconButtonBoxesMute from 'components/smart/IconButton/Boxes/Mute';
import IconButtonBoxesLeave from 'components/smart/IconButton/Boxes/Leave';
import IconButtonBoxesDelete from 'components/smart/IconButton/Boxes/Delete';
import Box from '@material-ui/core/Box';

// COMPONENTS
const BoxListShortcuts = ({ box, canLeave, canDelete, ...rest }) => (
  <Box {...rest}>
    <IconButtonBoxesShare box={box} />
    <IconButtonBoxesMute box={box} />
    {canLeave && <IconButtonBoxesLeave box={box} />}
    {canDelete && <IconButtonBoxesDelete box={box} />}
  </Box>
);

BoxListShortcuts.propTypes = {
  box: PropTypes.shape(BoxesSchema.propTypes).isRequired,
  canLeave: PropTypes.bool.isRequired,
  canDelete: PropTypes.bool.isRequired,
};

export default BoxListShortcuts;
