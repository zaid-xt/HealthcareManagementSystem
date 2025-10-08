import { Users } from 'lucide-react';
import { StaffWithShift } from '../../api/staffApi';

interface DepartmentCoverageProps {
  staff: StaffWithShift[];
}

export default function DepartmentCoverage({ staff }: DepartmentCoverageProps) {
  const calculateCoverage = () => {
    const coverage: { [key: string]: { total: number; onDuty: number } } = {};

    staff.forEach((s) => {
      if (!coverage[s.department]) {
        coverage[s.department] = { total: 0, onDuty: 0 };
      }
      coverage[s.department].total += 1;

      if (s.current_shift) {
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

        if (adjustedCurrentTime >= startSeconds && adjustedCurrentTime < endSeconds) {
          coverage[s.department].onDuty += 1;
        }
      }
    });

    return Object.entries(coverage).map(([department, data]) => ({
      department,
      ...data,
      percentage: Math.round((data.onDuty / data.total) * 100),
    }));
  };

  const coverageData = calculateCoverage();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center mb-6">
        <Users className="w-6 h-6 text-blue-600 mr-2" />
        <h2 className="text-xl font-bold text-gray-900">Department Coverage</h2>
      </div>

      <div className="space-y-4">
        {coverageData.map((dept) => (
          <div key={dept.department} className="border-b border-gray-200 pb-4 last:border-b-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{dept.department}</h3>
              <span className="text-sm text-gray-600">
                {dept.onDuty} / {dept.total} on duty
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  dept.percentage >= 70
                    ? 'bg-green-500'
                    : dept.percentage >= 40
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${dept.percentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-1">{dept.percentage}% coverage</p>
          </div>
        ))}
      </div>
    </div>
  );
}
