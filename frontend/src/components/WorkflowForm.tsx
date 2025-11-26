import { useState } from 'react';
import axios from 'axios';
import { X, CheckCircle, AlertCircle, Tag } from 'lucide-react';

interface WorkflowFormProps {
    onClose: () => void;
    onSave: () => void;
    creatorEmail: string; 
}

const WorkflowForm = ({ onClose, onSave, creatorEmail }: WorkflowFormProps) => {
    const [name, setName] = useState("");
    const [status, setStatus] = useState("Running");
    const [schedule, setSchedule] = useState("* * * * *");
    // DEFAULT TAGS: Empty string now, user will provide
    const [tagsInput, setTagsInput] = useState(""); 
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (!name.trim() || !creatorEmail) {
            setError("Workflow Name and Creator Email are required.");
            setLoading(false);
            return;
        }
        
        // FIX 1: Convert comma-separated string to array
        const tagsArray = tagsInput.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag.length > 0);

        try {
            const payload = { 
                name, 
                owner: creatorEmail, 
                userEmail: creatorEmail,
                status, 
                schedule,
                tags: tagsArray // Sending user-defined tags
            }; 
            
            const res = await axios.post('http://localhost:5000/api/workflows', payload);
            
            if (res.status === 200 || res.status === 201) { 
                onSave(); 
                onClose(); 
            } else {
                 setError(`Submission failed with status: ${res.status}`);
            }
        } catch (err: any) {
            console.error("Submission Error:", err);
            setError(err.response?.data?.message || `API Error. Status: ${err.response?.status || 'N/A'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative overflow-hidden animate-fade-in">
                
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-gray-800">Create New Workflow</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Assigned to: <span className="font-semibold text-gray-600">{creatorEmail}</span></p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Workflow Name */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Workflow Name</label>
                        <input 
                            autoFocus
                            value={name} 
                            onChange={e => setName(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" 
                            placeholder="e.g. Daily Data Cleanup" 
                            required 
                        />
                    </div>

                    {/* TAGS FIELD (User Input) */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <Tag size={14} className="inline"/> Tags (Required Field/Context)
                        </label>
                        <input 
                            value={tagsInput} 
                            onChange={e => setTagsInput(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm" 
                            placeholder="e.g. spark, kubernetes, reporting"
                            required // Ensuring user enters at least one tag/context
                        />
                        <p className="text-[10px] text-gray-400 mt-1.5">Enter context tags separated by commas (e.g., tag1, tag2)</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-5">
                        {/* Status Field */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Initial Status</label>
                            <div className="relative">
                                <select 
                                    value={status} 
                                    onChange={e => setStatus(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none text-sm"
                                >
                                    <option value="Running">Running</option>
                                    <option value="Paused">Paused</option>
                                    <option value="Completed">Completed</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div>
                        </div>

                        {/* Schedule Field */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Schedule (Cron)</label>
                            <input 
                                value={schedule} 
                                onChange={e => setSchedule(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors" 
                                placeholder="* * * * *" 
                            />
                        </div>
                    </div>

                    
                    <p className="text-xs text-gray-400 mt-1.5 pt-4 border-t border-gray-100">Owner is automatically set to your email ({creatorEmail}) for security.</p>

                    {/* Footer Actions */}
                    <div className="pt-2 flex justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors text-sm"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="px-6 py-2.5 bg-[#1a3b6e] hover:bg-blue-800 text-white font-medium rounded-lg shadow-md transition-all disabled:opacity-70 flex items-center gap-2 text-sm"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={16} /> Create Job
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default WorkflowForm;