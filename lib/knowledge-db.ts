import { supabase } from './supabase'
import type {
  KnowledgeNote,
  NoteLink,
  Collection,
} from '@/types'

/**
 * Knowledge Database Service
 * Handles all database operations for the knowledge management system
 */

export class KnowledgeDB {
  /**
   * NOTES CRUD
   */

  async createNote(
    note: Omit<KnowledgeNote, 'id' | 'created_at' | 'updated_at'>
  ): Promise<KnowledgeNote> {
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('Supabase not configured. Cannot save note.')
    }

    const { data, error } = await supabase
      .from('knowledge_notes')
      .insert({
        ...note,
        metadata: note.metadata || null,
        source_searches: note.source_searches || null,
        // user_id is required; should be provided by caller
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to create note: ${error.message}`)
    return data as KnowledgeNote
  }

  async getNotes(workspaceId: string): Promise<KnowledgeNote[]> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return []

    // Get current user for RLS + additional defense-in-depth filtering
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id

    let query = supabase
      .from('knowledge_notes')
      .select('*')
      .eq('workspace_id', workspaceId)

    // Add user_id filter for defense-in-depth
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch notes: ${error.message}`)
    return (data || []) as KnowledgeNote[]
  }

  async getNote(id: string): Promise<KnowledgeNote> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('Supabase not configured')
    }

    // Get current user for RLS + additional defense-in-depth filtering
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id

    let query = supabase
      .from('knowledge_notes')
      .select('*')
      .eq('id', id)

    // Add user_id filter for defense-in-depth
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query.single()

    if (error) throw new Error(`Failed to fetch note: ${error.message}`)
    return data as KnowledgeNote
  }

  async updateNote(
    id: string,
    updates: Partial<KnowledgeNote>
  ): Promise<KnowledgeNote> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('Supabase not configured')
    }

    // Get current user for RLS + additional defense-in-depth filtering
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id

    let query = supabase
      .from('knowledge_notes')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    // Add user_id filter for defense-in-depth
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query.select().single()

    if (error) throw new Error(`Failed to update note: ${error.message}`)
    return data as KnowledgeNote
  }

  async deleteNote(id: string): Promise<void> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('Supabase not configured')
    }

    // Get current user for RLS + additional defense-in-depth filtering
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id

    let query = supabase
      .from('knowledge_notes')
      .delete()
      .eq('id', id)

    // Add user_id filter for defense-in-depth
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { error } = await query

    if (error) throw new Error(`Failed to delete note: ${error.message}`)
  }

  /**
   * TAG OPERATIONS
   */

  async addTag(noteId: string, tag: string): Promise<void> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return

    const normalizedTag = tag.toLowerCase().trim()
    if (!normalizedTag) return

    const { error } = await supabase.from('note_tags').insert({
      note_id: noteId,
      tag: normalizedTag,
    })

    // Ignore duplicate key errors (UNIQUE constraint)
    if (error && error.code !== '23505') {
      throw new Error(`Failed to add tag: ${error.message}`)
    }
  }

  async getNoteTags(noteId: string): Promise<string[]> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return []

    const { data, error } = await supabase
      .from('note_tags')
      .select('tag')
      .eq('note_id', noteId)
      .order('tag', { ascending: true })

    if (error) throw new Error(`Failed to fetch tags: ${error.message}`)
    return (data || []).map((row) => row.tag)
  }

  async removeTag(noteId: string, tag: string): Promise<void> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return

    const normalizedTag = tag.toLowerCase().trim()
    const { error } = await supabase
      .from('note_tags')
      .delete()
      .eq('note_id', noteId)
      .eq('tag', normalizedTag)

    if (error) throw new Error(`Failed to remove tag: ${error.message}`)
  }

  async removeAllTags(noteId: string): Promise<void> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return

    const { error } = await supabase
      .from('note_tags')
      .delete()
      .eq('note_id', noteId)

    if (error) throw new Error(`Failed to remove tags: ${error.message}`)
  }

  async searchNotesByTag(workspaceId: string, tag: string): Promise<string[]> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return []

    // Get current user for RLS + additional defense-in-depth filtering
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id

    const normalizedTag = tag.toLowerCase().trim()
    const { data, error } = await supabase
      .from('note_tags')
      .select('note_id')
      .eq('tag', normalizedTag)

    if (error) throw new Error(`Failed to search by tag: ${error.message}`)

    // Filter by workspace by fetching full notes
    const noteIds = (data || []).map((row) => row.note_id)
    if (noteIds.length === 0) return []

    let query = supabase
      .from('knowledge_notes')
      .select('id')
      .eq('workspace_id', workspaceId)
      .in('id', noteIds)

    // Add user_id filter for defense-in-depth
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data: notes } = await query

    return (notes || []).map((note) => note.id)
  }

  /**
   * SEARCH OPERATIONS
   */

  async searchNotes(workspaceId: string, searchQuery: string): Promise<KnowledgeNote[]> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return []

    // Get current user for RLS + additional defense-in-depth filtering
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id

    const searchTerm = `%${searchQuery}%`
    let query = supabase
      .from('knowledge_notes')
      .select('*')
      .eq('workspace_id', workspaceId)
      .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)

    // Add user_id filter for defense-in-depth
    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to search notes: ${error.message}`)
    return (data || []) as KnowledgeNote[]
  }

  /**
   * LINK OPERATIONS
   */

  async linkNotes(
    fromNoteId: string,
    toNoteId: string,
    linkType: 'wikilink' | 'reference' | 'related' = 'wikilink'
  ): Promise<void> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return

    const { error } = await supabase.from('note_links').insert({
      from_note_id: fromNoteId,
      to_note_id: toNoteId,
      link_type: linkType,
    })

    // Ignore duplicate key errors
    if (error && error.code !== '23505') {
      throw new Error(`Failed to link notes: ${error.message}`)
    }
  }

  async unlinkNotes(fromNoteId: string, toNoteId: string): Promise<void> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return

    const { error } = await supabase
      .from('note_links')
      .delete()
      .eq('from_note_id', fromNoteId)
      .eq('to_note_id', toNoteId)

    if (error) throw new Error(`Failed to unlink notes: ${error.message}`)
  }

  async getNoteLinks(noteId: string, direction: 'outgoing' | 'incoming' = 'outgoing'): Promise<NoteLink[]> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return []

    let query = supabase.from('note_links').select('*')

    if (direction === 'outgoing') {
      query = query.eq('from_note_id', noteId)
    } else {
      query = query.eq('to_note_id', noteId)
    }

    const { data, error } = await query

    if (error) throw new Error(`Failed to fetch note links: ${error.message}`)
    return (data || []) as NoteLink[]
  }

  /**
   * COLLECTION OPERATIONS
   */

  async createCollection(
    collection: Omit<Collection, 'id' | 'created_at' | 'updated_at'>
  ): Promise<Collection> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('Supabase not configured')
    }

    const { data, error } = await supabase
      .from('collections')
      .insert(collection)
      .select()
      .single()

    if (error) throw new Error(`Failed to create collection: ${error.message}`)
    return data as Collection
  }

  async getCollections(workspaceId: string): Promise<Collection[]> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return []

    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Failed to fetch collections: ${error.message}`)
    return (data || []) as Collection[]
  }

  async deleteCollection(id: string): Promise<void> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return

    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id)

    if (error) throw new Error(`Failed to delete collection: ${error.message}`)
  }

  async addNoteToCollection(
    collectionId: string,
    noteId: string,
    position: number = 0
  ): Promise<void> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return

    const { error } = await supabase.from('collection_notes').insert({
      collection_id: collectionId,
      note_id: noteId,
      position,
    })

    if (error && error.code !== '23505') {
      throw new Error(`Failed to add note to collection: ${error.message}`)
    }
  }

  async removeNoteFromCollection(
    collectionId: string,
    noteId: string
  ): Promise<void> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return

    const { error } = await supabase
      .from('collection_notes')
      .delete()
      .eq('collection_id', collectionId)
      .eq('note_id', noteId)

    if (error) throw new Error(`Failed to remove note from collection: ${error.message}`)
  }

  async getCollectionNotes(collectionId: string): Promise<KnowledgeNote[]> {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return []

    const { data, error } = await supabase
      .from('collection_notes')
      .select('note_id')
      .eq('collection_id', collectionId)
      .order('position', { ascending: true })

    if (error) throw new Error(`Failed to fetch collection notes: ${error.message}`)

    const noteIds = (data || []).map((row) => row.note_id)
    if (noteIds.length === 0) return []

    const { data: notes, error: notesError } = await supabase
      .from('knowledge_notes')
      .select('*')
      .in('id', noteIds)

    if (notesError) throw new Error(`Failed to fetch notes: ${notesError.message}`)
    return (notes || []) as KnowledgeNote[]
  }
}

// Export singleton instance
export const knowledgeDB = new KnowledgeDB()
