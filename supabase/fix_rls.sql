-- LinkLayer Database Schema - Fixed RLS Policies
-- Run this in Supabase SQL Editor

-- =====================================================
-- DROP EXISTING POLICIES (if needed)
-- =====================================================
DROP POLICY IF EXISTS "Vault owners can view their vaults" ON public.vaults;
DROP POLICY IF EXISTS "Vault members can view shared vaults" ON public.vaults;
DROP POLICY IF EXISTS "Authenticated users can create vaults" ON public.vaults;
DROP POLICY IF EXISTS "Vault owners can update their vaults" ON public.vaults;
DROP POLICY IF EXISTS "Vault owners can delete their vaults" ON public.vaults;

-- =====================================================
-- SIMPLIFIED VAULTS POLICIES
-- =====================================================

-- Allow users to read their own vaults and vaults they are members of
CREATE POLICY "vaults_select_policy" ON public.vaults
  FOR SELECT USING (
    owner_id = auth.uid()
    OR id IN (SELECT vault_id FROM public.vault_members WHERE user_id = auth.uid())
  );

-- Allow authenticated users to create vaults
CREATE POLICY "vaults_insert_policy" ON public.vaults
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Allow owners to update their vaults
CREATE POLICY "vaults_update_policy" ON public.vaults
  FOR UPDATE USING (auth.uid() = owner_id);

-- Allow owners to delete their vaults
CREATE POLICY "vaults_delete_policy" ON public.vaults
  FOR DELETE USING (auth.uid() = owner_id);

-- =====================================================
-- SIMPLIFIED NOTES POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Vault members can view notes" ON public.notes;
DROP POLICY IF EXISTS "Vault members can create notes" ON public.notes;
DROP POLICY IF EXISTS "Vault members can update notes" ON public.notes;
DROP POLICY IF EXISTS "Vault members can delete notes" ON public.notes;

CREATE POLICY "notes_select_policy" ON public.notes
  FOR SELECT USING (
    vault_id IN (SELECT id FROM public.vaults WHERE owner_id = auth.uid())
    OR vault_id IN (SELECT vault_id FROM public.vault_members WHERE user_id = auth.uid())
  );

CREATE POLICY "notes_insert_policy" ON public.notes
  FOR INSERT WITH CHECK (
    vault_id IN (SELECT id FROM public.vaults WHERE owner_id = auth.uid())
    OR vault_id IN (SELECT vault_id FROM public.vault_members WHERE user_id = auth.uid())
  );

CREATE POLICY "notes_update_policy" ON public.notes
  FOR UPDATE USING (
    vault_id IN (SELECT id FROM public.vaults WHERE owner_id = auth.uid())
    OR vault_id IN (SELECT vault_id FROM public.vault_members WHERE user_id = auth.uid())
  );

CREATE POLICY "notes_delete_policy" ON public.notes
  FOR DELETE USING (
    vault_id IN (SELECT id FROM public.vaults WHERE owner_id = auth.uid())
    OR vault_id IN (SELECT vault_id FROM public.vault_members WHERE user_id = auth.uid())
  );

-- =====================================================
-- SIMPLIFIED VAULT_MEMBERS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Members can view their vault memberships" ON public.vault_members;
DROP POLICY IF EXISTS "Vault owners can manage members" ON public.vault_members;

CREATE POLICY "vault_members_select_policy" ON public.vault_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "vault_members_insert_policy" ON public.vault_members
  FOR INSERT WITH CHECK (
    vault_id IN (SELECT id FROM public.vaults WHERE owner_id = auth.uid())
  );

CREATE POLICY "vault_members_delete_policy" ON public.vault_members
  FOR DELETE USING (
    vault_id IN (SELECT id FROM public.vaults WHERE owner_id = auth.uid())
  );

-- =====================================================
-- SIMPLIFIED PROFILES POLICY
-- =====================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- =====================================================
-- SIMPLIFIED TAGS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Vault members can view tags" ON public.tags;
DROP POLICY IF EXISTS "Vault members can create tags" ON public.tags;
DROP POLICY IF EXISTS "Vault members can update tags" ON public.tags;
DROP POLICY IF EXISTS "Vault members can delete tags" ON public.tags;

CREATE POLICY "tags_select_policy" ON public.tags
  FOR SELECT USING (
    vault_id IN (SELECT id FROM public.vaults WHERE owner_id = auth.uid())
    OR vault_id IN (SELECT vault_id FROM public.vault_members WHERE user_id = auth.uid())
  );

