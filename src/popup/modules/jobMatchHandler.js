import { JobMatch, analyzeJobDescription, generateTailoredResume } from './jobMatcher.js';
import { generateResumeContent } from './resumeGenerator.js';

// Add this function near the top of the file
function displayKeywords(keywords) {
  const keywordResults = document.getElementById('keywordResults');
  keywordResults.innerHTML = `
        <div class="keywords-header">
            <h3>Keywords to evaluate:</h3>
            <p class="keywords-hint">Rate your familiarity with each skill and add details about your experience.</p>
        </div>
        ${keywords.map(keyword => `
            <div class="keyword-item">
                <div class="keyword-word">${keyword.word || keyword}</div>
                <div class="keyword-rating">
                    <label>Familiarity (0-5):</label>
                    <input type="range" min="0" max="5" 
                        value="${keyword.rating || 0}" 
                        onchange="this.nextElementSibling.textContent = this.value">
                    <span>${keyword.rating || 0}</span>
                </div>
                <textarea class="keyword-customization" 
                    placeholder="Describe your experience with this skill...">${keyword.customization || ''}</textarea>
            </div>
        `).join('')}`;
}

// Add function to load tailored resume as main profile
async function loadTailoredAsMain(index) {
    try {
        const { tailoredResumes, profile: currentProfile } = await chrome.storage.local.get(['tailoredResumes', 'profile']);
        if (!tailoredResumes?.[index]) return;

        // Backup current profile as default if it doesn't exist
        if (!currentProfile.isDefault) {
            await chrome.storage.local.set({
                defaultProfile: { ...currentProfile, isDefault: true }
            });
        }

        // Load tailored profile as main
        const newProfile = { ...tailoredResumes[index].profile, isDefault: false };
        await chrome.storage.local.set({ profile: newProfile });

        alert('Profile updated successfully! Switch to the Profile tab to see the changes.');
    } catch (error) {
        alert('Error loading profile: ' + error.message);
    }
}

