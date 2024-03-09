import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import Test from '../Test';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Maps from '../Maps';
import { Session } from '@supabase/supabase-js';
import Account from '../Account';

const Tab = createMaterialBottomTabNavigator();

export default function BottomNavigation(
    { session }: { session: Session }
) {
  return (
    <NavigationContainer>
        <Tab.Navigator 
        initialRouteName='Home' 
        activeColor="black" 
        inactiveColor="gray" 
        style={{
            backgroundColor: 'blue',
            margin: 0,
        }}
        
        >
        <Tab.Screen 
            name="Home" 
            component={Maps} 
            options={{
                tabBarLabel: 'Home',
                tabBarColor: 'blue',

            }} 
            
            />
        <Tab.Screen
            name="Test"
            component={Test}
            options={{
                tabBarLabel: 'Test',
            }}
        />
        <Tab.Screen
            name="Account"
            children={()=><Account session={session} />}
            options={{
                tabBarLabel: 'Account',
            }}
        />

        </Tab.Navigator>

    </NavigationContainer>
  );
}