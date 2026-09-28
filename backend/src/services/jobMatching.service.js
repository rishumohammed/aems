import { pool } from '../db/connection.js';

/**
 * Educational qualification levels for hierarchical matching
 */
const QUALIFICATION_LEVELS = {
  'phd': 5,
  'doctorate': 5,
  'masters': 4,
  'master\'s': 4,
  'post graduate': 4,
  'mca': 4,
  'mtech': 4,
  'm.tech': 4,
  'mba': 4,
  'msc': 4,
  'm.sc': 4,
  'bachelors': 3,
  'bachelor\'s': 3,
  'graduate': 3,
  'btech': 3,
  'b.tech': 3,
  'be': 3,
  'b.e': 3,
  'bca': 3,
  'bsc': 3,
  'b.sc': 3,
  'bcom': 3,
  'b.com': 3,
  'ba': 3,
  'bba': 3,
  'diploma': 2,
  'high school': 1,
  'plus two': 1,
  '12th': 1,
  '10th': 0,
  'other': 0
};

/**
 * Helper to normalize and get qualification level integer
 */
function getQualificationLevel(qualStr) {
  if (!qualStr) return 0;
  const clean = qualStr.toLowerCase().trim();
  for (const [key, level] of Object.entries(QUALIFICATION_LEVELS)) {
    if (clean.includes(key)) return level;
  }
  return 1;
}

/**
 * Extract minimum required years from an experience string like "2-3 Years", "2+ Years", "Fresher"
 */
