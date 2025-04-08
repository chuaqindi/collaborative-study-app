import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { supabase } from '../supabase';
import { LinearGradient } from 'expo-linear-gradient';


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
      <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.headerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
              <View style={styles.headerTopRow}>
                <Text style={styles.header}>🌱 Friends' Task Progress</Text>
              </View>
            </LinearGradient>


      {friendsTasks.length === 0 ? (
        <Text style={styles.subtext}>No friends found.</Text>
      ) : (
        <FlatList
          data={friendsTasks}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => {
            const progress = item.total > 0 ? item.completed / item.total : 0;
            return (
              <View style={styles.friendItem}>
                <Text style={styles.friendEmail}>{item.email}</Text>
                <View style={styles.progressBarBackground}>
                  <LinearGradient
                    colors={['#10b981','#065f46']} 
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
                  />
                </View>
                <Text style={styles.taskText}>
                  <Text style={styles.taskCompleted}>{item.completed}</Text> / {item.total} tasks completed
                </Text>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 0, backgroundColor: 'white' },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  subtext: { fontSize: 16, color: 'gray', padding: 10, },
  friendItem: { paddingVertical: 10, borderBottomWidth: 1, borderColor: '#ccc' , padding: 10},
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

  friendEmail: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#1f2937', // dark gray
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#e5e7eb',
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 6,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  taskText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000', // black
    marginTop: 6,
  },
  taskCompleted: {
    fontWeight: '700',
    color: '#10b981', // black
  },


});
