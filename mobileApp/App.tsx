import "react-native-url-polyfill/auto";
import { useState, useEffect } from "react";
import { supabase } from "./components/lib/supabase";
import Auth from "./components/Auth";
import Account from "./components/Account";
import { View, Text, SafeAreaView } from "react-native";
import { Session } from "@supabase/supabase-js";
import Map from "./components/Maps";
import MapView from "react-native-maps";
import HomePage from "./components/HomePage";
import BottomNavigation from "./components/navigation/navigation";
import registerNNPushToken from "native-notify";
import { LogBox } from "react-native";

LogBox.ignoreLogs([
  "Warning: ...",
  "source.uri should not be an empty string",
  "Possible Unhandled Promise Rejection",
  "VirtualizedLists should never be nested inside plain ScrollViews with the same orientation - use another VirtualizedList-backed container instead.",
  "Non-serializable values were found in the navigation state",
  "Animated: `useNativeDriver` was not specified.",
  "Animated.event now requires a second argument for options",
  "Require cycle:",
  "Possible...",
]);
export default function App() {
  registerNNPushToken(20296, "4CMRZxI3FQlP7ByH2W2taW");

  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      console.log(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {!session ? <Auth /> : <BottomNavigation session={session} />}
    </View>
  );
}
