import React, { useState, useEffect } from 'react';
import { Users, Monitor, Grid3x3, Eye, Trash2, Plus, X, Clock, RefreshCw, Wrench, Code, Edit, XCircle } from 'lucide-react';
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
  const [newMemberEPF, setNewMemberEPF] = useState('');
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [activeTab, setActiveTab] = useState('setup');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [machineStatuses, setMachineStatuses] = useState({});
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [activeStatusFilter, setActiveStatusFilter] = useState(null);

  const FIXED_ZONES = [
    { id: 1, name: 'Zone A', machines: ['MJ-06', 'MJ-14', 'MJ-09', 'MJ-16'], color: '#fef3c7' },
    { id: 2, name: 'Zone B', machines: ['MS-03', 'JL-07', 'JL-08', 'TL-01'], color: '#dbeafe' },
    { id: 3, name: 'Zone C', machines: ['MJ-15', 'MJ-05', 'MJ-04'], color: '#e0e7ff' },
    { id: 4, name: 'Zone D', machines: ['MJ-02', 'MJ-07', 'MJ-13', 'MJ-03'], color: '#fce7f3' },
    { id: 5, name: 'Zone E', machines: ['MJ-08', 'MJ-01', 'JT-16'], color: '#d1fae5' },
    { id: 6, name: 'Zone F', machines: ['TX-10', 'JL-04', 'JL-02', 'JL-05'], color: '#fee2e2' },
    { id: 7, name: 'Zone G', machines: ['JL-06', 'JC-03', 'JC-01', 'JC-02'], color: '#fef08a' }
  ];

  const STATUS_COLORS = {
    'no-order': '#92400e',
    'development': '#eab308',
    'setup': '#3b82f6',
    'alteration': '#ef4444'
  };

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
    setZones(FIXED_ZONES);
    loadAllData();
    initializeFixedZones();
  }, []);

  const initializeFixedZones = async () => {
    try {
      for (const zone of FIXED_ZONES) {
        const { data: existingZone } = await supabase
          .from('zones')
          .select('id')
          .eq('id', zone.id)
          .single();

        if (!existingZone) {
          await supabase
            .from('zones')
            .insert([{ id: zone.id, zone_name: zone.name }]);
        }

        for (const machineName of zone.machines) {
          let { data: machineData, error: machineError } = await supabase
            .from('machines')
            .select('id')
            .eq('machine_name', machineName)
            .single();

          if (machineError && machineError.code === 'PGRST116') {
            await supabase
              .from('machines')
              .insert([{ machine_name: machineName, zone_id: zone.id }]);
          } else if (machineData) {
            await supabase
              .from('machines')
              .update({ zone_id: zone.id })
              .eq('id', machineData.id);
          }
        }
      }
      
      console.log('Fixed zones initialized successfully');
    } catch (error) {
      console.error('Error initializing fixed zones:', error);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    try {
      await loadWorkers();
      await loadAllocations();
      await loadMachineStatuses();
      setSaveStatus('✅ Data loaded successfully');
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Error loading data:', error);
      setSaveStatus('❌ Error loading data');
    } finally {
      setLoading(false);
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
          epf: worker.worker_name
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
          if (!newShiftData[shift].assignments[machineData.machine_name]) {
            newShiftData[shift].assignments[machineData.machine_name] = [];
          }
          newShiftData[shift].assignments[machineData.machine_name].push(allocation.worker_id);
        }
      }

      setShiftData(prev => ({
        A: { ...prev.A, assignments: newShiftData.A.assignments },
        B: { ...prev.B, assignments: newShiftData.B.assignments },
        C: { ...prev.C, assignments: newShiftData.C.assignments }
      }));
    }
  };

  const loadMachineStatuses = async () => {
    const { data, error } = await supabase
      .from('machine_statuses')
      .select('*');
    
    if (error) {
      console.error('Error loading machine statuses:', error);
      return;
    }

    if (data) {
      const statuses = {};
      data.forEach(status => {
        statuses[status.machine_name] = status.status;
      });
      setMachineStatuses(statuses);
    }
  };

  const getCurrentShiftData = () => shiftData[activeShift];

  const addTeamMember = async () => {
    if (newMemberEPF.trim()) {
      try {
        // Always insert new worker - database saves permanently
        const { data, error } = await supabase
          .from('workers')
          .insert([
            { worker_name: newMemberEPF.trim(), shift: activeShift }
          ])
          .select();

        if (error) throw error;

        if (data && data[0]) {
          // Update UI to show the new member
          setShiftData(prev => ({
            ...prev,
            [activeShift]: {
              ...prev[activeShift],
              teamMembers: [...prev[activeShift].teamMembers, { id: data[0].id, epf: data[0].worker_name }]
            }
          }));
          setNewMemberEPF('');
          setSaveStatus('✅ Team member added & saved to database');
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
      // Only remove from UI - database keeps the history
      // No database delete operation here
      
      // Update UI to remove from display
      setShiftData(prev => ({
        ...prev,
        [activeShift]: {
          ...prev[activeShift],
          teamMembers: prev[activeShift].teamMembers.filter(m => m.id !== id)
        }
      }));

      // Remove from assignments in UI
      const newAssignments = { ...shiftData[activeShift].assignments };
      Object.keys(newAssignments).forEach(machineId => {
        if (Array.isArray(newAssignments[machineId])) {
          newAssignments[machineId] = newAssignments[machineId].filter(memberId => memberId !== id);
          if (newAssignments[machineId].length === 0) {
            delete newAssignments[machineId];
          }
        }
      });
      
      setShiftData(prev => ({
        ...prev,
        [activeShift]: {
          ...prev[activeShift],
          assignments: newAssignments
        }
      }));

      setSaveStatus('✅ Removed from UI (kept in database history)');
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
        // Clear all assignments - save to database permanently
        await supabase
          .from('allocations')
          .delete()
          .eq('machine_id', machineData.id)
          .eq('shift', activeShift);
      } else {
        const currentAssignments = shiftData[activeShift].assignments[machineName] || [];
        
        if (currentAssignments.includes(memberId)) {
          // Remove assignment - save to database permanently
          await supabase
            .from('allocations')
            .delete()
            .eq('machine_id', machineData.id)
            .eq('worker_id', memberId)
            .eq('shift', activeShift);
        } else if (currentAssignments.length < 5) {
          // Add assignment - save to database permanently
          await supabase
            .from('allocations')
            .insert([{
              machine_id: machineData.id,
              worker_id: memberId,
              shift: activeShift
            }]);
        } else {
          setSaveStatus('⚠️ Maximum 5 members per machine');
          setTimeout(() => setSaveStatus(''), 2000);
          return;
        }
      }

      // Reload allocations to update UI
      await loadAllocations();

      setSaveStatus('✅ Assignment saved to database');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Error assigning member:', error);
      setSaveStatus('❌ Error saving assignment');
    }
  };

  const setMachineStatus = async (machineName, status) => {
    try {
      const { data: existingStatus } = await supabase
        .from('machine_statuses')
        .select('id')
        .eq('machine_name', machineName)
        .single();

      if (existingStatus) {
        if (status === null) {
          // Delete from database permanently
          await supabase
            .from('machine_statuses')
            .delete()
            .eq('machine_name', machineName);
        } else {
          // Update status in database permanently
          await supabase
            .from('machine_statuses')
            .update({ status })
            .eq('machine_name', machineName);
        }
      } else if (status !== null) {
        // Insert new status into database permanently
        await supabase
          .from('machine_statuses')
          .insert([{ machine_name: machineName, status }]);
      }

      // Update UI
      setMachineStatuses(prev => {
        const newStatuses = { ...prev };
        if (status === null) {
          delete newStatuses[machineName];
        } else {
          newStatuses[machineName] = status;
        }
        return newStatuses;
      });

      setSaveStatus('✅ Machine status saved to database');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      console.error('Error setting machine status:', error);
      setSaveStatus('❌ Error updating status');
    }
  };

  const clearMap = async () => {
    if (window.confirm('Clear all allocations and statuses from the UI? (Database history will be preserved)')) {
      try {
        // Only clear UI - do NOT delete from database
        // Database keeps all the history
        
        // Clear UI assignments for current shift
        setShiftData(prev => ({
          ...prev,
          [activeShift]: {
            ...prev[activeShift],
            assignments: {}
          }
        }));
        
        // Clear UI machine statuses
        setMachineStatuses({});
        
        setSaveStatus('✅ UI cleared (database history preserved)');
        setTimeout(() => setSaveStatus(''), 2000);
      } catch (error) {
        console.error('Error clearing map:', error);
        setSaveStatus('❌ Error clearing map');
      }
    }
  };

  const getMemberEPF = (memberId) => {
    const member = getCurrentShiftData().teamMembers.find(m => m.id === memberId);
    return member ? member.epf : '';
  };

  const getZoneForMachine = (machineId) => {
    return zones.find(z => z.machines.includes(machineId));
  };

  const getShiftColor = (shift) => {
    const colors = { A: '#fef3c7', B: '#dbeafe', C: '#e0e7ff' };
    return colors[shift] || '#f3f4f6';
  };

  const getShiftLabel = (shift) => {
    const labels = { A: 'Shift A', B: 'Shift B', C: 'Shift C' };
    return labels[shift];
  };

  const drawZoneConnections = () => {
    const connections = [];
    
    const manualConnections = [
      { from: 'MJ-06', to: 'MJ-14', color: '#1138e2', width: 3 },
      { from: 'MJ-14', to: 'MJ-09', color: '#3b82f6', width: 3 },
      { from: 'MJ-09', to: 'MJ-16', color: '#3b82f6', width: 3 },
      { from: 'MS-03', to: 'JL-07', color: '#3b82f6', width: 3 },
      { from: 'JL-07', to: 'JL-08', color: '#3b82f6', width: 3 },
      { from: 'JL-08', to: 'TL-01', color: '#3b82f6', width: 3 },
      { from: 'MJ-15', to: 'MJ-05', color: '#3b82f6', width: 3 },
      { from: 'MJ-05', to: 'MJ-04', color: '#3b82f6', width: 3 },
      { from: 'MJ-02', to: 'MJ-07', color: '#0762f3', width: 3 },
      { from: 'MJ-07', to: 'MJ-13', color: '#3b82f6', width: 3 },
      { from: 'MJ-13', to: 'MJ-03', color: '#3b82f6', width: 3 },
      { from: 'MJ-08', to: 'MJ-01', color: '#3b82f6', width: 3 },
      { from: 'MJ-01', to: 'JT-16', color: '#3b82f6', width: 3 },
      { from: 'TX-10', to: 'JL-02', color: '#3b82f6', width: 3 },
      { from: 'JL-02', to: 'JL-04', color: '#3b82f6', width: 3 },
      { from: 'JL-04', to: 'JL-05', color: '#3b82f6', width: 3 },
      { from: 'JL-06', to: 'JC-03', color: '#3b82f6', width: 3 },
      { from: 'JC-03', to: 'JC-01', color: '#3b82f6', width: 3 },
      { from: 'JC-01', to: 'JC-02', color: '#3b82f6', width: 3 },
    ];
    
    manualConnections.forEach((conn, index) => {
      const fromMachine = machines.find(m => m.id === conn.from);
      const toMachine = machines.find(m => m.id === conn.to);
      
      if (fromMachine && toMachine) {
        connections.push(
          <line
            key={`connection-${index}`}
            x1={fromMachine.x}
            y1={fromMachine.y}
            x2={toMachine.x}
            y2={toMachine.y}
            stroke={conn.color}
            strokeWidth={conn.width}
            opacity="0.4"
          />
        );
      }
    });
    
    const zoneLabelPositions = {
      1: { x: 280, y: 1000 },
      2: { x: 280, y: 400 },
      3: { x: 650, y: 100 },
      4: { x: 800, y: 280 },
      5: { x: 800, y: 450 },
      6: { x: 800, y: 590 },
      7: { x: 800, y: 850 }
    };
    
    zones.forEach(zone => {
      if (zoneLabelPositions[zone.id]) {
        connections.push(
          <text
            key={`label-${zone.id}`}
            x={zoneLabelPositions[zone.id].x}
            y={zoneLabelPositions[zone.id].y}
            textAnchor="middle"
            style={{ 
              fontSize: '16px', 
              fontWeight: 'bold', 
              fill: '#1f2937', 
              pointerEvents: 'none',
              textShadow: '0 0 3px white, 0 0 3px white'
            }}
          >
            {zone.name}
          </text>
        );
      }
    });
    
    return connections;
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
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)', padding: '12px' }}>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        * {
          box-sizing: border-box;
        }
        @media (max-width: 768px) {
          .grid-responsive {
            grid-template-columns: 1fr !important;
          }
          .shift-buttons {
            flex-wrap: wrap;
          }
        }
      `}</style>
      <div style={{ maxWidth: '100%', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          
          <div style={{ background: 'linear-gradient(to right, #2563eb, #4f46e5)', color: 'white', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h1 style={{ fontSize: 'clamp(20px, 4vw, 30px)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                  <Monitor size={32} />
                  Machine Allocation Manager
                </h1>
                <p style={{ marginTop: '8px', color: '#dbeafe', fontSize: 'clamp(11px, 2vw, 14px)' }}>Supabase Connected | 43 Machines | 3 Shifts | 7 Fixed Zones</p>
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

          <div style={{ padding: '12px 16px', background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
            <div className="shift-buttons" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <Clock size={20} style={{ color: '#6b7280' }} />
              <span style={{ fontWeight: '600', color: '#374151', marginRight: '12px', fontSize: 'clamp(12px, 2vw, 16px)' }}>Select Shift:</span>
              {['A', 'B', 'C'].map(shift => (
                <button
                  key={shift}
                  onClick={() => setActiveShift(shift)}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer',
                    background: activeShift === shift ? (shift === 'A' ? '#fbbf24' : shift === 'B' ? '#3b82f6' : '#6366f1') : (shift === 'A' ? '#fef3c7' : shift === 'B' ? '#dbeafe' : '#e0e7ff'),
                    color: activeShift === shift ? 'white' : (shift === 'A' ? '#92400e' : shift === 'B' ? '#1e40af' : '#4338ca'),
                    boxShadow: activeShift === shift ? '0 4px 6px rgba(0,0,0,0.1)' : 'none',
                    transform: activeShift === shift ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.2s',
                    fontSize: 'clamp(12px, 2vw, 16px)'
                  }}
                >
                  {shift === 'A' ? '☀️' : shift === 'B' ? '🌤️' : '🌙'} Shift {shift}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', flexWrap: 'wrap' }}>
            {[
              { id: 'setup', label: 'Setup & Allocation', icon: Users },
              { id: 'view', label: 'Manager View', icon: Eye }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '12px 24px',
                  fontWeight: '500',
                  background: activeTab === tab.id ? 'white' : 'transparent',
                  color: activeTab === tab.id ? '#2563eb' : '#4b5563',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid #2563eb' : 'none',
                  cursor: 'pointer',
                  fontSize: 'clamp(12px, 2vw, 16px)'
                }}
              >
                <tab.icon size={16} style={{ display: 'inline', marginRight: '8px' }} />
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ padding: 'clamp(12px, 3vw, 24px)' }}>
            {activeTab === 'setup' ? (
              <div className="grid-responsive" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '24px' }}>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '16px', border: '2px solid #e5e7eb' }}>
                    <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px', color: '#374151' }}>
                      Machine Status
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        { id: 'setup', label: 'Setup', icon: Wrench, color: '#3b82f6' },
                        { id: 'development', label: 'Development', icon: Code, color: '#eab308' },
                        { id: 'alteration', label: 'Alteration', icon: Edit, color: '#ef4444' },
                        { id: 'no-order', label: 'No Order', icon: XCircle, color: '#92400e' }
                      ].map(status => (
                        <button
                          key={status.id}
                          onClick={() => {
                            setActiveStatusFilter(status.id);
                            setShowStatusMenu(true);
                          }}
                          style={{
                            padding: '10px 12px',
                            borderRadius: '6px',
                            border: 'none',
                            cursor: 'pointer',
                            background: status.color,
                            color: 'white',
                            fontSize: '13px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            justifyContent: 'center'
                          }}
                        >
                          <status.icon size={14} />
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: getShiftColor(activeShift), borderRadius: '8px', padding: '16px', border: '2px solid #d1d5db', flex: 1 }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={18} />
                      EPF Numbers
                    </h2>
                    <p style={{ fontSize: '11px', color: '#6b7280', marginBottom: '12px' }}>
                      {getShiftLabel(activeShift)}
                    </p>
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
                      <input
                        type="text"
                        value={newMemberEPF}
                        onChange={(e) => setNewMemberEPF(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTeamMember()}
                        placeholder="Enter EPF"
                        style={{ flex: 1, padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' }}
                      />
                      <button
                        onClick={addTeamMember}
                        style={{ background: '#2563eb', color: 'white', padding: '6px 12px', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                      {getCurrentShiftData().teamMembers.map(member => (
                        <div key={member.id} style={{ background: 'white', padding: '8px', borderRadius: '6px', marginBottom: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                          <span style={{ fontWeight: '500', fontSize: '13px' }}>{member.epf}</span>
                          <button
                            onClick={() => removeTeamMember(member.id)}
                            style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {getCurrentShiftData().teamMembers.length === 0 && (
                        <p style={{ color: '#9ca3af', textAlign: 'center', padding: '24px 0', fontSize: '12px' }}>No EPF numbers added</p>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <h2 style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                      <Grid3x3 size={20} />
                      Machine Map
                    </h2>
                    <button
                      onClick={clearMap}
                      style={{ background: '#dc2626', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px' }}
                    >
                      Clear Map
                    </button>
                  </div>
                  
                  <div style={{ background: 'white', borderRadius: '8px', padding: '12px', marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px' }}>
                    {[
                      { color: '#3b82f6', label: 'Setup' },
                      { color: '#eab308', label: 'Development' },
                      { color: '#ef4444', label: 'Alteration' },
                      { color: '#92400e', label: 'No Order' }
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '16px', height: '16px', background: item.color, borderRadius: '3px' }}></div>
                        <span>{item.label}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '16px', height: '3px', background: '#3b82f6' }}></div>
                      <span>Zone Connection</span>
                    </div>
                  </div>
                  
                  <div style={{ background: 'white', borderRadius: '8px', padding: '16px', height: '550px', overflow: 'auto' }}>
                    <svg width="900" height="1150" style={{ maxWidth: '100%', height: 'auto' }}>
                      {drawZoneConnections()}
                      
                      {machines.map(machine => {
                        const zone = getZoneForMachine(machine.id);
                        const assignedMemberIds = getCurrentShiftData().assignments[machine.id] || [];
                        const machineStatus = machineStatuses[machine.id];
                        const fillColor = machineStatus ? STATUS_COLORS[machineStatus] : (zone ? zone.color : '#e5e7eb');
                        
                        return (
                          <g key={machine.id}>
                            <rect
                              x={machine.x - 45}
                              y={machine.y - 35}
                              width="90"
                              height="70"
                              fill={fillColor}
                              stroke={assignedMemberIds.length > 0 ? '#10b981' : '#9ca3af'}
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
                              y={machine.y - 15}
                              textAnchor="middle"
                              style={{ fontSize: '11px', fontWeight: 'bold', fill: machineStatus ? 'white' : '#374151', pointerEvents: 'none' }}
                            >
                              {machine.id}
                            </text>
                            <text
                              x={machine.x}
                              y={machine.y + 0}
                              textAnchor="middle"
                              style={{ fontSize: '10px', fill: machineStatus ? 'white' : '#6b7280', pointerEvents: 'none' }}
                            >
                              {assignedMemberIds.length > 0 ? `${assignedMemberIds.length}/5` : '0/5'}
                            </text>
                            {assignedMemberIds.length > 0 && (
                              <text
                                x={machine.x}
                                y={machine.y + 15}
                                textAnchor="middle"
                                style={{ fontSize: '9px', fill: machineStatus ? 'white' : '#059669', pointerEvents: 'none', fontWeight: '600' }}
                              >
                                {getMemberEPF(assignedMemberIds[0]).substring(0, 8)}
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              </div>
            ) : (
              <ManagerView 
                shiftData={shiftData}
                machines={machines}
                zones={zones}
                machineStatuses={machineStatuses}
                getShiftLabel={getShiftLabel}
                getShiftColor={getShiftColor}
                getMemberEPF={getMemberEPF}
                getZoneForMachine={getZoneForMachine}
                STATUS_COLORS={STATUS_COLORS}
                drawZoneConnections={drawZoneConnections}
              />
            )}
          </div>
        </div>
      </div>

      {showMemberModal && selectedMachine && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'white', borderRadius: '8px', padding: '24px', maxWidth: '28rem', width: '90%', margin: '0 16px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>Assign to {selectedMachine.id}</h3>
              <button onClick={() => {
                setShowMemberModal(false);
                setSelectedMachine(null);
              }} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
              {getShiftLabel(activeShift)}
            </p>
            <p style={{ fontSize: '13px', color: '#059669', marginBottom: '12px', fontWeight: '600' }}>
              Currently assigned: {(getCurrentShiftData().assignments[selectedMachine.id] || []).length}/5
            </p>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <button
                onClick={() => {
                  assignMemberToMachine(selectedMachine.id, null);
                  setShowMemberModal(false);
                  setSelectedMachine(null);
                }}
                style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', border: 'none', cursor: 'pointer', marginBottom: '8px', fontWeight: '600' }}
              >
                Clear All Assignments
              </button>
              {getCurrentShiftData().teamMembers.map(member => {
                const isAssigned = (getCurrentShiftData().assignments[selectedMachine.id] || []).includes(member.id);
                return (
                  <button
                    key={member.id}
                    onClick={() => assignMemberToMachine(selectedMachine.id, member.id)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '12px 16px',
                      background: isAssigned ? '#dcfce7' : '#eff6ff',
                      borderRadius: '8px',
                      border: isAssigned ? '2px solid #10b981' : 'none',
                      cursor: 'pointer',
                      marginBottom: '8px',
                      fontWeight: isAssigned ? '600' : 'normal'
                    }}
                  >
                    {member.epf} {isAssigned && '✓'}
                  </button>
                );
              })}
              {getCurrentShiftData().teamMembers.length === 0 && (
                <p style={{ color: '#9ca3af', textAlign: 'center', padding: '16px' }}>No EPF numbers in this shift. Add members first!</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showStatusMenu && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div style={{ background: 'white', borderRadius: '8px', padding: '24px', maxWidth: '600px', width: '90%', margin: '0 16px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                Select Machines for {activeStatusFilter && (activeStatusFilter.charAt(0).toUpperCase() + activeStatusFilter.slice(1).replace('-', ' '))}
              </h3>
              <button onClick={() => {
                setShowStatusMenu(false);
                setActiveStatusFilter(null);
              }} style={{ color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
              Click on machines to toggle their status. Click again to remove status.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
              {machines.map(machine => {
                const currentStatus = machineStatuses[machine.id];
                const isSelected = currentStatus === activeStatusFilter;
                return (
                  <button
                    key={machine.id}
                    onClick={() => {
                      if (isSelected) {
                        setMachineStatus(machine.id, null);
                      } else {
                        setMachineStatus(machine.id, activeStatusFilter);
                      }
                    }}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      border: isSelected ? `3px solid ${STATUS_COLORS[activeStatusFilter]}` : '2px solid #e5e7eb',
                      cursor: 'pointer',
                      background: isSelected ? STATUS_COLORS[activeStatusFilter] : 'white',
                      color: isSelected ? 'white' : '#374151'
                    }}
                  >
                    {machine.id}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => {
                setShowStatusMenu(false);
                setActiveStatusFilter(null);
              }}
              style={{
                width: '100%',
                marginTop: '16px',
                background: '#2563eb',
                color: 'white',
                padding: '12px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ManagerView({ 
  shiftData, 
  machines, 
  zones, 
  machineStatuses, 
  getShiftLabel, 
  getShiftColor, 
  getMemberEPF,
  getZoneForMachine,
  STATUS_COLORS,
  drawZoneConnections
}) {
  return (
    <div>
      <h2 style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 'bold', marginBottom: '24px' }}>Allocation Overview - All Shifts</h2>
      
      {['A', 'B', 'C'].map(shift => {
        const totalAssigned = Object.values(shiftData[shift].assignments).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
        const machinesWithAssignments = Object.keys(shiftData[shift].assignments).length;
        
        return (
          <div key={shift} style={{ marginBottom: '32px', padding: '20px', background: getShiftColor(shift), borderRadius: '12px', border: '2px solid #d1d5db' }}>
            <h3 style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>
              {shift === 'A' ? '☀️' : shift === 'B' ? '🌤️' : '🌙'} {getShiftLabel(shift)}
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '16px' }}>
              <div style={{ background: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>EPF Count</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e40af' }}>{shiftData[shift].teamMembers.length}</p>
              </div>
              <div style={{ background: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>Total Machines</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#1e3a8a' }}>{machines.length}</p>
              </div>
              <div style={{ background: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>Machines Assigned</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#059669' }}>
                  {machinesWithAssignments}
                </p>
              </div>
              <div style={{ background: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>Total Assignments</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#7c3aed' }}>
                  {totalAssigned}
                </p>
              </div>
              <div style={{ background: 'white', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>Unassigned</p>
                <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#dc2626' }}>
                  {machines.length - machinesWithAssignments}
                </p>
              </div>
            </div>
            
            {machinesWithAssignments > 0 && (
              <div style={{ background: 'white', borderRadius: '8px', padding: '16px', maxHeight: '250px', overflowY: 'auto' }}>
                <p style={{ fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Assignments:</p>
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
          <h3 style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: '600', marginBottom: '12px' }}>Fixed Zones</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {zones.map(zone => (
              <div key={zone.id} style={{ background: 'white', border: `3px solid ${zone.color}`, borderRadius: '8px', padding: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                <h4 style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px' }}>{zone.name}</h4>
                <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '8px' }}>{zone.machines.length} machines</p>
                <div style={{ fontSize: '11px', color: '#374151' }}>
                  {zone.machines.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ background: '#f9fafb', borderRadius: '8px', padding: 'clamp(12px, 3vw, 24px)' }}>
        <h3 style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: '600', marginBottom: '16px' }}>Complete Allocation Map</h3>
        <div style={{ background: 'white', borderRadius: '8px', padding: '16px', height: '550px', overflow: 'auto' }}>
          <svg width="900" height="1150" style={{ maxWidth: '100%', height: 'auto' }}>
            {drawZoneConnections()}
            
            {machines.map(machine => {
              const zone = getZoneForMachine(machine.id);
              const machineStatus = machineStatuses[machine.id];
              const fillColor = machineStatus ? STATUS_COLORS[machineStatus] : (zone ? zone.color : '#e5e7eb');
              
              return (
                <g key={machine.id}>
                  <rect
                    x={machine.x - 45}
                    y={machine.y - 35}
                    width="90"
                    height="70"
                    fill={fillColor}
                    stroke="#9ca3af"
                    strokeWidth="2"
                    rx="8"
                  />
                  <text
                    x={machine.x}
                    y={machine.y - 10}
                    textAnchor="middle"
                    style={{ fontSize: '12px', fontWeight: 'bold', fill: machineStatus ? 'white' : '#1f2937' }}
                  >
                    {machine.id}
                  </text>
                  {machineStatus && (
                    <text
                      x={machine.x}
                      y={machine.y + 10}
                      textAnchor="middle"
                      style={{ fontSize: '10px', fontWeight: '600', fill: 'white' }}
                    >
                      {machineStatus.toUpperCase().replace('-', ' ')}
                    </text>
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

export default App;