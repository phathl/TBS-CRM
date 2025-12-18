import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase tự set session khi type=recovery
    supabase.auth.getSession();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert('Đặt mật khẩu thành công, vui lòng đăng nhập');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleReset} className="bg-white p-6 rounded w-96">
        <h2 className="text-xl font-bold mb-4">Đặt mật khẩu mới</h2>

        <input
          type="password"
          placeholder="Mật khẩu mới"
          className="w-full border p-2 mb-4"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {loading ? 'Đang xử lý...' : 'Xác nhận'}
        </button>
      </form>
    </div>
  );
}
