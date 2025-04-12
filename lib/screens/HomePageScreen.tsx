import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../supabase';
import { getTaskCompletionCount } from '../../utils/taskUtils';
import { useFocusEffect } from '@react-navigation/native';

export default function HomePageScreen({ navigation }: any) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [showAllTasks, setShowAllTasks] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchTasks = async () => {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData.user?.id;
        if (!userId) return;

        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', userId);

        if (!error) setTasks(data || []);
        else console.error('Error fetching tasks:', error);
      };

      fetchTasks();
    }, [])
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  const { completedCount, totalCount } = getTaskCompletionCount(tasks);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <LinearGradient
          colors={['#4f46e5', '#7c3aed']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.headerRow}>
              <TouchableOpacity onPress={handleSignOut}>
                <Text style={styles.signOutText}>Sign Out</Text>
              </TouchableOpacity>

              <Image
                source={{ uri: 'https://i.pravatar.cc/200' }}
                style={styles.profileImage}
              />
            </View>

            <Text style={styles.greeting}>👋 Welcome back!</Text>
            <Text style={styles.subGreeting}>Let's start learning! 🎉</Text>
          </View>
        </LinearGradient>

        <View style={styles.section}>
          <View style={styles.sectionHeaderStyle}>
            <Text style={styles.sectionHeaderFont}>Today's Focus!</Text>
            <Text
              style={styles.viewAllButton}
              onPress={() => setShowAllTasks(!showAllTasks)}
            >
              {showAllTasks ? 'Collapse' : 'View All'}
            </Text>
          </View>

          {(() => {
            const incompleteTasks = tasks.filter((task) => !task.is_done);
            const visibleTasks = showAllTasks
              ? incompleteTasks
              : incompleteTasks.slice(0, 2);

            if (incompleteTasks.length === 0) {
              return (
                <LinearGradient
                  colors={['#34d399', '#10b981']}
                  style={styles.taskCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={[styles.text, { fontWeight: 'bold' }]}>🎉 No outstanding tasks!</Text>
                </LinearGradient>
              );
            }

            return visibleTasks.map((task) => (
              <LinearGradient
                key={task.id}
                colors={['#fbbf24', '#f59e0b']}
                style={styles.taskCard}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={[styles.text, { fontWeight: 'bold' }]}>To do: </Text>
                <Text style={styles.text}>{task.title}</Text>
              </LinearGradient>
            ));
          })()}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderStyle}>
            <Text style={styles.sectionHeaderFont}>Task Progress</Text>
          </View>

          <LinearGradient
            colors={['#7c3aed', '#a855f7']}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.statNumber}>{completedCount}/{totalCount}</Text>
            <Text style={styles.statLabel}>Tasks Completed</Text>

            <View style={styles.progressBarBackground}>
              <LinearGradient
                colors={['#10b981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[
                  styles.progressBarFill,
                  { width: `${(completedCount / (totalCount || 1)) * 100}%` },
                ]}
              />
            </View>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeaderFont}>Study Streak</Text>
          <LinearGradient
            colors={['#4f46e5', '#6366f1']}
            style={styles.streakCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.streakNumber}>1</Text>
            <Text style={styles.streakLabel}>days!</Text>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  scrollView: { flex: 1 },
  text: { fontSize: 16 },
  headerGradient: {
    paddingHorizontal: 24,
    paddingVertical: 45,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },

  headerContent: {
    marginTop: 20,
    gap: 6,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },


  signOutText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    textDecorationLine: 'underline',
    marginBottom: 4,
  },

  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#fff',
    marginLeft: 12,
  },
  
  greeting: {
    fontSize: 24,
    color: 'white',
    fontWeight: '700',
    marginTop: 8,
  },
  
  subGreeting: {
    fontSize: 16,
    color: '#e0e7ff',
    marginTop: 4,
  },

  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
 
  section: {
    padding: 5,
    gap: 12,
    backgroundColor: 'white',
    flex: 2,
    paddingTop: 20,
    paddingBottom: 20,
  },
  sectionHeaderFont: { color: 'black', fontSize: 24, fontWeight: 'bold' },
  sectionHeaderStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAllButton: {
    paddingTop: 15,
    fontSize: 12,
    color: '#6366f1',
    fontWeight: '600',
  },
  taskCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  statNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: '#ffffff',
    fontWeight: 'bold',
    flexDirection: 'row',
  },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: '#e0e7ff',
    marginTop: 4,
    fontWeight: 'bold',
  },
  streakCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  streakNumber: {
    fontFamily: 'Inter_700Bold',
    fontSize: 36,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  streakLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: '#e0e7ff',
    marginTop: 4,
    fontWeight: 'bold',
  },
  progressBarBackground: {
    height: 12,
    backgroundColor: '#e5e7eb',
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 12,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
});
