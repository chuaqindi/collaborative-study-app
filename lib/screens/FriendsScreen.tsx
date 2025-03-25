import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native'
import { supabase } from '../supabase'

export default function FriendsScreen() {
  const [friendEmail, setFriendEmail] = useState('')
  const [friends, setFriends] = useState<any[]>([])

  const fetchFriends = async () => {
    const user = await supabase.auth.getUser()
    const { data, error } = await supabase
      .from('friends')
      .select('*, profiles(email)')
      .eq('user_id', user.data.user?.id)

    if (!error) setFriends(data)
  }

  const addFriend = async () => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', friendEmail)
      .single()

    if (!profile) {
      Alert.alert('Error', 'User not found')
      return
    }

    const user = await supabase.auth.getUser()
    await supabase.from('friends').insert({
      user_id: user.data.user?.id,
      friend_id: profile.id,
      status: 'pending',
    })

    setFriendEmail('')
    fetchFriends()
  }

  useEffect(() => {
    fetchFriends()
  }, [])

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add a Friend</Text>
      <TextInput
        placeholder="Enter friend's email"
        value={friendEmail}
        onChangeText={setFriendEmail}
        style={styles.input}
      />
      <Button title="Send Friend Request" onPress={addFriend} />

      <FlatList
        data={friends}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Text style={styles.friendItem}>
            Friend ID: {item.friend_id} - Status: {item.status}
          </Text>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 30 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderRadius: 5, padding: 10, marginBottom: 10 },
  friendItem: { padding: 10, fontSize: 16 },
})
