export const API_FORMATS = {
    ANALYZE_JOB: {
        response: {
            jobTitle: "string",
            jobId: "string or null",
            company: "string",
            keywords: ["keyword1", "keyword2"]
        }
    },
    TAILORED_RESUME: {
        response: {
            personal: {
                fullName: "",
                email: "",
                phone: "",
                location: "",
                website: "",
                linkedin: "",
                summary: ""
            },
            experience: [{
                jobTitle: "",
                company: "",
                location: "",
                startDate: "",
                endDate: "",
                responsibilities: ""
            }],
            education: [{
                degree: "",
                school: "",
                field: "",
                startDate: "",
                endDate: "",
                achievements: ""
            }],
            skills: [],
            projects: [{
                projectName: "",
                startDate: "",
                endDate: "",
                description: ""
            }],
            achievements: [{
                name: "",
                awardedDate: "",
                description: ""
            }],
            certificates: [{
                name: "",
                awardedDate: "",
                description: ""
            }]
        }
    }
};