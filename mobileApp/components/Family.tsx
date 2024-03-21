import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  Image,
  TextInput,
  ScrollView,
  Pressable,
} from "react-native";
import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { Button, Input } from "react-native-elements";
import { Session } from "@supabase/supabase-js";

const Family = ({ session }: { session: Session }) => {
  const [family, setFamily] = useState([]) as any;
  const [friends, setfriends] = useState([]) as any;
  const [emailInput, setEmailInput] = useState("") as any;
  const [checkIn, setCheckIn] = useState(true) as any;
  const [username, setUsername] = useState("") as any;

  const handleCheckIn = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .update({ checkIn: true })
      .eq("id", session?.user?.id);
  };

  const fetchFamily = async () => {
    const { data: family, error } = await supabase
      .from("profiles")
      .select("username, family, checkIn, username")
      .eq("id", session?.user?.id);

    if (family) {
      console.log("Family:", family);
      setUsername(family[0].username);
    }

    if (family && family.length > 0) {
      const id = session?.user?.id; // Define the id variable
      const familyUUIDs = family[0].family; // Get the family UUIDs

      // const friendsUUIDs = [
      //   "f2d4a61d-a345-49d1-98e6-24d61b46aabc",
      //   "fdd5fe65-11dc-4e82-830a-1502b152fc6e",
      // ]; // Array of UUIDs

      const { data: friends, error: friendsError } = await supabase
        .from("profiles")
        .select("username, family, currentLocation, avatar_url")
        .in("id", familyUUIDs); // Use 'in' instead of 'containedBy'
      setfriends(friends);
      console.log("Friends:", friends);

      console.log("Family:", family);
      if (error) console.log("Error fetching family:", error);
      else setFamily(family[0]);

      if (friendsError) {
        console.log("Error fetching friends:", friendsError);
      } else if (friends) {
        console.log("Friends:", friends);
        setfriends(friends);
      }

      if (friendsError) {
        console.log("Error fetching friends:", friendsError);
      }
    }
  };
  useEffect(() => {
    fetchFamily();
  }, []);

  const handleInputChange = (text: string) => {
    setEmailInput(text);
  };

  const addFamilyMember = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", emailInput);
    if (data && data.length > 0) {
      const { data: updatedFamily, error: updateError } = await supabase
        .from("profiles")
        .update({ family: family.family.concat(data[0].id) })
        .eq("id", session?.user?.id);
      if (updateError) {
        console.log("Error updating family:", updateError);
      } else {
        console.log("Family updated:", updatedFamily);
        fetchFamily();
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headingText}>Hi {username}, Your Family:</Text>
      {/* <Image
            style={{ width: 50, height: 50, }}
            source={require('./alertDanger.png')}
            width={20}
            height={20}
        /> */}

      {/* <Text key={family.username}>{family.username}</Text>
          <Text key={family.family}>{family.family}</Text> */}

      {/* {
                    friends && friends.length > 0 && 
                    <View style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '90%',
                      padding: 20,
                      backgroundColor: 'lightgrey',
                      borderRadius: 10,
                      margin: 10,
                    }}>
                      <Image
                        width={50} height={50}
                        source={{uri:'https://uxctabsuocwyfobklkyh.supabase.co/storage/v1/object/sign/avatars/alert-danger-svgrepo-com%20(1).png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJhdmF0YXJzL2FsZXJ0LWRhbmdlci1zdmdyZXBvLWNvbSAoMSkucG5nIiwiaWF0IjoxNzEwNjQ3NTgxLCJleHAiOjE3NDIxODM1ODF9.fZh5UvagGV7kA59d2jZXfhQ72pOihZXrvM2np6rR1-E&t=2024-03-17T03%3A53%3A01.158Z'}}
                        />
                      <Text key={friends[0].username}>{friends[0].username}</Text>
                      <View style={{
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}>
                      <Text key={"CurrentLocationLAT"}>{friends[0].currentLocation.latitude},</Text>
                      <Text key={"CurrentLocationLNG"}>{friends[0].currentLocation.longitude}</Text> 
                      </View>
                    </View>

          } */}

      {friends && friends.length > 0 ? (
        friends.map((friend: any) => {
          return (
            <View
              key={friend.username}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                width: "90%",
                padding: 20,
                backgroundColor: "lightgrey",
                borderRadius: 10,
                margin: 10,
                shadowColor: "black",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.8,
              }}
            >
              <Image
                width={50}
                height={50}
                source={{ uri: friend.avatar_url }}
                style={{ width: 50, height: 50 }}
              />
              <Text
                key={friend.username}
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: "black",
                  margin: 5,
                }}
              >
                {friend.username}
              </Text>
              <View
                style={{
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "bold",
                    color: "black",
                    margin: 5,
                  }}
                >
                  {" "}
                  Current Coordinates:
                </Text>
                <Text key={friend.username + "LAT"}>
                  {friend.currentLocation.latitude},
                </Text>
                <Text key={friend.username + "LNG"}>
                  {friend.currentLocation.longitude}
                </Text>
              </View>
              <Pressable onPress={() => console.log("pressed")}>
                <Image
                  source={require("./cross-svgrepo-com.png")}
                  style={{
                    width: 25,
                    height: 25,
                  }}
                />
              </Pressable>
            </View>
          );
        })
      ) : (
        <Text>No friends found</Text>
      )}
      <View style={styles.inputContainer}>
        {friends.length ? (
          <Button
            title="Check In"
            onPress={() => {
              handleCheckIn();
            }}
            style={{ marginBottom: 10, borderRadius: 20 }}
          />
        ) : null}
        <TextInput
          style={styles.input}
          placeholder="Enter your family's Email"
          value={emailInput}
          onChangeText={handleInputChange}
          clearTextOnFocus={true}
        />
        <Button title="Add to Family" onPress={addFamilyMember} />
      </View>
    </SafeAreaView>
  );
};

export default Family;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
  },
  headingText: {
    fontSize: 24,
    fontWeight: "bold",
    margin: 20,
  },
  inputContainer: {
    width: "90%",
    bottom: 0,
    position: "absolute",
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    width: "100%",
  },
});
