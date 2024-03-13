
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, SafeAreaView, TextInput } from 'react-native'
import { RadioButton } from 'react-native-paper';
import { Button } from 'react-native-paper';
import { ToggleButton } from 'react-native-paper';
import  { supabase } from './lib/supabase'
import { Session } from '@supabase/supabase-js';
import { getLatestValue } from './lib/currentLocation';

const AddAlert = ({session }: {session: Session}) => {
    const [inputValue, setInputValue] = useState('')
    const [value, setValue] = React.useState('first');
    const alertTypes = [
        {type: 'Larceny', icon: 'alert-circle'}, 
        {type: 'assault', icon: 'alert-circle'}, 
        {type: 'vandalism', icon: 'alert-circle'}, 
        {type: 'theft', icon: 'alert-circle'}, 
        {type: 'other', icon: 'alert-circle'}
    ]
    const [user, setUser] = useState({}) as any
    const [ currentLocation, setCurrentLocation ] = useState({latitude: 43.032201, longitude: -76.122812})

    useEffect(() => {
        const currLoc = getLatestValue()
        console.log('Current Location:', currLoc)
        setCurrentLocation(getLatestValue())
    })
    const handleInputChange = (text: string) => {
        setInputValue(text)
    }

    const handleSubmit = async () => {
        // Handle form submission here
        console.log('Form submitted:', value, new Date().toLocaleTimeString())

        const { error } = await supabase
            .from('alerts')
            .insert({   
                alert: value,
                latitude: currentLocation.latitude,
                longitude:  currentLocation.longitude,
                created_at: new Date().toISOString(),
                User: session.user?.id
             })
    }
    return (
        <SafeAreaView style={styles.container}>
            <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                marginBottom: 20,

            }}>AddAlert</Text>
            <View style={styles.formContainer}>
                <TextInput
                    style={styles.input}
                    placeholder={value}
                    value={value}
                    onChangeText={handleInputChange}

                />
            <View style={styles.radioContainer}>
            <ToggleButton.Group
                onValueChange={value => setValue(value)}
                value={value}
                children={alertTypes.map((type) => (
                    <ToggleButton 
                    icon={require('./alertDanger.png')}
                    value={type.type} 
                    key={type.type}
                    style={[
                        styles.radioItems, 
                        styles.larceny, 
                        {
                            backgroundColor: value === type.type ? 'red' : 'white',
                            
                        }
                    ]}

                    />
                ))}
            />
            </View>
            </View>
            <Button 
            icon="camera" 
            mode="contained-tonal" 
            onPress={handleSubmit}
            style={{
                borderColor: 'black',
                borderWidth: 2,
                backgroundColor: '#B57EDC',
                shadowColor: 'black',
                shadowOffset: { 
                    width: 0, 
                    height: 2 
                },
                shadowOpacity: 0.8,
                shadowRadius: 2,
                width: '80%',
            }}
            >
                Submit
            </Button>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container:{
        display: 'flex',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        width: '100%',
        backgroundColor: '#E6E6FA',
        height: '100%',
    },
    formContainer: {
        margin: 20,
        width: '100%',
        padding: 20,
        justifyContent:'space-between'
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        width: '100%',
    },
    radioContainer:{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start'
    },
    radioItems:{
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
        padding: 7,
        borderColor: 'black',
        borderWidth: 2,
        borderRadius: 5,
    },
    larceny:{
        backgroundColor: 'red',
        color: 'white',
        borderRadius: 5,
        shadowColor: 'black',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        alignItems: 'center',
        justifyContent: 'center',
    }

})

export default AddAlert


