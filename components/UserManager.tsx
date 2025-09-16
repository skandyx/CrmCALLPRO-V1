import React, { useState, useEffect } from 'react';
// Fix: added .ts extension to import path
import type { Feature, User, UserRole, Campaign } from '../types.ts';
// Fix: added .tsx extension to import path
import { UsersIcon, PlusIcon, EditIcon, TrashIcon } from './Icons.tsx';

const generatePassword = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = Math.floor(Math.random() * 5) + 4; // 4 to 8 chars
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

interface UserModalProps {
    user: User;
    users: User[];
    campaigns: Campaign[];
    onSave: (user: User) => void;
    onClose: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, users, campaigns, onSave, onClose }) => {
    const [formData, setFormData] = useState<User>(user);
    const [isEmailEnabled, setIsEmailEnabled] = useState(!!user.email);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // If it's a new user, generate a password automatically
        if (user.id.startsWith('new-') && !formData.password) {
            setFormData(prev => ({ ...prev, password: generatePassword() }));
        }
    }, [user.id, formData.password]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (name === 'loginId') {
            setError(null);
        }
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };
    
    const handleCampaignChange = (campaignId: string, isChecked: boolean) => {
        setFormData(prev => {
            const currentCampaignIds = prev.campaignIds || [];
            if (isChecked) {
                return { ...prev, campaignIds: [...new Set([...currentCampaignIds, campaignId])] };
            } else {
                return { ...prev, campaignIds: currentCampaignIds.filter(id => id !== campaignId) };
            }
        });
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const loginIdExists = users.some(u => u.loginId === formData.loginId && u.id !== formData.id);
        if (loginIdExists) {
            setError("L'identifiant / extension existe déjà pour un autre utilisateur.");
            return;
        }
        
        const dataToSave = { ...formData };
        if (!isEmailEnabled) {
            dataToSave.email = '';
        }

        onSave(dataToSave);
    };
    
    const handleGeneratePassword = () => {
        setFormData(prev => ({ ...prev, password: generatePassword() }));
    };
    
    const handleToggleEmail = () => {
        setIsEmailEnabled(prev => {
            const isNowDisabled = prev; // The state before the change
            if (isNowDisabled) {
                setFormData(f => ({ ...f, email: '' }));
            }
            return !prev;
        });
    };

    return (
        <div className="fixed inset-0 bg-slate-800 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <form onSubmit={handleSubmit}>
                    <div className="p-6">
                        <h3 className="text-lg font-medium leading-6 text-slate-900">{user.id.startsWith('new-') ? 'Ajouter un nouvel utilisateur' : 'Modifier l\'utilisateur'}</h3>
                        <div className="mt-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">Prénom</label>
                                    <input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"/>
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">Nom</label>
                                    <input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleChange} required className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"/>
                                </div>
                            </div>
                             <div>
                                <label htmlFor="loginId" className="block text-sm font-medium text-slate-700">Identifiant / Extension</label>
                                <input
                                    type="text"
                                    name="loginId"
                                    id="loginId"
                                    value={formData.loginId}
                                    onChange={handleChange}
                                    required
                                    pattern="\d{4,6}"
                                    title="Doit contenir 4 à 6 chiffres."
                                    placeholder="Ex: 1001"
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                />
                                {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
                                <p className="mt-1 text-xs text-slate-500">Doit être un numéro unique de 4 à 6 chiffres.</p>
                            </div>
                             <div>
                                <div className="flex justify-between items-center">
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
                                    <button
                                        type="button"
                                        onClick={handleToggleEmail}
                                        className={`${isEmailEnabled ? 'bg-indigo-600' : 'bg-slate-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
                                        aria-pressed={isEmailEnabled}
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={`${isEmailEnabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                                        />
                                    </button>
                                </div>
                                <input 
                                    type="email" 
                                    name="email" 
                                    id="email" 
                                    value={formData.email || ''} 
                                    onChange={handleChange} 
                                    required={isEmailEnabled} 
                                    disabled={!isEmailEnabled}
                                    className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border disabled:bg-slate-50 disabled:text-slate-400"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700">Mot de passe</label>
                                <div className="mt-1 flex rounded-md shadow-sm">
                                    <input type="text" name="password" id="password" value={formData.password || ''} onChange={handleChange} required className="block w-full flex-1 rounded-none rounded-l-md border-slate-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"/>
                                    <button type="button" onClick={handleGeneratePassword} className="inline-flex items-center rounded-r-md border border-l-0 border-slate-300 bg-slate-50 px-3 text-sm text-slate-500 hover:bg-slate-100">
                                        Générer
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="role" className="block text-sm font-medium text-slate-700">Rôle</label>
                                <select id="role" name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border bg-white">
                                    <option>Agent</option>
                                    <option>Superviseur</option>
                                    <option>Administrateur</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Campagnes Assignées</label>
                                <div className="mt-2 max-h-40 overflow-y-auto rounded-md border border-slate-300 p-2 space-y-2 bg-slate-50">
                                    {campaigns.length > 0 ? campaigns.map(campaign => (
                                        <div key={campaign.id} className="flex items-center">
                                            <input
                                                id={`campaign-${campaign.id}`}
                                                name={campaign.name}
                                                type="checkbox"
                                                checked={formData.campaignIds?.includes(campaign.id) || false}
                                                onChange={(e) => handleCampaignChange(campaign.id, e.target.checked)}
                                                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                            />
                                            <label htmlFor={`campaign-${campaign.id}`} className="ml-3 text-sm text-slate-600">{campaign.name}</label>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-slate-500 italic">Aucune campagne disponible.</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="flex h-5 items-center">
                                    <input id="isActive" name="isActive" type="checkbox" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"/>
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="isActive" className="font-medium text-slate-700">Utilisateur Actif</label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 px-4 py-3 sm:flex sm:flex-row-reverse rounded-b-lg">
                        <button type="submit" className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm">
                            Enregistrer
                        </button>
                        <button type="button" onClick={onClose} className="mt-3 inline-flex w-full justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-base font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm">
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface UserManagerProps {
    feature: Feature;
    users: User[];
    campaigns: Campaign[];
    onSaveUser: (user: User) => void;
    onDeleteUser: (userId: string) => void;
    onGenerateUsers: (count: number) => void;
}

const UserManager: React.FC<UserManagerProps> = ({ feature, users, campaigns, onSaveUser, onDeleteUser, onGenerateUsers }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleAddNew = () => {
    setEditingUser({
        id: `new-${Date.now()}`,
        loginId: '',
        firstName: '',
        lastName: '',
        email: '',
        role: 'Agent',
        isActive: true,
        campaignIds: [],
        password: '',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };
  
  const handleSave = (user: User) => {
    onSaveUser(user);
    setIsModalOpen(false);
    setEditingUser(null);
  };
  
  const handleImport = () => {
    alert("Fonctionnalité d'importation CSV. Dans une application réelle, cela ouvrirait une boîte de dialogue pour sélectionner un fichier à téléverser.");
  };

  const handleMassGenerateClick = () => {
    const countStr = prompt("Combien d'utilisateurs souhaitez-vous créer ? (max 100)", "10");
    if (countStr === null) {
        return; // User cancelled
    }
    const count = parseInt(countStr, 10);
    if (isNaN(count) || count <= 0 || count > 100) {
        alert("Veuillez entrer un nombre valide entre 1 et 100.");
        return;
    }
    onGenerateUsers(count);
  };

  const getDeletionState = (user: User): { canDelete: boolean; tooltip: string } => {
    if (user.isActive) {
      return { canDelete: false, tooltip: "Désactivez l'utilisateur pour pouvoir le supprimer." };
    }
    
    const isAdmin = user.role === 'Administrateur';
    if (isAdmin) {
      const adminCount = users.filter(u => u.role === 'Administrateur').length;
      if (adminCount <= 1) {
        return { canDelete: false, tooltip: "Impossible de supprimer le dernier administrateur." };
      }
    }
    
    return { canDelete: true, tooltip: "Supprimer l'utilisateur" };
  };


  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {isModalOpen && editingUser && <UserModal user={editingUser} users={users} campaigns={campaigns} onSave={handleSave} onClose={() => setIsModalOpen(false)} />}
      <header>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">{feature.title}</h1>
        <p className="mt-2 text-lg text-slate-600">{feature.description}</p>
      </header>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-slate-800">Utilisateurs</h2>
          <div className="flex flex-wrap gap-2">
            <button onClick={handleImport} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg shadow-sm transition-colors">
              Importer (CSV)
            </button>
             <button onClick={handleMassGenerateClick} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 px-4 rounded-lg shadow-sm transition-colors">
              Générer en masse
            </button>
            <button onClick={handleAddNew} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-colors inline-flex items-center">
              <PlusIcon className="w-5 h-5 mr-2" />
              Ajouter un utilisateur
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nom</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Identifiant / Ext.</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Rôle</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Statut</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {users.map(user => {
                const { canDelete, tooltip } = getDeletionState(user);
                return (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 bg-slate-200 rounded-full flex items-center justify-center">
                          <UsersIcon className="h-6 w-6 text-slate-500"/>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">{user.firstName} {user.lastName}</div>
                          <div className="text-sm text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-500">{user.loginId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                        {user.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                      <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"><EditIcon className="w-4 h-4 mr-1"/> Modifier</button>
                      <button 
                          onClick={() => onDeleteUser(user.id)} 
                          className={`inline-flex items-center ${!canDelete ? 'text-slate-400 cursor-not-allowed' : 'text-red-600 hover:text-red-900'}`}
                          disabled={!canDelete}
                          title={tooltip}
                      >
                          <TrashIcon className="w-4 h-4 mr-1"/> Supprimer
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManager;