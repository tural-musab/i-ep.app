import { createAdvancedAnalytics } from './advanced-analytics';
import { createClient } from '@/lib/supabase/client';

export interface PredictiveModel {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'clustering' | 'forecasting';
  description: string;
  accuracy: number;
  last_trained: string;
  features: string[];
  target: string;
  model_data: any;
}

export interface StudentRiskPrediction {
  student_id: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  risk_factors: Array<{
    factor: string;
    impact: number;
    description: string;
  }>;
  recommendations: Array<{
    action: string;
    priority: 'low' | 'medium' | 'high';
    estimated_impact: number;
    timeline: string;
  }>;
  confidence: number;
  prediction_date: string;
}

export interface GradePrediction {
  student_id: string;
  assignment_id: string;
  predicted_grade: number;
  confidence: number;
  factors: Array<{
    factor: string;
    weight: number;
    current_value: number;
  }>;
  improvement_suggestions: string[];
}

export interface AttendancePrediction {
  student_id: string;
  date: string;
  predicted_attendance: 'present' | 'absent' | 'late';
  probability: number;
  factors: Array<{
    factor: string;
    influence: number;
  }>;
}

export interface EnrollmentForecast {
  year: number;
  semester: 'fall' | 'spring' | 'summer';
  predicted_enrollment: number;
  confidence_interval: {
    lower: number;
    upper: number;
  };
  factors: Array<{
    factor: string;
    impact: number;
  }>;
  recommendations: string[];
}

export interface ResourceDemandForecast {
  resource_type: string;
  time_period: string;
  predicted_demand: number;
  current_capacity: number;
  capacity_utilization: number;
  shortage_risk: 'low' | 'medium' | 'high';
  recommendations: string[];
}

export class PredictiveAnalytics {
  private supabase: any;
  private tenantId: string;
  private analytics: any;

  constructor(tenantId: string) {
    this.supabase = createClient();
    this.tenantId = tenantId;
    this.analytics = createAdvancedAnalytics(tenantId);
  }

  /**
   * Predict student risk levels
   */
  async predictStudentRisk(studentId?: string): Promise<StudentRiskPrediction[]> {
    try {
      // Get student data
      const studentsQuery = this.supabase
        .from('users')
        .select('id')
        .eq('tenant_id', this.tenantId)
        .eq('role', 'student');

      if (studentId) {
        studentsQuery.eq('id', studentId);
      }

      const { data: students } = await studentsQuery;

      const predictions: StudentRiskPrediction[] = [];

      for (const student of students) {
        const studentAnalytics = await this.analytics.generateStudentAnalytics(student.id);
        const riskPrediction = await this.calculateStudentRisk(student.id, studentAnalytics);
        predictions.push(riskPrediction);
      }

      return predictions;
    } catch (error) {
      console.error('Error predicting student risk:', error);
      throw new Error('Failed to predict student risk');
    }
  }

  /**
   * Predict student grades
   */
  async predictGrades(studentId: string, assignmentId?: string): Promise<GradePrediction[]> {
    try {
      // Get upcoming assignments
      const assignmentsQuery = this.supabase
        .from('assignments')
        .select('*')
        .eq('tenant_id', this.tenantId)
        .gte('due_date', new Date().toISOString());

      if (assignmentId) {
        assignmentsQuery.eq('id', assignmentId);
      }

      const { data: assignments } = await assignmentsQuery;

      const predictions: GradePrediction[] = [];

      for (const assignment of assignments) {
        const prediction = await this.calculateGradePrediction(studentId, assignment);
        predictions.push(prediction);
      }

      return predictions;
    } catch (error) {
      console.error('Error predicting grades:', error);
      throw new Error('Failed to predict grades');
    }
  }

  /**
   * Predict attendance
   */
  async predictAttendance(studentId: string, days: number = 7): Promise<AttendancePrediction[]> {
    try {
      const predictions: AttendancePrediction[] = [];
      const today = new Date();

      for (let i = 1; i <= days; i++) {
        const futureDate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
        const prediction = await this.calculateAttendancePrediction(studentId, futureDate);
        predictions.push(prediction);
      }

      return predictions;
    } catch (error) {
      console.error('Error predicting attendance:', error);
      throw new Error('Failed to predict attendance');
    }
  }

