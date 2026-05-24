'use client';

import PageShell from '@/components/crm/PageShell';
import SectionCard from '@/components/crm/SectionCard';
import ActionButton from '@/components/crm/ActionButton';
import { attendanceTimeline } from '@/data/crmData';
import {
  LogIn,
  LogOut,
  Phone,
  Coffee,
  Activity,
  DoorOpen,
  Clock,
  BarChart3
} from 'lucide-react';
import { useState } from 'react';

const iconMap = {
  LogIn,
  LogOut,
  Phone,
  Coffee,
  Activity,
  DoorOpen
};

export default function AttendancePage() {
  const [checkInTime, setCheckInTime] = useState('09:14 AM');
  const [isCheckedIn, setIsCheckedIn] = useState(true);

  const totalWorkTime = '7h 56m';

  return (
    <PageShell title="Attendance" subtitle="Manage your work time and breaks">
      {/* Current Status Card */}
      <SectionCard
        title="Current Status"
        subtitle="Today's attendance"
        className="mb-6 bg-gradient-to-br from-cyan-600/20 to-blue-600/10 border-cyan-500/40"
      >
        <div className="space-y-6">
          {/* Status Display */}
          <div className="flex items-center justify-between p-6 bg-slate-800/40 rounded-xl border border-cyan-500/20">
            <div>
              <p className="text-sm text-slate-400 mb-2">Status</p>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
                <p className="text-2xl font-bold text-green-300">Active</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400 mb-1">Checked In</p>
              <p className="text-xl font-semibold text-cyan-300">{checkInTime}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <ActionButton
              variant={isCheckedIn ? 'secondary' : 'primary'}
              onClick={() => setIsCheckedIn(true)}
            >
              <LogIn size={18} />
              Check In
            </ActionButton>
            <ActionButton
              variant={!isCheckedIn ? 'secondary' : 'primary'}
              onClick={() => setIsCheckedIn(false)}
            >
              <LogOut size={18} />
              Check Out
            </ActionButton>
          </div>
        </div>
      </SectionCard>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <SectionCard title="Quick Actions">
          <div className="space-y-3">
            <ActionButton variant="secondary" className="w-full">
              <Coffee size={18} />
              Start Break
            </ActionButton>
            <ActionButton variant="secondary" className="w-full">
              <DoorOpen size={18} />
              Washroom Break
            </ActionButton>
          </div>
        </SectionCard>

        {/* Work Time Summary */}
        <SectionCard title="Today's Work Time">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-cyan-500/10">
              <div className="flex items-center gap-3">
                <Clock className="text-cyan-400" size={24} />
                <div>
                  <p className="text-sm text-slate-400">Total Work Time</p>
                  <p className="text-2xl font-bold text-cyan-300">{totalWorkTime}</p>
                </div>
              </div>
            </div>
            <div className="w-full bg-slate-800/30 rounded-full h-2 border border-cyan-500/10">
              <div
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                style={{ width: '66%' }}
              ></div>
            </div>
            <p className="text-xs text-slate-500">Target: 12 hours • Achieved: 66%</p>
          </div>
        </SectionCard>
      </div>

      {/* Timeline */}
      <SectionCard title="Today's Timeline" subtitle="Your activity log">
        <div className="space-y-4">
          {attendanceTimeline.map((item, idx) => {
            const IconComponent = iconMap[item.icon];
            const isLast = idx === attendanceTimeline.length - 1;

            return (
              <div key={item.id} className="flex gap-4">
                {/* Timeline Line */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-500/50 flex items-center justify-center">
                    {IconComponent && <IconComponent size={20} className="text-cyan-300" />}
                  </div>
                  {!isLast && (
                    <div className="w-0.5 h-12 bg-gradient-to-b from-cyan-500/50 to-transparent mt-2"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pt-1.5 pb-4">
                  <p className="text-sm font-semibold text-slate-300">{item.event}</p>
                  <p className="text-xs text-slate-500 mt-1">{item.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </PageShell>
  );
}
