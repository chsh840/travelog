import { useState } from "react";
import { createTrip, updateTrip } from "./services/tripService";
import { uploadMultiple, UploadResult } from "./services/cloudinaryService";
import TripMap, { MapLocation } from "./TripMap";

interface Props {
  user: any;
  editingTrip?: any;
  onBack: () => void;
}

export default function WriteTrip({ user, editingTrip, onBack }: Props) {
  const isEdit = !!editingTrip;

  const [title, setTitle] = useState(editingTrip?.title || "");
  const [subtitle, setSubtitle] = useState(editingTrip?.subtitle || "");
  const [country, setCountry] = useState(editingTrip?.country || "");
  const [city, setCity] = useState(editingTrip?.city || "");
  const [startDate, setStartDate] = useState(editingTrip?.startDate || "");
  const [endDate, setEndDate] = useState(editingTrip?.endDate || "");
  const [content, setContent] = useState(editingTrip?.content || "");
  const [tags, setTags] = useState(editingTrip?.tags?.join(", ") || "");
  const [isPublic, setIsPublic] = useState(editingTrip?.isPublic ?? true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaUrls, setMediaUrls] = useState<UploadResult[]>(editingTrip?.mediaUrls || []);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [uploading, setUploading] = useState(false);
  const [coverIndex, setCoverIndex] = useState<number>(editingTrip?.coverIndex ?? 0);
  const [locations, setLocations] = useState<MapLocation[]>(editingTrip?.locations || []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(f =>
      f.type.startsWith("image/") || f.type.startsWith("video/")
    );
    if (validFiles.length !== files.length) {
      setMessage("error:사진(JPG, PNG) 또는 영상(MP4) 파일만 가능해요");
    }
    setMediaFiles(prev => [...prev, ...validFiles]);
  };

  const handleRemoveUploaded = (index: number) => {
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
    setCoverIndex(0);
  };

  const handleRemoveFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setCoverIndex(0);
  };

  const handleSave = async () => {
    if (!title.trim()) { setMessage("error:제목을 입력해주세요"); return; }
    if (!content.trim()) { setMessage("error:내용을 입력해주세요"); return; }
  
    setLoading(true);
    setMessage("");
  
    try {
      // 1. 대표 사진/영상 업로드
      let newMediaUrls: UploadResult[] = [];
      if (mediaFiles.length > 0) {
        setUploading(true);
        setUploadProgress(new Array(mediaFiles.length).fill(0));
        newMediaUrls = await uploadMultiple(mediaFiles, (fileIndex, progress) => {
          setUploadProgress(prev => {
            const updated = [...prev];
            updated[fileIndex] = progress;
            return updated;
          });
        });
        setUploading(false);
      }
  
      // 2. 마커별 미디어 업로드 (file 객체가 있는 것만)
      const uploadedLocations = await Promise.all(
        locations.map(async (loc) => {
          if (!loc.media || loc.media.length === 0) return loc;
  
          const uploadedMedia = await Promise.all(
            loc.media.map(async (m) => {
              if (!m.file) return m; // 이미 업로드된 URL이면 그대로
              const result = await uploadToCloudinary(m.file);
              return {
                url: result.url,
                type: result.type,
                name: m.name,
                // file 필드는 제거 (Firestore에 저장 불가)
              };
            })
          );
  
          return { ...loc, media: uploadedMedia };
        })
      );
  
      const allMediaUrls = [...mediaUrls, ...newMediaUrls];
  
      if (isEdit) {
        await updateTrip(editingTrip.id, {
          title, subtitle, country, city,
          startDate, endDate, content,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          isPublic, mediaUrls: allMediaUrls, coverIndex, locations,
          locations: uploadedLocations,
        });
        setMessage("success:수정이 완료됐어요! ✅");
      } else {
        const tripId = await createTrip(user.uid, {
          title, subtitle, country, city,
          startDate, endDate, content,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          isPublic, mood: "😊", mediaUrls: allMediaUrls, coverIndex, locations,
          locations: uploadedLocations,
        });
        setMessage("success:여행 기록이 저장됐어요! 🎉 (ID: " + tripId + ")");
      }
      setTimeout(() => onBack(), 1500);
    } catch (err: any) {
      setMessage("error:" + err.message);
      setUploading(false);
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = message.startsWith("success:");
  const msgText = message.replace(/^(success|error):/, "");

  const inputStyle = {
    width: "100%", padding: "0.75rem 1rem",
    border: "1px solid rgba(26,23,20,0.12)", borderRadius: "10px",
    fontSize: "0.9375rem", fontFamily: "inherit",
    background: "white", outline: "none", boxSizing: "border-box" as const,
  };

  const labelStyle = {
    fontSize: "0.8125rem", fontWeight: 500 as const,
    display: "block", marginBottom: "0.5rem", color: "#1A1714",
  };

  const sectionStyle = {
    background: "white", borderRadius: "16px",
    border: "0.5px solid rgba(26,23,20,0.1)",
    padding: "1.5rem", marginBottom: "1.25rem",
  };

  const totalCount = mediaUrls.length + mediaFiles.length;

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
          <span style={{ fontSize: "0.9375rem", fontWeight: 500 }}>
            {isEdit ? "여행 기록 수정" : "새 여행 기록"}
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.625rem", alignItems: "center" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#8A8278" }}>
            <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
            전체 공개
          </label>
          <button onClick={handleSave} disabled={loading || uploading} style={{
            padding: "0.4375rem 1.25rem", borderRadius: "8px",
            background: "#1A1714", color: "white", border: "none",
            fontSize: "0.8125rem", cursor: (loading || uploading) ? "not-allowed" : "pointer",
            fontFamily: "inherit", opacity: (loading || uploading) ? 0.7 : 1,
          }}>
            {uploading ? "업로드 중..." : loading ? "저장 중..." : isEdit ? "수정 완료 →" : "저장하기 →"}
          </button>
        </div>
      </div>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "2rem" }}>

        {message && (
          <div style={{
            padding: "0.875rem 1rem", borderRadius: "10px", marginBottom: "1.5rem",
            fontSize: "0.875rem",
            background: isSuccess ? "#EAF3DE" : "#FCEBEB",
            color: isSuccess ? "#3B6D11" : "#A32D2D",
          }}>
            {msgText}
          </div>
        )}

        {/* 여행 정보 */}
        <div style={sectionStyle}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>나라</label>
              <input value={country} onChange={(e) => setCountry(e.target.value)}
                placeholder="일본" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>도시</label>
              <input value={city} onChange={(e) => setCity(e.target.value)}
                placeholder="교토" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>시작일</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>종료일</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                style={inputStyle} />
            </div>
          </div>
        </div>

        {/* 제목 & 부제목 */}
        <div style={sectionStyle}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={labelStyle}>제목</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="여행 제목을 입력하세요"
              style={{ ...inputStyle, fontSize: "1.25rem", fontWeight: 600 }} />
          </div>
          <div>
            <label style={labelStyle}>한 줄 소개</label>
            <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)}
              placeholder="여행을 한 줄로 소개해보세요" style={inputStyle} />
          </div>
        </div>

        {/* 본문 */}
        <div style={sectionStyle}>
          <label style={labelStyle}>여행 이야기</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)}
            placeholder="여행 이야기를 자유롭게 써보세요."
            rows={10}
            style={{ ...inputStyle, resize: "vertical", lineHeight: 1.8 }} />
        </div>

        {/* 사진/영상 업로드 */}
        <div style={sectionStyle}>
          <label style={labelStyle}>사진 & 영상</label>
          {totalCount > 0 && (
            <p style={{ fontSize: "0.75rem", color: "#8A8278", marginBottom: "0.875rem" }}>
              🖼️ 커버로 쓸 사진을 클릭해서 선택하세요
            </p>
          )}

          {totalCount > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem", marginBottom: "1rem" }}>

              {mediaUrls.map((media, i) => (
                <div key={`uploaded-${i}`} onClick={() => setCoverIndex(i)}
                  style={{
                    position: "relative", borderRadius: "10px",
                    overflow: "hidden", aspectRatio: "4/3", cursor: "pointer",
                    outline: coverIndex === i ? "3px solid #C4622D" : "3px solid transparent",
                    transition: "outline 0.15s",
                  }}
                >
                  {media.type === "video" ? (
                    <video src={media.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <img src={media.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  )}
                  {coverIndex === i && (
                    <div style={{
                      position: "absolute", top: "0.375rem", left: "0.375rem",
                      background: "#C4622D", color: "white",
                      fontSize: "0.65rem", fontWeight: 500,
                      padding: "0.2rem 0.5rem", borderRadius: "100px",
                    }}>커버</div>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); handleRemoveUploaded(i); }} style={{
                    position: "absolute", top: "0.375rem", right: "0.375rem",
                    width: "22px", height: "22px", borderRadius: "50%",
                    background: "rgba(26,23,20,0.6)", color: "white",
                    border: "none", cursor: "pointer", fontSize: "11px",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>✕</button>
                </div>
              ))}

              {mediaFiles.map((file, i) => {
                const globalIndex = mediaUrls.length + i;
                return (
                  <div key={`new-${i}`} onClick={() => setCoverIndex(globalIndex)}
                    style={{
                      position: "relative", borderRadius: "10px",
                      overflow: "hidden", aspectRatio: "4/3", cursor: "pointer",
                      outline: coverIndex === globalIndex ? "3px solid #C4622D" : "3px solid transparent",
                      transition: "outline 0.15s",
                    }}
                  >
                    {file.type.startsWith("image/") ? (
                      <img src={URL.createObjectURL(file)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", background: "#F5F0E8" }}>🎥</div>
                    )}
                    {coverIndex === globalIndex && (
                      <div style={{
                        position: "absolute", top: "0.375rem", left: "0.375rem",
                        background: "#C4622D", color: "white",
                        fontSize: "0.65rem", fontWeight: 500,
                        padding: "0.2rem 0.5rem", borderRadius: "100px",
                      }}>커버</div>
                    )}
                    {uploading && uploadProgress[i] !== undefined && (
                      <div style={{
                        position: "absolute", bottom: 0, left: 0, right: 0,
                        background: "rgba(26,23,20,0.6)", padding: "0.25rem 0.5rem",
                      }}>
                        <div style={{ height: "4px", background: "rgba(255,255,255,0.3)", borderRadius: "4px" }}>
                          <div style={{
                            height: "100%", borderRadius: "4px", background: "#C4622D",
                            width: `${uploadProgress[i]}%`, transition: "width 0.3s",
                          }} />
                        </div>
                        <div style={{ fontSize: "0.65rem", color: "white", marginTop: "2px" }}>{uploadProgress[i]}%</div>
                      </div>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); handleRemoveFile(i); }} style={{
                      position: "absolute", top: "0.375rem", right: "0.375rem",
                      width: "22px", height: "22px", borderRadius: "50%",
                      background: "rgba(26,23,20,0.6)", color: "white",
                      border: "none", cursor: "pointer", fontSize: "11px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>✕</button>
                  </div>
                );
              })}
            </div>
          )}

          <label style={{
            display: "flex", flexDirection: "column" as const,
            alignItems: "center", justifyContent: "center",
            gap: "0.375rem", padding: "2rem",
            border: "1.5px dashed rgba(26,23,20,0.15)", borderRadius: "12px",
            cursor: "pointer",
          }}>
            <span style={{ fontSize: "2rem" }}>📷</span>
            <span style={{ fontSize: "0.875rem", fontWeight: 500, color: "#1A1714" }}>사진 또는 영상 추가</span>
            <span style={{ fontSize: "0.75rem", color: "#8A8278" }}>JPG, PNG, MP4 · 사진 10MB / 영상 100MB 이하</span>
            <input type="file" multiple accept="image/*,video/*" onChange={handleFileSelect} style={{ display: "none" }} />
          </label>
        </div>

        {/* 경로 */}
        <div style={sectionStyle}>
          <label style={labelStyle}>경로</label>
          <TripMap
            locations={locations}
            onAdd={(loc) => setLocations(prev => [...prev, loc])}
            onRemove={(id) => setLocations(prev => prev.filter(l => l.id !== id))}
            onUpdate={(id, updates) => setLocations(prev =>
              prev.map(l => l.id === id ? { ...l, ...updates } : l)
            )}
            startDate={startDate}
            endDate={endDate}
          />
        </div>

        {/* 태그 */}
        <div style={sectionStyle}>
          <label style={labelStyle}>태그 (쉼표로 구분)</label>
          <input value={tags} onChange={(e) => setTags(e.target.value)}
            placeholder="벚꽃, 일본, 봄여행, 교토" style={inputStyle} />
          <p style={{ fontSize: "0.75rem", color: "#8A8278", marginTop: "0.5rem" }}>
            예: 벚꽃, 일본, 봄여행
          </p>
        </div>

      </div>
    </div>
  );
}