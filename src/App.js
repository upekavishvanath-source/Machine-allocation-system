import React, { useState, useEffect } from 'react';
import { Users, Monitor, Grid3x3, Eye, Trash2, Plus, X, Clock, RefreshCw } from 'lucide-react';
import { supabase } from './supabaseClient';

function App() {
  const [activeShift, setActiveShift] = useState('A');
  const [shiftData, setShiftData] = useState({
    A: { teamMembers: [], assignments: {} },
    B: { teamMembers: [], assignments: {} },
    C: { teamMembers: [], assignments: {} }
  });
  const [machines, setMachines] = useState([]);
  const [zones, setZones] = useState([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');
  const [selectedMachinesForZone, setSelectedMachinesForZone] = useState([]);
  const [activeTab, setActiveTab] = useState('setup');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');

  // Initialize machines on mount
  useEffect(() => {
    const MACHINE_LAYOUT = [
      { id: 'JQ-1', x: 80, y: 60 },
      { id: 'MS-02', x: 80, y: 160 },
      { id: 'JL-10', x: 80, y: 260 },
      { id: 'JL-09', x: 80, y: 360 },
      { id: 'JT-13', x: 80, y: 460 },
      { id: 'JB-01', x: 80, y: 560 },
      { id: 'JB-03', x: 80, y: 660 },
      { id: 'JB-02', x: 80, y: 760 },
      { id: 'MJ-16', x: 80, y: 860 },
      { id: 'MJ-10', x: 80, y: 960 },
      { id: 'MJ-06', x: 80, y: 1060 },

      { id: 'MJ-11', x: 200, y: 60 },
      { id: 'MS-01', x: 200, y: 160 },
      { id: 'MS-03', x: 200, y: 260 },
      { id: 'JL-07', x: 200, y: 360 },
      { id: 'JL-08', x: 200, y: 460 },
      { id: 'TL-01', x: 200, y: 560 },
      { id: 'JL-01', x: 200, y: 660 },
      { id: 'JL-03', x: 200, y: 760 },
      { id: 'ML-08', x: 200, y: 860 },
      { id: 'MJ-09', x: 200, y: 960 },
      { id: 'MJ-14', x: 200, y: 1060 },
      
      { id: 'MJ-12', x: 320, y: 60 },
      { id: 'TX-02', x: 440, y: 60 },
      { id: 'MJ-15', x: 560, y: 60 },

      { id: 'MJ-05', x: 500, y: 160 },
      { id: 'MJ-04', x: 600, y: 160 },
      { id: 'MJ-13', x: 500, y: 240 },
      { id: 'MJ-03', x: 700, y: 240 },
      { id: 'MJ-07', x: 500, y: 330 },
      { id: 'MJ-02', x: 600, y: 310 },
      { id: 'MJ-08', x: 500, y: 420 },
      { id: 'MJ-01', x: 600, y: 400 },
      { id: 'JT-14', x: 700, y: 340 },
      { id: 'JT-16', x: 700, y: 440 },

      { id: 'JC-02', x: 700, y: 960 },
      { id: 'JC-01', x: 700, y: 880 },
      { id: 'JC-03', x: 700, y: 800 },
      { id: 'JL-06', x: 700, y: 720 },
      { id: 'JL-05', x: 700, y: 640 },
      { id: 'TX-10', x: 700, y: 560 },
      { id: 'JL-04', x: 550, y: 640 },
      { id: 'JL-02', x: 550, y: 560 }
    ];

    setMachines(MACHINE_LAYOUT);
    loadAllData();
  }, []);

  // Load all data from Supabase
  const loadAllData = async () => {
    setLoading(true);
    try {
      await loadZones();
      await loadWorkers();
      await loadAllocations();
      setSaveStatus('✅ Data loaded successfully');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error loading data:', error);
      setSaveStatus('❌ Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const loadZones = async () => {
    const { data, error } = await supabase
      .from('zones')
      .select('*');
    
    if (error) {
      console.error('Error loading zones:', error);
      return;
    }

    if (data) {
      const zonesWithMachines = await Promise.all(data.map(async (zone) => {
        const { data: machinesData } = await supabase
          .from('machines')
          .select('machine_name')
          .eq('zone_id', zone.id);
        
        return {
          id: zone.id,
          name: zone.zone_name,
          color: `hsl(${Math.random() * 360}, 70%, 85%)`,
          machines: machinesData ? machinesData.map(m => m.machine_name) : []
        };
      }));
      
      setZones(zonesWithMachines);
    }
  };

  const loadWorkers = async () => {
    const { data, error } = await supabase
      .from('workers')
      .select('*');
    
    if (error) {
      console.error('Error loading workers:', error);
      return;
    }

    if (data) {
      const newShiftData = {
        A: { teamMembers: [], assignments: {} },
        B: { teamMembers: [], assignments: {} },
        C: { teamMembers: [], assignments: {} }
      };

      data.forEach(worker => {
        const shift = worker.shift || 'A';
        newShiftData[shift].teamMembers.push({
          id: worker.id,
          name: worker.worker_name
        });
      });

      setShiftData(prev => ({
        A: { ...prev.A, teamMembers: newShiftData.A.teamMembers },
        B: { ...prev.B, teamMembers: newShiftData.B.teamMembers },
        C: { ...prev.C, teamMembers: newShiftData.C.teamMembers }
      }));
    }
  };

  const loadAllocations = async () => {
    const { data, error } = await supabase
      .from('allocations')
      .select('*');
    
    if (error) {
      console.error('Error loading allocations:', error);
      return;
    }

    if (data) {
      const newShiftData = {
        A: { assignments: {} },
        B: { assignments: {} },
        C: { assignments: {} }
      };

      for (const allocation of data) {
        const { data: machineData } = await supabase
          .from('machines')
          .select('machine_name')
          .eq('id', allocation.machine_id)
          .single();

        if (machineData) {
          const shift = allocation.shift || 'A';
          newShiftData[shift].assignments[machineData.machine_name] = allocation.worker_id;
        }
      }

      setShiftData(prev => ({
        A: { ...prev.A, assignments: newShiftData.A.assignments },
        B: { ...prev.B, assignments: newShiftData.B.assignments },
        C: { ...prev.C, assignments: newShiftData.C.assignments }
      }));
    }
  };

  const getCurrentShiftData = () => shiftData[activeShift];

  const addTeamMember = async () => {
    if (newMemberName.trim()) {
      try {
        const { data, error } = await supabase
          .from('workers')
          .insert([
            { worker_name: newMemberName.trim(), shift: activeShift }
          ])
          .select();

        if (error) throw error;

        if (data && data[0]) {
          setShiftData(prev => ({
            ...prev,
            [activeShift]: {
              ...prev[activeShift],
              teamMembers: [...prev[activeShift].teamMembers, { id: data[0].id, name: data[0].worker_name }]
            }
          }));
          setNewMemberName('');
          setSaveStatus('✅ Team member added');
          setTimeout(() => setSaveStatus(''), 2000);
        }
      } catch (error) {
        console.error('Error adding team member:', error);
        setSaveStatus('❌ Error adding team member');
      }
    }
  };

  const removeTeamMember = async (id) => {
    try {
      await supabase.from('allocations').delete().eq('worker_id', id);
      const { error } = await supabase.from('workers').delete().eq('id', id);
      if (error) throw error;

      setShiftData(prev => ({
        ...prev,
        [activeShift]: {
          ...prev[activeShift],
          teamMembers: prev[activeShift].teamMembers.filter(m => m.id !== id)
        }
      }));

      const newAssignments = { ...shiftData[activeShift].assignments };
      Object.keys(newAssignments).forEach(machineId => {
        if (newAssignments[machineId] === id) {
          delete newAssignments[machineId];
        }
      });
      
      setShiftData(prev => ({
        ...prev,
        [activeShift]: {
          ...prev[activeShift],
          assignments: newAssignments
        }
      }));

      setSaveStatus('✅ Team member removed');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Error removing team member:', error);
      setSaveStatus('❌ Error removing team member');
    }
  };

  const assignMemberToMachine = async (machineName, memberId) => {
    try {
      let { data: machineData, error: machineError } = await supabase
        .from('machines')
        .select('id')
        .eq('machine_name', machineName)
        .single();

      if (machineError && machineError.code === 'PGRST116') {
        const { data: newMachine, error: insertError } = await supabase
          .from('machines')
          .insert([{ machine_name: machineName }])
          .select()
          .single();

        if (insertError) throw insertError;
        machineData = newMachine;
      }

      if (!machineData) throw new Error('Machine not found');

      if (memberId === null) {
        await supabase
          .from('allocations')
          .delete()
          .eq('machine_id', machineData.id)
          .eq('shift', activeShift);
      } else {
        const { data: existingAllocation } = await supabase
          .from('allocations')
          .select('id')
          .eq('machine_id', machineData.id)
          .eq('shift', activeShift)
          .single();

        if (existingAllocation) {
          await supabase
            .from('allocations')
            .update({ worker_id: memberId })
            .eq('id', existingAllocation.id);
        } else {
          await supabase
            .from('allocations')
            .insert([{
              machine_id: machineData.id,
              worker_id: memberId,
              shift: activeShift
            }]);
        }
      }

      setShiftData(prev => ({
        ...prev,
        [activeShift]: {
          ...prev[activeShift],
          assignments: {
            ...prev[activeShift].assignments,
            [machineName]: memberId
          }
        }
      }));

      setShowMemberModal(false);
      setSelectedMachine(null);
      setSaveStatus('✅ Assignment saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Error assigning member:', error);
      setSaveStatus('❌ Error saving assignment');
    }
  };

  const createZone = async () => {
    if (newZoneName.trim() && selectedMachinesForZone.length > 0) {
      try {
        const { data: zoneData, error: zoneError } = await supabase
          .from('zones')
          .insert([{ zone_name: newZoneName.trim() }])
          .select()
          .single();

        if (zoneError) throw zoneError;

        for (const machineName of selectedMachinesForZone) {
          let { data: machineData, error: machineError } = await supabase
            .from('machines')
            .select('id')
            .eq('machine_name', machineName)
            .single();

          if (machineError && machineError.code === 'PGRST116') {
            const { data: newMachine } = await supabase
              .from('machines')
              .insert([{ machine_name: machineName, zone_id: zoneData.id }])
              .select()
              .single();
            machineData = newMachine;
          } else if (machineData) {
            await supabase
              .from('machines')
              .update({ zone_id: zoneData.id })
              .eq('id', machineData.id);
          }
        }

        const zoneColor = `hsl(${Math.random() * 360}, 70%, 85%)`;
        const newZone = {
          id: zoneData.id,
          name: zoneData.zone_name,
          color: zoneColor,
          machines: selectedMachinesForZone
        };

        setZones([...zones, newZone]);
        setNewZoneName('');
        setSelectedMachinesForZone([]);
        setShowZoneModal(false);
        setSaveStatus('✅ Zone created');
        setTimeout(() => setSaveStatus(''), 2000);
      } catch (error) {
        console.error('Error creating zone:', error);
        setSaveStatus('❌ Error creating zone');
      }
    }
  };

  const toggleMachineForZone = (machineId) => {
    if (selectedMachinesForZone.includes(machineId)) {
      setSelectedMachinesForZone(selectedMachinesForZone.filter(id => id !== machineId));
    } else {
      setSelectedMachinesForZone([...selectedMachinesForZone, machineId]);
    }
  };

  const clearAllAllocations = async () => {
    if (window.confirm(`Clear all allocations for Shift ${activeShift}?`)) {
      try {
        const { error } = await supabase
          .from('allocations')
          .delete()
          .eq('shift', activeShift);

        if (error) throw error;

        setShiftData(prev => ({
          ...prev,
          [activeShift]: {
            ...prev[activeShift],
            assignments: {}
          }
        }));

        setSaveStatus('✅ All allocations cleared');
        setTimeout(() => setSaveStatus(''), 2000);
      } catch (error) {
        console.error('Error clearing allocations:', error);
        setSaveStatus('❌ Error clearing allocations');
      }
    }
  };

  const getMemberName = (memberId) => {
    const member = getCurrentShiftData().teamMembers.find(m => m.id === memberId);
    return member ? member.name : '';
  };

  const getZone = (zoneId) => {
    return zones.find(z => z.id === zoneId);
  };

  const getShiftColor = (shift) => {
    const colors = { A: '#fef3c7', B: '#dbeafe', C: '#e0e7ff' };
    return colors[shift] || '#f3f4f6';
  };

  const getShiftLabel = (shift) => {
    const labels = { A: 'Shift A (6AM-2PM)', B: 'Shift B (2PM-10PM)', C: 'Shift C (10PM-6AM)' };
    return labels[shift];
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={48} style={{ animation: 'spin 1s linear infinite', color: '#2563eb' }} />
          <p style={{ marginTop: '16px', fontSize: '18px', color: '#4b5563' }}>Loading data...</p>
        </div>
      </div>
    );
  }return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)', padding: '24px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          
          <div style={{ background: 'linear-gradient(to right, #2563eb, #4f46e5)', color: 'white', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h1 style={{ fontSize: '30px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                  <Monitor size={32} />
                  Machine Allocation Manager
                </h1>
                <p style={{ marginTop: '8px', color: '#dbeafe' }}>Supabase Connected | 43 Machines | 3 Shifts</p>
              </div>
              <button
                onClick={loadAllData}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: '1px solid rgba(255,255,255,0.3)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                <RefreshCw size={16} />
                Refresh Data
              </button>
            </div>
            {saveStatus && (
              <div style={{ marginTop: '12px', padding: '8px 16px', background: 'rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '14px' }}>
                {saveStatus}
              </div>
            )}
          </div>

          <div style={{ padding: '16px 24px', background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Clock size={20} style={{ color: '#6b7280' }} />
              <span style={{ fontWeight: '600', color: '#374151', marginRight: '12px' }}>Select Shift:</span>
              <button
                onClick={() => setActiveShift('A')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: activeShift === 'A' ? '#fbbf24' : '#fef3c7',
                  color: activeShift === 'A' ? 'white' : '#92400e',
                  boxShadow: activeShift === 'A' ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
                  transform: activeShift === 'A' ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.2s'
                }}
              >
                ☀️ Shift A
              </button>
              <button
                onClick={() => setActiveShift('B')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: activeShift === 'B' ? '#3b82f6' : '#dbeafe',
                  color: activeShift === 'B' ? 'white' : '#1e40af',
                  boxShadow: activeShift === 'B' ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
                  transform: activeShift === 'B' ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.2s'
                }}
              >
                🌤️ Shift B
              </button>
              <button
                onClick={() => setActiveShift('C')}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '600',
                  cursor: 'pointer',
                  background: activeShift === 'C' ? '#6366f1' : '#e0e7ff',
                  color: activeShift === 'C' ? 'white' : '#4338ca',
                  boxShadow: activeShift === 'C' ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
                  transform: activeShift === 'C' ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.2s'
                }}
              >
                🌙 Shift C
              </button>
            </div>
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
                
                <div style={{ background: getShiftColor(activeShift), borderRadius: '8px', padding: '16px', border: '2px solid #d1d5db' }}>
                  <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={20} />
                    Team Members
                  </h2>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
                    {getShiftLabel(activeShift)} - {getCurrentShiftData().teamMembers.length} members
                  </p>
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
                    {getCurrentShiftData().teamMembers.map(member => (
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
                    {getCurrentShiftData().teamMembers.length === 0 && (
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
                        Clear Shift
                      </button>
                    </div>
                  </div>
                  <div style={{ background: 'white', borderRadius: '8px', padding: '16px', height: '500px', overflow: 'auto' }}>
                    <svg width="750" height="1150">
                      {machines.map(machine => {
                        const zone = zones.find(z => z.machines.includes(machine.id));
                        const assignedMemberId = getCurrentShiftData().assignments[machine.id];
                        return (
                          <g key={machine.id}>
                            <rect
                              x={machine.x - 45}
                              y={machine.y - 35}
                              width="90"
                              height="70"
                              fill={zone ? zone.color : (assignedMemberId ? getShiftColor(activeShift) : '#e5e7eb')}
                              stroke={assignedMemberId ? '#3b82f6' : '#9ca3af'}
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
                              style={{ fontSize: '12px', fontWeight: 'bold', fill: '#374151', pointerEvents: 'none' }}
                            >
                              {machine.id}
                            </text>
                            <text
                              x={machine.x}
                              y={machine.y + 10}
                              textAnchor="middle"
                              style={{ fontSize: '12px', fill: '#6b7280', pointerEvents: 'none' }}
                            >
                              {assignedMemberId ? getMemberName(assignedMemberId).substring(0, 10) : 'Unassigned'}
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
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>Allocation Overview - All Shifts</h2>
                
                {['A', 'B', 'C'].map(shift => (
                  <div key={shift} style={{ marginBottom: '32px', padding: '20px', background: getShiftColor(shift), borderRadius: '12px', border: '2px solid #d1d5db' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
                      {shift === 'A' ? '☀️' : shift === 'B' ? '🌤️' : '🌙'} {getShiftLabel(shift)}
                    </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '16px' }}>
                      <div style={{ background: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>Team Members</p>
                        <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e40af' }}>{shiftData[shift].teamMembers.length}</p>
                      </div>
                      <div style={{ background: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>Total Machines</p>
                        <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e3a8a' }}>{machines.length}</p>
                      </div>
                      <div style={{ background: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>Assigned</p>
                        <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#059669' }}>
                          {Object.keys(shiftData[shift].assignments).length}
                        </p>
                      </div>
                      <div style={{ background: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>Unassigned</p>
                        <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#dc2626' }}>
                          {machines.length - Object.keys(shiftData[shift].assignments).length}
                        </p>
                      </div>
                    </div>
                    
                    {Object.keys(shiftData[shift].assignments).length > 0 && (
                      <div style={{ background: 'white', borderRadius: '8px', padding: '16px', maxHeight: '200px', overflowY: 'auto' }}>
                        <p style={{ fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Assignments:</p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                          {Object.entries(shiftData[shift].assignments).map(([machineId, memberId]) => {
                            const member = shiftData[shift].teamMembers.find(m => m.id === memberId);
                            return (
                              <div key={machineId} style={{ fontSize: '13px', padding: '6px', background: '#f9fafb', borderRadius: '4px' }}>
                                <span style={{ fontWeight: '600', color: '#2563eb' }}>{machineId}</span>
                                <span style={{ color: '#6b7280' }}> → </span>
                                <span style={{ color: '#374151' }}>{member ? member.name : 'Unknown'}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                
                {zones.length > 0 && (
                  <div style={{ marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>Zones</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                      {zones.map(zone => (
                        <div key={zone.id} style={{ background: 'white', border: `2px solid ${zone.color}`, borderRadius: '8px', padding: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                          <h4 style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '8px' }}>{zone.name}</h4>
                          <p style={{ color: '#6b7280', fontSize: '14px' }}>{zone.machines.length} machines</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '24px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>Allocation Map</h3>
                  <div style={{ background: 'white', borderRadius: '8px', padding: '16px', height: '500px', overflow: 'auto' }}>
                    <svg width="750" height="1150">
                      {machines.map(machine => {
                        const zone = zones.find(z => z.machines.includes(machine.id));
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
                    <p style={{ color: '#065f46', fontWeight: '600' }}>Total Assigned</p>
                    <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#064e3b' }}>
                      {machines.filter(m => m.assignedTo).length}
                    </p>
                  </div>
                  <div style={{ background: '#fed7aa', borderRadius: '8px', padding: '16px' }}>
                    <p style={{ color: '#9a3412', fontWeight: '600' }}>Total Unassigned</p>
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
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
              {getShiftLabel(activeShift)}
            </p>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <button
                onClick={() => assignMemberToMachine(selectedMachine.id, null)}
                style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: '#f3f4f6', borderRadius: '8px', border: 'none', cursor: 'pointer', marginBottom: '8px' }}
              >
                Unassign
              </button>
              {getCurrentShiftData().teamMembers.map(member => (
                <button
                  key={member.id}
                  onClick={() => assignMemberToMachine(selectedMachine.id, member.id)}
                  style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: '#eff6ff', borderRadius: '8px', border: 'none', cursor: 'pointer', marginBottom: '8px' }}
                >
                  {member.name}
                </button>
              ))}
              {getCurrentShiftData().teamMembers.length === 0 && (
                <p style={{ color: '#9ca3af', textAlign: 'center', padding: '16px' }}>No team members in this shift. Add members first!</p>
              )}
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
