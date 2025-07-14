/**
 * Parent Repository Implementation
 * Sprint 2 BL-001: Repository Pattern Foundation
 * İ-EP.APP - Parent Management
 */

import { BaseRepository, BaseEntity, QueryOptions, QueryResult } from './base-repository';

export interface Parent extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  address?: string;
  profession?: string;
  relationship: 'mother' | 'father' | 'guardian' | 'other';
  emergency_contact: boolean;
  status: 'active' | 'inactive';
  notes?: string;
  preferred_communication: 'email' | 'phone' | 'sms' | 'whatsapp';
  metadata?: Record<string, any>;
}

export interface ParentWithRelations extends Parent {
  children?: {
    id: string;
    student_number: string;
    first_name: string;
    last_name: string;
    class_name: string;
    status: string;
  }[];
  communications?: {
    id: string;
    type: string;
    subject: string;
    sent_at: string;
    status: string;
  }[];
  meetings?: {
    id: string;
    title: string;
    date: string;
    status: string;
  }[];
}

export interface ParentCommunication extends BaseEntity {
  parent_id: string;
  type: 'email' | 'sms' | 'whatsapp' | 'phone_call' | 'meeting';
  subject: string;
  content: string;
  sent_by: string;
  sent_at: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  student_id?: string;
  response?: string;
  response_at?: string;
  metadata?: Record<string, any>;
}

export interface ParentMeeting extends BaseEntity {
  parent_id: string;
  teacher_id: string;
  student_id?: string;
  title: string;
  description?: string;
  scheduled_at: string;
  duration_minutes: number;
  location?: string;
  meeting_type: 'in_person' | 'video_call' | 'phone_call';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  follow_up_required: boolean;
  metadata?: Record<string, any>;
}

export class ParentRepository extends BaseRepository<Parent> {
  constructor(tenantId: string) {
    super('parents', tenantId);
  }

