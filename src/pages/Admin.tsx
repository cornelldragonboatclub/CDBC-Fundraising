import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Download, Trash2, Check, X, Edit3, Save, ArrowLeft, Folder, Users, DollarSign, Home, Trophy, Edit } from 'lucide-react';

export default function Admin() {
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [submissions, setSubmissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Editing states
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [tempNote, setTempNote] = useState('');
    const [editingRowId, setEditingRowId] = useState<string | null>(null);
    const [editFormData, setEditFormData] = useState<any>({});
    
    const [selectedFormId, setSelectedFormId] = useState<string | null>(null);

    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            });
            if (res.ok) {
                setIsAuthenticated(true);
                fetchSubmissions(password);
            } else {
                setError('Invalid password');
                setPassword(''); // Reset password on failure
            }
        } catch (err) {
            setError('Login failed');
            setPassword('');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setPassword('');
        setSubmissions([]);
        setSelectedFormId(null);
    };

    const fetchSubmissions = async (passToUse = password) => {
        try {
            const res = await fetch('/api/admin/submissions', {
                headers: { 'Authorization': passToUse }
            });
            if (res.ok) {
                const data = await res.json();
                setSubmissions(data.submissions);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdate = async (id: string, updates: any) => {
        try {
            const res = await fetch('/api/admin/update', {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': password
                },
                body: JSON.stringify({ id, updates })
            });
            if (res.ok) {
                setSubmissions(prev => prev.map(sub => sub._id === id ? { ...sub, ...updates } : sub));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this submission?')) return;
        try {
            const res = await fetch('/api/admin/delete', {
                method: 'DELETE',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': password
                },
                body: JSON.stringify({ id })
            });
            if (res.ok) {
                setSubmissions(prev => prev.filter(sub => sub._id !== id));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const startEditingRow = (sub: any) => {
        setEditingRowId(sub._id);
        setEditFormData({ ...sub });
    };

    const saveRowEdit = async () => {
        if (!editingRowId) return;
        const { _id, ...updatesToSave } = editFormData;
        await handleUpdate(editingRowId, updatesToSave);
        setEditingRowId(null);
    };

    const formStats = useMemo(() => {
        const stats: Record<string, { count: number, totalRevenue: number, totalOrders: number, formId: string }> = {
            'che-thai': { count: 0, totalRevenue: 0, totalOrders: 0, formId: 'che-thai' }
        };
        submissions.forEach(sub => {
            const id = sub.formId || 'che-thai';
            if (!stats[id]) {
                stats[id] = { count: 0, totalRevenue: 0, totalOrders: 0, formId: id };
            }
            stats[id].count += 1;
            stats[id].totalRevenue += (sub.totalCost || 0);
            stats[id].totalOrders += (sub.quantity || 0);
        });
        return Object.values(stats);
    }, [submissions]);

    const filteredSubmissions = selectedFormId 
        ? submissions.filter(s => (s.formId || 'che-thai') === selectedFormId)
        : [];

    const activeStats = useMemo(() => {
        if (!selectedFormId) return null;
        let revenue = 0;
        let totalOrders = 0;
        const refCounts: Record<string, { name: string, count: number }> = {};
        
        filteredSubmissions.forEach(sub => {
            revenue += (sub.totalCost || 0);
            totalOrders += (sub.quantity || 0);
            if (sub.referrals) {
                // Split by comma in case of multiple names, trim, and use lowercase for grouping
                const refs = sub.referrals.split(',').map((r: string) => r.trim()).filter(Boolean);
                refs.forEach((r: string) => {
                    const key = r.toLowerCase();
                    if (!refCounts[key]) refCounts[key] = { name: r, count: 0 };
                    refCounts[key].count += 1;
                });
            }
        });
        
        const leaderboard = Object.values(refCounts).sort((a, b) => b.count - a.count).slice(0, 5);
        return { revenue, totalOrders, leaderboard };
    }, [filteredSubmissions, selectedFormId]);

    const downloadCSV = () => {
        const dataToDownload = selectedFormId ? filteredSubmissions : submissions;
        if (dataToDownload.length === 0) return;
        
        const headers = ['Date', 'Form ID', 'Name', 'Email', 'Net ID', 'Quantity', 'Total Cost', 'Payment ID', 'Referrals', 'Paid', 'Picked Up', 'Notes'];
        const csvRows = [headers.join(',')];

        dataToDownload.forEach(sub => {
            const row = [
                new Date(sub.createdAt).toLocaleDateString(),
                sub.formId || 'che-thai',
                `"${sub.fullName}"`,
                sub.email,
                sub.netId,
                sub.quantity,
                sub.totalCost,
                `"${sub.paymentId}"`,
                `"${sub.referrals || ''}"`,
                sub.paid ? 'Yes' : 'No',
                sub.pickedUp ? 'Yes' : 'No',
                `"${sub.adminNotes || ''}"`
            ];
            csvRows.push(row.join(','));
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `submissions_${selectedFormId || 'all'}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4 relative">
                <Link 
                    to="/" 
                    className="absolute top-4 left-4 flex items-center space-x-1 text-sm font-medium text-stone-500 hover:text-stone-800 transition-colors bg-white px-3 py-1.5 rounded-full shadow-sm border border-stone-200"
                >
                    <Home size={14} />
                    <span>Home</span>
                </Link>
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
                    <h1 className="text-2xl font-bold text-stone-800 mb-6 text-center">Admin Login</h1>
                    <form onSubmit={handleLogin}>
                        <input 
                            type="password" 
                            placeholder="Enter club password" 
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full border border-stone-300 rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-red-500 outline-none"
                        />
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            {loading ? 'Checking...' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-100 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-stone-800">Admin Dashboard</h1>
                        <p className="text-stone-500">
                            {selectedFormId ? `Viewing submissions for: ${selectedFormId}` : 'Select a fundraiser to view data'}
                        </p>
                    </div>
                    <div className="flex space-x-4">
                        <Link 
                            to="/"
                            className="flex items-center space-x-2 bg-stone-200 text-stone-700 px-4 py-2 rounded-lg hover:bg-stone-300 transition-colors"
                        >
                            <Home size={18} />
                            <span className="hidden sm:inline">Home</span>
                        </Link>
                        {selectedFormId && (
                            <button 
                                onClick={downloadCSV}
                                className="flex items-center space-x-2 bg-stone-800 text-white px-4 py-2 rounded-lg hover:bg-stone-900 transition-colors"
                            >
                                <Download size={18} />
                                <span>Download CSV</span>
                            </button>
                        )}
                        <button 
                            onClick={handleLogout}
                            className="bg-stone-200 text-stone-700 px-4 py-2 rounded-lg hover:bg-stone-300 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {!selectedFormId ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {formStats.length === 0 ? (
                            <div className="col-span-full bg-white p-8 rounded-2xl shadow-sm border border-stone-200 text-center text-stone-500">
                                No submissions found in the database yet.
                            </div>
                        ) : (
                            formStats.map(stat => (
                                <div 
                                    key={stat.formId} 
                                    onClick={() => setSelectedFormId(stat.formId)}
                                    className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 hover:shadow-md hover:border-red-200 transition-all cursor-pointer group"
                                >
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
                                            <Folder size={20} />
                                        </div>
                                        <h2 className="text-xl font-bold text-stone-800 capitalize">{stat.formId.replace(/-/g, ' ')}</h2>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-stone-50 p-3 rounded-xl">
                                            <div className="flex items-center space-x-1 text-stone-500 mb-1">
                                                <Users size={14} />
                                                <span className="text-xs font-medium uppercase tracking-wider">Orders</span>
                                            </div>
                                            <div className="text-2xl font-bold text-stone-800">{stat.count}</div>
                                        </div>
                                        <div className="bg-stone-50 p-3 rounded-xl">
                                            <div className="flex items-center space-x-1 text-stone-500 mb-1">
                                                <DollarSign size={14} />
                                                <span className="text-xs font-medium uppercase tracking-wider">Revenue</span>
                                            </div>
                                            <div className="text-2xl font-bold text-green-600">${stat.totalRevenue.toFixed(2)}</div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Dashboard Stats Section */}
                        {activeStats && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex flex-col justify-center">
                                    <div className="flex items-center space-x-2 text-stone-500 mb-2">
                                        <DollarSign size={18} />
                                        <h3 className="font-bold uppercase tracking-wider text-sm">Total Revenue</h3>
                                    </div>
                                    <div className="text-4xl font-bold text-green-600">${activeStats.revenue.toFixed(2)}</div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 flex flex-col justify-center">
                                    <div className="flex items-center space-x-2 text-stone-500 mb-2">
                                        <Users size={18} />
                                        <h3 className="font-bold uppercase tracking-wider text-sm">Total Orders</h3>
                                    </div>
                                    <div className="text-4xl font-bold text-stone-800">{activeStats.totalOrders}</div>
                                </div>
                                <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
                                    <div className="flex items-center space-x-2 text-stone-500 mb-4">
                                        <Trophy size={18} className="text-yellow-500" />
                                        <h3 className="font-bold uppercase tracking-wider text-sm">Referral Leaderboard</h3>
                                    </div>
                                    {activeStats.leaderboard.length > 0 ? (
                                        <div className="flex flex-wrap gap-3">
                                            {activeStats.leaderboard.map((ref, idx) => (
                                                <div key={idx} className="flex items-center bg-stone-50 border border-stone-100 rounded-lg px-3 py-2">
                                                    <span className="font-bold text-stone-800 mr-2">{idx + 1}. {ref.name}</span>
                                                    <span className="bg-stone-200 text-stone-600 text-xs font-bold px-2 py-0.5 rounded-full">{ref.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-stone-400 text-sm italic">No referrals recorded yet.</p>
                                    )}
                                </div>
                            </div>
                        )}

                        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                            <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center">
                                <button 
                                    onClick={() => setSelectedFormId(null)}
                                    className="flex items-center space-x-2 text-stone-600 hover:text-stone-900 transition-colors font-medium"
                                >
                                    <ArrowLeft size={18} />
                                    <span>Back to Fundraisers</span>
                                </button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-white border-b border-stone-200 text-stone-600 text-sm">
                                            <th className="p-4 font-medium w-12">Edit</th>
                                            <th className="p-4 font-medium">Date</th>
                                            <th className="p-4 font-medium">Name</th>
                                            <th className="p-4 font-medium">Order</th>
                                            <th className="p-4 font-medium">Details</th>
                                            <th className="p-4 font-medium text-center">Paid</th>
                                            <th className="p-4 font-medium text-center">Picked Up</th>
                                            <th className="p-4 font-medium">Notes</th>
                                            <th className="p-4 font-medium text-center">Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        {filteredSubmissions.map((sub) => {
                                            const isEditing = editingRowId === sub._id;
                                            
                                            if (isEditing) {
                                                return (
                                                    <tr key={sub._id} className="bg-yellow-50/50">
                                                        <td className="p-4">
                                                            <div className="flex flex-col space-y-2">
                                                                <button onClick={saveRowEdit} className="text-green-600 hover:text-green-700 bg-green-100 p-1.5 rounded-md flex items-center justify-center" title="Save">
                                                                    <Save size={16} />
                                                                </button>
                                                                <button onClick={() => setEditingRowId(null)} className="text-red-500 hover:text-red-600 bg-red-100 p-1.5 rounded-md flex items-center justify-center" title="Cancel">
                                                                    <X size={16} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-sm text-stone-500">
                                                            {new Date(sub.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="p-4">
                                                            <input type="text" className="border border-stone-300 rounded px-2 py-1 text-sm w-full mb-1 outline-none focus:border-red-500" value={editFormData.fullName || ''} onChange={e => setEditFormData({...editFormData, fullName: e.target.value})} placeholder="Name" />
                                                            <input type="text" className="border border-stone-300 rounded px-2 py-1 text-xs w-full outline-none focus:border-red-500" value={editFormData.email || ''} onChange={e => setEditFormData({...editFormData, email: e.target.value})} placeholder="Email" />
                                                        </td>
                                                        <td className="p-4 text-sm">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <span className="text-stone-400 w-8">Qty:</span>
                                                                <input type="number" className="border border-stone-300 rounded px-2 py-1 text-sm w-16 outline-none focus:border-red-500" value={editFormData.quantity || 0} onChange={e => setEditFormData({...editFormData, quantity: Number(e.target.value), totalCost: Number(e.target.value) * 5})} />
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-stone-400 w-8">Total:</span>
                                                                <input type="number" className="border border-stone-300 rounded px-2 py-1 text-sm w-16 outline-none focus:border-red-500" value={editFormData.totalCost || 0} onChange={e => setEditFormData({...editFormData, totalCost: Number(e.target.value)})} />
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-sm">
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <span className="text-stone-400 w-8">NetID:</span>
                                                                <input type="text" className="border border-stone-300 rounded px-2 py-1 text-xs w-24 outline-none focus:border-red-500" value={editFormData.netId || ''} onChange={e => setEditFormData({...editFormData, netId: e.target.value})} />
                                                            </div>
                                                            <div className="flex items-center space-x-2 mb-1">
                                                                <span className="text-stone-400 w-8">Pay:</span>
                                                                <input type="text" className="border border-stone-300 rounded px-2 py-1 text-xs w-24 outline-none focus:border-red-500" value={editFormData.paymentId || ''} onChange={e => setEditFormData({...editFormData, paymentId: e.target.value})} />
                                                            </div>
                                                            <div className="flex items-center space-x-2">
                                                                <span className="text-stone-400 w-8">Ref:</span>
                                                                <input type="text" className="border border-stone-300 rounded px-2 py-1 text-xs w-24 outline-none focus:border-red-500" value={editFormData.referrals || ''} onChange={e => setEditFormData({...editFormData, referrals: e.target.value})} />
                                                            </div>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <input type="checkbox" className="w-4 h-4 text-red-600 rounded focus:ring-red-500" checked={editFormData.paid || false} onChange={e => setEditFormData({...editFormData, paid: e.target.checked})} />
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <input type="checkbox" className="w-4 h-4 text-red-600 rounded focus:ring-red-500" checked={editFormData.pickedUp || false} onChange={e => setEditFormData({...editFormData, pickedUp: e.target.checked})} />
                                                        </td>
                                                        <td className="p-4">
                                                            <textarea className="border border-stone-300 rounded px-2 py-1 text-sm w-full outline-none focus:border-red-500 min-h-[60px]" value={editFormData.adminNotes || ''} onChange={e => setEditFormData({...editFormData, adminNotes: e.target.value})} placeholder="Notes..." />
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <button disabled className="text-stone-300 cursor-not-allowed">
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            }

                                            return (
                                                <tr key={sub._id} className="hover:bg-stone-50 transition-colors">
                                                    <td className="p-4">
                                                        <button 
                                                            onClick={() => startEditingRow(sub)}
                                                            className="text-stone-400 hover:text-stone-600 transition-colors p-1.5 rounded-md hover:bg-stone-200"
                                                            title="Edit Row"
                                                        >
                                                            <Edit size={16} />
                                                        </button>
                                                    </td>
                                                    <td className="p-4 text-sm text-stone-500">
                                                        {new Date(sub.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="font-medium text-stone-800">{sub.fullName}</div>
                                                        <div className="text-xs text-stone-500">{sub.email}</div>
                                                    </td>
                                                    <td className="p-4 text-sm">
                                                        <div><span className="text-stone-400">Qty:</span> <span className="font-medium">{sub.quantity}</span></div>
                                                        <div><span className="text-stone-400">Total:</span> <span className="font-medium text-green-600">${sub.totalCost}</span></div>
                                                    </td>
                                                    <td className="p-4 text-sm">
                                                        <div><span className="text-stone-400">NetID:</span> {sub.netId}</div>
                                                        <div><span className="text-stone-400">Pay:</span> {sub.paymentId}</div>
                                                        {sub.referrals && <div><span className="text-stone-400">Ref:</span> {sub.referrals}</div>}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <button 
                                                            onClick={() => handleUpdate(sub._id, { paid: !sub.paid })}
                                                            className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-colors ${sub.paid ? 'bg-green-100 text-green-600' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'}`}
                                                        >
                                                            {sub.paid ? <Check size={16} /> : <X size={16} />}
                                                        </button>
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <button 
                                                            onClick={() => handleUpdate(sub._id, { pickedUp: !sub.pickedUp })}
                                                            className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-colors ${sub.pickedUp ? 'bg-green-100 text-green-600' : 'bg-stone-100 text-stone-400 hover:bg-stone-200'}`}
                                                        >
                                                            {sub.pickedUp ? <Check size={16} /> : <X size={16} />}
                                                        </button>
                                                    </td>
                                                    <td className="p-4">
                                                        {editingNoteId === sub._id ? (
                                                            <div className="flex items-center space-x-2">
                                                                <input 
                                                                    type="text" 
                                                                    value={tempNote}
                                                                    onChange={e => setTempNote(e.target.value)}
                                                                    className="border border-stone-300 rounded px-2 py-1 text-sm w-32 outline-none focus:border-red-500"
                                                                    autoFocus
                                                                />
                                                                <button 
                                                                    onClick={() => {
                                                                        handleUpdate(sub._id, { adminNotes: tempNote });
                                                                        setEditingNoteId(null);
                                                                    }}
                                                                    className="text-green-600 hover:text-green-700"
                                                                >
                                                                    <Save size={16} />
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center space-x-2 group">
                                                                <span className="text-sm text-stone-600 truncate max-w-[120px]">
                                                                    {sub.adminNotes || <span className="text-stone-400 italic">No notes</span>}
                                                                </span>
                                                                <button 
                                                                    onClick={() => {
                                                                        setTempNote(sub.adminNotes || '');
                                                                        setEditingNoteId(sub._id);
                                                                    }}
                                                                    className="text-stone-400 opacity-0 group-hover:opacity-100 hover:text-stone-600 transition-opacity"
                                                                >
                                                                    <Edit3 size={14} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-center">
                                                        <button 
                                                            onClick={() => handleDelete(sub._id)}
                                                            className="text-stone-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {filteredSubmissions.length === 0 && (
                                            <tr>
                                                <td colSpan={9} className="p-8 text-center text-stone-500">
                                                    No submissions found for this fundraiser.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
