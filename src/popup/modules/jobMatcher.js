export class JobMatch {
    constructor() {
        this.keywords = [];
        this.jobDescription = '';
        this.jobTitle = '';
        this.jobId = null;
        this.company = '';
    }

    async saveState() {
        await chrome.storage.local.set({
            'jobMatchState': {
                keywords: this.keywords,
                jobDescription: this.jobDescription,
                jobTitle: this.jobTitle,
                jobId: this.jobId,
                company: this.company
            }
        });
    }

    async loadState() {
        const result = await chrome.storage.local.get(['jobMatchState']);
        if (result.jobMatchState) {
            this.keywords = result.jobMatchState.keywords || [];
            this.jobDescription = result.jobMatchState.jobDescription || '';
            this.jobTitle = result.jobMatchState.jobTitle || '';
            this.jobId = result.jobMatchState.jobId || null;
            this.company = result.jobMatchState.company || '';
            return true;
        }
        return false;
    }

    setKeywordRating(keyword, rating, customization) {
        const existingIndex = this.keywords.findIndex(k => k.word === keyword);
        if (existingIndex >= 0) {
            this.keywords[existingIndex] = { word: keyword, rating, customization };
        } else {
            this.keywords.push({ word: keyword, rating, customization });
        }
    }

    updateJobInfo(jobInfo) {
        this.jobTitle = jobInfo.title;
        this.jobId = jobInfo.id;
        this.company = jobInfo.company;
    }
}

import { API_FORMATS } from './constants.js';

export async function analyzeJobDescription(jobDescription, profileJson) {
    const settings = await chrome.storage.local.get(['apiSettings']);
    console.log('Analyzing job description:', {
        descriptionLength: jobDescription.length,
        profileProvided: !!profileJson
    });

    if (!settings?.apiSettings?.deepseekApiKey) {
        throw new Error('API key not found. Please check your settings.');
    }

    const payload = {
        model: "deepseek-chat",
        messages: [{
            role: "user",
            content: `Analyze this job description and return a JSON object with:
                1. jobTitle: The exact job title
                2. jobId: Any job ID/reference number (null if none)
                3. company: Company name
                4. keywords: Array of required skills, qualifications, and experiences, only show those that are relevant to the job description but not presented in Current Profile
                
                Job Description:
                ${jobDescription}
                
                Current Profile:
                ${profileJson}
                
                Return format:
                {
                    "jobTitle": "string",
                    "jobId": "string or null",
                    "company": "string",
                    "keywords": ["keyword1", "keyword2", ...]
                }
                
                Important: Return ONLY the JSON object, no other text.`
            }]
        };

    console.log('API Request Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(`${settings.apiSettings.apiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.apiSettings.deepseekApiKey}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', {
            status: response.status,
            statusText: response.statusText,
            body: errorText
        });
        throw new Error(`API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('Full API Response:', JSON.stringify(data, null, 2));
    
    if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid API response format');
    }

    try {
        // Clean the response content by removing markdown code blocks and extra whitespace
        let content = data.choices[0].message.content.trim();
        content = content.replace(/```json\n?|\n?```/g, ''); // Remove markdown code blocks
        content = content.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace
        
        const result = JSON.parse(content);
        
        // Validate response structure
        if (!result.jobTitle || !result.company || !Array.isArray(result.keywords)) {
            throw new Error('Invalid response structure from API');
        }

        console.log('Parsed job details:', {
            title: result.jobTitle,
            company: result.company,
            jobId: result.jobId,
            keywordsCount: result.keywords.length
        });
        
        return {
            jobInfo: {
                title: result.jobTitle,
                id: result.jobId,
                company: result.company
            },
            keywords: result.keywords
        };
    } catch (error) {
        console.error('Error parsing API response:', error);
        console.error('Raw response:', data.choices[0].message.content);
        throw new Error('Failed to parse job analysis results. Please try again.');
    }
}

// In generateTailoredResume function
export async function generateTailoredResume(profile, jobMatch) {
    try {
        const { apiSettings } = await chrome.storage.local.get(['apiSettings']);
        if (!apiSettings?.deepseekApiKey) {
            throw new Error('API key not found. Please check your settings.');
        }

        const requestPayload = {
            model: "deepseek-chat",
            messages: [{
                role: "user",
                content: `Given this job description and profile and Keywords with ratings,
                if ratings 
                generate a tailored resume profile in JSON format.
                
                Job Description: ${jobMatch.jobDescription}
                Keywords with Ratings: ${JSON.stringify(jobMatch.keywords)}
                Current Profile: ${JSON.stringify(profile)}
                
                Return the response in this exact JSON format:
                ${JSON.stringify(API_FORMATS.TAILORED_RESUME.response, null, 2)}
                
                Important: Return ONLY the JSON object, no markdown formatting.`
            }]
        };

        console.log('API Request Payload:', JSON.stringify(requestPayload, null, 2));

        const response = await fetch(`${apiSettings.apiBaseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiSettings.deepseekApiKey}`
            },
            body: JSON.stringify(requestPayload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            throw new Error(`API Error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        console.log('Full API Response:', JSON.stringify(data, null, 2));

        if (!data.choices?.[0]?.message?.content) {
            throw new Error('Invalid response format from API');
        }

        // Clean the response content
        let content = data.choices[0].message.content.trim();
        content = content.replace(/```json\n?|\n?```/g, ''); // Remove markdown code blocks
        content = content.replace(/^\s+|\s+$/g, ''); // Remove leading/trailing whitespace

        return content;
    } catch (error) {
        console.error('Detailed error:', error);
        throw new Error(`Failed to generate tailored resume: ${error.message}`);
    }
}

export async function generateCoverLetter(profile, jobMatch) {
    try {
        const settings = await chrome.storage.local.get(['apiSettings']);
        console.log('Generating cover letter for:', {
            title: jobMatch.jobTitle,
            company: jobMatch.company,
            jobId: jobMatch.jobId
        });

        const response = await fetch(`${settings.apiSettings.apiBaseUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${settings.apiSettings.deepseekApiKey}`
            },
            body: JSON.stringify({
                messages: [{
                    role: "user",
                    content: `Generate a professional cover letter for ${jobMatch.jobTitle} position at ${jobMatch.company}.
                    
                    Job Details:
                    Title: ${jobMatch.jobTitle}
                    Company: ${jobMatch.company}
                    ID: ${jobMatch.jobId || 'N/A'}
                    Description: ${jobMatch.jobDescription}
                    
                    Profile: ${JSON.stringify(profile)}
                    Keywords with Ratings: ${JSON.stringify(jobMatch.keywords)}`
                }]
            })
        });

        const data = await response.json();
        console.log('Cover letter API response:', data);
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error generating cover letter:', error);
        throw error;
    }
}


