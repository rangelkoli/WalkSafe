import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { Session } from '@supabase/supabase-js'
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { SafeAreaView } from 'react-native';
import Test from './Test';
import BottomNavigation from './navigation/navigation';

const HomePage = () => {


  return (
    <SafeAreaView style={{
      display: 'flex',
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Text>Home</Text>

      
    </SafeAreaView>
  )
}

export default HomePage

const styles = StyleSheet.create({

})