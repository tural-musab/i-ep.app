import { Client } from '@microsoft/microsoft-graph-client';
import { AuthenticationProvider } from '@microsoft/microsoft-graph-client';
import { environmentManager } from '@/lib/config/environment';

export interface MicrosoftTeamsConfig {
  clientId: string;
  clientSecret: string;
  tenantId: string;
  redirectUri: string;
  scopes: string[];
}

export interface TeamsClass {
  id: string;
  displayName: string;
  description?: string;
  classCode?: string;
  externalId?: string;
  mailNickname: string;
  createdDateTime: string;
  webUrl: string;
  visibility: 'private' | 'public' | 'hiddenMembership';
}

export interface TeamsMember {
  id: string;
  roles: string[];
  displayName: string;
  email: string;
  userPrincipalName: string;
  userType: 'member' | 'guest';
}

export interface TeamsAssignment {
  id: string;
  displayName: string;
  instructions?: {
    content: string;
    contentType: 'text' | 'html';
  };
  dueDateTime?: string;
  assignedDateTime: string;
  status: 'draft' | 'published' | 'assigned';
  allowLateSubmissions: boolean;
  allowStudentsToAddResourcesToSubmission: boolean;
  classId: string;
  webUrl: string;
  grading?: {
    maxPoints: number;
    '@odata.type': 'microsoft.graph.educationAssignmentPointsGradeType';
  };
  resources: TeamsResource[];
}

export interface TeamsResource {
  id: string;
  displayName: string;
  resource: {
    '@odata.type': string;
    displayName: string;
    link?: string;
    file?: {
      odataType: string;
      sourceUrl: string;
    };
  };
}

export interface TeamsSubmission {
  id: string;
  assignmentId: string;
  submittedBy: {
    user: {
      id: string;
      displayName: string;
      email: string;
    };
  };
  submittedDateTime?: string;
  unsubmittedDateTime?: string;
  returnedDateTime?: string;
  reassignedDateTime?: string;
  status: 'working' | 'submitted' | 'returned' | 'reassigned';
  excusedDateTime?: string;
  grade?: {
    points: number;
    gradeType: 'points';
  };
  feedback?: {
    text: {
      content: string;
      contentType: 'text' | 'html';
    };
    feedbackDateTime: string;
  };
  resources: TeamsResource[];
}

class CustomAuthProvider implements AuthenticationProvider {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getAccessToken(): Promise<string> {
    return this.accessToken;
  }
}

export class MicrosoftTeamsIntegration {
  private graphClient: Client;
  private config: MicrosoftTeamsConfig;

  constructor(config: MicrosoftTeamsConfig, accessToken: string) {
    this.config = config;
    const authProvider = new CustomAuthProvider(accessToken);
    this.graphClient = Client.initWithMiddleware({ authProvider });
  }

  /**
   * Get user's education classes
   */
  async getClasses(): Promise<TeamsClass[]> {
    try {
      const response = await this.graphClient
        .api('/education/me/classes')
        .select(
          'id,displayName,description,classCode,externalId,mailNickname,createdDateTime,webUrl,visibility'
        )
        .get();

      return response.value.map((cls: any) => ({
        id: cls.id,
        displayName: cls.displayName,
        description: cls.description,
        classCode: cls.classCode,
        externalId: cls.externalId,
        mailNickname: cls.mailNickname,
        createdDateTime: cls.createdDateTime,
        webUrl: cls.webUrl,
        visibility: cls.visibility,
      }));
    } catch (error) {
      console.error('Error fetching classes:', error);
      throw new Error('Failed to fetch classes from Microsoft Teams');
    }
  }

  /**
   * Get members of a class
   */
  async getClassMembers(classId: string): Promise<TeamsMember[]> {
    try {
      const response = await this.graphClient
        .api(`/education/classes/${classId}/members`)
        .select('id,roles,displayName,email,userPrincipalName,userType')
        .get();

      return response.value.map((member: any) => ({
        id: member.id,
        roles: member.roles,
        displayName: member.displayName,
        email: member.email,
        userPrincipalName: member.userPrincipalName,
        userType: member.userType,
      }));
    } catch (error) {
      console.error('Error fetching class members:', error);
      throw new Error('Failed to fetch class members from Microsoft Teams');
    }
  }

  /**
   * Get assignments for a class
   */
  async getAssignments(classId: string): Promise<TeamsAssignment[]> {
    try {
      const response = await this.graphClient
        .api(`/education/classes/${classId}/assignments`)
        .select(
          'id,displayName,instructions,dueDateTime,assignedDateTime,status,allowLateSubmissions,allowStudentsToAddResourcesToSubmission,classId,webUrl,grading'
        )
        .expand('resources')
        .get();

      return response.value.map((assignment: any) => ({
        id: assignment.id,
        displayName: assignment.displayName,
        instructions: assignment.instructions,
        dueDateTime: assignment.dueDateTime,
        assignedDateTime: assignment.assignedDateTime,
        status: assignment.status,
        allowLateSubmissions: assignment.allowLateSubmissions,
        allowStudentsToAddResourcesToSubmission: assignment.allowStudentsToAddResourcesToSubmission,
        classId: assignment.classId,
        webUrl: assignment.webUrl,
        grading: assignment.grading,
        resources:
          assignment.resources?.map((resource: any) => ({
            id: resource.id,
            displayName: resource.displayName,
            resource: resource.resource,
          })) || [],
      }));
    } catch (error) {
      console.error('Error fetching assignments:', error);
      throw new Error('Failed to fetch assignments from Microsoft Teams');
    }
  }

