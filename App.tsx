
import React, { useState, useMemo } from 'react';
import { features } from './data/features.ts';
import { mockData } from './data/mockData.ts';
// Fix: Added missing types for call history and agent sessions which are now part of the app's state.
import type { Feature, User, SavedScript, IvrFlow, Campaign, Qualification, QualificationGroup, UserGroup, Trunk, Did, BackupLog, BackupSchedule, SystemLog, VersionInfo, ConnectivityService, Contact, CallHistoryRecord, AgentSession, AudioFile } from './types.ts';
import Sidebar from './components/Sidebar.tsx';
import FeatureDetail from './components/FeatureDetail.tsx';
import LoginScreen from './components/LoginScreen.tsx';
import AgentView from './components/AgentView.tsx';
import Header from './components/Header.tsx';
import MonitoringDashboard from './components/MonitoringDashboard.tsx';

const App: React.FC = () => {
    // --- STATE MANAGEMENT ---
    const [activeFeatureId, setActiveFeatureId] = useState<string | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [activeView, setActiveView] = useState<'app' | 'monitoring'>('app');
    
    // Data states
    const [users, setUsers] = useState<User[]>(mockData.users);
    const [userGroups, setUserGroups] = useState<UserGroup[]>(mockData.userGroups);
    const [savedScripts, setSavedScripts] = useState<SavedScript[]>(mockData.savedScripts);
    const [savedIvrFlows, setSavedIvrFlows] = useState<IvrFlow[]>(mockData.savedIvrFlows);
    const [campaigns, setCampaigns] = useState<Campaign[]>(mockData.campaigns);
    const [qualifications, setQualifications] = useState<Qualification[]>(mockData.qualifications);
    const [qualificationGroups, setQualificationGroups] = useState<QualificationGroup[]>(mockData.qualificationGroups);
    const [trunks, setTrunks] = useState<Trunk[]>(mockData.trunks);
    const [dids, setDids] = useState<Did[]>(mockData.dids);
    const [backupLogs, setBackupLogs] = useState<BackupLog[]>(mockData.backupLogs);
    const [backupSchedule, setBackupSchedule] = useState<BackupSchedule>(mockData.backupSchedule);
    const [systemLogs, setSystemLogs] = useState<SystemLog[]>(mockData.systemLogs);
    const [versionInfo] = useState<VersionInfo>(mockData.versionInfo);
    const [connectivityServices] = useState<ConnectivityService[]>(mockData.connectivityServices);
    const [audioFiles, setAudioFiles] = useState<AudioFile[]>(mockData.audioFiles);
    // Fix: Added state for call history and agent sessions for the reporting dashboard.
    const [callHistory] = useState<CallHistoryRecord[]>(mockData.callHistory);
    const [agentSessions] = useState<AgentSession[]>(mockData.agentSessions);

    const activeFeature = useMemo(() => features.find(f => f.id === activeFeatureId), [activeFeatureId]);

    // --- CRUD Handlers ---
    const handleSaveUser = (userToSave: User) => {
        setUsers(prevUsers => {
            const index = prevUsers.findIndex(u => u.id === userToSave.id);
            if (index > -1) {
                const updatedUsers = [...prevUsers];
                updatedUsers[index] = userToSave;
                return updatedUsers;
            }
            return [...prevUsers, userToSave];
        });
    };
    
    const handleDeleteUser = (userId: string) => {
        setUsers(prev => prev.filter(u => u.id !== userId));
    };
    
    const handleGenerateUsers = (count: number) => {
        const newUsers: User[] = [];
        const existingLoginIds = new Set(users.map(u => u.loginId));
        let nextLoginId = 1001;
        for (let i = 0; i < count; i++) {
            while(existingLoginIds.has(String(nextLoginId))) {
                nextLoginId++;
            }
            const newUser: User = {
                id: `new-user-${Date.now() + i}`,
                loginId: String(nextLoginId),
                firstName: `Agent${i+1}`,
                lastName: `Test${nextLoginId}`,
                email: `agent${nextLoginId}@example.com`,
                role: 'Agent',
                isActive: true,
                campaignIds: [],
                password: 'password123'
            };
            newUsers.push(newUser);
            existingLoginIds.add(newUser.loginId);
        }
        setUsers(prev => [...prev, ...newUsers]);
    };

    const handleSaveUserGroup = (groupToSave: UserGroup) => {
        setUserGroups(prev => {
            const index = prev.findIndex(g => g.id === groupToSave.id);
            if (index > -1) {
                const updated = [...prev];
                updated[index] = groupToSave;
                return updated;
            }
            return [...prev, groupToSave];
        });
    };
    
    const handleDeleteUserGroup = (groupId: string) => {
        setUserGroups(prev => prev.filter(g => g.id !== groupId));
    };

    const handleSaveOrUpdateScript = (script: SavedScript) => {
        setSavedScripts(prev => {
            const index = prev.findIndex(s => s.id === script.id);
            if (index > -1) {
                const updated = [...prev];
                updated[index] = script;
                return updated;
            }
            return [...prev, script];
        });
    };

    const handleDeleteScript = (scriptId: string) => {
        setSavedScripts(prev => prev.filter(s => s.id !== scriptId));
    };

    const handleDuplicateScript = (scriptId: string) => {
        const scriptToDuplicate = savedScripts.find(s => s.id === scriptId);
        if(scriptToDuplicate) {
            const newScript = JSON.parse(JSON.stringify(scriptToDuplicate));
            newScript.id = `script-${Date.now()}`;
            newScript.name = `${newScript.name} (Copie)`;
            setSavedScripts(prev => [...prev, newScript]);
        }
    };
    
    const handleSaveOrUpdateIvrFlow = (flow: IvrFlow) => {
        setSavedIvrFlows(prev => {
            const index = prev.findIndex(f => f.id === flow.id);
            if(index > -1) {
                const updated = [...prev];
                updated[index] = flow;
                return updated;
            }
            return [...prev, flow];
        });
    };

    const handleDeleteIvrFlow = (flowId: string) => {
        setSavedIvrFlows(prev => prev.filter(f => f.id !== flowId));
    };
    
    const handleDuplicateIvrFlow = (flowId: string) => {
        const flowToDuplicate = savedIvrFlows.find(f => f.id === flowId);
        if (flowToDuplicate) {
            const newFlow = JSON.parse(JSON.stringify(flowToDuplicate));
            newFlow.id = `ivr-flow-${Date.now()}`;
            newFlow.name = `${newFlow.name} (Copie)`;
            setSavedIvrFlows(prev => [...prev, newFlow]);
        }
    };
    
    const handleSaveCampaign = (campaign: Campaign) => {
         setCampaigns(prev => {
            const index = prev.findIndex(c => c.id === campaign.id);
            if (index > -1) {
                const updated = [...prev];
                updated[index] = campaign;
                return updated;
            }
            return [...prev, campaign];
        });
    };

    const handleDeleteCampaign = (campaignId: string) => {
        setCampaigns(prev => prev.filter(c => c.id !== campaignId));
    };
    
    const handleImportContacts = (campaignId: string, newContacts: Contact[]) => {
        setCampaigns(prev => prev.map(c => {
            if (c.id === campaignId) {
                return { ...c, contacts: [...c.contacts, ...newContacts] };
            }
            return c;
        }));
    };
    
    const handleSaveQualification = (qual: Qualification) => {
        setQualifications(prev => {
            const index = prev.findIndex(q => q.id === qual.id);
            if (index > -1) {
                const updated = [...prev];
                updated[index] = qual;
                return updated;
            }
            return [...prev, qual];
        });
    };
    
    const handleDeleteQualification = (qualId: string) => {
        setQualifications(prev => prev.filter(q => q.id !== qualId));
        setQualificationGroups(prev => prev.map(g => {
            // Also remove from any group it might have been in
            const newQuals = qualifications.filter(q => q.groupId === g.id && q.id !== qualId);
            return g;
        }));
    };

    const handleSaveQualificationGroup = (group: QualificationGroup) => {
        setQualificationGroups(prev => {
            const index = prev.findIndex(g => g.id === group.id);
            if(index > -1) {
                const updated = [...prev];
                updated[index] = group;
                return updated;
            }
            return [...prev, group];
        })
    };
    
    const handleDeleteQualificationGroup = (groupId: string) => {
        setQualificationGroups(prev => prev.filter(g => g.id !== groupId));
        // Unassign qualifications from this group
        setQualifications(prev => prev.map(q => q.groupId === groupId ? {...q, groupId: null} : q));
    };

    const handleUpdateGroupQualifications = (groupId: string, assignedQualIds: string[]) => {
        setQualifications(prev => prev.map(q => {
            if (assignedQualIds.includes(q.id)) {
                return { ...q, groupId: groupId };
            }
            if (q.groupId === groupId && !assignedQualIds.includes(q.id)) {
                return { ...q, groupId: null };
            }
            return q;
        }));
    };

    const handleSaveTrunk = (trunk: Trunk) => {
        setTrunks(prev => {
            const index = prev.findIndex(t => t.id === trunk.id);
            if(index > -1) {
                const updated = [...prev];
                updated[index] = trunk;
                return updated;
            }
            return [...prev, trunk];
        });
    };

    const handleDeleteTrunk = (trunkId: string) => {
        setTrunks(prev => prev.filter(t => t.id !== trunkId));
    };
    
    const handleSaveDid = (did: Did) => {
        setDids(prev => {
            const index = prev.findIndex(d => d.id === did.id);
            if(index > -1) {
                const updated = [...prev];
                updated[index] = did;
                return updated;
            }
            return [...prev, did];
        });
    };
    
    const handleDeleteDid = (didId: string) => {
        setDids(prev => prev.filter(d => d.id !== didId));
    };

    const handleManualBackup = () => {
        const newLog: BackupLog = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            status: Math.random() > 0.1 ? 'success' : 'failure',
            fileName: `backup-manual-${new Date().toISOString().split('T')[0]}.zip`
        };
        setBackupLogs(prev => [newLog, ...prev]);
    };

    const handleUpdateSchedule = (schedule: BackupSchedule) => {
        setBackupSchedule(schedule);
    };

    const handleSaveAudioFile = (fileToSave: AudioFile) => {
        setAudioFiles(prev => {
            const index = prev.findIndex(f => f.id === fileToSave.id);
            if (index > -1) {
                const updated = [...prev];
                updated[index] = fileToSave;
                return updated;
            }
            return [fileToSave, ...prev];
        });
    };
    
    const handleDeleteAudioFile = (fileId: string) => {
        setAudioFiles(prev => prev.filter(f => f.id !== fileId));
    };

    // --- RENDER LOGIC ---
    if (!currentUser) {
        return <LoginScreen users={users} onLoginSuccess={setCurrentUser} />;
    }
    
    if (currentUser.role === 'Agent') {
        return <AgentView agent={currentUser} campaigns={campaigns} savedScripts={savedScripts} onLogout={() => setCurrentUser(null)} />;
    }
    
    const featureProps = {
        users,
        userGroups,
        savedScripts,
        ivrFlows: savedIvrFlows,
        campaigns,
        qualifications,
        qualificationGroups,
        trunks,
        dids,
        backupLogs,
        backupSchedule,
        systemLogs,
        versionInfo,
        connectivityServices,
        audioFiles,
        // Fix: Pass callHistory and agentSessions to feature components.
        callHistory,
        agentSessions,
        onSaveUser: handleSaveUser,
        onDeleteUser: handleDeleteUser,
        onGenerateUsers: handleGenerateUsers,
        onSaveUserGroup: handleSaveUserGroup,
        onDeleteUserGroup: handleDeleteUserGroup,
        onSaveOrUpdateScript: handleSaveOrUpdateScript,
        onDeleteScript: handleDeleteScript,
        onDuplicateScript: handleDuplicateScript,
        onSaveOrUpdateIvrFlow: handleSaveOrUpdateIvrFlow,
        onDeleteIvrFlow: handleDeleteIvrFlow,
        onDuplicateIvrFlow: handleDuplicateIvrFlow,
        onSaveCampaign: handleSaveCampaign,
        onDeleteCampaign: handleDeleteCampaign,
        onImportContacts: handleImportContacts,
        onSaveQualification: handleSaveQualification,
        onDeleteQualification: handleDeleteQualification,
        onSaveQualificationGroup: handleSaveQualificationGroup,
        onDeleteQualificationGroup: handleDeleteQualificationGroup,
        onUpdateGroupQualifications: handleUpdateGroupQualifications,
        onSaveTrunk: handleSaveTrunk,
        onDeleteTrunk: handleDeleteTrunk,
        onSaveDid: handleSaveDid,
        onDeleteDid: handleDeleteDid,
        onManualBackup: handleManualBackup,
        onUpdateSchedule: handleUpdateSchedule,
        onSaveAudioFile: handleSaveAudioFile,
        onDeleteAudioFile: handleDeleteAudioFile,
        currentUser
    };

    const renderMainContent = () => {
        if (activeView === 'monitoring') {
            return <MonitoringDashboard {...featureProps} />;
        }
        if (activeFeature && activeFeature.component) {
            const FeatureComponent = activeFeature.component;
            return <FeatureComponent feature={activeFeature} {...featureProps} />;
        }
        return <FeatureDetail feature={null} />;
    };

    return (
        <div className="h-screen w-screen flex flex-col font-sans bg-slate-100">
            <Header activeView={activeView} onViewChange={setActiveView} />
            <div className="flex-1 flex overflow-hidden">
                <Sidebar
                    features={features}
                    activeFeatureId={activeFeatureId}
                    onSelectFeature={setActiveFeatureId}
                    currentUser={currentUser}
                    onLogout={() => setCurrentUser(null)}
                />
                <main className="flex-1 p-8 overflow-y-auto">
                    {renderMainContent()}
                </main>
            </div>
        </div>
    );
};

export default App;