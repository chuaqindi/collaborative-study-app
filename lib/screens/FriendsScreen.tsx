import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { supabase } from '../supabase';

export default function FriendsScreen() {
  const [friendEmail, setFriendEmail] = useState('');
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchFriends = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const currentUserId = userData.user?.id;
    if (!currentUserId) return;

    setUserId(currentUserId);

    const { data: sent } = await supabase
      .from('friends')
      .select('*, friend:profiles!friends_friend_id_fkey(email)')
      .eq('user_id', currentUserId);

    setSentRequests(sent || []);

    const { data: received } = await supabase
      .from('friends')
      .select('*, sender:profiles!friends_user_id_fkey(email)')
      .eq('friend_id', currentUserId);

    setReceivedRequests(received || []);
  };

  const addFriend = async () => {
    const trimmedEmail = friendEmail.trim();
    if (!trimmedEmail) return;

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', trimmedEmail)
      .single();

    if (error || !profile) {
      Alert.alert('Error', 'User not found');
      return;
    }

    const { data: userData } = await supabase.auth.getUser();
    const currentUserId = userData.user?.id;

    if (currentUserId === profile.id) {
      Alert.alert('Error', 'You cannot send a friend request to yourself.');
      return;
    }

    // Check for existing relationship
    const { data: existing, error: checkError } = await supabase
      .from('friends')
      .select()
      .or(
        `and(user_id.eq.${currentUserId},friend_id.eq.${profile.id}),and(user_id.eq.${profile.id},friend_id.eq.${currentUserId})`
      );

    if (existing && existing.length > 0) {
      const existingStatus = existing[0].status;
      if (existingStatus === 'pending') {
        Alert.alert('Info', 'Friend request already sent and pending.');
        return;
      } else if (existingStatus === 'accepted') {
        Alert.alert('Info', 'You are already friends.');
        return;
      }
    }

    const { error: insertError } = await supabase.from('friends').insert({
      user_id: currentUserId,
      friend_id: profile.id,
      status: 'pending',
    });

    if (insertError) {
      Alert.alert('Error', 'Friend request failed.');
      console.error(insertError);
    } else {
      Alert.alert('Success', 'Friend request sent!');
      setFriendEmail('');
      fetchFriends();
    }
  };

  const respondToRequest = async (requestId: number, status: 'accepted' | 'rejected') => {
    const { error } = await supabase.from('friends').update({ status }).eq('id', requestId);
    if (!error) fetchFriends();
  };

  useEffect(() => {
    fetchFriends();
  }, []);

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
        data={receivedRequests.filter((r) => r.status === 'pending')}
        keyExtractor={(item) => `${item.id}-received`}
        renderItem={({ item }) => (
          <View style={styles.friendItem}>
            <Text>From: {item.sender?.email}</Text>
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
        keyExtractor={(item) => `${item.id}-sent`}
        renderItem={({ item }) => (
          <Text style={styles.friendItem}>
            To: {item.friend?.email} - Status: {item.status}
          </Text>
        )}
      />
    </View>
  );
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
});
