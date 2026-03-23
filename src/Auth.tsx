import { useState } from "react";
import { signUp, signIn, signInWithGoogle } from "./services/authService";

interface Props {
  defaultTab?: "login" | "signup";
  onBack?: () => void;
}

export default function Auth({ defaultTab = "login", onBack }: Props) {
  const [tab, setTab] = useState<"login" | "signup">(defaultTab);
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    setMessage("");
    try {
      if (tab === "signup") {
        if (!nickname.trim()) {
          setMessage("error:닉네임을 입력해주세요");
          setLoading(false);
          return;
        }
        if (nickname.length < 2 || nickname.length > 15) {
          setMessage("error:닉네임은 2~15자 사이로 입력해주세요");
          setLoading(false);
          return;
        }
        await signUp(email, password, name, nickname);
        setMessage("success:회원가입 성공! 🎉 환영합니다!");
      } else {
        await signIn(email, password);
        setMessage("success:로그인 성공! ✅");
      }
    } catch (err: any) {
      const msg =
        err.code === "auth/email-already-in-use" ? "이미 사용 중인 이메일이에요" :
        err.code === "auth/wrong-password" || err.code === "auth/invalid-credential" ? "이메일 또는 비밀번호가 틀렸어요" :
        err.code === "auth/weak-password" ? "비밀번호는 6자 이상이어야 해요" :
        err.code === "auth/user-not-found" ? "존재하지 않는 계정이에요" :
        err.message;
      setMessage("error:" + msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setMessage("error:" + err.message);
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = message.startsWith("success:");
  const msgText = message.replace(/^(success|error):/, "");

  const inputStyle = {
    width: "100%", padding: "0.75rem 1rem",
    border: "1.5px solid rgba(26,23,20,0.1)", borderRadius: "10px",
    fontSize: "0.9375rem", fontFamily: "inherit",
    background: "#FAFAF9", outline: "none",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    fontSize: "0.8125rem", fontWeight: 500 as const,
    display: "block", marginBottom: "0.5rem",
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#F5F0E8",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Segoe UI', sans-serif", padding: "2rem",
    }}>

      {onBack && (
        <button onClick={onBack} style={{
          position: "fixed", top: "1.5rem", left: "1.5rem",
          background: "none", border: "none", cursor: "pointer",
          fontSize: "0.875rem", color: "#8A8278", fontFamily: "inherit",
          display: "flex", alignItems: "center", gap: "0.375rem",
        }}>← 홈으로</button>
      )}

      <div style={{
        fontFamily: "Georgia, serif", fontSize: "2rem",
        fontWeight: 700, marginBottom: "2.5rem", letterSpacing: "-0.5px",
      }}>
        Travel<span style={{ color: "#C4622D", fontStyle: "italic" }}>og</span>
      </div>

      <div style={{
        background: "white", borderRadius: "24px",
        border: "0.5px solid rgba(26,23,20,0.1)",
        padding: "2.5rem", width: "100%", maxWidth: "420px",
        boxShadow: "0 8px 40px rgba(26,23,20,0.08)",
      }}>

        {/* 탭 */}
        <div style={{
          display: "flex", background: "#F5F0E8",
          borderRadius: "12px", padding: "4px", marginBottom: "2rem",
        }}>
          {(["login", "signup"] as const).map((t) => (
            <button key={t} onClick={() => { setTab(t); setMessage(""); }} style={{
              flex: 1, padding: "0.625rem", borderRadius: "9px",
              border: "none", cursor: "pointer", fontFamily: "inherit",
              fontSize: "0.9rem", transition: "all 0.2s",
              background: tab === t ? "white" : "transparent",
              color: tab === t ? "#1A1714" : "#8A8278",
              fontWeight: tab === t ? 600 : 400,
              boxShadow: tab === t ? "0 1px 4px rgba(26,23,20,0.1)" : "none",
            }}>
              {t === "login" ? "로그인" : "회원가입"}
            </button>
          ))}
        </div>

        <h2 style={{
          fontFamily: "Georgia, serif", fontSize: "1.625rem",
          marginBottom: "0.25rem", letterSpacing: "-0.5px", color: "#1A1714",
        }}>
          {tab === "login" ? "다시 돌아오셨군요" : "여행을 시작하세요"}
        </h2>
        <p style={{ fontSize: "0.875rem", color: "#8A8278", marginBottom: "1.75rem" }}>
          {tab === "login" ? "계정에 로그인하고 여행을 이어가세요" : "무료로 가입하고 첫 번째 여행을 기록해보세요"}
        </p>

        {/* 회원가입 전용 필드 */}
        {tab === "signup" && (
          <>
            {/* 이름 */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>이름</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                placeholder="홍길동" style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#C4622D"}
                onBlur={e => e.target.style.borderColor = "rgba(26,23,20,0.1)"}
              />
            </div>

            {/* 닉네임 */}
            <div style={{ marginBottom: "1rem" }}>
              <label style={labelStyle}>닉네임</label>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: "1rem", top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "0.9375rem", color: "#8A8278",
                }}>@</span>
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value.replace(/[^a-zA-Z0-9_가-힣]/g, ""))}
                  placeholder="traveler_kim"
                  maxLength={15}
                  style={{ ...inputStyle, paddingLeft: "2rem" }}
                  onFocus={e => e.target.style.borderColor = "#C4622D"}
                  onBlur={e => e.target.style.borderColor = "rgba(26,23,20,0.1)"}
                />
              </div>
              <p style={{ fontSize: "0.7rem", color: "#8A8278", marginTop: "0.375rem" }}>
                2~15자, 한글/영문/숫자/_ 사용 가능 ({nickname.length}/15)
              </p>
            </div>
          </>
        )}

        {/* 이메일 */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>이메일</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)}
            type="email" placeholder="hello@travelog.app" style={inputStyle}
            onFocus={e => e.target.style.borderColor = "#C4622D"}
            onBlur={e => e.target.style.borderColor = "rgba(26,23,20,0.1)"}
          />
        </div>

        {/* 비밀번호 */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={labelStyle}>비밀번호</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)}
            type="password" placeholder="6자 이상 입력" style={inputStyle}
            onFocus={e => e.target.style.borderColor = "#C4622D"}
            onBlur={e => e.target.style.borderColor = "rgba(26,23,20,0.1)"}
          />
        </div>

        {/* 메시지 */}
        {message && (
          <div style={{
            padding: "0.75rem 1rem", borderRadius: "10px", marginBottom: "1rem",
            fontSize: "0.875rem",
            background: isSuccess ? "#EAF3DE" : "#FCEBEB",
            color: isSuccess ? "#3B6D11" : "#A32D2D",
          }}>
            {msgText}
          </div>
        )}

        {/* 제출 버튼 */}
        <button onClick={handleSubmit} disabled={loading} style={{
          width: "100%", padding: "0.875rem",
          background: "#1A1714", color: "white",
          border: "none", borderRadius: "10px",
          fontSize: "0.9375rem", fontFamily: "inherit",
          fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1, marginBottom: "1rem",
        }}>
          {loading ? "처리 중..." : tab === "login" ? "로그인" : "무료로 시작하기"}
        </button>

        {/* 구분선 */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(26,23,20,0.1)" }} />
          <span style={{ fontSize: "0.8125rem", color: "#8A8278" }}>또는</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(26,23,20,0.1)" }} />
        </div>

        {/* 구글 로그인 */}
        <button onClick={handleGoogle} disabled={loading} style={{
          width: "100%", padding: "0.75rem",
          background: "white", color: "#1A1714",
          border: "1.5px solid rgba(26,23,20,0.1)", borderRadius: "10px",
          fontSize: "0.875rem", fontFamily: "inherit",
          cursor: "pointer", display: "flex",
          alignItems: "center", justifyContent: "center", gap: "0.625rem",
        }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(26,23,20,0.3)")}
          onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(26,23,20,0.1)")}
        >
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" fill="#4285F4" />
          </svg>
          Google로 계속하기
        </button>
      </div>

      <p style={{ marginTop: "1.5rem", fontSize: "0.875rem", color: "#8A8278" }}>
        {tab === "login" ? "아직 계정이 없으신가요? " : "이미 계정이 있으신가요? "}
        <span
          onClick={() => { setTab(tab === "login" ? "signup" : "login"); setMessage(""); }}
          style={{ color: "#C4622D", cursor: "pointer", fontWeight: 500 }}
        >
          {tab === "login" ? "회원가입" : "로그인"}
        </span>
      </p>
    </div>
  );
}