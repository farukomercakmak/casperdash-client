import { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import isEmpty from 'lodash-es/isEmpty';
import isEqual from 'lodash-es/isEqual';
import { getConnectedAccountChromeLocalStorage } from '@cd/actions/userActions.utils';
import { getPublicKey, getLoginOptions } from '@cd/selectors/user';

const useWithAccount = () => {
	const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [cacheConnectedAccount, setCache] = useState(undefined);
  console.log(`🚀 ~ cacheConnectedAccount`, loading, cacheConnectedAccount)

	const storePublicKey = useSelector(getPublicKey);
  const storeLoginOptions = useSelector(getLoginOptions);
  console.log(`🚀 ~ reduxStore:: `, storePublicKey, storeLoginOptions)

  const loadCache = useCallback(async () => {
    const res = await getConnectedAccountChromeLocalStorage();
    console.log(`🚀 ~ CACHE:: `, res);
    setCache(res);
    setLoading(false);
  }, []);

  /** Called once when Component is mounted */
  useEffect(() => {
    setLoading(true);
    loadCache();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * When publicKey and loginOption from redux store changes
   * Update latest data (also reload from local store)
   */
  useEffect(() => {
    console.log(`🚀 ~ NEW:: `, storePublicKey, storeLoginOptions)
    setCache({
      publicKey: storePublicKey,
      loginOptions: storeLoginOptions
    });
    setLoading(true);
    loadCache();
  }, [storePublicKey, storeLoginOptions, loadCache])

  useEffect(() => {
    // Skip
    if (!cacheConnectedAccount || loading) {
      console.log("::: SKIP")
      return;
    }

    const { publicKey, loginOptions } = cacheConnectedAccount;
    // Redux store empty
    // Cache has User info
    // => navigate to `welcomeBack`
    // userHashingOptions
    if (!publicKey && !isEmpty(loginOptions) && loginOptions.userHashingOptions) {
      console.log("::: WELCOME BACK")
      navigate('/welcomeBack');
      return;
    }

    // Redux store empty
    // Cache empty
    // => navigate to `connectAccount`
    if (!publicKey && isEmpty(storeLoginOptions) && isEmpty(loginOptions)) {
      console.log("::: CONNECT ACC")
      navigate('/connectAccount');
      return;
    }
  }, [loading, navigate, cacheConnectedAccount, storeLoginOptions]);

  return cacheConnectedAccount;
};

export default useWithAccount;
