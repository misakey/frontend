import { useMemo } from 'react';
import parseJwt from '@misakey/helpers/parseJwt';

export default (id) => useMemo(() => (id ? parseJwt(id) : {}), [id]);
