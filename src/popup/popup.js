import { readResumeFile, fileToBase64 } from './modules/fileHandler.js';
import { populateProfile, saveProfile } from './modules/profileManager.js';
import { generateResumeContent, setupResumeExport } from './modules/resumeGenerator.js';
import { initializeJobMatching } from './modules/jobMatchHandler.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize modules
    setupResumeExport();
    await initializeJobMatching();
    
    // Add this near the beginning of DOMContentLoaded
    // Load saved resume and profile data
    // In the DOMContentLoaded event listener, update the resume loading part
    chrome.storage.local.get(['originalResume', 'profile'], function (result) {
        if (result.originalResume) {
            // Update file input to show the previously uploaded file name
            const fileInput = document.getElementById('resumeFile');
            // Create a temporary file to attach to the input
            const dataTransfer = new DataTransfer();
            const file = new File([""], result.originalResume.name, {
                type: result.originalResume.type
            });
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;

            // Show download and preview buttons
            document.getElementById('downloadResume').style.display = 'block';
            document.getElementById('previewResume').style.display = 'block';
        }

        if (result.profile) {
            populateProfile(result.profile);
        }
    });

    document.getElementById('addProject').addEventListener('click', () => {
        const container = document.getElementById('projectsContainer');
        const newEntry = container.querySelector('.project-entry').cloneNode(true);
        newEntry.querySelectorAll('input, textarea').forEach(input => input.value = '');
        newEntry.querySelector('.delete-entry').addEventListener('click', function () {
            this.closest('.project-entry').remove();
        });
        container.appendChild(newEntry);
    });

    document.getElementById('addAchievement').addEventListener('click', () => {
        const container = document.getElementById('achievementsContainer');
        const newEntry = container.querySelector('.achievement-entry').cloneNode(true);
        newEntry.querySelectorAll('input, textarea').forEach(input => input.value = '');
        newEntry.querySelector('.delete-entry').addEventListener('click', function () {
            this.closest('.achievement-entry').remove();
        });
        container.appendChild(newEntry);
    });

    document.getElementById('addCertificate').addEventListener('click', () => {
        const container = document.getElementById('certificatesContainer');
        const newEntry = container.querySelector('.certificate-entry').cloneNode(true);
        newEntry.querySelectorAll('input, textarea').forEach(input => input.value = '');
        newEntry.querySelector('.delete-entry').addEventListener('click', function () {
            this.closest('.certificate-entry').remove();
        });
        container.appendChild(newEntry);
    });

    document.getElementById('floatingSave').addEventListener('click', async () => {
        const formData = {
            personal: {
                fullName: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                location: document.getElementById('location').value,
                website: document.getElementById('website').value,
                linkedin: document.getElementById('linkedin').value,
                summary: document.getElementById('summary').value
            },
            education: Array.from(document.querySelectorAll('.education-entry')).map(entry => ({
                degree: entry.querySelector('[name="degree"]').value,
                school: entry.querySelector('[name="school"]').value,
                field: entry.querySelector('[name="field"]').value,
                startDate: entry.querySelector('[name="startDate"]').value,
                endDate: entry.querySelector('[name="endDate"]').value,
                achievements: entry.querySelector('[name="achievements"]').value
            })),
            experience: Array.from(document.querySelectorAll('.experience-entry')).map(entry => ({
                jobTitle: entry.querySelector('[name="jobTitle"]').value,
                company: entry.querySelector('[name="company"]').value,
                location: entry.querySelector('[name="location"]').value,
                startDate: entry.querySelector('[name="startDate"]').value,
                endDate: entry.querySelector('[name="endDate"]').value,
                responsibilities: entry.querySelector('[name="responsibilities"]').value
            })),
            skills: document.getElementById('skills').value.split(',').map(skill => skill.trim()),
            projects: Array.from(document.querySelectorAll('.project-entry')).map(entry => ({
                projectName: entry.querySelector('[name="projectName"]').value,
                startDate: entry.querySelector('[name="startDate"]').value,
                endDate: entry.querySelector('[name="endDate"]').value,
                description: entry.querySelector('[name="description"]').value
            })),
            achievements: Array.from(document.querySelectorAll('.achievement-entry')).map(entry => ({
                name: entry.querySelector('[name="achievementName"]').value,
                awardedDate: entry.querySelector('[name="awardedDate"]').value,
                description: entry.querySelector('[name="description"]').value
            })),
            certificates: Array.from(document.querySelectorAll('.certificate-entry')).map(entry => ({
                name: entry.querySelector('[name="certificateName"]').value,
                awardedDate: entry.querySelector('[name="awardedDate"]').value,
                description: entry.querySelector('[name="description"]').value
            }))
        };
        await saveProfile(formData);
    });

    // Tab switching logic
    const tabs = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.section');

    // Update tab switching logic
    tabs.forEach(tab => {
        tab.addEventListener('click', async () => {
            // Remove active class from all tabs and sections
            tabs.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            // Add active class to clicked tab and corresponding section
            tab.classList.add('active');
            const sectionId = tab.id.replace('Tab', 'Section');
            document.getElementById(sectionId).classList.add('active');

            // Auto-generate resume when switching to resume tab
            if (sectionId === 'resumeSection') {
                const { profile } = await chrome.storage.local.get(['profile']);
                if (profile) {
                    const format = document.getElementById('resumeFormat').value || 'formatted';
                    const resumeContent = await generateResumeContent(profile, format);
                    document.getElementById('resumePreview').innerHTML = resumeContent;
                }
            }
        });
    });

    // Add resume format change handler
    document.getElementById('resumeFormat').addEventListener('change', async (event) => {
        const { profile } = await chrome.storage.local.get(['profile']);
        if (profile) {
            const format = event.target.value;
            const resumeContent = await generateResumeContent(profile, format);
            document.getElementById('resumePreview').innerHTML = resumeContent;
        }
    });

    // Add experience entry button handler
    // In the addExperience event listener
    // Update addExperience event listener
    // Fix duplicate line and add delete button functionality in addExperience
    // Update the experience delete button event listener
    document.getElementById('addExperience').addEventListener('click', () => {
        const container = document.getElementById('experienceContainer');
        const newEntry = container.querySelector('.experience-entry').cloneNode(true);
        newEntry.querySelectorAll('input, textarea').forEach(input => input.value = '');
        newEntry.querySelector('.delete-entry').addEventListener('click', function () {
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
        container.appendChild(newEntry);
    });

    // Add to the top of the file
    // Remove the hardcoded API key
    // const DEEPSEEK_API_KEY = 'your_api_key_here';

    // Add API settings handler
    document.getElementById('saveApiSettings').addEventListener('click', () => {
        const apiSettings = {
            deepseekApiKey: document.getElementById('deepseekApiKey').value,
            apiBaseUrl: document.getElementById('apiBaseUrl').value || 'https://api.deepseek.com/v1'
        };
        chrome.storage.local.set({ 'apiSettings': apiSettings }, function () {
            alert('API settings saved successfully!');
        });
    });

    // Load saved API settings
    chrome.storage.local.get(['apiSettings'], function (result) {
        if (result.apiSettings) {
            document.getElementById('deepseekApiKey').value = result.apiSettings.deepseekApiKey || '';
            document.getElementById('apiBaseUrl').value = result.apiSettings.apiBaseUrl || 'https://api.deepseek.com/v1';
        }
    });

    // Update the parseResumeWithAI function
    async function parseResumeWithAI(resumeText) {
        try {
            const settings = await new Promise((resolve) => {
                chrome.storage.local.get(['apiSettings'], function (result) {
                    resolve(result.apiSettings);
                });
            });

            if (!settings || !settings.deepseekApiKey) {
                throw new Error('Please set your API key in the settings.');
            }

            console.log('Sending request to API...', {
                baseUrl: settings.apiBaseUrl,
                textLength: resumeText.length
            });

            console.log('Resume Text: ', resumeText);

            const baseUrl = settings.apiBaseUrl || 'https://api.deepseek.com/v1';
            const response = await fetch(`${baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${settings.deepseekApiKey}`
                },
                body: JSON.stringify({
                    model: "deepseek-chat",
                    // Define message PROMPT here
                    messages: [{
                        role: "user",
                        // In parseResumeWithAI function, update the content message
                        content: `Please parse this resume and extract structured information. Return ONLY a JSON object with no additional text or explanation. 
                        For experience's responsibilities and achievements, please detect the point and separate each point with two newlines. 
                        For all date formats, return it in yyyy if has no month, or mm/yyyy if month and year.
                        The JSON should have these exact fields:
                        {
                            "personal": {
                                "fullName": "",
                                "email": "",
                                "phone": "",
                                "location": "",
                                "website": "",
                                "linkedin": "",
                                "summary": ""
                            },
                            "education": [{
                                "degree": "",
                                "school": "",
                                "field": "",
                                "startDate": "",
                                "endDate": "",
                                "achievements": ""
                            }],
                            "experience": [{
                                "jobTitle": "",
                                "company": "",
                                "location": "",
                                "startDate": "",
                                "endDate": "",
                                "responsibilities": ""
                            }],
                            "projects": [{
                                "projectName": "",
                                "startDate": "",
                                "endDate": "",
                                "description": ""
                            }],
                            "achievements": [{
                                "name": "",
                                "awardedDate": "",
                                "description": ""
                            }],
                            "certificates": [{
                                "name": "",
                                "awardedDate": "",
                                "description": ""
                            }],
                            "skills": []
                        }
                        
                        Here's the resume text to parse:
                        ${resumeText}`
                    }]
                })
            });

            console.log('API Response Status:', response.status);
            const data = await response.json();
            console.log('Raw API Response:', data);
            console.log('API Response Content:', data.choices?.[0]?.message?.content);

            if (!response.ok) {
                throw new Error(`API Error: ${data.error?.message || 'Unknown error'}`);
            }

            let parsedContent;
            try {
                const content = data.choices?.[0]?.message?.content;
                if (!content) {
                    throw new Error('Invalid API response format');
                }
                // Try to extract JSON if it's wrapped in other text
                const jsonMatch = content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    console.log('Extracted JSON:', jsonMatch[0]);
                    parsedContent = JSON.parse(jsonMatch[0]);
                } else {
                    console.log('Direct JSON parsing:', content);
                    parsedContent = JSON.parse(content);
                }
            } catch (e) {
                console.error('JSON parsing error:', e);
                console.error('Failed content:', data.choices?.[0]?.message?.content);
                throw new Error('Failed to parse API response as JSON');
            }

            console.log('Final Parsed Profile:', parsedContent);

            return parsedContent;
        } catch (error) {
            console.error('Error parsing resume:', error);
            document.getElementById('uploadStatus').textContent = `Error: ${error.message}`;
            throw error;
        }
    }

    // Update file upload handler to show the text being sent
    // Add after file upload handler
    document.getElementById('downloadResume').addEventListener('click', async () => {
        const result = await chrome.storage.local.get(['originalResume']);
        if (result.originalResume) {
            const blob = base64ToBlob(result.originalResume.content, result.originalResume.type);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = result.originalResume.name;
            a.click();
            URL.revokeObjectURL(url);
        }
    });

    document.getElementById('previewResume').addEventListener('click', async () => {
        const result = await chrome.storage.local.get(['originalResume']);
        if (result.originalResume) {
            const blob = base64ToBlob(result.originalResume.content, result.originalResume.type);
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
            URL.revokeObjectURL(url);
        }
    });

    function base64ToBlob(base64, type) {
        const binStr = atob(base64);
        const len = binStr.length;
        const arr = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            arr[i] = binStr.charCodeAt(i);
        }
        return new Blob([arr], { type: type });
    }

    // Update file upload handler
    document.getElementById('resumeFile').addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                document.getElementById('uploadStatus').textContent = 'Reading file...';
                const content = await readResumeFile(file);

                // Store the original file and text content
                await chrome.storage.local.set({
                    'originalResume': {
                        name: file.name,
                        type: file.type,
                        content: await fileToBase64(file),
                        text: content
                    }
                });

                // Show download and preview buttons
                document.getElementById('downloadResume').style.display = 'block';
                document.getElementById('previewResume').style.display = 'block';

                document.getElementById('uploadStatus').textContent = 'Resume uploaded successfully!';

                // Check for API key before parsing
                const settings = await new Promise((resolve) => {
                    chrome.storage.local.get(['apiSettings'], function (result) {
                        resolve(result.apiSettings);
                    });
                });

                if (!settings?.deepseekApiKey) {
                    document.getElementById('uploadStatus').textContent = 'Please set your API key in settings to parse resume';
                    return;
                }

                // Parse the resume text
                const parsedProfile = await parseResumeWithAI(content);
                await saveProfile(parsedProfile);
                populateProfile(parsedProfile);
            } catch (error) {
                console.error('Error reading file:', error);
                document.getElementById('uploadStatus').textContent = 'Error: ' + error.message;
            }
        }
    });

    // Add this after existing event listeners
    document.getElementById('addEducation').addEventListener('click', () => {
        const container = document.getElementById('educationContainer');
        const newEntry = container.querySelector('.education-entry').cloneNode(true);
        newEntry.querySelectorAll('input, textarea').forEach(input => input.value = '');
        container.appendChild(newEntry);
    });

    // Update the form submission handler
    document.getElementById('profileForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
            personal: {
                fullName: document.getElementById('fullName').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                location: document.getElementById('location').value,
                website: document.getElementById('website').value,
                linkedin: document.getElementById('linkedin').value,
                summary: document.getElementById('summary').value
            },
            education: Array.from(document.querySelectorAll('.education-entry')).map(entry => ({
                degree: entry.querySelector('[name="degree"]').value,
                school: entry.querySelector('[name="school"]').value,
                field: entry.querySelector('[name="field"]').value,
                startDate: entry.querySelector('[name="startDate"]').value,
                endDate: entry.querySelector('[name="endDate"]').value,
                achievements: entry.querySelector('[name="achievements"]').value
            })),
            experience: Array.from(document.querySelectorAll('.experience-entry')).map(entry => ({
                jobTitle: entry.querySelector('[name="jobTitle"]').value,
                company: entry.querySelector('[name="company"]').value,
                location: entry.querySelector('[name="location"]').value,
                startDate: entry.querySelector('[name="startDate"]').value,
                endDate: entry.querySelector('[name="endDate"]').value,
                responsibilities: entry.querySelector('[name="responsibilities"]').value
            })),
            skills: document.getElementById('skills').value.split(',').map(skill => skill.trim())
        };
        await saveProfile(formData);
    });

    // Add parse resume button handler
    document.getElementById('parseResumeFile').addEventListener('click', async () => {
        try {
            const result = await chrome.storage.local.get(['originalResume']);
            if (!result.originalResume?.text) {
                document.getElementById('uploadStatus').textContent = 'Please upload a resume first';
                return;
            }

            document.getElementById('uploadStatus').textContent = 'Parsing resume...';
            const parsedProfile = await parseResumeWithAI(result.originalResume.text);
            await saveProfile(parsedProfile);
            populateProfile(parsedProfile);
            document.getElementById('uploadStatus').textContent = 'Resume parsed successfully!';
        } catch (error) {
            console.error('Error parsing resume:', error);
            document.getElementById('uploadStatus').textContent = 'Error: ' + error.message;
        }
    });

    // Load saved profile data
    chrome.storage.local.get(['profile'], function (result) {
        if (result.profile) {
            populateProfile(result.profile);
        }
    });

    // Add clear data handler
    document.getElementById('clearAllData').addEventListener('click', async () => {
        if (confirm('Are you sure you want to clear all stored data? This action cannot be undone.')) {
            await chrome.storage.local.clear();
            // Reset all form fields
            document.getElementById('profileForm').reset();
            document.getElementById('resumePreview').innerHTML = '';
            document.getElementById('uploadStatus').textContent = '';
            document.getElementById('downloadResume').style.display = 'none';
            document.getElementById('previewResume').style.display = 'none';
            alert('All data has been cleared successfully.');
        }
    });

    // Add PDF export handler
    document.getElementById('exportPDF').addEventListener('click', function () {
        const resumeContent = document.getElementById('resumePreview').innerHTML;
        const style = `
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { margin-bottom: 5px; }
                h2 { margin-top: 20px; }
                p { margin: 5px 0; }
                .skill-item { display: inline-block; margin: 2px 5px; }
            </style>
        `;

        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Resume</title>
                    ${style}
                </head>
                <body>
                    ${resumeContent}
                </body>
            </html>
        `);

        printWindow.document.close();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
    });
});

// Add export PDF button to the resume section
document.getElementById('resumeSection').insertAdjacentHTML('beforeend', `
        <div class="resume-actions">
            <button id="exportPDF" class="btn">Export as PDF</button>
        </div>
    `);