import moment from 'moment';

export default (dateString, format = 'LLL') => moment(dateString).format(format);
