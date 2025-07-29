"use client";
import React, { useEffect, useState, useRef } from "react";
import { Noto_Sans_Thai } from "next/font/google";

const notoSansThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
});

function formatUsedTime(sec: number) {
  if (sec == null) return "–";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function TrackerPage() {
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 10);
  });
  const [workplans, setWorkplans] = useState<any[]>([]);
  const [selectedWorkplan, setSelectedWorkplan] = useState<any>(null);
  const [processSteps, setProcessSteps] = useState<any[]>([]);
  const [processLogs, setProcessLogs] = useState<any[]>([]);
  const [selectedProcessIndex, setSelectedProcessIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [usedSec, setUsedSec] = useState<number | null>(null);
  const [statusType, setStatusType] = useState<"success"|"fail"|"info">("info");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load workplans by date
  useEffect(() => {
    setIsLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3101';
    fetch(`${apiUrl}/api/work-plans?date=${date}`)
      .then(res => res.json())
      .then(data => {
        console.log('[DEBUG] Loaded workplans:', data);
        setWorkplans((data.data || []).filter((wp: any) => wp.status_name !== 'งานผลิตถูกยกเลิก'));
      })
      .finally(() => setIsLoading(false));
    setSelectedWorkplan(null);
    setProcessSteps([]);
    setProcessLogs([]);
    setSelectedProcessIndex(0);
    setUsedSec(null);
  }, [date]);

  // Load process steps & logs when select workplan
  useEffect(() => {
    if (!selectedWorkplan) return;
    setIsLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3101';
    Promise.all([
      fetch(`${apiUrl}/api/process-steps?job_code=${selectedWorkplan.job_code}`).then(res => res.json()),
      fetch(`${apiUrl}/api/logs/work-plan/${selectedWorkplan.id}`).then(res => res.json())
    ]).then(([steps, logs]) => {
      console.log('[DEBUG] Loaded process steps:', steps);
      console.log('[DEBUG] Loaded process logs:', logs);
      setProcessSteps(steps.data || []);
      setProcessLogs(logs.data || []);
      setSelectedProcessIndex(0);
      setUsedSec(null);
    }).finally(() => setIsLoading(false));
  }, [selectedWorkplan]);

  // Update timer when processLogs or selectedProcessIndex change
  useEffect(() => {
    if (!processSteps[selectedProcessIndex]) {
      setUsedSec(null);
      if (timer) clearInterval(timer);
      return;
    }
    const step = processSteps[selectedProcessIndex];
    const log = processLogs.find((l: any) => l.process_number === step.process_number) || {};
    
    console.log('[DEBUG] Timer update:', {
      step: step.process_number,
      log: log,
      start_time: log.start_time,
      stop_time: log.stop_time,
      used_time: log.used_time
    });
    
    if (log.start_time && !log.stop_time) {
      // running - เริ่ม timer
      const start = new Date(log.start_time);
      if (timer) clearInterval(timer);
      const t = setInterval(() => {
        const currentSec = Math.floor((Date.now() - start.getTime()) / 1000);
        setUsedSec(currentSec);
        console.log('[DEBUG] Timer tick:', currentSec);
      }, 1000);
      setTimer(t);
      setUsedSec(Math.floor((Date.now() - start.getTime()) / 1000));
    } else if (log.used_time != null) {
      // finished - แสดงเวลาจาก database
      setUsedSec(log.used_time);
      if (timer) clearInterval(timer);
    } else {
      // not started - รีเซ็ต timer
      setUsedSec(null);
      if (timer) clearInterval(timer);
    }
    
    return () => { 
      if (timer) {
        clearInterval(timer);
        setTimer(null);
      }
    };
  }, [processLogs, selectedProcessIndex]);

  // Scroll to active step in process list
  useEffect(() => {
    if (scrollRef.current) {
      const active = scrollRef.current.querySelector('.process-item-active');
      if (active && active instanceof HTMLElement) {
        active.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [selectedProcessIndex]);

  // Handle finish production
  const handleFinishProduction = async () => {
    if (!selectedWorkplan) return;
    setIsLoading(true);
    setMessage("");
    setStatusType("info");
    
    console.log("[DEBUG] handleFinishProduction called for workplan:", selectedWorkplan.id);
    
    try {
      const apiUrl = 'http://localhost:3101'; // Hardcode URL เพื่อแก้ปัญหา
      
      console.log("[DEBUG] API URL:", apiUrl);
      console.log("[DEBUG] Workplan ID:", selectedWorkplan.id);
      console.log("[DEBUG] Full URL:", `${apiUrl}/api/work-plans/${selectedWorkplan.id}/status`);
      
      // อัปเดตสถานะงานเป็น "เสร็จสิ้น" (status_id = 4)
      const res = await fetch(`${apiUrl}/api/work-plans/${selectedWorkplan.id}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        mode: 'cors',
        body: JSON.stringify({ status_id: 4 }) // 4 = เสร็จสิ้น
      });
      
      const result = await res.json();
      console.log("[DEBUG] Finish production response:", result);
      
      if (!res.ok || !result.success) {
        console.error("[DEBUG] API error:", result);
        throw new Error(result.message || "API error");
      }
      
      setMessage("จบงานผลิตแล้ว");
      setStatusType("success");
      
      // Reload workplans เพื่ออัปเดตสถานะ
      console.log("[DEBUG] Reloading workplans...");
      const workplansRes = await fetch(`${apiUrl}/api/work-plans?date=${date}`);
      const workplansData = await workplansRes.json();
      setWorkplans((workplansData.data || []).filter((wp: any) => wp.status_name !== 'งานผลิตถูกยกเลิก'));
      
      // อัปเดต selectedWorkplan ด้วยสถานะใหม่
      const updatedWorkplan = workplansData.data?.find((wp: any) => wp.id === selectedWorkplan.id);
      if (updatedWorkplan) {
        setSelectedWorkplan(updatedWorkplan);
      }
      
    } catch (e: any) {
      console.error("[DEBUG] Error in handleFinishProduction:", e);
      console.error("[DEBUG] Error name:", e.name);
      console.error("[DEBUG] Error message:", e.message);
      console.error("[DEBUG] Error stack:", e.stack);
      
      let errorMessage = "เกิดข้อผิดพลาดในการจบงานผลิต";
      if (e.name === 'TypeError' && e.message.includes('Failed to fetch')) {
        errorMessage = "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบการเชื่อมต่อ";
      } else if (e.message) {
        errorMessage += ": " + e.message;
      }
      
      setMessage(errorMessage);
      setStatusType("fail");
    }
    setIsLoading(false);
  };

  // Handle start/stop
  const handleLog = async (isStart: boolean) => {
    if (!selectedWorkplan || !processSteps[selectedProcessIndex]) return;
    setIsLoading(true);
    setMessage("");
    setStatusType("info");
    const step = processSteps[selectedProcessIndex];
    const status = isStart ? "start" : "stop";
    const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
    
    console.log("[DEBUG] handleLog called:", {
      isStart,
      workplan: selectedWorkplan.id,
      step: step.process_number,
      status,
      timestamp
    });
    
    try {
      console.log("[DEBUG] ส่ง log ไป backend:", {
        work_plan_id: selectedWorkplan.id,
        process_number: step.process_number,
        status,
        timestamp
      });
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3101';
      const res = await fetch(`${apiUrl}/api/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          work_plan_id: selectedWorkplan.id,
          process_number: step.process_number,
          status,
          timestamp
        })
      });
      
      const result = await res.json().catch(() => ({}));
      console.log("[DEBUG] log response:", result);
      
      if (!res.ok || !result.success) {
        console.error("[DEBUG] API error:", result);
        throw new Error(result.message || "API error");
      }
      
      setMessage(isStart ? "เริ่มขั้นตอนแล้ว" : "หยุดขั้นตอนแล้ว");
      setStatusType("success");
      
      // reload logs
      console.log("[DEBUG] Reloading logs...");
      const logs = await fetch(`${apiUrl}/api/logs/work-plan/${selectedWorkplan.id}`).then(r => r.json());
      console.log("[DEBUG] Reloaded logs:", logs);
      setProcessLogs(logs.data || []);
      
    } catch (e: any) {
      console.error("[DEBUG] Error in handleLog:", e);
      setMessage("เกิดข้อผิดพลาดในการบันทึก: " + (e?.message || ""));
      setStatusType("fail");
    }
    setIsLoading(false);
  };

  // เวลารวมของงาน
  const totalJobTime = (() => {
    const starts = processLogs.map(l => l.start_time).filter(Boolean).map((t: string) => new Date(t));
    const stops = processLogs.map(l => l.stop_time).filter(Boolean).map((t: string) => new Date(t));
    if (starts.length === 0 || stops.length === 0) return "–";
    const minStart = new Date(Math.min(...starts.map(d => d.getTime())));
    const maxStop = new Date(Math.max(...stops.map(d => d.getTime())));
    const sec = Math.floor((maxStop.getTime() - minStart.getTime()) / 1000);
    return formatUsedTime(sec);
  })();

  return (
    <div className={`min-h-screen bg-gray-50 py-4 px-2 sm:px-4 text-base sm:text-lg ${notoSansThai.className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-row justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-black">ระบบจับเวลาการผลิต</h1>
          <div className="flex flex-row items-center gap-2">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="border rounded px-2 py-1" />
            <button className="border rounded px-3 py-1 text-gray-700 bg-white shadow-sm flex items-center gap-1">
              <span className="hidden sm:inline">เมนู</span>
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
            </button>
          </div>
        </div>
        <div className="text-gray-500 mb-4 text-lg">Food Production Timer</div>
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* กล่องซ้าย: จับเวลา */}
          <div className="w-full lg:w-7/12">
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-4">
              {/* Header */}
              <div className="text-center text-lg font-semibold mb-2">
                {selectedWorkplan ? selectedWorkplan.job_name : "แผนงานผลิต"}
              </div>
              {/* เลขขั้นตอน + ปุ่มลูกศร + ชื่อขั้นตอน */}
              <div className="flex flex-col items-center mb-2">
                <div className="text-2xl font-bold mb-2 text-center min-h-[2.5rem] flex items-center justify-center">{processSteps[selectedProcessIndex]?.process_description || "-"}</div>
                <div className="flex flex-row items-center justify-center gap-6 w-full">
                  <button
                    className="bg-gray-300 rounded-full w-12 h-12 flex items-center justify-center text-2xl"
                    onClick={() => setSelectedProcessIndex(i => Math.max(0, i - 1))}
                    disabled={selectedProcessIndex === 0}
                  >&lt;</button>
                  <div className="flex flex-col items-center min-w-[120px]">
                    <div className="number-display text-6xl font-mono bg-black text-white rounded-lg px-10 py-4 mb-2">
                      {processSteps[selectedProcessIndex]?.process_number?.toString().padStart(2, "0") || "--"}
                    </div>
                    <div className="text-base font-bold mb-1">ขั้นตอนที่</div>
                  </div>
                  <button
                    className="bg-gray-300 rounded-full w-12 h-12 flex items-center justify-center text-2xl"
                    onClick={() => setSelectedProcessIndex(i => Math.min(processSteps.length - 1, i + 1))}
                    disabled={selectedProcessIndex === processSteps.length - 1}
                  >&gt;</button>
                </div>
              </div>
              {/* กล่องเวลา */}
              <div className="flex flex-col sm:flex-row gap-2 justify-center mb-4">
                <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">เวลาเริ่ม</div>
                  <div className="font-bold text-lg">
                    {(() => {
                      const log = processLogs.find((l: any) => l.process_number === processSteps[selectedProcessIndex]?.process_number) || {};
                      return log.start_time ? new Date(log.start_time).toLocaleTimeString("th-TH", { timeZone: "Asia/Bangkok" }) : "–";
                    })()}
                  </div>
                </div>
                <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">เวลาสิ้นสุด</div>
                  <div className="font-bold text-lg text-red-600">
                    {(() => {
                      const log = processLogs.find((l: any) => l.process_number === processSteps[selectedProcessIndex]?.process_number) || {};
                      return log.stop_time ? new Date(log.stop_time).toLocaleTimeString("th-TH", { timeZone: "Asia/Bangkok" }) : "–";
                    })()}
                  </div>
                </div>
                <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                  <div className="text-xs text-gray-500">เวลาที่ใช้</div>
                  <div className="font-bold text-lg">{(() => {
                    const log = processLogs.find((l: any) => l.process_number === processSteps[selectedProcessIndex]?.process_number) || {};
                    // ใช้ usedSec ถ้ามี (timer กำลังทำงาน) หรือใช้ log.used_time จาก database
                    if (usedSec !== null) {
                      return formatUsedTime(usedSec);
                    } else if (log.used_time != null) {
                      return formatUsedTime(log.used_time);
                    } else {
                      return "–";
                    }
                  })()}</div>
                </div>
              </div>
              {/* ปุ่ม */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-2">
                <button
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg text-lg disabled:opacity-50"
                  onClick={() => handleLog(true)}
                  disabled={isLoading || !selectedWorkplan}
                >เริ่มขั้นตอน</button>
                <button
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg text-lg disabled:opacity-50"
                  onClick={() => handleLog(false)}
                  disabled={isLoading || !selectedWorkplan}
                >หยุดขั้นตอน</button>
                <button
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-lg text-lg disabled:opacity-50"
                  onClick={() => handleFinishProduction()}
                  disabled={isLoading || !selectedWorkplan}
                >จบงานผลิตแล้ว</button>
              </div>
            </div>
          </div>
          {/* กล่องขวา: งานที่ผลิต (dropdown) ด้านบน, รายการขั้นตอนด้านล่าง */}
          <div className="w-full lg:w-5/12 flex flex-col gap-4">
            {/* กล่องงานที่ผลิต */}
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6">
              <div className="flex flex-row items-center gap-3 mb-2">
                <div className="font-semibold whitespace-nowrap">งานที่ผลิต</div>
                <select
                  className="border rounded px-2 py-1 min-w-[180px]"
                  value={selectedWorkplan?.id || ""}
                  onChange={e => {
                    const wp = workplans.find(w => w.id == e.target.value);
                    setSelectedWorkplan(wp || null);
                  }}
                >
                  <option value="">กรุณาเลือก</option>
                  {workplans.map(wp => (
                    <option key={wp.id} value={wp.id}>{wp.job_name}</option>
                  ))}
                </select>
              </div>
              {selectedWorkplan && selectedWorkplan.operators && (
                <div className="mt-2 text-gray-700 text-base">
                  <span className="font-semibold">ผู้ปฏิบัติงาน:</span> {(() => {
                    try {
                      if (typeof selectedWorkplan.operators === 'string') {
                        return selectedWorkplan.operators;
                      } else if (Array.isArray(selectedWorkplan.operators)) {
                        return selectedWorkplan.operators.map((op: any) => 
                          typeof op === 'string' ? op : op.name || op.id_code || 'Unknown'
                        ).join(", ");
                      } else {
                        return 'ไม่ระบุ';
                      }
                    } catch (e) {
                      return 'ไม่ระบุ';
                    }
                  })()}
                </div>
              )}
            </div>
            {/* กล่องรายการขั้นตอนการผลิต */}
            <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-semibold"><i className="bi bi-clock mr-2" />รายการขั้นตอนการผลิต</span>
              </div>
              <div ref={scrollRef} className="process-scroll max-h-[400px] overflow-y-auto divide-y divide-gray-100">
                {processSteps.length === 0 && <div className="text-center text-gray-400 py-4">ไม่มีขั้นตอนการผลิต</div>}
                {processSteps.map((step, idx) => {
                  const log = processLogs.find((l: any) => l.process_number === step.process_number) || {};
                  return (
                    <div
                      key={step.process_number}
                      className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 py-4 px-3 cursor-pointer ${idx === selectedProcessIndex ? "bg-green-50 process-item-active" : "hover:bg-gray-50"}`}
                      onClick={() => setSelectedProcessIndex(idx)}
                    >
                      <div className="font-bold text-xl w-10 text-center">{step.process_number}.</div>
                      <div className="flex-1 font-semibold text-gray-900 text-lg">{step.process_description}</div>
                      <div className="flex flex-col text-base text-right min-w-[110px] gap-0.5">
                        <span>เริ่ม: <span className="text-green-700 font-bold">{log.start_time ? new Date(log.start_time).toLocaleTimeString("th-TH", { timeZone: "Asia/Bangkok" }) : "–"}</span></span>
                        <span>สิ้นสุด: <span className="text-red-600 font-bold">{log.stop_time ? new Date(log.stop_time).toLocaleTimeString("th-TH", { timeZone: "Asia/Bangkok" }) : "–"}</span></span>
                        <span>ใช้เวลา: <span className="text-blue-700 font-bold">{(() => {
                          // ถ้าเป็นขั้นตอนที่กำลังทำงาน ให้ใช้ usedSec
                          if (idx === selectedProcessIndex && usedSec !== null) {
                            return formatUsedTime(usedSec);
                          } else if (log.used_time != null) {
                            return formatUsedTime(log.used_time);
                          } else {
                            return "–";
                          }
                        })()}</span></span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-right mt-2 text-sm text-gray-600">เวลารวมของงาน: <span className="font-bold">{totalJobTime}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
