import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Radio, RefreshCw, Loader2, ShieldAlert, Save, Users, AlertTriangle, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const FIX_SQL = `-- Run ALL of these in Supabase Dashboard > SQL Editor:

-- Allow anonymous reads on profiles (for admin setup)
CREATE POLICY "profiles_select_anon" ON public.profiles
  FOR SELECT TO anon
  USING (true);

-- Allow any authenticated user to update any profile role
CREATE POLICY "profiles_update_any_authenticated" ON public.profiles
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);`;

export default function AdminSetup() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [pendingChanges, setPendingChanges] = useState({});
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function fetchProfiles() {
    setLoading(true);
    setFetchError(null);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setProfiles(data || []);
      setPendingChanges({});
    } catch (error) {
      setFetchError(error.message);
      toast.error('Failed to load profiles — see instructions below.');
    } finally {
      setLoading(false);
    }
  }

  function handleRoleChange(userId, newRole) {
    setPendingChanges(prev => ({ ...prev, [userId]: newRole }));
  }

  async function saveRole(userId) {
    const newRole = pendingChanges[userId];
    if (!newRole) return;

    setSaving(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      setProfiles(prev => prev.map(p => p.id === userId ? { ...p, role: newRole } : p));
      setPendingChanges(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
      toast.success('Role updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update role. Run the SQL fix below.');
    } finally {
      setSaving(null);
    }
  }

  const getRoleBadge = (role) => {
    const styles = {
      principal: 'bg-slate-900 text-white',
      teacher: 'bg-teal-500 text-white',
      viewer: 'bg-blue-500 text-white',
    };
    return <Badge className={`${styles[role] || 'bg-gray-500 text-white'} text-xs capitalize`}>{role}</Badge>;
  };

  const copySQL = () => {
    navigator.clipboard.writeText(FIX_SQL);
    toast.success('SQL copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 p-1.5 rounded-lg">
              <ShieldAlert className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight">Admin Setup</span>
          </div>
          <Link to="/">
            <div className="flex items-center gap-2 text-white/40 hover:text-white/60 transition-colors">
              <Radio className="h-4 w-4" />
              <span className="text-sm font-bold">StreamPro</span>
            </div>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Warning banner */}
        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl mb-8">
          <ShieldAlert className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-300">Bootstrap Admin Panel</p>
            <p className="text-xs text-amber-300/60 mt-1 leading-relaxed">
              This page directly reads and updates the <code className="bg-white/10 px-1.5 py-0.5 rounded text-amber-200">profiles</code> table.
              Use it to promote the first user to <strong>principal</strong>. Remove this route before production.
            </p>
          </div>
        </div>

        {/* Error state with SQL fix */}
        {fetchError && (
          <div className="mb-8 p-5 bg-rose-500/10 border border-rose-500/20 rounded-xl space-y-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-rose-300">Cannot read profiles table</p>
                <p className="text-xs text-rose-300/60 mt-1">
                  Error: <code className="bg-white/10 px-1.5 py-0.5 rounded text-rose-200">{fetchError}</code>
                </p>
                <p className="text-xs text-rose-300/60 mt-2">
                  This happens because Row Level Security blocks reads. Run the SQL below in your <strong>Supabase Dashboard → SQL Editor</strong> to fix it:
                </p>
              </div>
            </div>
            <div className="relative">
              <pre className="bg-black/40 border border-white/10 rounded-lg p-4 text-xs text-teal-300 font-mono whitespace-pre-wrap overflow-x-auto">
                {FIX_SQL}
              </pre>
              <Button
                variant="ghost"
                size="sm"
                onClick={copySQL}
                className="absolute top-2 right-2 h-8 gap-1.5 text-white/40 hover:text-white hover:bg-white/10"
              >
                <Copy className="h-3 w-3" />
                Copy
              </Button>
            </div>
            <p className="text-xs text-rose-300/40">After running the SQL, click <strong className="text-rose-200">Refresh</strong> below.</p>
          </div>
        )}

        {/* Title + Refresh */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">User Profiles</h1>
            <p className="text-white/40 text-sm mt-1">{profiles.length} user(s) in the database</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchProfiles}
            className="gap-2 border-white/10 text-white/60 hover:text-white hover:bg-white/5"
            disabled={loading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Table */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow className="border-white/[0.06] hover:bg-transparent">
                <TableHead className="text-white/50 font-semibold">User</TableHead>
                <TableHead className="text-white/50 font-semibold">Email</TableHead>
                <TableHead className="text-white/50 font-semibold">Current Role</TableHead>
                <TableHead className="text-white/50 font-semibold">Change To</TableHead>
                <TableHead className="text-white/50 font-semibold text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <TableRow key={i} className="border-white/[0.04]">
                    <TableCell><div className="h-5 w-28 bg-white/5 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-5 w-36 bg-white/5 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-5 w-16 bg-white/5 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-5 w-24 bg-white/5 animate-pulse rounded" /></TableCell>
                    <TableCell><div className="h-5 w-16 bg-white/5 animate-pulse rounded ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : profiles.length === 0 ? (
                <TableRow className="border-white/[0.04]">
                  <TableCell colSpan={5} className="h-40 text-center">
                    <div className="flex flex-col items-center gap-2 text-white/30">
                      <Users className="h-8 w-8" />
                      <p className="font-medium">No users found</p>
                      <p className="text-xs text-white/20">Sign up on the auth page first, then refresh this table.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                profiles.map((profile) => {
                  const hasPending = pendingChanges[profile.id] && pendingChanges[profile.id] !== profile.role;
                  return (
                    <TableRow key={profile.id} className="border-white/[0.04] hover:bg-white/[0.02]">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {profile.full_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className="font-medium text-white truncate max-w-[140px]">
                            {profile.full_name || 'Unnamed'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-white/60 text-sm">{profile.email}</TableCell>
                      <TableCell>{getRoleBadge(profile.role)}</TableCell>
                      <TableCell>
                        <Select
                          value={pendingChanges[profile.id] || profile.role}
                          onValueChange={(val) => handleRoleChange(profile.id, val)}
                        >
                          <SelectTrigger className="w-[130px] h-9 bg-white/[0.04] border-white/[0.08] text-white text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="viewer">Viewer</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="principal">Principal</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          disabled={!hasPending || saving === profile.id}
                          onClick={() => saveRole(profile.id)}
                          className={`gap-1.5 ${hasPending ? 'bg-teal-500 hover:bg-teal-600 text-white' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                        >
                          {saving === profile.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Save className="h-3.5 w-3.5" />
                          )}
                          Save
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Instructions */}
        <div className="mt-8 p-5 bg-white/[0.02] border border-white/[0.06] rounded-xl">
          <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Quick Start Guide</p>
          <ol className="space-y-2 text-sm text-white/50">
            <li className="flex gap-2">
              <span className="text-teal-400 font-bold flex-shrink-0">1.</span>
              <strong className="text-white/70">if you are a  <strong className="text-white/70">tester then -</strong></strong>
            </li>
            <li className="flex gap-2">
              <span className="text-teal-400 font-bold flex-shrink-0">2.</span>
              Sign up on the <Link to="/auth" className="text-teal-400 hover:underline">/auth</Link> page with your email.
            </li>
            <li className="flex gap-2">
              <span className="text-teal-400 font-bold flex-shrink-0">3.</span>
              Come back here and click <strong className="text-white/70">Refresh</strong>.
            </li>
            <li className="flex gap-2">
              <span className="text-teal-400 font-bold flex-shrink-0">4.</span>
              Change your role to <strong className="text-white/70">Principal</strong> and click <strong className="text-white/70">Save</strong>.
            </li>
            <li className="flex gap-2">
              <span className="text-teal-400 font-bold flex-shrink-0">5.</span>
              Log out and log back in — you'll now have the principal dashboard.
            </li>
            <li className="flex gap-2">
              <span className="text-teal-400 font-bold flex-shrink-0">6.</span>
              Use <strong className="text-white/70">Manage Staff</strong> from your dashboard to create teacher accounts.
            </li>
          </ol>
        </div>

        <p className="text-center text-[11px] text-white/15 mt-10">
          Remove the /admin/setup route before deploying to production.
        </p>
      </div>
    </div>
  );
}
