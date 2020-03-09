import MAIL_PROVIDERS from 'constants/mail-providers';
import MANUAL_TYPE from 'constants/mail-providers/manual';

export default [...Object.keys(MAIL_PROVIDERS), MANUAL_TYPE];