function parseRequiredExperience(expStr) {
  if (!expStr) return 0;
  if (typeof expStr === 'number') return expStr;
  const clean = String(expStr).toLowerCase();
  if (clean.includes('fresher') || clean.includes('entry') || clean.includes('no experience')) {
    return 0;
  }
  const match = clean.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Normalize a list of skills from JSON array, string array, or comma-separated string
 */
function normalizeSkills(skillsInput) {
  if (!skillsInput) return [];
  let skills = [];
  if (Array.isArray(skillsInput)) {
    skills = skillsInput;
  } else if (typeof skillsInput === 'string') {
    try {
      const parsed = JSON.parse(skillsInput);
      if (Array.isArray(parsed)) skills = parsed;
      else skills = skillsInput.split(',').map(s => s.trim());
    } catch {
      skills = skillsInput.split(',').map(s => s.trim());
    }
  }
  return skills.filter(Boolean).map(s => String(s).toLowerCase().trim());
}

/**
 * Match a specific student/applicant profile against a job criteria
 */
export function calculateJobMatch(job, student) {
  if (!job || !student) {
    return {
      matchScore: 0,
      isMatched: false,
      criteriaBreakdown: {},
      matchedSkills: [],
      missingSkills: []
    };
  }

  // Parse job requirements
  let reqSkills = [];
  let niceSkills = [];
  let jobReqJson = {};
  if (job.requirements_json) {
    try {
      jobReqJson = typeof job.requirements_json === 'string' ? JSON.parse(job.requirements_json) : job.requirements_json;
      reqSkills = normalizeSkills(jobReqJson.required || []);
      niceSkills = normalizeSkills(jobReqJson.nice_to_have || []);
    } catch (e) {
      reqSkills = [];
      niceSkills = [];
    }
  }

  const jobQualReq = job.qualification_req || jobReqJson.qualification_req || null;
  const jobExpReq = parseRequiredExperience(jobReqJson.experience_level || job.experience_level || job.experience_req || 0);
  const jobSpecReq = (job.specialization_req || '').toLowerCase().trim();
  const jobGenderReq = (job.gender_preference || 'any').toLowerCase().trim();
  const jobJoiningReq = (job.joining_status_req || '').toLowerCase().trim();
  
  let jobLangReq = [];
  if (job.language_req) {
    try {
      const parsed = typeof job.language_req === 'string' ? JSON.parse(job.language_req) : job.language_req;
      if (Array.isArray(parsed)) jobLangReq = parsed.map(l => l.toLowerCase().trim());
    } catch {
      jobLangReq = [];
    }
  }

  // Parse student data
  const studentSkills = normalizeSkills(student.skills || student.skills_json || []);
  const studentExpYears = parseInt(student.experience_years || 0, 10);
  const studentQual = student.qualification || student.education_level || student.highest_qualification || '';
  const studentSpec = (student.field_of_study || student.specialization || '').toLowerCase().trim();
  const studentGender = (student.gender || student.applicant_gender || '').toLowerCase().trim();
  const studentJoining = (student.joining_status || '').toLowerCase().trim();
  
  let studentLangs = [];
  if (student.language_proficiency) {
    try {
      const parsed = typeof student.language_proficiency === 'string' ? JSON.parse(student.language_proficiency) : student.language_proficiency;
      if (Array.isArray(parsed)) studentLangs = parsed.map(l => l.toLowerCase().trim());
    } catch {
      studentLangs = [];
    }
  }

  // 1. Qualification & Specialization Score (25 pts)
  let qualScore = 25;
  let qualMatched = true;
  let qualDetails = 'Matches or exceeds requirement';

  if (jobQualReq) {
    const reqLevel = getQualificationLevel(jobQualReq);
    const stuLevel = getQualificationLevel(studentQual);
    if (stuLevel >= reqLevel) {
      qualScore = 25;
      qualMatched = true;
      qualDetails = `${studentQual || 'Degree'} meets ${jobQualReq} requirement`;
    } else if (stuLevel === reqLevel - 1) {
      qualScore = 15;
      qualMatched = false;
      qualDetails = `${studentQual || 'Under-qualified'} (requires ${jobQualReq})`;
    } else {
      qualScore = 5;
      qualMatched = false;
      qualDetails = `Requires ${jobQualReq}`;
    }
  } else {
    qualScore = 25;
    qualMatched = true;
    qualDetails = studentQual ? `${studentQual} (No strict restriction)` : 'Open qualification';
  }

  // Specialization check bonus/penalty
  if (jobSpecReq) {
    const hasSpecMatch = studentSpec.includes(jobSpecReq) || 
      (student.education_json && JSON.stringify(student.education_json).toLowerCase().includes(jobSpecReq));
    if (hasSpecMatch) {
      qualScore = Math.min(25, qualScore + 5);
    } else if (qualScore > 10) {
      qualScore = Math.max(10, qualScore - 5);
    }
  }

  // 2. Skills Match (35 pts)
  const matchedRequired = [];
  const missingRequired = [];

  for (const rSkill of reqSkills) {
    const isPresent = studentSkills.some(s => s.includes(rSkill) || rSkill.includes(s));
    if (isPresent) {
      matchedRequired.push(rSkill);
    } else {
      missingRequired.push(rSkill);
    }
  }

  const matchedNice = [];
  for (const nSkill of niceSkills) {
    const isPresent = studentSkills.some(s => s.includes(nSkill) || nSkill.includes(s));
    if (isPresent) matchedNice.push(nSkill);
  }

  let skillsScore = 35;
  if (reqSkills.length > 0) {
    const reqRatio = matchedRequired.length / reqSkills.length;
    const niceRatio = niceSkills.length > 0 ? (matchedNice.length / niceSkills.length) : 0;
    skillsScore = Math.round((reqRatio * 30) + (niceRatio * 5));
  } else if (studentSkills.length > 0) {
    // If job didn't specify required skills, candidate gets full points if they have skills
    skillsScore = 35;
  }

  // 3. Experience Match (20 pts)
  let expScore = 20;
  let expMatched = true;
  let expDetails = `${studentExpYears} Yrs Experience`;

  if (jobExpReq > 0) {
    if (studentExpYears >= jobExpReq) {
      expScore = 20;
      expMatched = true;
      expDetails = `${studentExpYears} Yrs (Meets ${jobExpReq}+ Yrs requirement)`;
    } else if (studentExpYears >= jobExpReq - 1) {
      expScore = 12;
      expMatched = false;
      expDetails = `${studentExpYears} Yrs (${jobExpReq} Yrs required)`;
    } else {
      expScore = 5;
      expMatched = false;
      expDetails = `${studentExpYears} Yrs (Under ${jobExpReq} Yrs required)`;
    }
  } else {
    expScore = 20;
    expMatched = true;
    expDetails = studentExpYears > 0 ? `${studentExpYears} Yrs (Entry level friendly)` : 'Fresher / Entry level';
  }

  // 4. Certifications & Platform Progress (10 pts)
  const certsActiveCount = parseInt(student.certs_active || student.active_certificates_count || 0, 10);
  const coursesCompletedCount = parseInt(student.courses_completed || student.completed_courses_count || 0, 10);
  let certsScore = 5;
  let certsMatched = false;

  if (certsActiveCount > 0 || coursesCompletedCount > 0) {
    certsScore = 10;
    certsMatched = true;
  } else {
    certsScore = 3;
    certsMatched = false;
  }

  // 5. Availability, Language & Gender Preference (10 pts)
  let prefScore = 10;
  let genderMatched = true;
  let langMatched = true;
  let joiningMatched = true;

  // Gender
  if (jobGenderReq !== 'any' && jobGenderReq !== '') {
    if (studentGender && studentGender !== jobGenderReq) {
      genderMatched = false;
      prefScore -= 4;
    }
  }

  // Languages
  if (jobLangReq.length > 0) {
    const hasLang = jobLangReq.some(l => studentLangs.includes(l));
    if (!hasLang) {
      langMatched = false;
      prefScore -= 3;
    }
  }

  // Joining
  if (jobJoiningReq && studentJoining) {
    if (jobJoiningReq === 'immediate' && studentJoining !== 'immediate') {
      joiningMatched = false;
      prefScore -= 3;
    }
  }

  prefScore = Math.max(0, prefScore);

  // Overall Match Score
  const totalScore = Math.min(100, Math.max(0, qualScore + skillsScore + expScore + certsScore + prefScore));
  
  // Is Matched criteria: minimum 55% score AND satisfies qualification & experience thresholds
  const isMatch = totalScore >= 55 && (reqSkills.length === 0 || matchedRequired.length >= Math.ceil(reqSkills.length * 0.4));

  return {
    matchScore: totalScore,
    isMatch,
    criteriaBreakdown: {
      qualification: {
        matched: qualMatched,
        required: jobQualReq || 'Open',
        actual: studentQual || 'Not Specified',
        score: qualScore,
        details: qualDetails
      },
      experience: {
        matched: expMatched,
        required: jobExpReq > 0 ? `${jobExpReq}+ Yrs` : 'Fresher / Any',
        actual: `${studentExpYears} Yrs`,
        score: expScore,
        details: expDetails
      },
      skills: {
        matched: missingRequired.length === 0,
        requiredCount: reqSkills.length,
        matchedCount: matchedRequired.length,
        matchedSkills: matchedRequired,
        missingSkills: missingRequired,
        score: skillsScore
      },
      certifications: {
        matched: certsMatched,
        activeCerts: certsActiveCount,
        completedCourses: coursesCompletedCount,
        score: certsScore
      },
      preferences: {
        genderMatched,
        languageMatched: langMatched,
        joiningMatched,
        score: prefScore
      }
    },
    matchedSkills: matchedRequired,
    missingSkills: missingRequired
  };
}

/**
 * Fetch all registered students and rank them against a specific job
 */
export async function getJobMatchedCandidates(jobId, options = {}) {
  const { minScore = 0, limit = 100 } = options;

  // 1. Fetch Job
  const [jobs] = await pool.query('SELECT * FROM jobs WHERE id = ?', [jobId]);
  if (!jobs.length) {
    throw new Error('Job not found');
  }
  const job = jobs[0];

  // 2. Fetch all active students with their profiles, certifications, and application status for this job
  const [students] = await pool.query(`
    SELECT 
      u.id as student_id,
      u.name,
      u.email,
      u.phone,
      u.created_at as registered_at,
      up.avatar_url,
      sp.gender,
      sp.date_of_birth,
      sp.education_level,
      sp.college_name,
      sp.education_json,
      sp.experience_years,
      sp.current_status,
      sp.last_company,
      sp.last_role,
      sp.skills,
      sp.language_proficiency,
      sp.joining_status,
      sp.linkedin_url,
      -- Platform Certifications
      (SELECT COUNT(*) FROM certificates c WHERE c.student_id = u.id AND c.status = 'active') as certs_active,
      (
        SELECT GROUP_CONCAT(co.title SEPARATOR '||')
        FROM certificates c
        JOIN courses co ON c.course_id = co.id
        WHERE c.student_id = u.id AND c.status = 'active'
      ) as active_cert_names,
      -- Completed Courses
      (SELECT COUNT(*) FROM enrollments e WHERE e.student_id = u.id AND e.status = 'completed') as courses_completed,
      -- Application status if already applied
      ja.id as application_id,
      ja.status as application_status,
      ja.applied_at
    FROM users u
    LEFT JOIN user_profiles up ON u.id = up.user_id
    LEFT JOIN student_profiles sp ON u.id = sp.user_id
    LEFT JOIN job_applications ja ON (ja.job_id = ? AND ja.student_id = u.id)
    WHERE u.role = 'student' AND u.status = 'active' AND u.deleted_at IS NULL
  `, [jobId]);

  // 3. Score every candidate
  const evaluatedCandidates = students.map(student => {
    const match = calculateJobMatch(job, student);
    return {
      ...student,
      matchScore: match.matchScore,
      isMatch: match.isMatch,
      criteriaBreakdown: match.criteriaBreakdown,
      matchedSkills: match.matchedSkills,
      missingSkills: match.missingSkills,
      isApplied: Boolean(student.application_id)
    };
  });

  // Filter by minScore and sort descending by matchScore
  const filtered = evaluatedCandidates
    .filter(c => c.matchScore >= minScore)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  return {
    job: {
      id: job.id,
      title: job.title,
      company: job.company,
      location: job.location,
      type: job.type,
      qualification_req: job.qualification_req,
      experience_level: job.experience_level,
      requirements_json: job.requirements_json
    },
    totalMatchedCount: filtered.filter(c => c.isMatch).length,
    candidates: filtered
  };
}
