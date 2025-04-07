import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { supabase } from '../supabase';

export default function FriendsTasksScreen() {
  const [friendsTasks, setFriendsTasks] = useState<any[]>([]);

  const fetchFriendsTasks = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;

    const { data: acceptedFriends, error } = await supabase
      .from('friends')
      .select('friend_id, friend:profiles!friends_friend_id_fkey(email)')
      .eq('user_id', userId)
      .eq('status', 'accepted');

    if (error || !acceptedFriends) {
      console.error('Error fetching friends:', error);
      return;
    }

    // Deduplicate by friend_id
    const uniqueFriends = Array.from(
      new Map(acceptedFriends.map(f => [f.friend_id, f])).values()
    );

    const tasks = await Promise.all(
      uniqueFriends.map(async (friend) => {
        const { count: total } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', friend.friend_id);

        const { count: completed } = await supabase
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', friend.friend_id)
          .eq('is_done', true);

        return {
          email: (friend as any).friend?.email || 'Unknown',
          completed: completed || 0,
          total: total || 0,
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
      <Text style={styles.title}>Friends' Task Progress</Text>
      <FlatList
        data={friendsTasks}
        keyExtractor={(item) => item.email}
        renderItem={({ item }) => (
          <Text style={styles.taskItem}>
            {item.email}: {item.completed}/{item.total} tasks completed
          </Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 30 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  taskItem: { padding: 10, fontSize: 16, borderBottomWidth: 1, borderColor: '#ccc' },
});
