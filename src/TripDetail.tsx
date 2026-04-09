import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getTrip } from "./services/tripService";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface Props {
  tripId: string;
  onBack: () => void;
  onEdit: (trip: any) => void;
}

export default function TripDetail({ tripId, onBack, onEdit }: Props) {
  const [trip, setTrip] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadTrip(); }, [tripId]);

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

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F0E8" }}>
      <p style={{ color: "#8A8278" }}>불러오는 중...</p>
    </div>
  );

  if (!trip) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#F5F0E8" }}>
      <p style={{ color: "#8A8278" }}>여행 기록을 찾을 수 없어요</p>
    </div>
  );

  const sortedLocations = trip.locations
    ? [...trip.locations].sort((a: any, b: any) =>
        `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
      )
    : [];

  const mapCenter: [number, number] = sortedLocations.length > 0
    ? [sortedLocations[0].lat, sortedLocations[0].lng]
    : [37.5665, 126.9780];

  const polylinePositions = sortedLocations.map((l: any) => [l.lat, l.lng] as [number, number]);

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
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.875rem", color: "#8A8278" }}>← 뒤로</button>
          <span style={{ color: "rgba(26,23,20,0.2)" }}>|</span>
          <span style={{ fontSize: "0.9375rem", fontWeight: 500 }}>여행 기록</span>
        </div>
        <button onClick={() => onEdit(trip)} style={{
          padding: "0.4375rem 1rem", borderRadius: "8px",
          background: "transparent", color: "#8A8278",
          border: "1px solid rgba(26,23,20,0.12)",
          fontSize: "0.8125rem", cursor: "pointer", fontFamily: "inherit",
        }}>수정하기</button>
      </div>

      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "2rem" }}>

        {/* 메타 정보 */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
            {trip.country && (
              <span style={{ padding: "0.375rem 0.875rem", borderRadius: "100px", background: "#F0E6DC", color: "#C4622D", fontSize: "0.8125rem", fontWeight: 500 }}>
                🌏 {trip.country}{trip.city && ` · ${trip.city}`}
              </span>
            )}
            {trip.startDate && (
              <span style={{ padding: "0.375rem 0.875rem", borderRadius: "100px", background: "white", color: "#8A8278", fontSize: "0.8125rem", border: "0.5px solid rgba(26,23,20,0.1)" }}>
                📅 {trip.startDate}{trip.endDate && ` ~ ${trip.endDate}`}
              </span>
            )}
            <span style={{
              padding: "0.375rem 0.875rem", borderRadius: "100px", fontSize: "0.8125rem", fontWeight: 500,
              background: trip.isPublic ? "#EAF3DE" : "rgba(138,130,120,0.15)",
              color: trip.isPublic ? "#3B6D11" : "#8A8278",
            }}>{trip.isPublic ? "공개" : "비공개"}</span>
          </div>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "2rem", fontWeight: 700, letterSpacing: "-1px", lineHeight: 1.2, marginBottom: "0.75rem" }}>
            {trip.title}
          </h1>
          {trip.subtitle && (
            <p style={{ fontSize: "1.1rem", color: "#8A8278", fontWeight: 300, lineHeight: 1.6 }}>{trip.subtitle}</p>
          )}
        </div>

        {/* 대표 사진 그리드 */}
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
                {media.type === "video"
                  ? <video src={media.url} controls style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <img src={media.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                }
              </div>
            ))}
          </div>
        )}

        {/* 본문 */}
        <div style={{ background: "white", borderRadius: "16px", border: "0.5px solid rgba(26,23,20,0.1)", padding: "2rem", marginBottom: "2rem" }}>
          <p style={{ fontSize: "1rem", lineHeight: 1.9, color: "#1A1714", fontWeight: 300, whiteSpace: "pre-wrap" }}>
            {trip.content}
          </p>
        </div>

        {/* 태그 */}
        {trip.tags?.length > 0 && (
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
            {trip.tags.map((tag: string) => (
              <span key={tag} style={{ fontSize: "0.8125rem", padding: "0.375rem 0.875rem", borderRadius: "100px", background: "white", color: "#8A8278", border: "0.5px solid rgba(26,23,20,0.1)" }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* ── 여행 경로 섹션 ── */}
        {sortedLocations.length > 0 && (
          <div style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "1.25rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              🗺️ 여행 경로
            </h2>

            {/* 지도 */}
            <div style={{ borderRadius: "16px", overflow: "hidden", height: "320px", marginBottom: "1.5rem", border: "0.5px solid rgba(26,23,20,0.1)" }}>
              <MapContainer center={mapCenter} zoom={12} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {polylinePositions.length > 1 && (
                  <Polyline positions={polylinePositions} color="#C4622D" weight={3} opacity={0.7} dashArray="8,4" />
                )}
                {sortedLocations.map((loc: any, i: number) => (
                  <Marker key={loc.id} position={[loc.lat, loc.lng]}>
                    <Popup>
                      <div style={{ minWidth: "140px" }}>
                        <div style={{ fontWeight: 600, fontSize: "0.875rem", marginBottom: "0.25rem" }}>{i + 1}. {loc.name}</div>
                        <div style={{ fontSize: "0.75rem", color: "#8A8278" }}>📅 {loc.date} {loc.time}</div>
                        {loc.memo && <div style={{ fontSize: "0.8125rem", marginTop: "0.25rem" }}>{loc.memo}</div>}
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {/* 타임라인 */}
            <div style={{ position: "relative" }}>
              {/* 세로 연결선 */}
              <div style={{
                position: "absolute", left: "15px", top: "24px",
                bottom: "24px", width: "2px",
                background: "linear-gradient(to bottom, #C4622D, rgba(196,98,45,0.15))",
              }} />

              <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                {sortedLocations.map((loc: any, i: number) => (
                  <div key={loc.id} style={{ display: "flex", gap: "1rem", paddingBottom: i < sortedLocations.length - 1 ? "1.25rem" : "0" }}>

                    {/* 번호 마커 */}
                    <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{
                        width: "32px", height: "32px", borderRadius: "50%",
                        background: "#C4622D", color: "white",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.75rem", fontWeight: 700,
                        border: "3px solid #F5F0E8",
                        zIndex: 1, position: "relative",
                      }}>{i + 1}</div>
                    </div>

                    {/* 카드 */}
                    <div style={{
                      flex: 1, background: "white",
                      borderRadius: "14px",
                      border: "0.5px solid rgba(26,23,20,0.08)",
                      overflow: "hidden",
                      boxShadow: "0 2px 8px rgba(26,23,20,0.04)",
                    }}>
                      {/* 사진/영상 */}
                      {loc.media && loc.media.length > 0 && (
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: loc.media.length === 1 ? "1fr" : loc.media.length === 2 ? "1fr 1fr" : "1fr 1fr 1fr",
                          gap: "2px",
                        }}>
                          {loc.media.slice(0, 3).map((m: any, mi: number) => (
                            <div key={mi} style={{
                              aspectRatio: loc.media.length === 1 ? "16/7" : "1/1",
                              overflow: "hidden", position: "relative",
                            }}>
                              {m.type === "video" ? (
                                <video src={m.url} controls style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              ) : (
                                <img src={m.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              )}
                              {/* 3장 초과 표시 */}
                              {mi === 2 && loc.media.length > 3 && (
                                <div style={{
                                  position: "absolute", inset: 0,
                                  background: "rgba(26,23,20,0.55)",
                                  display: "flex", alignItems: "center", justifyContent: "center",
                                  color: "white", fontSize: "1.1rem", fontWeight: 700,
                                }}>+{loc.media.length - 3}</div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* 텍스트 */}
                      <div style={{ padding: "0.875rem 1rem" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
                          <div style={{ fontFamily: "Georgia, serif", fontSize: "1rem", fontWeight: 600, color: "#1A1714" }}>
                            {loc.name}
                          </div>
                          <div style={{ fontSize: "0.7rem", color: "#8A8278", whiteSpace: "nowrap", paddingTop: "2px" }}>
                            {loc.date} {loc.time}
                          </div>
                        </div>
                        {loc.memo && (
                          <p style={{ fontSize: "0.875rem", color: "#5C5650", lineHeight: 1.65, marginTop: "0.375rem", whiteSpace: "pre-wrap" }}>
                            {loc.memo}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}