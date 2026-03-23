import { useState, useEffect } from "react";
import { getMyTrips, deleteTrip } from "./services/tripService";
import { getUserProfile } from "./services/authService";

interface Props {
  user: any;
  onWrite: () => void;
  onEdit: (trip: any) => void;
  onDetail: (tripId: string) => void;
}

export default function MyPage({ user, onWrite, onEdit, onDetail }: Props) {
  const [trips, setTrips] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tripsData, profileData] = await Promise.all([
        getMyTrips(user.uid),
        getUserProfile(user.uid),
      ]);
      setTrips(tripsData);
      setProfile(profileData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, tripId: string) => {
    e.stopPropagation();
    if (!confirm("정말 삭제할까요?")) return;
    try {
      await deleteTrip(tripId, user.uid);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
    } catch (err: any) {
      alert("삭제 실패: " + err.message);
    }
  };

  const handleEdit = (e: React.MouseEvent, trip: any) => {
    e.stopPropagation();
    onEdit(trip);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        background: "#F5F0E8",
      }}>
        <p style={{ color: "#8A8278" }}>불러오는 중...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8", fontFamily: "sans-serif" }}>

      {/* 프로필 히어로 */}
      <div style={{
        background: "#1A1714", padding: "3rem 2rem",
        display: "flex", alignItems: "center", gap: "2rem",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "-40%", right: "-10%",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(196,98,45,0.18) 0%, transparent 70%)",
        }} />
        <div style={{
          width: "72px", height: "72px", borderRadius: "50%",
          background: "#F0E6DC", display: "flex",
          alignItems: "center", justifyContent: "center",
          fontSize: "1.75rem", color: "#C4622D",
          border: "3px solid rgba(245,240,232,0.15)",
          flexShrink: 0, zIndex: 1,
        }}>
          {profile?.name?.[0] || user.email?.[0]?.toUpperCase() || "?"}
        </div>
        <div style={{ flex: 1, zIndex: 1 }}>
          <div style={{
            fontSize: "1.5rem", color: "#F5F0E8",
            fontWeight: 700, fontFamily: "Georgia, serif",
          }}>
            {profile?.name || "여행자"}
          </div>
          <div style={{ fontSize: "0.875rem", color: "rgba(245,240,232,0.45)", marginTop: "0.25rem" }}>
            {user.email}
          </div>
        </div>
        <div style={{ display: "flex", gap: "2rem", zIndex: 1 }}>
          {[
            { num: trips.length, label: "여행" },
            { num: profile?.countryCount || 0, label: "나라" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{
                fontSize: "2rem", fontWeight: 700, color: "#F5F0E8",
                fontFamily: "Georgia, serif", lineHeight: 1,
              }}>{s.num}</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(245,240,232,0.4)", marginTop: "0.25rem" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 콘텐츠 */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", marginBottom: "1.5rem",
        }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.25rem" }}>
            내 여행 기록 ({trips.length})
          </h2>
          <button onClick={onWrite} style={{
            padding: "0.5rem 1.25rem", borderRadius: "8px",
            background: "#1A1714", color: "white", border: "none",
            fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit",
          }}>
            + 새 여행 기록
          </button>
        </div>

        {trips.length === 0 ? (
          <div style={{
            background: "white", border: "0.5px solid rgba(26,23,20,0.1)",
            borderRadius: "16px", padding: "4rem", textAlign: "center",
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🗺️</div>
            <p style={{ color: "#8A8278", marginBottom: "1.5rem" }}>아직 여행 기록이 없어요</p>
            <button onClick={onWrite} style={{
              padding: "0.75rem 1.5rem", borderRadius: "100px",
              background: "#1A1714", color: "white", border: "none",
              fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit",
            }}>
              첫 여행 기록하기 →
            </button>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1rem",
          }}>
            {trips.map((trip) => (
              <div
                key={trip.id}
                onClick={() => onDetail(trip.id)}
                style={{
                  background: "white",
                  border: "0.5px solid rgba(26,23,20,0.1)",
                  borderRadius: "16px", padding: "1.25rem",
                  cursor: "pointer", transition: "all 0.2s",
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "translateY(-3px)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "translateY(0)")}
              >
                {/* 썸네일 */}
                <div style={{
                  height: "120px", borderRadius: "10px",
                  overflow: "hidden",
                  background: "linear-gradient(135deg, #F0E6DC, #E8D0B8)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "2.5rem", marginBottom: "1rem", position: "relative",
                }}>
                  {trip.mediaUrls?.length > 0 ? (
                    <img
                      src={trip.mediaUrls[0].url}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : "🗺️"}
                  <div style={{
                    position: "absolute", top: "0.5rem", right: "0.5rem",
                    fontSize: "0.65rem", padding: "0.2rem 0.5rem",
                    borderRadius: "100px", fontWeight: 500,
                    background: trip.isPublic ? "#EAF3DE" : "rgba(138,130,120,0.15)",
                    color: trip.isPublic ? "#3B6D11" : "#8A8278",
                  }}>
                    {trip.isPublic ? "공개" : "비공개"}
                  </div>
                </div>

                <h3 style={{
                  fontFamily: "Georgia, serif", fontSize: "1rem",
                  marginBottom: "0.375rem", whiteSpace: "nowrap",
                  overflow: "hidden", textOverflow: "ellipsis",
                }}>
                  {trip.title}
                </h3>
                <p style={{ fontSize: "0.8125rem", color: "#8A8278", marginBottom: "0.5rem" }}>
                  {trip.country && `🌏 ${trip.country}`} {trip.city && `· ${trip.city}`}
                </p>
                <p style={{ fontSize: "0.75rem", color: "#8A8278", marginBottom: "0.75rem" }}>
                  {trip.startDate} {trip.endDate && `~ ${trip.endDate}`}
                </p>

                {trip.tags?.length > 0 && (
                  <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap", marginBottom: "0.875rem" }}>
                    {trip.tags.slice(0, 3).map((tag: string) => (
                      <span key={tag} style={{
                        fontSize: "0.65rem", padding: "0.2rem 0.5rem",
                        borderRadius: "100px", background: "#F5F0E8", color: "#8A8278",
                      }}>#{tag}</span>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button onClick={(e) => handleEdit(e, trip)} style={{
                    flex: 1, padding: "0.5rem", borderRadius: "8px",
                    background: "#F5F0E8", border: "none",
                    fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit",
                    color: "#1A1714",
                  }}>
                    수정
                  </button>
                  <button onClick={(e) => handleDelete(e, trip.id)} style={{
                    flex: 1, padding: "0.5rem", borderRadius: "8px",
                    background: "#FCEBEB", border: "none",
                    fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit",
                    color: "#A32D2D",
                  }}>
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}