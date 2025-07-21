const userModel = require("../models/user");

const applyForLeave = async (req, res, next) => {
  try {
    const { uid } = req.params;
    const { leaveDays, startDate, endDate, reason } = req.body;

    const user = await userModel.findByIdAndUpdate(
      uid,
      {
        $push: {
          leaveDates: {
            startDate,
            endDate,
            days: leaveDays,
            reason,
            status: "pending"
          }
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    res.status(200).json({
      success: true,
      message: "Leave application submitted",
      leave: user.leaveDates.slice(-1)[0] // Return the newly added leave
    });
  } catch (error) {
    next(error);
  }
};

const getPendingLeaves = async (req, res, next) => {
  try {
    const usersWithPendingLeaves = await userModel.find({
      "leaveDates.status": "pending"
    }).select("name email leaveDates");

    const pendingLeaves = usersWithPendingLeaves.flatMap(user => 
      user.leaveDates
        .filter(leave => leave.status === "pending")
        .map(leave => ({
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          ...leave.toObject()
        }))
    );

    res.status(200).json({
      success: true,
      count: pendingLeaves.length,
      leaves: pendingLeaves
    });
  } catch (error) {
    next(error);
  }
};

const updateLeaveStatus = async (req, res, next) => {
  try {
    const { leaveId } = req.params;
    const { action } = req.body;

    if (!["approve", "reject"].includes(action)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid action. Must be 'approve' or 'reject'" 
      });
    }

    const status = action === "approve" ? "approved" : "rejected";

    const user = await userModel.findOneAndUpdate(
      { "leaveDates._id": leaveId },
      {
        $set: {
          "leaveDates.$.status": status,
          "leaveDates.$.processedAt": new Date()
        }
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Leave not found"
      });
    }

    const updatedLeave = user.leaveDates.id(leaveId);

    res.status(200).json({
      success: true,
      message: `Leave ${status}`,
      leave: updatedLeave
    });
  } catch (error) {
    next(error);
  }
};

const getUserLeaves = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.params.uid)
      .select("leaveDates name email");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      leaves: user.leaveDates.map(leave =>({
        ...leave.toObject(),
        userName: user.name,
        userEmail: user.email
      }))
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  applyForLeave,
  getPendingLeaves,
  updateLeaveStatus,
  getUserLeaves
};