  /**
   * Forecast enrollment
   */
  async forecastEnrollment(years: number = 3): Promise<EnrollmentForecast[]> {
    try {
      // Get historical enrollment data
      const { data: historicalData } = await this.supabase
        .from('enrollment_history')
        .select('*')
        .eq('tenant_id', this.tenantId)
        .order('year', { ascending: true });

      const forecasts: EnrollmentForecast[] = [];
      const currentYear = new Date().getFullYear();

      for (let i = 1; i <= years; i++) {
        const year = currentYear + i;
        const forecast = await this.calculateEnrollmentForecast(year, historicalData);
        forecasts.push(forecast);
      }

      return forecasts;
    } catch (error) {
      console.error('Error forecasting enrollment:', error);
      throw new Error('Failed to forecast enrollment');
    }
  }

  /**
   * Forecast resource demand
   */
  async forecastResourceDemand(
    resourceTypes: string[] = ['classroom', 'teacher', 'textbook']
  ): Promise<ResourceDemandForecast[]> {
    try {
      const forecasts: ResourceDemandForecast[] = [];

      for (const resourceType of resourceTypes) {
        const forecast = await this.calculateResourceDemandForecast(resourceType);
        forecasts.push(forecast);
      }

      return forecasts;
    } catch (error) {
      console.error('Error forecasting resource demand:', error);
      throw new Error('Failed to forecast resource demand');
    }
  }

  /**
   * Train predictive models
   */
  async trainModels(): Promise<PredictiveModel[]> {
    try {
      const models: PredictiveModel[] = [];

      // Train student risk model
      const riskModel = await this.trainStudentRiskModel();
      models.push(riskModel);

      // Train grade prediction model
      const gradeModel = await this.trainGradePredictionModel();
      models.push(gradeModel);

      // Train attendance prediction model
      const attendanceModel = await this.trainAttendancePredictionModel();
      models.push(attendanceModel);

      // Train enrollment forecasting model
      const enrollmentModel = await this.trainEnrollmentForecastModel();
      models.push(enrollmentModel);

      return models;
    } catch (error) {
      console.error('Error training models:', error);
      throw new Error('Failed to train predictive models');
    }
  }

  /**
   * Get model performance metrics
   */
  async getModelPerformance(modelId: string): Promise<{
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    confusion_matrix: number[][];
    feature_importance: Array<{
      feature: string;
      importance: number;
    }>;
  }> {
    try {
      // Get model from database
      const { data: model } = await this.supabase
        .from('predictive_models')
        .select('*')
        .eq('id', modelId)
        .eq('tenant_id', this.tenantId)
        .single();

      if (!model) {
        throw new Error('Model not found');
      }

      // Calculate performance metrics
      const performance = await this.calculateModelPerformance(model);

      return performance;
    } catch (error) {
      console.error('Error getting model performance:', error);
      throw new Error('Failed to get model performance');
    }
  }

  /**
   * Get prediction explanations
   */
  async explainPrediction(predictionId: string): Promise<{
    prediction: any;
    explanation: {
      top_factors: Array<{
        factor: string;
        impact: number;
        description: string;
      }>;
      confidence_factors: Array<{
        factor: string;
        contribution: number;
      }>;
      what_if_scenarios: Array<{
        scenario: string;
        predicted_outcome: any;
        probability: number;
      }>;
    };
  }> {
    try {
      // Get prediction data
      const { data: prediction } = await this.supabase
        .from('predictions')
        .select('*')
        .eq('id', predictionId)
        .eq('tenant_id', this.tenantId)
        .single();

      if (!prediction) {
        throw new Error('Prediction not found');
      }

      // Generate explanation
      const explanation = await this.generatePredictionExplanation(prediction);

      return {
        prediction,
        explanation,
      };
    } catch (error) {
      console.error('Error explaining prediction:', error);
      throw new Error('Failed to explain prediction');
    }
  }

  // Private helper methods

