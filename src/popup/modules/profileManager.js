// Profile management functions
export function populateProfile(profile) {
  if (!profile) return;

  // Populate personal information
  document.getElementById('fullName').value = profile.personal?.fullName || '';
  document.getElementById('email').value = profile.personal?.email || '';
  document.getElementById('phone').value = profile.personal?.phone || '';
  document.getElementById('location').value = profile.personal?.location || '';
  document.getElementById('website').value = profile.personal?.website || '';
  document.getElementById('linkedin').value = profile.personal?.linkedin || '';
  document.getElementById('summary').value = profile.personal?.summary || '';

  // Helper function to format date string
  function formatDate(dateStr) {
      if (!dateStr) return '';
      try {
          // Handle YYYY format
          if (/^\d{4}$/.test(dateStr)) {
              return dateStr;
          }

          // Handle MM/YYYY format
          const [month, year] = dateStr.split('/');
          if (month && year) {
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              return `${months[parseInt(month) - 1]} ${year}`;
          }

          // Handle other date formats (fallback)
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
              const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              return `${months[date.getMonth()]} ${date.getFullYear()}`;
          }
      } catch (e) {
          console.error('Date parsing error:', e);
      }
      return dateStr;
  }

  // Handle Experience section
  const experienceContainer = document.getElementById('experienceContainer');
  if (!experienceContainer.children.length) {
      const template = document.createElement('div');
      // Update the experience template in populateProfile function
      template.className = 'experience-entry';
      template.innerHTML = `
          <div class="entry-header">
              <button type="button" class="delete-entry" onclick="this.closest('.experience-entry').remove()">×</button>
          </div>
          <input type="text" name="jobTitle" placeholder="Job Title">
          <input type="text" name="company" placeholder="Company">
          <input type="text" name="location" placeholder="Location">
          <div class="date-range">
              <input type="text" name="startDate" placeholder="Start Date">
              <input type="text" name="endDate" placeholder="End Date">
          </div>
          <textarea name="responsibilities" placeholder="Key Responsibilities and Achievements"></textarea>
      `;
      experienceContainer.appendChild(template);
  }
  const experienceTemplate = experienceContainer.children[0].cloneNode(true);
  experienceContainer.innerHTML = '';

  // Handle Education section
  const educationContainer = document.getElementById('educationContainer');
  if (!educationContainer.children.length) {
      const template = document.createElement('div');
      // Update the education template in populateProfile function
      template.className = 'education-entry';
      template.innerHTML = `
          <div class="entry-header">
              <button type="button" class="delete-entry" onclick="this.closest('.education-entry').remove()">×</button>
          </div>
          <input type="text" name="degree" placeholder="Degree">
          <input type="text" name="school" placeholder="School">
          <input type="text" name="field" placeholder="Field of Study">
          <div class="date-range">
              <input type="text" name="startDate" placeholder="Start Date">
              <input type="text" name="endDate" placeholder="End Date">
          </div>
          <textarea name="achievements" placeholder="Achievements and Activities"></textarea>
      `;
      educationContainer.appendChild(template);
  }
  const educationTemplate = educationContainer.children[0].cloneNode(true);
  educationContainer.innerHTML = '';

  // Populate experience entries
  // In populateProfile function, update both experience and education population parts
  // For experience entries
  if (Array.isArray(profile.experience) && profile.experience.length > 0) {
      profile.experience.forEach(exp => {
          const entry = experienceTemplate.cloneNode(true);
          // Add event listener to the delete button
          entry.querySelector('.delete-entry').addEventListener('click', function () {
              const container = this.closest('.experience-entry').parentElement;
              this.closest('.experience-entry').remove();
              if (container.children.length === 0) {
                  const template = experienceTemplate.cloneNode(true);
                  template.querySelectorAll('input, textarea').forEach(input => input.value = '');
                  template.querySelector('.delete-entry').addEventListener('click', function () {
                      const container = this.closest('.experience-entry').parentElement;
                      this.closest('.experience-entry').remove();
                      if (container.children.length === 0) {
                          const emptyTemplate = experienceTemplate.cloneNode(true);
                          emptyTemplate.querySelectorAll('input, textarea').forEach(input => input.value = '');
                          container.appendChild(emptyTemplate);
                      }
                  });
                  container.appendChild(template);
              }
          });
          entry.querySelector('[name="jobTitle"]').value = exp.jobTitle || '';
          entry.querySelector('[name="company"]').value = exp.company || '';
          entry.querySelector('[name="location"]').value = exp.location || '';
          entry.querySelector('[name="startDate"]').value = formatDate(exp.startDate);
          entry.querySelector('[name="endDate"]').value = formatDate(exp.endDate);
          entry.querySelector('[name="responsibilities"]').value = exp.responsibilities || '';
          experienceContainer.appendChild(entry);
      });
  } else {
      const emptyEntry = experienceTemplate.cloneNode(true);
      emptyEntry.querySelectorAll('input, textarea').forEach(input => input.value = '');
      emptyEntry.querySelector('.delete-entry').addEventListener('click', function () {
          const container = this.closest('.experience-entry').parentElement;
          this.closest('.experience-entry').remove();
          if (container.children.length === 0) {
              const template = experienceTemplate.cloneNode(true);
              template.querySelectorAll('input, textarea').forEach(input => input.value = '');
              container.appendChild(template);
          }
      });
      experienceContainer.appendChild(emptyEntry);
  }

  // Populate education entries
  if (Array.isArray(profile.education) && profile.education.length > 0) {
      profile.education.forEach(edu => {
          const entry = educationTemplate.cloneNode(true);
          // Add event listener to the delete button
          entry.querySelector('.delete-entry').addEventListener('click', function () {
              this.closest('.education-entry').remove();
          });
          entry.querySelector('[name="degree"]').value = edu.degree || '';
          entry.querySelector('[name="school"]').value = edu.school || '';
          entry.querySelector('[name="field"]').value = edu.field || '';
          entry.querySelector('[name="startDate"]').value = formatDate(edu.startDate);
          entry.querySelector('[name="endDate"]').value = formatDate(edu.endDate);
          entry.querySelector('[name="achievements"]').value = edu.achievements || '';
          educationContainer.appendChild(entry);
      });
  } else {
      educationContainer.appendChild(educationTemplate);
  }

  // Handle Skills section
  const skillsValue = Array.isArray(profile.skills) ? profile.skills.join(', ') : '';
  document.getElementById('skills').value = skillsValue;

  const projectsContainer = document.getElementById('projectsContainer');
  if (!projectsContainer.children.length) {
      const template = document.createElement('div');
      template.className = 'project-entry';
      template.innerHTML = `
          <div class="entry-header">
              <button type="button" class="delete-entry" onclick="this.closest('.project-entry').remove()">×</button>
          </div>
          <input type="text" name="projectName" placeholder="Project Name">
          <div class="date-range">
              <input type="text" name="startDate" placeholder="Start Date">
              <input type="text" name="endDate" placeholder="End Date">
          </div>
          <textarea name="description" placeholder="Project Description"></textarea>
      `;
      projectsContainer.appendChild(template);
  }
  const projectTemplate = projectsContainer.children[0].cloneNode(true);
  projectsContainer.innerHTML = '';

  // Handle Achievements section
  const achievementsContainer = document.getElementById('achievementsContainer');
  if (!achievementsContainer.children.length) {
      const template = document.createElement('div');
      template.className = 'achievement-entry';
      template.innerHTML = `
          <div class="entry-header">
              <button type="button" class="delete-entry" onclick="this.closest('.achievement-entry').remove()">×</button>
          </div>
          <input type="text" name="achievementName" placeholder="Achievement Name">
          <input type="text" name="awardedDate" placeholder="Date Awarded">
          <textarea name="description" placeholder="Achievement Description"></textarea>
      `;
      achievementsContainer.appendChild(template);
  }
  const achievementTemplate = achievementsContainer.children[0].cloneNode(true);
  achievementsContainer.innerHTML = '';

  // Handle Certificates section
  const certificatesContainer = document.getElementById('certificatesContainer');
  if (!certificatesContainer.children.length) {
      const template = document.createElement('div');
      template.className = 'certificate-entry';
      template.innerHTML = `
          <div class="entry-header">
              <button type="button" class="delete-entry" onclick="this.closest('.certificate-entry').remove()">×</button>
          </div>
          <input type="text" name="certificateName" placeholder="Certificate Name">
          <input type="text" name="awardedDate" placeholder="Date Awarded">
          <textarea name="description" placeholder="Certificate Description"></textarea>
      `;
      certificatesContainer.appendChild(template);
  }
  const certificateTemplate = certificatesContainer.children[0].cloneNode(true);
  certificatesContainer.innerHTML = '';

  // Populate projects entries
  if (Array.isArray(profile.projects) && profile.projects.length > 0) {
      profile.projects.forEach(proj => {
          const entry = projectTemplate.cloneNode(true);
          entry.querySelector('.delete-entry').addEventListener('click', function () {
              this.closest('.project-entry').remove();
          });
          entry.querySelector('[name="projectName"]').value = proj.projectName || '';
          entry.querySelector('[name="startDate"]').value = formatDate(proj.startDate);
          entry.querySelector('[name="endDate"]').value = formatDate(proj.endDate);
          entry.querySelector('[name="description"]').value = proj.description || '';
          projectsContainer.appendChild(entry);
      });
  } else {
      projectsContainer.appendChild(projectTemplate);
  }

  // Populate achievements entries
  if (Array.isArray(profile.achievements) && profile.achievements.length > 0) {
      profile.achievements.forEach(ach => {
          const entry = achievementTemplate.cloneNode(true);
          entry.querySelector('.delete-entry').addEventListener('click', function () {
              this.closest('.achievement-entry').remove();
          });
          entry.querySelector('[name="achievementName"]').value = ach.name || '';
          entry.querySelector('[name="awardedDate"]').value = formatDate(ach.awardedDate);
          entry.querySelector('[name="description"]').value = ach.description || '';
          achievementsContainer.appendChild(entry);
      });
  } else {
      achievementsContainer.appendChild(achievementTemplate);
  }

  // Populate certificates entries
  if (Array.isArray(profile.certificates) && profile.certificates.length > 0) {
      profile.certificates.forEach(cert => {
          const entry = certificateTemplate.cloneNode(true);
          entry.querySelector('.delete-entry').addEventListener('click', function () {
              this.closest('.certificate-entry').remove();
          });
          entry.querySelector('[name="certificateName"]').value = cert.name || '';
          entry.querySelector('[name="awardedDate"]').value = formatDate(cert.awardedDate);
          entry.querySelector('[name="description"]').value = cert.description || '';
          certificatesContainer.appendChild(entry);
      });
  } else {
      certificatesContainer.appendChild(certificateTemplate);
  }
}
// Update saveProfile to be async
export async function saveProfile(profileData) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ profile: profileData }, function () {
            const saveStatus = document.getElementById('saveStatus');
            if (saveStatus) {
                saveStatus.textContent = 'Profile Saved!';
                saveStatus.classList.add('show');
                setTimeout(() => {
                    saveStatus.classList.remove('show');
                }, 2000);
            }
            console.log('Profile saved');
            resolve();
        });
    });
}