// Add restore default profile button to profile section
export async function initializeJobMatching() {
    const jobMatch = new JobMatch();
    const keywordResults = document.getElementById('keywordResults');
    const tailoredActions = document.querySelector('.tailored-resume-actions');

    // Load previous state
    const hasState = await jobMatch.loadState();
    if (hasState) {
        document.getElementById('jobDescription').value = jobMatch.jobDescription;
        if (jobMatch.keywords.length > 0) {
            displayKeywords(jobMatch.keywords);
            tailoredActions.style.display = 'block';
        }
    }

    // Add single PDF export functionality
    document.getElementById('exportPDF').addEventListener('click', async () => {
        const button = document.getElementById('exportPDF');
        const resumePreview = document.getElementById('resumePreview');
        
        try {
            if (!resumePreview.innerHTML.trim()) {
                throw new Error('No resume content to export');
            }

            button.disabled = true;
            button.textContent = 'Generating PDF...';

            // Create a temporary iframe with proper styling
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);

            // Write the resume content with proper styling
            iframe.contentDocument.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            padding: 40px;
                            max-width: 800px;
                            margin: 0 auto;
                        }
                        .job-details { 
                            margin-bottom: 20px;
                            padding: 10px;
                            background: #f5f5f5;
                        }
                    </style>
                </head>
                <body>${resumePreview.innerHTML}</body>
                </html>
            `);
            iframe.contentDocument.close();

            // Print the iframe content as PDF
            iframe.contentWindow.print();

            // Clean up
            setTimeout(() => {
                document.body.removeChild(iframe);
                button.disabled = false;
                button.textContent = 'Export as PDF';
            }, 1000);
        } catch (error) {
            alert('Error generating PDF: ' + error.message);
            button.disabled = false;
            button.textContent = 'Export as PDF';
        }
    });

  document.getElementById('analyzeJob').addEventListener('click', async () => {
    try {
      const button = document.getElementById('analyzeJob');
      button.disabled = true;
      button.textContent = 'Analyzing...';
      keywordResults.innerHTML = '<div class="loading">Analyzing job description...</div>';

      const jobDescription = document.getElementById('jobDescription').value;
      if (!jobDescription) {
        throw new Error('Please enter a job description');
      }

      jobMatch.jobDescription = jobDescription;

      // Get current resume content
      const { profile } = await chrome.storage.local.get(['profile']);
      if (!profile) {
        throw new Error('Please create a profile first');
      }

      const { jobInfo, keywords } = await analyzeJobDescription(jobDescription, JSON.stringify(profile));
      
      // Update job match info and display results
      jobMatch.updateJobInfo(jobInfo);
      
      // Format keywords as objects if they're strings
      const formattedKeywords = keywords.map(keyword => {
          return typeof keyword === 'string' 
              ? { word: keyword, rating: 0, customization: '' }
              : keyword;
      });

      // Display keywords with rating inputs
      keywordResults.innerHTML = `
              <div class="analysis-results">
                  <div class="job-analysis">
                      <h3>Job Analysis:</h3>
                      <p><strong>Title:</strong> ${jobInfo.title}</p>
                      <p><strong>Company:</strong> ${jobInfo.company}</p>
                      ${jobInfo.id ? `<p><strong>Job ID:</strong> ${jobInfo.id}</p>` : ''}
                  </div>
                  <div class="keywords-header">
                      <h3>Found ${formattedKeywords.length} keywords to evaluate:</h3>
                      <p class="keywords-hint">Rate your familiarity with each skill and add details about your experience.</p>
                  </div>
                  ${formattedKeywords.map(keyword => `
                      <div class="keyword-item">
                          <div class="keyword-word">${keyword.word}</div>
                          <div class="keyword-rating">
                              <label>Familiarity (0-5):</label>
                              <input type="range" min="0" max="5" value="${keyword.rating || 0}" 
                                  oninput="this.nextElementSibling.textContent = this.value"
                                  onchange="this.nextElementSibling.textContent = this.value">
                              <span class="rating-value">${keyword.rating || 0}</span>
                          </div>
                          <textarea class="keyword-customization" 
                              placeholder="Describe your experience with this skill...">${keyword.customization || ''}</textarea>
                      </div>
                  `).join('')}
              </div>`;

      // Add event listeners for range inputs
      document.querySelectorAll('.keyword-rating input[type="range"]').forEach(input => {
          input.addEventListener('input', function() {
              this.nextElementSibling.textContent = this.value;
          });
      });

      tailoredActions.style.display = 'block';
      button.textContent = 'Analyze Job Description'; // Reset button text here
    } catch (error) {
      keywordResults.innerHTML = `<div class="error-message">${error.message}</div>`;
    } finally {
      button.disabled = false;
      button.textContent = 'Analyze Job Description';
    }
  });

  // Add copy to clipboard functionality
  window.copyToClipboard = async function (elementId) {
    const content = document.getElementById(elementId).textContent;
    try {
      await navigator.clipboard.writeText(content);
      alert('Copied to clipboard!');
    } catch (err) {
      alert('Failed to copy: ' + err.message);
    }
  };

  // Remove the cover letter event listener
  document.getElementById('generateTailoredResume').addEventListener('click', async () => {
      const button = document.getElementById('generateTailoredResume');
      const statusDiv = document.createElement('div');
      statusDiv.className = 'generation-status';
      button.parentNode.insertBefore(statusDiv, button.nextSibling);
  
      try {
          console.log('=== Starting Tailored Resume Generation ===');
          button.disabled = true;
          statusDiv.textContent = 'Generating tailored resume...';
  
          // Collect keyword ratings and customizations
          const keywordItems = document.querySelectorAll('.keyword-item');
          const keywordData = [];
          keywordItems.forEach(item => {
              const word = item.querySelector('.keyword-word').textContent;
              const rating = parseInt(item.querySelector('input[type="range"]').value);
              const customization = item.querySelector('.keyword-customization').value;
              keywordData.push({ word, rating, customization });
              jobMatch.setKeywordRating(word, rating, customization);
          });
  
          console.log('Sending request to generate tailored resume:', {
              jobTitle: jobMatch.jobTitle,
              jobDescription: jobMatch.jobDescription,
              keywords: keywordData
          });
  
          // Save state before generating
          await jobMatch.saveState();
  
          const { profile } = await chrome.storage.local.get(['profile']);
          const result = await generateTailoredResume(profile, jobMatch);
          
          // Save tailored resume
          const { tailoredResumes = [] } = await chrome.storage.local.get(['tailoredResumes']);
          tailoredResumes.push({
              jobTitle: jobMatch.jobTitle,
              jobDescription: jobMatch.jobDescription,
              profile: result,
              keywords: jobMatch.keywords,
              timestamp: new Date().toISOString()
          });
          await chrome.storage.local.set({ tailoredResumes });
  
          statusDiv.textContent = 'Resume generated successfully!';
          statusDiv.style.color = 'green';
          updateTailoredResumesList();
  
          // Preview the newly generated content
          const newIndex = tailoredResumes.length - 1;
          await previewTailoredResume(newIndex);
      } catch (error) {
          console.error('Error generating content:', error);
          statusDiv.textContent = 'Error: ' + error.message;
          statusDiv.style.color = 'red';
      } finally {
          button.disabled = false;
          setTimeout(() => statusDiv.remove(), 5000);
      }
  });
  
  // Remove the generateCoverLetter event listener
  
  // Update preview function to remove cover letter section
  async function previewTailoredResume(index) {
      const { tailoredResumes } = await chrome.storage.local.get(['tailoredResumes']);
      if (tailoredResumes?.[index]) {
          const resume = tailoredResumes[index];
          const resumeContent = await generateResumeContent(resume.profile, 'formatted');
  
          document.getElementById('resumePreview').innerHTML = `
              <div class="job-details" style="margin-bottom: 20px; padding: 10px; background: #f5f5f5; border-radius: 4px;">
                  <h3>Tailored for: ${resume.jobTitle || 'Untitled Position'}</h3>
                  <p><strong>Keywords:</strong> ${resume.keywords.map(k => k.word).join(', ')}</p>
              </div>
              ${resumeContent}`;
  
          document.getElementById('resumeTab').click();
      }
  }

  // Add preview and delete functions
  window.previewTailoredResume = async function (index) {
    const { tailoredResumes } = await chrome.storage.local.get(['tailoredResumes']);
    if (tailoredResumes?.[index]) {
      const resume = tailoredResumes[index];
      const resumeContent = await generateResumeContent(resume.profile, 'formatted');

      // Show resume preview with job details
      document.getElementById('resumePreview').innerHTML = `
            <div class="job-details" style="margin-bottom: 20px; padding: 10px; background: #f5f5f5; border-radius: 4px;">
                <h3>Tailored for: ${resume.jobTitle || 'Untitled Position'}</h3>
                <p><strong>Keywords:</strong> ${resume.keywords.map(k => k.word).join(', ')}</p>
            </div>
            ${resumeContent}`;

      // Switch to resume tab
      document.getElementById('resumeTab').click();
    }
  };

  window.deleteTailoredResume = async function (index) {
    if (confirm('Are you sure you want to delete this tailored resume?')) {
      const { tailoredResumes } = await chrome.storage.local.get(['tailoredResumes']);
      if (tailoredResumes?.[index]) {
        tailoredResumes.splice(index, 1);
        await chrome.storage.local.set({ tailoredResumes });
        updateTailoredResumesList();
      }
    }
  };

  // Fix API settings in submitQuery
  document.getElementById('submitQuery').addEventListener('click', async () => {
    const query = document.getElementById('customQuery').value;
    if (!query) return;

    try {
      const settings = await chrome.storage.local.get(['apiSettings']);
      const response = await fetch(`${settings.apiSettings.apiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.apiSettings.deepseekApiKey}`
        },
        body: JSON.stringify({
          messages: [{
            role: "user",
            content: `Query: ${query}\n\nJob Description: ${jobMatch.jobDescription}\n\nKeywords: ${JSON.stringify(jobMatch.keywords)}`
          }]
        })
      });

      const data = await response.json();
      document.getElementById('queryResponse').innerHTML =
        `<div class="response-content">${data.choices[0].message.content}</div>`;
    } catch (error) {
      alert('Error processing query: ' + error.message);
    }
  });

  // Update the tailored resumes list on initialization
  updateTailoredResumesList();
}

// Update the list function to include resume preview
function updateTailoredResumesList() {
  const resumeSection = document.getElementById('resumeSection');
  if (!resumeSection.querySelector('.tailored-resumes-list')) {
    resumeSection.insertAdjacentHTML('beforeend', '<div class="tailored-resumes-list"></div>');
  }

  chrome.storage.local.get(['tailoredResumes'], function (result) {
    const listContainer = resumeSection.querySelector('.tailored-resumes-list');
    if (result.tailoredResumes?.length) {
        listContainer.innerHTML = result.tailoredResumes.map((resume, index) => `
            <div class="tailored-resume-item">
                <span>${resume.jobTitle || 'Untitled'} (${new Date(resume.timestamp).toLocaleDateString()})</span>
                <div class="resume-actions">
                    <button class="preview-btn" data-index="${index}">Preview</button>
                    <button class="load-btn" data-index="${index}">Load as Main Profile</button>
                    <button class="delete-btn btn-danger" data-index="${index}">Delete</button>
                </div>
            </div>
        `).join('');

        // Add event listeners
        listContainer.querySelectorAll('.load-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('Are you sure you want to load this as your main profile? This will replace your current profile.')) {
                    const index = parseInt(btn.dataset.index);
                    await loadTailoredAsMain(index);
                }
            });
        });

      // Add event listeners after creating elements
      listContainer.querySelectorAll('.preview-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          previewTailoredResume(parseInt(btn.dataset.index));
        });
      });

      listContainer.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          deleteTailoredResume(parseInt(btn.dataset.index));
        });
      });
    } else {
      listContainer.innerHTML = '<p>No tailored resumes yet.</p>';
    }
  });
}

// Remove window. from functions since we're using proper event listeners now
async function previewTailoredResume(index) {
  const { tailoredResumes } = await chrome.storage.local.get(['tailoredResumes']);
  if (tailoredResumes?.[index]) {
    const resume = tailoredResumes[index];
    const resumeContent = await generateResumeContent(resume.profile, 'formatted');

    // Show resume preview with job details
    document.getElementById('resumePreview').innerHTML = `
            <div class="job-details" style="margin-bottom: 20px; padding: 10px; background: #f5f5f5; border-radius: 4px;">
                <h3>Tailored for: ${resume.jobTitle || 'Untitled Position'}</h3>
                <p><strong>Keywords:</strong> ${resume.keywords.map(k => k.word).join(', ')}</p>
            </div>
            ${resumeContent}`;

    // Manually trigger tab switch
    const resumeTab = document.getElementById('resumeTab');
    if (resumeTab) {
      const event = new Event('click');
      resumeTab.dispatchEvent(event);
    }
  }
}

async function deleteTailoredResume(index) {
  if (confirm('Are you sure you want to delete this tailored resume?')) {
    const { tailoredResumes } = await chrome.storage.local.get(['tailoredResumes']);
    if (tailoredResumes?.[index]) {
      tailoredResumes.splice(index, 1);
      await chrome.storage.local.set({ tailoredResumes });
      updateTailoredResumesList();
    }
  }
}

// Export the generateResumeContent function if it's not already available
export { generateResumeContent };