import { useState } from 'react';
import { signUp, signIn, signInWithGoogle } from './services/authService';

export default function Auth() {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');
    try {
      if (tab === 'signup') {
        await signUp(email, password, name, email.split('@')[0]);
        setMessage('success:회원가입 성공! 🎉 환영합니다!');
      } else {
        await signIn(email, password);
        setMessage('success:로그인 성공! ✅');
      }
    } catch (err: any) {
      const msg =
        err.code === 'auth/email-already-in-use'
          ? '이미 사용 중인 이메일이에요'
          : err.code === 'auth/wrong-password' ||
            err.code === 'auth/invalid-credential'
          ? '이메일 또는 비밀번호가 틀렸어요'
          : err.code === 'auth/weak-password'
          ? '비밀번호는 6자 이상이어야 해요'
          : err.message;
      setMessage('error:' + msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setMessage('error:' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = message.startsWith('success:');
  const isError = message.startsWith('error:');
  const msgText = message.replace(/^(success|error):/, '');

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}
    >
      {/* 왼쪽 패널 */}
      <div
        style={{
          width: '45%',
          background: '#1A1714',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '3rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-40%',
            right: '-10%',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(196,98,45,0.18) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            fontSize: '1.5rem',
            color: '#F5F0E8',
            fontWeight: '700',
            zIndex: 1,
          }}
        >
          Travel
          <span style={{ color: '#C4622D', fontStyle: 'italic' }}>og</span>
        </div>
        <div style={{ zIndex: 1 }}>
          <h2
            style={{
              fontSize: '2.25rem',
              color: '#F5F0E8',
              lineHeight: 1.2,
              marginBottom: '1rem',
              fontWeight: '700',
            }}
          >
            여행을 <em style={{ color: '#C4622D' }}>기억하는</em>
            <br />
            가장 아름다운 방법
          </h2>
          <p
            style={{
              color: 'rgba(245,240,232,0.5)',
              fontSize: '0.9rem',
              lineHeight: 1.7,
            }}
          >
            글, 사진, 영상, 경로까지 — 당신의 모든 여행 순간을 AI가 자동으로
            정리해 드립니다.
          </p>
          <div
            style={{
              marginTop: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {[
              {
                icon: '✍️',
                title: '글·사진·영상·경로 통합 기록',
                sub: '모든 여행 콘텐츠를 한 곳에서',
              },
              {
                icon: '🤖',
                title: 'AI 자동 정리 & 하이라이트',
                sub: '업로드하면 2분 안에 완성',
              },
              {
                icon: '🗺️',
                title: '경로 시각화 & 여행 추천',
                sub: '나만의 지도가 자동으로 완성',
              },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  background: 'rgba(245,240,232,0.06)',
                  border: '0.5px solid rgba(245,240,232,0.12)',
                  borderRadius: '14px',
                  padding: '0.875rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: 'rgba(196,98,45,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    flexShrink: 0,
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <p
                    style={{
                      fontSize: '0.8125rem',
                      color: 'rgba(245,240,232,0.9)',
                      margin: 0,
                    }}
                  >
                    {item.title}
                  </p>
                  <p
                    style={{
                      fontSize: '0.75rem',
                      color: 'rgba(245,240,232,0.4)',
                      margin: 0,
                    }}
                  >
                    {item.sub}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            fontSize: '0.75rem',
            color: 'rgba(245,240,232,0.3)',
            zIndex: 1,
          }}
        >
          © 2025 Travelog
        </div>
      </div>

      {/* 오른쪽 패널 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '3rem 2rem',
          background: '#F5F0E8',
        }}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {/* 탭 */}
          <div
            style={{
              display: 'flex',
              background: 'rgba(26,23,20,0.06)',
              borderRadius: '12px',
              padding: '4px',
              marginBottom: '2rem',
            }}
          >
            {(['login', 'signup'] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setMessage('');
                }}
                style={{
                  flex: 1,
                  padding: '0.625rem',
                  borderRadius: '9px',
                  border: 'none',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '0.875rem',
                  transition: 'all 0.2s',
                  background: tab === t ? 'white' : 'transparent',
                  color: tab === t ? '#1A1714' : '#8A8278',
                  fontWeight: tab === t ? 500 : 400,
                  boxShadow:
                    tab === t ? '0 1px 4px rgba(26,23,20,0.1)' : 'none',
                }}
              >
                {t === 'login' ? '로그인' : '회원가입'}
              </button>
            ))}
          </div>

          <h2
            style={{
              fontFamily: 'Georgia, serif',
              fontSize: '1.75rem',
              marginBottom: '0.375rem',
              letterSpacing: '-0.5px',
            }}
          >
            {tab === 'login' ? '다시 돌아오셨군요' : '여행을 시작하세요'}
          </h2>
          <p
            style={{
              fontSize: '0.875rem',
              color: '#8A8278',
              marginBottom: '2rem',
            }}
          >
            {tab === 'login'
              ? '계정에 로그인하고 여행을 이어가세요'
              : '무료로 가입하고 첫 번째 여행을 기록해보세요'}
          </p>

          {/* 이름 (회원가입만) */}
          {tab === 'signup' && (
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  display: 'block',
                  marginBottom: '0.5rem',
                }}
              >
                이름
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="홍길동"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '1px solid rgba(26,23,20,0.12)',
                  borderRadius: '10px',
                  fontSize: '0.9375rem',
                  fontFamily: 'inherit',
                  background: 'white',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          {/* 이메일 */}
          <div style={{ marginBottom: '1rem' }}>
            <label
              style={{
                fontSize: '0.8125rem',
                fontWeight: 500,
                display: 'block',
                marginBottom: '0.5rem',
              }}
            >
              이메일
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="hello@travelog.app"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid rgba(26,23,20,0.12)',
                borderRadius: '10px',
                fontSize: '0.9375rem',
                fontFamily: 'inherit',
                background: 'white',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 비밀번호 */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label
              style={{
                fontSize: '0.8125rem',
                fontWeight: 500,
                display: 'block',
                marginBottom: '0.5rem',
              }}
            >
              비밀번호
            </label>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="6자 이상 입력"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                border: '1px solid rgba(26,23,20,0.12)',
                borderRadius: '10px',
                fontSize: '0.9375rem',
                fontFamily: 'inherit',
                background: 'white',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* 메시지 */}
          {message && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                marginBottom: '1rem',
                fontSize: '0.875rem',
                background: isSuccess ? '#EAF3DE' : '#FCEBEB',
                color: isSuccess ? '#3B6D11' : '#A32D2D',
              }}
            >
              {msgText}
            </div>
          )}

          {/* 제출 버튼 */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: '#1A1714',
              color: '#F5F0E8',
              border: 'none',
              borderRadius: '10px',
              fontSize: '0.9375rem',
              fontFamily: 'inherit',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              marginBottom: '1.25rem',
            }}
          >
            {loading
              ? '처리 중...'
              : tab === 'login'
              ? '로그인'
              : '무료로 시작하기'}
          </button>

          {/* 구분선 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1.25rem',
            }}
          >
            <div
              style={{
                flex: 1,
                height: '1px',
                background: 'rgba(26,23,20,0.1)',
              }}
            />
            <span style={{ fontSize: '0.8125rem', color: '#8A8278' }}>
              또는
            </span>
            <div
              style={{
                flex: 1,
                height: '1px',
                background: 'rgba(26,23,20,0.1)',
              }}
            />
          </div>

          {/* 구글 로그인 */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              background: 'white',
              color: '#1A1714',
              border: '1px solid rgba(26,23,20,0.12)',
              borderRadius: '10px',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.625rem',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path
                d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"
                fill="#4285F4"
              />
            </svg>
            Google로 계속하기
          </button>
        </div>
      </div>
    </div>
  );
}
