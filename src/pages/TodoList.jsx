import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaCheck,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";

const TodoList = () => {
  const [tasks, setTasks] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deadlineValue, setDeadlineValue] = useState("");
  const [loadingCompletedTasks, setLoadingCompletedTasks] = useState(true);

  const apiUrl = "http://localhost:8000/api";
  async function getTasks() {
    try {
      const response = await axios.get(`${apiUrl}/tasks`);
      if (response.data.status === "Success") {
        // Filter tasks to get only those that are not completed
        const Tasks = response.data.data.filter(
          (task) => task.completed === false
        );
        setTasks(Tasks);
      } else {
        console.error("Error fetching tasks:", response.data.message);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  }

  async function getCompletedTasks() {
    try {
      const response = await axios.get(`${apiUrl}/tasks`);
      if (response.data.status === "Success") {
        // Filter tasks to get only those that are completed
        const CompletedTasks = response.data.data.filter(
          (task) => task.completed === true
        );
        setCompletedTasks(CompletedTasks);
        setLoadingCompletedTasks(false);
      } else {
        console.error("Error fetching tasks:", response.data.message);
        setLoadingCompletedTasks(false);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  }

  const addTask = async () => {
    if (newTask.trim() !== "") {
      try {
        // Prepare the task data matching the API's expected structure
        const newTaskObj = {
          text: newTask,
          deadline: null,
        };

        // Send POST request to create a new task
        const response = await axios.post(`${apiUrl}/tasks`, newTaskObj);
        setLoading(true);

        if (response.data.status === "Success") {
          setTasks([...tasks, response.data.data]);
          setNewTask("");
          getTasks();
        } else {
          console.error("Error adding task:", response.data.message);
        }
      } catch (error) {
        console.error("Error adding task:", error);
      }
    }
  };

  const deleteTask = async (id) => {
    try {
      const response = await axios.delete(`${apiUrl}/tasks/${id}`);
      setLoading(true);

      setTasks(tasks.filter((task) => task.id !== id));
      getTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const deleteSubTask = async (id, subtask_id) => {
    try {
      const response = await axios.delete(
        `${apiUrl}/tasks/${id}/subtasks/${subtask_id}`
      );
      setLoading(true);

      setTasks(tasks.filter((task) => task.id !== id));
      getTasks();
    } catch (error) {
      console.error("Error deleting subtask:", error);
    }
  };

  const deleteCompletedTask = async (id) => {
    try {
      const response = await axios.delete(`${apiUrl}/tasks/${id}`);
      setLoadingCompletedTasks(true);

      getCompletedTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const editTask = (task) => {
    setEditingTask({ ...task });
  };

  const updateTask = async () => {
    try {
      const response = await axios.put(`${apiUrl}/tasks/${editingTask.id}`, {
        text: editingTask.text,
      });
      setLoading(true);

      if (response.data.status === "Success") {
        setTasks(
          tasks.map((t) => (t.id === editingTask.id ? response.data.data : t))
        );
        setEditingTask(null);
        getTasks();
      } else {
        console.error("Error updating task:", response.data.message);
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const toggleTaskCompletion = async (id) => {
    try {
      const taskToComplete = tasks.find((task) => task.id === id);

      // Check if all subtasks are completed before allowing task completion
      if (taskToComplete.subtasks.every((subtask) => subtask.completed)) {
        const response = await axios.post(
          `${apiUrl}/tasks/${id}/toggle-complete`
        );
        setLoading(true);

        if (response.data.status === "Success") {
          setTasks(
            tasks.map((task) =>
              task.id === id ? { ...task, completed: !task.completed } : task
            )
          );
          setCompletedTasks([...completedTasks, response.data.data]);
          getTasks();
        } else {
          console.error(
            "Error toggling task completion:",
            response.data.message
          );
        }
      } else {
        alert("Complete all sub-tasks first!");
      }
    } catch (error) {
      console.error("Error toggling task completion:", error);
    }
  };

  const addDeadline = async (id, deadline) => {
    try {
      const formattedDeadline = new Date(deadline).toISOString();
      const response = await axios.put(`${apiUrl}/tasks/${id}`, {
        deadline: formattedDeadline,
      });
      setLoading(true);

      if (response.data.status === "Success") {
        setTasks(tasks.map((task) => (task.id === id ? response.data : task)));
        getTasks();
      }
    } catch (error) {
      console.error("Error updating task deadline:", error);
    }
  };

  const addSubTask = async (taskId, subTaskText) => {
    try {
      const response = await axios.post(`${apiUrl}/tasks/${taskId}/subtasks`, {
        text: subTaskText,
        completed: false,
      });
      setLoading(true);

      if (response.data.status === "Success") {
        setTasks(
          tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: [...task.subtasks, response.data.data],
                }
              : task
          )
        );
        getTasks();
      } else {
        console.error("Error adding subtask:", response.data.message);
      }
    } catch (error) {
      console.error("Error adding subtask:", error);
    }
  };

  const toggleSubTaskCompletion = async (taskId, subtaskId) => {
    try {
      // Find the task and subtask for current completion status
      const taskToUpdate = tasks.find((task) => task.id === taskId);
      const subTaskToUpdate = taskToUpdate.subtasks.find(
        (subtask) => subtask.id === subtaskId
      );

      const response = await axios.put(
        `${apiUrl}/tasks/${taskId}/subtasks/${subtaskId}`,
        {
          completed: !subTaskToUpdate.completed,
        }
      );
      setLoading(true);

      if (response.data.status === "Success") {
        setTasks(
          tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  subtasks: task.subtasks.map((subtask) =>
                    subtask.id === subtaskId
                      ? { ...subtask, completed: !subtask.completed }
                      : subtask
                  ),
                }
              : task
          )
        );
        getTasks();
      } else {
        console.error(
          "Error toggling subtask completion:",
          response.data.message
        );
      }
    } catch (error) {
      console.error("Error toggling subtask completion:", error);
    }
  };

  const calculateProgress = (task) => {
    if (task.subtasks.length === 0) return 0;
    const completedsubtasks = task.subtasks.filter(
      (subTask) => subTask.completed
    ).length;
    return Math.round((completedsubtasks / task.subtasks.length) * 100);
  };

  const isTaskOverdue = (task) => {
    return task.deadline && new Date() > new Date(task.deadline);
  };

  useEffect(() => {
    getTasks();
    getCompletedTasks();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Prasasti Todo List
      </h1>

      {/* Add Task Form */}
      <div className="flex mb-6">
        <input
          type="text"
          className="flex-grow p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
        />
        <button
          onClick={addTask}
          className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <FaPlus size={24} />
        </button>
      </div>

      {/* Task List */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Ongoing Tasks</h2>
        {loading ? (
          <p>Loading...</p>
        ) : tasks.length === 0 ? (
          <p className="text-gray-500">No data available.</p>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="mb-4 p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`flex-grow ${
                    task.completed ? "line-through text-gray-500" : ""
                  }`}
                >
                  {task.text}
                </span>
                <div className="flex items-center">
                  <button
                    onClick={() => editTask(task)}
                    className="mr-2 text-blue-500 hover:text-blue-700"
                  >
                    <FaEdit size={20} />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="mr-2 text-red-500 hover:text-red-700"
                  >
                    <FaTrash size={20} />
                  </button>
                  <button
                    onClick={() => toggleTaskCompletion(task.id)}
                    className="text-green-500 hover:text-green-700"
                  >
                    <FaCheck size={20} />
                  </button>
                </div>
              </div>

              {/* Deadline */}
              <div className="mb-2">
                <input
                  type="datetime-local"
                  value={deadlineValue}
                  onChange={(e) => setDeadlineValue(e.target.value)}
                  className="p-1 border rounded"
                />
                <button
                  onClick={() => {
                    if (deadlineValue) {
                      addDeadline(task.id, deadlineValue);
                      setDeadlineValue("");
                    }
                  }}
                  className="ml-2 p-1 bg-blue-500 text-white rounded"
                >
                  Add Deadline
                </button>
                {task.deadline && (
                  <span className="ml-2">
                    {isTaskOverdue(task) ? (
                      <FaExclamationTriangle className="text-red-500 inline" />
                    ) : (
                      <FaClock className="text-yellow-500 inline" />
                    )}
                    {new Date(task.deadline).toLocaleString("id-ID")}
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${calculateProgress(task)}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-600">
                Progress: {calculateProgress(task)}%
              </span>

              {/* Sub-tasks */}
              <div className="mt-2">
                <h3 className="font-semibold">Sub-tasks:</h3>
                {task.subtasks.map((subTask) => (
                  <div key={subTask.id} className="flex items-center mt-1">
                    <input
                      type="checkbox"
                      checked={subTask.completed}
                      onChange={() =>
                        toggleSubTaskCompletion(task.id, subTask.id)
                      }
                      className="mr-2"
                    />
                    <span
                      className={
                        subTask.completed ? "line-through text-gray-500" : ""
                      }
                    >
                      {subTask.text}
                    </span>
                    <button
                      onClick={() => deleteSubTask(task.id, subTask.id)}
                      className="ml-2 text-red-500 hover:text-red-700"
                      aria-label="Delete sub-task"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
                <input
                  id={`subtask-input-${task.id}`}
                  type="text"
                  placeholder="Add sub-task"
                  className="mt-1 p-1 border rounded flex-grow"
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && e.target.value.trim() !== "") {
                      addSubTask(task.id, e.target.value.trim());
                      e.target.value = "";
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector(
                      `#subtask-input-${task.id}`
                    );
                    if (input && input.value.trim() !== "") {
                      addSubTask(task.id, input.value.trim());
                      input.value = "";
                    }
                  }}
                  className="ml-2 bg-blue-500 text-white rounded p-1 hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Completed Tasks */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Completed Tasks</h2>
        {loadingCompletedTasks ? (
          <p>Loading...</p>
        ) : completedTasks.length === 0 ? (
          <p className="text-gray-500">No data available.</p>
        ) : (
          completedTasks.map((task) => (
            <div
              key={task.id}
              className="mb-2 p-2 bg-gray-100 rounded flex items-center justify-between"
            >
              <span className="line-through text-gray-500">{task.text}</span>
              <button
                onClick={() => deleteCompletedTask(task.id)}
                className="ml-2 text-red-500 hover:text-red-700"
                aria-label={`Delete ${task.text}`}
              >
                <FaTrash />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Edit Task</h2>
            <input
              type="text"
              value={editingTask.text}
              onChange={(e) =>
                setEditingTask({ ...editingTask, text: e.target.value })
              }
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setEditingTask(null)}
                className="mr-2 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={updateTask}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TodoList;
