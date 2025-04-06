import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { supabase } from '../supabase';
import { LinearGradient } from 'expo-linear-gradient';

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
    console.log('🔑 Current user ID:', currentUserId);

    // Fetch sent requests
    const { data: sent, error: sentError } = await supabase
      .from('friends')
      .select('*, friend:profiles!friends_friend_id_fkey(email)')
      .eq('user_id', currentUserId);

    if (sentError) {
      console.error('❌ Sent Fetch Error:', sentError);
    } else {
      setSentRequests(sent || []);
    }

    // Fetch received requests
    const { data: received, error: receivedError } = await supabase
      .from('friends')
      .select('*, sender:profiles!friends_user_id_fkey(email)')
      .eq('friend_id', currentUserId);

    if (receivedError) {
      console.error('❌ Received Fetch Error:', receivedError);
    } else {
      setReceivedRequests(received || []);
    }
  };

  const addFriend = async () => {
    const trimmedEmail = friendEmail.trim().toLowerCase();
    if (!trimmedEmail) return;

    console.log('🔍 Searching for email:', trimmedEmail);

    // Step 1: Look up friend's profile
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

    if (!currentUserId || currentUserId === profile.id) {
      Alert.alert('Error', 'You cannot send a friend request to yourself.');
      return;
    }

    // Step 2: Check for existing friend request in either direction
    const { data: existing, error: existingError } = await supabase
      .from('friends')
      .select('*')
      .or(
        `and(user_id.eq.${currentUserId},friend_id.eq.${profile.id}),and(user_id.eq.${profile.id},friend_id.eq.${currentUserId})`
      )
      .maybeSingle();

    if (existing && !existingError) {
      Alert.alert(
        'Error',
        `A friend request already exists with status: ${existing.status}`
      );
      return;
    }

    // Step 3: Insert the friend request
    const { error: insertError } = await supabase.from('friends').insert({
      user_id: currentUserId,
      friend_id: profile.id,
      status: 'pending',
    });

    if (insertError) {
      Alert.alert('Error', 'Failed to send friend request.');
      console.error(insertError);
    } else {
      Alert.alert('Success', 'Friend request sent!');
      setFriendEmail('');
      fetchFriends();
    }
  };

  const respondToRequest = async (
    requestId: number,
    status: 'accepted' | 'rejected'
  ) => {
    const { error } = await supabase
      .from('friends')
      .update({ status })
      .eq('id', requestId);

    if (!error) fetchFriends();
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  return (
    <View style={styles.container}>
      
      <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.headerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.headerTopRow}>
          <Text style={styles.header}>👋 My Friends</Text>
        </View>
      </LinearGradient>

      <Text style = {styles.addFriendHeader}>Add Friend</Text>
      <View style = {styles.inputSection}>
      <TextInput
        placeholder="Enter friend's email"
        value={friendEmail}
        onChangeText={setFriendEmail}
        style={styles.input}
        placeholderTextColor={'black'}
      />
      </View>


      <Button title="Send Friend Request" onPress={addFriend} />
      <Text style={styles.subtitle}>Received Requests</Text>

      <FlatList
        data={receivedRequests.filter((r) => r.status === 'pending')}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.friendItem}>
            <Text>From: {item.sender?.email}</Text>
            <View style={styles.row}>
              <TouchableOpacity
                onPress={() => respondToRequest(item.id, 'accepted')}
              >
                <Text style={styles.accept}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => respondToRequest(item.id, 'rejected')}
              >
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
            To: {item.friend?.email} - Status: {item.status}
          </Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 0, marginTop: 0 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  headerGradient: {
    paddingHorizontal: 24,
    paddingVertical: 50,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  header: {fontSize: 24,color: 'white',fontWeight: '700',},
  headerTopRow: {flexDirection: 'row',justifyContent: 'space-between',alignItems: 'center',},
  addFriendHeader:{paddingTop: 20, fontSize: 24, fontWeight:'bold', paddingLeft: 10,},
  inputSection: {paddingTop: 10, paddingLeft:10, paddingRight: 10},
  input: { borderWidth: 1, borderRadius: 5, padding: 10, marginBottom: 10, height: 50, fontSize: 18},

  subtitle: { fontSize: 24, fontWeight: 'bold', margin:10 },

  friendItem: {
    padding: 10,
    fontSize: 16,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  row: { flexDirection: 'row', gap: 20 },
  accept: { color: 'green', fontWeight: 'bold' },
  reject: { color: 'red', fontWeight: 'bold' },



});
