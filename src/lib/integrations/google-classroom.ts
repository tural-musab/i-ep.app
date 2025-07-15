import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'
import { environmentManager } from '@/lib/config/environment'

export interface GoogleClassroomConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  scopes: string[]
}

export interface GoogleClassroomCourse {
  id: string
  name: string
  section?: string
  description?: string
  room?: string
  ownerId: string
  creationTime: string
  updateTime: string
  enrollmentCode?: string
  courseState: 'ACTIVE' | 'ARCHIVED' | 'PROVISIONED' | 'DECLINED'
  alternateLink: string
}

export interface GoogleClassroomStudent {
  courseId: string
  userId: string
  profile: {
    id: string
    name: {
      givenName: string
      familyName: string
      fullName: string
    }
    emailAddress: string
    photoUrl?: string
  }
}

export interface GoogleClassroomAssignment {
  id: string
  courseId: string
  title: string
  description?: string
  materials?: Array<{
    driveFile?: {
      id: string
      title: string
      alternateLink: string
    }
    youtubeVideo?: {
      id: string
      title: string
      alternateLink: string
    }
    link?: {
      url: string
      title: string
    }
  }>
  state: 'PUBLISHED' | 'DRAFT' | 'DELETED'
  alternateLink: string
  creationTime: string
  updateTime: string
  dueDate?: {
    year: number
    month: number
    day: number
  }
  dueTime?: {
    hours: number
    minutes: number
  }
  maxPoints?: number
  workType: 'ASSIGNMENT' | 'SHORT_ANSWER_QUESTION' | 'MULTIPLE_CHOICE_QUESTION'
}

export interface GoogleClassroomSubmission {
  id: string
  courseId: string
  courseWorkId: string
  userId: string
  creationTime: string
  updateTime: string
  state: 'NEW' | 'CREATED' | 'TURNED_IN' | 'RETURNED' | 'RECLAIMED_BY_STUDENT'
  late: boolean
  draftGrade?: number
  assignedGrade?: number
  alternateLink: string
  courseWorkType: 'ASSIGNMENT' | 'SHORT_ANSWER_QUESTION' | 'MULTIPLE_CHOICE_QUESTION'
  associatedWithDeveloper: boolean
}

export class GoogleClassroomIntegration {
  private oauth2Client: OAuth2Client
  private classroom: any
  private config: GoogleClassroomConfig

  constructor(config: GoogleClassroomConfig) {
    this.config = config
    this.oauth2Client = new OAuth2Client(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    )
    this.classroom = google.classroom({ version: 'v1', auth: this.oauth2Client })
  }

