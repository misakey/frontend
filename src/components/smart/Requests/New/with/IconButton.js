import withDialogConnect from 'components/smart/Dialog/Connect/with';
import withRequestCreation from 'components/smart/Requests/New/with';

import IconButton from '@material-ui/core/IconButton';

const IconButtonWithConnect = withDialogConnect(IconButton);
export default withRequestCreation(IconButtonWithConnect);
