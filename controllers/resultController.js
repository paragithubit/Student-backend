const Result = require("../models/Result");
const Subject = require("../models/Subject");

// Helper to get grade based on percentage
const getGrade = (p) => {
  if (p >= 90) return "A+";
  if (p >= 75) return "A";
  if (p >= 60) return "B";
  return p >= 50 ? "C" : "F";
};

// Helper to update marks and totals for subjects
const processSubjects = (subjectsArray) => {
  let total = 0, maxTotal = 0;
  const formatted = subjectsArray.map(sub => {
    const marks = Number(sub.marks || 0);
    const maxMarks = Number(sub.maxMarks || 100);
    total += marks;
    maxTotal += maxMarks;
    return {
      ...sub._doc, // Keeps existing fields if updating
      subjectId: sub.subjectId,
      subjectName: sub.subjectName,
      marks,
      maxMarks,
      resultStatus: marks >= 35 ? "Pass" : "Fail"
    };
  });
  return { formatted, total, maxTotal };
};

// ==========================================
// 🔹 ADD RESULT
// ==========================================
exports.addResult = async (req, res) => {
  try {
    const { student, semester, department, division, subjects } = req.body;

    if (!student || !semester || !subjects?.length) {
      return res.status(400).json({ message: "Missing fields" });
    }

    let existingResult = await Result.findOne({ student, semester });

    if (existingResult) {
      subjects.forEach((newSub) => {
        const existingSubject = existingResult.subjects.find(s => s.subjectId.toString() === newSub.subjectId);
        const marks = Number(newSub.marks || 0);
        const maxMarks = Number(newSub.maxMarks || 100);

        if (existingSubject) {
          existingSubject.marks = marks;
          existingSubject.maxMarks = maxMarks;
          existingSubject.resultStatus = marks >= 35 ? "Pass" : "Fail";
        } else {
          existingResult.subjects.push({
            subjectId: newSub.subjectId,
            subjectName: newSub.subjectName,
            marks,
            maxMarks,
            resultStatus: marks >= 35 ? "Pass" : "Fail"
          });
        }
      });

      // Recalculate Totals
      let total = 0, maxTotal = 0;
      existingResult.subjects.forEach(s => {
        total += Number(s.marks);
        maxTotal += Number(s.maxMarks);
      });

      existingResult.total = total;
      existingResult.percentage = (total / maxTotal) * 100;
      existingResult.grade = getGrade(existingResult.percentage);
      existingResult.finalResult = existingResult.subjects.some(s => s.resultStatus === "Fail") ? "Fail" : "Pass";

      await existingResult.save();
      return res.json({ message: "Result updated successfully", result: existingResult });
    }

    // Create New Result Flow
    const { formatted, total, maxTotal } = processSubjects(subjects);
    const percentage = (total / maxTotal) * 100;

    const result = await Result.create({
      student, semester, department, division,
      subjects: formatted,
      total, percentage,
      grade: getGrade(percentage),
      finalResult: formatted.some(s => s.resultStatus === "Fail") ? "Fail" : "Pass"
    });

    res.status(201).json({ message: "Result added successfully", result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 🔹 GET RESULTS
// ==========================================
exports.getResults = async (req, res) => {
  try {
    const teacherId = req.user.id || req.user.user?.id;
    const role = req.user.role || req.user.user?.role;
    
    const basePopulate = [
      { path: "student", select: "firstName lastName email" },
      { path: "semester", select: "name semesterNumber" },
      { path: "subjects.subjectId", select: "name" },
      { path: "department", select: "name" },
      { path: "division", select: "name" }
    ];

    // ADMIN ACCESS
    if (role === "admin") {
      const data = await Result.find().populate(basePopulate).sort({ createdAt: -1 });
      return res.json(data);
    }

    // TEACHER ACCESS
    const mySubjects = await Subject.find({ teacher: teacherId }).select("_id");
    const subjectIds = mySubjects.map(s => s._id.toString());

    const results = await Result.find({ "subjects.subjectId": { $in: subjectIds } })
      .populate(basePopulate)
      .sort({ createdAt: -1 });

    const filteredResults = results.map(r => ({
      ...r._doc,
      subjects: r.subjects.filter(s => subjectIds.includes(s.subjectId?._id.toString()))
    }));

    res.json(filteredResults);
  } catch (err) {
    console.log("GET ERROR:", err);
    res.status(500).json({ message: "Error fetching results " });
  }
};

// ==========================================
// 🔹 GET MY RESULTS
// ==========================================
exports.getMyResults = async (req, res) => {
  try {
    const studentId = req.user.id || req.user.user?.id;
    const data = await Result.find({ student: studentId })
      .populate([
        { path: "student", select: "firstName lastName email" },
        { path: "semester", select: "name" },
        { path: "subjects.subjectId", select: "name" },
        { path: "department", select: "name" },
        { path: "division", select: "name" }
      ])
      .sort({ createdAt: -1 });

    res.json(data);
  } catch (err) {
    console.log("MY RESULT ERROR:", err);
    res.status(500).json({ message: "Error fetching " });
  }
};

// ==========================================
// 🔹 UPDATE RESULT
// ==========================================
exports.updateResult = async (req, res) => {
  try {
    const userId = req.user.id || req.user.user?.id;
    const userRole = req.user.role || req.user.user?.role;
    const { student, semester, department, division, subjects } = req.body;

    if (!subjects || !Array.isArray(subjects)) {
      return res.status(400).json({ message: "Subjects required" });
    }

    if (userRole === "teacher") {
      for (let s of subjects) {
        const subject = await Subject.findOne({ _id: s.subjectId, teacher: userId });
        if (!subject) return res.status(403).json({ message: "You can update only your subjects" });
      }
    }

    const { formatted, total, maxTotal } = processSubjects(subjects);
    const percentage = maxTotal > 0 ? (total / maxTotal) * 100 : 0;

    const updated = await Result.findByIdAndUpdate(
      req.params.id,
      {
        student, semester, department, division,
        subjects: formatted,
        total, percentage,
        grade: getGrade(percentage),
        finalResult: formatted.some(s => s.resultStatus === "Fail") ? "Fail" : "Pass"
      },
      { new: true }
    ).populate([
      { path: "student", select: "firstName lastName email" },
      { path: "semester", select: "name" },
      { path: "department", select: "name" },
      { path: "division", select: "name" },
      { path: "subjects.subjectId", select: "name" }
    ]);

    res.json({ message: "Result updated successfully", result: updated });
  } catch (err) {
    console.log("UPDATE ERROR:", err);
    res.status(500).json({ message: "Error updating result" });
  }
};

// ==========================================
// 🔹 DELETE RESULT
// ==========================================
exports.deleteResult = async (req, res) => {
  try {
    await Result.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted " });
  } catch (err) {
    console.log("DELETE ERROR:", err);
    res.status(500).json({ message: "Error deleting " });
  }
};