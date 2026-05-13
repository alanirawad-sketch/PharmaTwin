import type { Medication, Profile } from "@workspace/db";

export type GeneratedInsight = {
  category: string;
  title: string;
  description: string;
  severity: "low" | "moderate" | "high" | "critical";
  affectedPercentage: number;
};

export type GeneratedRecommendation = {
  type: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
};

function roundPct(n: number) {
  return Math.round(n * 10) / 10;
}

export function runSimulation(
  med: Medication,
  profile: Profile
): { adherenceScore: number; insights: GeneratedInsight[]; recommendations: GeneratedRecommendation[] } {
  const insights: GeneratedInsight[] = [];
  const recommendations: GeneratedRecommendation[] = [];
  let adherencePenalty = 0;

  const halfLife = Number(med.halfLifeHours);
  const sleep = Number(profile.sleepHours);
  const dosing = med.dosingFrequency.toLowerCase();
  const isMultiDose = dosing.includes("twice") || dosing.includes("three") || dosing.includes("every 8") || dosing.includes("every 6") || dosing.includes("bid") || dosing.includes("tid");

  // Night shift timing conflict
  if (profile.workSchedule === "night_shift") {
    const pct = isMultiDose ? 43 : 28;
    adherencePenalty += 15;
    insights.push({
      category: "timing_conflict",
      title: "Night Shift Dosing Window Conflict",
      description: `Night-shift workers commonly miss dose ${isMultiDose ? "2" : "1"} by up to ${pct}% due to inverted circadian rhythms and irregular meal schedules. Standard dosing instructions assume daytime activity.`,
      severity: "high",
      affectedPercentage: roundPct(pct),
    });
    recommendations.push({
      type: "notification",
      title: "Shift-Adaptive Dosing Reminders",
      description: "Provide configurable alarm templates for night-shift workers that anchor dose times to sleep/wake cycles rather than clock time.",
      priority: "high",
    });
  }

  // Fasting conflict
  if (profile.fastingPractice === "ramadan") {
    adherencePenalty += 20;
    insights.push({
      category: "fasting_conflict",
      title: "Ramadan Fasting Causes Timing Instability",
      description: `During Ramadan, meal-dependent dosing shifts by up to 12 hours. If ${med.name} requires food for absorption or to reduce GI irritation, timing errors can reduce efficacy by an estimated 22%.`,
      severity: "critical",
      affectedPercentage: roundPct(38 + Math.random() * 10),
    });
    recommendations.push({
      type: "patient_education",
      title: "Ramadan Medication Protocol Insert",
      description: "Include a dedicated package insert in Arabic and English explaining adjusted dosing windows for fasting months, reviewed by Islamic medical advisors.",
      priority: "high",
    });
  } else if (profile.fastingPractice === "intermittent") {
    adherencePenalty += 8;
    insights.push({
      category: "fasting_conflict",
      title: "Intermittent Fasting Creates Dose Window Compression",
      description: `Patients practicing 16:8 or similar protocols compress meal windows, creating a ${isMultiDose ? "high" : "moderate"} risk of missed or inadequately spaced doses.`,
      severity: isMultiDose ? "high" : "moderate",
      affectedPercentage: roundPct(29 + Math.random() * 8),
    });
  }

  // Caffeine interaction
  if (profile.caffeineIntake === "heavy") {
    adherencePenalty += 5;
    insights.push({
      category: "substance_interaction",
      title: "Heavy Caffeine Use Amplifies Side Effects",
      description: `Patients consuming 4+ cups daily report increased anxiety and heart palpitations when taking ${med.name}. This leads to self-discontinuation in an estimated 19% of heavy caffeine users within 30 days.`,
      severity: "moderate",
      affectedPercentage: roundPct(19 + Math.random() * 6),
    });
    recommendations.push({
      type: "patient_education",
      title: "Caffeine Interaction Advisory Label",
      description: "Add a prominent caffeine interaction warning on blister packaging with specific daily limits and symptom monitoring guidance.",
      priority: "medium",
    });
  }

  // Travel disruption
  if (profile.travelFrequency === "frequent" || profile.travelFrequency === "very_frequent") {
    adherencePenalty += 12;
    insights.push({
      category: "travel_impact",
      title: "Frequent Travel Disrupts Medication Rhythm",
      description: `Time zone changes and irregular schedules cause ${profile.travelFrequency === "very_frequent" ? "37" : "24"}% of frequent travelers to miss or double-dose during transit periods. Carry-on restrictions further reduce compliance.`,
      severity: profile.travelFrequency === "very_frequent" ? "high" : "moderate",
      affectedPercentage: roundPct(profile.travelFrequency === "very_frequent" ? 37 : 24),
    });
    recommendations.push({
      type: "travel_packaging",
      title: "TSA-Compliant Travel Pack Format",
      description: "Introduce single-dose blister strips in a TSA-compliant card format with time-zone-adjustment instructions printed on the reverse.",
      priority: "high",
    });
  }

  // Sleep disruption
  if (sleep < 6) {
    adherencePenalty += 10;
    insights.push({
      category: "sleep_disruption",
      title: "Sleep Deprivation Increases Missed Morning Doses",
      description: `Patients averaging under 6 hours of sleep miss morning doses at 2.4x the rate of well-rested patients. Cognitive fog also leads to accidental double-dosing in 8% of cases.`,
      severity: "high",
      affectedPercentage: roundPct(31 + Math.random() * 7),
    });
  }

  // Stress impact
  if (profile.stressLevel === "high" || profile.stressLevel === "very_high") {
    adherencePenalty += 8;
    insights.push({
      category: "stress_impact",
      title: "High Stress Correlates with Adherence Breakdown",
      description: `Under ${profile.stressLevel === "very_high" ? "very high" : "high"} stress conditions, patients deprioritize medication routines. Adherence drops during peak stress periods (exams, deadlines) by up to 34%.`,
      severity: profile.stressLevel === "very_high" ? "high" : "moderate",
      affectedPercentage: roundPct(34 * (profile.stressLevel === "very_high" ? 1 : 0.75)),
    });
    recommendations.push({
      type: "notification",
      title: "Stress-Triggered Reminder Escalation",
      description: "Smart packaging with NFC tap-to-snooze for reminders, plus escalating notifications during calendar events flagged as high-priority.",
      priority: "medium",
    });
  }

  // Student/exam pattern
  if (profile.workSchedule === "student" && profile.stressLevel !== "low") {
    adherencePenalty += 7;
    insights.push({
      category: "social_inconvenience",
      title: "Students Discontinue During Exam Periods",
      description: `Student patients show a 41% drop in adherence during exam seasons. Social stigma of taking medication in shared spaces and irregular meal schedules both contribute.`,
      severity: "high",
      affectedPercentage: roundPct(41),
    });
    recommendations.push({
      type: "packaging",
      title: "Discreet Student-Friendly Form Factor",
      description: "Redesign packaging to resemble a pocket notebook or card wallet. Eliminate clinical labeling visible from arm's length to reduce stigma in shared study environments.",
      priority: "high",
    });
  }

  // Exercise interaction
  if (profile.exerciseFrequency === "heavy" || profile.exerciseFrequency === "athlete") {
    adherencePenalty += 5;
    insights.push({
      category: "timing_conflict",
      title: "Intense Exercise Alters Drug Absorption",
      description: `High-intensity exercise increases blood flow redistribution and can alter ${med.name}'s absorption rate by up to 18%. Athletes report avoiding doses before training, creating dangerous gaps.`,
      severity: "moderate",
      affectedPercentage: roundPct(22 + Math.random() * 8),
    });
    recommendations.push({
      type: "dosage_timing",
      title: "Exercise-Adjusted Dosing Window Guidance",
      description: `Include an athletics-specific insert recommending doses be taken at least ${halfLife > 12 ? "2 hours" : "1 hour"} before or after high-intensity exercise, with physiological rationale.`,
      priority: "medium",
    });
  }

  // Missed dose risk for multi-dose regimens
  if (isMultiDose && (profile.workSchedule === "irregular" || profile.workSchedule === "remote")) {
    adherencePenalty += 9;
    insights.push({
      category: "missed_dose",
      title: "Irregular Schedule Causes Multi-Dose Confusion",
      description: `Patients on irregular schedules who require multiple daily doses forget their second or third dose in 33% of observed cycles. No fixed routine anchor point means doses are tied to meals that vary by 4+ hours.`,
      severity: "high",
      affectedPercentage: roundPct(33),
    });
    recommendations.push({
      type: "packaging",
      title: "Time-Indexed Blister Card Redesign",
      description: "Redesign blister packaging with a 24-hour dial punch system rather than a linear strip. Each dose cell is stamped with a time window, not a fixed clock time.",
      priority: "high",
    });
  }

  // Food interaction
  if (profile.dietType === "keto" && dosing.includes("with food")) {
    adherencePenalty += 6;
    insights.push({
      category: "food_interaction",
      title: "Ketogenic Diet Alters Drug Metabolism",
      description: `Patients on a ketogenic diet show altered hepatic enzyme activity that affects ${med.name}'s metabolic pathway. High-fat meals accelerate absorption but reduce peak plasma concentration consistency.`,
      severity: "moderate",
      affectedPercentage: roundPct(21 + Math.random() * 6),
    });
  }

  // Halal/Kosher dietary restrictions
  if (profile.dietType === "halal" || profile.dietType === "kosher") {
    insights.push({
      category: "social_inconvenience",
      title: "Excipient Compliance Concern",
      description: `${profile.dietType === "halal" ? "Halal" : "Kosher"}-observant patients may be concerned about gelatin capsule shells or alcohol-based excipients. This creates hesitancy and self-discontinuation in religiously observant communities.`,
      severity: "moderate",
      affectedPercentage: roundPct(17 + Math.random() * 5),
    });
    recommendations.push({
      type: "label_design",
      title: `${profile.dietType === "halal" ? "Halal" : "Kosher"} Certification Label`,
      description: `Display ${profile.dietType} certification prominently on outer packaging. If currently uncertified, evaluate reformulation with plant-based excipients to capture this market segment.`,
      priority: "medium",
    });
  }

  // Add general packaging recommendation if not already present
  if (recommendations.filter(r => r.type === "packaging").length === 0 && adherencePenalty > 10) {
    recommendations.push({
      type: "packaging",
      title: "Smart Adherence Packaging Integration",
      description: `Based on the ${profile.demographicGroup} profile, consider NFC-enabled blister strips that log dose removal timestamps, providing real-world adherence data for post-market surveillance.`,
      priority: "medium",
    });
  }

  const adherenceScore = Math.max(30, Math.min(99, 92 - adherencePenalty + (Math.random() * 6 - 3)));

  return {
    adherenceScore: roundPct(adherenceScore),
    insights,
    recommendations,
  };
}
