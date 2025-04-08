import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { supabase } from '../supabase';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';



export default function HomeScreen() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [editedTitle, setEditedTitle] = useState('');

  const fetchTasks = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    if (!userId) return;

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('id', { ascending: false });

    if (!error) setTasks(data || []);
    else console.error('Error fetching tasks:', error);
  };

  const addTask = async () => {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;
    
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
    Alert.alert('Error', 'Please enter a task.');
    return;
    }
    
    if (!userId || !title.trim()) return;

    

    const { error } = await supabase.from('tasks').insert({
      user_id: userId,
      title,
      is_done: false,
    });

    if (!error) {
      setTitle('');
      fetchTasks();
    } else {
      console.error('Error adding task:', error);
    }
  };

  const deleteTask = async (id: number) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) {
      console.error('Error deleting task:', error);
      return;
    }
    fetchTasks();
  };

  const toggleCompleted = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase.from('tasks').update({ is_done: !currentStatus }).eq('id', id);
    if (error) {
      console.error('Error toggling completion:', error);
      return;
    }
    fetchTasks();
  };

  const startEditing = (task: any) => {
    setEditingTask(task);
    setEditedTitle(task.title);
  };

  const saveEdit = async () => {
    if (!editingTask || !editedTitle.trim()) return;
    const { error } = await supabase
      .from('tasks')
      .update({ title: editedTitle })
      .eq('id', editingTask.id);

    if (error) {
      console.error('Error editing task:', error);
      return;
    }

    fetchTasks();
    setEditingTask(null);
    setEditedTitle('');
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const completedCount = tasks.filter(task => task.is_done).length;
  const totalCount = tasks.length;

  return (
    <View style={styles.container}>
      
    <LinearGradient colors={['#4f46e5', '#7c3aed']} 
                    style={styles.HeaderGradient} 
                    start={{ x: 0, y: 0 }} 
                    end={{ x: 1, y: 1 }}
                    >
      <View style={styles.headerTopRow}>
        <Text style={styles.Header}>🎯  My Tasks</Text>
      </View>
    </LinearGradient>

    <Text style = {styles.currentTaskHeader}>Current Tasks</Text>

    <FlatList
      data={tasks}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.taskItem}>
          <Text style={[styles.taskText, item.is_done && { textDecorationLine: 'line-through', color: 'gray' }]}>
            {item.title}
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={() => toggleCompleted(item.id, item.is_done)}>
              <Ionicons
                name={item.is_done ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={item.is_done ? 'green' : 'gray'}
              />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Ionicons name="trash" size={24} color="gray" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => startEditing(item)}>
              <Ionicons name="pencil" size={24} color="gray" />
            </TouchableOpacity>
          </View>
        </View>
        )}
      />

      <View style={styles.addTaskSection}>
      <Text style = {styles.addTaskHeader}>Add Tasks</Text>
      <TextInput
        placeholder="New Task"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
        placeholderTextColor={'black'}
      />

      <TouchableOpacity onPress={addTask} style={styles.button}>
        <Text style={styles.buttonText}>Add Task</Text>
      </TouchableOpacity>
      

      <Text style={styles.summary}>
      <Text style={styles.countText}>{`${completedCount}/${totalCount}`}</Text> tasks completed
      </Text>
      </View>
      {editingTask && (
        <View style={styles.editContainer}>
          <TextInput
            value={editedTitle}
            onChangeText={setEditedTitle}
            style={styles.input}
          />
          <TouchableOpacity onPress={saveEdit} style={styles.button}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 0, marginTop: 0 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  taskItem: { padding: 10, borderBottomWidth: 1, borderColor: '#ccc', marginTop: 20, },
  taskText: { fontSize: 16 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 5 },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 70,
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
  input: { borderWidth: 1, padding: 10, borderRadius: 5, marginTop: 10, marginLeft: 10, marginRight: 10 },
  editContainer: { marginTop: 20 },
  summary: {
    textAlign: 'center',
    marginTop: 5,          // to shift the 'add task' words up LOL
    marginBottom: 10,
    fontSize: 20,          // 🔼 Bigger text
    fontWeight: '600',     // Slightly bolder
    color: '#374151',      // Tailwind gray-700 (looks nice)

  },
  
  countText: {
    fontWeight: '800',
    color: '#10B981',      // Emerald green
    fontSize: 22,          // Make the number even more prominent
  },


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
  currentTaskHeader: {paddingTop: 20, fontSize: 24, fontWeight:'bold', paddingLeft: 10,},
  addTaskHeader: {paddingTop: 0, fontSize: 24, fontWeight:'bold', paddingLeft: 10,},

  addTaskSection: {
    backgroundColor: '#F3F4F6', // A soft background for separation (Tailwind gray-100)
    paddingTop: 10,
    paddingBottom: 0,
    paddingHorizontal: 10,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 8,
  },


});
