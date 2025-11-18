import React, { useMemo } from 'react';
import { StoreSection } from '../types';

interface FloorMapProps {
  sections: StoreSection[];
  path: string[];
  userPosition: { x: number; y: number };
}

const FloorMap: React.FC<FloorMapProps> = ({ sections, path, userPosition }) => {
  const pathPoints = useMemo(() => {
    if (path.length < 2) return '';
    
    return path
      .map(sectionId => {
        const section = sections.find(s => s.id === sectionId);
        return section ? `${section.center.x * 5} ${section.center.y * 5}` : ''; // Scale factor for 100x100 viewbox
      })
      .filter(Boolean)
      .join(' ');
  }, [path, sections]);

  return (
    <div className="w-full h-full flex flex-col">
      <h2 className="text-xl font-bold text-gray-700 mb-2">Floor Map</h2>
      <div className="flex items-center space-x-1 mb-4">
        {['Floor 1', 'Floor 2', 'Floor 3', 'Floor 4'].map((floor, index) => (
          <button
            key={floor}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              index === 0
                ? 'bg-blue-600 text-white shadow'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {floor}
          </button>
        ))}
      </div>
      <div className="relative flex-grow bg-white border border-gray-200 rounded-lg overflow-hidden p-2">
        <div className="grid w-full h-full" style={{ gridTemplateColumns: 'repeat(20, 1fr)', gridTemplateRows: 'repeat(20, 1fr)' }}>
          {sections.map(section => (
            <div key={section.id} style={{ gridArea: section.gridArea, backgroundColor: section.color }} className="flex items-center justify-center rounded-md p-1">
              <span className="text-xs sm:text-sm font-semibold text-black/70 text-center">{section.name}</span>
            </div>
          ))}
        </div>
        <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {pathPoints && (
             <polyline
              points={pathPoints}
              fill="none"
              stroke="rgba(37, 99, 235, 0.8)"
              strokeWidth="1.5"
              strokeDasharray="2 1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
        <div 
          className="absolute w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-lg"
          style={{ 
            left: `calc(${userPosition.x * 5}% - 8px)`, 
            top: `calc(${userPosition.y * 5}% - 8px)`
          }}
        ></div>
      </div>
    </div>
  );
};

export default FloorMap;
