"use client";
import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type Assignment = {
  _id: string;
  title: string;
  totalPoints: number;
  earnedPoints: number;
  closed: boolean;
  dueDate: string; // YYYY-MM-DD
};

function storageKey(courseId: string) {
  return `kambaz_assignments_${courseId}`;
}

export default function AssignmentEditor() {
  const router = useRouter();
  const params = useParams<{ id: string; aid: string }>();
  const courseId = params.id;
  const aid = params.aid;

  // ---- state ----
  const [title, setTitle] = useState("");
  const [totalPoints, setTotalPoints] = useState<number>(100);
  const [earnedPoints, setEarnedPoints] = useState<number>(0);
  const [closed, setClosed] = useState<boolean>(true);
  const [dueDate, setDueDate] = useState<string>("");

  // ---- derived percentage ----
  const percentage = useMemo(() => {
    if (totalPoints <= 0) return "0.00";
    return ((earnedPoints / totalPoints) * 100).toFixed(2);
  }, [earnedPoints, totalPoints]);

  // ---- load existing assignment from localStorage ----
  useEffect(() => {
    if (!courseId || !aid) return;

    const raw = localStorage.getItem(storageKey(courseId));
    const list: Assignment[] = raw ? JSON.parse(raw) : [];

    const existing = list.find((a) => a._id === aid);
    if (!existing) return;

    setTitle(existing.title ?? "");
    setTotalPoints(Number(existing.totalPoints ?? 100));
    setEarnedPoints(Number(existing.earnedPoints ?? 0));
    setClosed(Boolean(existing.closed ?? true));
    setDueDate(existing.dueDate ?? "");
  }, [courseId, aid]);

  const goBack = () => router.push(`/Kambaz/Courses/${courseId}/Assignments`);

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();

    const updated: Assignment = {
      _id: aid,
      title: title.trim() || "Untitled Assignment",
      totalPoints: Number.isFinite(totalPoints) ? totalPoints : 0,
      earnedPoints: Number.isFinite(earnedPoints) ? earnedPoints : 0,
      closed,
      dueDate,
    };

    const raw = localStorage.getItem(storageKey(courseId));
    const list: Assignment[] = raw ? JSON.parse(raw) : [];

    const exists = list.some((a) => a._id === aid);
    const next = exists
      ? list.map((a) => (a._id === aid ? updated : a))
      : [...list, updated];

    localStorage.setItem(storageKey(courseId), JSON.stringify(next));
    goBack();
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4 text-danger">Assignment Editor</h2>

      <form className="border rounded p-4 shadow-sm bg-white" onSubmit={onSave}>
        {/* Assignment Name */}
        <div className="mb-3">
          <label className="form-label fw-bold">Assignment Name</label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. A1 - HTML"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Points */}
        <div className="row mb-3">
          <div className="col-md-6">
            <label className="form-label fw-bold">Total Points</label>
            <input
              type="number"
              className="form-control"
              value={totalPoints}
              onChange={(e) => setTotalPoints(Number(e.target.value))}
              min={0}
            />
          </div>

          <div className="col-md-6">
            <label className="form-label fw-bold">Points Earned</label>
            <input
              type="number"
              className="form-control"
              value={earnedPoints}
              onChange={(e) => setEarnedPoints(Number(e.target.value))}
              min={0}
            />
          </div>
        </div>

        {/* Status */}
        <div className="mb-3">
          <label className="form-label fw-bold me-3">Status</label>
          <div className="form-check form-switch d-inline-block">
            <input
              className="form-check-input"
              type="checkbox"
              checked={closed}
              onChange={(e) => setClosed(e.target.checked)}
            />
            <label className="form-check-label ms-2">
              {closed ? "Closed" : "Open"}
            </label>
          </div>
        </div>

        {/* Due Date */}
        <div className="mb-3">
          <label className="form-label fw-bold">Due Date</label>
          <input
            type="date"
            className="form-control"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        {/* Canvas-style Preview */}
        <div className="border rounded p-3 bg-light mb-3">
          <div className="fw-semibold">{title || "Assignment title"}</div>
          <div className="text-muted small">
            {closed ? "Closed" : "Open"} |{" "}
            {dueDate ? `Due ${dueDate}` : "No due date"} |{" "}
            {earnedPoints}/{totalPoints} pts | {percentage}%
          </div>
        </div>

        {/* Buttons */}
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-secondary" onClick={goBack}>
            Cancel
          </button>
          <button type="submit" className="btn btn-danger">
            Save
          </button>
        </div>
      </form>
    </div>
  );
}
