import { db } from '../lib/firebase';
import {
  collection, addDoc, getDocs, query, orderBy,
  serverTimestamp, doc, updateDoc, deleteDoc, where
} from 'firebase/firestore';

const LEADS_COLLECTION = 'leads';
const CAMPAIGNS_COLLECTION = 'campaigns';
const USERS_COLLECTION = 'users';
const HISTORY_COLLECTION = 'history';
const PRODUCTS_COLLECTION = 'products';

export const addLead = async (leadData: any, userId: string) => {
  try {
    const docRef = await addDoc(collection(db, LEADS_COLLECTION), {
      ...leadData, userId, createdAt: serverTimestamp(), updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Error adding lead:', error);
    return { success: false, error: error.message };
  }
};

export const getLeads = async (userId: string) => {
  try {
    const q = query(
      collection(db, LEADS_COLLECTION),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const leads: any[] = [];
    querySnapshot.forEach((doc) => {
      leads.push({ id: doc.id, ...doc.data() });
    });
    // Client-side sort to avoid index requirement
    return leads.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  } catch (error) {
    console.error('Error getting leads:', error);
    return [];
  }
};

export const getAllLeads = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, LEADS_COLLECTION));
    const leads: any[] = [];
    querySnapshot.forEach((doc) => { leads.push({ id: doc.id, ...doc.data() }); });
    return leads;
  } catch (error) {
    console.error('Error getting all leads:', error);
    return [];
  }
};

export const deleteLead = async (leadId: string) => {
  try {
    await deleteDoc(doc(db, LEADS_COLLECTION, leadId));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const addCampaign = async (campaignData: any, userId: string) => {
  try {
    const docRef = await addDoc(collection(db, CAMPAIGNS_COLLECTION), {
      ...campaignData, userId, createdAt: serverTimestamp(), updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getCampaigns = async (userId: string) => {
  try {
    const q = query(
      collection(db, CAMPAIGNS_COLLECTION),
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const campaigns: any[] = [];
    querySnapshot.forEach((doc) => {
      campaigns.push({ id: doc.id, ...doc.data() });
    });
    // Client-side sort
    return campaigns.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  } catch (error) {
    return [];
  }
};

export const getAllCampaigns = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, CAMPAIGNS_COLLECTION));
    const campaigns: any[] = [];
    querySnapshot.forEach((doc) => { campaigns.push({ id: doc.id, ...doc.data() }); });
    return campaigns;
  } catch (error) {
    console.error('Error getting all campaigns:', error);
    return [];
  }
};

export const updateCampaign = async (campaignId: string, updates: any) => {
  try {
    await updateDoc(doc(db, CAMPAIGNS_COLLECTION, campaignId), { ...updates, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const deleteCampaign = async (campaignId: string) => {
  try {
    await deleteDoc(doc(db, CAMPAIGNS_COLLECTION, campaignId));
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getUsers = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, USERS_COLLECTION));
    const users: any[] = [];
    querySnapshot.forEach((doc) => { users.push({ id: doc.id, ...doc.data() }); });
    return users;
  } catch (error) {
    return [];
  }
};

export const updateUserProfile = async (userId: string, profileData: any) => {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, userId), { ...profileData, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getAnalytics = async (userId: string) => {
  try {
    const [leads, users, campaigns] = await Promise.all([
      getLeads(userId), getUsers(), getCampaigns(userId)
    ]);
    return {
      totalLeads: leads.length,
      totalUsers: users.length,
      totalCampaigns: campaigns.length,
      recentLeads: leads.slice(0, 5)
    };
  } catch (error) {
    return { totalLeads: 0, totalUsers: 0, totalCampaigns: 0, recentLeads: [] };
  }
};

export const addCallHistory = async (userId: string, callData: any) => {
  try {
    const docRef = await addDoc(collection(db, HISTORY_COLLECTION), {
      ...callData, userId, createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const getCallHistory = async (userId: string) => {
  try {
    const q = query(collection(db, HISTORY_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const history: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.userId === userId) history.push({ id: doc.id, ...data });
    });
    return history;
  } catch (error) {
    return [];
  }
};

export const addProduct = async (productData: any, userId: string) => {
  try {
    const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      ...productData, userId, createdAt: serverTimestamp(), updatedAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Error adding product:', error);
    return { success: false, error: error.message };
  }
};

export const getProducts = async (userId: string) => {
  try {
    const q = query(
      collection(db, PRODUCTS_COLLECTION), 
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    const products: any[] = [];
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() });
    });
    // Sort client-side to avoid composite index requirement
    return products.sort((a, b) => {
      const dateA = a.createdAt?.seconds || 0;
      const dateB = b.createdAt?.seconds || 0;
      return dateB - dateA;
    });
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
};

export const getAllProducts = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, PRODUCTS_COLLECTION));
    const products: any[] = [];
    querySnapshot.forEach((doc) => { products.push({ id: doc.id, ...doc.data() }); });
    return products;
  } catch (error) {
    console.error('Error getting all products:', error);
    return [];
  }
};

export const updateProduct = async (productId: string, updates: any) => {
  try {
    await updateDoc(doc(db, PRODUCTS_COLLECTION, productId), { ...updates, updatedAt: serverTimestamp() });
    return { success: true };
  } catch (error: any) {
    console.error('Error updating product:', error);
    return { success: false, error: error.message };
  }
};

export const deleteProduct = async (productId: string) => {
  try {
    await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return { success: false, error: error.message };
  }
};
