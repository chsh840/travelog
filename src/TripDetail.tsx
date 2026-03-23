import { useState, useEffect } from "react";
import { getTrip } from "./services/tripService";

interface Props {
  tripId: string;
  onBack: () => void;
  onEdit: (trip: any) => void;
}

export default function TripDetail({ tripId, onBack, onEdit }: Props) {
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrip();
  }, [tripId]);

  const loadTrip = async () => {
    setLoading(true);
    try {
      const data = await getTrip(tripId);
      setTrip(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  if (!trip) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        background: "#F5F0E8",
      }}>
        <p style={{ color: "#8A8278" }}>여행 기록을 찾을 수 없어요</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F5F0E8", fontFamily: "sans-serif" }}>

      {/* 상단 바 */}
      <div style={{
        background: "white", borderBottom: "0.5px solid rgba(26,23,20,0.1)",
        padding: "0.875rem 2rem", display: "flex",
        alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <button onClick={onBack} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: "0.875rem", color: "#8A8278",
          }}>← 뒤로</button>
          <span style={{ color: "rgba(26,23,20,0.2)" }}>|</span>
          <span style={{ fontSize: "0.9375rem", fontWeight: 500 }}>여행 기록</span>
        </div>
        <button onClick={() => onEdit(trip)} style={{
          padding: "0.4375rem 1rem", borderRadius: "8px",
          background: "transparent", color: "#8A8278",
          border: "1px solid rgba(26,23,20,0.12)",
          fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit",
        }}>
          수정하기
        </button>
      </div>

      {/* 본문 */}
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "2rem" }}>

        {/* 메타 정보 */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
            {trip.country && (
              <span style={{
                padding: "0.375rem 0.875rem", borderRadius: "100px",
                background: "#F0E6DC", color: "#C4622D", fontSize: "0.8125rem", fontWeight: 500,
              }}>
                🌏 {trip.country} {trip.city && `· ${trip.city}`}
              </span>
            )}
            {trip.startDate && (
              <span style={{
                padding: "0.375rem 0.875rem", borderRadius: "100px",
                background: "white", color: "#8A8278", fontSize: "0.8125rem",
                border: "0.5px solid rgba(26,23,20,0.1)",
              }}>
                📅 {trip.startDate} {trip.endDate && `~ ${trip.endDate}`}
              </span>
            )}
            <span style={{
              padding: "0.375rem 0.875rem", borderRadius: "100px",
              fontSize: "0.8125rem", fontWeight: 500,
              background: trip.isPublic ? "#EAF3DE" : "rgba(138,130,120,0.15)",
              color: trip.isPublic ? "#3B6D11" : "#8A8278",
            }}>
              {trip.isPublic ? "공개" : "비공개"}
            </span>
          </div>

          <h1 style={{
            fontFamily: "Georgia, serif", fontSize: "2rem",
            fontWeight: 700, letterSpacing: "-1px",
            lineHeight: 1.2, marginBottom: "0.75rem",
          }}>
            {trip.title}
          </h1>

          {trip.subtitle && (
            <p style={{ fontSize: "1.1rem", color: "#8A8278", fontWeight: 300, lineHeight: 1.6 }}>
              {trip.subtitle}
            </p>
          )}
        </div>

        {/* 사진 그리드 */}
        {trip.mediaUrls?.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: trip.mediaUrls.length === 1 ? "1fr" : "repeat(2, 1fr)",
            gap: "0.75rem", marginBottom: "2rem",
            borderRadius: "16px", overflow: "hidden",
          }}>
            {trip.mediaUrls.map((media: any, i: number) => (
              <div key={i} style={{
                aspectRatio: trip.mediaUrls.length === 1 ? "16/9" : "4/3",
                overflow: "hidden",
                gridColumn: trip.mediaUrls.length === 3 && i === 0 ? "span 2" : "auto",
              }}>
                {media.type === "video" ? (
                  <video src={media.url} controls style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <img src={media.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* 본문 내용 */}
        <div style={{
          background: "white", borderRadius: "16px",
          border: "0.5px solid rgba(26,23,20,0.1)",
          padding: "2rem", marginBottom: "1.25rem",
        }}>
          <p style={{
            fontSize: "1rem", lineHeight: 1.9,
            color: "#1A1714", fontWeight: 300,
            whiteSpace: "pre-wrap",
          }}>
            {trip.content}
          </p>
        </div>

        {/* 태그 */}
        {trip.tags?.length > 0 && (
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {trip.tags.map((tag: string) => (
              <span key={tag} style={{
                fontSize: "0.8125rem", padding: "0.375rem 0.875rem",
                borderRadius: "100px", background: "white",
                color: "#8A8278", border: "0.5px solid rgba(26,23,20,0.1)",
              }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
