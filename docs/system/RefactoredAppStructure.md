├── app/                                  # Next.js App Router
│   ├── page.tsx                         # หน้าแรก หรือ redirect ไปหน้าแผนผลิต
│   └── work-plans/
│       ├── page.tsx                     # หน้าแสดงและเพิ่มแผนผลิต
│       └── [id]/edit/page.tsx          # หน้าแก้ไขแผนผลิต
│   └── api/
│       └── work-plans/
│           ├── route.ts                # GET & POST work plans
│           └── [id]/route.ts           # PUT & DELETE work plans
├── components/
│   ├── SearchBox.tsx                    # ช่องค้นหาพร้อม debounce + dropdown
│   ├── WorkPlanForm.tsx                # ฟอร์มเพิ่ม/แก้ไขแผนผลิต
│   └── WorkPlanTable.tsx               # ตารางแสดงแผนผลิต
├── lib/
│   ├── prisma.ts                        # Prisma Client
│   └── utils.ts                         # ฟังก์ชันช่วยทั่วไป เช่น formatDate()
├── prisma/
│   ├── schema.prisma                    # โครงสร้าง MySQL
│   └── seed.ts                          # ข้อมูลตั้งต้น (เช่น status, room)
├── styles/
│   └── globals.css                      # CSS หลัก (Tailwind)
├── types/
│   └── workplan.ts                      # TypeScript interface เช่น WorkPlan, FormInput
├── public/
│   └── placeholder.svg                  # รูป default ของ avatar
├── .env                                 # DATABASE_URL, etc
├── tailwind.config.ts                   # ตั้งค่า Tailwind
├── tsconfig.json
├── next.config.js
├── package.json
