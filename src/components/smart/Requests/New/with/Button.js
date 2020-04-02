import withDialogConnect from 'components/smart/Dialog/Connect/with';
import withRequestCreation from 'components/smart/Requests/New/with';

import Button from '@misakey/ui/Button';

const ButtonWithConnect = withDialogConnect(Button);
export default withRequestCreation(ButtonWithConnect);
