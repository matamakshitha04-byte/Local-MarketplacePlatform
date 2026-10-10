import { useState } from 'react';
import api, { errMsg } from '../services/api';
import useFetch from '../hooks/useFetch';
import { useToast } from '../context/ToastContext';
import { Loader, ErrorBox, EmptyState, ConfirmDialog } from '../components/ui';
import { fmtDate } from '../constants';

export default function AdminUsers() {
  const [role, setRole] = useState('');
  const { data, loading, error, reload, setData } = useFetch('/admin/users', { role });
  const toast = useToast();
  const [target, setTarget] = useState(null);

  const toggle = async (u) => {
    try {
      const r = await api.put(`/admin/users/${u._id}/status`, { isActive: !u.isActive });
      setData({ users: data.users.map((x) => (x._id === u._id ? r.data.user : x)) });
      toast.success(r.data.user.isActive ? 'User enabled' : 'User disabled');
    } catch (e) { toast.error(errMsg(e)); }
  };
  const del = async () => {
    try {
      await api.delete(`/admin/users/${target._id}`);
      setData({ users: data.users.filter((x) => x._id !== target._id) });
      toast.success('User deleted');
    } catch (e) { toast.error(errMsg(e)); }
    setTarget(null);
  };

  return (
    <div>
      <div className="section-head">
        <h1>Users</h1>
        <label className="inline">Role
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">All</option><option value="customer">Customers</option><option value="seller">Sellers</option><option value="admin">Admins</option>
          </select>
        </label>
      </div>
      {loading ? <Loader /> : error ? <ErrorBox message={error} onRetry={reload} /> :
        data.users.length === 0 ? <EmptyState title="No users found" /> : (
          <div className="table-wrap"><table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Location</th><th>Joined</th><th>Status</th><th /></tr></thead>
            <tbody>{data.users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}{u.shopName && <div className="muted small">{u.shopName}</div>}</td>
                <td>{u.email}</td><td>{u.role}</td><td>{u.location}</td><td>{fmtDate(u.createdAt)}</td>
                <td><span className={`badge ${u.isActive ? 'badge-delivered' : 'badge-cancelled'}`}>{u.isActive ? 'Active' : 'Disabled'}</span></td>
                <td className="actions">{u.role !== 'admin' && <>
                  <button className="btn btn-ghost btn-sm" onClick={() => toggle(u)}>{u.isActive ? 'Disable' : 'Enable'}</button>
                  <button className="btn btn-danger-ghost btn-sm" onClick={() => setTarget(u)}>Delete</button>
                </>}</td>
              </tr>
            ))}</tbody>
          </table></div>
        )}
      <ConfirmDialog open={Boolean(target)} danger title="Delete this user?" message={target ? `${target.name} will be removed${target.role === 'seller' ? ' along with all their products' : ''}.` : ''} confirmText="Delete" onConfirm={del} onCancel={() => setTarget(null)} />
    </div>
  );
}
