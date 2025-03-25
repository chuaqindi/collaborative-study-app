// lib/screens/HomeScreen.tsx

import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native'
import { supabase } from '../supabase'

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
      <Text style={styles.title}>My Tasks</Text>

      <TextInput
        placeholder="Enter task title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <Button title="Add Task" onPress={addTask} />

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => toggleDone(item.id, item.is_done)}>
            <Text style={[styles.task, item.is_done && styles.done]}>
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 30 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderRadius: 5, padding: 10, marginBottom: 10 },
  task: { padding: 10, fontSize: 18 },
  done: { textDecorationLine: 'line-through', color: 'gray' },
})
