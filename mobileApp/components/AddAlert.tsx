
import React, { useState } from 'react'
import { StyleSheet, Text, View, SafeAreaView, TextInput, Button } from 'react-native'

const AddAlert = () => {
    const [inputValue, setInputValue] = useState('')

    const handleInputChange = (text: string) => {
        setInputValue(text)
    }

    const handleSubmit = () => {
        // Handle form submission here
        console.log('Form submitted:', inputValue)
    }

    return (
        <SafeAreaView style={styles.container}>
            <Text>AddAlert</Text>
            <View style={styles.formContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter something"
                    value={inputValue}
                    onChangeText={handleInputChange}
                />
                <Button title="Submit" onPress={handleSubmit} />
            </View>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container:{
        display: 'flex',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',

    },
    formContainer: {
        margin: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        width: '100%',
    },
})

export default AddAlert

