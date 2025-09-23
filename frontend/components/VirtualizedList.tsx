import React, { useMemo, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { InfiniteLoader } from 'react-window-infinite-loader';

interface VirtualizedListProps {
  items: any[];
  height: number;
  itemHeight: number;
  hasNextPage: boolean;
  isNextPageLoading: boolean;
  loadNextPage: () => Promise<void>;
  renderItem: (props: { index: number; style: React.CSSProperties; data: any[] }) => React.ReactElement;
  className?: string;
}

export const VirtualizedList: React.FC<VirtualizedListProps> = ({
  items,
  height,
  itemHeight,
  hasNextPage,
  isNextPageLoading,
  loadNextPage,
  renderItem,
  className = ""
}) => {
  // ถ้ายังโหลดหน้าถัดไป ให้นับรวมด้วย
  const itemCount = hasNextPage ? items.length + 1 : items.length;
  
  // ตรวจสอบว่า item ถูกโหลดแล้วหรือยัง
  const isItemLoaded = useCallback((index: number) => {
    return !!items[index];
  }, [items]);

  // Render function ที่จัดการ loading state
  const Item = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    let content;
    
    if (!isItemLoaded(index)) {
      // แสดง loading skeleton สำหรับ item ที่ยังไม่โหลด
      content = (
        <div className="flex items-center p-4 border-b">
          <div className="animate-pulse flex space-x-4 w-full">
            <div className="rounded-full bg-gray-200 h-10 w-10"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      );
    } else {
      // แสดง item จริง
      content = renderItem({ index, style, data: items });
    }

    return (
      <div style={style}>
        {content}
      </div>
    );
  }, [items, isItemLoaded, renderItem]);

  return (
    <div className={className}>
      {React.createElement(InfiniteLoader as any, {
        isItemLoaded,
        itemCount,
        loadMoreItems: isNextPageLoading ? () => Promise.resolve() : loadNextPage,
        children: ({ onItemsRendered, ref }: any) => (
          <List
            ref={ref}
            height={height}
            width="100%"
            itemCount={itemCount}
            itemSize={itemHeight}
            itemData={items}
            onItemsRendered={onItemsRendered}
            overscanCount={5} // โหลดล่วงหน้า 5 items
          >
            {Item}
          </List>
        )
      })}
    </div>
  );
};

// Component สำหรับ Work Plan List แบบ Virtualized
interface WorkPlanListProps {
  workPlans: any[];
  onSelectWorkPlan: (workPlan: any) => void;
  selectedWorkPlan?: any;
  hasNextPage: boolean;
  isLoading: boolean;
  loadNextPage: () => Promise<void>;
}

export const VirtualizedWorkPlanList: React.FC<WorkPlanListProps> = ({
  workPlans,
  onSelectWorkPlan,
  selectedWorkPlan,
  hasNextPage,
  isLoading,
  loadNextPage
}) => {
  const renderWorkPlanItem = useCallback(({ index, style, data }: { 
    index: number; 
    style: React.CSSProperties; 
    data: any[] 
  }) => {
    const workPlan = data[index];
    const isSelected = selectedWorkPlan?.id === workPlan?.id;
    
    return (
      <div style={style}>
        <div 
          className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
            isSelected ? 'bg-blue-50 border-blue-200' : ''
          }`}
          onClick={() => onSelectWorkPlan(workPlan)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">
                {workPlan.job_code} - {workPlan.job_name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                📅 {workPlan.production_date} | ⏰ {workPlan.start_time} - {workPlan.end_time}
              </p>
              {workPlan.operators && (
                <p className="text-sm text-gray-500 mt-1">
                  👥 {workPlan.operators}
                </p>
              )}
            </div>
            <div className="ml-4">
              <span className={`px-2 py-1 text-xs rounded-full ${
                workPlan.status_name === 'เสร็จสิ้น' 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {workPlan.status_name || 'รอดำเนินการ'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }, [selectedWorkPlan, onSelectWorkPlan]);

  return (
    <VirtualizedList
      items={workPlans}
      height={600}
      itemHeight={120}
      hasNextPage={hasNextPage}
      isNextPageLoading={isLoading}
      loadNextPage={loadNextPage}
      renderItem={renderWorkPlanItem}
      className="border rounded-lg overflow-hidden"
    />
  );
};

export default VirtualizedList;


