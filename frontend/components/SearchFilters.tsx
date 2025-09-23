import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface SearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  selectedJobCode: string;
  onJobCodeChange: (value: string) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
  statusOptions?: Array<{ id: string; name: string; color?: string }>;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedJobCode,
  onJobCodeChange,
  onClearFilters,
  isLoading = false,
  statusOptions = []
}) => {
  const hasActiveFilters = searchTerm || selectedStatus || selectedJobCode;

  return (
    <div className="bg-white border rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 text-gray-600" />
        <h3 className="font-medium text-gray-900">ตัวกรองข้อมูล</h3>
        {hasActiveFilters && (
          <Badge variant="secondary" className="ml-auto">
            มีการกรอง
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            ค้นหาชื่องาน/รหัสงาน
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="ค้นหา..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            สถานะงาน
          </label>
          <Select value={selectedStatus} onValueChange={onStatusChange} disabled={isLoading}>
            <SelectTrigger>
              <SelectValue placeholder="เลือกสถานะ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">ทุกสถานะ</SelectItem>
              {statusOptions.map((status) => (
                <SelectItem key={status.id} value={status.id}>
                  <div className="flex items-center gap-2">
                    {status.color && (
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: status.color }}
                      />
                    )}
                    {status.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Job Code Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            รหัสงาน
          </label>
          <Input
            type="text"
            placeholder="เช่น A, B, C..."
            value={selectedJobCode}
            onChange={(e) => onJobCodeChange(e.target.value)}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="flex justify-end pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearFilters}
            disabled={isLoading}
            className="text-gray-600 hover:text-gray-900"
          >
            <X className="w-4 h-4 mr-2" />
            ล้างตัวกรอง
          </Button>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <span className="text-sm text-gray-600">ตัวกรองที่ใช้:</span>
          {searchTerm && (
            <Badge variant="outline">
              ค้นหา: {searchTerm}
            </Badge>
          )}
          {selectedStatus && (
            <Badge variant="outline">
              สถานะ: {statusOptions.find(s => s.id === selectedStatus)?.name || selectedStatus}
            </Badge>
          )}
          {selectedJobCode && (
            <Badge variant="outline">
              รหัส: {selectedJobCode}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchFilters;




