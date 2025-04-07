import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { supabase } from '../supabase';
import { Ionicons } from '@expo/vector-icons';

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
      <Text style={styles.title}>My Tasks</Text>

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

      <TextInput
        placeholder="New Task"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TouchableOpacity onPress={addTask} style={styles.button}>
        <Text style={styles.buttonText}>Add Task</Text>
      </TouchableOpacity>

      <Text style={styles.summary}>{`${completedCount}/${totalCount} tasks completed`}</Text>

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
  container: { flex: 1, padding: 20, marginTop: 30 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  taskItem: { padding: 10, borderBottomWidth: 1, borderColor: '#ccc' },
  taskText: { fontSize: 16 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 5 },
  button: { backgroundColor: '#2f95dc', padding: 10, marginTop: 10, borderRadius: 5 },
  buttonText: { color: 'white', textAlign: 'center' },
  input: { borderWidth: 1, padding: 10, borderRadius: 5, marginTop: 10 },
  editContainer: { marginTop: 20 },
  summary: { textAlign: 'center', marginTop: 15, fontSize: 16, fontWeight: '500' },
});
