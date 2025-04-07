import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { supabase } from '../supabase';

export default function FriendsTasksScreen() {
  const [friendsTasks, setFriendsTasks] = useState<any[]>([]);

  type FriendWithProfile = {
    friend_id: string;
    profiles: {
      id: string;
      email: string;
    } | null;
  };

  const fetchFriendsWithTaskStats = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;

    // Fetch accepted friends with profile (email and id)
    const { data: rawFriends, error } = await supabase
      .from('friends')
      .select(`friend_id, profiles:profiles!friends_friend_id_fkey(id,email)`)  // fetch profile
      .eq('user_id', userId)
      .eq('status', 'accepted');

    if (error) {
      console.error('Error fetching friends:', error);
      return;
    }

    const friends: FriendWithProfile[] = (rawFriends ?? []).map(f => ({
      friend_id: f.friend_id,
      profiles: Array.isArray(f.profiles) ? f.profiles[0] : f.profiles,
    }));

    // Avoid duplicates by ensuring friend_id is unique
    const uniqueFriends = Array.from(
      new Map(friends.map(f => [f.friend_id, f])).values()
    );

    const tasksStats = await Promise.all(
      uniqueFriends.map(async (friend) => {
        const friendUserId = friend.profiles?.id;
        const friendEmail = friend.profiles?.email ?? 'Unknown';

        if (!friendUserId) {
          console.warn(`Missing profile info for friend: ${friend.friend_id}`);
          return { email: friendEmail, completed: 0, total: 0 };
        }

        const { count: total } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', friendUserId);

        const { count: completed } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', friendUserId)
          .eq('is_done', true);

        return {
          email: friendEmail,
          completed: completed || 0,
          total: total || 0,
        };
      })
    );

    setFriendsTasks(tasksStats);
  };

  useEffect(() => {
    fetchFriendsWithTaskStats();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Friends' Task Progress</Text>
      {friendsTasks.length === 0 ? (
        <Text style={styles.subtext}>No friends found.</Text>
      ) : (
        <FlatList
          data={friendsTasks}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.friendItem}>
              <Text>{`${item.email}: ${item.completed}/${item.total} tasks completed`}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: 'white' },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subtext: { fontSize: 16, color: 'gray' },
  friendItem: { paddingVertical: 10, borderBottomWidth: 1, borderColor: '#ccc' },
});
