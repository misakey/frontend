import numbro from 'numbro';
import { FILE_SIZE_FORMAT } from 'constants/formats/numbers';

export default (size) => {
  try {
    // @FIXME: .format sometimes crashes for no evident reasons
    // https://gitlab.misakey.dev/misakey/frontend/-/issues/654
    return numbro(size).format(FILE_SIZE_FORMAT);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err, size);
    return null;
  }
};
