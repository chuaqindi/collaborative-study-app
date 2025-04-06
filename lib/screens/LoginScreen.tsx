import React, { useState } from 'react'
import { View, Text, TextInput, Button, StyleSheet , ImageBackground, TouchableOpacity} from 'react-native'
import { supabase } from '../supabase'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setMessage(`Login failed: ${error.message}`)
    } else {
      setMessage('Logged in successfully!')
      navigation.navigate('Main') // we'll build this next
    }
  }

  return (
    <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1540206395-68808572332f?q=80&w=2126&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }}
    style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.container}>

      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="black"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="black"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <Text style={styles.message}>{message}</Text>
    </SafeAreaView>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: 'center', padding: 20 },
  container: { flex: 0.7, justifyContent: 'center', padding: 20, backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 20,},
  scrollview: { flex: 1},
  
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 5 },
  message: { marginTop: 20, textAlign: 'center', color: 'red' },

  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
    elevation: 3, // adds a slight shadow for Android
  },
 
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

})
