import { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Plus, Search, Trash2, Edit, Calendar,
    Clock, CheckCircle2, Clock3, AlertCircle,
    ListFilter, PackageOpen, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { encrypt, decrypt } from '../utils/encryption';

const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(6);
    const [totalTasks, setTotalTasks] = useState(0);
    const totalPages = Math.ceil(totalTasks / limit);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [formData, setFormData] = useState({ title: '', description: '', status: 'pending' });

    useEffect(() => { fetchTasks(); }, [search, status, page, limit]);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/tasks?search=${search}&status=${status}&page=${page}&limit=${limit}`);
            const decryptedTasks = res.data.data.map(task => {
                if (task.encryptedData) {
                    try {
                        const decrypted = JSON.parse(decrypt(task.encryptedData));
                        return { ...task, ...decrypted };
                    } catch { return task; }
                }
                return task;
            });
            setTasks(decryptedTasks);
            setTotalTasks(res.data.total ?? decryptedTasks.length);
        } catch { toast.error('Failed to fetch tasks'); }
        finally { setLoading(false); }
    };

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                status: formData.status,
                encryptedData: encrypt(JSON.stringify({ title: formData.title, description: formData.description }))
            };
            if (editingTask) {
                await api.put(`/tasks/${editingTask._id}`, payload);
                toast.success('Task updated!');
            } else {
                await api.post('/tasks', payload);
                toast.success('Task created!');
            }
            setIsModalOpen(false);
            setEditingTask(null);
            setFormData({ title: '', description: '', status: 'pending' });
            fetchTasks();
        } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this task?')) return;
        try {
            await api.delete(`/tasks/${id}`);
            toast.success('Task deleted');
            fetchTasks();
        } catch { toast.error('Failed to delete'); }
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setFormData({ title: task.title, description: task.description, status: task.status });
        setIsModalOpen(true);
    };

    const statusConfig = {
        completed: { color: '#10b981', bg: 'rgba(16,185,129,0.1)', label: 'Completed', Icon: CheckCircle2 },
        'in-progress': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: 'In Progress', Icon: Clock3 },
        pending: { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', label: 'Pending', Icon: AlertCircle },
    };

    const s = {
        header: {
            display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end',
            justifyContent: 'space-between', gap: 24, marginBottom: 32,
        },
        title: { fontSize: 28, fontWeight: 700, color: 'var(--text)', marginBottom: 4 },
        subtitle: { fontSize: 14, color: 'var(--text-muted)' },
        filters: {
            display: 'flex', flexWrap: 'wrap', gap: 12,
            padding: 16, borderRadius: 'var(--radius)', marginBottom: 32,
            background: 'var(--bg-subtle)', border: '1px solid var(--border)',
        },
        searchWrap: { position: 'relative', flex: '1 1 240px' },
        searchIcon: {
            position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none',
        },
        grid: {
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: 20,
        },
        taskCard: {
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: 24,
            display: 'flex', flexDirection: 'column',
            transition: 'all 0.25s ease', cursor: 'default',
            position: 'relative', overflow: 'hidden',
        },
        statusBar: (color) => ({
            position: 'absolute', top: 0, left: 0, right: 0,
            height: 3, background: color,
        }),
        statusBadge: (cfg) => ({
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 'var(--radius-full)',
            fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.04em', background: cfg.bg, color: cfg.color,
        }),
        taskTitle: { fontSize: 17, fontWeight: 600, color: 'var(--text)', marginBottom: 8 },
        taskDesc: {
            fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6,
            flex: 1, marginBottom: 16,
            overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
        },
        taskFooter: {
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            paddingTop: 16, borderTop: '1px solid var(--border)',
        },
        dateInfo: {
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 12, color: 'var(--text-muted)',
        },
        actions: { display: 'flex', gap: 6 },
        actionBtn: () => ({
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 32, height: 32, borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)', background: 'var(--bg-subtle)',
            color: 'var(--text-muted)', cursor: 'pointer',
            transition: 'all 0.2s',
        }),
        emptyState: {
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '80px 20px',
            border: '2px dashed var(--border)', borderRadius: 'var(--radius-lg)',
            background: 'var(--bg-subtle)',
        },
        emptyIcon: {
            width: 72, height: 72, borderRadius: 20,
            background: 'var(--border-light)', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 20,
        },
        loadingWrap: {
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '80px 20px', gap: 16,
        },
        spinner: {
            width: 40, height: 40, border: '3px solid var(--border)',
            borderTopColor: 'var(--primary)', borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
        },
        pagination: {
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 8, marginTop: 40,
        },
        pageNum: {
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 36, height: 36, borderRadius: 'var(--radius-sm)',
            background: 'var(--primary)', color: 'white',
            fontSize: 13, fontWeight: 700,
        },
        overlay: {
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 24, background: 'var(--overlay)',
            backdropFilter: 'blur(6px)',
        },
        modal: {
            background: 'var(--card)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)', padding: 32,
            width: '100%', maxWidth: 500, boxShadow: 'var(--shadow-xl)',
        },
        modalHeader: {
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 28,
        },
        modalTitle: { fontSize: 22, fontWeight: 700, color: 'var(--text)' },
        statusPicker: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 },
        statusOption: (active) => ({
            padding: '10px 8px', borderRadius: 'var(--radius-sm)',
            border: active ? '2px solid var(--primary)' : '1px solid var(--border)',
            background: active ? 'var(--primary-light)' : 'transparent',
            color: active ? 'var(--primary)' : 'var(--text-secondary)',
            fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.04em', cursor: 'pointer',
            transition: 'all 0.15s',
            textAlign: 'center',
        }),
        modalActions: { display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32 },
    };

    return (
        <div className="container animate-fade">
            {/* Header */}
            <div style={s.header}>
                <div>
                    <h1 style={s.title}>Your Tasks</h1>
                    <p style={s.subtitle}>Manage and track what matters</p>
                </div>
                <button className="btn btn-primary" onClick={() => {
                    setEditingTask(null);
                    setFormData({ title: '', description: '', status: 'pending' });
                    setIsModalOpen(true);
                }}>
                    <Plus size={18} /> New Task
                </button>
            </div>

            {/* Filters */}
            <div style={s.filters}>
                <div style={s.searchWrap}>
                    <div style={s.searchIcon}><Search size={16} /></div>
                    <input type="text" className="form-input" style={{ paddingLeft: 38, background: 'var(--card)' }}
                        placeholder="Search tasks..." value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div style={{ position: 'relative', minWidth: 160 }}>
                    <div style={s.searchIcon}><ListFilter size={16} /></div>
                    <select className="form-input" style={{ paddingLeft: 38, background: 'var(--card)' }}
                        value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
                        <option value="">All Tasks</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div style={s.loadingWrap}>
                    <div style={s.spinner} />
                    <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Loading tasks...</p>
                </div>
            ) : tasks.length === 0 ? (
                <div style={s.emptyState} className="animate-slide">
                    <div style={s.emptyIcon}><PackageOpen size={36} /></div>
                    <h3 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>No tasks found</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Create a new task or adjust your filters</p>
                </div>
            ) : (
                <div style={s.grid} className="animate-slide">
                    {tasks.map(task => {
                        const cfg = statusConfig[task.status] || statusConfig.pending;
                        return (
                            <div key={task._id} style={s.taskCard}
                                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                            >
                                <div style={s.statusBar(cfg.color)} />

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                    <span style={s.statusBadge(cfg)}>
                                        <cfg.Icon size={13} /> {cfg.label}
                                    </span>
                                </div>

                                <h3 style={s.taskTitle}>{task.title}</h3>
                                <p style={s.taskDesc}>{task.description}</p>

                                <div style={s.taskFooter}>
                                    <div style={s.dateInfo}>
                                        <Calendar size={13} />
                                        {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        <span style={{ color: 'var(--border)' }}>·</span>
                                        <Clock size={13} />
                                        {new Date(task.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div style={s.actions}>
                                        <button style={s.actionBtn()} onClick={() => openEditModal(task)}
                                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'var(--primary)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button style={s.actionBtn()} onClick={() => handleDelete(task._id)}
                                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.borderColor = 'var(--danger)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {(totalPages > 1 || tasks.length > 0) && (
                <div style={{ ...s.pagination, justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    {/* Per-page selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                        <span>Rows per page:</span>
                        <select
                            value={limit}
                            onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
                            style={{
                                padding: '4px 8px', borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--border)', background: 'var(--card)',
                                color: 'var(--text)', fontSize: 13, cursor: 'pointer',
                                outline: 'none',
                            }}>
                            <option value={6}>6</option>
                            <option value={12}>12</option>
                            <option value={24}>24</option>
                        </select>
                    </div>

                    {totalPages > 1 && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <button className="btn btn-outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}
                            style={{ padding: '8px 16px', opacity: page === 1 ? 0.4 : 1 }}>
                            <ChevronLeft size={16} /> Prev
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(n => n === 1 || n === totalPages || Math.abs(n - page) <= 1)
                            .reduce((acc, n, idx, arr) => {
                                if (idx > 0 && n - arr[idx - 1] > 1) acc.push('...');
                                acc.push(n);
                                return acc;
                            }, [])
                            .map((item, idx) =>
                                item === '...' ? (
                                    <span key={`ellipsis-${idx}`} style={{ color: 'var(--text-muted)', padding: '0 4px' }}>…</span>
                                ) : (
                                    <button key={item} onClick={() => setPage(item)}
                                        style={{
                                            ...s.pageNum,
                                            background: item === page ? 'var(--primary)' : 'var(--bg-subtle)',
                                            color: item === page ? 'white' : 'var(--text)',
                                            border: '1px solid var(--border)',
                                            cursor: 'pointer',
                                        }}>
                                        {item}
                                    </button>
                                )
                            )
                        }

                        <button className="btn btn-outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
                            style={{ padding: '8px 16px', opacity: page === totalPages ? 0.4 : 1 }}>
                            Next <ChevronRight size={16} />
                        </button>
                    </div>}

                    {/* Page info */}
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {totalTasks > 0 ? `${(page - 1) * limit + 1}–${Math.min(page * limit, totalTasks)} of ${totalTasks}` : ''}
                    </span>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div style={s.overlay} className="animate-fade" onClick={e => e.target === e.currentTarget && setIsModalOpen(false)}>
                    <div style={s.modal} className="animate-slide">
                        <div style={s.modalHeader}>
                            <h2 style={s.modalTitle}>{editingTask ? 'Edit Task' : 'New Task'}</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{
                                background: 'none', border: 'none', color: 'var(--text-muted)',
                                cursor: 'pointer', padding: 4,
                            }}>
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateOrUpdate}>
                            <div className="form-group">
                                <label className="form-label">Title</label>
                                <input type="text" className="form-input" placeholder="Task title..."
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })} required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea className="form-input" placeholder="What needs to be done?"
                                    style={{ minHeight: 120, resize: 'vertical' }}
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })} required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <div style={s.statusPicker}>
                                    {['pending', 'in-progress', 'completed'].map(st => (
                                        <button key={st} type="button" style={s.statusOption(formData.status === st)}
                                            onClick={() => setFormData({ ...formData, status: st })}>
                                            {st}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={s.modalActions}>
                                <button type="button" className="btn btn-outline" style={{ padding: '10px 24px' }}
                                    onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" style={{ padding: '10px 28px' }}>
                                    {editingTask ? 'Save Changes' : 'Create Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
