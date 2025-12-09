import React, { useState, useEffect } from 'react';
import { Activity, Thermometer, Pill, Stethoscope, Clock } from 'lucide-react';
import { getEpisodeData } from '../db/helpers';
import { type SymptomEntry, type VitalSign, type Intervention } from '../db/database';
import { format, startOfDay, isSameDay } from 'date-fns';

interface Props {
  episodeId: number;
}

type TimelineEvent = {
  timestamp: Date;
  type: 'symptom' | 'vital' | 'intervention';
  data: SymptomEntry | VitalSign | Intervention;
};

export const Timeline: React.FC<Props> = ({ episodeId }) => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  const loadData = async () => {
    const data = await getEpisodeData(episodeId);
    if (!data.episode) return;

    const allEvents: TimelineEvent[] = [
      ...data.symptoms.map((s) => ({
        timestamp: s.timestamp,
        type: 'symptom' as const,
        data: s,
      })),
      ...data.vitals.map((v) => ({
        timestamp: v.timestamp,
        type: 'vital' as const,
        data: v,
      })),
      ...data.interventions.map((i) => ({
        timestamp: i.timestamp,
        type: 'intervention' as const,
        data: i,
      })),
    ];

    allEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    setEvents(allEvents);
  };

  useEffect(() => {
    loadData();
  }, [episodeId]);

  // Group events by day
  const eventsByDay = events.reduce((acc, event) => {
    const dayKey = format(startOfDay(event.timestamp), 'yyyy-MM-dd');
    if (!acc[dayKey]) acc[dayKey] = [];
    acc[dayKey].push(event);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  const days = Object.keys(eventsByDay).sort((a, b) => b.localeCompare(a));

  const renderEvent = (event: TimelineEvent) => {
    const time = format(event.timestamp, 'h:mm a');

    if (event.type === 'symptom') {
      const symptom = event.data as SymptomEntry;
      return (
        <div className="flex items-start gap-3">
          <div className="mt-1 p-2 bg-yellow-100 rounded-full">
            <Activity className="w-5 h-5 text-yellow-700" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900">{symptom.symptom}</span>
              <span
                className={`text-xs px-2 py-1 rounded-full font-medium ${
                  symptom.severity === 'mild'
                    ? 'severity-mild'
                    : symptom.severity === 'moderate'
                    ? 'severity-moderate'
                    : 'severity-severe'
                }`}
              >
                {symptom.severity}
              </span>
            </div>
            <p className="text-sm text-gray-600">{time}</p>
            {symptom.notes && (
              <p className="text-sm mt-1 p-2 bg-gray-50 rounded">{symptom.notes}</p>
            )}
            {symptom.resolvedAt && (
              <p className="text-sm text-green-600 mt-1">
                ✓ Resolved at {format(symptom.resolvedAt, 'h:mm a')}
              </p>
            )}
          </div>
        </div>
      );
    }

    if (event.type === 'vital') {
      const vital = event.data as VitalSign;
      return (
        <div className="flex items-start gap-3">
          <div className="mt-1 p-2 bg-blue-100 rounded-full">
            <Thermometer className="w-5 h-5 text-blue-700" />
          </div>
          <div className="flex-1">
            <span className="font-medium text-gray-900 capitalize">{vital.type}</span>
            <p className="text-sm text-gray-600">{time}</p>
            <div className="text-sm mt-1">
              {vital.type === 'temperature' && (
                <p className="font-medium">
                  {vital.temperature}°{vital.temperatureUnit} ({vital.temperatureMethod})
                </p>
              )}
              {vital.type === 'breathing' && (
                <>
                  {vital.breathingRate && <p>Rate: {vital.breathingRate}/min</p>}
                  {vital.breathingDifficulty && <p>Difficulty: {vital.breathingDifficulty}</p>}
                </>
              )}
              {vital.type === 'hydration' && (
                <>
                  {vital.wetDiapers !== undefined && <p>Wet diapers: {vital.wetDiapers}</p>}
                  {vital.fluidIntake && <p>Fluids: {vital.fluidIntake}</p>}
                </>
              )}
              {vital.type === 'food' && <p>Intake: {vital.foodIntake}</p>}
              {vital.type === 'sleep' && (
                <>
                  {vital.sleepDuration && <p>Duration: {vital.sleepDuration}h</p>}
                  {vital.sleepQuality && <p>Quality: {vital.sleepQuality}</p>}
                </>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (event.type === 'intervention') {
      const intervention = event.data as Intervention;
      return (
        <div className="flex items-start gap-3">
          <div className="mt-1 p-2 bg-purple-100 rounded-full">
            {intervention.type === 'medication' ? (
              <Pill className="w-5 h-5 text-purple-700" />
            ) : (
              <Stethoscope className="w-5 h-5 text-purple-700" />
            )}
          </div>
          <div className="flex-1">
            <span className="font-medium text-gray-900">
              {intervention.type === 'medication'
                ? intervention.medicationName
                : intervention.treatmentName}
            </span>
            <p className="text-sm text-gray-600">{time}</p>
            {intervention.dose && <p className="text-sm text-gray-700">Dose: {intervention.dose}</p>}
            {intervention.effectiveness && (
              <p
                className={`text-sm mt-1 font-medium ${
                  intervention.effectiveness === 'helped'
                    ? 'text-green-600'
                    : intervention.effectiveness === 'no_change'
                    ? 'text-gray-600'
                    : 'text-red-600'
                }`}
              >
                {intervention.effectiveness === 'helped'
                  ? '✓ Helped'
                  : intervention.effectiveness === 'no_change'
                  ? '− No change'
                  : '✗ Made worse'}
              </p>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-8 h-8 text-primary-600" />
          <h2 className="text-3xl font-bold text-gray-900">Event Timeline</h2>
        </div>

        {events.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No events recorded yet.</p>
        ) : (
          <div className="space-y-6">
            {days.map((dayKey) => {
              const dayEvents = eventsByDay[dayKey];
              const date = new Date(dayKey);
              const isToday = isSameDay(date, new Date());

              return (
                <div key={dayKey} className="relative">
                  {/* Day Header */}
                  <div className="sticky top-24 z-5 bg-gray-50 pb-3">
                    <h3 className="text-lg font-bold text-gray-900 inline-block bg-primary-100 px-4 py-2 rounded-full">
                      {isToday ? '📍 Today' : format(date, 'EEEE, MMMM d, yyyy')}
                    </h3>
                    <div className="text-sm text-gray-600 ml-4 mt-1">
                      {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Events for the day */}
                  <div className="ml-4 border-l-4 border-gray-300 pl-6 space-y-6 py-4">
                    {dayEvents.map((event, idx) => (
                      <div key={`${event.type}-${idx}`} className="relative">
                        <div className="absolute -left-[34px] w-4 h-4 bg-primary-500 rounded-full border-4 border-gray-50"></div>
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                          {renderEvent(event)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card bg-yellow-50 border-yellow-200">
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {events.filter((e) => e.type === 'symptom').length}
              </p>
              <p className="text-sm text-gray-600">Symptom Entries</p>
            </div>
          </div>
        </div>
        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <Thermometer className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {events.filter((e) => e.type === 'vital').length}
              </p>
              <p className="text-sm text-gray-600">Vital Signs</p>
            </div>
          </div>
        </div>
        <div className="card bg-purple-50 border-purple-200">
          <div className="flex items-center gap-3">
            <Pill className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {events.filter((e) => e.type === 'intervention').length}
              </p>
              <p className="text-sm text-gray-600">Interventions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
