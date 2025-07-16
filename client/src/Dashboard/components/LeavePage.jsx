import React, { useContext, useState } from "react";
import dayjs from "dayjs";
import axios from "axios";
import { DatePicker, Form } from "antd";
import { Button, Card } from "react-bootstrap";
import { AuthContext } from "../../Context/AuthContext";
import { calculateTotalDaysSelected, formatLeaveDate } from "../../utils/leaveFunctions";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const { RangePicker } = DatePicker;

const disabledDate = (current) => {
  return current && current < dayjs().endOf("day");
};

const LeavePage = () => {
  const { userId, token } = useContext(AuthContext);
  const [totalDays, setTotalDays] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (fieldsValue) => {
    setIsSubmitting(true);
    const rangeValue = fieldsValue["range-picker"];
    const startDate = rangeValue[0].format("YYYY-MM-DD");
    const endDate = rangeValue[1].format("YYYY-MM-DD");
    
    const days = calculateTotalDaysSelected(startDate, endDate);
    setTotalDays(days);

    try {
      await axios.post(
        `/api/leaves/users/${userId}/leaves`,
        {
          leaveDays: days,
          startDate,
          endDate,
          reason: fieldsValue.reason || "Personal leave"
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success(
        `Leave application submitted for ${days} day(s) from ${formatLeaveDate(startDate)} to ${formatLeaveDate(endDate)}`,
        { autoClose: 3000 }
      );
      navigate("/leave-page");
    } catch (error) {
      console.error("Leave application error:", error);
      toast.error(
        error.response?.data?.message || "Failed to submit leave application",
        { autoClose: 3000 }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const rangeConfig = {
    rules: [
      {
        type: "array",
        required: true,
        message: "Please select date range!",
      },
      () => ({
        validator(_, value) {
          if (!value || value[1].diff(value[0], 'day') >= 0) {
            return Promise.resolve();
          }
          return Promise.reject(new Error('End date must be after start date'));
        },
      }),
    ],
  };

  const reasonConfig = {
    rules: [
      {
        required: true,
        message: "Please provide a reason for leave!",
      },
      {
        min: 10,
        message: "Reason must be at least 10 characters!",
      },
      {
        max: 500,
        message: "Reason must be less than 500 characters!",
      }
    ]
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">Apply for Leave</h4>
            </Card.Header>
            <Card.Body>
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                initialValues={{ reason: "" }}
              >
                <Form.Item
                  name="range-picker"
                  label="Select Leave Dates"
                  {...rangeConfig}
                >
                  <RangePicker
                    disabledDate={disabledDate}
                    className="w-100"
                    size="large"
                    format="YYYY-MM-DD"
                  />
                </Form.Item>

                <Form.Item
                  name="reason"
                  label="Reason for Leave"
                  {...reasonConfig}
                >
                  <Form.TextArea
                    rows={4}
                    placeholder="Please provide details about your leave request"
                  />
                </Form.Item>

                {totalDays > 0 && (
                  <div className="alert alert-info mb-4">
                    You are requesting leave for <strong>{totalDays} day(s)</strong>
                  </div>
                )}

                <div className="d-flex justify-content-end gap-3">
                  <Link to="/leave-page">
                    <Button variant="outline-secondary" size="lg">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Application"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LeavePage;