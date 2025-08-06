const express = require('express');
const router = express.Router();
const pool = require('../config/database').pool;

// GET /api/reports - รับรายงาน
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Reports endpoint working'
    });
  } catch (error) {
    console.error('Error in reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting reports'
    });
  }
});

// GET /api/reports/export - ส่งออกรายงาน
router.get('/export', (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Export reports endpoint working'
    });
  } catch (error) {
    console.error('Error exporting reports:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting reports'
    });
  }
});

// GET /api/reports/production-analysis - รายงานวิเคราะห์การผลิต
router.get('/production-analysis', async (req, res) => {
  try {
    const { start_date, end_date, job_code, limit = 10000 } = req.query;
    
    console.log('Production analysis request:', { start_date, end_date, job_code, limit });

    // ตรวจสอบการเชื่อมต่อ database
    try {
      const [dbTest] = await pool.execute('SELECT 1 as test');
      console.log('✅ Database connection test:', dbTest[0].test);
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: dbError.message
      });
    }

    // ตรวจสอบว่าตาราง work_plans มีอยู่หรือไม่
    try {
      const [tableCheck] = await pool.execute('SHOW TABLES LIKE "work_plans"');
      console.log('📋 Available tables:', tableCheck);
      
      if (tableCheck.length === 0) {
        console.log('❌ Table work_plans does not exist');
        return res.json({
          success: true,
          data: {
            summary: {
              total_jobs: 0,
              completed_jobs: 0,
              in_progress_jobs: 0,
              not_started_jobs: 0,
              completion_rate: 0,
              avg_planned_duration_minutes: 0,
              avg_actual_duration_minutes: 0,
              avg_time_variance_minutes: 0,
              jobs_with_time_data: 0
            },
            jobs: [],
            time_variance_jobs: [],
            job_statistics: []
          }
        });
      } else {
        console.log('✅ Table work_plans exists');
        
        // ตรวจสอบข้อมูลในตาราง work_plans
        const [workPlansCount] = await pool.execute('SELECT COUNT(*) as count FROM work_plans');
        console.log('📊 Total work_plans records:', workPlansCount[0].count);
        
        if (workPlansCount[0].count === 0) {
          console.log('⚠️ No work plans found, returning sample data');
          return res.json({
            success: true,
            data: {
              summary: {
                total_jobs: 0,
                completed_jobs: 0,
                in_progress_jobs: 0,
                not_started_jobs: 0,
                completion_rate: 0,
                avg_planned_duration_minutes: 0,
                avg_actual_duration_minutes: 0,
                avg_time_variance_minutes: 0,
                jobs_with_time_data: 0
              },
              jobs: [],
              time_variance_jobs: [],
              job_statistics: []
            }
          });
        }
      }
    } catch (tableError) {
      console.error('❌ Error checking table existence:', tableError);
      return res.json({
        success: true,
        data: {
          summary: {
            total_jobs: 0,
            completed_jobs: 0,
            in_progress_jobs: 0,
            not_started_jobs: 0,
            completion_rate: 0,
            avg_planned_duration_minutes: 0,
            avg_actual_duration_minutes: 0,
            avg_time_variance_minutes: 0,
            jobs_with_time_data: 0
          },
          jobs: [],
          time_variance_jobs: [],
          job_statistics: []
        }
      });
    }

    // สร้าง WHERE clause สำหรับการกรองข้อมูล
    console.log('🔍 Start date:', start_date);
    console.log('🔍 End date:', end_date);
    console.log('🔍 Job code:', job_code);

    // สร้าง WHERE clause สำหรับการกรองข้อมูล
    let whereClause = '';
    const whereParams = [];
    
    // ถ้าไม่ระบุวันที่ ให้แสดงข้อมูลทั้งหมด
    if (start_date && end_date) {
      whereClause = 'WHERE DATE_FORMAT(wp.production_date, "%Y-%m-%d") BETWEEN ? AND ?';
      whereParams.push(start_date, end_date);
    } else if (start_date) {
      whereClause = 'WHERE DATE_FORMAT(wp.production_date, "%Y-%m-%d") >= ?';
      whereParams.push(start_date);
    } else if (end_date) {
      whereClause = 'WHERE DATE_FORMAT(wp.production_date, "%Y-%m-%d") <= ?';
      whereParams.push(end_date);
    } else {
      // ถ้าไม่ระบุวันที่ ให้แสดงข้อมูลทั้งหมด
      whereClause = '';
    }
    
    if (job_code) {
      if (whereClause) {
        whereClause += ' AND wp.job_code = ?';
      } else {
        whereClause = 'WHERE wp.job_code = ?';
      }
      whereParams.push(job_code);
    }

    // กำหนด limit ให้ปลอดภัย - บังคับใช้ 10000 เสมอ
    const safeLimit = 10000;
    console.log('🔍 Safe limit calculated:', safeLimit);
    console.log('🔍 Original limit from request:', limit);
    
    // Query ที่ปรับปรุงแล้ว - แก้ไข DISTINCT และ ORDER BY
    const analysisQuery = `
      SELECT DISTINCT
        wp.id as work_plan_id,
        wp.job_code,
        wp.job_name,
        wp.production_date,
        CASE 
          WHEN wp.production_date IS NOT NULL 
          THEN DATE_FORMAT(wp.production_date, '%Y-%m-%d')
          ELSE NULL
        END as production_date_formatted,
        wp.start_time as planned_start,
        wp.end_time as planned_end,
        wp.operators,
        wp.notes,
        wp.production_room_id,
        wp.machine_id,
        wp.status_id,
        pr.room_name as production_room_name
      FROM work_plans wp
      LEFT JOIN production_rooms pr ON wp.production_room_id = pr.id
      WHERE wp.job_code IS NOT NULL 
        AND wp.job_code != ''
        AND wp.job_name IS NOT NULL 
        AND wp.job_name != ''
        ${whereClause ? 'AND ' + whereClause.replace('WHERE ', '') : ''}
      ORDER BY wp.production_date DESC, wp.job_code ASC, wp.id DESC
      LIMIT ${safeLimit}
    `;

    console.log('Executing analysis query:', analysisQuery);
    console.log('Query params:', whereParams);

    let analysisResults = [];
    try {
      console.log('🚀 Executing analysis query...');
      const [results] = await pool.execute(analysisQuery, whereParams);
      analysisResults = results;
      console.log('✅ Query executed successfully');
      console.log('📊 Results count:', analysisResults.length);
      if (analysisResults.length > 0) {
        console.log('📊 First result sample:', analysisResults[0]);
      } else {
        console.log('⚠️ No results found for the specified date range');
      }
    } catch (queryError) {
      console.error('❌ Error executing analysis query:', queryError);
      console.error('❌ Query that failed:', analysisQuery);
      console.error('❌ Parameters:', whereParams);
      // ถ้า query ล้มเหลว ให้ส่งข้อมูลว่างกลับ
      return res.json({
        success: true,
        data: {
          summary: {
            total_jobs: 0,
            completed_jobs: 0,
            in_progress_jobs: 0,
            not_started_jobs: 0,
            completion_rate: 0,
            avg_planned_duration_minutes: 0,
            avg_actual_duration_minutes: 0,
            avg_time_variance_minutes: 0,
            jobs_with_time_data: 0
          },
          jobs: [],
          time_variance_jobs: [],
          job_statistics: []
        }
      });
    }

    // ถ้าไม่มีข้อมูล ให้ส่งข้อมูลว่างกลับ
    if (analysisResults.length === 0) {
      console.log('⚠️ No work plans found for the specified criteria');
      return res.json({
        success: true,
        data: {
          summary: {
            total_jobs: 0,
            completed_jobs: 0,
            in_progress_jobs: 0,
            not_started_jobs: 0,
            completion_rate: 0,
            avg_planned_duration_minutes: 0,
            avg_actual_duration_minutes: 0,
            avg_time_variance_minutes: 0,
            jobs_with_time_data: 0
          },
          jobs: [],
          time_variance_jobs: [],
          job_statistics: []
        }
      });
    }

    // ดึงข้อมูล logs สำหรับแต่ละ work plan
    const jobsWithLogs = [];
    for (const job of analysisResults) {
      try {
        // ดึง logs สำหรับ work plan นี้
        const [logs] = await pool.execute(
          'SELECT status, timestamp FROM logs WHERE work_plan_id = ? ORDER BY timestamp ASC',
          [job.work_plan_id]
        );
        
        // ฟังก์ชันคำนวณเวลาจริงที่ปรับปรุงแล้ว
        const getCompletedDuration = (logs) => {
          const startLogs = logs.filter(log => log.status === 'start').sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          const stopLogs = logs.filter(log => log.status === 'stop').sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          
          let totalDuration = 0;
          let actualStartTime = null;
          let actualEndTime = null;
          let completedSessions = 0;
          
          console.log(`[DEBUG] Work Plan ${job.work_plan_id}: ${startLogs.length} start logs, ${stopLogs.length} stop logs`);
          
          // จับคู่ start-stop logs
          for (let i = 0; i < Math.min(startLogs.length, stopLogs.length); i++) {
            const start = new Date(startLogs[i].timestamp);
            const stop = new Date(stopLogs[i].timestamp);
            
            if (stop > start) {
              if (!actualStartTime) actualStartTime = start;
              actualEndTime = stop;
              const sessionDuration = (stop - start) / (1000 * 60); // minutes
              totalDuration += sessionDuration;
              completedSessions++;
              console.log(`[DEBUG] Session ${i + 1}: ${sessionDuration.toFixed(2)} minutes`);
            }
          }
          
          // ถ้ามี start logs มากกว่า stop logs แสดงว่ายังไม่เสร็จ
          const hasIncompleteSession = startLogs.length > stopLogs.length;
          
          return { 
            totalDuration: Math.round(totalDuration), 
            actualStartTime, 
            actualEndTime,
            completedSessions,
            hasIncompleteSession,
            hasAnyLogs: logs.length > 0
          };
        };
        
        // คำนวณเวลาจริงจาก logs
        const duration = getCompletedDuration(logs);
        let actualStartTime = null;
        let actualEndTime = null;
        let actualDuration = duration.totalDuration;
        
        if (duration.actualStartTime && duration.actualEndTime) {
          // แปลง timestamp เป็นเวลาประเทศไทย
          const bangkokStart = new Date(duration.actualStartTime.getTime() + (7 * 60 * 60 * 1000));
          const bangkokStop = new Date(duration.actualEndTime.getTime() + (7 * 60 * 60 * 1000));
          
          actualStartTime = bangkokStart.toISOString();
          actualEndTime = bangkokStop.toISOString();
        }
        
        // คำนวณเวลาตามแผน
        let plannedDuration = 0;
        if (job.planned_start && job.planned_end) {
          const start = new Date(`2000-01-01T${job.planned_start}`);
          const end = new Date(`2000-01-01T${job.planned_end}`);
          plannedDuration = Math.round((end - start) / (1000 * 60));
        }
        
        // คำนวณความแตกต่าง
        const timeVariance = actualDuration > 0 ? actualDuration - plannedDuration : 0;
        const timeVariancePercentage = plannedDuration > 0 ? (timeVariance / plannedDuration) * 100 : 0;
        
        // ปรับเงื่อนไขการกำหนดสถานะให้ยืดหยุ่นมากขึ้น
        let productionStatus = 'ไม่เริ่มงาน';
        if (duration.hasAnyLogs) {
          if (duration.completedSessions > 0) {
            productionStatus = 'เสร็จสิ้น';
          } else if (duration.hasIncompleteSession) {
            productionStatus = 'กำลังดำเนินการ';
          } else {
            productionStatus = 'เริ่มแล้วแต่ไม่เสร็จ';
          }
        }

        // แปลง operators ให้เป็นรูปแบบที่อ่านได้
        let operatorNames = 'ไม่ระบุ';
        if (job.operators) {
          try {
            let operators = [];
            
            // ถ้าเป็น string JSON
            if (typeof job.operators === 'string') {
              if (job.operators.startsWith('[')) {
                operators = JSON.parse(job.operators);
              } else {
                operators = [job.operators];
              }
            } 
            // ถ้าเป็น array แล้ว
            else if (Array.isArray(job.operators)) {
              operators = job.operators;
            }
            // ถ้าเป็น object เดี่ยว
            else if (typeof job.operators === 'object') {
              operators = [job.operators];
            }
            
            // แปลงเป็นชื่อ
            const names = operators.map(op => {
              if (typeof op === 'object' && op.name) {
                return op.name;
              } else if (typeof op === 'string') {
                return op;
              }
              return null;
            }).filter(name => name);
            
            operatorNames = names.length > 0 ? names.join(', ') : 'ไม่ระบุ';
            
          } catch (e) {
            console.error('Error parsing operators for job:', job.job_code, e.message);
            operatorNames = 'ไม่ระบุ';
          }
        }

        jobsWithLogs.push({
          ...job,
          planned_duration_minutes: plannedDuration,
          actual_duration_minutes: actualDuration,
          actual_start_time: actualStartTime,
          actual_end_time: actualEndTime,
          time_variance_minutes: timeVariance,
          time_variance_percentage: Math.round(timeVariancePercentage),
          has_logs: duration.hasAnyLogs,
          has_completed_sessions: duration.completedSessions > 0,
          completed_sessions: duration.completedSessions,
          has_incomplete_session: duration.hasIncompleteSession,
          total_logs: logs.length,
          start_logs: logs.filter(log => log.status === 'start').length,
          stop_logs: logs.filter(log => log.status === 'stop').length,
          production_status: productionStatus,
          actual_operators: operatorNames
        });
      } catch (logError) {
        console.error(`Error fetching logs for work plan ${job.work_plan_id}:`, logError);
        jobsWithLogs.push({
          ...job,
          planned_duration_minutes: 0,
          actual_duration_minutes: 0,
          actual_start_time: null,
          actual_end_time: null,
          time_variance_minutes: 0,
          time_variance_percentage: 0,
          has_logs: false
        });
      }
    }

    // คำนวณสถิติรวมที่ปรับปรุงแล้ว
    const totalJobs = jobsWithLogs.length;
    const jobsWithAnyLogs = jobsWithLogs.filter(job => job.has_logs);
    const jobsCompleted = jobsWithLogs.filter(job => job.has_completed_sessions);
    const jobsInProgress = jobsWithLogs.filter(job => job.has_incomplete_session);
    const jobsNotStarted = jobsWithLogs.filter(job => !job.has_logs);
    const jobsWithPlannedTime = jobsWithLogs.filter(job => job.planned_duration_minutes > 0);
    
    console.log('📊 [SUMMARY] Total jobs:', totalJobs);
    console.log('📊 [SUMMARY] Jobs with any logs:', jobsWithAnyLogs.length);
    console.log('📊 [SUMMARY] Jobs completed:', jobsCompleted.length);
    console.log('📊 [SUMMARY] Jobs in progress:', jobsInProgress.length);
    console.log('📊 [SUMMARY] Jobs not started:', jobsNotStarted.length);
    
    const avgPlannedDuration = jobsWithPlannedTime.length > 0 
      ? jobsWithPlannedTime.reduce((sum, job) => sum + job.planned_duration_minutes, 0) / jobsWithPlannedTime.length 
      : 0;
      
    const avgActualDuration = jobsCompleted.length > 0 
      ? jobsCompleted.reduce((sum, job) => sum + job.actual_duration_minutes, 0) / jobsCompleted.length 
      : 0;
      
    const avgTimeVariance = jobsCompleted.length > 0 
      ? jobsCompleted.reduce((sum, job) => sum + job.time_variance_minutes, 0) / jobsCompleted.length 
      : 0;

    const summary = {
      total_jobs: totalJobs,
      completed_jobs: jobsCompleted.length,
      in_progress_jobs: jobsInProgress.length,
      not_started_jobs: jobsNotStarted.length,
      completion_rate: totalJobs > 0 ? Math.round((jobsCompleted.length / totalJobs) * 100) : 0,
      avg_planned_duration_minutes: Math.round(avgPlannedDuration),
      avg_actual_duration_minutes: Math.round(avgActualDuration),
      avg_time_variance_minutes: Math.round(avgTimeVariance),
      jobs_with_time_data: jobsWithAnyLogs.length,
      jobs_with_completed_sessions: jobsCompleted.length
    };

    // คำนวณสถิติงานแต่ละประเภท
    const jobStatistics = calculateJobStatistics(jobsWithLogs);
    
    console.log('📊 Job statistics calculated:', jobStatistics.length, 'unique job types');
    console.log('📊 Total work plans processed:', jobsWithLogs.length);
    console.log('📊 Unique job codes found:', new Set(jobsWithLogs.map(job => job.job_code)).size);
    console.log('📊 Sample job statistics:', jobStatistics.slice(0, 3));

    // กรองงานที่มีข้อมูลเวลาสำหรับการวิเคราะห์ความแตกต่าง
    const timeVarianceJobs = jobsWithLogs.filter(job => 
      job.has_completed_sessions && 
      job.planned_duration_minutes > 0 && 
      job.actual_duration_minutes > 0
    );

    console.log('📊 [FINAL] Sending response with:');
    console.log('📊 [FINAL] Total jobs:', jobsWithLogs.length);
    console.log('📊 [FINAL] Job statistics:', jobStatistics.length);
    console.log('📊 [FINAL] Time variance jobs:', timeVarianceJobs.length);

    res.json({
      success: true,
      data: {
        summary,
        jobs: jobsWithLogs,
        time_variance_jobs: timeVarianceJobs,
        job_statistics: jobStatistics
      }
    });

  } catch (error) {
    console.error('Error in production analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating production analysis',
      error: error.message
    });
  }
});

