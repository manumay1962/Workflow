import { 
    Layout, Clock, Database, SlidersHorizontal, 
    Terminal, BarChart2, Plus, MonitorPlay, 
    Cpu, Library 
  } from 'lucide-react';
  
  const Sidebar = ({ onCreateClick }: { onCreateClick: () => void }) => {
    return (
      <aside className="w-64 bg-[#1a3b6e] text-white flex flex-col h-full font-sans">
        <div className="p-6 border-b border-blue-800">
          <h1 className="text-2xl font-bold tracking-wide">Nexus</h1>
        </div>
  
        <div className="px-4 mt-6 mb-2">
          <button 
              onClick={onCreateClick}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span className="font-medium">New</span>
          </button>
        </div>
  
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          
          <SidebarItem icon={<Layout size={20} />} label="Workspace" />
          <SidebarItem icon={<Clock size={20} />} label="Recent" />
          <SidebarItem icon={<Library size={20} />} label="Catalog" />
          <SidebarItem icon={<SlidersHorizontal size={20} />} label="Workflow" active />
          <SidebarItem icon={<Cpu size={20} />} label="Compute" />
  
          <div className="mt-6 mb-2 px-4 text-xs font-semibold text-blue-300 uppercase tracking-wider">
              SQL
          </div>
          <SidebarItem icon={<Database size={20} />} label="SQL Editor" />
          <SidebarItem icon={<BarChart2 size={20} />} label="Dashboard" />
  
          <div className="mt-6 mb-2 px-4 text-xs font-semibold text-blue-300 uppercase tracking-wider">
              Data Engineering
          </div>
          <SidebarItem icon={<MonitorPlay size={20} />} label="Job Runs" />
          <SidebarItem icon={<Terminal size={20} />} label="Play Ground" />
  
        </nav>
  
        <div className="p-4 border-t border-blue-800 text-sm text-blue-200 text-center">
          v1.0.2
        </div>
      </aside>
    );
  };
  
  const SidebarItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
    <div 
      className={`flex items-center gap-3 px-4 py-2.5 rounded cursor-pointer transition-colors ${
        active 
          ? 'bg-blue-800 text-white border-r-4 border-blue-400' 
          : 'text-blue-100 hover:bg-blue-800/50 hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </div>
  );
  
  export default Sidebar;