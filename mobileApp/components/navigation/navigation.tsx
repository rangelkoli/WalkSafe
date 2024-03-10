import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import Test from '../Test';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import Maps from '../Maps';
import { Session } from '@supabase/supabase-js';
import Account from '../Account';
import AddAlert from '../AddAlert';
import Family from '../Family';
import { Image, View, Platform } from 'react-native';



const Tab = createMaterialBottomTabNavigator();

export default function BottomNavigation(
    { session }: { session: Session }
) {
  return (
    <NavigationContainer
    >
        <Tab.Navigator 
        initialRouteName='Home' 
        activeColor="black" 
        inactiveColor="gray" 
        style={{
            margin: 0,
            padding: 0,
            borderRadius: 0,
            backgroundColor: 'white',
        }}
        screenOptions={{
            tabBarColor: 'blue',
        }}
        barStyle={{
            backgroundColor: 'white',
            padding: 0,
            margin: 0,  
            borderRadius: 0,
        }}
        >
        <Tab.Screen 
            name="Home" 
            component={Maps} 
            options={{
                tabBarLabel: 'Home',
                tabBarColor: 'red',
                tabBarIcon: ({ color }) => {
                    return (
                        <View
                            style={{ 
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Image
                                source={require('./home.png')}
                                style={{ width: 30, height: 30}}
                            />
                        </View>
                    )
                }  
            }} 
            />
        <Tab.Screen
            name="Family"
            component={Family}
            options={{
                tabBarLabel: 'Family',
                tabBarIcon: ({ color }) => {
                    return (
                        <View
                            style={{ 
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Image
                                source={require('./family.png')}
                                style={{ width: 30, height: 30}}
                            />
                        </View>
                    )
                }  
            }}

        />
                <Tab.Screen
            name="Alerts"
            component={AddAlert}
            options={{
                tabBarLabel: 'Alerts',
                // tabBarIcon: ({ color }) => {
                //     return (
                //         <View
                //             style={{ 
                //                 width: 30, 
                //                 height: 30,
                //                 top: Platform.OS === 'ios' ? -30 : -20,
                //                 minWidth: Platform.OS === 'ios' ? 50 : 60,
                //                 minHeight: Platform.OS === 'ios' ? 50 : 60,
                //                 borderRadius: 50,
                //                 backgroundColor: color,
                //                 justifyContent: 'center',
                //                 alignItems: 'center',
                //                 shadowColor: 'black',
                //                 }}
                //         >
                //             <Image
                //                 source={require('./home.svg')}
                //                 style={{ width: 20, height: 20, zIndex: 10}}
                //                 width={20}
                //                 height={20}
                //             />
                //         </View>
                //     )
                // }  
                tabBarIcon: ({ color }) => {
                    return (
                        <View
                            style={{ 
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Image
                                source={require('./alerts.png')}
                                style={{ 
                                    width: 30, 
                                    height: 30,

                                }}
                            />
                        </View>
                    )
                }  

            }}
        />
                <Tab.Screen
            name="Test"
            component={Test}
            options={{
                tabBarLabel: 'Family',
                tabBarIcon: ({ color }) => {
                    return (
                        <View
                            style={{ 
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Image
                                source={require('./home.png')}
                                style={{ width: 30, height: 30}}
                            />
                        </View>
                    )
                }  
            }}
        />
        <Tab.Screen
            name="Account"
            children={()=><Account session={session} />}
            options={{
                tabBarLabel: 'Account',
                tabBarBadge: 3,
                tabBarColor: 'red',
                tabBarIcon: ({ color }) => {
                    return (
                        <View
                            style={{ 
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            <Image
                                source={require('./profile.png')}
                                style={{ width: 30, height: 30}}
                            />
                        </View>
                    )
                }  
            }}
        />

        </Tab.Navigator>

    </NavigationContainer>
  );
}