  private async calculateStudentRisk(
    studentId: string,
    analytics: any
  ): Promise<StudentRiskPrediction> {
    // Risk factors with weights
    const riskFactors = [
      {
        factor: 'Academic Performance',
        weight: 0.3,
        value: 100 - analytics.academic_performance.gpa * 25, // Convert GPA to risk score
      },
      {
        factor: 'Attendance Rate',
        weight: 0.25,
        value: 100 - analytics.attendance_patterns.attendance_rate,
      },
      {
        factor: 'Assignment Completion',
        weight: 0.2,
        value: 100 - analytics.academic_performance.assignment_completion_rate,
      },
      {
        factor: 'Engagement Level',
        weight: 0.15,
        value: 100 - analytics.engagement_metrics.participation_score,
      },
      {
        factor: 'Late Submissions',
        weight: 0.1,
        value: analytics.academic_performance.late_submission_rate,
      },
    ];

    // Calculate weighted risk score
    const riskScore = riskFactors.reduce((sum, factor) => {
      return sum + factor.value * factor.weight;
    }, 0);

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    if (riskScore < 25) riskLevel = 'low';
    else if (riskScore < 50) riskLevel = 'medium';
    else if (riskScore < 75) riskLevel = 'high';
    else riskLevel = 'critical';

    // Generate recommendations
    const recommendations = this.generateRiskRecommendations(riskLevel, riskFactors);

    return {
      student_id: studentId,
      risk_level: riskLevel,
      risk_score: Math.round(riskScore),
      risk_factors: riskFactors.map((factor) => ({
        factor: factor.factor,
        impact: factor.value * factor.weight,
        description: this.getRiskFactorDescription(factor.factor, factor.value),
      })),
      recommendations,
      confidence: 0.85,
      prediction_date: new Date().toISOString(),
    };
  }

  private async calculateGradePrediction(
    studentId: string,
    assignment: any
  ): Promise<GradePrediction> {
    // Get student's historical performance
    const { data: pastGrades } = await this.supabase
      .from('grades')
      .select('*')
      .eq('student_id', studentId)
      .eq('tenant_id', this.tenantId)
      .order('graded_at', { ascending: false })
      .limit(10);

    // Calculate prediction factors
    const factors = [
      {
        factor: 'Historical Performance',
        weight: 0.4,
        current_value: pastGrades?.length
          ? pastGrades.reduce((sum, g) => sum + g.points / g.max_points, 0) / pastGrades.length
          : 0.75,
      },
      {
        factor: 'Subject Proficiency',
        weight: 0.3,
        current_value: 0.8, // Would be calculated from subject-specific performance
      },
      {
        factor: 'Assignment Difficulty',
        weight: 0.2,
        current_value: assignment.difficulty || 0.7,
      },
      {
        factor: 'Time Until Due',
        weight: 0.1,
        current_value: this.calculateTimeUntilDue(assignment.due_date),
      },
    ];

    // Calculate predicted grade
    const predictedGrade =
      factors.reduce((sum, factor) => {
        return sum + factor.current_value * factor.weight;
      }, 0) * assignment.max_points;

    return {
      student_id: studentId,
      assignment_id: assignment.id,
      predicted_grade: Math.round(predictedGrade),
      confidence: 0.78,
      factors,
      improvement_suggestions: this.generateGradeImprovementSuggestions(factors),
    };
  }

  private async calculateAttendancePrediction(
    studentId: string,
    date: Date
  ): Promise<AttendancePrediction> {
    // Get historical attendance
    const { data: pastAttendance } = await this.supabase
      .from('attendance')
      .select('*')
      .eq('student_id', studentId)
      .eq('tenant_id', this.tenantId)
      .order('date', { ascending: false })
      .limit(30);

    // Calculate attendance factors
    const dayOfWeek = date.getDay();
    const weekdayAttendance =
      pastAttendance?.filter((a) => {
        const aDate = new Date(a.date);
        return aDate.getDay() === dayOfWeek;
      }) || [];

    const weekdayRate =
      weekdayAttendance.length > 0
        ? weekdayAttendance.filter((a) => a.status === 'present').length / weekdayAttendance.length
        : 0.9;

    const recentTrend = this.calculateRecentAttendanceTrend(pastAttendance);

    // Simple prediction model
    const probability = weekdayRate * 0.7 + recentTrend * 0.3;

    let predictedAttendance: 'present' | 'absent' | 'late';
    if (probability > 0.8) predictedAttendance = 'present';
    else if (probability > 0.6) predictedAttendance = 'late';
    else predictedAttendance = 'absent';

    return {
      student_id: studentId,
      date: date.toISOString().split('T')[0],
      predicted_attendance: predictedAttendance,
      probability,
      factors: [
        {
          factor: 'Weekday Pattern',
          influence: weekdayRate * 0.7,
        },
        {
          factor: 'Recent Trend',
          influence: recentTrend * 0.3,
        },
      ],
    };
  }

