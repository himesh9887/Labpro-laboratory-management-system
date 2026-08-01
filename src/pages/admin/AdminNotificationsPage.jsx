import { useState, useEffect } from 'react';
import { FiBell, FiCheckCircle, FiSend, FiTrash2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { AdminPageHeader, AdminModal, adminInputClass, adminBtnPrimary, adminBtnSecondary, AdminEmpty } from '../../components/admin/AdminUI';
import adminService from '../../services/adminService';

function timeAgo(iso) {
  if (!iso) return '—';
  const diff = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [labs, setLabs] = useState([]);

  useEffect(() => {
    setNotifications(adminService.getNotifications());
    setLabs(adminService.getAllLabs());
  }, []);

  const handleSend = (data) => {
    adminService.sendNotification(data.labId, data.title, data.message, data.type);
    toast.success('Notification sent');
    setNotifications(adminService.getNotifications());
    setModalOpen(false);
  };

  const handleMarkRead = (id) => {
    adminService.markNotificationRead(id);
    setNotifications(adminService.getNotifications());
    toast.success('Notification marked as read');
  };

  const handleDelete = (id) => {
    adminService.deleteNotification(id);
    setNotifications(adminService.getNotifications());
    toast.success('Notification deleted');
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Notifications"
        description={`${notifications.length} notifications · ${unread} unread`}
        action={
          <button className={adminBtnPrimary} onClick={() => setModalOpen(true)}>
            <FiSend /> Send Notification
          </button>
        }
      />

      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden">
        {notifications.length === 0 ? (
          <AdminEmpty icon={FiBell} msg="No notifications" sub="Send your first notification." />
        ) : (
          <div className="divide-y divide-slate-800">
            {notifications.map(n => (
              <div key={n.id} className={`flex items-start gap-3 px-5 py-4 ${n.read ? '' : 'bg-blue-500/5'}`}>
                <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl text-base ${n.type === 'warning' ? 'bg-amber-500/15' : 'bg-blue-500/15'}`}>
                  {n.type === 'warning' ? '⚠️' : '📢'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">{n.title}</p>
                    {!n.read && <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />}
                  </div>
                  <p className="mt-0.5 text-sm text-slate-400">{n.message}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {n.labId ? <span className="font-mono font-bold text-amber-400">{n.labId}</span> : <span>All labs</span>}
                    {' · '}{timeAgo(n.createdAt)}
                  </p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {!n.read && (
                    <button onClick={() => handleMarkRead(n.id)} className="rounded-lg p-2 text-slate-400 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors" title="Mark read">
                      <FiCheckCircle size={14} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(n.id)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors" title="Delete">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)} title="Send Notification" size="sm">
        <NotificationForm labs={labs} onSave={handleSend} onCancel={() => setModalOpen(false)} />
      </AdminModal>
    </div>
  );
}

function NotificationForm({ labs, onSave, onCancel }) {
  const [form, setForm] = useState({ labId: 'all', title: '', message: '', type: 'info' });
  const set = (f, v) => setForm(prev => ({ ...prev, [f]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;
    onSave({ ...form, labId: form.labId === 'all' ? null : form.labId });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Target Laboratory</span>
        <select className={adminInputClass} value={form.labId} onChange={e => set('labId', e.target.value)}>
          <option value="all">All Laboratories</option>
          {labs.filter(l => l.status !== 'Deleted').map(l => <option key={l.labId} value={l.labId}>{l.labId} - {l.labName}</option>)}
        </select>
      </label>
      <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Type</span>
        <select className={adminInputClass} value={form.type} onChange={e => set('type', e.target.value)}>
          <option value="info">Info</option>
          <option value="warning">Warning</option>
        </select>
      </label>
      <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Title</span>
        <input className={adminInputClass} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Notification title" required />
      </label>
      <label className="block"><span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-400">Message</span>
        <textarea className={adminInputClass + ' h-20 resize-none'} value={form.message} onChange={e => set('message', e.target.value)} placeholder="Notification message" required />
      </label>
      <div className="flex justify-end gap-3">
        <button type="button" className={adminBtnSecondary} onClick={onCancel}>Cancel</button>
        <button type="submit" className={adminBtnPrimary}><FiSend size={14} /> Send</button>
      </div>
    </form>
  );
}