  /**
   * Find parent by email
   */
  async findByEmail(email: string): Promise<Parent | null> {
    const { data, error } = await this.getBaseQuery()
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Repository error: ${error.message}`);
    }

    return data as Parent;
  }

  /**
   * Find parent by phone
   */
  async findByPhone(phone: string): Promise<Parent | null> {
    const { data, error } = await this.getBaseQuery()
      .eq('phone', phone)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Repository error: ${error.message}`);
    }

    return data as Parent;
  }

  /**
   * Find parents by student ID
   */
  async findByStudentId(studentId: string, options: QueryOptions = {}): Promise<QueryResult<Parent>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc'
    } = options;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await this.supabase
      .from('parents')
      .select(`
        *,
        student_parents!inner(student_id)
      `, { count: 'exact' })
      .eq('tenant_id', this.tenantId)
      .eq('student_parents.student_id', studentId)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: data as Parent[],
      count: count || 0,
      page,
      totalPages,
      hasMore: page < totalPages
    };
  }

  /**
   * Search parents by name
   */
  async searchByName(searchTerm: string, options: QueryOptions = {}): Promise<QueryResult<Parent>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'name',
      sortOrder = 'asc'
    } = options;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await this.getBaseQuery()
      .ilike('name', `%${searchTerm}%`)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to)
      .select('*', { count: 'exact' });

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: data as Parent[],
      count: count || 0,
      page,
      totalPages,
      hasMore: page < totalPages
    };
  }

  /**
   * Find parent with relations
   */
  async findWithRelations(id: string): Promise<ParentWithRelations | null> {
    const { data, error } = await this.supabase
      .from('parents')
      .select(`
        *,
        student_parents!inner(
          student:students(
            id,
            student_number,
            first_name,
            last_name,
            status,
            class:classes(name)
          )
        )
      `)
      .eq('id', id)
      .eq('tenant_id', this.tenantId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Repository error: ${error.message}`);
    }

    return data as ParentWithRelations;
  }

  /**
   * Find emergency contacts
   */
  async findEmergencyContacts(options: QueryOptions = {}): Promise<QueryResult<Parent>> {
    return this.findAll({
      ...options,
      filters: { emergency_contact: true }
    });
  }

  /**
   * Find parents by relationship type
   */
  async findByRelationship(relationship: Parent['relationship'], options: QueryOptions = {}): Promise<QueryResult<Parent>> {
    return this.findAll({
      ...options,
      filters: { relationship }
    });
  }

  /**
   * Find parents by communication preference
   */
  async findByPreferredCommunication(communicationType: Parent['preferred_communication'], options: QueryOptions = {}): Promise<QueryResult<Parent>> {
    return this.findAll({
      ...options,
      filters: { preferred_communication: communicationType }
    });
  }

  /**
   * Update parent status
   */
  async updateStatus(parentId: string, status: Parent['status']): Promise<Parent | null> {
    return this.update(parentId, { status });
  }

  /**
   * Update emergency contact status
   */
  async updateEmergencyContact(parentId: string, emergencyContact: boolean): Promise<Parent | null> {
    return this.update(parentId, { emergency_contact: emergencyContact });
  }

  /**
   * Update communication preference
   */
  async updateCommunicationPreference(parentId: string, preference: Parent['preferred_communication']): Promise<Parent | null> {
    return this.update(parentId, { preferred_communication: preference });
  }

  /**
   * Get parent statistics
   */
  async getParentStats(parentId: string): Promise<{
    totalChildren: number;
    activeChildren: number;
    totalCommunications: number;
    lastCommunicationDate?: string;
    upcomingMeetings: number;
  }> {
    const { data, error } = await this.supabase.rpc('get_parent_statistics', {
      parent_id: parentId,
      tenant_id: this.tenantId
    });

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    return data || {
      totalChildren: 0,
      activeChildren: 0,
      totalCommunications: 0,
      lastCommunicationDate: null,
      upcomingMeetings: 0
    };
  }

  /**
   * Associate parent with student
   */
  async associateWithStudent(parentId: string, studentId: string, relationship: Parent['relationship']): Promise<boolean> {
    const { error } = await this.supabase
      .from('student_parents')
      .insert({
        parent_id: parentId,
        student_id: studentId,
        relationship,
        tenant_id: this.tenantId
      });

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    return true;
  }

  /**
   * Remove parent-student association
   */
  async removeStudentAssociation(parentId: string, studentId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('student_parents')
      .delete()
      .eq('parent_id', parentId)
      .eq('student_id', studentId)
      .eq('tenant_id', this.tenantId);

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    return true;
  }

  /**
   * Bulk update parent communication preference
   */
  async bulkUpdateCommunicationPreference(parentIds: string[], preference: Parent['preferred_communication']): Promise<boolean> {
    const { error } = await this.supabase
      .from('parents')
      .update({ 
        preferred_communication: preference,
        updated_at: new Date().toISOString()
      })
      .in('id', parentIds)
      .eq('tenant_id', this.tenantId);

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    return true;
  }
}

/**
 * Parent Communication Repository
 */
export class ParentCommunicationRepository extends BaseRepository<ParentCommunication> {
  constructor(tenantId: string) {
    super('parent_communications', tenantId);
  }

  /**
   * Find communications by parent ID
   */
  async findByParentId(parentId: string, options: QueryOptions = {}): Promise<QueryResult<ParentCommunication>> {
    return this.findAll({
      ...options,
      filters: { parent_id: parentId }
    });
  }

  /**
   * Find communications by type
   */
  async findByType(type: ParentCommunication['type'], options: QueryOptions = {}): Promise<QueryResult<ParentCommunication>> {
    return this.findAll({
      ...options,
      filters: { type }
    });
  }

  /**
   * Find communications by status
   */
  async findByStatus(status: ParentCommunication['status'], options: QueryOptions = {}): Promise<QueryResult<ParentCommunication>> {
    return this.findAll({
      ...options,
      filters: { status }
    });
  }

  /**
   * Mark communication as read
   */
  async markAsRead(communicationId: string): Promise<ParentCommunication | null> {
    return this.update(communicationId, { status: 'read' });
  }

  /**
   * Add response to communication
   */
  async addResponse(communicationId: string, response: string): Promise<ParentCommunication | null> {
    return this.update(communicationId, {
      response,
      response_at: new Date().toISOString()
    });
  }
}

/**
 * Parent Meeting Repository
 */
export class ParentMeetingRepository extends BaseRepository<ParentMeeting> {
  constructor(tenantId: string) {
    super('parent_meetings', tenantId);
  }

  /**
   * Find meetings by parent ID
   */
  async findByParentId(parentId: string, options: QueryOptions = {}): Promise<QueryResult<ParentMeeting>> {
    return this.findAll({
      ...options,
      filters: { parent_id: parentId }
    });
  }

  /**
   * Find meetings by teacher ID
   */
  async findByTeacherId(teacherId: string, options: QueryOptions = {}): Promise<QueryResult<ParentMeeting>> {
    return this.findAll({
      ...options,
      filters: { teacher_id: teacherId }
    });
  }

  /**
   * Find meetings by status
   */
  async findByStatus(status: ParentMeeting['status'], options: QueryOptions = {}): Promise<QueryResult<ParentMeeting>> {
    return this.findAll({
      ...options,
      filters: { status }
    });
  }

  /**
   * Find upcoming meetings
   */
  async findUpcoming(options: QueryOptions = {}): Promise<QueryResult<ParentMeeting>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'scheduled_at',
      sortOrder = 'asc'
    } = options;

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const now = new Date().toISOString();

    const { data, error, count } = await this.getBaseQuery()
      .gte('scheduled_at', now)
      .eq('status', 'scheduled')
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to)
      .select('*', { count: 'exact' });

    if (error) {
      throw new Error(`Repository error: ${error.message}`);
    }

    const totalPages = Math.ceil((count || 0) / limit);

    return {
      data: data as ParentMeeting[],
      count: count || 0,
      page,
      totalPages,
      hasMore: page < totalPages
    };
  }

  /**
   * Complete meeting
   */
  async completeMeeting(meetingId: string, notes?: string): Promise<ParentMeeting | null> {
    return this.update(meetingId, {
      status: 'completed',
      notes
    });
  }

  /**
   * Cancel meeting
   */
  async cancelMeeting(meetingId: string): Promise<ParentMeeting | null> {
    return this.update(meetingId, { status: 'cancelled' });
  }

  /**
   * Reschedule meeting
   */
  async rescheduleMeeting(meetingId: string, newDateTime: string): Promise<ParentMeeting | null> {
    return this.update(meetingId, {
      scheduled_at: newDateTime,
      status: 'rescheduled'
    });
  }

  /**
   * Mark follow-up required
   */
  async markFollowUpRequired(meetingId: string, required: boolean): Promise<ParentMeeting | null> {
    return this.update(meetingId, { follow_up_required: required });
  }
}