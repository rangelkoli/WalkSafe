import { StyleSheet, Text, View, SafeAreaView, Dimensions } from 'react-native'
import React from 'react'
import Maps from './Maps'
import MapView from 'react-native-maps'
import { supabase } from './lib/supabase'

const Test = () => {
    const { width, height } = Dimensions.get('window');

  return (
    <SafeAreaView style={styles.container}>
        <Text>Test</Text>
    </SafeAreaView>
  )
}

export default Test

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
})