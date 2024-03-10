import { StyleSheet, Text, View, SafeAreaView, Image } from 'react-native'
import React from 'react'

const Family = () => {
  return (
    <SafeAreaView>
      <Text>Family</Text>
        <Image
            style={{ width: 50, height: 50, backgroundColor: 'red'}}
            source={require('./home.svg')}
            width={20}
            height={20}

        />
    </SafeAreaView>
  )
}

export default Family

const styles = StyleSheet.create({})