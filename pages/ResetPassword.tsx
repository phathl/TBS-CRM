import { supabase } from '../lib/supabase/client';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Supabase tự detect token recovery từ URL
    supabase.auth.getSession();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('✅ Đổi mật khẩu thành công');
      setTimeout(() => navigate('/login'), 2000);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleReset}
        className="bg-white p-6 rounded shadow w-96"
      >
        <h2 className="text-xl font-bold mb-4">Đặt lại mật khẩu</h2>

        <input
          type="password"
          required
          placeholder="Mật khẩu mới"
          className="w-full border px-3 py-2 mb-4"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          {loading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
        </button>

        {message && (
          <p className="mt-3 text-sm text-center text-red-600">{message}</p>
        )}
      </form>
    </div>
  );
}
