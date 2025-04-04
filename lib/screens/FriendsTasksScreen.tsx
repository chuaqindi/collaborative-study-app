import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { supabase } from '../supabase';

type RawFriend = {
  friend_id: string;
  profiles: {
    email: string;
  }[]; // profiles is an array
};

type TaskSummary = {
  email: string;
  remaining: number;
};

export default function FriendsTasksScreen() {
  const [friendsTasks, setFriendsTasks] = useState<TaskSummary[]>([]);

  const fetchFriendsTasks = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const userId = user?.id;
    if (!userId) return;

    const { data: sentRequests, error } = await supabase
      .from('friends')
      .select('friend_id, profiles!friends_friend_id_fkey(email)')
      .eq('user_id', userId)
      .eq('status', 'accepted');

    if (error || !sentRequests) {
      console.error('Error fetching friends:', error);
      return;
    }

    const tasks = await Promise.all(
      sentRequests.map(async (friend: RawFriend): Promise<TaskSummary> => {
        const { count } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', friend.friend_id)
          .eq('is_done', false);

        return {
          email: friend.profiles?.[0]?.email ?? 'Unknown',
          remaining: count ?? 0,
        };
      })
    );

    setFriendsTasks(tasks);
  };

  useEffect(() => {
    fetchFriendsTasks();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Friends' Remaining Tasks</Text>
      <FlatList
        data={friendsTasks}
        keyExtractor={(item) => item.email}
        renderItem={({ item }) => (
          <Text style={styles.item}>
            {item.email}: {item.remaining} remaining
          </Text>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No accepted friends or tasks yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 30 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  item: { fontSize: 16, paddingVertical: 10, borderBottomWidth: 1, borderColor: '#ccc' },
  empty: { fontSize: 16, fontStyle: 'italic', color: 'gray', marginTop: 20 },
});
