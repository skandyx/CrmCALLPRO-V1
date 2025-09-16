
import React, { useState, useEffect, useMemo } from 'react';
import type { User, Campaign, SavedScript, Contact } from '../types.ts';
import AgentPreview from './AgentPreview.tsx';
// Fix: Added PauseIcon which was missing from Icons.tsx. It is now added there.
import { PhoneIcon, PauseIcon, PlayIcon, UserCircleIcon, PhoneXMarkIcon } from './Icons.tsx';

type AgentCtiStatus = 'LOGGED_OUT' | 'WAITING' | 'IN_CALL' | 'WRAP_UP' | 'PAUSED';

const CTI_STATUS_CONFIG: { [key in AgentCtiStatus]: { text: string; color: string; } } = {
    LOGGED_OUT: { text: 'Déconnecté', color: 'bg-slate-500' },
    WAITING: { text: 'En attente d\'appel', color: 'bg-green-500' },
    IN_CALL: { text: 'En appel', color: 'bg-red-500' },
    WRAP_UP: { text: 'Post-appel', color: 'bg-yellow-500' },
    PAUSED: { text: 'En pause', color: 'bg-orange-500' },
};

interface AgentViewProps {
    agent: User;
    campaigns: Campaign[];
    savedScripts: SavedScript[];
    onLogout: () => void;
}