  private async calculateEnrollmentForecast(
    year: number,
    historicalData: any[]
  ): Promise<EnrollmentForecast> {
    // Simple linear regression forecast
    const years = historicalData.map((d) => d.year);
    const enrollments = historicalData.map((d) => d.enrollment);

    const forecast = this.linearRegression(years, enrollments, year);

    return {
      year,
      semester: 'fall',
      predicted_enrollment: Math.round(forecast.prediction),
      confidence_interval: {
        lower: Math.round(forecast.prediction * 0.9),
        upper: Math.round(forecast.prediction * 1.1),
      },
      factors: [
        {
          factor: 'Historical Trend',
          impact: 0.6,
        },
        {
          factor: 'Economic Factors',
          impact: 0.3,
        },
        {
          factor: 'Demographic Changes',
          impact: 0.1,
        },
      ],
      recommendations: [
        'Monitor enrollment trends closely',
        'Plan resource allocation accordingly',
        'Consider marketing campaigns if projections are low',
      ],
    };
  }

  private async calculateResourceDemandForecast(
    resourceType: string
  ): Promise<ResourceDemandForecast> {
    // Get current resource usage
    const { data: currentUsage } = await this.supabase
      .from('resource_usage')
      .select('*')
      .eq('resource_type', resourceType)
      .eq('tenant_id', this.tenantId)
      .order('date', { ascending: false })
      .limit(30);

    const avgUsage = currentUsage?.length
      ? currentUsage.reduce((sum, u) => sum + u.usage, 0) / currentUsage.length
      : 0;

    const projectedDemand = avgUsage * 1.1; // 10% growth assumption

    return {
      resource_type: resourceType,
      time_period: 'next_semester',
      predicted_demand: Math.round(projectedDemand),
      current_capacity: avgUsage,
      capacity_utilization: projectedDemand / avgUsage,
      shortage_risk: projectedDemand > avgUsage * 1.2 ? 'high' : 'low',
      recommendations: [
        'Monitor resource usage patterns',
        'Plan for capacity expansion if needed',
        'Optimize current resource allocation',
      ],
    };
  }

  private async trainStudentRiskModel(): Promise<PredictiveModel> {
    // Mock training process
    return {
      id: 'student_risk_model',
      name: 'Student Risk Prediction Model',
      type: 'classification',
      description: 'Predicts student risk levels based on academic and behavioral factors',
      accuracy: 0.87,
      last_trained: new Date().toISOString(),
      features: ['gpa', 'attendance_rate', 'assignment_completion', 'engagement_score'],
      target: 'risk_level',
      model_data: {}, // Would contain actual model weights/parameters
    };
  }

  private async trainGradePredictionModel(): Promise<PredictiveModel> {
    return {
      id: 'grade_prediction_model',
      name: 'Grade Prediction Model',
      type: 'regression',
      description: 'Predicts student grades on assignments',
      accuracy: 0.82,
      last_trained: new Date().toISOString(),
      features: ['historical_performance', 'subject_proficiency', 'assignment_difficulty'],
      target: 'grade',
      model_data: {},
    };
  }

  private async trainAttendancePredictionModel(): Promise<PredictiveModel> {
    return {
      id: 'attendance_prediction_model',
      name: 'Attendance Prediction Model',
      type: 'classification',
      description: 'Predicts student attendance patterns',
      accuracy: 0.79,
      last_trained: new Date().toISOString(),
      features: ['weekday_pattern', 'recent_trend', 'weather', 'events'],
      target: 'attendance_status',
      model_data: {},
    };
  }

  private async trainEnrollmentForecastModel(): Promise<PredictiveModel> {
    return {
      id: 'enrollment_forecast_model',
      name: 'Enrollment Forecast Model',
      type: 'forecasting',
      description: 'Forecasts future enrollment numbers',
      accuracy: 0.75,
      last_trained: new Date().toISOString(),
      features: ['historical_enrollment', 'economic_indicators', 'demographic_trends'],
      target: 'enrollment',
      model_data: {},
    };
  }