CREATE POLICY "tags_insert_policy" ON public.tags
  FOR INSERT WITH CHECK (
    vault_id IN (SELECT id FROM public.vaults WHERE owner_id = auth.uid())
    OR vault_id IN (SELECT vault_id FROM public.vault_members WHERE user_id = auth.uid())
  );

CREATE POLICY "tags_update_policy" ON public.tags
  FOR UPDATE USING (
    vault_id IN (SELECT id FROM public.vaults WHERE owner_id = auth.uid())
    OR vault_id IN (SELECT vault_id FROM public.vault_members WHERE user_id = auth.uid())
  );

CREATE POLICY "tags_delete_policy" ON public.tags
  FOR DELETE USING (
    vault_id IN (SELECT id FROM public.vaults WHERE owner_id = auth.uid())
    OR vault_id IN (SELECT vault_id FROM public.vault_members WHERE user_id = auth.uid())
  );

-- =====================================================
-- SIMPLIFIED LINKS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Links are viewable with notes" ON public.links;
DROP POLICY IF EXISTS "Vault members can create links" ON public.links;
DROP POLICY IF EXISTS "Vault members can delete links" ON public.links;

CREATE POLICY "links_select_policy" ON public.links
  FOR SELECT USING (
    source_note_id IN (SELECT id FROM public.notes WHERE vault_id IN (SELECT id FROM public.vaults WHERE owner_id = auth.uid()))
    OR source_note_id IN (SELECT id FROM public.notes WHERE vault_id IN (SELECT vault_id FROM public.vault_members WHERE user_id = auth.uid()))
  );

CREATE POLICY "links_insert_policy" ON public.links
  FOR INSERT WITH CHECK (
    source_note_id IN (SELECT id FROM public.notes WHERE vault_id IN (SELECT id FROM public.vaults WHERE owner_id = auth.uid()))
    OR source_note_id IN (SELECT id FROM public.notes WHERE vault_id IN (SELECT vault_id FROM public.vault_members WHERE user_id = auth.uid()))
  );

CREATE POLICY "links_delete_policy" ON public.links
  FOR DELETE USING (
    source_note_id IN (SELECT id FROM public.notes WHERE vault_id IN (SELECT id FROM public.vaults WHERE owner_id = auth.uid()))
    OR source_note_id IN (SELECT id FROM public.notes WHERE vault_id IN (SELECT vault_id FROM public.vault_members WHERE user_id = auth.uid()))
  );

-- =====================================================
-- SIMPLIFIED CHAT POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Vault members can view chat" ON public.chat_messages;
DROP POLICY IF EXISTS "Vault members can send messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Users can delete own messages" ON public.chat_messages;

CREATE POLICY "chat_select_policy" ON public.chat_messages
  FOR SELECT USING (
    vault_id IN (SELECT id FROM public.vaults WHERE owner_id = auth.uid())
    OR vault_id IN (SELECT vault_id FROM public.vault_members WHERE user_id = auth.uid())
  );

CREATE POLICY "chat_insert_policy" ON public.chat_messages
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "chat_delete_policy" ON public.chat_messages
  FOR DELETE USING (user_id = auth.uid());

-- =====================================================
-- SIMPLIFIED NOTE_TAGS POLICIES
-- =====================================================
DROP POLICY IF EXISTS "Note tags are viewable with notes" ON public.note_tags;
DROP POLICY IF EXISTS "Vault members can manage note tags" ON public.note_tags;

CREATE POLICY "note_tags_select_policy" ON public.note_tags
  FOR SELECT USING (
    note_id IN (SELECT id FROM public.notes WHERE vault_id IN (SELECT id FROM public.vaults WHERE owner_id = auth.uid()))
    OR note_id IN (SELECT id FROM public.notes WHERE vault_id IN (SELECT vault_id FROM public.vault_members WHERE user_id = auth.uid()))
  );

CREATE POLICY "note_tags_policy" ON public.note_tags
  FOR ALL USING (
    note_id IN (SELECT id FROM public.notes WHERE vault_id IN (SELECT id FROM public.vaults WHERE owner_id = auth.uid()))
    OR note_id IN (SELECT id FROM public.notes WHERE vault_id IN (SELECT vault_id FROM public.vault_members WHERE user_id = auth.uid()))
  );
