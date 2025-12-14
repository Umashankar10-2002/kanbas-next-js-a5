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
  dueDate: string;
};

function storageKey(courseId: string) {
  return `kambaz_assignments_${courseId}`;
}

export default function AssignmentsPage() {
  const router = useRouter();
  const { id: courseId } = useParams<{ id: string }>();

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showModal, setShowModal] = useState(false);

  // modal form state
  const [title, setTitle] = useState("");
  const [totalPoints, setTotalPoints] = useState(100);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [closed, setClosed] = useState(true);
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    const raw = localStorage.getItem(storageKey(courseId));
    setAssignments(raw ? JSON.parse(raw) : []);
  }, [courseId]);

  const saveList = (next: Assignment[]) => {
    setAssignments(next);
    localStorage.setItem(storageKey(courseId), JSON.stringify(next));
  };

  const openAddModal = () => {
    setTitle("");
    setTotalPoints(100);
    setEarnedPoints(0);
    setClosed(true);
    setDueDate("");
    setShowModal(true);
  };

  const saveNewAssignment = () => {
    if (!title.trim()) return;

    const created: Assignment = {
      _id: String(Date.now()),
      title: title.trim(),
      totalPoints,
      earnedPoints,
      closed,
      dueDate,
    };

    saveList([...assignments, created]);
    setShowModal(false);
  };

  const deleteAssignment = (aid: string) => {
    saveList(assignments.filter((a) => a._id !== aid));
  };

  const percent = (a: Assignment) =>
    a.totalPoints > 0
      ? ((a.earnedPoints / a.totalPoints) * 100).toFixed(2)
      : "";

  return (
    <div className="container-fluid">
      <h2 className="mb-3">Assignments</h2>

      <button className="btn btn-danger mb-3" onClick={openAddModal}>
        Add Assignment
      </button>

      {/* List */}
      <div className="bg-white border rounded">
        {assignments.map((a, idx) => (
          <div key={a._id} className={`d-flex p-3 ${idx ? "border-top" : ""}`}>
            <div
              style={{
                width: 4,
                height: 44,
                background: "#c8102e",
                marginRight: 14,
              }}
            />

            <div className="flex-grow-1">
              <div className="fw-semibold">{a.title}</div>
              <div className="text-muted small">
                {a.closed ? "Closed" : "Open"} |{" "}
                {a.dueDate ? `Due ${a.dueDate}` : "No due date"} |{" "}
                {a.earnedPoints}/{a.totalPoints} pts{" "}
                {percent(a) && `| ${percent(a)}%`}
              </div>
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() =>
                  router.push(
                    `/Kambaz/Courses/${courseId}/Assignments/${a._id}`
                  )
                }
              >
                Edit
              </button>
              <button
                className="btn btn-sm btn-danger"
                onClick={() => deleteAssignment(a._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD MODAL */}
      {showModal && (
        <div
          className="modal d-block"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">New Assignment</h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body">
                <div className="mb-2">
                  <label className="fw-bold">Title</label>
                  <input
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="row">
                  <div className="col">
                    <label className="fw-bold">Total Points</label>
                    <input
                      type="number"
                      className="form-control"
                      value={totalPoints}
                      onChange={(e) =>
                        setTotalPoints(Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="col">
                    <label className="fw-bold">Points Earned</label>
                    <input
                      type="number"
                      className="form-control"
                      value={earnedPoints}
                      onChange={(e) =>
                        setEarnedPoints(Number(e.target.value))
                      }
                    />
                  </div>
                </div>

                <div className="mt-2">
                  <label className="fw-bold">Due Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                <div className="form-check form-switch mt-2">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={closed}
                    onChange={(e) => setClosed(e.target.checked)}
                  />
                  <label className="form-check-label">
                    {closed ? "Closed" : "Open"}
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={saveNewAssignment}>
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
