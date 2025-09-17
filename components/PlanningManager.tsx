import React, { useState, useMemo } from 'react';
import type { Feature, PlanningEvent, ActivityType, User } from '../types.ts';
import { PlusIcon, EditIcon, TrashIcon, ArrowLeftIcon, ArrowRightIcon, CalendarDaysIcon } from './Icons.tsx';

interface PlanningManagerProps {
    feature: Feature;
    planningEvents: PlanningEvent[];
    activityTypes: ActivityType[];
    users: User[];
    onSavePlanningEvent: (event: PlanningEvent) => void;
    onDeletePlanningEvent: (eventId: string) => void;
}

const WEEKDAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

// --- PlanningEventModal ---
interface PlanningEventModalProps {
    event: Partial<PlanningEvent> | null;
    onSave: (event: PlanningEvent) => void;
    onDelete: (eventId: string) => void;
    onClose: () => void;
    agents: User[];
    activities: ActivityType[];
}

const PlanningEventModal: React.FC<PlanningEventModalProps> = ({ event, onSave, onDelete, onClose, agents, activities }) => {
    const [formData, setFormData] = useState<Partial<PlanningEvent>>({
        id: event?.id || `plan-${Date.now()}`,
        agentId: event?.agentId || '',
        activityId: event?.activityId || '',
        startDate: event?.startDate || new Date().toISOString(),
        endDate: event?.endDate || new Date().toISOString(),
    });

    const handleSave = () => {
        if (!formData.agentId || !formData.activityId) {
            alert("Veuillez sélectionner un agent et une activité.");
            return;
        }
        onSave(formData as PlanningEvent);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-800 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6">
                    <h3 className="text-lg font-medium text-slate-900">{event?.id ? "Modifier l'événement" : "Nouvel événement"}</h3>
                    <div className="mt-4 space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-700">Agent</label>
                            <select value={formData.agentId} onChange={e => setFormData(f => ({...f, agentId: e.target.value}))} className="mt-1 w-full p-2 border bg-white rounded-md">
                                <option value="">Sélectionner un agent</option>
                                {agents.map(a => <option key={a.id} value={a.id}>{a.firstName} {a.lastName}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-700">Activité</label>
                            <select value={formData.activityId} onChange={e => setFormData(f => ({...f, activityId: e.target.value}))} className="mt-1 w-full p-2 border bg-white rounded-md">
                                 <option value="">Sélectionner une activité</option>
                                {activities.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                            </select>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-700">Début</label>
                                <input type="datetime-local" value={formData.startDate ? new Date(new Date(formData.startDate).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} onChange={e => setFormData(f => ({...f, startDate: new Date(e.target.value).toISOString()}))} className="mt-1 w-full p-2 border rounded-md"/>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-700">Fin</label>
                                <input type="datetime-local" value={formData.endDate ? new Date(new Date(formData.endDate).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} onChange={e => setFormData(f => ({...f, endDate: new Date(e.target.value).toISOString()}))} className="mt-1 w-full p-2 border rounded-md"/>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-50 p-3 flex justify-between">
                     {event?.id && <button onClick={() => { onDelete(event.id!); onClose(); }} className="bg-red-100 text-red-700 px-4 py-2 rounded-md hover:bg-red-200">Supprimer</button>}
                    <div className="flex justify-end gap-2 w-full">
                        <button onClick={onClose} className="bg-white border border-slate-300 px-4 py-2 rounded-md hover:bg-slate-50">Annuler</button>
                        <button onClick={handleSave} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">Enregistrer</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PlanningManager: React.FC<PlanningManagerProps> = ({ feature, planningEvents, activityTypes, users, onSavePlanningEvent, onDeletePlanningEvent }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedAgentId, setSelectedAgentId] = useState('all');
    const [modalState, setModalState] = useState<{ isOpen: boolean; event: Partial<PlanningEvent> | null }>({ isOpen: false, event: null });
    
    const activeAgents = useMemo(() => users.filter(u => u.role === 'Agent' && u.isActive), [users]);

    const weekInfo = useMemo(() => {
        const start = new Date(currentDate);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        
        const days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date(start);
            d.setDate(start.getDate() + i);
            return d;
        });

        return { start, end, days };
    }, [currentDate]);

    const filteredEvents = useMemo(() => {
        return planningEvents.filter(event => {
            const eventDate = new Date(event.startDate);
            const isAgentMatch = selectedAgentId === 'all' || event.agentId === selectedAgentId;
            return eventDate >= weekInfo.start && eventDate <= weekInfo.end && isAgentMatch;
        });
    }, [planningEvents, weekInfo, selectedAgentId]);

    const handleDateChange = (offset: number) => {
        setCurrentDate(prev => {
            const newDate = new Date(prev);
            newDate.setDate(prev.getDate() + offset);
            return newDate;
        });
    };
    
    const handleCellClick = (day: Date, hour: number) => {
        const startDate = new Date(day);
        startDate.setHours(hour, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setHours(hour + 1, 0, 0, 0);
        
        setModalState({
            isOpen: true,
            event: { 
                agentId: selectedAgentId !== 'all' ? selectedAgentId : '', 
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString()
            }
        });
    }

    const hourHeight = 60; // 60px per hour
    
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {modalState.isOpen && (
                <PlanningEventModal
                    event={modalState.event}
                    onSave={onSavePlanningEvent}
                    onDelete={onDeletePlanningEvent}
                    onClose={() => setModalState({ isOpen: false, event: null })}
                    agents={activeAgents}
                    activities={activityTypes}
                />
            )}
            <header>
                <h1 className="text-4xl font-bold text-slate-900 tracking-tight flex items-center"><CalendarDaysIcon className="w-9 h-9 mr-3"/>{feature.title}</h1>
                <p className="mt-2 text-lg text-slate-600">{feature.description}</p>
            </header>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <button onClick={() => handleDateChange(-7)} className="p-2 rounded-md hover:bg-slate-100"><ArrowLeftIcon className="w-5 h-5"/></button>
                    <span className="text-lg font-semibold text-slate-700">
                        {weekInfo.start.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long' })} - {weekInfo.end.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={() => handleDateChange(7)} className="p-2 rounded-md hover:bg-slate-100"><ArrowRightIcon className="w-5 h-5"/></button>
                </div>
                <div>
                     <label className="text-sm font-medium text-slate-600 mr-2">Agent:</label>
                     <select value={selectedAgentId} onChange={e => setSelectedAgentId(e.target.value)} className="p-2 border bg-white rounded-md">
                        <option value="all">Tous les agents</option>
                        {activeAgents.map(a => <option key={a.id} value={a.id}>{a.firstName} {a.lastName}</option>)}
                     </select>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
                <div className="h-[75vh] overflow-auto relative grid grid-cols-[auto_1fr] text-sm">
                    {/* Time Gutter */}
                    <div className="sticky top-0 z-20 bg-white border-r border-b">
                        <div className="h-10 border-b flex items-center justify-center font-semibold text-slate-500">Heure</div>
                        {Array.from({ length: 24 }).map((_, hour) => (
                            <div key={hour} className="h-[60px] text-right pr-2 text-xs text-slate-400 border-t pt-1 font-mono">
                                {`${hour.toString().padStart(2, '0')}:00`}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 relative">
                         {/* Header */}
                        {weekInfo.days.map((day, i) => (
                            <div key={i} className="sticky top-0 h-10 bg-white border-b border-r flex items-center justify-center font-semibold z-10">
                                {WEEKDAYS[i]} <span className="text-slate-500 ml-2">{day.getDate()}</span>
                            </div>
                        ))}
                        
                        {/* Day Columns & Events */}
                        {weekInfo.days.map((day, dayIndex) => (
                            <div key={dayIndex} className="relative border-r">
                                {/* Background Grid */}
                                {Array.from({ length: 24 }).map((_, hour) => (
                                    <div key={hour} onClick={() => handleCellClick(day, hour)} className="h-[60px] border-t hover:bg-indigo-50 cursor-pointer"/>
                                ))}
                                {/* Events */}
                                {filteredEvents
                                    .filter(event => new Date(event.startDate).toDateString() === day.toDateString())
                                    .map(event => {
                                        const startDate = new Date(event.startDate);
                                        const endDate = new Date(event.endDate);
                                        const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
                                        const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();
                                        const durationMinutes = endMinutes - startMinutes;
                                        
                                        const top = (startMinutes / 60) * hourHeight;
                                        const height = (durationMinutes / 60) * hourHeight;
                                        
                                        const activity = activityTypes.find(a => a.id === event.activityId);
                                        const agent = users.find(u => u.id === event.agentId);

                                        return (
                                            <div
                                                key={event.id}
                                                onClick={() => setModalState({ isOpen: true, event })}
                                                className="absolute w-full p-2 rounded-md shadow-sm border cursor-pointer overflow-hidden"
                                                style={{ top: `${top}px`, height: `${height}px`, backgroundColor: activity?.color || '#ccc', borderColor: activity ? `${activity.color}99` : '#bbb' }}
                                                title={`${activity?.name} - ${agent?.firstName} ${agent?.lastName}`}
                                            >
                                                <p className="font-bold text-white text-xs truncate">{activity?.name}</p>
                                                {selectedAgentId === 'all' && <p className="text-white text-xs opacity-80 truncate">{agent?.firstName}</p>}
                                            </div>
                                        );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlanningManager;