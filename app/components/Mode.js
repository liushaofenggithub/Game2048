import React from 'react';
import {
  View,
  Text,
  TouchableOpacity
} from 'react-native';

import { createStyles } from '../theme/index';

const Mode = (props) => (
  <View style={styles.mode}>
    <View style={styles.title}>
      <Text style={styles.titleText}>
        2048
      </Text>
    </View>
    <View>
      <TouchableOpacity
        onPress={() => {props.setMode(0)}}
        style={[styles.btn, styles.classicBtn]}
      >
        <Text style={styles.text}>
          经典模式
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {props.setMode(1)}}
        style={[styles.btn, styles.militaryBtn]}
      >
        <Text style={styles.text}>
          军旅模式
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {props.setMode(2)}}
        style={[styles.btn, styles.progressionBtn]}
      >
        <Text style={styles.text}>
          升学模式
        </Text>
      </TouchableOpacity>
    </View>
  </View>
)

const styles = createStyles({
  mode: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FBF7EF'
  },
  title: {
    height: 200,
    justifyContent: 'center'
  },
  titleText: {
    fontSize: 96,
    color: '#776C62',
    fontWeight: 'bold'
  },
  btn: {
    width: 250,
    height: 80,
    borderRadius: 8,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  classicBtn: {
    backgroundColor: '#EEC34F'
  },
  militaryBtn: {
    backgroundColor: '#02BBF1'
  },
  progressionBtn: {
    backgroundColor: '#F57D63'
  },
  text: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF'
  }
})

export default Mode

