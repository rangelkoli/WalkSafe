
import { memo } from 'react';
import React, { useState } from 'react';
import { TextInput, View, StyleSheet, SafeAreaView } from 'react-native';
import { Button } from 'react-native-elements';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import googleAPIKEY from './lib/googleAPIKEY';
import Geocoder from 'react-native-geocoding';

Geocoder.init(googleAPIKEY); // use a valid API key

const SearchBar = (props: any) => {
  const [searchText, setSearchText] = useState('');
  const [location, setLocation] = useState({});

  const handleSearch = (text: string) => {
    setSearchText(text);
    Geocoder.from(text)
		.then(json => {
            setLocation(json.results[0].geometry.location);
			console.log(location);
		})
		.catch(error => console.warn(error));

    props.onSearch(text);

    // Perform search logic here
    console.log('Search for:', text);
  };

  return (
    <SafeAreaView style={styles.container}>

        <GooglePlacesAutocomplete
            placeholder="Search for your route..."
            onPress={(data, details = null) => {
            // 'details' is provided when fetchDetails = true
            console.log(data, details);
            handleSearch(data.description);
            }}
            query={{
            key: googleAPIKEY,
            language: 'en',
            components: 'country:us',
            
            }}
            styles={{
            textInput: {
              backgroundColor: '#FFFFFF',
              height: 44,
              borderRadius: 5,
              paddingVertical: 5,
              paddingHorizontal: 10,
              fontSize: 15,
              flex: 1,
              borderColor: 'gray',
              borderWidth: 1,
              shadowColor: '#000',
              shadowOffset: {
                width: 0,
                height: 2,
              },
              shadowOpacity: 0.5,
            },
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