  /**
   * Get submissions for an assignment
   */
  async getSubmissions(classId: string, assignmentId: string): Promise<TeamsSubmission[]> {
    try {
      const response = await this.graphClient
        .api(`/education/classes/${classId}/assignments/${assignmentId}/submissions`)
        .select(
          'id,submittedBy,submittedDateTime,unsubmittedDateTime,returnedDateTime,reassignedDateTime,status,excusedDateTime,grade,feedback'
        )
        .expand('resources')
        .get();

      return response.value.map((submission: any) => ({
        id: submission.id,
        assignmentId,
        submittedBy: submission.submittedBy,
        submittedDateTime: submission.submittedDateTime,
        unsubmittedDateTime: submission.unsubmittedDateTime,
        returnedDateTime: submission.returnedDateTime,
        reassignedDateTime: submission.reassignedDateTime,
        status: submission.status,
        excusedDateTime: submission.excusedDateTime,
        grade: submission.grade,
        feedback: submission.feedback,
        resources:
          submission.resources?.map((resource: any) => ({
            id: resource.id,
            displayName: resource.displayName,
            resource: resource.resource,
          })) || [],
      }));
    } catch (error) {
      console.error('Error fetching submissions:', error);
      throw new Error('Failed to fetch submissions from Microsoft Teams');
    }
  }

  /**
   * Create a new assignment
   */
  async createAssignment(
    classId: string,
    assignment: {
      displayName: string;
      instructions?: string;
      dueDateTime?: string;
      maxPoints?: number;
      allowLateSubmissions?: boolean;
      allowStudentsToAddResourcesToSubmission?: boolean;
      resources?: Array<{
        displayName: string;
        link?: string;
        file?: {
          sourceUrl: string;
        };
      }>;
    }
  ): Promise<TeamsAssignment> {
    try {
      const assignmentData: any = {
        displayName: assignment.displayName,
        status: 'draft',
        allowLateSubmissions: assignment.allowLateSubmissions ?? true,
        allowStudentsToAddResourcesToSubmission:
          assignment.allowStudentsToAddResourcesToSubmission ?? true,
      };

      if (assignment.instructions) {
        assignmentData.instructions = {
          content: assignment.instructions,
          contentType: 'text',
        };
      }

      if (assignment.dueDateTime) {
        assignmentData.dueDateTime = assignment.dueDateTime;
      }

      if (assignment.maxPoints) {
        assignmentData.grading = {
          '@odata.type': 'microsoft.graph.educationAssignmentPointsGradeType',
          maxPoints: assignment.maxPoints,
        };
      }

      const response = await this.graphClient
        .api(`/education/classes/${classId}/assignments`)
        .post(assignmentData);

      // Add resources if provided
      if (assignment.resources && assignment.resources.length > 0) {
        for (const resource of assignment.resources) {
          await this.addResourceToAssignment(classId, response.id, resource);
        }
      }

      return {
        id: response.id,
        displayName: response.displayName,
        instructions: response.instructions,
        dueDateTime: response.dueDateTime,
        assignedDateTime: response.assignedDateTime,
        status: response.status,
        allowLateSubmissions: response.allowLateSubmissions,
        allowStudentsToAddResourcesToSubmission: response.allowStudentsToAddResourcesToSubmission,
        classId: response.classId,
        webUrl: response.webUrl,
        grading: response.grading,
        resources: [],
      };
    } catch (error) {
      console.error('Error creating assignment:', error);
      throw new Error('Failed to create assignment in Microsoft Teams');
    }
  }

  /**
   * Add resource to assignment
   */
  private async addResourceToAssignment(
    classId: string,
    assignmentId: string,
    resource: {
      displayName: string;
      link?: string;
      file?: {
        sourceUrl: string;
      };
    }
  ): Promise<void> {
    try {
      const resourceData: any = {
        displayName: resource.displayName,
        resource: {
          displayName: resource.displayName,
        },
      };

      if (resource.link) {
        resourceData.resource['@odata.type'] = 'microsoft.graph.educationLinkResource';
        resourceData.resource.link = resource.link;
      } else if (resource.file) {
        resourceData.resource['@odata.type'] = 'microsoft.graph.educationFileResource';
        resourceData.resource.file = {
          '@odata.type': 'microsoft.graph.educationFileResource',
          sourceUrl: resource.file.sourceUrl,
        };
      }

      await this.graphClient
        .api(`/education/classes/${classId}/assignments/${assignmentId}/resources`)
        .post(resourceData);
    } catch (error) {
      console.error('Error adding resource to assignment:', error);
      throw new Error('Failed to add resource to assignment');
    }
  }

