import { useCallback, useEffect, useState } from 'react';
import api, { errMsg } from '../services/api';

export default function useFetch(url, params) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const key = JSON.stringify(params || {});

  const load = useCallback(() => {
    if (!url) return;
    setLoading(true);
    setError('');
    api.get(url, { params: JSON.parse(key) })
      .then((r) => setData(r.data))
      .catch((e) => setError(errMsg(e)))
      .finally(() => setLoading(false));
  }, [url, key]);

  useEffect(() => { load(); }, [load]);
  return { data, loading, error, reload: load, setData };
}
