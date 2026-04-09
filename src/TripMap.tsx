import { useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export interface MarkerMedia {
  url: string;           // 임시 blob URL or 실제 Cloudinary URL
  type: "image" | "video";
  name: string;
  file?: File;           // 아직 업로드 안 된 경우 File 객체 보관
}

export interface MapLocation {
  id: string;
  lat: number;
  lng: number;
  name: string;
  memo: string;
  date: string;
  time: string;
  media?: MarkerMedia[];
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

interface Props {
  locations: MapLocation[];
  onAdd: (location: MapLocation) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<MapLocation>) => void;
  startDate?: string;
  endDate?: string;
}

function MapFlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap();
  if (target) {
    map.flyTo(target, 14, { animate: true, duration: 1.0 });
  }
  return null;
}

function MapClickHandler({ onAdd }: { onAdd: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) { onAdd(e.latlng.lat, e.latlng.lng); },
  });
  return null;
}

function getDateRange(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  const current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

function shortName(result: SearchResult): string {
  return result.display_name.split(",").slice(0, 3).join(",").trim();
}

export default function TripMap({ locations, onAdd, onRemove, onUpdate, startDate, endDate }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editMemo, setEditMemo] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editMedia, setEditMedia] = useState<MarkerMedia[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [flyTarget, setFlyTarget] = useState<[number, number] | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dateRange = startDate && endDate ? getDateRange(startDate, endDate) : [];

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setShowResults(false);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!value.trim()) { setSearchResults([]); return; }

    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=6&accept-language=ko`,
          { headers: { "Accept-Language": "ko" } }
        );
        const data: SearchResult[] = await res.json();
        setSearchResults(data);
        setShowResults(true);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  const handleSelectResult = (result: SearchResult) => {
    setFlyTarget([parseFloat(result.lat), parseFloat(result.lon)]);
    setSearchQuery(shortName(result));
    setShowResults(false);
    setTimeout(() => setFlyTarget(null), 1500);
  };

  const handleListClick = (loc: MapLocation) => {
    setFlyTarget([loc.lat, loc.lng]);
    setTimeout(() => setFlyTarget(null), 1500);
  };

  const handleMapClick = (lat: number, lng: number) => {
    const now = new Date();
    const newLocation: MapLocation = {
      id: Date.now().toString(),
      lat, lng,
      name: `장소 ${locations.length + 1}`,
      memo: "",
      date: startDate || now.toISOString().split("T")[0],
      time: now.toTimeString().slice(0, 5),
      media: [],
    };
    onAdd(newLocation);
    setEditingId(newLocation.id);
    setEditName(newLocation.name);
    setEditMemo(newLocation.memo);
    setEditDate(newLocation.date);
    setEditTime(newLocation.time);
    setEditMedia([]);
  };

  const startEdit = (loc: MapLocation) => {
    setEditingId(loc.id);
    setEditName(loc.name);
    setEditMemo(loc.memo);
    setEditDate(loc.date);
    setEditTime(loc.time);
    setEditMedia(loc.media || []);
  };

  const saveEdit = () => {
    if (editingId) {
      onUpdate(editingId, { name: editName, memo: editMemo, date: editDate, time: editTime, media: editMedia });
      setEditingId(null);
    }
  };

  // 파일 선택 → blob URL + File 객체 함께 보관
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const isVideo = file.type.startsWith("video/");
      const blobUrl = URL.createObjectURL(file);
      setEditMedia(prev => [...prev, {
        url: blobUrl,
        type: isVideo ? "video" : "image",
        name: file.name,
        file,          // File 객체 보관 → 나중에 WriteTrip에서 업로드
      }]);
    });
    e.target.value = "";
  };

  const handleRemoveMedia = (index: number) => {
    setEditMedia(prev => prev.filter((_, i) => i !== index));
  };

  const positions = [...locations]
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .map(l => [l.lat, l.lng] as [number, number]);

  const center = locations.length > 0
    ? [locations[0].lat, locations[0].lng] as [number, number]
    : [37.5665, 126.9780] as [number, number];

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.5rem 0.75rem",
    border: "1px solid rgba(26,23,20,0.12)", borderRadius: "8px",
    fontSize: "0.8125rem", fontFamily: "inherit",
    outline: "none", boxSizing: "border-box",
    marginBottom: "0.5rem", background: "white",
  };

  const sortedLocations = [...locations].sort((a, b) =>
    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
  );

  return (
    <div style={{ position: "relative" }}>

      {/* 검색창 */}
      <div style={{ position: "relative", marginBottom: "0.875rem" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "0.5rem",
          background: "white", border: "1.5px solid rgba(26,23,20,0.12)",
          borderRadius: "10px", padding: "0 0.75rem",
          boxShadow: showResults ? "0 4px 20px rgba(26,23,20,0.08)" : "none",
          transition: "box-shadow 0.2s",
        }}>
          <span style={{ fontSize: "1rem", color: "#C4622D", flexShrink: 0 }}>🔍</span>
          <input
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
            placeholder="도시나 장소를 검색해서 지도를 이동하세요"
            style={{
              flex: 1, border: "none", outline: "none",
              fontSize: "0.9rem", fontFamily: "inherit",
              padding: "0.75rem 0", background: "transparent", color: "#1A1714",
            }}
          />
          {searching && <span style={{ fontSize: "0.75rem", color: "#8A8278", flexShrink: 0 }}>검색 중...</span>}
          {searchQuery && !searching && (
            <button onClick={() => { setSearchQuery(""); setSearchResults([]); setShowResults(false); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#8A8278", fontSize: "1rem", padding: 0, flexShrink: 0 }}>
              ✕
            </button>
          )}
        </div>

        {showResults && searchResults.length > 0 && (
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
            background: "white", borderRadius: "12px",
            border: "1px solid rgba(26,23,20,0.1)",
            boxShadow: "0 8px 30px rgba(26,23,20,0.12)",
            zIndex: 1000, overflow: "hidden",
          }}>
            {searchResults.map((result, i) => (
              <button key={result.place_id} onClick={() => handleSelectResult(result)}
                style={{
                  width: "100%", textAlign: "left", padding: "0.75rem 1rem",
                  background: "none", border: "none", cursor: "pointer", fontFamily: "inherit",
                  borderBottom: i < searchResults.length - 1 ? "0.5px solid rgba(26,23,20,0.06)" : "none",
                  display: "flex", alignItems: "flex-start", gap: "0.625rem",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#FBF7F3")}
                onMouseLeave={e => (e.currentTarget.style.background = "none")}
              >
                <span style={{ fontSize: "0.9rem", marginTop: "1px", flexShrink: 0 }}>📍</span>
                <div>
                  <div style={{ fontSize: "0.875rem", color: "#1A1714", fontWeight: 500, lineHeight: 1.4 }}>
                    {shortName(result)}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#8A8278", marginTop: "2px" }}>
                    {result.display_name.split(",").slice(1, 4).join(",").trim()}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {showResults && searchResults.length === 0 && !searching && searchQuery && (
          <div style={{
            position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
            background: "white", borderRadius: "12px",
            border: "1px solid rgba(26,23,20,0.1)",
            boxShadow: "0 8px 30px rgba(26,23,20,0.12)",
            padding: "1rem", textAlign: "center",
            fontSize: "0.875rem", color: "#8A8278", zIndex: 1000,
          }}>
            검색 결과가 없어요
          </div>
        )}
      </div>

      {/* 안내 */}
      <div style={{
        background: "#F0E6DC", borderRadius: "10px",
        padding: "0.75rem 1rem", marginBottom: "0.875rem",
        fontSize: "0.8125rem", color: "#C4622D",
        display: "flex", alignItems: "center", gap: "0.5rem",
      }}>
        📍 검색으로 지도를 이동한 뒤, 지도를 직접 클릭해서 장소를 추가하세요.
      </div>

      {/* 지도 */}
      <div style={{ borderRadius: "12px", overflow: "hidden", height: "400px" }}>
        <MapContainer center={center} zoom={13} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onAdd={handleMapClick} />
          <MapFlyTo target={flyTarget} />

          {positions.length > 1 && (
            <Polyline positions={positions} color="#C4622D" weight={3} opacity={0.7} dashArray="8,4" />
          )}

          {locations.map((loc, i) => (
            <Marker key={loc.id} position={[loc.lat, loc.lng]}>
              <Popup minWidth={240}>
                {editingId === loc.id ? (
                  <div style={{ minWidth: "240px" }}>
                    <div style={{ fontWeight: 600, marginBottom: "0.5rem", fontSize: "0.8125rem" }}>장소 편집</div>

                    <input value={editName} onChange={e => setEditName(e.target.value)}
                      style={inputStyle} placeholder="장소 이름" />

                    <div style={{ marginBottom: "0.5rem" }}>
                      <div style={{ fontSize: "0.7rem", color: "#8A8278", marginBottom: "0.25rem" }}>날짜</div>
                      {dateRange.length > 0 ? (
                        <select value={editDate} onChange={e => setEditDate(e.target.value)} style={inputStyle}>
                          {dateRange.map((d, idx) => (
                            <option key={d} value={d}>Day {idx + 1} ({d})</option>
                          ))}
                        </select>
                      ) : (
                        <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} style={inputStyle} />
                      )}
                    </div>

                    <div style={{ marginBottom: "0.5rem" }}>
                      <div style={{ fontSize: "0.7rem", color: "#8A8278", marginBottom: "0.25rem" }}>시간</div>
                      <input type="time" value={editTime} onChange={e => setEditTime(e.target.value)} style={inputStyle} />
                    </div>

                    <textarea value={editMemo} onChange={e => setEditMemo(e.target.value)}
                      style={{ ...inputStyle, resize: "none" as const }} rows={2} placeholder="메모 (선택)" />

                    {/* 미디어 첨부 */}
                    <div style={{ marginBottom: "0.5rem" }}>
                      <div style={{ fontSize: "0.7rem", color: "#8A8278", marginBottom: "0.375rem" }}>사진 / 영상</div>
                      {editMedia.length > 0 && (
                        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap", marginBottom: "0.375rem" }}>
                          {editMedia.map((m, mi) => (
                            <div key={mi} style={{
                              position: "relative", width: "60px", height: "60px",
                              borderRadius: "6px", overflow: "hidden",
                              border: "1px solid rgba(26,23,20,0.1)",
                            }}>
                              {m.type === "video" ? (
                                <div style={{
                                  width: "100%", height: "100%", background: "#F5F0E8",
                                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.25rem",
                                }}>🎥</div>
                              ) : (
                                <img src={m.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              )}
                              <button onClick={() => handleRemoveMedia(mi)} style={{
                                position: "absolute", top: "2px", right: "2px",
                                width: "16px", height: "16px", borderRadius: "50%",
                                background: "rgba(26,23,20,0.65)", color: "white",
                                border: "none", cursor: "pointer", fontSize: "9px",
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}>✕</button>
                            </div>
                          ))}
                        </div>
                      )}
                      <label style={{
                        display: "flex", alignItems: "center", gap: "0.375rem",
                        padding: "0.4rem 0.75rem", borderRadius: "7px",
                        border: "1.5px dashed rgba(26,23,20,0.15)",
                        cursor: "pointer", fontSize: "0.75rem", color: "#8A8278",
                        background: "#FAFAF9",
                      }}>
                        <span>📷</span> 사진/영상 추가
                        <input type="file" multiple accept="image/*,video/*"
                          onChange={handleMediaUpload} style={{ display: "none" }} />
                      </label>
                    </div>

                    <div style={{ display: "flex", gap: "0.375rem" }}>
                      <button onClick={(e) => { e.stopPropagation(); saveEdit(); }} style={{
                        flex: 1, padding: "0.375rem", borderRadius: "6px",
                        background: "#1A1714", color: "white", border: "none",
                        fontSize: "0.75rem", cursor: "pointer",
                      }}>저장</button>
                      <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }} style={{
                        flex: 1, padding: "0.375rem", borderRadius: "6px",
                        background: "#F5F0E8", border: "none",
                        fontSize: "0.75rem", cursor: "pointer",
                      }}>취소</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ minWidth: "200px" }}>
                    <div style={{ fontWeight: 600, marginBottom: "0.25rem", fontSize: "0.875rem" }}>
                      {i + 1}. {loc.name}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#8A8278", marginBottom: "0.25rem" }}>📅 {loc.date}</div>
                    <div style={{ fontSize: "0.75rem", color: "#8A8278", marginBottom: "0.375rem" }}>🕐 {loc.time}</div>
                    {loc.memo && (
                      <div style={{ fontSize: "0.8125rem", color: "#1A1714", marginBottom: "0.5rem" }}>{loc.memo}</div>
                    )}
                    {loc.media && loc.media.length > 0 && (
                      <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap", marginBottom: "0.5rem" }}>
                        {loc.media.map((m, mi) => (
                          <div key={mi} style={{
                            width: "52px", height: "52px", borderRadius: "5px", overflow: "hidden",
                            border: "1px solid rgba(26,23,20,0.1)",
                          }}>
                            {m.type === "video" ? (
                              <div style={{
                                width: "100%", height: "100%", background: "#F5F0E8",
                                display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem",
                              }}>🎥</div>
                            ) : (
                              <img src={m.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={{ display: "flex", gap: "0.375rem" }}>
                      <button onClick={(e) => { e.stopPropagation(); startEdit(loc); }} style={{
                        flex: 1, padding: "0.375rem", borderRadius: "6px",
                        background: "#F5F0E8", border: "none", fontSize: "0.75rem", cursor: "pointer",
                      }}>수정</button>
                      <button onClick={(e) => { e.stopPropagation(); onRemove(loc.id); }} style={{
                        flex: 1, padding: "0.375rem", borderRadius: "6px",
                        background: "#FCEBEB", border: "none", fontSize: "0.75rem", cursor: "pointer", color: "#A32D2D",
                      }}>삭제</button>
                    </div>
                  </div>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* 장소 목록 */}
      {sortedLocations.length > 0 && (
        <div style={{ marginTop: "1rem" }}>
          <div style={{ fontSize: "0.8125rem", color: "#8A8278", marginBottom: "0.625rem" }}>
            📍 {locations.length}개 장소 · 클릭하면 해당 위치로 이동해요
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {sortedLocations.map((loc, i) => (
              <div key={loc.id} onClick={() => handleListClick(loc)}
                style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  padding: "0.625rem 0.875rem",
                  background: "#F5F0E8", borderRadius: "8px",
                  fontSize: "0.8125rem", cursor: "pointer", transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#EDE5D8")}
                onMouseLeave={e => (e.currentTarget.style.background = "#F5F0E8")}
              >
                <div style={{
                  width: "22px", height: "22px", borderRadius: "50%",
                  background: "#C4622D", color: "white",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.7rem", fontWeight: 600, flexShrink: 0,
                }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{loc.name}</div>
                  {loc.memo && <div style={{ color: "#8A8278", fontSize: "0.75rem" }}>{loc.memo}</div>}
                  {loc.media && loc.media.length > 0 && (
                    <div style={{ fontSize: "0.7rem", color: "#C4622D", marginTop: "2px" }}>
                      📎 {loc.media.length}개 첨부
                    </div>
                  )}
                </div>
                <div style={{ color: "#8A8278", fontSize: "0.75rem", textAlign: "right" as const }}>
                  <div>{loc.date}</div>
                  <div>{loc.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}