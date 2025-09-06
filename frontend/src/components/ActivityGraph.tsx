
import { Calendar } from 'lucide-react';

export default function ActivityGraph() {
  // Generate activity data for the past year
  const generateActivityData = () => {
    const data = [];
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const intensity = Math.floor(Math.random() * 5); // 0-4 intensity levels
      data.push({
        date: new Date(d),
        intensity,
        count: intensity * Math.floor(Math.random() * 10) + intensity
      });
    }
    return data;
  };

  const activityData = generateActivityData();
  const totalCherryBlossoms = activityData.reduce((sum, day) => sum + day.count, 0);
  
  // Group data by weeks
  const weeks: Array<Array<{date: Date; intensity: number; count: number} | null>> = [];
let currentWeek: Array<ActivityDay | null> = [];

interface ActivityDay {
    date: Date;
    intensity: number;
    count: number;
}
  
  activityData.forEach((day, index) => {
    currentWeek.push(day);
    if (day.date.getDay() === 6 || index === activityData.length - 1) {
      // Fill the first week with empty days if it doesn't start on Sunday
      if (weeks.length === 0) {
        const firstDayOfWeek = currentWeek[0] ? currentWeek[0].date.getDay() : 0;
        for (let i = 0; i < firstDayOfWeek; i++) {
          currentWeek.unshift(null);
        }
      }
      weeks.push([...currentWeek]);
      currentWeek = [];
    }
  });

  const getIntensityColor = (intensity: number) => {
    switch (intensity) {
      case 0: return 'bg-slate-700/30';
      case 1: return 'bg-pink-900/40';
      case 2: return 'bg-pink-800/60';
      case 3: return 'bg-pink-700/80';
      case 4: return 'bg-pink-600';
      default: return 'bg-slate-700/30';
    }
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  return (
    <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900/40 backdrop-blur-sm rounded-xl p-6 border border-emerald-700/30">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Calendar className="w-6 h-6 text-emerald-400" />
          <h3 className="font-cinzel text-xl font-semibold text-emerald-200">Learning Activity</h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-400">{totalCherryBlossoms}</p>
          <p className="text-sm text-gray-400">Cherry Blossoms Earned</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        {/* Month labels */}
        <div className="flex mb-2">
          <div className="w-8"></div>
          {months.map((month, index) => (
            <div key={index} className="flex-1 text-xs text-gray-400 text-center min-w-[40px]">
              {month}
            </div>
          ))}
        </div>

        {/* Day labels and activity grid */}
        <div className="flex">
          {/* Day labels */}
          <div className="flex flex-col space-y-1 mr-2">
            {days.map((day, index) => (
              <div key={index} className="w-6 h-3 text-xs text-gray-400 flex items-center justify-center">
                {index % 2 === 1 ? day : ''}
              </div>
            ))}
          </div>

          {/* Activity squares */}
          <div className="flex space-x-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col space-y-1">
                {Array.from({ length: 7 }, (_, dayIndex) => {
                  const dayData = week[dayIndex];
                  if (!dayData) {
                    return <div key={dayIndex} className="w-3 h-3"></div>;
                  }
                  
                  return (
                    <div
                      key={dayIndex}
                      className={`w-3 h-3 rounded-sm ${getIntensityColor(dayData.intensity)} transition-all duration-200 hover:scale-125 hover:z-10 relative group cursor-pointer`}
                      title={`${dayData.date.toDateString()}: ${dayData.count} cherry blossoms`}
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                        {dayData.date.toLocaleDateString()}: {dayData.count} 🌸
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
          <span>Less</span>
          <div className="flex items-center space-x-1">
            {[0, 1, 2, 3, 4].map((intensity) => (
              <div
                key={intensity}
                className={`w-3 h-3 rounded-sm ${getIntensityColor(intensity)}`}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </div>
    </div>
  );
}