const express = require('express');
const router = express.Router();
const NewJobsController = require('../controllers/newJobsController');

// GET /api/new-jobs - ดึงรายการงานที่มี job_code = "NEW"
router.get('/', NewJobsController.getNewJobs);

// GET /api/new-jobs/process-steps - ดึง Process Steps สำหรับงานที่ระบุ
router.get('/process-steps', NewJobsController.getProcessSteps);

// PUT /api/new-jobs/:work_plan_id - อัปเดตข้อมูลงานและ Process Steps
router.put('/:work_plan_id', NewJobsController.updateNewJob);

// DELETE /api/new-jobs/:work_plan_id - ลบงานที่มี job_code = "NEW"
router.delete('/:work_plan_id', NewJobsController.deleteNewJob);

module.exports = router; 