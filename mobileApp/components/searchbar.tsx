
import { memo } from 'react';
import React, { useState } from 'react';
import { TextInput, View, StyleSheet, SafeAreaView } from 'react-native';
import { Button } from 'react-native-elements';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import googleAPIKEY from './lib/googleAPIKEY';
const SearchBar = (props: any) => {
  const [searchText, setSearchText] = useState('');

  const handleSearch = (text: string) => {
    setSearchText(text);
    props.onSearch(text);

    // Perform search logic here
    console.log('Search for:', text);
  };

  return (
    <SafeAreaView style={styles.container}>

        <GooglePlacesAutocomplete
            placeholder="Search"
            onPress={(data, details = null) => {
            // 'details' is provided when fetchDetails = true
            console.log(data, details);
            handleSearch(data.description);
            }}
            query={{
            key: googleAPIKEY,
            language: 'en',
            }}
        />
        {/* <Button title="Search" onPress={() => handleSearch(searchText)}  style={styles.search}/> */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop: 20,
    flex: 1,
    flexDirection: 'row',
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
  search: {
    width: '100%',
    height: 40,
    borderRadius: 10,
    backgroundColor: 'blue',
    marginLeft: 10,
  }
});

export default memo(SearchBar);
