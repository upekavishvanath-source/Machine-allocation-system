import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Users, Monitor, Grid3x3, Eye, Trash2, Plus, X, Clock, RefreshCw, 
  Wrench, Code, Edit, XCircle, Sun, Moon, Save, UserCheck, 
  AlertCircle, Settings, Move, Download, Maximize, Minimize,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Play, Plane
} from 'lucide-react';
import { supabase } from './supabaseClient';

// ============================================
// COMPLETE APP - FIXED ESLINT & SCROLL/FIT
// ============================================

function App() {
  const [activeShift, setActiveShift] = useState('A');
  const [shiftData, setShiftData] = useState({
    A: { teamMembers: [], assignments: {}, dayNight: 'day', totalAttendance: 0, otherWorkersCount: 0, webTransportCount: 0, reWorkCount: 0, warpBeamCount: 0, machineAssignCount: 0, setupAlterationCount: 0, tlCount: 0, greigeBoilCount: 0, yarnPreparationCount: 0, pilotCount: 0 },
    B: { teamMembers: [], assignments: {}, dayNight: 'day', totalAttendance: 0, otherWorkersCount: 0, webTransportCount: 0, reWorkCount: 0, warpBeamCount: 0, machineAssignCount: 0, setupAlterationCount: 0, tlCount: 0, greigeBoilCount: 0, yarnPreparationCount: 0, pilotCount: 0 },
    C: { teamMembers: [], assignments: {}, dayNight: 'night', totalAttendance: 0, otherWorkersCount: 0, webTransportCount: 0, reWorkCount: 0, warpBeamCount: 0, machineAssignCount: 0, setupAlterationCount: 0, tlCount: 0, greigeBoilCount: 0, yarnPreparationCount: 0, pilotCount: 0 }
  });
  const [machines, setMachines] = useState([]);
  const [zones, setZones] = useState([]);
  const [zoneLabelPositions, setZoneLabelPositions] = useState({});
  const [newMemberEPF, setNewMemberEPF] = useState('');
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [activeTab, setActiveTab] = useState('setup');
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState('');
  const [machineStatuses, setMachineStatuses] = useState({});
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [activeStatusFilter, setActiveStatusFilter] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [newMachineName, setNewMachineName] = useState('');
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneColor, setNewZoneColor] = useState('#fef3c7');
  
  // SHARED STATE FOR MAP FITTING
  const [fitMap, setFitMap] = useState(false);

  const DEFAULT_ZONES = [
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
    'alteration': '#ef4444',
    'running': '#10b981',
    'pilot': '#f97316'
  };

  const getDefaultMachineLayout = () => {
    return [
      { id: 'JQ-1', x: 80, y: 60 }, { id: 'MS-02', x: 80, y: 160 }, { id: 'JL-10', x: 80, y: 260 }, { id: 'JL-09', x: 80, y: 360 },
      { id: 'JT-13', x: 80, y: 460 }, { id: 'JB-01', x: 80, y: 560 }, { id: 'JB-03', x: 80, y: 660 }, { id: 'JB-02', x: 80, y: 760 },
      { id: 'MJ-16', x: 80, y: 860 }, { id: 'MJ-10', x: 80, y: 960 }, { id: 'MJ-06', x: 80, y: 1060 }, { id: 'MJ-11', x: 200, y: 60 },
      { id: 'MS-01', x: 200, y: 160 }, { id: 'MS-03', x: 200, y: 260 }, { id: 'JL-07', x: 200, y: 360 }, { id: 'JL-08', x: 200, y: 460 },
      { id: 'TL-01', x: 200, y: 560 }, { id: 'JL-01', x: 200, y: 660 }, { id: 'JL-03', x: 200, y: 760 }, { id: 'ML-08', x: 200, y: 860 },
      { id: 'MJ-09', x: 200, y: 960 }, { id: 'MJ-14', x: 200, y: 1060 }, { id: 'MJ-12', x: 320, y: 60 }, { id: 'TX-02', x: 440, y: 60 },
      { id: 'MJ-15', x: 560, y: 60 }, { id: 'MJ-05', x: 500, y: 160 }, { id: 'MJ-04', x: 600, y: 160 }, { id: 'MJ-13', x: 500, y: 240 },
      { id: 'MJ-03', x: 700, y: 240 }, { id: 'MJ-07', x: 500, y: 330 }, { id: 'MJ-02', x: 600, y: 310 }, { id: 'MJ-08', x: 500, y: 420 },
      { id: 'MJ-01', x: 600, y: 400 }, { id: 'JT-14', x: 700, y: 340 }, { id: 'JT-16', x: 700, y: 440 }, { id: 'JC-02', x: 700, y: 960 },
      { id: 'JC-01', x: 700, y: 880 }, { id: 'JC-03', x: 700, y: 800 }, { id: 'JL-06', x: 700, y: 720 }, { id: 'JL-05', x: 700, y: 640 },
      { id: 'TX-10', x: 700, y: 560 }, { id: 'JL-04', x: 550, y: 640 }, { id: 'JL-02', x: 550, y: 560 }
    ];
  };

  const loadAllData = useCallback(async () => {
    setLoading(true);
    try {
      // Load Machines
      const { data: mData, error: mError } = await supabase.from('machine_positions').select('*');
      if (mError || !mData || mData.length === 0) {
        setMachines(getDefaultMachineLayout());
      } else {
        setMachines(mData.map(m => ({ id: m.machine_name, x: m.x_position, y: m.y_position })));
      }

      // Load Zones
      const { data: zData, error: zError } = await supabase.from('zone_definitions').select('*');
      if (zError || !zData || zData.length === 0) {
        setZones(DEFAULT_ZONES);
      } else {
        setZones(zData.map(z => ({ id: z.id, name: z.zone_name, machines: z.machines || [], color: z.color || '#f3f4f6' })));
      }

      // Load Zone Labels
      const { data: zlData } = await supabase.from('zone_label_positions').select('*');
      if (zlData && zlData.length > 0) {
        const positions = {};
        zlData.forEach(p => { positions[p.zone_id] = { x: p.x_position, y: p.y_position }; });
        setZoneLabelPositions(positions);
      }

      // Load Settings
      const { data: sData } = await supabase.from('shift_settings').select('*');
      if (sData) {
        setShiftData(prev => {
          const newData = { ...prev };
          sData.forEach(s => { if (newData[s.shift_name]) newData[s.shift_name].dayNight = s.day_night || 'day'; });
          return newData;
        });
      }

      // Load Attendance
      const { data: aData } = await supabase.from('attendance').select('*');
      if (aData) {
        setShiftData(prev => {
          const newData = { ...prev };
          aData.forEach(a => { if (newData[a.shift]) newData[a.shift].totalAttendance = a.total_count || 0; });
          return newData;
        });
      }

      // Load Worker Counts
      const { data: wcData } = await supabase.from('worker_counts').select('*');
      if (wcData) {
        setShiftData(prev => {
          const newData = { ...prev };
          wcData.forEach(w => {
            if (newData[w.shift]) {
              newData[w.shift].otherWorkersCount = w.other_workers || 0;
              newData[w.shift].webTransportCount = w.web_transport || 0;
              newData[w.shift].reWorkCount = w.re_work || 0;
              newData[w.shift].warpBeamCount = w.warp_beam || 0;
              newData[w.shift].machineAssignCount = w.machine_assign || 0;
              newData[w.shift].setupAlterationCount = w.setup_alteration || 0;
              newData[w.shift].tlCount = w.tl || 0;
              newData[w.shift].greigeBoilCount = w.greige_boil || 0;
              newData[w.shift].yarnPreparationCount = w.yarn_preparation || 0;
              newData[w.shift].pilotCount = w.pilot || 0;
            }
          });
          return newData;
        });
      }

      // Load Workers
      const { data: wData } = await supabase.from('workers').select('*');
      if (wData) {
        setShiftData(prev => {
          const newData = { ...prev };
          ['A', 'B', 'C'].forEach(s => { newData[s].teamMembers = []; });
          wData.forEach(w => {
            const s = w.shift || 'A';
            if (newData[s]) newData[s].teamMembers.push({ id: w.id, epf: w.worker_name });
          });
          return newData;
        });
      }

      // Load Allocations
      const { data: alData } = await supabase.from('allocations').select('*');
      if (alData) {
        const newAssignments = { A: {}, B: {}, C: {} };
        for (const a of alData) {
          const { data: m } = await supabase.from('machines').select('machine_name').eq('id', a.machine_id).single();
          if (m) {
            const s = a.shift || 'A';
            if (!newAssignments[s][m.machine_name]) newAssignments[s][m.machine_name] = [];
            newAssignments[s][m.machine_name].push(a.worker_id);
          }
        }
        setShiftData(prev => ({
          A: { ...prev.A, assignments: newAssignments.A },
          B: { ...prev.B, assignments: newAssignments.B },
          C: { ...prev.C, assignments: newAssignments.C }
        }));
      }

      // Load Statuses
      const { data: stData } = await supabase.from('machine_statuses').select('*');
      if (stData) {
        const s = {};
        stData.forEach(st => { s[st.machine_name] = st.status; });
        setMachineStatuses(s);
      }

      setSaveStatus('✅ Data loaded');
      setTimeout(() => setSaveStatus(''), 3000);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error loading:', error);
      setSaveStatus('❌ Error loading');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const toggleDayNight = (shift) => {
    setShiftData(prev => ({ ...prev, [shift]: { ...prev[shift], dayNight: prev[shift].dayNight === 'day' ? 'night' : 'day' } }));
    setHasUnsavedChanges(true);
    setSaveStatus('⚠️ Unsaved changes');
  };

  const updateTotalAttendance = (shift, value) => {
    setShiftData(prev => ({ ...prev, [shift]: { ...prev[shift], totalAttendance: parseInt(value) || 0 } }));
    setHasUnsavedChanges(true);
    setSaveStatus('⚠️ Unsaved changes');
  };

  const updateWorkerCount = (shift, field, value) => {
    setShiftData(prev => ({ ...prev, [shift]: { ...prev[shift], [field]: parseInt(value) || 0 } }));
    setHasUnsavedChanges(true);
    setSaveStatus('⚠️ Unsaved changes');
  };

  const getCurrentShiftData = () => shiftData[activeShift];

  const addTeamMember = () => {
    if (newMemberEPF.trim()) {
      const newId = Date.now();
      setShiftData(prev => ({ ...prev, [activeShift]: { ...prev[activeShift], teamMembers: [...prev[activeShift].teamMembers, { id: newId, epf: newMemberEPF.trim(), isNew: true }] } }));
      setNewMemberEPF('');
      setHasUnsavedChanges(true);
      setSaveStatus('⚠️ Unsaved changes - Click SAVE');
    }
  };

  const removeTeamMember = (id) => {
    setShiftData(prev => ({ ...prev, [activeShift]: { ...prev[activeShift], teamMembers: prev[activeShift].teamMembers.filter(m => m.id !== id) } }));
    const newAssignments = { ...shiftData[activeShift].assignments };
    Object.keys(newAssignments).forEach(m => {
      if (Array.isArray(newAssignments[m])) {
        newAssignments[m] = newAssignments[m].filter(mid => mid !== id);
        if (newAssignments[m].length === 0) delete newAssignments[m];
      }
    });
    setShiftData(prev => ({ ...prev, [activeShift]: { ...prev[activeShift], assignments: newAssignments } }));
    setHasUnsavedChanges(true);
  };

  const assignMemberToMachine = (machineName, memberId) => {
    if (memberId === null) {
      setShiftData(prev => {
        const na = { ...prev[activeShift].assignments };
        delete na[machineName];
        return { ...prev, [activeShift]: { ...prev[activeShift], assignments: na } };
      });
    } else {
      const ca = shiftData[activeShift].assignments[machineName] || [];
      if (ca.includes(memberId)) {
        setShiftData(prev => {
          const na = { ...prev[activeShift].assignments };
          na[machineName] = na[machineName].filter(i => i !== memberId);
          if (na[machineName].length === 0) delete na[machineName];
          return { ...prev, [activeShift]: { ...prev[activeShift], assignments: na } };
        });
      } else if (ca.length < 5) {
        setShiftData(prev => {
          const na = { ...prev[activeShift].assignments };
          if (!na[machineName]) na[machineName] = [];
          na[machineName] = [...na[machineName], memberId];
          return { ...prev, [activeShift]: { ...prev[activeShift], assignments: na } };
        });
      } else {
        setSaveStatus('⚠️ Max 5 members per machine');
        setTimeout(() => setSaveStatus(hasUnsavedChanges ? '⚠️ Unsaved changes' : ''), 2000);
        return;
      }
    }
    setHasUnsavedChanges(true);
    setSaveStatus('⚠️ Unsaved changes');
  };

  const setMachineStatus = (machineName, status) => {
    setMachineStatuses(prev => {
      const ns = { ...prev };
      if (status === null) delete ns[machineName];
      else ns[machineName] = status;
      return ns;
    });
    setHasUnsavedChanges(true);
    setSaveStatus('⚠️ Unsaved changes');
  };

  const saveAllChanges = async () => {
    if (!hasUnsavedChanges) {
      setSaveStatus('ℹ️ No changes');
      setTimeout(() => setSaveStatus(''), 2000);
      return;
    }
    setLoading(true);
    setSaveStatus('💾 Saving...');
    try {
      for (const shift of ['A', 'B', 'C']) {
        const { data: es } = await supabase.from('shift_settings').select('id').eq('shift_name', shift).single();
        if (es) await supabase.from('shift_settings').update({ day_night: shiftData[shift].dayNight }).eq('shift_name', shift);
        else await supabase.from('shift_settings').insert([{ shift_name: shift, day_night: shiftData[shift].dayNight }]);

        const { data: ea } = await supabase.from('attendance').select('id').eq('shift', shift).single();
        if (ea) await supabase.from('attendance').update({ total_count: shiftData[shift].totalAttendance }).eq('shift', shift);
        else await supabase.from('attendance').insert([{ shift, total_count: shiftData[shift].totalAttendance }]);

        const { data: ec } = await supabase.from('worker_counts').select('id').eq('shift', shift).single();
        const cd = { 
          shift, 
          other_workers: shiftData[shift].otherWorkersCount, 
          web_transport: shiftData[shift].webTransportCount, 
          re_work: shiftData[shift].reWorkCount, 
          warp_beam: shiftData[shift].warpBeamCount,
          machine_assign: shiftData[shift].machineAssignCount,
          setup_alteration: shiftData[shift].setupAlterationCount
        };
        if (ec) await supabase.from('worker_counts').update(cd).eq('shift', shift);
        else await supabase.from('worker_counts').insert([cd]);

        for (const m of shiftData[shift].teamMembers) {
          if (m.isNew) await supabase.from('workers').insert([{ worker_name: m.epf, shift }]);
        }

        await supabase.from('allocations').delete().eq('shift', shift);
        for (const [mn, mids] of Object.entries(shiftData[shift].assignments)) {
          let { data: md } = await supabase.from('machines').select('id').eq('machine_name', mn).single();
          if (!md) {
            const { data: nm } = await supabase.from('machines').insert([{ machine_name: mn }]).select().single();
            md = nm;
          }
          for (const mid of mids) {
            const mem = shiftData[shift].teamMembers.find(m => m.id === mid);
            if (mem) {
              const { data: wd } = await supabase.from('workers').select('id').eq('worker_name', mem.epf).eq('shift', shift).single();
              if (wd && md) await supabase.from('allocations').insert([{ machine_id: md.id, worker_id: wd.id, shift }]);
            }
          }
        }
      }

      await supabase.from('machine_statuses').delete().neq('id', 0);
      for (const [mn, st] of Object.entries(machineStatuses)) {
        await supabase.from('machine_statuses').insert([{ machine_name: mn, status: st }]);
      }

      if (Object.keys(zoneLabelPositions).length > 0) {
        await supabase.from('zone_label_positions').delete().neq('id', 0);
        for (const [zoneId, pos] of Object.entries(zoneLabelPositions)) {
          await supabase.from('zone_label_positions').insert([{
            zone_id: parseInt(zoneId),
            x_position: pos.x,
            y_position: pos.y
          }]);
        }
      }

      if (editMode) {
        await supabase.from('machine_positions').delete().neq('id', 0);
        for (const m of machines) {
          await supabase.from('machine_positions').insert([{ machine_name: m.id, x_position: m.x, y_position: m.y }]);
        }
        await supabase.from('zone_definitions').delete().neq('id', 0);
        for (const z of zones) {
          await supabase.from('zone_definitions').insert([{ id: z.id, zone_name: z.name, color: z.color, machines: z.machines }]);
        }
      }

      setSaveStatus('✅ Saved!');
      setHasUnsavedChanges(false);
      await loadAllData();
      setTimeout(() => setSaveStatus(''), 3000);
    } catch (error) {
      console.error('Save error:', error);
      setSaveStatus('❌ Error saving');
      setLoading(false);
    }
  };

  const clearMap = () => {
    if (window.confirm('Clear all allocations?')) {
      setShiftData(prev => ({ ...prev, [activeShift]: { ...prev[activeShift], assignments: {} } }));
      setMachineStatuses({});
      setHasUnsavedChanges(true);
      setSaveStatus('⚠️ Cleared - Click SAVE');
    }
  };

  const handleMachineDrag = (machine, x, y) => {
    setMachines(prev => prev.map(m => m.id === machine.id ? { ...m, x, y } : m));
    setHasUnsavedChanges(true);
  };

  const handleZoneLabelDrag = (zoneId, x, y) => {
    setZoneLabelPositions(prev => ({
      ...prev,
      [zoneId]: { x, y }
    }));
    setHasUnsavedChanges(true);
    setSaveStatus('⚠️ Unsaved changes');
  };

  const addNewMachine = () => {
    if (newMachineName.trim()) {
      setMachines(prev => [...prev, { id: newMachineName.trim(), x: 400, y: 400 }]);
      setNewMachineName('');
      setHasUnsavedChanges(true);
    }
  };

  const deleteMachine = (machineId) => {
    if (window.confirm(`Delete ${machineId}?`)) {
      setMachines(prev => prev.filter(m => m.id !== machineId));
      setHasUnsavedChanges(true);
    }
  };

  const addNewZone = () => {
    if (newZoneName.trim()) {
      const newId = Math.max(...zones.map(z => z.id), 0) + 1;
      setZones(prev => [...prev, { id: newId, name: newZoneName.trim(), machines: [], color: newZoneColor }]);
      setNewZoneName('');
      setHasUnsavedChanges(true);
    }
  };

  const deleteZone = (zoneId) => {
    if (window.confirm('Delete zone?')) {
      setZones(prev => prev.filter(z => z.id !== zoneId));
      setHasUnsavedChanges(true);
    }
  };

  const assignMachineToZone = (machineId, zoneId) => {
    setZones(prev => prev.map(zone => {
      const um = zone.machines.filter(m => m !== machineId);
      if (zone.id === zoneId && !um.includes(machineId)) um.push(machineId);
      return { ...zone, machines: um };
    }));
    setHasUnsavedChanges(true);
  };

  const removeMachineFromZone = (machineId, zoneId) => {
    setZones(prev => prev.map(zone => {
      if (zone.id === zoneId) {
        return { ...zone, machines: zone.machines.filter(m => m !== machineId) };
      }
      return zone;
    }));
    setHasUnsavedChanges(true);
  };

  const downloadFinalOverviewCSV = () => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Shift,Day/Night,Total Attendance,Other Workers,Web Transport,Re-Work,Warp Beam,Machine Assign,Setup/Alteration,TL,Greige/Boil,Yarn Preparation,Pilot,Setup Count,Alteration Count,Running Count,Pilot Count,Man to Machine Ratio\n";
    
    ['A', 'B', 'C'].forEach(shift => {
      const d = shiftData[shift];
      
      const setupCount = Object.values(machineStatuses).filter(s => s === 'setup').length;
      const alterationCount = Object.values(machineStatuses).filter(s => s === 'alteration').length;
      const runningCount = Object.values(machineStatuses).filter(s => s === 'running').length;
      const pilotCount = Object.values(machineStatuses).filter(s => s === 'pilot').length;
      
      const machineAssign = d.machineAssignCount || 0;
      const manToMachineRatio = machineAssign > 0 ? (runningCount / machineAssign).toFixed(2) : '0.00';
      
      csvContent += `${dateStr},`;
      csvContent += `${shift},`;
      csvContent += `${d.dayNight},`;
      csvContent += `${d.totalAttendance},`;
      csvContent += `${d.otherWorkersCount},`;
      csvContent += `${d.webTransportCount},`;
      csvContent += `${d.reWorkCount},`;
      csvContent += `${d.warpBeamCount},`;
      csvContent += `${d.machineAssignCount},`;
      csvContent += `${d.setupAlterationCount},`;
      csvContent += `${d.tlCount || 0},`;
      csvContent += `${d.greigeBoilCount || 0},`;
      csvContent += `${d.yarnPreparationCount || 0},`;
      csvContent += `${d.pilotCount || 0},`;
      csvContent += `${setupCount},`;
      csvContent += `${alterationCount},`;
      csvContent += `${runningCount},`;
      csvContent += `${pilotCount},`;
      csvContent += `${manToMachineRatio}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Final_Overview_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setSaveStatus('✅ Final Overview CSV downloaded!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const getMemberEPF = (memberId) => {
    const m = getCurrentShiftData().teamMembers.find(m => m.id === memberId);
    return m ? m.epf : '';
  };

  const getZoneForMachine = (machineId) => zones.find(z => z.machines.includes(machineId));
  const getShiftColor = (shift) => ({ A: '#fef3c7', B: '#dbeafe', C: '#e0e7ff' }[shift] || '#f3f4f6');
  const getShiftLabel = (shift) => ({ A: 'Shift A', B: 'Shift B', C: 'Shift C' }[shift]);
  
  const getRemainingWorkers = (shift) => {
    const d = shiftData[shift];
    return d.totalAttendance - d.otherWorkersCount - d.webTransportCount - d.reWorkCount - d.warpBeamCount - 
           (d.machineAssignCount || 0) - (d.setupAlterationCount || 0) - (d.tlCount || 0) - 
           (d.greigeBoilCount || 0) - (d.yarnPreparationCount || 0) - (d.pilotCount || 0);
  };

  const drawZoneConnections = () => {
    const elements = [];
    zones.forEach(zone => {
      for (let i = 0; i < zone.machines.length - 1; i++) {
        const m1 = machines.find(m => m.id === zone.machines[i]);
        const m2 = machines.find(m => m.id === zone.machines[i + 1]);
        if (m1 && m2) {
          elements.push(
            <line 
              key={`z-${zone.id}-${i}`} 
              x1={m1.x} y1={m1.y} 
              x2={m2.x} y2={m2.y} 
              stroke="#3b82f6" 
              strokeWidth="3" 
              opacity="0.4" 
            />
          );
        }
      }
      
      if (zone.machines.length > 0) {
        const labelPos = zoneLabelPositions[zone.id];
        let labelX, labelY;
        
        if (labelPos) {
          labelX = labelPos.x;
          labelY = labelPos.y;
        } else {
          const firstMachine = machines.find(m => m.id === zone.machines[0]);
          if (firstMachine) {
            labelX = firstMachine.x - 60;
            labelY = firstMachine.y - 50;
          } else {
            return;
          }
        }
        
        elements.push(
          <text 
            key={`zname-${zone.id}`}
            x={labelX}
            y={labelY}
            style={{ 
              fontSize: '14px', 
              fontWeight: 'bold', 
              fill: zone.color === '#f3f4f6' ? '#374151' : '#1f2937',
              textDecoration: 'underline',
              cursor: editMode ? 'move' : 'default',
              userSelect: 'none'
            }}
            onMouseDown={(e) => {
              if (!editMode) return;
              const svg = e.currentTarget.closest('svg');
              const handleMove = (moveE) => {
                const rect = svg.getBoundingClientRect();
                const x = Math.round(moveE.clientX - rect.left);
                const y = Math.round(moveE.clientY - rect.top);
                handleZoneLabelDrag(zone.id, x, y);
              };
              const handleUp = () => {
                document.removeEventListener('mousemove', handleMove);
                document.removeEventListener('mouseup', handleUp);
              };
              document.addEventListener('mousemove', handleMove);
              document.addEventListener('mouseup', handleUp);
              e.preventDefault();
            }}
          >
            {zone.name}
          </text>
        );
      }
    });
    return elements;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)' }}>
        <div style={{ textAlign: 'center' }}>
          <RefreshCw size={48} style={{ animation: 'spin 1s linear infinite', color: '#2563eb' }} />
          <p style={{ marginTop: '16px', fontSize: '18px', color: '#4b5563' }}>Loading...</p>
        </div>
      </div>
    );
  }

  const props = {
    activeShift, shiftData, machines, setMachines, zones, setZones, machineStatuses,
    zoneLabelPositions, handleZoneLabelDrag,
    newMemberEPF, setNewMemberEPF, selectedMachine, setSelectedMachine,
    showMemberModal, setShowMemberModal, showStatusMenu, setShowStatusMenu,
    activeStatusFilter, setActiveStatusFilter, toggleDayNight, updateTotalAttendance,
    updateWorkerCount, addTeamMember, removeTeamMember, assignMemberToMachine,
    setMachineStatus, clearMap, getMemberEPF, getZoneForMachine, getShiftColor,
    getShiftLabel, getRemainingWorkers, drawZoneConnections, STATUS_COLORS,
    getCurrentShiftData, setSaveStatus, hasUnsavedChanges, setHasUnsavedChanges,
    editMode, setEditMode, newMachineName, setNewMachineName, newZoneName,
    setNewZoneName, newZoneColor, setNewZoneColor, handleMachineDrag,
    addNewMachine, deleteMachine, addNewZone, deleteZone, assignMachineToZone,
    removeMachineFromZone, downloadFinalOverviewCSV,
    fitMap, setFitMap 
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #eff6ff, #e0e7ff)', padding: '12px' }}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        
        .map-scroll-container {
          width: 100%;
          height: 65vh; 
          min-height: 400px;
          overflow: auto;
          background: white;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          -webkit-overflow-scrolling: touch;
          touch-action: pan-x pan-y;
          position: relative;
          scroll-behavior: smooth;
        }
        
        .map-scroll-container svg {
          display: block;
          min-width: 900px;
          min-height: 1200px;
        }

        .map-scroll-container.fit-screen svg {
          min-width: unset;
          min-height: unset;
          width: 100%;
          height: auto;
        }
        
        .setup-grid {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 24px;
        }
        
        .setup-sidebar {
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 65vh;
          overflow-y: auto;
        }
        
        @media (max-width: 1024px) {
          .setup-grid {
            grid-template-columns: 1fr !important;
          }
          .setup-sidebar {
            max-width: 100%;
            padding: 0;
            max-height: none; 
          }
          .map-scroll-container {
            height: 55vh;
          }
        }
        
        @media (max-width: 768px) {
          .grid-responsive { grid-template-columns: 1fr !important; }
          .shift-buttons { flex-wrap: wrap; }
          .setup-sidebar {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 12px;
          }
        }
        
        @media (max-width: 480px) {
          .map-scroll-container { height: 50vh; }
          .setup-sidebar {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <div style={{ maxWidth: '100%', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          
          <div style={{ background: 'linear-gradient(to right, #10b981, #4f46e5)', color: 'white', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h1 style={{ fontSize: 'clamp(20px, 4vw, 30px)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '12px', margin: 0 }}>
                  <Monitor size={32} /> Machine Allocation Manager
                </h1>
                <p style={{ marginTop: '8px', color: '#dbeafe', fontSize: 'clamp(11px, 2vw, 14px)' }}>
                  Complete Workforce & Machine Management System
                </p>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <button onClick={downloadFinalOverviewCSV} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f59e0b', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                  <Download size={16} /> Export CSV
                </button>
                <button onClick={loadAllData} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.2)', color: 'white', padding: '10px 20px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
                  <RefreshCw size={16} /> Refresh
                </button>
                <button onClick={saveAllChanges} disabled={!hasUnsavedChanges} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: hasUnsavedChanges ? '#10b981' : 'rgba(255,255,255,0.2)', color: 'white', padding: '10px 20px', borderRadius: '8px', border: hasUnsavedChanges ? '2px solid #ffffff' : '1px solid rgba(255,255,255,0.3)', cursor: hasUnsavedChanges ? 'pointer' : 'not-allowed', fontSize: '14px', fontWeight: '700', boxShadow: hasUnsavedChanges ? '0 4px 6px rgba(0,0,0,0.2)' : 'none', opacity: hasUnsavedChanges ? 1 : 0.6 }}>
                  <Save size={16} /> SAVE ALL
                </button>
              </div>
            </div>
            {saveStatus && (
              <div style={{ marginTop: '12px', padding: '8px 16px', background: 'rgba(255,255,255,0.2)', borderRadius: '6px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {hasUnsavedChanges && <AlertCircle size={16} />}
                {saveStatus}
              </div>
            )}
          </div>

          <div style={{ padding: '12px 16px', background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
            <div className="shift-buttons" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <Clock size={20} style={{ color: '#6b7280' }} />
              <span style={{ fontWeight: '600', color: '#374151', marginRight: '12px', fontSize: 'clamp(12px, 2vw, 16px)' }}>Select Shift:</span>
              {['A', 'B', 'C'].map(shift => (
                <button key={shift} onClick={() => setActiveShift(shift)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer', background: activeShift === shift ? (shift === 'A' ? '#fbbf24' : shift === 'B' ? '#3b82f6' : '#6366f1') : (shift === 'A' ? '#fef3c7' : shift === 'B' ? '#dbeafe' : '#e0e7ff'), color: activeShift === shift ? 'white' : (shift === 'A' ? '#92400e' : shift === 'B' ? '#1e40af' : '#4338ca'), boxShadow: activeShift === shift ? '0 4px 6px rgba(0,0,0,0.1)' : 'none', transform: activeShift === shift ? 'scale(1.05)' : 'scale(1)', transition: 'all 0.2s', fontSize: 'clamp(12px, 2vw, 16px)' }}>
                  {shift === 'A' ? '☀️' : shift === 'B' ? '🌤️' : '🌙'} Shift {shift}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', background: '#f9fafb', flexWrap: 'wrap' }}>
            {[
              { id: 'setup', label: 'Setup & Allocation', icon: Users },
              { id: 'view', label: 'Manager View', icon: Eye },
              { id: 'mapeditor', label: 'Map Editor', icon: Settings }
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '12px 24px', fontWeight: '500', background: activeTab === tab.id ? 'white' : 'transparent', color: activeTab === tab.id ? '#2563eb' : '#4b5563', border: 'none', borderBottom: activeTab === tab.id ? '2px solid #2563eb' : 'none', cursor: 'pointer', fontSize: 'clamp(12px, 2vw, 16px)' }}>
                <tab.icon size={16} style={{ display: 'inline', marginRight: '8px' }} />
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ padding: 'clamp(12px, 3vw, 24px)' }}>
            {activeTab === 'setup' && <SetupView {...props} />}
            {activeTab === 'view' && <ManagerView {...props} />}
            {activeTab === 'mapeditor' && <MapEditorView {...props} />}
          </div>
        </div>
      </div>
    </div>
  );
}

// SETUP VIEW COMPONENT
function SetupView(props) {
  const { shiftData, activeShift, machines, zones, machineStatuses, newMemberEPF, setNewMemberEPF,
    selectedMachine, setSelectedMachine, showMemberModal, setShowMemberModal, showStatusMenu,
    setShowStatusMenu, activeStatusFilter, setActiveStatusFilter, toggleDayNight, updateTotalAttendance,
    updateWorkerCount, addTeamMember, removeTeamMember, assignMemberToMachine, setMachineStatus,
    clearMap, getMemberEPF, getZoneForMachine, getShiftColor, getRemainingWorkers,
    drawZoneConnections, STATUS_COLORS, getCurrentShiftData, fitMap, setFitMap } = props;

  const currentData = getCurrentShiftData();
  const mapContainerRef = useRef(null);

  const scrollMap = (direction) => {
    if (mapContainerRef.current) {
      const scrollAmount = 300;
      let top = 0;
      let left = 0;
      
      if (direction === 'up') top = -scrollAmount;
      if (direction === 'down') top = scrollAmount;
      if (direction === 'left') left = -scrollAmount;
      if (direction === 'right') left = scrollAmount;

      mapContainerRef.current.scrollBy({ top, left, behavior: 'smooth' });
    }
  };

  return (
    <div className="setup-grid" style={{ gap: '24px' }}>
      
      <div className="setup-sidebar">
        
        <div style={{ background: '#e0f2fe', borderRadius: '8px', padding: '12px', border: '2px solid #0ea5e9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '13px', fontWeight: 'bold', margin: 0, color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserCheck size={16} /> Total Attendance
            </h3>
            <button onClick={() => toggleDayNight(activeShift)} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', borderRadius: '4px', border: 'none', cursor: 'pointer', background: shiftData[activeShift].dayNight === 'day' ? '#fbbf24' : '#4338ca', color: 'white', fontSize: '10px', fontWeight: '600' }}>
              {shiftData[activeShift].dayNight === 'day' ? <Sun size={10} /> : <Moon size={10} />}
              {shiftData[activeShift].dayNight === 'day' ? 'Day' : 'Night'}
            </button>
          </div>
          <input type="number" min="0" value={shiftData[activeShift].totalAttendance} onChange={(e) => updateTotalAttendance(activeShift, e.target.value)} placeholder="Enter total" style={{ width: '100%', padding: '8px', border: '2px solid #0ea5e9', borderRadius: '6px', fontSize: '15px', fontWeight: 'bold', textAlign: 'center' }} />
          <div style={{ marginTop: '8px', padding: '6px', background: 'white', borderRadius: '4px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>Machine Assign:</span>
              <span style={{ fontWeight: 'bold', color: '#10b981' }}>{currentData.machineAssignCount || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>Setup/Alteration:</span>
              <span style={{ fontWeight: 'bold', color: '#8b5cf6' }}>{currentData.setupAlterationCount || 0}</span>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>TL:</span>
              <span style={{ fontWeight: 'bold', color: '#ec4899' }}>{currentData.tlCount || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>Greige/Boil:</span>
              <span style={{ fontWeight: 'bold', color: '#6366f1' }}>{currentData.greigeBoilCount || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>Yarn Prep:</span>
              <span style={{ fontWeight: 'bold', color: '#14b8a6' }}>{currentData.yarnPreparationCount || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span>Pilot:</span>
              <span style={{ fontWeight: 'bold', color: '#f97316' }}>{currentData.pilotCount || 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '4px', borderTop: '1px solid #e5e7eb' }}>
              <span style={{ fontWeight: 'bold' }}>Remaining:</span>
              <span style={{ fontWeight: 'bold', color: getRemainingWorkers(activeShift) >= 0 ? '#059669' : '#dc2626' }}>
                {getRemainingWorkers(activeShift)}
              </span>
            </div>
          </div>
        </div>

        <div style={{ background: '#dcfce7', borderRadius: '8px', padding: '12px', border: '2px solid #10b981' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#064e3b' }}>Machine Assign</h3>
          <input type="number" min="0" value={currentData.machineAssignCount || 0} onChange={(e) => updateWorkerCount(activeShift, 'machineAssignCount', e.target.value)} placeholder="Count" style={{ width: '100%', padding: '6px', border: '1px solid #10b981', borderRadius: '4px', fontSize: '14px', textAlign: 'center' }} />
        </div>

        <div style={{ background: '#f3e8ff', borderRadius: '8px', padding: '12px', border: '2px solid #8b5cf6' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#5b21b6' }}>Setup/Alteration Assigned</h3>
          <input type="number" min="0" value={currentData.setupAlterationCount || 0} onChange={(e) => updateWorkerCount(activeShift, 'setupAlterationCount', e.target.value)} placeholder="Count" style={{ width: '100%', padding: '6px', border: '1px solid #8b5cf6', borderRadius: '4px', fontSize: '14px', textAlign: 'center' }} />
        </div>

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

        <div style={{ background: '#fce7f3', borderRadius: '8px', padding: '12px', border: '2px solid #ec4899' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#9f1239' }}>TL</h3>
          <input type="number" min="0" value={currentData.tlCount || 0} onChange={(e) => updateWorkerCount(activeShift, 'tlCount', e.target.value)} placeholder="Count" style={{ width: '100%', padding: '6px', border: '1px solid #ec4899', borderRadius: '4px', fontSize: '14px', textAlign: 'center' }} />
        </div>

        <div style={{ background: '#e0e7ff', borderRadius: '8px', padding: '12px', border: '2px solid #6366f1' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#4338ca' }}>Greige/Boil</h3>
          <input type="number" min="0" value={currentData.greigeBoilCount || 0} onChange={(e) => updateWorkerCount(activeShift, 'greigeBoilCount', e.target.value)} placeholder="Count" style={{ width: '100%', padding: '6px', border: '1px solid #6366f1', borderRadius: '4px', fontSize: '14px', textAlign: 'center' }} />
        </div>

        <div style={{ background: '#ccfbf1', borderRadius: '8px', padding: '12px', border: '2px solid #14b8a6' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#115e59' }}>Yarn Preparation</h3>
          <input type="number" min="0" value={currentData.yarnPreparationCount || 0} onChange={(e) => updateWorkerCount(activeShift, 'yarnPreparationCount', e.target.value)} placeholder="Count" style={{ width: '100%', padding: '6px', border: '1px solid #14b8a6', borderRadius: '4px', fontSize: '14px', textAlign: 'center' }} />
        </div>

        <div style={{ background: '#ffedd5', borderRadius: '8px', padding: '12px', border: '2px solid #f97316' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', color: '#9a3412' }}>Pilot</h3>
          <input type="number" min="0" value={currentData.pilotCount || 0} onChange={(e) => updateWorkerCount(activeShift, 'pilotCount', e.target.value)} placeholder="Count" style={{ width: '100%', padding: '6px', border: '1px solid #f97316', borderRadius: '4px', fontSize: '14px', textAlign: 'center' }} />
        </div>

        <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '12px', border: '2px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>Machine Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { id: 'setup', label: 'Setup', icon: Wrench, color: '#3b82f6' },
              { id: 'development', label: 'Development', icon: Code, color: '#eab308' },
              { id: 'alteration', label: 'Alteration', icon: Edit, color: '#ef4444' },
              { id: 'running', label: 'Running', icon: Play, color: '#10b981' },
              { id: 'pilot', label: 'Pilot', icon: Plane, color: '#f97316' },
              { id: 'no-order', label: 'No Order', icon: XCircle, color: '#92400e' }
            ].map(status => (
              <button key={status.id} onClick={() => { setActiveStatusFilter(status.id); setShowStatusMenu(true); }} style={{ padding: '8px 10px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: status.color, color: 'white', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
                <status.icon size={12} />
                {status.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: getShiftColor(activeShift), borderRadius: '8px', padding: '12px', border: '2px solid #d1d5db' }}>
          <div style={{ marginBottom: '6px' }}>
            <h2 style={{ fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
              <Users size={14} /> Assigned EPFs
            </h2>
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

      <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h2 style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Grid3x3 size={20} /> Machine Map
            </h2>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => scrollMap('left')} disabled={fitMap} style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid #d1d5db', background: fitMap ? '#f3f4f6' : 'white', cursor: fitMap ? 'not-allowed' : 'pointer', opacity: fitMap ? 0.5 : 1 }}>
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => scrollMap('up')} disabled={fitMap} style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid #d1d5db', background: fitMap ? '#f3f4f6' : 'white', cursor: fitMap ? 'not-allowed' : 'pointer', opacity: fitMap ? 0.5 : 1 }}>
                <ChevronUp size={14} />
              </button>
              <button onClick={() => scrollMap('down')} disabled={fitMap} style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid #d1d5db', background: fitMap ? '#f3f4f6' : 'white', cursor: fitMap ? 'not-allowed' : 'pointer', opacity: fitMap ? 0.5 : 1 }}>
                <ChevronDown size={14} />
              </button>
              <button onClick={() => scrollMap('right')} disabled={fitMap} style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid #d1d5db', background: fitMap ? '#f3f4f6' : 'white', cursor: fitMap ? 'not-allowed' : 'pointer', opacity: fitMap ? 0.5 : 1 }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={() => setFitMap(!fitMap)} 
              style={{ background: fitMap ? '#2563eb' : '#fff', border: '1px solid #2563eb', color: fitMap ? 'white' : '#2563eb', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {fitMap ? <Minimize size={14}/> : <Maximize size={14}/>} 
              {fitMap ? '1:1 Scale' : 'Fit to Screen'}
            </button>
            <button onClick={clearMap} style={{ background: '#dc2626', color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px' }}>Clear Map</button>
          </div>
        </div>
        
        <div className={`map-scroll-container ${fitMap ? 'fit-screen' : ''}`} ref={mapContainerRef}>
          <svg width="900" height="1200" viewBox="0 0 900 1200">
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
function ManagerView(props) {
  const { shiftData, machines, zones, machineStatuses, getShiftLabel, getShiftColor, getZoneForMachine, STATUS_COLORS, drawZoneConnections, getRemainingWorkers, fitMap, setFitMap, setSelectedMachine, setShowMemberModal, selectedMachine, showMemberModal, assignMemberToMachine, activeShift, getMemberEPF } = props;
  const mapContainerRef = useRef(null);

  const currentData = shiftData[activeShift] || shiftData['A']; 

  const scrollMap = (direction) => {
    if (mapContainerRef.current) {
      const scrollAmount = 300;
      let top = 0;
      let left = 0;
      
      if (direction === 'up') top = -scrollAmount;
      if (direction === 'down') top = scrollAmount;
      if (direction === 'left') left = -scrollAmount;
      if (direction === 'right') left = scrollAmount;

      mapContainerRef.current.scrollBy({ top, left, behavior: 'smooth' });
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 'clamp(18px, 4vw, 24px)', fontWeight: 'bold', marginBottom: '24px' }}>Complete Allocation Overview</h2>
      
      {['A', 'B', 'C'].map(shift => {
        const shiftAssignments = shiftData[shift]?.assignments || {};
        
        return (
          <div key={shift} style={{ marginBottom: '32px', padding: '20px', background: getShiftColor(shift), borderRadius: '12px', border: '2px solid #d1d5db' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <h3 style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                {shift === 'A' ? '☀️' : shift === 'B' ? '🌤️' : '🌙'} {getShiftLabel(shift)}
              </h3>
              <div style={{ padding: '6px 12px', borderRadius: '6px', background: shiftData[shift].dayNight === 'day' ? '#fbbf24' : '#4338ca', color: 'white', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {shiftData[shift].dayNight === 'day' ? '☀️' : '🌙'} {shiftData[shift].dayNight === 'day' ? 'DAY' : 'NIGHT'}
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: 'white', borderRadius: '8px', padding: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px' }}>Total Attendance</p>
                <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e40af' }}>{shiftData[shift].totalAttendance}</p>
              </div>
              <div style={{ background: 'white', borderRadius: '8px', padding: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px' }}>Machine Assign</p>
                <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#10b981' }}>{shiftData[shift].machineAssignCount || 0}</p>
              </div>
              <div style={{ background: 'white', borderRadius: '8px', padding: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#6b7280', fontSize: '11px', marginBottom: '4px' }}>Remaining</p>
                <p style={{ fontSize: '22px', fontWeight: 'bold', color: getRemainingWorkers(shift) >= 0 ? '#059669' : '#dc2626' }}>{getRemainingWorkers(shift)}</p>
              </div>
            </div>
            
            {Object.keys(shiftAssignments).length > 0 && (
              <div style={{ background: 'white', borderRadius: '8px', padding: '16px', maxHeight: '250px', overflowY: 'auto' }}>
                <p style={{ fontWeight: '600', marginBottom: '8px', color: '#374151' }}>Machine Assignments Breakdown:</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                  {Object.entries(shiftAssignments).map(([machineId, memberIds]) => {
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: 'clamp(16px, 3vw, 20px)', fontWeight: '600', margin: 0 }}>Complete Machine Layout</h3>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => scrollMap('left')} disabled={fitMap} style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid #d1d5db', background: fitMap ? '#f3f4f6' : 'white', cursor: fitMap ? 'not-allowed' : 'pointer', opacity: fitMap ? 0.5 : 1 }}>
                <ChevronLeft size={14} />
              </button>
              <button onClick={() => scrollMap('up')} disabled={fitMap} style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid #d1d5db', background: fitMap ? '#f3f4f6' : 'white', cursor: fitMap ? 'not-allowed' : 'pointer', opacity: fitMap ? 0.5 : 1 }}>
                <ChevronUp size={14} />
              </button>
              <button onClick={() => scrollMap('down')} disabled={fitMap} style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid #d1d5db', background: fitMap ? '#f3f4f6' : 'white', cursor: fitMap ? 'not-allowed' : 'pointer', opacity: fitMap ? 0.5 : 1 }}>
                <ChevronDown size={14} />
              </button>
              <button onClick={() => scrollMap('right')} disabled={fitMap} style={{ padding: '4px 6px', borderRadius: '4px', border: '1px solid #d1d5db', background: fitMap ? '#f3f4f6' : 'white', cursor: fitMap ? 'not-allowed' : 'pointer', opacity: fitMap ? 0.5 : 1 }}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          <button 
            onClick={() => setFitMap(!fitMap)} 
            style={{ background: fitMap ? '#2563eb' : '#fff', border: '1px solid #2563eb', color: fitMap ? 'white' : '#2563eb', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            {fitMap ? <Minimize size={14}/> : <Maximize size={14}/>} 
            {fitMap ? '1:1 Scale' : 'Fit to Screen'}
          </button>
        </div>
        <div className={`map-scroll-container ${fitMap ? 'fit-screen' : ''}`} ref={mapContainerRef}>
          <svg width="900" height="1200" viewBox="0 0 900 1200">
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
    </div>
  );
}

// MAP EDITOR VIEW COMPONENT
function MapEditorView(props) {
  const { machines, zones, editMode, setEditMode, newMachineName, setNewMachineName,
    newZoneName, setNewZoneName, newZoneColor, setNewZoneColor, handleMachineDrag, addNewMachine,
    deleteMachine, addNewZone, deleteZone, assignMachineToZone, removeMachineFromZone, getZoneForMachine, drawZoneConnections,
    setSaveStatus, fitMap, setFitMap } = props;

  return (
    <div>
      <div style={{ background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: '#92400e', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Settings size={24} /> Visual Map Editor
        </h2>
        <p style={{ color: '#78350f', marginBottom: '12px' }}>
          Configure your factory layout. Drag machines to reposition them on the map.
        </p>
        <button onClick={() => { 
            setEditMode(!editMode); 
            if(!editMode) setFitMap(false); // Force scroll mode when editing to keep drag math accurate
            setSaveStatus(editMode ? '' : '🔧 Edit mode enabled'); 
          }} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: editMode ? '#dc2626' : '#059669', color: 'white', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
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
                <span key={m} style={{ fontSize: '11px', padding: '4px 8px', background: 'white', borderRadius: '4px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  {m}
                  <button onClick={() => removeMachineFromZone(m, zone.id)} style={{ border: 'none', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px' }}>×</button>
                </span>
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
          {!fitMap ? (
            <div className="map-scroll-container">
              <svg width="900" height="1200" viewBox="0 0 900 1200">
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
          ) : (
            <div style={{ padding: '20px', background: '#fee2e2', borderRadius: '8px', color: '#991b1b', textAlign: 'center' }}>
              <p>⚠️ "Fit to Screen" mode is disabled during editing to ensure accurate machine placement. Please use 1:1 Scale (Scrolling) to drag machines.</p>
              <button onClick={() => setFitMap(false)} style={{ marginTop: '10px', background: '#ef4444', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Switch to 1:1 Scale</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;