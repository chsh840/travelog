interface Props {
  onLogin: () => void;
  onSignup: () => void;
}

export default function Landing({ onLogin, onSignup }: Props) {
  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8", fontFamily: "sans-serif" }}>

      {/* 네비게이션 */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        background: "rgba(245,240,232,0.85)", backdropFilter: "blur(12px)",
        borderBottom: "0.5px solid rgba(26,23,20,0.1)",
        padding: "1.25rem 3rem", display: "flex",
        alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "1.5rem", fontWeight: 700 }}>
          Travel<span style={{ color: "#C4622D", fontStyle: "italic" }}>og</span>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button onClick={onLogin} style={{
            padding: "0.5rem 1.25rem", borderRadius: "8px",
            background: "transparent", color: "#1A1714",
            border: "1px solid rgba(26,23,20,0.2)",
            fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit",
          }}>로그인</button>
          <button onClick={onSignup} style={{
            padding: "0.5rem 1.25rem", borderRadius: "8px",
            background: "#1A1714", color: "white", border: "none",
            fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit",
          }}>회원가입</button>
        </div>
      </nav>

      {/* 히어로 */}
      <section style={{
        minHeight: "100vh", display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "7rem 3rem 4rem",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 60% 50% at 80% 50%, rgba(196,98,45,0.08) 0%, transparent 70%)",
        }} />
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "0.5rem",
          background: "#F0E6DC", color: "#C4622D",
          fontSize: "0.75rem", fontWeight: 500,
          letterSpacing: "0.08em", textTransform: "uppercase" as const,
          padding: "0.375rem 0.875rem", borderRadius: "100px",
          marginBottom: "1.75rem", width: "fit-content",
        }}>✦ AI 여행 기록 플랫폼</div>
        <h1 style={{
          fontFamily: "Georgia, serif",
          fontSize: "clamp(3rem, 7vw, 5.5rem)",
          lineHeight: 1.05, letterSpacing: "-2px",
          maxWidth: "800px", marginBottom: "1.5rem",
        }}>
          여행을 <em style={{ color: "#C4622D" }}>기억하는</em><br />가장 아름다운 방법
        </h1>
        <p style={{
          fontSize: "1.1rem", color: "#8A8278",
          maxWidth: "500px", lineHeight: 1.7,
          fontWeight: 300, marginBottom: "2.5rem",
        }}>
          글, 사진, 영상, 경로까지 — 당신의 모든 여행 순간을 AI가 자동으로 정리하고 추억으로 만들어 드립니다.
        </p>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <button onClick={onSignup} style={{
            padding: "0.875rem 2rem", borderRadius: "100px",
            background: "#1A1714", color: "white", border: "none",
            fontSize: "1rem", cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
          }}>무료로 시작하기 →</button>
          <button onClick={onLogin} style={{
            padding: "0.875rem 1.5rem", borderRadius: "100px",
            background: "transparent", color: "#8A8278", border: "none",
            fontSize: "1rem", cursor: "pointer", fontFamily: "inherit",
          }}>로그인</button>
        </div>
      </section>

      {/* 기능 소개 */}
      <section style={{ padding: "6rem 3rem", background: "white" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ fontSize: "0.75rem", textTransform: "uppercase" as const, letterSpacing: "0.12em", color: "#C4622D", marginBottom: "1rem" }}>핵심 기능</div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2.5rem", letterSpacing: "-1px", marginBottom: "3rem" }}>여행을 기록하는 4가지 방식</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.5rem" }}>
            {[
              { icon: "✍️", title: "글로 기록하기", desc: "여행의 감정과 이야기를 자유롭게 글로 남기세요. 리치 텍스트 편집기로 나만의 여행 일지를 완성합니다.", bg: "#F0E6DC" },
              { icon: "📸", title: "사진으로 담기", desc: "사진을 업로드하면 AI가 장소, 분위기, 주제를 자동으로 분류하고 태그합니다.", bg: "#EAF3DE" },
              { icon: "🎥", title: "영상으로 남기기", desc: "짧은 클립부터 긴 여행 영상까지, AI가 하이라이트를 추출하고 자동으로 릴을 만들어 드립니다.", bg: "#E6F1FB" },
              { icon: "🗺️", title: "경로 시각화", desc: "방문한 장소들이 지도 위에 자동으로 연결됩니다. 이동 경로와 체류 시간을 한눈에 확인하세요.", bg: "#EEEDFE" },
            ].map((f) => (
              <div key={f.title} style={{
                background: "#F5F0E8", borderRadius: "20px",
                padding: "2rem", border: "0.5px solid rgba(26,23,20,0.08)",
                transition: "transform 0.2s",
              }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-4px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
              >
                <div style={{
                  width: "44px", height: "44px", borderRadius: "12px",
                  background: f.bg, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "20px", marginBottom: "1.25rem",
                }}>{f.icon}</div>
                <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.25rem", marginBottom: "0.625rem" }}>{f.title}</h3>
                <p style={{ fontSize: "0.875rem", color: "#8A8278", lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI 섹션 */}
      <section style={{ padding: "6rem 3rem", background: "#1A1714", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "-40%", right: "-10%",
          width: "600px", height: "600px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(196,98,45,0.15) 0%, transparent 70%)",
        }} />
        <div style={{ maxWidth: "1000px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: "0.75rem", textTransform: "uppercase" as const, letterSpacing: "0.12em", color: "#C4622D", marginBottom: "1rem" }}>AI 기능</div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2.5rem", color: "#F5F0E8", letterSpacing: "-1px", marginBottom: "1.5rem" }}>
            AI가 만드는<br />완벽한 여행 기록
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap" as const, gap: "0.75rem", marginBottom: "3rem" }}>
            {["여행 일정 자동 요약", "사진 자동 분류 & 태그", "경로 시각화 자동화", "맞춤 여행 추천", "하이라이트 영상 생성"].map((chip) => (
              <div key={chip} style={{
                background: "rgba(245,240,232,0.08)",
                border: "0.5px solid rgba(245,240,232,0.15)",
                color: "rgba(245,240,232,0.8)",
                padding: "0.625rem 1.25rem", borderRadius: "100px", fontSize: "0.875rem",
              }}>{chip}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
            {[
              { num: "2분", label: "평균 여행 정리 시간" },
              { num: "98%", label: "사진 분류 정확도" },
              { num: "50+", label: "지원 언어" },
            ].map((s) => (
              <div key={s.label}>
                <div style={{ fontFamily: "Georgia, serif", fontSize: "3rem", fontWeight: 700, color: "#F5F0E8", letterSpacing: "-2px", lineHeight: 1 }}>{s.num}</div>
                <div style={{ fontSize: "0.875rem", color: "rgba(245,240,232,0.4)", marginTop: "0.375rem" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 사용 방법 */}
      <section style={{ padding: "6rem 3rem", background: "#F5F0E8" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ fontSize: "0.75rem", textTransform: "uppercase" as const, letterSpacing: "0.12em", color: "#C4622D", marginBottom: "1rem" }}>사용 방법</div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2.5rem", letterSpacing: "-1px", marginBottom: "3rem" }}>세 단계로 시작하세요</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
            {[
              { num: "01", title: "여행 기록 업로드", desc: "사진, 영상, 글, GPS 데이터를 자유롭게 업로드하세요." },
              { num: "02", title: "AI 자동 정리", desc: "업로드하는 순간 AI가 분류, 태그, 경로 구성, 하이라이트 선별을 자동으로 처리합니다." },
              { num: "03", title: "추억 공유 & 저장", desc: "완성된 여행 기록을 나만 보거나 친구들과 공유하세요." },
            ].map((s) => (
              <div key={s.num}>
                <div style={{ fontFamily: "Georgia, serif", fontSize: "4rem", fontWeight: 700, color: "rgba(26,23,20,0.08)", lineHeight: 1, marginBottom: "1rem" }}>{s.num}</div>
                <h3 style={{ fontFamily: "Georgia, serif", fontSize: "1.25rem", marginBottom: "0.75rem" }}>{s.title}</h3>
                <p style={{ fontSize: "0.875rem", color: "#8A8278", lineHeight: 1.7 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "6rem 3rem", background: "#F0E6DC", textAlign: "center" as const }}>
        <div style={{ fontSize: "0.75rem", textTransform: "uppercase" as const, letterSpacing: "0.12em", color: "#C4622D", marginBottom: "1rem" }}>지금 시작하기</div>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2.5rem", letterSpacing: "-1px", marginBottom: "1rem" }}>다음 여행, Travelog와 함께</h2>
        <p style={{ color: "#8A8278", marginBottom: "2.5rem", lineHeight: 1.7 }}>무료로 시작해보세요. 여행 기록이 이렇게 아름다울 수 있다는 걸 직접 경험해 보세요.</p>
        <button onClick={onSignup} style={{
          padding: "0.875rem 2.5rem", borderRadius: "100px",
          background: "#1A1714", color: "white", border: "none",
          fontSize: "1rem", cursor: "pointer", fontFamily: "inherit", fontWeight: 500,
        }}>무료로 시작하기 →</button>
      </section>

      {/* 푸터 */}
      <footer style={{
        padding: "2.5rem 3rem", borderTop: "0.5px solid rgba(26,23,20,0.1)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        fontSize: "0.8125rem", color: "#8A8278",
      }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: "1rem", fontWeight: 700 }}>
          Travel<span style={{ color: "#C4622D", fontStyle: "italic" }}>og</span>
        </div>
        <span>© 2025 Travelog. 모든 권리 보유.</span>
        <span>개인정보처리방침 · 이용약관</span>
      </footer>

    </div>
  );
}