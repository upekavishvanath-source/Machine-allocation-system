// ============================================
// PART 2: View Components
// Import as AppPart2.jsx  
// Export: SetupView, ManagerView, MapEditorView
// ============================================

import React from 'react';
import { Users, Trash2, Plus, X, Sun, Moon, UserCheck, Wrench, Code, Edit, XCircle, Grid3x3, Move } from 'lucide-react';

// SETUP VIEW COMPONENT
export function SetupView(props) {
  const { shiftData, activeShift, machines, zones, machineStatuses, newMemberEPF, setNewMemberEPF,
    selectedMachine, setSelectedMachine, showMemberModal, setShowMemberModal, showStatusMenu,
    setShowStatusMenu, activeStatusFilter, setActiveStatusFilter, toggleDayNight, updateTotalAttendance,
    updateWorkerCount, addTeamMember, removeTeamMember, assignMemberToMachine, setMachineStatus,
    clearMap, getMemberEPF, getZoneForMachine, getShiftColor, getShiftLabel, getRemainingWorkers,
    drawZoneConnections, STATUS_COLORS, getCurrentShiftData, setSaveStatus, hasUnsavedChanges } = props;

  const currentData = getCurrentShiftData();

  return (
    <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px' }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Total Attendance */}
        <div style={{ background: '#e0f2fe', borderRadius: '8px', padding: '12px', border: '2px solid #0ea5e9' }}>
          <h3 style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserCheck size={16} /> Total Attendance
          </h3>
          <input type="number" min="0" value={shiftData[activeShift].totalAttendance} onChange={(e) => updateTotalAttendance(activeShift, e.target.value)} placeholder="Enter total" style={{ width: '100%', padding: '8px', border: '2px solid #0ea5e9', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', textAlign: 'center' }} />
          <div style={{ marginTop: '8px', padding: '6px', background: 'white', borderRadius: '4px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>Assigned:</span>
              <span style={{ fontWeight: 'bold', color: '#059669' }}>{currentData.teamMembers.length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>Other Workers:</span>
              <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{currentData.otherWorkersCount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>Web Transport:</span>
              <span style={{ fontWeight: 'bold', color: '#7c3aed' }}>{currentData.webTransportCount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>Re-Work:</span>
              <span style={{ fontWeight: 'bold', color: '#ea580c' }}>{currentData.reWorkCount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>Warp Beam:</span>
              <span style={{ fontWeight: 'bold', color: '#0891b2' }}>{currentData.warpBeamCount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px solid #e5e7eb' }}>
              <span style={{ fontWeight: 'bold' }}>Remaining:</span>
              <span style={{ fontWeight: 'bold', color: getRemainingWorkers(activeShift) >= 0 ? '#059669' : '#dc2626' }}>
                {getRemainingWorkers(activeShift)}
              </span>
            </div>
          </div>
        </div>

        {/* Worker Count Sections */}
        <div style={{ background: '#fef3c7', borderRadius: '8px', padding: '12px', border: '2px solid #fbbf24' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#92400e' }}>Other Workers</h3>
          <input type="number" min="0" value={currentData.otherWorkersCount} onChange={(e) => updateWorkerCount(activeShift, 'otherWorkersCount', e.target.value)} placeholder="Count" style={{ width: '100%', padding: '6px', border: '1px solid #fbbf24', borderRadius: '4px', fontSize: '14px', textAlign: 'center' }} />
        </div>

        <div style={{ background: '#f3e8ff', borderRadius: '8px', padding: '12px', border: '2px solid #a855f7' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#6b21a8' }}>Web Transport</h3>
          <input type="number" min="0" value={currentData.webTransportCount} onChange={(e) => updateWorkerCount(activeShift, 'webTransportCount', e.target.value)} placeholder="Count" style={{ width: '100%', padding: '6px', border: '1px solid #a855f7', borderRadius: '4px', fontSize: '14px', textAlign: 'center' }} />
        </div>

        <div style={{ background: '#ffedd5', borderRadius: '8px', padding: '12px', border: '2px solid #f97316' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#9a3412' }}>Re-Work</h3>
          <input type="number" min="0" value={currentData.reWorkCount} onChange={(e) => updateWorkerCount(activeShift, 'reWorkCount', e.target.value)} placeholder="Count" style={{ width: '100%', padding: '6px', border: '1px solid #f97316', borderRadius: '4px', fontSize: '14px', textAlign: 'center' }} />
        </div>

        <div style={{ background: '#cffafe', borderRadius: '8px', padding: '12px', border: '2px solid #06b6d4' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#164e63' }}>Warp Beam Changing</h3>
          <input type="number" min="0" value={currentData.warpBeamCount} onChange={(e) => updateWorkerCount(activeShift, 'warpBeamCount', e.target.value)} placeholder="Count" style={{ width: '100%', padding: '6px', border: '1px solid #06b6d4', borderRadius: '4px', fontSize: '14px', textAlign: 'center' }} />
        </div>

        {/* Machine Status */}
        <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '12px', border: '2px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>Machine Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { id: 'setup', label: 'Setup', icon: Wrench, color: '#3b82f6' },
              { id: 'development', label: 'Development', icon: Code, color: '#eab308' },
              { id: 'alteration', label: 'Alteration', icon: Edit, color: '#ef4444' },
              { id: 'Runing', label: 'Runing', icon: Edit, color: '#76e61c' },
              { id: 'no-order', label: 'No Order', icon: XCircle, color: '#92400e' }
            ].map(status => (
              <button key={status.id} onClick={() => { setActiveStatusFilter(status.id); setShowStatusMenu(true); }} style={{ padding: '8px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: status.color, color: 'white', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                <status.icon size={12} />
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Assigned EPFs */}
        <div style={{ background: getShiftColor(activeShift), borderRadius: '8px', padding: '12px', border: '2px solid #d1d5db' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
              <Users size={14} /> Assigned EPFs
            </h2>
            <button onClick={() => toggleDayNight(activeShift)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '3px 6px', borderRadius: '4px', border: 'none', cursor: 'pointer', background: shiftData[activeShift].dayNight === 'day' ? '#fbbf24' : '#4338ca', color: 'white', fontSize: '10px', fontWeight: '600' }}>
              {shiftData[activeShift].dayNight === 'day' ? <Sun size={10} /> : <Moon size={10} />}
              {shiftData[activeShift].dayNight === 'day' ? 'Day' : 'Night'}
            </button>
          </div>
          <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
            <input type="text" value={newMemberEPF} onChange={(e) => setNewMemberEPF(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && addTeamMember()} placeholder="Enter EPF" style={{ flex: 1, padding: '5px 6px', border: '1px solid #d1d5db', borderRadius: '4px', fontSize: '11px' }} />
            <button onClick={addTeamMember} style={{ background: '#2563eb', color: 'white', padding: '5px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
              <Plus size={12} />
            </button>
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {currentData.teamMembers.map(member => (
              <div key={member.id} style={{ background: 'white', padding: '4px 6px', borderRadius: '3px', marginBottom: '3px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '500', fontSize: '11px' }}>{member.epf}</span>
                <button onClick={() => removeTeamMember(member.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Trash2 size={11} />
                </button>
              </div>
            ))}
            {currentData.teamMembers.length === 0 && (
              <p style={{ color: '#9ca3af', textAlign: 'center', padding: '12px 0', fontSize: '10px' }}>No EPFs assigned</p>
            )}
          </div>
        </div>
      </div>

      {/* Machine Map */}
      <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
            <Grid3x3 size={20} /> Machine Map
          </h2>
          <button onClick={clearMap} style={{ background: '#dc2626', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px' }}>Clear Map</button>
        </div>
        
        <div style={{ background: 'white', borderRadius: '8px', padding: '16px', height: '550px', overflow: 'auto' }}>
          <svg width="900" height="1150" style={{ maxWidth: '100%', height: 'auto' }}>
            {drawZoneConnections()}
            {machines.map(machine => {
              const zone = getZoneForMachine(machine.id);
              const assignedMemberIds = currentData.assignments[machine.id] || [];
              const machineStatus = machineStatuses[machine.id];
              const fillColor = machineStatus ? STATUS_COLORS[machineStatus] : (zone ? zone.color : '#e5e7eb');
              
              return (
                <g key={machine.id}>
                  <rect x={machine.x - 45} y={machine.y - 35} width="90" height="70" fill={fillColor} stroke={assignedMemberIds.length > 0 ? '#10b981' : '#9ca3af'} strokeWidth="2" rx="8" style={{ cursor: 'pointer' }} onClick={() => { setSelectedMachine(machine); setShowMemberModal(true); }} />
                  <text x={machine.x} y={machine.y - 15} textAnchor="middle" style={{ fontSize: '11px', fontWeight: 'bold', fill: machineStatus ? 'white' : '#374151', pointerEvents: 'none' }}>{machine.id}</text>
                  <text x={machine.x} y={machine.y} textAnchor="middle" style={{ fontSize: '10px', fill: machineStatus ? 'white' : '#6b7280', pointerEvents: 'none' }}>{assignedMemberIds.length > 0 ? `${assignedMemberIds.length}/5` : '0/5'}</text>
                  {assignedMemberIds.length > 0 && (
                    <text x={machine.x} y={machine.y + 15} textAnchor="middle" style={{ fontSize: '9px', fill: machineStatus ? 'white' : '#059669', pointerEvents: 'none', fontWeight: '600' }}>{getMemberEPF(assignedMemberIds[0]).substring(0, 8)}</text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Member Assignment Modal */}
      {showMemberModal && selectedMachine && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'white', borderRadius: '8px', padding: '24px', maxWidth: '28rem', width: '90%', margin: '0 16px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Assign to {selectedMachine.id}</h3>
              <button onClick={() => { setShowMemberModal(false); setSelectedMachine(null); }} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <p style={{ fontSize: '13px', color: '#059669', marginBottom: '12px', fontWeight: '600' }}>
              Currently assigned: {(currentData.assignments[selectedMachine.id] || []).length}/5
            </p>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <button onClick={() => { assignMemberToMachine(selectedMachine.id, null); setShowMemberModal(false); setSelectedMachine(null); }} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', border: 'none', cursor: 'pointer', marginBottom: '8px', fontWeight: '600' }}>Clear All Assignments</button>
              {currentData.teamMembers.map(member => {
                const isAssigned = (currentData.assignments[selectedMachine.id] || []).includes(member.id);
                return (
                  <button key={member.id} onClick={() => assignMemberToMachine(selectedMachine.id, member.id)} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: isAssigned ? '#dcfce7' : '#eff6ff', borderRadius: '8px', border: isAssigned ? '2px solid #10b981' : 'none', cursor: 'pointer', marginBottom: '8px', fontWeight: isAssigned ? '600' : 'normal' }}>
                    {member.epf} {isAssigned && '✓'}
                  </button>
                );
              })}
              {currentData.teamMembers.length === 0 && (
                <p style={{ color: '#9ca3af', textAlign: 'center', padding: '16px' }}>No EPF numbers. Add members first!</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status Selection Modal */}
      {showStatusMenu && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'white', borderRadius: '8px', padding: '24px', maxWidth: '600px', width: '90%', margin: '0 16px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Select Machines for {activeStatusFilter && (activeStatusFilter.charAt(0).toUpperCase() + activeStatusFilter.slice(1).replace('-', ' '))}</h3>
              <button onClick={() => { setShowStatusMenu(false); setActiveStatusFilter(null); }} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>Click machines to toggle status.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
              {machines.map(machine => {
                const currentStatus = machineStatuses[machine.id];
                const isSelected = currentStatus === activeStatusFilter;
                return (
                  <button key={machine.id} onClick={() => { if (isSelected) setMachineStatus(machine.id, null); else setMachineStatus(machine.id, activeStatusFilter); }} style={{ padding: '10px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', border: isSelected ? `3px solid ${STATUS_COLORS[activeStatusFilter]}` : '2px solid #e5e7eb', cursor: 'pointer', background: isSelected ? STATUS_COLORS[activeStatusFilter] : 'white', color: isSelected ? 'white' : '#374151' }}>
                    {machine.id}
                  </button>
                );
              })}
            </div>
            <button onClick={() => { setShowStatusMenu(false); setActiveStatusFilter(null); }} style={{ width: '100%', marginTop: '16px', background: '#2563eb', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

// MANAGER VIEW COMPONENT
export function ManagerView(props) {
  const { shiftData, machines, zones, machineStatuses, getShiftLabel, getShiftColor, getMemberEPF, getZoneForMachine, STATUS_COLORS, drawZoneConnections, getRemainingWorkers } = props;

  return (
    <div>
      <h2 style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 'bold', marginBottom: '24px' }}>Complete Allocation Overview</h2>
      
      {['A', 'B', 'C'].map(shift => {
        const totalAssigned = Object.values(shiftData[shift].assignments).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
        const machinesWithAssignments = Object.keys(shiftData[shift].assignments).length;
        const dayNightIcon = shiftData[shift].dayNight === 'day' ? '☀️' : '🌙';
        const dayNightText = shiftData[shift].dayNight === 'day' ? 'DAY' : 'NIGHT';
        
        return (
          <div key={shift} style={{ marginBottom: '32px', padding: '20px', background: getShiftColor(shift), borderRadius: '12px', border: '2px solid #d1d5db' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                {shift === 'A' ? '☀️' : shift === 'B' ? '🌤️' : '🌙'} {getShiftLabel(shift)}
              </h3>
              <div style={{ padding: '6px 12px', borderRadius: '6px', background: shiftData[shift].dayNight === 'day' ? '#fbbf24' : '#4338ca', color: 'white', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {dayNightIcon} {dayNightText}
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'white', borderRadius: '8px', padding: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px' }}>Total Attendance</p>
                <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e40af' }}>{shiftData[shift].totalAttendance}</p>
              </div>
              <div style={{ background: 'white', borderRadius: '8px', padding: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px' }}>Assigned EPFs</p>
                <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#059669' }}>{shiftData[shift].teamMembers.length}</p>
              </div>
              <div style={{ background: 'white', borderRadius: '8px', padding: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px' }}>Other Workers</p>
                <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#f59e0b' }}>{shiftData[shift].otherWorkersCount}</p>
              </div>
              <div style={{ background: 'white', borderRadius: '8px', padding: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px' }}>Web Transport</p>
                <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#7c3aed' }}>{shiftData[shift].webTransportCount}</p>
              </div>
              <div style={{ background: 'white', borderRadius: '8px', padding: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px' }}>Re-Work</p>
                <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#ea580c' }}>{shiftData[shift].reWorkCount}</p>
              </div>
              <div style={{ background: 'white', borderRadius: '8px', padding: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px' }}>Warp Beam</p>
                <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#0891b2' }}>{shiftData[shift].warpBeamCount}</p>
              </div>
              <div style={{ background: 'white', borderRadius: '8px', padding: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px' }}>Remaining</p>
                <p style={{ fontSize: '22px', fontWeight: 'bold', color: getRemainingWorkers(shift) >= 0 ? '#059669' : '#dc2626' }}>{getRemainingWorkers(shift)}</p>
              </div>
              <div style={{ background: 'white', borderRadius: '8px', padding: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px' }}>Machines Assigned</p>
                <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#7c3aed' }}>{machinesWithAssignments}</p>
              </div>
              <div style={{ background: 'white', borderRadius: '8px', padding: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px' }}>Total Assignments</p>
                <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#2563eb' }}>{totalAssigned}</p>
              </div>
            </div>
            
            {machinesWithAssignments > 0 && (
              <div style={{ background: 'white', borderRadius: '8px', padding: '16px', maxHeight: '250px', overflowY: 'auto' }}>
                <p style={{ fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Machine Assignments:</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                  {Object.entries(shiftData[shift].assignments).map(([machineId, memberIds]) => {
                    if (!Array.isArray(memberIds) || memberIds.length === 0) return null;
                    return (
                      <div key={machineId} style={{ fontSize: '12px', padding: '8px', background: '#f9fafb', borderRadius: '4px', border: '1px solid #e5e7eb' }}>
                        <div style={{ fontWeight: '600', color: '#2563eb', marginBottom: '4px' }}>{machineId}</div>
                        {memberIds.map((memberId, idx) => {
                          const member = shiftData[shift].teamMembers.find(m => m.id === memberId);
                          return (
                            <div key={idx} style={{ color: '#374151', fontSize: '11px' }}>
                              {idx + 1}. {member ? member.epf : 'Unknown'}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
      
      {zones.length > 0 && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: '600', marginBottom: '12px' }}>Zone Configuration</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {zones.map(zone => (
              <div key={zone.id} style={{ background: 'white', border: `3px solid ${zone.color}`, borderRadius: '8px', padding: '16px' }}>
                <h4 style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>{zone.name}</h4>
                <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '8px' }}>{zone.machines.length} machines</p>
                <div style={{ fontSize: '11px', color: '#374151' }}>{zone.machines.join(', ')}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '24px' }}>
        <h3 style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: '600', marginBottom: '16px' }}>Complete Machine Layout</h3>
        <div style={{ background: 'white', borderRadius: '8px', padding: '16px', height: '550px', overflow: 'auto' }}>
          <svg width="900" height="1150" style={{ maxWidth: '100%', height: 'auto' }}>
            {drawZoneConnections()}
            {machines.map(machine => {
              const zone = getZoneForMachine(machine.id);
              const machineStatus = machineStatuses[machine.id];
              const fillColor = machineStatus ? STATUS_COLORS[machineStatus] : (zone ? zone.color : '#e5e7eb');
              
              return (
                <g key={machine.id}>
                  <rect x={machine.x - 45} y={machine.y - 35} width="90" height="70" fill={fillColor} stroke="#9ca3af" strokeWidth="2" rx="8" />
                  <text x={machine.x} y={machine.y - 10} textAnchor="middle" style={{ fontSize: '12px', fontWeight: 'bold', fill: machineStatus ? 'white' : '#1f2937' }}>{machine.id}</text>
                  {machineStatus && (
                    <text x={machine.x} y={machine.y + 10} textAnchor="middle" style={{ fontSize: '10px', fontWeight: '600', fill: 'white' }}>{machineStatus.toUpperCase().replace('-', ' ')}</text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>
    </div>
  );
}

// MAP EDITOR VIEW COMPONENT
export function MapEditorView(props) {
  const { machines, setMachines, zones, setZones, editMode, setEditMode, newMachineName, setNewMachineName,
    newZoneName, setNewZoneName, newZoneColor, setNewZoneColor, handleMachineDrag, addNewMachine,
    deleteMachine, addNewZone, deleteZone, assignMachineToZone, getZoneForMachine, drawZoneConnections,
    setHasUnsavedChanges, setSaveStatus } = props;

  const [selectedMachineForZone, setSelectedMachineForZone] = React.useState(null);

  return (
    <div>
      <div style={{ background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: '#92400e', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={24} /> Visual Map Editor
        </h2>
        <p style={{ color: '#78350f', marginBottom: '12px' }}>
          Configure your factory layout. Drag machines to reposition them on the map.
        </p>
        <button onClick={() => { setEditMode(!editMode); setSaveStatus(editMode ? '' : '🔧 Edit mode enabled'); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: editMode ? '#dc2626' : '#059669', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
          <Move size={16} />
          {editMode ? 'Exit Edit Mode' : 'Enable Edit Mode'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginBottom: '24px' }}>
        <div style={{ background: 'white', borderRadius: '8px', padding: '20px', border: '2px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Add New Machine</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input type="text" value={newMachineName} onChange={(e) => setNewMachineName(e.target.value)} placeholder="Machine name (e.g., MJ-20)" style={{ flex: 1, padding: '10px', border: '2px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
            <button onClick={addNewMachine} style={{ background: '#2563eb', color: 'white', padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Add</button>
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: '8px', padding: '20px', border: '2px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Add New Zone</h3>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <input type="text" value={newZoneName} onChange={(e) => setNewZoneName(e.target.value)} placeholder="Zone name (e.g., Zone H)" style={{ flex: 1, padding: '10px', border: '2px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }} />
            <input type="color" value={newZoneColor} onChange={(e) => setNewZoneColor(e.target.value)} style={{ width: '60px', height: '42px', border: '2px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }} />
          </div>
          <button onClick={addNewZone} style={{ width: '100%', background: '#7c3aed', color: 'white', padding: '10px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Add Zone</button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '8px', padding: '20px', marginBottom: '24px', border: '2px solid #e5e7eb' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>All Machines ({machines.length})</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
          {machines.map(machine => {
            const zone = getZoneForMachine(machine.id);
            return (
              <div key={machine.id} style={{ padding: '10px', background: zone ? zone.color : '#f3f4f6', borderRadius: '6px', border: '2px solid #d1d5db', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '600' }}>{machine.id}</span>
                <button onClick={() => deleteMachine(machine.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>×</button>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: '8px', padding: '20px', border: '2px solid #e5e7eb' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>All Zones ({zones.length})</h3>
        {zones.map(zone => (
          <div key={zone.id} style={{ background: zone.color, padding: '16px', borderRadius: '8px', marginBottom: '12px', border: '2px solid #d1d5db' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 style={{ fontWeight: 'bold', fontSize: '16px', margin: 0 }}>{zone.name}</h4>
              <button onClick={() => deleteZone(zone.id)} style={{ color: '#ef4444', background: 'white', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Delete</button>
            </div>
            <p style={{ fontSize: '13px', marginBottom: '8px' }}>{zone.machines.length} machines</p>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {zone.machines.map(m => (
                <span key={m} style={{ fontSize: '11px', padding: '4px 8px', background: 'white', borderRadius: '4px', fontWeight: '600' }}>{m}</span>
              ))}
            </div>
            <div style={{ marginTop: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '4px' }}>Assign machine to this zone:</label>
              <select onChange={(e) => { if (e.target.value) { assignMachineToZone(e.target.value, zone.id); e.target.value = ''; } }} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '2px solid #d1d5db' }}>
                <option value="">Select machine...</option>
                {machines.filter(m => !zone.machines.includes(m.id)).map(m => (
                  <option key={m.id} value={m.id}>{m.id}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>

      {editMode && (
        <div style={{ background: '#fef2f2', border: '2px solid #ef4444', borderRadius: '8px', padding: '16px', marginTop: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px', color: '#991b1b' }}>⚠️ Edit Mode Active</h3>
          <p style={{ color: '#7f1d1d', marginBottom: '12px' }}>
            Click and drag machines on the map below to reposition them. Changes will be saved when you click "SAVE ALL".
          </p>
          <div style={{ background: 'white', borderRadius: '8px', padding: '16px', height: '550px', overflow: 'auto' }}>
            <svg width="900" height="1150" style={{ maxWidth: '100%', height: 'auto' }}>
              {drawZoneConnections()}
              {machines.map(machine => {
                const zone = getZoneForMachine(machine.id);
                return (
                  <g key={machine.id} style={{ cursor: editMode ? 'move' : 'default' }} onMouseDown={(e) => {
                    if (!editMode) return;
                    const svg = e.currentTarget.closest('svg');
                    const handleMove = (moveE) => {
                      const rect = svg.getBoundingClientRect();
                      const x = Math.round(moveE.clientX - rect.left);
                      const y = Math.round(moveE.clientY - rect.top);
                      handleMachineDrag(machine, x, y);
                    };
                    const handleUp = () => {
                      document.removeEventListener('mousemove', handleMove);
                      document.removeEventListener('mouseup', handleUp);
                    };
                    document.addEventListener('mousemove', handleMove);
                    document.addEventListener('mouseup', handleUp);
                  }}>
                    <rect x={machine.x - 45} y={machine.y - 35} width="90" height="70" fill={zone ? zone.color : '#e5e7eb'} stroke={editMode ? '#ef4444' : '#9ca3af'} strokeWidth={editMode ? '3' : '2'} rx="8" />
                    <text x={machine.x} y={machine.y} textAnchor="middle" style={{ fontSize: '12px', fontWeight: 'bold', fill: '#1f2937', pointerEvents: 'none' }}>{machine.id}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}