  /**
   * Publish assignment
   */
  async publishAssignment(classId: string, assignmentId: string): Promise<void> {
    try {
      await this.graphClient
        .api(`/education/classes/${classId}/assignments/${assignmentId}/publish`)
        .post({});
    } catch (error) {
      console.error('Error publishing assignment:', error);
      throw new Error('Failed to publish assignment in Microsoft Teams');
    }
  }

  /**
   * Grade a submission
   */
  async gradeSubmission(
    classId: string,
    assignmentId: string,
    submissionId: string,
    grade: number,
    feedback?: string
  ): Promise<void> {
    try {
      const updateData: any = {
        grade: {
          '@odata.type': 'microsoft.graph.educationAssignmentPointsGrade',
          points: grade,
        },
      };

      if (feedback) {
        updateData.feedback = {
          text: {
            content: feedback,
            contentType: 'text',
          },
        };
      }

      await this.graphClient
        .api(
          `/education/classes/${classId}/assignments/${assignmentId}/submissions/${submissionId}`
        )
        .patch(updateData);
    } catch (error) {
      console.error('Error grading submission:', error);
      throw new Error('Failed to grade submission in Microsoft Teams');
    }
  }

  /**
   * Return submission to student
   */
  async returnSubmission(
    classId: string,
    assignmentId: string,
    submissionId: string
  ): Promise<void> {
    try {
      await this.graphClient
        .api(
          `/education/classes/${classId}/assignments/${assignmentId}/submissions/${submissionId}/return`
        )
        .post({});
    } catch (error) {
      console.error('Error returning submission:', error);
      throw new Error('Failed to return submission in Microsoft Teams');
    }
  }

  /**
   * Sync class data with İ-EP.APP
   */
  async syncClass(classId: string): Promise<{
    class: TeamsClass;
    members: TeamsMember[];
    assignments: TeamsAssignment[];
  }> {
    try {
      const [classes, members, assignments] = await Promise.all([
        this.getClasses(),
        this.getClassMembers(classId),
        this.getAssignments(classId),
      ]);

      const classData = classes.find((c) => c.id === classId);
      if (!classData) {
        throw new Error('Class not found');
      }

      return {
        class: classData,
        members,
        assignments,
      };
    } catch (error) {
      console.error('Error syncing class:', error);
      throw new Error('Failed to sync class data');
    }
  }

  /**
   * Batch sync all classes
   */
  async syncAllClasses(): Promise<{
    classes: TeamsClass[];
    totalMembers: number;
    totalAssignments: number;
  }> {
    try {
      const classes = await this.getClasses();
      let totalMembers = 0;
      let totalAssignments = 0;

      for (const cls of classes) {
        const [members, assignments] = await Promise.all([
          this.getClassMembers(cls.id),
          this.getAssignments(cls.id),
        ]);

        totalMembers += members.length;
        totalAssignments += assignments.length;
      }

      return {
        classes,
        totalMembers,
        totalAssignments,
      };
    } catch (error) {
      console.error('Error syncing all classes:', error);
      throw new Error('Failed to sync all classes');
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<{
    id: string;
    displayName: string;
    email: string;
    userPrincipalName: string;
    jobTitle?: string;
    department?: string;
  }> {
    try {
      const response = await this.graphClient
        .api('/me')
        .select('id,displayName,mail,userPrincipalName,jobTitle,department')
        .get();

      return {
        id: response.id,
        displayName: response.displayName,
        email: response.mail,
        userPrincipalName: response.userPrincipalName,
        jobTitle: response.jobTitle,
        department: response.department,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw new Error('Failed to fetch user profile');
    }
  }

  /**
   * Check if user has required permissions
   */
  async checkPermissions(): Promise<boolean> {
    try {
      await this.graphClient.api('/education/me/classes').select('id').top(1).get();
      return true;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }
}

// Factory function to create Microsoft Teams integration
export function createMicrosoftTeamsIntegration(accessToken: string): MicrosoftTeamsIntegration {
  const config = environmentManager.getConfig();

  return new MicrosoftTeamsIntegration(
    {
      clientId: process.env.MICROSOFT_CLIENT_ID || '',
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || '',
      tenantId: process.env.MICROSOFT_TENANT_ID || 'common',
      redirectUri:
        process.env.MICROSOFT_REDIRECT_URI ||
        `${config.external.supabase.url}/auth/callback/microsoft`,
      scopes: [
        'https://graph.microsoft.com/EduAssignments.ReadWrite',
        'https://graph.microsoft.com/EduRoster.Read',
        'https://graph.microsoft.com/User.Read',
        'https://graph.microsoft.com/Directory.Read.All',
      ],
    },
    accessToken
  );
}

// Utility functions
export function formatTeamsDateTime(dateTime: string): Date {
  return new Date(dateTime);
}

export function formatTeamsDateTimeString(date: Date): string {
  return date.toISOString();
}

export function getTeamsStudents(members: TeamsMember[]): TeamsMember[] {
  return members.filter((member) => member.roles.includes('student'));
}

export function getTeamsTeachers(members: TeamsMember[]): TeamsMember[] {
  return members.filter(
    (member) => member.roles.includes('teacher') || member.roles.includes('owner')
  );
}
