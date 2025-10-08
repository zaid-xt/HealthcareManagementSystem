import { useState, useEffect } from 'react';
import { Search, Filter, Users, Clock, Calendar } from 'lucide-react';
import { getStaffWithCurrentShifts, StaffWithShift } from '../api/staffApi';
import StaffCard from '../components/staff/StaffCard';
import DepartmentCoverage from '../components/staff/DepartmentCoverage';
import ViewStaffDetails from '../components/staff/ViewStaffDetails';
import Input from '../components/ui/Input';

type ViewMode = 'roster' | 'schedule';

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffWithShift[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<StaffWithShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('roster');
  const [selectedStaff, setSelectedStaff] = useState<StaffWithShift | null>(null);

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    filterStaff();
  }, [staff, searchQuery, selectedDepartment, viewMode]);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      const data = await getStaffWithCurrentShifts(today);
      setStaff(data);
    } catch (error) {
      console.error('Error loading staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterStaff = () => {
    let filtered = [...staff];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.full_name.toLowerCase().includes(query) ||
          s.role.toLowerCase().includes(query) ||
          s.department.toLowerCase().includes(query) ||
          s.employee_id.toLowerCase().includes(query)
      );
    }

    if (selectedDepartment !== 'all') {
      filtered = filtered.filter((s) => s.department === selectedDepartment);
    }

    if (viewMode === 'roster') {
      filtered = filtered.filter((s) => {
        if (!s.current_shift) return false;

        const now = new Date();
        const currentTime = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

        const [startHours, startMinutes] = s.current_shift.start_time.split(':').map(Number);
        const [endHours, endMinutes] = s.current_shift.end_time.split(':').map(Number);

        const startSeconds = startHours * 3600 + startMinutes * 60;
        let endSeconds = endHours * 3600 + endMinutes * 60;

        if (endSeconds < startSeconds) {
          endSeconds += 24 * 3600;
        }

        let adjustedCurrentTime = currentTime;
        if (currentTime < startSeconds && endSeconds > 24 * 3600) {
          adjustedCurrentTime += 24 * 3600;
        }

        return adjustedCurrentTime >= startSeconds && adjustedCurrentTime < endSeconds;
      });
    } else if (viewMode === 'schedule') {
      filtered = filtered.filter((s) => s.current_shift !== null);
    }

    setFilteredStaff(filtered);
  };

  const departments = Array.from(new Set(staff.map((s) => s.department))).sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Directory</h1>
          <p className="text-gray-600 mt-1">
            Manage and view hospital staff roster and schedules
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by name, role, department, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('roster')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'roster'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="w-4 h-4" />
              Roster View
            </button>
            <button
              onClick={() => setViewMode('schedule')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'schedule'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Schedule View
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>
            {viewMode === 'roster'
              ? 'Showing currently on-duty staff'
              : "Showing today's scheduled staff"}
          </span>
          <span className="ml-auto font-semibold">
            {filteredStaff.length} staff member{filteredStaff.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading staff...</p>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Staff Found</h3>
              <p className="text-gray-600">
                {viewMode === 'roster'
                  ? 'No staff members are currently on duty.'
                  : 'No staff members have shifts scheduled for today.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredStaff.map((s) => (
                <StaffCard key={s.id} staff={s} onView={setSelectedStaff} />
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <DepartmentCoverage staff={staff} />
        </div>
      </div>

      {selectedStaff && (
        <ViewStaffDetails staff={selectedStaff} onClose={() => setSelectedStaff(null)} />
      )}
    </div>
  );
}