const AgentView: React.FC<AgentViewProps> = ({ agent, campaigns, savedScripts, onLogout }) => {
    const [ctiStatus, setCtiStatus] = useState<AgentCtiStatus>('LOGGED_OUT');
    const [statusTimer, setStatusTimer] = useState(0);
    const [currentContact, setCurrentContact] = useState<Contact | null>(null);

    const agentCampaign = useMemo(() => {
        return campaigns.find(c => c.id === agent.campaignIds[0] && c.isActive);
    }, [agent, campaigns]);

    const agentScript = useMemo(() => {
        if (!agentCampaign) return null;
        return savedScripts.find(s => s.id === agentCampaign.scriptId);
    }, [agentCampaign, savedScripts]);

    // Fix: Correctly handle interval creation and cleanup for the status timer.
    useEffect(() => {
        if (ctiStatus === 'LOGGED_OUT') {
            setStatusTimer(0);
            return; // No interval needed when logged out
        }

        const intervalId = setInterval(() => {
            setStatusTimer(prev => prev + 1);
        }, 1000);

        // Return a cleanup function that clears the interval.
        // This runs when the component unmounts or ctiStatus changes.
        return () => clearInterval(intervalId);
    }, [ctiStatus]);
    
    const formatDuration = (seconds: number) => {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    };
    
    const handleLoginClick = () => {
        setCtiStatus('WAITING');
        setStatusTimer(0);
    };

    const handleNextCall = () => {
        if (!agentCampaign) return;
        const nextContact = agentCampaign.contacts.find(c => c.status === 'pending');
        if (nextContact) {
            setCurrentContact(nextContact);
            setCtiStatus('IN_CALL');
            setStatusTimer(0);
        } else {
            alert("Plus de contacts à appeler dans cette campagne.");
            setCtiStatus('WAITING');
        }
    };
    
    const handleEndCall = () => {
        setCtiStatus('WRAP_UP');
        setStatusTimer(0);
        // After 10 seconds of wrap-up, go back to waiting
        setTimeout(() => {
            setCtiStatus('WAITING');
            setCurrentContact(null);
            setStatusTimer(0);
        }, 10000);
    };

    const handlePause = () => {
        setCtiStatus('PAUSED');
        setStatusTimer(0);
    };
    
    const handleResume = () => {
        setCtiStatus('WAITING');
        setStatusTimer(0);
    };

    return (
        <div className="h-screen w-screen flex flex-col bg-slate-100 font-sans">
            <header className="bg-white shadow-md p-3 flex justify-between items-center z-10 flex-shrink-0">
                <div className="flex items-center space-x-3">
                    <UserCircleIcon className="w-10 h-10 text-slate-500" />
                    <div>
                        <p className="font-bold text-slate-800">{agent.firstName} {agent.lastName}</p>
                        <p className="text-sm text-slate-500">Rôle: {agent.role}</p>
                    </div>
                </div>
                <button onClick={onLogout} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg">
                    Déconnexion
                </button>
            </header>
            
            <main className="flex-1 grid grid-cols-12 gap-4 p-4 overflow-hidden">
                <div className="col-span-3 bg-white rounded-lg p-4 border border-slate-200 flex flex-col">
                    <h2 className="text-xl font-semibold text-slate-800 border-b pb-2 mb-4">Informations</h2>
                    {agentCampaign ? (
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-semibold text-slate-600">Campagne Actuelle</h3>
                                <p className="text-lg text-indigo-700 font-bold">{agentCampaign.name}</p>
                            </div>
                             {currentContact && ctiStatus === 'IN_CALL' && (
                                <div>
                                    <h3 className="font-semibold text-slate-600">Contact en ligne</h3>
                                    <p className="text-lg text-slate-800 font-bold">{currentContact.firstName} {currentContact.lastName}</p>
                                    <p className="text-md text-slate-600">{currentContact.phoneNumber}</p>
                                    <p className="text-sm text-slate-500">Code Postal: {currentContact.postalCode}</p>
                                </div>
                             )}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                             <p className="text-center text-slate-500">Aucune campagne active ne vous est assignée.</p>
                        </div>
                    )}
                </div>
                <div className="col-span-9 bg-white rounded-lg border border-slate-200 overflow-hidden relative">
                    {ctiStatus === 'IN_CALL' && agentScript && currentContact ? (
                        <AgentPreview script={agentScript} onClose={() => {}} />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <p className="text-2xl text-slate-400">{CTI_STATUS_CONFIG[ctiStatus].text}</p>
                        </div>
                    )}
                </div>
            </main>

            <footer className="bg-slate-800 text-white p-3 flex justify-between items-center flex-shrink-0">
                <div className="flex items-center space-x-4">
                    <div className={`px-4 py-2 rounded-md flex items-center ${CTI_STATUS_CONFIG[ctiStatus].color}`}>
                        <span className="font-bold">{CTI_STATUS_CONFIG[ctiStatus].text}</span>
                    </div>
                    <div className="font-mono text-2xl">{formatDuration(statusTimer)}</div>
                </div>
                <div className="flex items-center space-x-2">
                    {ctiStatus === 'LOGGED_OUT' && (
                        <button onClick={handleLoginClick} className="bg-green-600 hover:bg-green-700 font-semibold py-2 px-4 rounded-lg inline-flex items-center"><PlayIcon className="w-5 h-5 mr-2"/>Démarrer la session</button>
                    )}
                    {ctiStatus === 'WAITING' && (
                        <>
                            <button onClick={handleNextCall} className="bg-blue-600 hover:bg-blue-700 font-semibold py-2 px-4 rounded-lg inline-flex items-center"><PhoneIcon className="w-5 h-5 mr-2"/>Appel Suivant</button>
                            <button onClick={handlePause} className="bg-slate-600 hover:bg-slate-700 font-semibold py-2 px-4 rounded-lg inline-flex items-center"><PauseIcon className="w-5 h-5 mr-2"/>Pause</button>
                        </>
                    )}
                     {ctiStatus === 'PAUSED' && (
                        <button onClick={handleResume} className="bg-green-600 hover:bg-green-700 font-semibold py-2 px-4 rounded-lg inline-flex items-center"><PlayIcon className="w-5 h-5 mr-2"/>Reprendre</button>
                    )}
                    {ctiStatus === 'IN_CALL' && (
                        <button onClick={handleEndCall} className="bg-red-600 hover:bg-red-700 font-semibold py-2 px-4 rounded-lg inline-flex items-center"><PhoneXMarkIcon className="w-5 h-5 mr-2"/>Raccrocher</button>
                    )}
                </div>
            </footer>
        </div>
    );
};

export default AgentView;
