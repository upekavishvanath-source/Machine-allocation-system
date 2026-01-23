import React, { useState } from 'react';
import { Users, Monitor, Grid3x3, Eye, Trash2, Plus, X } from 'lucide-react';

function App() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [machines, setMachines] = useState([]);
  const [zones, setZones] = useState([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [selectedMachinesForZone, setSelectedMachinesForZone] = useState([]);
  const [activeTab, setActiveTab] = useState('setup');

  React.useEffect(() => {
    const defaultMachines = [];
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        defaultMachines.push({
          id: `M-${row * 5 + col + 1}`,
          x: col * 120 + 50,
          y: row * 100 + 50,
          assignedTo: null,
          zone: null
        });
      }
    }
    setMachines(defaultMachines);
  }, []);

  const addTeamMember = () => {
    if (newMemberName.trim()) {
      setTeamMembers([...teamMembers, { id: Date.now(), name: newMemberName.trim() }]);
      setNewMemberName('');
    }
  };

  const removeTeamMember = (id) => {
    setTeamMembers(teamMembers.filter(m => m.id !== id));
    setMachines(machines.map(m => m.assignedTo === id ? { ...m, assignedTo: null } : m));
  };

  const assignMemberToMachine = (machineId, memberId) => {
    setMachines(machines.map(m => 
      m.id === machineId ? { ...m, assignedTo: memberId } : m
    ));
    setShowMemberModal(false);
    setSelectedMachine(null);
  };

  const createZone = () => {
    if (newZoneName.trim() && selectedMachinesForZone.length > 0) {
      const zoneColor = `hsl(${Math.random() * 360}, 70%, 85%)`;
      const newZone = {
        id: Date.now(),
        name: newZoneName.trim(),
        color: zoneColor,
        machines: selectedMachinesForZone
      };
      setZones([...zones, newZone]);
      setMachines(machines.map(m => 
        selectedMachinesForZone.includes(m.id) ? { ...m, zone: newZone.id } : m
      ));
      setNewZoneName('');
      setSelectedMachinesForZone([]);
      setShowZoneModal(false);
    }
  };

  const toggleMachineForZone = (machineId) => {
    if (selectedMachinesForZone.includes(machineId)) {
      setSelectedMachinesForZone(selectedMachinesForZone.filter(id => id !== machineId));
    } else {
      setSelectedMachinesForZone([...selectedMachinesForZone, machineId]);
    }
  };

  const clearAllAllocations = () => {
    if (window.confirm('Are you sure you want to clear all allocations?')) {
      setMachines(machines.map(m => ({ ...m, assignedTo: null, zone: null })));
      setZones([]);
    }
  };

  const getMemberName = (memberId) => {
    const member = teamMembers.find(m => m.id === memberId);
    return member ? member.name : '';
  };

  const getZone = (zoneId) => {
    return zones.find(z => z.id === zoneId);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)', padding: '24px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          
          <div style={{ background: 'linear-gradient(to right, #2563eb, #4f46e5)', color: 'white', padding: '24px' }}>
            <h1 style={{ fontSize: '30px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
              <Monitor size={32} />
              Machine Allocation Manager
            </h1>
            <p style={{ marginTop: '8px', color: '#dbeafe' }}>Manage team members, machines, and zones efficiently</p>
          </div>

          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
            <button
              onClick={() => setActiveTab('setup')}
              style={{
                padding: '12px 24px',
                fontWeight: '500',
                background: activeTab === 'setup' ? 'white' : 'transparent',
                color: activeTab === 'setup' ? '#2563eb' : '#4b5563',
                border: 'none',
                borderBottom: activeTab === 'setup' ? '2px solid #2563eb' : 'none',
                cursor: 'pointer'
              }}
            >
              <Users size={16} style={{ display: 'inline', marginRight: '8px' }} />
              Setup & Allocation
            </button>
            <button
              onClick={() => setActiveTab('view')}
              style={{
                padding: '12px 24px',
                fontWeight: '500',
                background: activeTab === 'view' ? 'white' : 'transparent',
                color: activeTab === 'view' ? '#2563eb' : '#4b5563',
                border: 'none',
                borderBottom: activeTab === 'view' ? '2px solid #2563eb' : 'none',
                cursor: 'pointer'
              }}
            >
              <Eye size={16} style={{ display: 'inline', marginRight: '8px' }} />
              Manager View
            </button>
          </div>

          <div style={{ padding: '24px' }}>
            {activeTab === 'setup' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
                
                <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '16px' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={20} />
                    Team Members
                  </h2>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                    <input
                      type="text"
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTeamMember()}
                      placeholder="Enter name"
                      style={{ flex: 1, padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: '8px' }}
                    />
                    <button
                      onClick={addTeamMember}
                      style={{ background: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                    {teamMembers.map(member => (
                      <div key={member.id} style={{ background: 'white', padding: '12px', borderRadius: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <span style={{ fontWeight: '500' }}>{member.name}</span>
                        <button
                          onClick={() => removeTeamMember(member.id)}
                          style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {teamMembers.length === 0 && (
                      <p style={{ color: '#9ca3af', textAlign: 'center', padding: '32px 0' }}>No team members added yet</p>
                    )}
                  </div>
                </div>

                <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                      <Grid3x3 size={20} />
                      Machine Map
                    </h2>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => setShowZoneModal(true)}
                        style={{ background: '#16a34a', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                      >
                        Create Zone
                      </button>
                      <button
                        onClick={clearAllAllocations}
                        style={{ background: '#dc2626', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                  <div style={{ background: 'white', borderRadius: '8px', padding: '16px', height: '500px', overflow: 'auto' }}>
                    <svg width="650" height="450">
                      {machines.map(machine => {
                        const zone = getZone(machine.zone);
                        return (
                          <g key={machine.id}>
                            <rect
                              x={machine.x - 45}
                              y={machine.y - 35}
                              width="90"
                              height="70"
                              fill={zone ? zone.color : '#e5e7eb'}
                              stroke={machine.assignedTo ? '#3b82f6' : '#9ca3af'}
                              strokeWidth="2"
                              rx="8"
                              style={{ cursor: 'pointer' }}
                              onClick={() => {
                                setSelectedMachine(machine);
                                setShowMemberModal(true);
                              }}
                            />
                            <text
                              x={machine.x}
                              y={machine.y - 10}
                              textAnchor="middle"
                              style={{ fontSize: '12px', fontWeight: 'bold', fill: '#374151' }}
                            >
                              {machine.id}
                            </text>
                            <text
                              x={machine.x}
                              y={machine.y + 10}
                              textAnchor="middle"
                              style={{ fontSize: '12px', fill: '#6b7280' }}
                            >
                              {machine.assignedTo ? getMemberName(machine.assignedTo).substring(0, 10) : 'Unassigned'}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Allocation Overview</h2>
                
                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>Zones</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {zones.map(zone => (
                      <div key={zone.id} style={{ background: 'white', border: `2px solid ${zone.color}`, borderRadius: '8px', padding: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                        <h4 style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '8px' }}>{zone.name}</h4>
                        <p style={{ color: '#6b7280', fontSize: '14px' }}>{zone.machines.length} machines</p>
                      </div>
                    ))}
                    {zones.length === 0 && (
                      <p style={{ color: '#9ca3af', gridColumn: 'span 3', textAlign: 'center', padding: '16px' }}>No zones created yet</p>
                    )}
                  </div>
                </div>

                <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '24px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Allocation Map</h3>
                  <div style={{ background: 'white', borderRadius: '8px', padding: '16px', height: '500px', overflow: 'auto' }}>
                    <svg width="650" height="450">
                      {machines.map(machine => {
                        const zone = getZone(machine.zone);
                        return (
                          <g key={machine.id}>
                            <rect
                              x={machine.x - 45}
                              y={machine.y - 35}
                              width="90"
                              height="70"
                              fill={zone ? zone.color : '#e5e7eb'}
                              stroke={machine.assignedTo ? '#10b981' : '#9ca3af'}
                              strokeWidth="3"
                              rx="8"
                            />
                            <text
                              x={machine.x}
                              y={machine.y - 10}
                              textAnchor="middle"
                              style={{ fontSize: '12px', fontWeight: 'bold', fill: '#1f2937' }}
                            >
                              {machine.id}
                            </text>
                            <text
                              x={machine.x}
                              y={machine.y + 10}
                              textAnchor="middle"
                              style={{ fontSize: '12px', fontWeight: '600', fill: '#1e40af' }}
                            >
                              {machine.assignedTo ? getMemberName(machine.assignedTo).substring(0, 10) : '---'}
                            </text>
                            {zone && (
                              <text
                                x={machine.x}
                                y={machine.y + 25}
                                textAnchor="middle"
                                style={{ fontSize: '12px', fill: '#6b7280' }}
                              >
                                {zone.name}
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>

                <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                  <div style={{ background: '#dbeafe', borderRadius: '8px', padding: '16px' }}>
                    <p style={{ color: '#1e40af', fontWeight: '600' }}>Total Machines</p>
                    <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#1e3a8a' }}>{machines.length}</p>
                  </div>
                  <div style={{ background: '#d1fae5', borderRadius: '8px', padding: '16px' }}>
                    <p style={{ color: '#065f46', fontWeight: '600' }}>Assigned</p>
                    <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#064e3b' }}>
                      {machines.filter(m => m.assignedTo).length}
                    </p>
                  </div>
                  <div style={{ background: '#fed7aa', borderRadius: '8px', padding: '16px' }}>
                    <p style={{ color: '#9a3412', fontWeight: '600' }}>Unassigned</p>
                    <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#7c2d12' }}>
                      {machines.filter(m => !m.assignedTo).length}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showMemberModal && selectedMachine && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'white', borderRadius: '8px', padding: '24px', maxWidth: '28rem', width: '100%', margin: '0 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Assign to {selectedMachine.id}</h3>
              <button onClick={() => setShowMemberModal(false)} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <button
                onClick={() => assignMemberToMachine(selectedMachine.id, null)}
                style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: '#f3f4f6', borderRadius: '8px', border: 'none', cursor: 'pointer', marginBottom: '8px' }}
              >
                Unassign
              </button>
              {teamMembers.map(member => (
                <button
                  key={member.id}
                  onClick={() => assignMemberToMachine(selectedMachine.id, member.id)}
                  style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: '#eff6ff', borderRadius: '8px', border: 'none', cursor: 'pointer', marginBottom: '8px' }}
                >
                  {member.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showZoneModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'white', borderRadius: '8px', padding: '24px', maxWidth: '42rem', width: '100%', margin: '0 16px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Create Zone</h3>
              <button onClick={() => {
                setShowZoneModal(false);
                setSelectedMachinesForZone([]);
                setNewZoneName('');
              }} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <input
              type="text"
              value={newZoneName}
              onChange={(e) => setNewZoneName(e.target.value)}
              placeholder="Zone name"
              style={{ width: '100%', padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '16px' }}
            />
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>Select machines for this zone:</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginBottom: '16px' }}>
              {machines.map(machine => (
                <button
                  key={machine.id}
                  onClick={() => toggleMachineForZone(machine.id)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '500',
                    border: 'none',
                    cursor: 'pointer',
                    background: selectedMachinesForZone.includes(machine.id) ? '#2563eb' : '#f3f4f6',
                    color: selectedMachinesForZone.includes(machine.id) ? 'white' : '#374151'
                  }}
                >
                  {machine.id}
                </button>
              ))}
            </div>
            <button
              onClick={createZone}
              disabled={!newZoneName.trim() || selectedMachinesForZone.length === 0}
              style={{
                width: '100%',
                background: (!newZoneName.trim() || selectedMachinesForZone.length === 0) ? '#d1d5db' : '#16a34a',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                cursor: (!newZoneName.trim() || selectedMachinesForZone.length === 0) ? 'not-allowed' : 'pointer'
              }}
            >
              Create Zone
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;