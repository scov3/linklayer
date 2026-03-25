-- LinkLayer Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS (extends Supabase auth.users)
-- =====================================================
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    email TEXT,
    auth_provider TEXT DEFAULT 'email',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, auth_provider)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.app_metadata->>'provider', 'email')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- VAULTS
-- =====================================================
CREATE TABLE public.vaults (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_shared BOOLEAN DEFAULT FALSE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vaults_owner ON public.vaults(owner_id);

-- =====================================================
-- NOTES
-- =====================================================
CREATE TABLE public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vault_id UUID NOT NULL REFERENCES public.vaults(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled',
    content TEXT DEFAULT '',
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notes_vault ON public.notes(vault_id);
CREATE INDEX idx_notes_created_by ON public.notes(created_by);
CREATE INDEX idx_notes_updated ON public.notes(updated_at DESC);

-- =====================================================
-- TAGS
-- =====================================================
CREATE TABLE public.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vault_id UUID NOT NULL REFERENCES public.vaults(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#6366f1',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(vault_id, name)
);

CREATE INDEX idx_tags_vault ON public.tags(vault_id);

-- =====================================================
-- NOTE_TAGS (junction table)
-- =====================================================
CREATE TABLE public.note_tags (
    note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);

CREATE INDEX idx_note_tags_note ON public.note_tags(note_id);
CREATE INDEX idx_note_tags_tag ON public.note_tags(tag_id);

-- =====================================================
-- LINKS
-- =====================================================
CREATE TABLE public.links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    target_note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    link_type TEXT DEFAULT 'reference',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(source_note_id, target_note_id),
    CHECK (source_note_id != target_note_id)
);

CREATE INDEX idx_links_source ON public.links(source_note_id);
CREATE INDEX idx_links_target ON public.links(target_note_id);

-- =====================================================
-- VAULT_MEMBERS
-- =====================================================
CREATE TABLE public.vault_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vault_id UUID NOT NULL REFERENCES public.vaults(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('owner', 'editor', 'viewer')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(vault_id, user_id)
);

CREATE INDEX idx_vault_members_vault ON public.vault_members(vault_id);
CREATE INDEX idx_vault_members_user ON public.vault_members(user_id);

-- Auto-add owner as member when vault is created
CREATE OR REPLACE FUNCTION public.handle_vault_created()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.vault_members (vault_id, user_id, role)
    VALUES (NEW.id, NEW.owner_id, 'owner');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_vault_created
    AFTER INSERT ON public.vaults
    FOR EACH ROW EXECUTE FUNCTION public.handle_vault_created();

-- =====================================================
-- CHAT_MESSAGES
-- =====================================================
CREATE TABLE public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vault_id UUID NOT NULL REFERENCES public.vaults(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attached_note_id UUID REFERENCES public.notes(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_vault ON public.chat_messages(vault_id);
CREATE INDEX idx_chat_created ON public.chat_messages(created_at DESC);

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_vaults_updated_at
    BEFORE UPDATE ON public.vaults
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON public.notes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaults ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vault_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can view other profiles"
    ON public.profiles FOR SELECT
    USING (TRUE);

-- VAULTS policies
CREATE POLICY "Vault owners can view their vaults"
    ON public.vaults FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Vault members can view shared vaults"
    ON public.vaults FOR SELECT
    USING (
        id IN (
            SELECT vault_id FROM public.vault_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can create vaults"
    ON public.vaults FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Vault owners can update their vaults"
    ON public.vaults FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Vault owners can delete their vaults"
    ON public.vaults FOR DELETE
    USING (auth.uid() = owner_id);

-- NOTES policies
CREATE POLICY "Vault members can view notes"
    ON public.notes FOR SELECT
    USING (
        vault_id IN (
            SELECT vault_id FROM public.vault_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Vault members can create notes"
    ON public.notes FOR INSERT
    WITH CHECK (
        vault_id IN (
            SELECT vault_id FROM public.vault_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Vault members can update notes"
    ON public.notes FOR UPDATE
    USING (
        vault_id IN (
            SELECT vault_id FROM public.vault_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Vault members can delete notes"
    ON public.notes FOR DELETE
    USING (
        vault_id IN (
            SELECT vault_id FROM public.vault_members
            WHERE user_id = auth.uid()
        )
    );

-- TAGS policies
CREATE POLICY "Vault members can view tags"
    ON public.tags FOR SELECT
    USING (
        vault_id IN (
            SELECT vault_id FROM public.vault_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Vault members can create tags"
    ON public.tags FOR INSERT
    WITH CHECK (
        vault_id IN (
            SELECT vault_id FROM public.vault_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Vault members can update tags"
    ON public.tags FOR UPDATE
    USING (
        vault_id IN (
            SELECT vault_id FROM public.vault_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Vault members can delete tags"
    ON public.tags FOR DELETE
    USING (
        vault_id IN (
            SELECT vault_id FROM public.vault_members
            WHERE user_id = auth.uid()
        )
    );

-- NOTE_TAGS policies
CREATE POLICY "Note tags are viewable with notes"
    ON public.note_tags FOR SELECT
    USING (
        note_id IN (
            SELECT id FROM public.notes
            WHERE vault_id IN (
                SELECT vault_id FROM public.vault_members
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Vault members can manage note tags"
    ON public.note_tags FOR ALL
    USING (
        note_id IN (
            SELECT id FROM public.notes
            WHERE vault_id IN (
                SELECT vault_id FROM public.vault_members
                WHERE user_id = auth.uid()
            )
        )
    );

-- LINKS policies
CREATE POLICY "Links are viewable with notes"
    ON public.links FOR SELECT
    USING (
        source_note_id IN (
            SELECT id FROM public.notes
            WHERE vault_id IN (
                SELECT vault_id FROM public.vault_members
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Vault members can create links"
    ON public.links FOR INSERT
    WITH CHECK (
        source_note_id IN (
            SELECT id FROM public.notes
            WHERE vault_id IN (
                SELECT vault_id FROM public.vault_members
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Vault members can delete links"
    ON public.links FOR DELETE
    USING (
        source_note_id IN (
            SELECT id FROM public.notes
            WHERE vault_id IN (
                SELECT vault_id FROM public.vault_members
                WHERE user_id = auth.uid()
            )
        )
    );

-- VAULT_MEMBERS policies
CREATE POLICY "Members can view their vault memberships"
    ON public.vault_members FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Vault owners can manage members"
    ON public.vault_members FOR ALL
    USING (
        vault_id IN (
            SELECT id FROM public.vaults
            WHERE owner_id = auth.uid()
        )
    );

-- CHAT_MESSAGES policies
CREATE POLICY "Vault members can view chat"
    ON public.chat_messages FOR SELECT
    USING (
        vault_id IN (
            SELECT vault_id FROM public.vault_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Vault members can send messages"
    ON public.chat_messages FOR INSERT
    WITH CHECK (
        user_id = auth.uid() AND
        vault_id IN (
            SELECT vault_id FROM public.vault_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own messages"
    ON public.chat_messages FOR DELETE
    USING (user_id = auth.uid());

-- =====================================================
-- REALTIME (enable for specific tables)
-- =====================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.notes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.links;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tags;
