import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { updateGlobals } from '@misakey/store/actions/global';

import Alert from '@misakey/ui/Alert';

function DisclaimerBeta({ dispatch, isBetaDisclaimerApproved, t }) {
  return (
    <Alert
      open={!isBetaDisclaimerApproved}
      onClose={() => dispatch(updateGlobals({ isBetaDisclaimerApproved: false }))}
      onOk={() => dispatch(updateGlobals({ isBetaDisclaimerApproved: true }))}
      title={t('disclaimer.beta.title')}
      text={t(`disclaimer.beta.${isBetaDisclaimerApproved === false ? 'refused' : 'text'}`)}
    />
  );
}

DisclaimerBeta.propTypes = {
  dispatch: PropTypes.func.isRequired,
  isBetaDisclaimerApproved: PropTypes.bool,
  t: PropTypes.func.isRequired,
};

DisclaimerBeta.defaultProps = {
  isBetaDisclaimerApproved: null,
};

export default connect(
  (state) => ({ isBetaDisclaimerApproved: state.global.isBetaDisclaimerApproved }),
)(withTranslation()(DisclaimerBeta));
