import { AsyncStorage } from "react-native";

/**
 本地存储
 **/

const Storage = {
  get: async (key) => {
    return await AsyncStorage.getItem(key)
  },
  set: async (key, value) => {
    await AsyncStorage.setItem(key,value)
  },
  remove: async (key) => {
    await AsyncStorage.removeItem(key)
  }
}


export { Storage }
