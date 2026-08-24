import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

function App() { 
  const [todo, setTodo] = useState("")
  const [todos, setTodos] = useState([])
  const [category, setCategory] = useState("Work")
  const [filter, setFilter] = useState("All")
  
  // Nayi states editing ko secure karne ke liye
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState(null)

  // 1. Load from LocalStorage
  useEffect(() => {
    let todoString = localStorage.getItem("todos")
    if (todoString) {
      let savedTodos = JSON.parse(localStorage.getItem("todos")) 
      setTodos(savedTodos)
    }
  }, [])

  const saveToLS = (updatedTodos) => {
    localStorage.setItem("todos", JSON.stringify(updatedTodos))
  }

  // 2. Safe Edit Handler (Task list se foran gayab nahi hoga)
  const handleEdit = (e, id) => { 
    let t = todos.find(i => i.id === id) 
    setTodo(t.todo)
    setCategory(t.category || "Work")
    setIsEditing(true)
    setEditId(id)
  }

  // 3. Delete Task
  const handleDelete = (e, id) => {  
    let newTodos = todos.filter(item => item.id !== id) 
    setTodos(newTodos) 
    saveToLS(newTodos)
  }

  // 4. Add or Update Task Handler
  const handleSave = () => {
    if (todo.trim().length <= 3) return;

    if (isEditing) {
      // Agar editing chal rahi hai, toh usi ID wale task ko update kar do
      let newTodos = todos.map(item => {
        if (item.id === editId) {
          return { ...item, todo, category };
        }
        return item;
      })
      setTodos(newTodos)
      saveToLS(newTodos)
      setIsEditing(false)
      setEditId(null)
    } else {
      // Naya task add karna
      let newTodos = [...todos, { id: uuidv4(), todo, category, isCompleted: false }]
      setTodos(newTodos)
      saveToLS(newTodos)
    }

    setTodo("") 
    setCategory("Work")
  }
  
  const handleChange = (e) => { 
    setTodo(e.target.value)
  }

  const handleCheckbox = (e) => { 
    let id = e.target.name;  
    let index = todos.findIndex(item => item.id === id) 
    let newTodos = [...todos];
    newTodos[index].isCompleted = !newTodos[index].isCompleted;
    setTodos(newTodos)
    saveToLS(newTodos)
  }

  const filteredTodos = todos.filter(item => {
    if (filter === 'Active') return !item.isCompleted;
    if (filter === 'Completed') return item.isCompleted;
    return true;
  })

  const getCategoryBadge = (cat) => {
    if (cat === 'Work') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (cat === 'Study') return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }

  return (
    <div className="min-h-screen bg-violet-950 text-white flex flex-col items-center py-10 px-4">
      <div className="mx-3 md:container md:mx-auto my-5 rounded-2xl p-6 bg-violet-100 text-slate-900 min-h-[80vh] md:w-[45%] shadow-2xl">
        <h1 className='font-bold text-center text-3xl mb-4'>iTask - Pro Manager</h1>
        
        {/* Add/Edit Todo Section */}
        <div className="addTodo my-5 flex flex-col gap-3">
          <h2 className='text-xl font-bold'>{isEditing ? 'Edit Todo' : 'Add a Todo'}</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <input 
              onChange={handleChange} 
              value={todo} 
              type="text" 
              placeholder="Type a task (min 4 characters)..."
              className='w-full rounded-xl px-4 py-2 border border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-600 bg-white text-sm' 
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className='px-3 py-2 border border-violet-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 bg-white text-sm font-medium text-slate-700'
            >
              <option value="Work">💼 Work</option>
              <option value="Study">📚 Study</option>
              <option value="Personal">🏡 Personal</option>
            </select>
            <button 
              onClick={handleSave} 
              disabled={todo.trim().length <= 3} 
              className={`px-5 rounded-xl py-2 text-sm font-bold text-white transition-all cursor-pointer flex-shrink-0 disabled:bg-violet-400 ${
                isEditing ? 'bg-amber-600 hover:bg-amber-700' : 'bg-violet-800 hover:bg-violet-950'
              }`}
            >
              {isEditing ? 'Update' : 'Save'}
            </button>
          </div>
        </div>

        {/* Filtering Tabs */}
        <div className="flex gap-2 my-4 bg-violet-200 p-1.5 rounded-xl border border-violet-300">
          {['All', 'Active', 'Completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                filter === tab 
                  ? 'bg-violet-800 text-white shadow' 
                  : 'text-violet-700 hover:bg-violet-300/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className='h-[1px] bg-black opacity-15 w-[90%] mx-auto my-4'></div>

        {/* Your Todos Section */}
        <h2 className='text-xl font-bold mb-3'>Your Todos ({filteredTodos.length})</h2>
        <div className="todos space-y-3">
          {filteredTodos.length === 0 && <div className='text-gray-500 text-sm py-4 text-center'>No Todos to display in this view</div>}
          
          {filteredTodos.map(item => {
            return (
              <div key={item.id} className="todo flex items-center justify-between bg-white p-3.5 rounded-xl shadow-sm border border-violet-200">
                <div className='flex items-center gap-3 overflow-hidden'> 
                  <input 
                    name={item.id} 
                    onChange={handleCheckbox} 
                    type="checkbox" 
                    checked={item.isCompleted} 
                    className="w-4 h-4 accent-violet-700 cursor-pointer flex-shrink-0"
                  />
                  <div className="overflow-hidden">
                    <div className={`text-sm truncate ${item.isCompleted ? "line-through text-gray-400" : "text-slate-800"}`}>
                      {item.todo}
                    </div>
                    <span className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-md border font-medium ${getCategoryBadge(item.category)}`}>
                      {item.category || 'Work'}
                    </span>
                  </div>
                </div>
                
                <div className="buttons flex items-center gap-2 flex-shrink-0">
                  <button 
                    onClick={(e) => handleEdit(e, item.id)} 
                    className='bg-violet-800 hover:bg-violet-950 px-3 py-1.5 text-xs font-bold text-white rounded-lg transition-colors'
                  >
                    Edit
                  </button>
                  <button 
                    onClick={(e) => handleDelete(e, item.id)} 
                    className='bg-rose-600 hover:bg-rose-700 px-3 py-1.5 text-xs font-bold text-white rounded-lg transition-colors'
                  >
                    Delete
                  </button>
                </div> 
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default App