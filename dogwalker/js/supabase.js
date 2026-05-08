// Walkie Supabase Integration
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const SUPABASE_URL = "https://smzgfffeehrozxsqtgqa.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtemdmZmZlZWhyb3p4c3F0Z3FhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyNTU4NTYsImV4cCI6MjA3NDgzMTg1Nn0.LvIQLvj7HO7xXJhTALLO5GeYZ1DU50L3q8Act5wXfi4";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const db = {
    async getDogs() {
        const { data, error } = await supabase.from('walkie_dogs').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async addDog(dog) {
        const { data, error } = await supabase.from('walkie_dogs').insert([dog]).select();
        if (error) throw error;
        return data[0];
    },

    async updateDog(id, updates) {
        const { data, error } = await supabase.from('walkie_dogs').update(updates).eq('id', id).select();
        if (error) throw error;
        return data[0];
    },

    async deleteDog(id) {
        const { error } = await supabase.from('walkie_dogs').delete().eq('id', id);
        if (error) throw error;
    },

    async getWalks() {
        const { data, error } = await supabase.from('walkie_walks').select('*').order('walk_time', { ascending: true });
        if (error) throw error;
        return data;
    },

    async addWalk(walk) {
        const { data, error } = await supabase.from('walkie_walks').insert([walk]).select();
        if (error) throw error;
        return data[0];
    },

    async deleteWalk(id) {
        const { error } = await supabase.from('walkie_walks').delete().eq('id', id);
        if (error) throw error;
    },

    async updateWalk(id, updates) {
        const { data, error } = await supabase.from('walkie_walks').update(updates).eq('id', id).select();
        if (error) throw error;
        return data[0];
    },

    async getReports() {
        const { data, error } = await supabase.from('walkie_reports').select('*').order('timestamp', { ascending: false });
        if (error) throw error;
        return data;
    },

    async addReport(report) {
        const { data, error } = await supabase.from('walkie_reports').insert([report]).select();
        if (error) throw error;
        return data[0];
    },

    async deleteReport(id) {
        const { error } = await supabase.from('walkie_reports').delete().eq('id', id);
        if (error) throw error;
    },

    async clearAllData() {
        // Warning: This is a heavy operation if there are many records
        await supabase.from('walkie_reports').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('walkie_walks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('walkie_dogs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    },

    async getSettings() {
        const { data, error } = await supabase.from('walkie_settings').select('*');
        if (error) throw error;
        // Transform array of {id, value} to single object
        const settings = {};
        data.forEach(item => settings[item.id] = item.value);
        return settings;
    },

    async saveSetting(id, value) {
        const { error } = await supabase.from('walkie_settings').upsert({ id, value, updated_at: new Date().toISOString() });
        if (error) throw error;
    }
};
