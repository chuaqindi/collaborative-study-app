import React, { useState } from 'react'
import { View, Text, TextInput, Button, StyleSheet , ImageBackground, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform} from 'react-native'
import { supabase } from '../supabase'
import { SafeAreaView } from 'react-native-safe-area-context'


export default function SignUpScreen({ navigation }: any) {
  // State to store email and password
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  // Function to handle sign up
  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
  
    if (error) {
      setMessage(`Sign up failed: ${error.message}`);
    } else {
      // Insert into profiles table manually
      const { user } = data;
      if (user) {
        await supabase.from('profiles').insert([{ id: user.id, email: user.email }]);
      }
  
      setMessage('Check your email to confirm sign up!');
    }
  };
  

  return (
    <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1540206395-68808572332f?q=80&w=2126&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' }}
    style={styles.background} resizeMode="cover">
    
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollview}> 
      
      <Text style={styles.title}>Create an account</Text>

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

<TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      <Button
        title="Already have an account? Log in"
        onPress={() => navigation.navigate('Login')}
      />
      <Text style={styles.message}>{message}</Text>
      
      </ScrollView>
    </SafeAreaView>
  </ImageBackground> 

  )
}

const styles = StyleSheet.create({
  background: { flex: 1, justifyContent: 'center', padding: 20 },
  
  container: { flex: 0.7, justifyContent: 'center', padding: 20, backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 20,},
  scrollview: { flex: 1},
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center', borderRadius: 20},
  input: { borderWidth: 1, marginBottom: 10, padding: 10, borderRadius: 5 },
  message: { marginTop: 20, textAlign: 'center' , color:'red'},
 
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
