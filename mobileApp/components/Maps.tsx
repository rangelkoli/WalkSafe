import "react-native-url-polyfill/auto";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import Auth from "./Auth";
import Account from "./Account";
import { SafeAreaView, View, Text, Pressable } from "react-native";
import { Session } from "@supabase/supabase-js";
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
  Callout,
  Polyline,
  Heatmap,
} from "react-native-maps";
import SearchBar from "./searchbar";
import MapViewDirections from "react-native-maps-directions";
import googleAPIKEY from "./lib/googleAPIKEY";
import { Button } from "react-native-elements";
import Geocoder from "react-native-geocoding";
import LottieView from "lottie-react-native";
import alertBright from "./alertBrightest.json";
import { Image } from "react-native-elements";
import { setValue } from "./lib/currentLocation";
import axios from "axios";
import GetLocation from "react-native-get-location";
import * as Location from "expo-location";
import { decode, encode } from "@googlemaps/polyline-codec";
import * as TaskManager from "expo-task-manager";
import backendURL from "./lib/backendURL";
import { formatDistanceToNow } from "date-fns";

Geocoder.init(googleAPIKEY); // use a valid API key
const LOCATION_TASK_NAME = "background-location-task";

const mapCustomStyle = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b3" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3948" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

export default function Maps({ session }: { session: Session }) {
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [friendsData, setFriendsData] = useState<any>([]);
  const [polylineOverview, setPolylineOverview] = useState<any>("");
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  }>({
    latitude: 43.032201,
    longitude: -76.122812,
  });
  const [destination, setDestination] = useState("");
  const [destinationLatLng, setDestinationLatLng] = useState({
    lat: 0,
    lng: 0,
  });
  const [latlngDelta, setLatlngDelta] = useState({
    latitudeDelta: 0.095,
    longitudeDelta: 0.045,
  });
  const [markers, setMarkers] = useState<
    {
      latitude: number;
      longitude: number;
      alert: string;
      likes: number;
      created_at: string;
    }[]
  >([]); // Add state variable for markers
  const [familyMarkers, setFamilyMarkers] = useState<
    [
      {
        username: string;
        currentLocation: { latitude: number; longitude: number };
        avatar_url: string;
        family: [];
      }
    ]
  >([
    {
      username: "",
      currentLocation: { latitude: 0, longitude: 0 },
      avatar_url: "",
      family: [],
    },
  ]); // Add state variable for markers
  const [region, setRegion] = useState({
    latitude: 43.032201,
    longitude: -76.122812,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [mapView, setMapView] = useState<any>();
  const [polylineCoordinates, setPolylineCoordinates] = useState<any>([
    { latitude: 43.032201, longitude: -76.122812 },
    { latitude: 43.032201, longitude: -76.122812 },
  ]);
  const requestPermissions = async () => {
    const { status: foregroundStatus } =
      await Location.requestForegroundPermissionsAsync();
    if (foregroundStatus === "granted") {
      const { status: backgroundStatus } =
        await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus === "granted") {
        await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 1000,
          distanceInterval: 0,
          showsBackgroundLocationIndicator: true,
        });
      }
    }
  };

  const getMarkers = () => {
    supabase
      .from("alerts")
      .select("latitude, longitude, alert, likes, created_at")
      .then(({ data: alerts, error }) => {
        if (error) console.log("Error fetching alerts:", error);
        else {
          const newMarkers = alerts.map((alert: any) => ({
            latitude: alert.latitude,
            longitude: alert.longitude,
            alert: alert.alert,
            likes: alert.likes,
            created_at: alert.created_at,
          }));
          setMarkers(newMarkers);
        }
      });
  };
  const updateLocationDB = async () => {
    Geocoder.from(currentLocation)
      .then((json) => {
        var addressComponent = json.results[0].formatted_address;
      })
      .catch((error) => console.warn(error));
    const { data, error } = await supabase
      .from("profiles")
      .update({ currentLocation: currentLocation })
      .eq("id", session?.user?.id);

    if (error) console.log("Error updating location:", error);
  };
  function haversine_distance(
    mk1: { latitude: number; longitude: number },
    mk2: { latitude: number; longitude: number }
  ) {
    const R = 3958.8; // Radius of the Earth in miles
    const rlat1 = mk1.latitude * (Math.PI / 180); // Convert degrees to radians
    const rlat2 = mk2.latitude * (Math.PI / 180); // Convert degrees to radians
    const difflat = rlat2 - rlat1; // Radian difference (latitudes)
    const difflon = (mk2.longitude - mk1.longitude) * (Math.PI / 180); // Radian difference (longitudes)

    const d =
      2 *
      R *
      Math.asin(
        Math.sqrt(
          Math.sin(difflat / 2) * Math.sin(difflat / 2) +
            Math.cos(rlat1) *
              Math.cos(rlat2) *
              Math.sin(difflon / 2) *
              Math.sin(difflon / 2)
        )
      );
    return d;
  }
  const [locationRightNow, setLocationRightNow] = useState<{
    latitude: number;
    longitude: number;
  }>({ latitude: 0, longitude: 0 });
  const location = async () => {
    requestPermissions();
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      console.log("Permission to access location was denied");
      return;
    }
    try {
      let location = await Location.getCurrentPositionAsync({});
      console.log("Location:", location);
      const lat = location.coords.latitude;
      const lon = location.coords.longitude;
      const currLoc = { latitude: lat, longitude: lon };
      console.log("Current Location:", currLoc);
      console.log("LocationRightNow:", locationRightNow);
      setValue({ latitude: lat, longitude: lon });
      setRegion((prevRegion) => ({
        ...prevRegion,
        latitude: lat,
        longitude: lon,
      }));
      const checkInVal = await supabase
        .from("profiles")
        .select("checkIn, homeLocationCoordinates, username")
        .eq("id", session?.user?.id);
      await supabase
        .from("profiles")
        .update({ currentLocation: currLoc })
        .eq("id", session?.user?.id);

      const currentLocationValue = await supabase
        .from("profiles")
        .select("currentLocation")
        .eq("id", session?.user?.id);

      if (currentLocationValue.data) {
        setCurrentLocation(currentLocationValue.data[0].currentLocation);
      }

      if (checkInVal?.data && checkInVal.data[0].checkIn === true) {
        const username = checkInVal.data[0].username;
        if (checkInVal.data[0].homeLocationCoordinates) {
          const homeLocation = checkInVal.data[0].homeLocationCoordinates;
          const distance = haversine_distance(homeLocation, currLoc);
          if (distance < 0.1) {
            console.log("Home location");
            fetch("https://app.nativenotify.com/api/notification", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer 4 CMRZxI3FQlP7ByH2W2taW",
              },
              body: JSON.stringify({
                appId: 20296,
                appToken: "4CMRZxI3FQlP7ByH2W2taW",
                title: `${username} has reached home`,
                body: "Hi, I have reached Home, Just letting you know",
                dateSent: Date.now(),
              }),
            });
            await supabase
              .from("profiles")
              .update({ checkIn: false })
              .eq("id", session?.user?.id);
          } else {
            console.log("Not home location");
          }
        } else {
          console.log("No home location");
        }
      }
    } catch (error) {
      console.log("Error getting current location:", error);
    }
  };

  useEffect(() => {
    requestPermissions();
    location();
    getMarkers(); // Call getMarkers function once at the start
    getFamilyMarkers();
    getHeatMapMarkers();

    const interval = setInterval(() => {
      getMarkers();
      location();
      getFamilyMarkers();
    }, 10000); // Fetch markers every 1 minute

    return () => {
      clearInterval(interval);
    };
  }, []);
  useEffect(() => {
    updateLocationDB();
    const interval = setInterval(() => {
      updateLocationDB();
    }, 30000); // Update Location every 1 min
    return () => {
      clearInterval(interval);
    };
  }, []);
  const getFamilyMarkers = async () => {
    const { data: family, error } = await supabase
      .from("profiles")
      .select("username, currentLocation, avatar_url, family")
      .eq("id", session?.user?.id);
    if (family && family.length > 0) {
      const id = session?.user?.id; // Define the id variable
      setFriendsData(family[0].family); // Set the friendsData state variable
      console.log("FAMILY:", family[0].family);
      const familyUUIDs = family[0].family; // Get the family UUIDs
      const { data: friends, error: friendsError } = await supabase
        .from("profiles")
        .select("username, family, currentLocation, avatar_url")
        .in("id", familyUUIDs); // Use 'in' instead of 'containedBy'
      if (friends) {
        setFamilyMarkers(friends);
      }
    }
  };

  const getData = (destination: any) => {
    Geocoder.from(destination)
      .then((json) => {
        setDestinationLatLng(json.results[0].geometry.location);
        var location = json.results[0].geometry.location;
      })
      .catch((error) => console.warn(error));
    setDestination(destination);

    axios
      .post(backendURL + "route", {
        origin: currentLocation,
        destination: destination,
      })
      .then(function (response) {
        const decoded = decode(
          response.data.routes[0].overview_polyline.points
        );
        setPolylineCoordinates(
          decoded.map((point: any) => ({
            latitude: point[0],
            longitude: point[1],
          }))
        );
        setRegion({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setDistance(response.data.routes[0].legs[0].distance.text);
        setDuration(response.data.routes[0].legs[0].duration.text);
      })

      .catch(function (error) {
        console.log(error);
      });
  };

  const increaseLikes = async (alert: string) => {
    const { data, error } = await supabase
      .from("alerts")
      .update({ likes: 1 })
      .eq("alert", alert);
  };
  // Heatmap Markers
  const [heatMapMarkersS, setHeatMapMarkersS] = useState<any>([]);
  const [heatMapMarkersM, setHeatMapMarkersM] = useState<any>([]);
  const [heatMapMarkersL, setHeatMapMarkersL] = useState<any>([]);

  const getHeatMapMarkers = async () => {
    try {
      const responseS = await axios.get(backendURL + "crimeDataSmall");

      setHeatMapMarkersS(responseS.data);
      const responseM = await axios.get(backendURL + "crimeDataMedium");
      setHeatMapMarkersM(responseM.data);
      const responseL = await axios.get(backendURL + "crimeDataLarge");
      setHeatMapMarkersL(responseL.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={{ flex: 1, display: "flex" }}>
      <SafeAreaView
        style={{
          position: "absolute", // Take the view out of the normal layout flow
          zIndex: 1, // Ensure this view appears on top
          width: "100%", // Take the full width of the screen
          height: 200,
          justifyContent: "center",
          alignItems: "center",
          marginTop: 20,
          borderRadius: 20,
        }}
      >
        <SearchBar onSearch={getData} />
        {distance && duration ? (
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around",
              alignItems: "center",
              backgroundColor: "white",
              borderRadius: 20,
              padding: 10,
              shadowColor: "black",
              shadowOffset: { width: 0, height: 2 },
              width: "90%",
            }}
          >
            <Text style={{ color: "black" }}>Distance: {distance} </Text>
            <Text style={{ color: "black" }}>Time: {duration}</Text>
          </View>
        ) : null}

        {/* <Button title="Get Location" onPress={() => {
          setMarkers(prevMarkers => [...prevMarkers, { latitude: 43.032201, longitude: -76.122812 }]) // Update markers state with new value
        }} /> */}
      </SafeAreaView>
      <MapView
        ref={mapView}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        googleMapId="3277db22b22e7eab"
        initialRegion={{
          latitude: 43.032201,
          longitude: -76.122812,
          latitudeDelta: latlngDelta.latitudeDelta,
          longitudeDelta: latlngDelta.longitudeDelta,
        }}
        onRegionChange={(region) => {
          setRegion(region);
        }}
        role="alert"
        showsUserLocation={true}
        showsMyLocationButton={true}
        rotateEnabled={true}
        nativeID="map"
        customMapStyle={[]} // Add custom map style
        cacheEnabled={true}
        mapType="standard"
      >
        {heatMapMarkersS.length > 0 && (
          <Heatmap
            points={heatMapMarkersS}
            opacity={0.5}
            radius={25}
            gradient={{
              colors: ["#0000FF"],
              startPoints: [0.001],
              colorMapSize: 256,
            }}
          />
        )}
        {}
        {heatMapMarkersM.length > 0 && (
          <Heatmap
            points={heatMapMarkersM}
            opacity={0.5}
            radius={25}
            gradient={{
              colors: ["#00FF00"],
              startPoints: [0.001],
              colorMapSize: 256,
            }}
          />
        )}
        {heatMapMarkersL.length > 0 && (
          <Heatmap
            points={heatMapMarkersL}
            opacity={0.5}
            radius={25}
            gradient={{
              colors: ["#FF0000"],
              startPoints: [0.001],
              colorMapSize: 256,
            }}
          />
        )}
        {familyMarkers.length > 0 &&
          familyMarkers.map((familyMarker: any, index: number) => (
            <Marker
              key={index}
              coordinate={{
                latitude: familyMarker.currentLocation.latitude,
                longitude: familyMarker.currentLocation.longitude,
              }}
              title={familyMarker.username}
              description={familyMarker.username}
              tappable={true}
              onPress={() => console.log("Marker pressed")}
              stopPropagation={true}
            >
              <Image
                source={{ uri: familyMarker.avatar_url }}
                style={{ width: 50, height: 50, borderRadius: 50 }}
                onLoadEnd={() => {}}
              />
              {/* <Callout tooltip={true} onPress={() => console.log('Callout pressed')} style={{

              }}>
                <View style={{ flex: 1,
                  padding: 10, 
                  display: 'flex', 
                  flexDirection: 'row', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  backgroundColor:'white',
                  borderRadius: 20,
                  shadowColor: 'black',
                  shadowOffset: { width: 0, height: 2 },

                  
                  }}>
                  <Text>{familyMarker.username}</Text>
                  <Pressable onPress={() => console.log('Pressed')} style={{

                  }}>

                  </Pressable>
                </View>
              </Callout> */}
            </Marker>
          ))}
        {/* <Marker coordinate={{ latitude: 43.032201, longitude: -76.122812 }} /> */}
        {/* {destination && (
          <MapViewDirections
            origin={currentLocation}
            destination={destination}
            apikey={googleAPIKEY}
            strokeWidth={3}
            mode="WALKING"
            optimizeWaypoints={true}
            strokeColor="hotpink"
            onStart={(params) => {
              console.log(
                `Started routing between "${params.origin}" and "${params.destination}"`
              );
            }}
            splitWaypoints={true}
            waypoints={[]} // Add waypoints
            precision="high"
            language="en"
            channel="alerts"
            miterLimit={10}
            onReady={(result) => {
              console.log("Distance: ", result.distance);
              console.log("Duration: ", result.duration);
              setRegion({
                latitude: currentLocation.latitude,
                longitude: currentLocation.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              });
            }}
            onError={(errorMessage) => {
              console.log("GOT AN ERROR", errorMessage);
            }}
            region="us-east-1"
          />
        )} */}
        {destination && (
          <Polyline
            coordinates={polylineCoordinates}
            strokeColor="hotpink" // fallback for when `strokeColors` is not supported by the map-provider
            strokeWidth={3}
            removeClippedSubviews={true}
            pointerEvents="auto"
          />
        )}
        {destination && (
          <Marker
            coordinate={{
              latitude: destinationLatLng.lat,
              longitude: destinationLatLng.lng,
            }}
            title={"Destination"}
            description={"Destination"}
            shouldRasterizeIOS={true}
            tracksViewChanges={true}
            tracksInfoWindowChanges={true}
            tappable={true}
            onPress={(event) => {
              console.log(event.nativeEvent);
            }}
          />
        )}
        {markers.map((marker, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: marker.latitude,
              longitude: marker.longitude,
            }}
            title={"Alert"}
            description={"Alert"}
            tappable={true}
            onPress={() => console.log("Marker pressed")}
            tracksViewChanges={false}
            tracksInfoWindowChanges={false}
            stopPropagation={true}
            // icon={require('./alertSmallDangerS.png')}
            icon={require("./alertYellow.png")}
          >
            <Callout
              tooltip={true}
              onPress={() => console.log("Callout pressed")}
            >
              <View
                style={{
                  flex: 1,
                  padding: 5,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "white",
                  borderRadius: 20,
                  shadowColor: "black",
                  shadowOffset: { width: 0, height: 2 },
                  gap: 10,
                }}
              >
                <Text>{marker.alert}</Text>
                <View
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "white",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "bold",
                      color: "black",
                    }}
                  >
                    {formatDistanceToNow(new Date(marker.created_at))} ago
                  </Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}
