
import React, { useState } from 'react';
import { TextInput, View, StyleSheet, SafeAreaView } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const SearchBar = () => {
  const [searchText, setSearchText] = useState('');

  const handleSearch = (text: string) => {
    setSearchText(text);
    // Perform search logic here
  };

  return (
    <SafeAreaView style={styles.container}>
        <TextInput
            style={styles.input}
            value={searchText}
            onChangeText={handleSearch}
            placeholder="Search"
        />
        <GooglePlacesAutocomplete
            placeholder="Search"
            onPress={(data, details = null) => {
            // 'details' is provided when fetchDetails = true
            console.log(data, details);
            }}
            query={{
            key: 'YOUR_GOOGLE_MAPS_API_KEY',
            language: 'en',
            }}
        />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 20,

    width: '90%',
    top: 20,
    zIndex: 10,
    position: 'absolute',  
    backgroundColor: 'white',
    borderRadius: 10,

  },
  input: {
    height: 50,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 10,

  },
});

export default SearchBar;
