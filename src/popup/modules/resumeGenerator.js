// Resume generation functions
export function generateResumeContent(profile, format) {
    if (format === 'text') {
        // Build contact info only with non-empty fields
        const contactInfo = [
            profile.personal.email && `Email: ${profile.personal.email}`,
            profile.personal.phone && `Phone: ${profile.personal.phone}`,
            profile.personal.location && `Location: ${profile.personal.location}`,
            profile.personal.website && `Website: ${profile.personal.website}`,
            profile.personal.linkedin && `LinkedIn: ${profile.personal.linkedin}`
        ].filter(Boolean).join(' | ');

        // Build sections only if they contain data
        const sections = [
            profile.personal.summary && `\nPROFESSIONAL SUMMARY\n${profile.personal.summary}`,

            profile.experience?.length > 0 && `\nEXPERIENCE${profile.experience.map(exp => `
${exp.jobTitle}
${exp.company}${exp.location ? ` | ${exp.location}` : ''}
${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : ''}
${exp.responsibilities}`).join('\n')}`,

            profile.education?.length > 0 && `\nEDUCATION${profile.education.map(edu => `
    ${edu.degree}${edu.field ? ` in ${edu.field}` : ''}
    ${edu.school}
    ${edu.startDate}${edu.endDate ? ` - ${edu.endDate}` : ''}
    ${edu.achievements}`).join('\n')}`,

            profile.projects?.length > 0 && `\nPROJECTS${profile.projects.map(proj => `
${proj.projectName}
${proj.startDate ? `${proj.startDate}${proj.endDate ? ` - ${proj.endDate}` : ''}` : ''}
${proj.description}`).join('\n')}`,

            profile.achievements?.length > 0 && `\nACHIEVEMENTS${profile.achievements.map(ach => `
${ach.name}
${ach.awardedDate ? `Awarded: ${ach.awardedDate}` : ''}
${ach.description}`).join('\n')}`,

            profile.certificates?.length > 0 && `\nCERTIFICATES${profile.certificates.map(cert => `
${cert.name}
${cert.awardedDate ? `Awarded: ${cert.awardedDate}` : ''}
${cert.description}`).join('\n')}`,

            // Update skills section to check for non-empty array
            profile.skills?.length > 0 && profile.skills.some(skill => skill.trim()) &&
            `\nSKILLS\n${profile.skills.filter(skill => skill.trim()).join(', ')}`
        ].filter(Boolean);

        return `${profile.personal.fullName}${contactInfo ? `\n${contactInfo}` : ''}${sections.join('\n')}`;
    } else {
        // Build contact info only with non-empty fields
        const contactInfo = [
            profile.personal.email && profile.personal.email,
            profile.personal.phone && profile.personal.phone,
            profile.personal.location && profile.personal.location,
            profile.personal.website && `<a href="${profile.personal.website}" target="_blank">Portfolio</a>`,
            profile.personal.linkedin && `<a href="${profile.personal.linkedin}" target="_blank">LinkedIn</a>`
        ].filter(Boolean).join(' | ');

        // Build sections only if they contain data
        const sections = [
            profile.personal.summary && `
              <h2>Professional Summary</h2>
              <p>${profile.personal.summary}</p>`,

            profile.experience?.length > 0 && `
              <h2>Experience</h2>
              ${profile.experience.map(exp => `
                  <div style="margin-bottom: 15px;">
                      <h3 style="margin-bottom: 5px;">${exp.jobTitle}</h3>
                      <p style="color: #666;">${exp.company}${exp.location ? ` | ${exp.location}` : ''}</p>
                      ${exp.startDate ? `<p style="color: #666;">${exp.startDate}${exp.endDate ? ` - ${exp.endDate}` : ''}</p>` : ''}
                      <p>${exp.responsibilities.split('\n').map(line => line.trim()).filter(Boolean).map(line => 
                        `• ${line}`).join('<br>')}</p>
                  </div>
              `).join('')}`,

            profile.education?.length > 0 && `
              <h2>Education</h2>
              ${profile.education.map(edu => `
                  <div style="margin-bottom: 15px;">
                      <h3 style="margin-bottom: 5px;">${edu.degree}${edu.field ? ` in ${edu.field}` : ''}</h3>
                      <p style="color: #666;">${edu.school}</p>
                      ${edu.startDate ? `<p style="color: #666;">${edu.startDate}${edu.endDate ? ` - ${edu.endDate}` : ''}</p>` : ''}
                      ${edu.achievements ? `<p>${edu.achievements}</p>` : ''}
                  </div>
              `).join('')}`,

            profile.projects?.length > 0 && `
              <h2>Projects</h2>
              ${profile.projects.map(proj => `
                  <div style="margin-bottom: 15px;">
                      <h3 style="margin-bottom: 5px;">${proj.projectName}</h3>
                      ${proj.startDate ? `<p style="color: #666;">${proj.startDate}${proj.endDate ? ` - ${proj.endDate}` : ''}</p>` : ''}
                      <p>${proj.description}</p>
                  </div>
              `).join('')}`,

            profile.achievements?.length > 0 && `
              <h2>Achievements</h2>
              ${profile.achievements.map(ach => `
                  <div style="margin-bottom: 15px;">
                      <h3 style="margin-bottom: 5px;">${ach.name}</h3>
                      ${ach.awardedDate ? `<p style="color: #666;">Awarded: ${ach.awardedDate}</p>` : ''}
                      <p>${ach.description}</p>
                  </div>
              `).join('')}`,

            profile.certificates?.length > 0 && `
              <h2>Certificates</h2>
              ${profile.certificates.map(cert => `
                  <div style="margin-bottom: 15px;">
                      <h3 style="margin-bottom: 5px;">${cert.name}</h3>
                      ${cert.awardedDate ? `<p style="color: #666;">Awarded: ${cert.awardedDate}</p>` : ''}
                      <p>${cert.description}</p>
                  </div>
              `).join('')}`,

            profile.skills?.length > 0 && `
              <h2>Skills</h2>
              <p>${profile.skills.join(', ')}</p>`
        ].filter(Boolean);

        return `
          <div style="font-family: Arial, sans-serif;">
              <h1 style="margin-bottom: 5px;">${profile.personal.fullName}</h1>
              ${contactInfo ? `<p style="color: #666;">${contactInfo}</p>` : ''}
              ${sections.join('')}
          </div>
      `;
    }
}

export function setupResumeExport() {
    // ... PDF export functionality ...
}