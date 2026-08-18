const PREFIX = '__keychain__';

const memoryStore = new Map();

function getStorage() {
  if (typeof sessionStorage !== 'undefined') {
    return {
      getItem: key => sessionStorage.getItem(key),
      setItem: (key, val) => sessionStorage.setItem(key, val),
      removeItem: key => sessionStorage.removeItem(key),
    };
  }
  return {
    getItem: key => memoryStore.get(key) || null,
    setItem: (key, val) => memoryStore.set(key, val),
    removeItem: key => memoryStore.delete(key),
  };
}

export const setGenericPassword = async (username, password, options) => {
  const key = PREFIX + (options?.service || 'default');
  getStorage().setItem(key, JSON.stringify({ username, password }));
  return true;
};

export const getGenericPassword = async (options) => {
  const key = PREFIX + (options?.service || 'default');
  const raw = getStorage().getItem(key);
  if (!raw) return false;
  return JSON.parse(raw);
};

export const resetGenericPassword = async (options) => {
  const key = PREFIX + (options?.service || 'default');
  getStorage().removeItem(key);
  return true;
};

export const setInternetCredentials = async (server, username, password) => {
  getStorage().setItem(PREFIX + server, JSON.stringify({ username, password }));
  return true;
};

export const getInternetCredentials = async (server) => {
  const raw = getStorage().getItem(PREFIX + server);
  if (!raw) return false;
  return JSON.parse(raw);
};

export const resetInternetCredentials = async (server) => {
  getStorage().removeItem(PREFIX + server);
  return true;
};

export const getSupportedBiometryType = async () => null;
export const canImplyAuthentication = async () => false;
export const ACCESS_CONTROL = {};
export const ACCESSIBLE = {};
export const AUTHENTICATION_TYPE = {};
export const BIOMETRY_TYPE = {};
export const SECURITY_LEVEL = {};
export const STORAGE_TYPE = {};

export default {
  setGenericPassword,
  getGenericPassword,
  resetGenericPassword,
  setInternetCredentials,
  getInternetCredentials,
  resetInternetCredentials,
  getSupportedBiometryType,
  canImplyAuthentication,
  ACCESS_CONTROL,
  ACCESSIBLE,
  AUTHENTICATION_TYPE,
  BIOMETRY_TYPE,
  SECURITY_LEVEL,
  STORAGE_TYPE,
};
