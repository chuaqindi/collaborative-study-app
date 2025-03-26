import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native'
import { supabase } from '../supabase'

export default function FriendsScreen() {
  const [friendEmail, setFriendEmail] = useState('')
  const [sentRequests, setSentRequests] = useState<any[]>([])
  const [receivedRequests, setReceivedRequests] = useState<any[]>([])

  const fetchFriends = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id

    const { data: sent, error: sentError } = await supabase
      .from('friends')
      .select('*, profiles:profiles!friends_friend_id_fkey(email)')
      .eq('user_id', userId)

    const { data: received, error: receivedError } = await supabase
      .from('friends')
      .select('*, profiles:profiles!friends_user_id_fkey(email)')
      .eq('friend_id', userId)

    if (!sentError) setSentRequests(sent)
    if (!receivedError) setReceivedRequests(received)
  }

  const addFriend = async () => {
    const trimmedEmail = friendEmail.trim()
    console.log("🔍 Searching for email:", trimmedEmail)
  
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', trimmedEmail)
      .single()
  
    console.log("🧪 Lookup Result:", profile, error)
  
    if (error || !profile) {
      Alert.alert('Error', 'User not found')
      return
    }
  
    const { data: userData } = await supabase.auth.getUser()
  
    await supabase.from('friends').insert({
      user_id: userData.user?.id,
      friend_id: profile.id,
      status: 'pending',
    })
  
    setFriendEmail('')
    fetchFriends()
  }
  
  
  
  

  const respondToRequest = async (requestId: number, status: 'accepted' | 'rejected') => {
    const { error } = await supabase
      .from('friends')
      .update({ status })
      .eq('id', requestId)

    if (!error) fetchFriends()
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

      <Text style={styles.subtitle}>Received Requests</Text>
      <FlatList
        data={receivedRequests.filter(r => r.status === 'pending')}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.friendItem}>
            <Text>From: {item.profiles?.email}</Text>
            <View style={styles.row}>
              <TouchableOpacity onPress={() => respondToRequest(item.id, 'accepted')}>
                <Text style={styles.accept}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => respondToRequest(item.id, 'rejected')}>
                <Text style={styles.reject}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Text style={styles.subtitle}>Sent Requests</Text>
      <FlatList
        data={sentRequests}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Text style={styles.friendItem}>
            To: {item.profiles?.email} - Status: {item.status}
          </Text>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 30 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  subtitle: { fontSize: 18, fontWeight: '600', marginTop: 20, marginBottom: 10 },
  input: { borderWidth: 1, borderRadius: 5, padding: 10, marginBottom: 10 },
  friendItem: { padding: 10, fontSize: 16, borderBottomWidth: 1, borderColor: '#ccc' },
  row: { flexDirection: 'row', gap: 20 },
  accept: { color: 'green', fontWeight: 'bold' },
  reject: { color: 'red', fontWeight: 'bold' },
})
