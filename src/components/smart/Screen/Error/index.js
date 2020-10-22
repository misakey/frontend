import PropTypes from 'prop-types';

import { FEEDBACK } from 'constants/emails';
import routes from 'routes';

import ComponentProxy from '@misakey/ui/Component/Proxy';
import ScreenError from '@misakey/ui/Screen/Error';

// COMPONENTS
const ScreenErrorFeedbackGoBack = ComponentProxy(ScreenError);

ScreenErrorFeedbackGoBack.propTypes = {
  feedback: PropTypes.string,
  goBack: PropTypes.string,
};

ScreenErrorFeedbackGoBack.defaultProps = {
  feedback: FEEDBACK,
  goBack: routes._,
};

export default ScreenErrorFeedbackGoBack;
