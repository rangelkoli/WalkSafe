import 'react-native-url-polyfill/auto'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Account from './components/Account'
import { View, Text, SafeAreaView } from 'react-native'
import { Session } from '@supabase/supabase-js'
import Map from './Maps'
import MapView from 'react-native-maps'


export default function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {!session ? <Auth /> : <Account session={session} />}

    </SafeAreaView>
  )
}