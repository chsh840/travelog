import { useState, useEffect } from "react";
import { onAuthChange, logOut } from "./services/authService";
import Auth from "./Auth";
import WriteTrip from "./WriteTrip";
import MyPage from "./MyPage";
import TripDetail from "./TripDetail";

type Page = "home" | "write" | "mypage" | "detail";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<Page>("home");
  const [editingTrip, setEditingTrip] = useState<any>(null);
  const [selectedTripId, setSelectedTripId] = useState<string>("");

  useEffect(() => {
    const unsub = onAuthChange((u: any) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        background: "#F5F0E8",
      }}>
        <p style={{ color: "#8A8278" }}>로딩 중...</p>
      </div>
    );
  }

  if (!user) return <Auth />;

  if (page === "write") {
    return (
      <WriteTrip
        user={user}
        editingTrip={editingTrip}
        onBack={() => {
          setEditingTrip(null);
          setPage("mypage");
        }}
      />
    );
  }

  if (page === "detail") {
    return (
      <TripDetail
        tripId={selectedTripId}
        onBack={() => setPage("mypage")}
        onEdit={(trip: any) => {
          setEditingTrip(trip);
          setPage("write");
        }}
      />
    );
  }

  if (page === "mypage") {
    return (
      <MyPage
        user={user}
        onWrite={() => {
          setEditingTrip(null);
          setPage("write");
        }}
        onEdit={(trip: any) => {
          setEditingTrip(trip);
          setPage("write");
        }}
        onDetail={(tripId: string) => {
          setSelectedTripId(tripId);
          setPage("detail");
        }}
      />
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8", fontFamily: "sans-serif" }}>
      <div style={{
        background: "white", borderBottom: "0.5px solid rgba(26,23,20,0.1)",
        padding: "1rem 2rem", display: "flex",
        alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ fontSize: "1.25rem", fontWeight: 700, cursor: "pointer" }}
          onClick={() => setPage("home")}>
          Travel<span style={{ color: "#C4622D", fontStyle: "italic" }}>og</span>
        </div>
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button onClick={() => setPage("mypage")} style={{
            padding: "0.5rem 1rem", borderRadius: "8px",
            background: "transparent", color: "#8A8278",
            border: "1px solid rgba(26,23,20,0.12)",
            fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit",
          }}>
            👤 마이 페이지
          </button>
          <button onClick={() => { setEditingTrip(null); setPage("write"); }} style={{
            padding: "0.5rem 1.25rem", borderRadius: "8px",
            background: "#1A1714", color: "white", border: "none",
            fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit",
          }}>
            + 새 여행 기록
          </button>
          <button onClick={logOut} style={{
            padding: "0.5rem 1rem", borderRadius: "8px",
            background: "transparent", color: "#8A8278",
            border: "1px solid rgba(26,23,20,0.12)",
            fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit",
          }}>
            로그아웃
          </button>
        </div>
      </div>
      <div style={{ maxWidth: "720px", margin: "4rem auto", padding: "0 2rem", textAlign: "center" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🗺️</div>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", marginBottom: "0.75rem" }}>
          어서오세요, {user.email?.split("@")[0]}님!
        </h2>
        <p style={{ color: "#8A8278", marginBottom: "2.5rem", lineHeight: 1.7 }}>
          오늘도 여행을 기록해볼까요?
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <button onClick={() => { setEditingTrip(null); setPage("write"); }} style={{
            padding: "0.875rem 2rem", borderRadius: "100px",
            background: "#1A1714", color: "white", border: "none",
            fontSize: "1rem", cursor: "pointer", fontFamily: "inherit",
          }}>
            여행 기록하기 →
          </button>
          <button onClick={() => setPage("mypage")} style={{
            padding: "0.875rem 2rem", borderRadius: "100px",
            background: "white", color: "#1A1714",
            border: "1px solid rgba(26,23,20,0.12)",
            fontSize: "1rem", cursor: "pointer", fontFamily: "inherit",
          }}>
            내 여행 보기
          </button>
        </div>
      </div>
    </div>
  );
}