-- AEMS Job Placements Support (025)

CREATE TABLE IF NOT EXISTS job_placements (
  id CHAR(36) PRIMARY KEY,
  student_id CHAR(36) NOT NULL,
  employer_id CHAR(36) NOT NULL,
  job_id CHAR(36) NOT NULL,
  application_id CHAR(36) NOT NULL,
  selection_date DATETIME NOT NULL,
  joining_date DATETIME DEFAULT NULL,
  package VARCHAR(255) DEFAULT NULL,
  status ENUM('Pending Offer', 'Offer Sent', 'Offer Accepted', 'Offer Declined', 'Joined') DEFAULT 'Pending Offer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (employer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
  FOREIGN KEY (application_id) REFERENCES job_applications(id) ON DELETE CASCADE
);
