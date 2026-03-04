import { useState, useEffect } from 'react';
import { MessageSquare, Mail, Phone, Trash2, CheckCircle, Clock } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../components/ui/Toast';

const AdminInquiries = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            setLoading(true);
            const res = await api.get('/inquiries');
            setItems(res.data?.data || []);
        } catch (error) {
            toast.error("Failed to load inquiries");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await api.patch(`/inquiries/${id}/read`);
            setItems(items.map(i => i._id === id ? { ...i, isRead: true } : i));
            toast.success("Marked as read");
        } catch (error) {
            toast.error("Action failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this inquiry?")) return;
        try {
            await api.delete(`/inquiries/${id}`);
            setItems(items.filter(i => i._id !== id));
            toast.success("Deleted inquiry");
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-skyGreen"></div>
        </div>
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Inquiries</h1>
                    <p className="text-sm text-gray-500 mt-1">Customer contact form submissions and messages.</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-skyGreen inline-block" />
                    {items.filter(i => !i.isRead).length} unread
                </div>
            </div>

            <div className="space-y-3">
                {items.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center text-gray-400">
                        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No inquiries found</p>
                    </div>
                ) : (
                    items.map(inq => (
                        <div key={inq._id} className={`bg-white rounded-2xl border shadow-sm p-5 flex gap-4 transition-all ${!inq.isRead ? 'border-skyGreen/30 ring-1 ring-skyGreen/10' : 'border-gray-100'}`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${!inq.isRead ? 'bg-green-50 text-skyGreen' : 'bg-gray-100 text-gray-400'}`}>
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 flex-wrap">
                                    <div>
                                        <p className="font-bold text-gray-900">
                                            {inq.name} 
                                            {!inq.isRead && <span className="ml-2 text-xs bg-skyGreen text-white px-1.5 py-0.5 rounded-full">New</span>}
                                        </p>
                                        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                                            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{inq.email}</span>
                                            {inq.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{inq.phone}</span>}
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(inq.createdAt).toLocaleDateString('en-IN', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                                <div className="mt-2">
                                    {inq.subject && <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Subject: {inq.subject}</p>}
                                    <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">{inq.message}</p>
                                </div>
                                <div className="flex gap-2 mt-4">
                                    {!inq.isRead && (
                                        <button 
                                            onClick={() => handleMarkAsRead(inq._id)} 
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-green-200 text-skyGreen hover:bg-green-50 transition-colors"
                                        >
                                            <CheckCircle className="w-3.5 h-3.5" /> Mark as Read
                                        </button>
                                    )}
                                    <a 
                                        href={`mailto:${inq.email}?subject=Re: ${inq.subject || 'Inquiry from SkyBeings'}`}
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        <Mail className="w-3.5 h-3.5" /> Reply by Mail
                                    </a>
                                    <button 
                                        onClick={() => handleDelete(inq._id)} 
                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors ml-auto"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminInquiries;
