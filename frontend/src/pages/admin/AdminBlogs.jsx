import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, BookOpen, Eye, X, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../components/ui/Toast';

const AdminBlogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [status, setStatus] = useState('idle');
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const toast = useToast();

    const [form, setForm] = useState({
        title: '',
        excerpt: '',
        content: '',
        status: 'draft',
        tags: '',
    });

    const setF = (field, val) => setForm(f => ({ ...f, [field]: val }));

    const fetchBlogs = async () => {
        setStatus('loading');
        try {
            const res = await api.get('/blogs/admin/all');
            setBlogs(res.data.data);
            setStatus('succeeded');
        } catch {
            setStatus('failed');
            toast.error("Failed to fetch blogs");
        }
    };

    useEffect(() => { fetchBlogs(); }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleEdit = (blog) => {
        setForm({
            title: blog.title,
            excerpt: blog.excerpt || '',
            content: blog.content || '',
            status: blog.status,
            tags: blog.tags?.join(', ') || '',
        });
        setPreviewUrl(blog.coverImage || null);
        setImageFile(null);
        setEditingId(blog._id);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title) return toast.warning("Title is required");

        setIsSubmitting(true);
        try {
            const data = new FormData();
            data.append('title', form.title);
            data.append('excerpt', form.excerpt);
            data.append('content', form.content);
            data.append('status', form.status);
            
            const tagArray = form.tags.split(',').map(t => t.trim()).filter(Boolean);
            data.append('tags', JSON.stringify(tagArray));
            
            if (imageFile) data.append('coverImage', imageFile);

            if (editingId) {
                await api.put(`/blogs/${editingId}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Blog updated successfully');
            } else {
                await api.post('/blogs', data, { headers: { 'Content-Type': 'multipart/form-data' } });
                toast.success('Blog created successfully');
            }
            
            setShowForm(false);
            setEditingId(null);
            setForm({ title: '', excerpt: '', content: '', status: 'draft', tags: '' });
            setPreviewUrl(null);
            setImageFile(null);
            fetchBlogs();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save blog');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this blog?')) return;
        try {
            await api.delete(`/blogs/${id}`);
            toast.success('Blog deleted');
            setBlogs(blogs.filter(b => b._id !== id));
        } catch { 
            toast.error('Failed to delete blog');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                        Blogs <span className="text-gray-400 text-lg font-normal ml-2">({blogs.length})</span>
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">Create and manage your website blog posts.</p>
                </div>
                <button 
                    onClick={() => {
                        setEditingId(null);
                        setForm({ title: '', excerpt: '', content: '', status: 'draft', tags: '' });
                        setPreviewUrl(null);
                        setImageFile(null);
                        setShowForm(true);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 bg-skyGreen text-white font-medium rounded-xl hover:bg-[#0c660b] transition-all shadow-sm">
                    <Plus className="w-5 h-5" /> New Blog Post
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 shrink-0">
                            <h2 className="text-xl font-bold text-gray-900">{editingId ? 'Edit Blog' : 'Create Blog Post'}</h2>
                            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form id="blog-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Left Column: Info */}
                                <div className="md:col-span-2 space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                                        <input required value={form.title} onChange={e => setF('title', e.target.value)}
                                            placeholder="Enter blog title"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-skyGreen transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Excerpt</label>
                                        <textarea value={form.excerpt} onChange={e => setF('excerpt', e.target.value)}
                                            rows="2" placeholder="Brief summary for the blog card"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-skyGreen resize-none transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Content</label>
                                        <textarea value={form.content} onChange={e => setF('content', e.target.value)}
                                            rows="8" placeholder="Full blog content (HTML supported)"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono outline-none focus:bg-white focus:border-skyGreen resize-y transition-all" />
                                    </div>
                                </div>
                                
                                {/* Right Column: Sidebar */}
                                <div className="space-y-4">
                                    {/* Cover Image */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image</label>
                                        <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer transition-all hover:border-skyGreen hover:bg-green-50/40 group ${previewUrl ? 'border-skyGreen p-2' : 'border-gray-200 p-6'}`}>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                                            {previewUrl ? (
                                                <div className="relative w-full aspect-video">
                                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center transition-opacity">
                                                        <span className="text-white text-xs font-medium">Change image</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-skyGreen transition-colors mb-2" />
                                                    <span className="text-xs font-semibold text-gray-600">Upload Image</span>
                                                </>
                                            )}
                                        </label>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                                        <select value={form.status} onChange={e => setF('status', e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-skyGreen transition-all">
                                            <option value="draft">Draft</option>
                                            <option value="published">Published</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Tags (comma separated)</label>
                                        <input value={form.tags} onChange={e => setF('tags', e.target.value)}
                                            placeholder="e.g. birds, guide, feeding"
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-skyGreen transition-all" />
                                    </div>
                                </div>
                            </div>
                        </form>

                        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3 shrink-0">
                            <button type="button" onClick={() => setShowForm(false)}
                                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50">
                                Cancel
                            </button>
                            <button type="submit" form="blog-form" disabled={isSubmitting}
                                className="px-5 py-2.5 text-sm font-medium text-white bg-skyGreen rounded-xl hover:bg-[#0c660b] flex items-center gap-2 min-w-[130px] justify-center disabled:opacity-50">
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Save Post</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* List */}
            {status === 'loading' ? (
                <div className="flex justify-center flex-col items-center py-20 text-skyGreen">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <p className="font-medium animate-pulse">Loading blogs...</p>
                </div>
            ) : blogs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                        <BookOpen className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Blogs Yet</h3>
                    <p className="text-sm text-gray-400 mb-6">Start creating your content by adding a new blog post.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title / Author</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Views</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {blogs.map(b => (
                                    <tr key={b._id} className="hover:bg-green-50/20 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                                                    {b.coverImage ? (
                                                        <img src={b.coverImage} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <BookOpen className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-gray-900 line-clamp-1">{b.title}</div>
                                                    <div className="text-xs text-gray-500 mt-1">{b.author}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 text-sm whitespace-nowrap">
                                            {new Date(b.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-1.5 text-gray-600 text-sm font-medium">
                                                <Eye className="w-4 h-4 text-gray-400" /> {b.views}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${b.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {b.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex gap-2 justify-end">
                                                <button onClick={() => handleEdit(b)} className="p-2 text-gray-400 hover:text-skyGreen hover:bg-green-50 rounded-lg transition-colors">
                                                    <Pencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(b._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminBlogs;
