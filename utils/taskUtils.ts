export function getTaskCompletionCount(tasks) {
    const completedCount = tasks.filter(task => task.is_done).length;
    const totalCount = tasks.length;
    return { completedCount, totalCount };
  }
  