  private async calculateModelPerformance(model: any): Promise<any> {
    // Mock performance calculation
    return {
      accuracy: model.accuracy,
      precision: 0.85,
      recall: 0.83,
      f1_score: 0.84,
      confusion_matrix: [
        [45, 5],
        [8, 42],
      ],
      feature_importance: [
        { feature: 'gpa', importance: 0.35 },
        { feature: 'attendance_rate', importance: 0.28 },
        { feature: 'assignment_completion', importance: 0.22 },
        { feature: 'engagement_score', importance: 0.15 },
      ],
    };
  }

  private async generatePredictionExplanation(prediction: any): Promise<any> {
    return {
      top_factors: [
        {
          factor: 'Academic Performance',
          impact: 0.35,
          description: "Student's GPA is below average",
        },
        {
          factor: 'Attendance Rate',
          impact: 0.28,
          description: 'Student has missed 15% of classes',
        },
      ],
      confidence_factors: [
        {
          factor: 'Data Quality',
          contribution: 0.4,
        },
        {
          factor: 'Historical Accuracy',
          contribution: 0.6,
        },
      ],
      what_if_scenarios: [
        {
          scenario: 'If attendance improves to 95%',
          predicted_outcome: 'Risk level would decrease to medium',
          probability: 0.8,
        },
      ],
    };
  }

  // Utility methods

  private generateRiskRecommendations(riskLevel: string, factors: any[]): any[] {
    const recommendations = [];

    if (riskLevel === 'high' || riskLevel === 'critical') {
      recommendations.push({
        action: 'Schedule immediate intervention meeting',
        priority: 'high',
        estimated_impact: 0.7,
        timeline: '1 week',
      });
    }

    // Add more recommendations based on specific risk factors
    const highRiskFactors = factors.filter((f) => f.value > 60);
    for (const factor of highRiskFactors) {
      recommendations.push({
        action: `Address ${factor.factor.toLowerCase()} concerns`,
        priority: 'medium',
        estimated_impact: 0.5,
        timeline: '2-4 weeks',
      });
    }

    return recommendations;
  }

  private getRiskFactorDescription(factor: string, value: number): string {
    const descriptions: Record<string, string> = {
      'Academic Performance': value > 50 ? 'Below average GPA' : 'Good academic standing',
      'Attendance Rate': value > 50 ? 'High absenteeism' : 'Good attendance',
      'Assignment Completion':
        value > 50 ? 'Missing assignments' : 'Completing assignments on time',
      'Engagement Level': value > 50 ? 'Low participation' : 'Active participation',
      'Late Submissions': value > 50 ? 'Frequent late submissions' : 'Timely submissions',
    };
    return descriptions[factor] || 'No description available';
  }

  private generateGradeImprovementSuggestions(factors: any[]): string[] {
    const suggestions = [];

    for (const factor of factors) {
      if (factor.current_value < 0.7) {
        switch (factor.factor) {
          case 'Historical Performance':
            suggestions.push('Review previous assignments to identify improvement areas');
            break;
          case 'Subject Proficiency':
            suggestions.push('Seek additional help or tutoring in this subject');
            break;
          case 'Assignment Difficulty':
            suggestions.push('Break down complex assignments into smaller tasks');
            break;
          case 'Time Until Due':
            suggestions.push('Start working on the assignment early');
            break;
        }
      }
    }

    return suggestions;
  }

  private calculateTimeUntilDue(dueDate: string): number {
    const due = new Date(dueDate);
    const now = new Date();
    const daysUntilDue = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    // Normalize to 0-1 scale (more days = better)
    return Math.min(1, Math.max(0, daysUntilDue / 7));
  }

  private calculateRecentAttendanceTrend(attendance: any[]): number {
    if (!attendance || attendance.length < 5) return 0.9;

    const recent = attendance.slice(0, 5);
    const presentCount = recent.filter((a) => a.status === 'present').length;

    return presentCount / recent.length;
  }

  private linearRegression(x: number[], y: number[], predictX: number): { prediction: number } {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return {
      prediction: slope * predictX + intercept,
    };
  }
}

// Factory function
export function createPredictiveAnalytics(tenantId: string): PredictiveAnalytics {
  return new PredictiveAnalytics(tenantId);
}
