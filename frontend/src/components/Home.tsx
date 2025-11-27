import { useState, useEffect } from 'react';
import axios from 'axios';
import { LogOut,  Search, Plus, ChevronDown } from 'lucide-react';
import Sidebar from './Sidebar';
import WorkflowForm from './WorkflowForm';


interface Workflow {
  id: string;
  name: string;
  tags: string[];
  status: string;
  owner: string;
  runs: string[];
  schedule: string;
  nextRun: string;
}

interface HomeProps {
    userEmail: string;
    username: string;
    token: string;
    onLogout: () => void;
    API_BASE_URL: string;
}

const Home = ({ userEmail, username, onLogout, API_BASE_URL }: HomeProps) => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [filterStatus, setFilterStatus] = useState('All'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('latest'); 

  // Function to refresh data from DB
  const fetchWorkflows = () => {
    if (!userEmail) return; 

    axios.get(`${API_BASE_URL}/api/workflows?userEmail=${userEmail}`)
      .then(res => setWorkflows(res.data))
      .catch(err => console.error("Workflow Fetch Error:", err));
  };

  useEffect(() => {
    fetchWorkflows();
  }, [userEmail, API_BASE_URL]);

  // Status Toggle Handler
  const handleStatusToggle = async (workflowId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Running' ? 'Paused' : 'Running';
    
    setWorkflows(workflows.map(wf => 
        wf.id === workflowId ? { ...wf, status: newStatus } : wf
    ));

    try {
        await axios.put(`${API_BASE_URL}/api/workflows/${workflowId}/status`, { newStatus });
        fetchWorkflows(); 
    } catch (error: any) {
        const errorDetails = error.response?.data?.details || error.message || "Unknown Error";
        console.error(" Server Toggle Error:", errorDetails); 
        alert(`Failed to update status. Reason: ${errorDetails.substring(0, 100)}`); 
        fetchWorkflows();
    }
  };
  
  // LOGIC: Filter and Sort Workflows
  const filteredWorkflows = workflows.filter(wf => {
      let statusMatch = true;
      if (filterStatus === 'Active') {
          statusMatch = wf.status === 'Running';
      } else if (filterStatus === 'Paused') {
          statusMatch = wf.status === 'Paused';
      } else if (filterStatus !== 'All') {
          statusMatch = wf.status === filterStatus; 
      }
      
      const searchLower = searchTerm.toLowerCase();
      const searchMatch = wf.name.toLowerCase().includes(searchLower) ||
                          wf.owner.toLowerCase().includes(searchLower) ||
                          wf.tags.some(tag => tag.toLowerCase().includes(searchLower)); 
                          
      return statusMatch && searchMatch;
  }).sort((a, b) => {
      const idA = a.id;
      const idB = b.id;
      
      if (sortOrder === 'latest') {
          return idA < idB ? 1 : idA > idB ? -1 : 0; 
      } else {
          return idA < idB ? -1 : idA > idB ? 1 : 0; 
      }
  });

  
  // Function to determine badge class
  const getBadgeClass = (status: string, currentFilter: string) => {
      const base = "px-4 py-1.5 text-sm font-semibold rounded-full cursor-pointer transition-colors border";
      const isActive = status === currentFilter;
      
      let colorClass = '';
      if (status === 'All') colorClass = isActive ? 'bg-gray-800 text-white border-gray-800' : 'text-gray-700 hover:bg-gray-100 border-gray-300';
      if (status === 'Active') colorClass = isActive ? 'bg-green-600 text-white border-green-600' : 'text-green-700 hover:bg-green-50 border-green-300';
      if (status === 'Paused') colorClass = isActive ? 'bg-yellow-600 text-white border-yellow-600' : 'text-yellow-700 hover:bg-yellow-50 border-yellow-300';
      
      return `${base} ${colorClass}`;
  }


  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : "U";

  return (
    <div className="flex h-screen bg-[#f3f4f6]">
      
      <Sidebar onCreateClick={() => setShowCreateModal(true)} />

      {showCreateModal && (
          <WorkflowForm 
            onClose={() => setShowCreateModal(false)} 
            onSave={fetchWorkflows} 
            creatorEmail={userEmail}
            API_BASE_URL={API_BASE_URL} 
          />
      )}

      <main className="flex-1 overflow-y-auto flex flex-col">
         
         {/* HEADER - Inline Navbar Logic */}
         <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Workflow List</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your data pipelines and jobs</p>
            </div>
            <div className="flex items-center gap-6">
                <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    {/* Top Right Search (Decorative) */}
                    <input type="text" placeholder="Search data..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-full w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-sm" />
                </div>
                {/* Profile Section */}
                <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-gray-800">{username}</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-md border-2 border-white text-lg">{initial}</div>
                    <button onClick={onLogout} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><LogOut size={20}/></button>
                </div>
            </div>
         </header>

         <div className="px-8 py-6">
            
            {/* --- STATUS FILTER TABS (FIXED onClick) --- */}
            <div className="mb-6 flex gap-3 border-b border-gray-200 pb-3">
                <button 
                    onClick={() => { setFilterStatus('All'); setSearchTerm(''); }} 
                    className={getBadgeClass('All', filterStatus)}
                >
                    All ({workflows.length})
                </button>
                <button 
                    onClick={() => { setFilterStatus('Active'); setSearchTerm(''); }} 
                    className={getBadgeClass('Active', filterStatus)}
                >
                    Active ({workflows.filter(wf => wf.status === 'Running').length})
                </button>
                <button 
                    onClick={() => { setFilterStatus('Paused'); setSearchTerm(''); }} 
                    className={getBadgeClass('Paused', filterStatus)}
                >
                    Paused ({workflows.filter(wf => wf.status === 'Paused').length})
                </button>
            </div>
            {/* --- END STATUS FILTER TABS --- */}


            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="relative w-full md:w-1/2">
                    <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                    {/* FUNCTIONAL SEARCH BAR */}
                    <input 
                        type="text" 
                        placeholder="Search workflow and tasks..." 
                        className="w-full pl-10 p-2.5 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)} 
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto justify-end">
                    
                    {/* Sorting Dropdown */}
                    <div className="relative">
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="appearance-none px-4 py-2 border border-gray-300 bg-white rounded-lg text-sm font-medium text-gray-700 pr-8 focus:ring-1 focus:ring-blue-500"
                        >
                            <option value="latest">Sort by: Latest</option>
                            <option value="older">Sort by: Older</option>
                        </select>
                        <ChevronDown className="absolute right-2.5 top-2.5 text-gray-500 pointer-events-none" size={16} />
                    </div>

                    <button 
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-[#1a3b6e] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-900 shadow-sm"
                    >
                        <Plus size={18} /> Create Workflow
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">State</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Name</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Owner</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Runs</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Schedule</th>
                        <th className="p-4 text-xs font-bold text-gray-500 uppercase">Next Run</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {filteredWorkflows.map(wf => (
                        <tr key={wf.id} className="hover:bg-blue-50/30 transition-colors">
                            <td className="p-4 cursor-pointer" onClick={() => handleStatusToggle(wf.id, wf.status)}>
                                <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${wf.status === 'Running' ? 'bg-green-400' : 'bg-gray-300'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${wf.status === 'Running' ? 'translate-x-4' : ''}`}></div>
                                </div>
                                <span className="text-xs text-gray-500 mt-1 block">Click to {wf.status === 'Running' ? 'Pause' : 'Run'}</span>
                            </td>
                            <td className="p-4 font-semibold text-gray-900">
                                <div className="text-base">{wf.name}</div>
                                <div className="flex gap-2 mt-1.5">
                                    {wf.tags.map(tag => (
                                        <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] uppercase font-bold tracking-wide rounded border border-blue-100">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </td>
                            <td className="p-4"><span className="px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-600">{wf.owner}</span></td>
                            
                            <td className="p-4 flex gap-1 items-center">
                                {wf.runs.slice(0, 4).map((run, i) => (
                                    <div 
                                        key={i} 
                                        className={`w-2 h-2 rounded-full ${run === 'success' ? 'bg-green-500' : run === 'pending' ? 'bg-gray-300' : 'bg-red-500'}`} 
                                        title={run}
                                    ></div>
                                ))}
                                {Array.from({ length: 4 - wf.runs.length }).map((_, i) => (
                                    <div key={`placeholder-${i}`} className="w-2 h-2 rounded-full bg-gray-200" title="No run data"></div>
                                ))}
                            </td>

                            <td className="p-4 font-mono text-xs text-gray-500 bg-gray-50 rounded inline-block my-3 mx-2 border px-2 py-1">{wf.schedule}</td>
                            <td className="p-4 text-sm text-gray-600">{wf.nextRun}</td>
                        </tr>
                    ))}
                </tbody>
                </table>
                {filteredWorkflows.length === 0 && (
                    <div className="p-6 text-center text-gray-500">No workflows found for the status: {filterStatus}</div>
                )}
            </div>
         </div>
      </main>
    </div>
  );
};

export default Home;