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
