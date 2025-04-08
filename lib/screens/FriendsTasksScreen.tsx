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

    // Get all friendships where the user is sender or receiver
    const { data: sent } = await supabase
      .from('friends')
      .select('friend_id, profiles:profiles!friends_friend_id_fkey(id,email)')
      .eq('user_id', userId)
      .eq('status', 'accepted');

    const { data: received } = await supabase
      .from('friends')
      .select('user_id, friend_id, profiles:profiles!friends_user_id_fkey(id,email)')
      .eq('friend_id', userId)
      .eq('status', 'accepted');

    const friends: FriendWithProfile[] = [
      ...(sent ?? []).map((f: any) => ({
        friend_id: f.friend_id,
        profiles: Array.isArray(f.profiles) ? f.profiles[0] : f.profiles,
      })),
      ...(received ?? []).map((f: any) => ({
        friend_id: f.user_id,
        profiles: Array.isArray(f.profiles) ? f.profiles[0] : f.profiles,
      })),
    ];

    // Remove duplicate friends by profile ID (not friend_id)
    const uniqueFriends = Array.from(
      new Map(friends.map(f => [f.profiles?.id, f])).values()
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
