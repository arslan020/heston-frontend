import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.adminLogin(username, password);
      nav('/admin');
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div style={{ display:'grid', placeItems:'center', minHeight:'100vh' }}>
      <form onSubmit={submit} style={{ padding:24, border:'1px solid #ddd', borderRadius:8, minWidth:320 }}>
        <h2>Admin Login</h2>
        <input placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button type="submit">Login</button>
        {msg && <p style={{ color:'crimson' }}>{msg}</p>}
      </form>
    </div>
  );
}