  /**
   * Generate OAuth2 authorization URL
   */
  getAuthUrl(state?: string): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.config.scopes,
      state: state || Math.random().toString(36).substring(7)
    })
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<any> {
    const { tokens } = await this.oauth2Client.getToken(code)
    this.oauth2Client.setCredentials(tokens)
    return tokens
  }

  /**
   * Set access token
   */
  setAccessToken(accessToken: string, refreshToken?: string): void {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    })
  }

  /**
   * Get user's courses
   */
  async getCourses(): Promise<GoogleClassroomCourse[]> {
    try {
      const response = await this.classroom.courses.list({
        pageSize: 100,
        courseStates: ['ACTIVE']
      })

      return response.data.courses?.map((course: any) => ({
        id: course.id,
        name: course.name,
        section: course.section,
        description: course.description,
        room: course.room,
        ownerId: course.ownerId,
        creationTime: course.creationTime,
        updateTime: course.updateTime,
        enrollmentCode: course.enrollmentCode,
        courseState: course.courseState,
        alternateLink: course.alternateLink
      })) || []
    } catch (error) {
      console.error('Error fetching courses:', error)
      throw new Error('Failed to fetch courses from Google Classroom')
    }
  }

  /**
   * Get students in a course
   */
  async getStudents(courseId: string): Promise<GoogleClassroomStudent[]> {
    try {
      const response = await this.classroom.courses.students.list({
        courseId,
        pageSize: 100
      })

      return response.data.students?.map((student: any) => ({
        courseId,
        userId: student.userId,
        profile: {
          id: student.profile.id,
          name: {
            givenName: student.profile.name.givenName,
            familyName: student.profile.name.familyName,
            fullName: student.profile.name.fullName
          },
          emailAddress: student.profile.emailAddress,
          photoUrl: student.profile.photoUrl
        }
      })) || []
    } catch (error) {
      console.error('Error fetching students:', error)
      throw new Error('Failed to fetch students from Google Classroom')
    }
  }

  /**
   * Get course assignments
   */
  async getAssignments(courseId: string): Promise<GoogleClassroomAssignment[]> {
    try {
      const response = await this.classroom.courses.courseWork.list({
        courseId,
        pageSize: 100,
        courseWorkStates: ['PUBLISHED']
      })

      return response.data.courseWork?.map((assignment: any) => ({
        id: assignment.id,
        courseId: assignment.courseId,
        title: assignment.title,
        description: assignment.description,
        materials: assignment.materials,
        state: assignment.state,
        alternateLink: assignment.alternateLink,
        creationTime: assignment.creationTime,
        updateTime: assignment.updateTime,
        dueDate: assignment.dueDate,
        dueTime: assignment.dueTime,
        maxPoints: assignment.maxPoints,
        workType: assignment.workType
      })) || []
    } catch (error) {
      console.error('Error fetching assignments:', error)
      throw new Error('Failed to fetch assignments from Google Classroom')
    }
  }

  /**
   * Get assignment submissions
   */
  async getSubmissions(courseId: string, courseWorkId: string): Promise<GoogleClassroomSubmission[]> {
    try {
      const response = await this.classroom.courses.courseWork.studentSubmissions.list({
        courseId,
        courseWorkId,
        pageSize: 100
      })

      return response.data.studentSubmissions?.map((submission: any) => ({
        id: submission.id,
        courseId: submission.courseId,
        courseWorkId: submission.courseWorkId,
        userId: submission.userId,
        creationTime: submission.creationTime,
        updateTime: submission.updateTime,
        state: submission.state,
        late: submission.late,
        draftGrade: submission.draftGrade,
        assignedGrade: submission.assignedGrade,
        alternateLink: submission.alternateLink,
        courseWorkType: submission.courseWorkType,
        associatedWithDeveloper: submission.associatedWithDeveloper
      })) || []
    } catch (error) {
      console.error('Error fetching submissions:', error)
      throw new Error('Failed to fetch submissions from Google Classroom')
    }
  }

  /**
   * Create a new assignment
   */
  async createAssignment(courseId: string, assignment: {
    title: string
    description?: string
    dueDate?: { year: number; month: number; day: number }
    dueTime?: { hours: number; minutes: number }
    maxPoints?: number
    workType?: 'ASSIGNMENT' | 'SHORT_ANSWER_QUESTION' | 'MULTIPLE_CHOICE_QUESTION'
    materials?: Array<{
      driveFile?: { id: string; title: string }
      youtubeVideo?: { id: string; title: string }
      link?: { url: string; title: string }
    }>
  }): Promise<GoogleClassroomAssignment> {
    try {
      const response = await this.classroom.courses.courseWork.create({
        courseId,
        requestBody: {
          title: assignment.title,
          description: assignment.description,
          dueDate: assignment.dueDate,
          dueTime: assignment.dueTime,
          maxPoints: assignment.maxPoints,
          workType: assignment.workType || 'ASSIGNMENT',
          materials: assignment.materials,
          state: 'PUBLISHED'
        }
      })

      return {
        id: response.data.id,
        courseId: response.data.courseId,
        title: response.data.title,
        description: response.data.description,
        materials: response.data.materials,
        state: response.data.state,
        alternateLink: response.data.alternateLink,
        creationTime: response.data.creationTime,
        updateTime: response.data.updateTime,
        dueDate: response.data.dueDate,
        dueTime: response.data.dueTime,
        maxPoints: response.data.maxPoints,
        workType: response.data.workType
      }
    } catch (error) {
      console.error('Error creating assignment:', error)
      throw new Error('Failed to create assignment in Google Classroom')
    }
  }

  /**
   * Grade a submission
   */
  async gradeSubmission(
    courseId: string,
    courseWorkId: string,
    submissionId: string,
    grade: number
  ): Promise<void> {
    try {
      await this.classroom.courses.courseWork.studentSubmissions.patch({
        courseId,
        courseWorkId,
        id: submissionId,
        updateMask: 'assignedGrade',
        requestBody: {
          assignedGrade: grade
        }
      })
    } catch (error) {
      console.error('Error grading submission:', error)
      throw new Error('Failed to grade submission in Google Classroom')
    }
  }

  /**
   * Return a submission to student
   */
  async returnSubmission(
    courseId: string,
    courseWorkId: string,
    submissionId: string
  ): Promise<void> {
    try {
      await this.classroom.courses.courseWork.studentSubmissions.return({
        courseId,
        courseWorkId,
        id: submissionId
      })
    } catch (error) {
      console.error('Error returning submission:', error)
      throw new Error('Failed to return submission in Google Classroom')
    }
  }

  /**
   * Sync course data with İ-EP.APP
   */
  async syncCourse(courseId: string): Promise<{
    course: GoogleClassroomCourse
    students: GoogleClassroomStudent[]
    assignments: GoogleClassroomAssignment[]
  }> {
    try {
      const [courses, students, assignments] = await Promise.all([
        this.getCourses(),
        this.getStudents(courseId),
        this.getAssignments(courseId)
      ])

      const course = courses.find(c => c.id === courseId)
      if (!course) {
        throw new Error('Course not found')
      }

      return {
        course,
        students,
        assignments
      }
    } catch (error) {
      console.error('Error syncing course:', error)
      throw new Error('Failed to sync course data')
    }
  }

  /**
   * Batch sync all courses
   */
  async syncAllCourses(): Promise<{
    courses: GoogleClassroomCourse[]
    totalStudents: number
    totalAssignments: number
  }> {
    try {
      const courses = await this.getCourses()
      let totalStudents = 0
      let totalAssignments = 0

      for (const course of courses) {
        const [students, assignments] = await Promise.all([
          this.getStudents(course.id),
          this.getAssignments(course.id)
        ])
        
        totalStudents += students.length
        totalAssignments += assignments.length
      }

      return {
        courses,
        totalStudents,
        totalAssignments
      }
    } catch (error) {
      console.error('Error syncing all courses:', error)
      throw new Error('Failed to sync all courses')
    }
  }

  /**
   * Check if user has required permissions
   */
  async checkPermissions(): Promise<boolean> {
    try {
      await this.classroom.courses.list({ pageSize: 1 })
      return true
    } catch (error) {
      console.error('Permission check failed:', error)
      return false
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<{
    id: string
    name: string
    email: string
    photoUrl?: string
  }> {
    try {
      const response = await this.classroom.userProfiles.get({
        userId: 'me'
      })

      return {
        id: response.data.id,
        name: response.data.name.fullName,
        email: response.data.emailAddress,
        photoUrl: response.data.photoUrl
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      throw new Error('Failed to fetch user profile')
    }
  }
}

// Factory function to create Google Classroom integration
export function createGoogleClassroomIntegration(): GoogleClassroomIntegration {
  const config = environmentManager.getConfig()
  
  return new GoogleClassroomIntegration({
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    redirectUri: process.env.GOOGLE_REDIRECT_URI || `${config.external.supabase.url}/auth/callback/google`,
    scopes: [
      'https://www.googleapis.com/auth/classroom.courses.readonly',
      'https://www.googleapis.com/auth/classroom.rosters.readonly',
      'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
      'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
      'https://www.googleapis.com/auth/classroom.coursework.students',
      'https://www.googleapis.com/auth/classroom.coursework.me',
      'https://www.googleapis.com/auth/classroom.profile.emails',
      'https://www.googleapis.com/auth/classroom.profile.photos'
    ]
  })
}

// Utility functions
export function formatGoogleClassroomDate(date: { year: number; month: number; day: number }): string {
  return `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`
}

export function formatGoogleClassroomTime(time: { hours: number; minutes: number }): string {
  return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}`
}

export function parseGoogleClassroomDateTime(
  date?: { year: number; month: number; day: number },
  time?: { hours: number; minutes: number }
): Date | null {
  if (!date) return null
  
  const hours = time?.hours || 23
  const minutes = time?.minutes || 59
  
  return new Date(date.year, date.month - 1, date.day, hours, minutes)
}