// ฟังก์ชันคำนวณสถิติงานแต่ละประเภท (ปรับปรุงแล้ว)
function calculateJobStatistics(jobs) {
  const jobMap = new Map();
  
  console.log('🔍 [CALC] Starting calculateJobStatistics with', jobs.length, 'jobs');
  
  // จัดกลุ่มงานตาม job_code และหลีกเลี่ยงการนับซ้ำ
  jobs.forEach(job => {
    if (job.job_code) {
      const key = job.job_code;
      if (!jobMap.has(key)) {
        jobMap.set(key, {
          job_code: job.job_code,
          job_name: job.job_name, // ใช้ชื่อแรกที่พบ
          unique_productions: new Set(), // ใช้ Set เพื่อหลีกเลี่ยงการนับซ้ำ
          jobs: [],
          production_dates: new Set() // เก็บวันที่ผลิตที่แตกต่างกัน
        });
      }
      
      const jobGroup = jobMap.get(key);
      
      // สร้าง unique key สำหรับแต่ละการผลิต - นับตามวันที่เท่านั้น
      const productionDate = job.production_date_formatted || job.production_date || 'no_date';
      const uniqueKey = `${job.job_code}_${productionDate}`; // ลบ work_plan_id ออก
      jobGroup.unique_productions.add(uniqueKey);
      
      // เก็บวันที่ผลิต
      if (productionDate && productionDate !== 'no_date') {
        jobGroup.production_dates.add(productionDate);
      }
      
      jobGroup.jobs.push(job);
    }
  });
  
  const jobStats = [];
  
  jobMap.forEach((jobGroup, key) => {
    // ใช้เกณฑ์ใหม่ในการกำหนดงานที่เสร็จสิ้น
    const completedJobs = jobGroup.jobs.filter(job => job.has_completed_sessions);
    const jobsWithLogs = jobGroup.jobs.filter(job => job.has_logs);
    const plannedJobs = jobGroup.jobs.filter(job => job.planned_duration_minutes > 0);
    
    console.log(`🔍 [CALC] Job ${key}:`, {
      total_jobs: jobGroup.jobs.length,
      unique_productions: jobGroup.unique_productions.size,
      production_dates: jobGroup.production_dates.size,
      completed_jobs: completedJobs.length,
      jobs_with_logs: jobsWithLogs.length,
      unique_dates: Array.from(jobGroup.production_dates)
    });
    
    const avgPlannedDuration = plannedJobs.length > 0 
      ? plannedJobs.reduce((sum, job) => sum + job.planned_duration_minutes, 0) / plannedJobs.length 
      : 0;
      
    const avgActualDuration = completedJobs.length > 0 
      ? completedJobs.reduce((sum, job) => sum + job.actual_duration_minutes, 0) / completedJobs.length 
      : 0;
      
    const avgTimeVariance = completedJobs.length > 0 
      ? completedJobs.reduce((sum, job) => sum + job.time_variance_minutes, 0) / completedJobs.length 
      : 0;
    
    // คำนวณความแม่นยำในการแนะนำเวลา
    let accuracyRate = 0;
    let accuracyLevel = 'ต่ำ';
    let bestTime = null;
    let bestTimeOperators = '';
    let worstTime = null;
    let recommendedTime = Math.round(avgActualDuration);
    let medianTime = null;
    
    if (completedJobs.length > 0) {
      // หาเวลาที่ดีที่สุด (เร็วที่สุด) และแย่ที่สุด (ช้าที่สุด)
      const sortedByTime = completedJobs
        .filter(job => job.actual_duration_minutes > 0)
        .sort((a, b) => a.actual_duration_minutes - b.actual_duration_minutes);
      
      if (sortedByTime.length > 0) {
        bestTime = sortedByTime[0].actual_duration_minutes;
        worstTime = sortedByTime[sortedByTime.length - 1].actual_duration_minutes;
        
        // คำนวณ Median (ค่ากลาง) สำหรับเวลาแนะนำที่แม่นยำ
        const midIndex = Math.floor(sortedByTime.length / 2);
        if (sortedByTime.length % 2 === 0) {
          // ถ้าจำนวนคู่ ใช้ค่าเฉลี่ยของ 2 ตัวกลาง
          medianTime = Math.round((sortedByTime[midIndex - 1].actual_duration_minutes + sortedByTime[midIndex].actual_duration_minutes) / 2);
        } else {
          // ถ้าจำนวนคี่ ใช้ตัวกลาง
          medianTime = sortedByTime[midIndex].actual_duration_minutes;
        }
        
        // ใช้ Median เป็นเวลาแนะนำแทนเวลาเฉลี่ย
        recommendedTime = medianTime;
        
        // หาผู้ปฏิบัติงานสำหรับเวลาที่ดีที่สุด
        const bestTimeJobs = completedJobs.filter(job => 
          job.actual_duration_minutes === bestTime
        );
        
        const bestOperators = new Set();
        bestTimeJobs.forEach(job => {
          if (job.actual_operators && job.actual_operators !== 'ไม่ระบุ') {
            try {
              let operators = [];
              
              // ถ้าเป็น string JSON
              if (typeof job.actual_operators === 'string') {
                if (job.actual_operators.startsWith('[')) {
                  operators = JSON.parse(job.actual_operators);
                } else {
                  operators = [job.actual_operators];
                }
              } 
              // ถ้าเป็น array หรือ object แล้ว
              else if (Array.isArray(job.actual_operators)) {
                operators = job.actual_operators;
              }
              // ถ้าเป็น object เดี่ยว
              else if (typeof job.actual_operators === 'object') {
                operators = [job.actual_operators];
              }
              
              // แปลง operators เป็นชื่อ
              operators.forEach(op => {
                if (typeof op === 'object' && op.name) {
                  bestOperators.add(op.name);
                } else if (typeof op === 'string') {
                  bestOperators.add(op);
                }
              });
              
            } catch (e) {
              console.error('Error parsing operators:', e.message, job.actual_operators);
              bestOperators.add(String(job.actual_operators));
            }
          }
        });
        
        bestTimeOperators = Array.from(bestOperators).join(', ') || 'ไม่ระบุ';
      }
      
      // คำนวณความแม่นยำของเวลาแนะนำ (Median) โดยดูว่าเวลาจริงอยู่ใกล้ Median แค่ไหน
      if (medianTime > 0 && sortedByTime.length >= 3) {
        // คำนวณ Mean Absolute Deviation จาก Median
        const deviations = sortedByTime.map(job => 
          Math.abs(job.actual_duration_minutes - medianTime)
        );
        const meanAbsoluteDeviation = deviations.reduce((sum, dev) => sum + dev, 0) / deviations.length;
        
        // คำนวณ Relative Mean Absolute Deviation (%)
        const relativeMeanAbsoluteDeviation = (meanAbsoluteDeviation / medianTime) * 100;
        
        // หาจำนวนงานที่อยู่ใกล้ Median (ภายใน 20% ของ Median)
        const tolerance = medianTime * 0.2; // 20% ของ Median
        const accurateJobs = sortedByTime.filter(job => 
          Math.abs(job.actual_duration_minutes - medianTime) <= tolerance
        );
        const accuratePercentage = (accurateJobs.length / sortedByTime.length) * 100;
        
        // คำนวณความแม่นยำจาก 2 ปัจจัย: การกระจายและจำนวนงานที่แม่นยำ
        const deviationScore = Math.max(0, 100 - relativeMeanAbsoluteDeviation * 2);
        const accuracyScore = accuratePercentage;
        
        // รวมคะแนนทั้งสอง (ถ่วงน้ำหนัก 60% การกระจาย, 40% จำนวนงานแม่นยำ)
        accuracyRate = Math.round(deviationScore * 0.6 + accuracyScore * 0.4);
        
        // กำหนดระดับความแม่นยำ
        if (accuracyRate >= 80) {
          accuracyLevel = 'ดี';
        } else if (accuracyRate >= 60) {
          accuracyLevel = 'กลาง';
        } else {
          accuracyLevel = 'ต่ำ';
        }
        
        console.log(`🎯 [ACCURACY] Job ${key}:`, {
          medianTime,
          avgTime: Math.round(avgActualDuration),
          meanAbsDeviation: Math.round(meanAbsoluteDeviation),
          relativeMeanAbsDeviation: Math.round(relativeMeanAbsoluteDeviation),
          accurateJobsPercent: Math.round(accuratePercentage),
          accuracyRate,
          accuracyLevel
        });
      } else {
        // ถ้าข้อมูลไม่เพียงพอ ให้ความแม่นยำต่ำ
        accuracyRate = 30;
        accuracyLevel = 'ต่ำ';
      }
    }
    
    // ใช้ unique_productions.size เป็นความถี่จริง
    const actualFrequency = jobGroup.unique_productions.size;
    
    jobStats.push({
      job_code: jobGroup.job_code,
      job_name: jobGroup.job_name,
      frequency: actualFrequency, // ใช้จำนวนการผลิตที่ไม่ซ้ำกัน
      total_work_plans: jobGroup.jobs.length, // จำนวน work plans ทั้งหมด
      production_dates_count: jobGroup.production_dates.size, // จำนวนวันที่ผลิต
      avg_planned_duration: Math.round(avgPlannedDuration),
      avg_actual_duration: Math.round(avgActualDuration), // เวลาเฉลี่ย
      avg_time_variance: Math.round(avgTimeVariance),
      accuracy_rate: Math.round(accuracyRate),
      accuracy_level: accuracyLevel, // ระดับความแม่นยำ: ดี/กลาง/ต่ำ
      recommended_time: recommendedTime, // เวลาที่แนะนำ (Median - แม่นยำที่สุด)
      median_time: medianTime, // เวลากลาง (Median)
      best_time: bestTime, // เวลาที่ดีที่สุด (เร็วที่สุด)
      worst_time: worstTime, // เวลาที่แย่ที่สุด (ช้าที่สุด)
      best_time_operators: bestTimeOperators, // ผู้ปฏิบัติงานสำหรับเวลาที่ดีที่สุด
      total_completed: completedJobs.length,
      total_with_logs: jobsWithLogs.length,
      total_planned: plannedJobs.length
    });
  });
  
  // เรียงลำดับตาม frequency จากมากไปน้อย
  jobStats.sort((a, b) => b.frequency - a.frequency);
  
  console.log('📊 [CALC] Final job statistics:', jobStats.length, 'unique job types');
  console.log('📊 [CALC] Top 3 jobs by frequency:', jobStats.slice(0, 3).map(job => ({
    job_code: job.job_code,
    job_name: job.job_name,
    frequency: job.frequency,
    total_work_plans: job.total_work_plans,
    production_dates_count: job.production_dates_count
  })));
  
  return jobStats;
}

module.exports = router; 