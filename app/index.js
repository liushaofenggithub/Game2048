import React, { Component } from 'react';
import {
  View,
  StatusBar,
  Platform,
  Linking,
  Alert
} from 'react-native';
import {
  isFirstTime,
  isRolledBack,
  checkUpdate,
  downloadUpdate,
  switchVersion,
  switchVersionLater,
  markSuccess
} from 'react-native-update';
import Main from './page';
import Mode from './components/Mode';
import _updateConfig from '../update.json';
import { createStyles } from './theme/index'

const { appKey } = _updateConfig[Platform.OS]

export default class Index extends Component {

  state = {
    modeShow: true,
    mode: -1 /* 0: 经典模式 1: 军旅模式 2: 升学模式 */
  }

  setMode = (mode) => {
    if (this.state.mode !== mode) {
      this.setState({
        mode: mode
      })
    }
    this.toggleModeShow(this.state.mode === mode)
  }

  toggleModeShow = () => {
    const newModeShow = !this.state.modeShow
    this.setState({
      modeShow: newModeShow
    })
  }

  doUpdate = info => {
    downloadUpdate(info).then(hash => {
      Alert.alert('提示', '下载完毕,是否重启应用?', [
        {text: '是', onPress: ()=>{switchVersion(hash);}},
        {text: '否',},
        {text: '下次启动时', onPress: ()=>{switchVersionLater(hash);}},
      ]);
    }).catch(err => {
      console.log('下载更新Error: ', err)
      Alert.alert('提示', '更新失败.');
    });
  }

  checkUpdate = () => {
    checkUpdate(appKey).then(info => {
      if (info.expired) {
        Alert.alert('提示', '您的应用版本已更新,请前往应用商店下载新的版本', [
          {text: '确定', onPress: ()=>{info.downloadUrl && Linking.openURL(info.downloadUrl)}},
        ]);
      } else if (info.upToDate) {
        console.log('已是最新版本')
      } else {
        Alert.alert('提示', '检查到新的版本'+info.name+',是否下载?\n'+ info.description, [
          {text: '是', onPress: ()=>{this.doUpdate(info)}},
          {text: '否',},
        ]);
      }
    }).catch(err => {
      console.log('更新Error: ', err)
      Alert.alert('提示', '更新失败.');
    });
  };

  componentWillMount() {
    if (isFirstTime) {
      markSuccess();
    } else if (isRolledBack) {
      Alert.alert('提示', '刚刚更新失败了,版本被回滚.');
    }
    this.checkUpdate()
  }

  render() {
    const { mode, modeShow } = this.state
    return (
      <View style={styles.container}>
        <StatusBar
          hidden={true}
        />
        <Main
          mode={mode}
          toggleModeShow={this.toggleModeShow}
        />
        <View
          style={modeShow ? styles.modeShow: {}}
        >
          <Mode
            mode={mode}
            setMode={this.setMode}
            toggleModeShow={this.toggleModeShow}
          />
        </View>
      </View>
    )
  }
}

const styles = createStyles({
  container: {
    flex: 1,
    position: 'relative'
  },
  modeShow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  }
})
