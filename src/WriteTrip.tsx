import { useState } from 'react';
import { createTrip, updateTrip } from './services/tripService';

interface Props {
  user: any;
  editingTrip?: any;
  onBack: () => void;
}

export default function WriteTrip({ user, editingTrip, onBack }: Props) {
  const isEdit = !!editingTrip;

  const [title, setTitle] = useState(editingTrip?.title || '');
  const [subtitle, setSubtitle] = useState(editingTrip?.subtitle || '');
  const [country, setCountry] = useState(editingTrip?.country || '');
  const [city, setCity] = useState(editingTrip?.city || '');
  const [startDate, setStartDate] = useState(editingTrip?.startDate || '');
  const [endDate, setEndDate] = useState(editingTrip?.endDate || '');
  const [content, setContent] = useState(editingTrip?.content || '');
  const [tags, setTags] = useState(editingTrip?.tags?.join(', ') || '');
  const [isPublic, setIsPublic] = useState(editingTrip?.isPublic ?? true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    if (!title.trim()) {
      setMessage('error:제목을 입력해주세요');
      return;
    }
    if (!content.trim()) {
      setMessage('error:내용을 입력해주세요');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      if (isEdit) {
        await updateTrip(editingTrip.id, {
          title,
          subtitle,
          country,
          city,
          startDate,
          endDate,
          content,
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          isPublic,
        });
        setMessage('success:수정이 완료됐어요! ✅');
      } else {
        const tripId = await createTrip(user.uid, {
          title,
          subtitle,
          country,
          city,
          startDate,
          endDate,
          content,
          tags: tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
          isPublic,
          mood: '😊',
        });
        setMessage('success:여행 기록이 저장됐어요! 🎉 (ID: ' + tripId + ')');
      }
      setTimeout(() => onBack(), 1500);
    } catch (err: any) {
      setMessage('error:' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = message.startsWith('success:');
  const msgText = message.replace(/^(success|error):/, '');

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '1px solid rgba(26,23,20,0.12)',
    borderRadius: '10px',
    fontSize: '0.9375rem',
    fontFamily: 'inherit',
    background: 'white',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    fontSize: '0.8125rem',
    fontWeight: 500 as const,
    display: 'block',
    marginBottom: '0.5rem',
    color: '#1A1714',
  };

  const sectionStyle = {
    background: 'white',
    borderRadius: '16px',
    border: '0.5px solid rgba(26,23,20,0.1)',
    padding: '1.5rem',
    marginBottom: '1.25rem',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#F5F0E8',
        fontFamily: 'sans-serif',
      }}
    >
      {/* 상단 바 */}
      <div
        style={{
          background: 'white',
          borderBottom: '0.5px solid rgba(26,23,20,0.1)',
          padding: '0.875rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.875rem',
              color: '#8A8278',
            }}
          >
            ← 뒤로
          </button>
          <span style={{ color: 'rgba(26,23,20,0.2)' }}>|</span>
          <span style={{ fontSize: '0.9375rem', fontWeight: 500 }}>
            {isEdit ? '여행 기록 수정' : '새 여행 기록'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem', alignItems: 'center' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.875rem',
              color: '#8A8278',
            }}
          >
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            전체 공개
          </label>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              padding: '0.4375rem 1.25rem',
              borderRadius: '8px',
              background: '#1A1714',
              color: 'white',
              border: 'none',
              fontSize: '0.8125rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? '저장 중...' : isEdit ? '수정 완료 →' : '저장하기 →'}
          </button>
        </div>
      </div>

      {/* 본문 */}
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem' }}>
        {/* 메시지 */}
        {message && (
          <div
            style={{
              padding: '0.875rem 1rem',
              borderRadius: '10px',
              marginBottom: '1.5rem',
              fontSize: '0.875rem',
              background: isSuccess ? '#EAF3DE' : '#FCEBEB',
              color: isSuccess ? '#3B6D11' : '#A32D2D',
            }}
          >
            {msgText}
          </div>
        )}

        {/* 여행 정보 */}
        <div style={sectionStyle}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
            }}
          >
            <div>
              <label style={labelStyle}>나라</label>
              <input
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="일본"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>도시</label>
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="교토"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>시작일</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>종료일</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* 제목 & 부제목 */}
        <div style={sectionStyle}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>제목</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="여행 제목을 입력하세요"
              style={{ ...inputStyle, fontSize: '1.25rem', fontWeight: 600 }}
            />
          </div>
          <div>
            <label style={labelStyle}>한 줄 소개</label>
            <input
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="여행을 한 줄로 소개해보세요"
              style={inputStyle}
            />
          </div>
        </div>

        {/* 본문 */}
        <div style={sectionStyle}>
          <label style={labelStyle}>여행 이야기</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="여행 이야기를 자유롭게 써보세요."
            rows={10}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.8 }}
          />
        </div>

        {/* 태그 */}
        <div style={sectionStyle}>
          <label style={labelStyle}>태그 (쉼표로 구분)</label>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="벚꽃, 일본, 봄여행, 교토"
            style={inputStyle}
          />
          <p
            style={{
              fontSize: '0.75rem',
              color: '#8A8278',
              marginTop: '0.5rem',
            }}
          >
            예: 벚꽃, 일본, 봄여행
          </p>
        </div>
      </div>
    </div>
  );
}
