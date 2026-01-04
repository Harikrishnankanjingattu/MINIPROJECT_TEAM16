import { db } from '../firebase';
import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    serverTimestamp,
    doc,
    updateDoc,
    deleteDoc
} from 'firebase/firestore';

// Collections
const LEADS_COLLECTION = 'leads';
const CAMPAIGNS_COLLECTION = 'campaigns';
const USERS_COLLECTION = 'users';

// Lead Management
export const addLead = async (leadData, userId) => {
    try {
        const docRef = await addDoc(collection(db, LEADS_COLLECTION), {
            ...leadData,
            userId: userId, // Associate lead with user
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error adding lead:', error);
        return { success: false, error: error.message };
    }
};

export const getLeads = async (userId) => {
    try {
        // Filter leads by userId
        const q = query(
            collection(db, LEADS_COLLECTION),
            orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const leads = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Only include leads for this user
            if (data.userId === userId) {
                leads.push({ id: doc.id, ...data });
            }
        });
        return leads;
    } catch (error) {
        console.error('Error getting leads:', error);
        return [];
    }
};

export const deleteLead = async (leadId) => {
    try {
        await deleteDoc(doc(db, LEADS_COLLECTION, leadId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting lead:', error);
        return { success: false, error: error.message };
    }
};

// Campaign Management
export const addCampaign = async (campaignData, userId) => {
    try {
        const docRef = await addDoc(collection(db, CAMPAIGNS_COLLECTION), {
            ...campaignData,
            userId: userId, // Associate campaign with user
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return { success: true, id: docRef.id };
    } catch (error) {
        console.error('Error adding campaign:', error);
        return { success: false, error: error.message };
    }
};

export const getCampaigns = async (userId) => {
    try {
        const q = query(collection(db, CAMPAIGNS_COLLECTION), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const campaigns = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Only include campaigns for this user
            if (data.userId === userId) {
                campaigns.push({ id: doc.id, ...data });
            }
        });
        return campaigns;
    } catch (error) {
        console.error('Error getting campaigns:', error);
        return [];
    }
};

export const updateCampaign = async (campaignId, updates) => {
    try {
        const campaignRef = doc(db, CAMPAIGNS_COLLECTION, campaignId);
        await updateDoc(campaignRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating campaign:', error);
        return { success: false, error: error.message };
    }
};

export const deleteCampaign = async (campaignId) => {
    try {
        await deleteDoc(doc(db, CAMPAIGNS_COLLECTION, campaignId));
        return { success: true };
    } catch (error) {
        console.error('Error deleting campaign:', error);
        return { success: false, error: error.message };
    }
};

// User Management
export const getUsers = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
        const users = [];
        querySnapshot.forEach((doc) => {
            users.push({ id: doc.id, ...doc.data() });
        });
        return users;
    } catch (error) {
        console.error('Error getting users:', error);
        return [];
    }
};

// Analytics
export const getAnalytics = async (userId) => {
    try {
        const [leads, users, campaigns] = await Promise.all([
            getLeads(userId),
            getUsers(),
            getCampaigns(userId) // Pass userId to get user-specific campaigns
        ]);

        return {
            totalLeads: leads.length,
            totalUsers: users.length,
            totalCampaigns: campaigns.length,
            recentLeads: leads.slice(0, 5)
        };
    } catch (error) {
        console.error('Error getting analytics:', error);
        return {
            totalLeads: 0,
            totalUsers: 0,
            totalCampaigns: 0,
            recentLeads: []
        };
    }
};
