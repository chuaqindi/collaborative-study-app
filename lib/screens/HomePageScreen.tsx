import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image , FlatList, TouchableOpacity, Alert, TextInput} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons, FontAwesome } from '@expo/vector-icons';
import { supabase } from '../supabase';
import { getTaskCompletionCount } from '../../utils/taskUtils';

export default function HomeScreen() {

  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
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
  }, []);

  const { completedCount, totalCount } = getTaskCompletionCount(tasks);

  return (
    
    
    <View style={styles.container}> 
      <ScrollView style={styles.scrollView}> 
        <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.headerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.headerTopRow}>
            <Text style={styles.greeting}>👋 Welcome back!</Text>
            <Image source={{ uri: 'https://i.pravatar.cc/200' }} style={styles.profileImage}/>
          </View>
          
          <Text style={styles.subGreeting}>Let's start learning! 🎉</Text>
        </LinearGradient>
  
        <View style={styles.section}>
          <View style = {styles.sectionHeaderStyle}>
            <Text style={styles.sectionHeaderFont}>Today's Focus !</Text>
            <Text style={styles.viewAllButton} onPress={() => console.log('View all [Today Focus] pressed!')}>View All</Text>
          </View>

          <LinearGradient colors={['#fbbf24', '#f59e0b']} style={styles.taskCard}  start={{ x: 0, y: 0 }}  end={{ x: 1, y: 1 }}>
            <Text style={[styles.text, { fontWeight: 'bold' }]}>SC2008: Computer Network</Text>
            <Text style={styles.text}>Complete Tutorial 5</Text>
          </LinearGradient>

          <LinearGradient colors={['#fbbf24', '#f59e0b']} style={styles.taskCard}  start={{ x: 0, y: 0 }}  end={{ x: 1, y: 1 }}>
            <Text style={[styles.text , {fontWeight:'bold'}]}>SC2005: Operating Systems</Text>
            <Text style={styles.text}>Read Week 7 Lecture Slides</Text>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <View style = {styles.sectionHeaderStyle}>
            <Text style={styles.sectionHeaderFont}>Task Progress</Text>
            <Text style={styles.viewAllButton} onPress={() => console.log('View all [Task Progress] pressed!')}>View All</Text>
          </View>
          
          <LinearGradient colors={['#7c3aed', '#a855f7']} style={styles.statCard} start={{ x: 0, y: 0 }}  end={{ x: 1, y: 1 }}>
          <Text style={styles.statNumber}>{completedCount}/{totalCount}</Text>
            <Text style={styles.statLabel}>Tasks Completed</Text>
          </LinearGradient>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeaderFont}>Study Streak</Text>

          <LinearGradient colors={['#4f46e5', '#6366f1']} style={styles.streakCard} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
            <Text style={styles.streakNumber}>1</Text>
            <Text style={styles.streakLabel}>days!</Text>
          </LinearGradient>
        </View>

      </ScrollView>
    </View>
    
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  scrollView: {flex: 1,},
  text: {fontSize: 16,},
  headerGradient: {
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  
  header: { justifyContent: 'center',},

  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#fff',
  },

  greeting: {fontSize: 24,color: 'white',fontWeight: '700',},

  subGreeting: {fontSize: 16,color: '#e0e7ff',marginTop: 8,},
  section: {
    padding: 5,
    gap: 12,
    backgroundColor: 'white',
    flex:2,
    paddingTop: 20,
    paddingBottom: 20,

  },

  sectionHeaderFont: { color: 'black',fontSize: 24,fontWeight: 'bold',  },
  sectionHeaderStyle: { flexDirection: 'row',justifyContent: 'space-between',alignItems: 'center'},

  viewAllButton: {
    paddingTop: 15,
    fontSize: 12,
    color: '#6366f1', // Indigo-500
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



})
