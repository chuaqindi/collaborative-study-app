// lib/screens/HomeScreen.tsx

import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { supabase } from '../supabase'
import { LinearGradient } from 'expo-linear-gradient';

type Task = {
  id: string;
  title: string;
  is_done: boolean;
  user_id: string;
};

export default function HomeScreen() {
  const [title, setTitle] = useState('')
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false })

    console.log('Fetched Tasks:', data);
    if (!error && data) {
      setTasks(data as Task[]);
    }
  }

  const addTask = async () => {
    console.log('Add Task Pressed');
  
    const { data: userData, error: userError } = await supabase.auth.getUser();
    const user_id = userData.user?.id;
  
    console.log('User ID:', user_id);
    console.log('Task Title:', title);
  
    if (!user_id) {
      console.error('No user is logged in.');
      return;
    }
  
    const { data, error } = await supabase.from('tasks').insert({
      title,
      user_id,
      is_done: false,
    });
  
    if (error) {
      console.error('Insert Error:', error.message);
      return;
    }
  
    console.log('Task inserted successfully');
    setTitle('');
    fetchTasks();
  };
  

  const toggleDone = async (taskId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('tasks')
      .update({ is_done: !currentStatus })
      .eq('id', taskId)

    if (!error) fetchTasks()
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return (
    <View style={styles.container}>
      
        <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.HeaderGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.headerTopRow}>
            <Text style={styles.Header}>👋 My Tasks</Text>
          </View>
        </LinearGradient>

        <Text style = {styles.addTaskHeader}>Add Tasks</Text>
        <View style = {styles.taskInputSection}>
          <TextInput
            placeholder="Enter task title"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            placeholderTextColor={'black'}
          />
        </View>
        <TouchableOpacity style={styles.button} onPress={addTask}>
          <Text style={styles.buttonText}>Add Task</Text>
        </TouchableOpacity>

        <Text style = {styles.addTaskHeader}>Current Tasks</Text>
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => toggleDone(item.id, item.is_done)}>
              <LinearGradient 
                colors={['#fbbf24', '#f59e0b']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.task}
                >
                <Text style={[styles.taskText, item.is_done && styles.done]}>
                  {item.title}
                </Text>

              </LinearGradient>
            </TouchableOpacity>
          )}
        />
      
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 0, marginTop: 0 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  
  input: { borderWidth: 1, borderRadius: 5, padding: 10, marginBottom: 10, height: 50, fontSize: 18},
  scrollview: { flex: 1},
  HeaderGradient: {
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
  Header: {fontSize: 24,color: 'white',fontWeight: '700',},
  headerTopRow: {flexDirection: 'row',justifyContent: 'space-between',alignItems: 'center',},


  addTaskHeader: {paddingTop: 20, fontSize: 24, fontWeight:'bold', paddingLeft: 10,},
  taskInputSection: {paddingTop: 10, paddingLeft:10, paddingRight: 10},
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 30,
    alignItems: 'center',
    alignSelf: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Android shadow
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  
  
  task: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginVertical: 6,
    marginHorizontal: 12,
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  taskText: {fontSize: 18,color: '#333',fontWeight:500,},
  done: { textDecorationLine: 'line-through', color: 'gray' },



})
