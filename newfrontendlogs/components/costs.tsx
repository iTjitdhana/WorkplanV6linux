"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"

interface CostRow {
  id: string
  jobCode: string
  productName: string
  inputQty: number
  inputUnit: string
  unitCost: number
  outputQty: number
  outputUnit: string
  minutes: number
  operators: number
}

const LABOR_RATE_PER_HOUR = 480

export default function Costs() {
  const [rows, setRows] = useState<CostRow[]>([
    {
      id: "1",
      jobCode: "JOB-001",
      productName: "ตัวอย่างสินค้า",
      inputQty: 100,
      inputUnit: "กก.",
      unitCost: 120,
      outputQty: 92,
      outputUnit: "กก.",
      minutes: 150,
      operators: 2,
    },
  ])

  const totals = useMemo(() => {
    const sum = { labor: 0, loss10: 0, util1: 0 }
    rows.forEach((r) => {
      const labor = (r.minutes / 60) * r.operators * LABOR_RATE_PER_HOUR
      const loss10 = r.outputQty * r.unitCost * 0.1
      const util1 = r.outputQty * r.unitCost * 0.01
      sum.labor += labor
      sum.loss10 += loss10
      sum.util1 += util1
    })
    return sum
  }, [rows])

  const update = (id: string, patch: Partial<CostRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">ตารางต้นทุนการผลิต</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead rowSpan={2} className="min-w-[220px] bg-gray-50">รายการสินค้า</TableHead>
                <TableHead rowSpan={2} className="min-w-[120px] bg-gray-50">รหัสงาน</TableHead>
                <TableHead colSpan={2} className="text-center bg-rose-50 text-rose-800">ต้นทุนวัตถุดิบตั้งต้น (บาท)</TableHead>
                <TableHead colSpan={2} className="text-center bg-emerald-50 text-emerald-800">ต้นทุนที่ผลิตได้ (บาท)</TableHead>
                <TableHead colSpan={4} className="text-center bg-amber-50 text-amber-800">ผลการผลิต</TableHead>
                <TableHead colSpan={2} className="text-center bg-sky-50 text-sky-800">ต้นทุนแรงงาน</TableHead>
                <TableHead colSpan={2} className="text-center bg-indigo-50 text-indigo-800">ค่าใช้จ่ายเพิ่ม</TableHead>
              </TableRow>
              <TableRow>
                <TableHead className="bg-rose-50">จำนวนรวม</TableHead>
                <TableHead className="bg-rose-50">หน่วย</TableHead>
                <TableHead className="bg-emerald-50">มูลค่าต่อหน่วย</TableHead>
                <TableHead className="bg-emerald-50">หน่วย</TableHead>
                <TableHead className="bg-amber-50">จำนวนผลิตได้</TableHead>
                <TableHead className="bg-amber-50">%</TableHead>
                <TableHead className="bg-amber-50">เวลาที่ใช้ (นาที)</TableHead>
                <TableHead className="bg-amber-50">ผู้ปฏิบัติงาน</TableHead>
                <TableHead className="bg-sky-50">ค่าจ้าง/ชั่วโมง</TableHead>
                <TableHead className="bg-sky-50">ต้นทุนรวมค่าแรง</TableHead>
                <TableHead className="bg-indigo-50">ค่าสูญหาย 10%</TableHead>
                <TableHead className="bg-indigo-50">ค่าน้ำ/ไฟ/แก๊ส 1%</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => {
                const yieldPercent = r.inputQty > 0 ? (r.outputQty / r.inputQty) * 100 : 0
                const labor = (r.minutes / 60) * r.operators * LABOR_RATE_PER_HOUR
                const loss10 = r.outputQty * r.unitCost * 0.1
                const util1 = r.outputQty * r.unitCost * 0.01
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.productName}</TableCell>
                    <TableCell className="text-xs text-gray-600">{r.jobCode}</TableCell>
                    <TableCell>
                      <Input type="number" step="0.01" value={r.inputQty} onChange={(e) => update(r.id, { inputQty: parseFloat(e.target.value || "0") })} />
                    </TableCell>
                    <TableCell>
                      <Input value={r.inputUnit} onChange={(e) => update(r.id, { inputUnit: e.target.value })} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" step="0.01" value={r.unitCost} onChange={(e) => update(r.id, { unitCost: parseFloat(e.target.value || "0") })} />
                    </TableCell>
                    <TableCell>
                      <Input value={r.outputUnit} onChange={(e) => update(r.id, { outputUnit: e.target.value })} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" step="0.01" value={r.outputQty} onChange={(e) => update(r.id, { outputQty: parseFloat(e.target.value || "0") })} />
                    </TableCell>
                    <TableCell>{yieldPercent.toFixed(2)}%</TableCell>
                    <TableCell>
                      <Input type="number" step={1} value={r.minutes} onChange={(e) => update(r.id, { minutes: parseInt(e.target.value || "0", 10) })} />
                    </TableCell>
                    <TableCell>
                      <Input type="number" step={1} value={r.operators} onChange={(e) => update(r.id, { operators: parseInt(e.target.value || "0", 10) })} />
                    </TableCell>
                    <TableCell className="text-right">{LABOR_RATE_PER_HOUR.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{labor.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{loss10.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{util1.toFixed(2)}</TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
        <div className="text-sm text-gray-700 mt-3">
          สรุปต้นทุน (แถวทั้งหมด): ค่าแรง {totals.labor.toFixed(2)} บาท, ค่าสูญหาย 10% {totals.loss10.toFixed(2)} บาท, ค่าสาธารณูปโภค 1% {totals.util1.toFixed(2)} บาท
        </div>
      </CardContent>
    </Card>
  )
}



